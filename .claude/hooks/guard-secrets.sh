#!/bin/sh
# PreToolUse (Read|Edit|Write|Grep|Glob): bloquea el acceso a archivos de secretos.
# Lee el JSON del hook por stdin y revisa estas claves de tool_input:
#   - "file_path" (Read/Edit/Write)
#   - "path"      (Grep/Glob)
#   - "glob"      (Grep)
# Sale con código 2 (y mensaje en stderr) si el valor apunta a un .env* o a una
# clave privada, o si el glob nombra explícitamente uno. Excepciones: .env.example
# y claves públicas *.pub. Sin jq, sin eval, sin red.
#
# LIMITACIÓN (no resuelta): un Grep sobre un DIRECTORIO sin glob (por ejemplo
# path="server" o sin path) puede devolver líneas de un .env que esté dentro, y
# este hook no puede saberlo porque el JSON solo trae el directorio. Tampoco
# cubre el campo "pattern" de Glob (solo lista nombres, no contenido), ni Bash
# (cat .env). La defensa en esos casos es permissions.deny y no tener secretos
# reales en el árbol de trabajo.
#
# Notas del parseo:
#   - Cada clave se ancla con comillas ("path"), por lo que no coincide dentro de
#     "file_path".
#   - Se revisan TODAS las apariciones de la clave en el JSON. Un texto dentro de
#     un valor (por ejemplo el contenido de un Write) lleva las comillas
#     escapadas (\"), así que no se confunde con una clave real.
#   - Heurística conservadora para glob: bloquea si el glob contiene ".env",
#     ".pem", ".key", ".p12", ".pfx", ".jks", ".keystore" o "id_rsa/id_dsa/
#     id_ecdsa/id_ed25519" (puede haber falsos positivos raros, p. ej.
#     "*.keyframes.css").
set -eu

input=$(cat)

# Devuelve, una por línea, todas las apariciones del valor de la clave $1.
extract() {
  pat='"'"$1"'"[[:space:]]*:[[:space:]]*"(([^"\\]|\\.)*)"'
  printf '%s' "$input" \
    | grep -oE "$pat" \
    | sed -E 's/^"[^"]*"[[:space:]]*:[[:space:]]*"//; s/"$//' \
    || true
}

# Normaliza separadores JSON/Windows a "/" y pasa a minúsculas.
norm() {
  printf '%s' "$1" \
    | sed -e 's/\\\\/\//g' -e 's/\\\//\//g' -e 's/\\/\//g' \
    | tr 'A-Z' 'a-z'
}

block() {
  printf 'BLOQUEADO por guard-secrets: "%s" (%s) apunta a un archivo de secretos (%s).\n' "$2" "$1" "$3" >&2
  printf 'Usa .env.example para documentar variables; nunca leas ni edites valores reales.\n' >&2
  exit 2
}

# Revisa un valor de ruta (basename). $1 = clave, $2 = valor original.
check_path() {
  n=$(norm "$2")
  base=${n##*/}
  case "$base" in
    .env.example) return 0 ;;
    *.pub) return 0 ;;
    .env | .env.*) block "$1" "$2" "variables de entorno" ;;
    *.pem | *.key | *.p12 | *.pfx | *.jks | *.keystore) block "$1" "$2" "clave o certificado privado" ;;
    id_rsa | id_rsa.* | id_dsa | id_dsa.* | id_ecdsa | id_ecdsa.* | id_ed25519 | id_ed25519.*) block "$1" "$2" "clave SSH privada" ;;
  esac
  return 0
}

# Revisa un glob. $1 = clave, $2 = valor original.
check_glob() {
  # Quita las excepciones (.env.example y claves públicas) antes de buscar.
  g=$(norm "$2" | sed -E 's/\.env\.example//g; s/id_[a-z0-9]+\.pub//g')
  case "$g" in
    *.env*) block "$1" "$2" "el glob nombra variables de entorno" ;;
    *.pem* | *.key* | *.p12* | *.pfx* | *.jks* | *.keystore*) block "$1" "$2" "el glob nombra claves o certificados privados" ;;
    *id_rsa* | *id_dsa* | *id_ecdsa* | *id_ed25519*) block "$1" "$2" "el glob nombra claves SSH privadas" ;;
  esac
  return 0
}

for key in file_path path; do
  values=$(extract "$key")
  [ -n "$values" ] || continue
  while IFS= read -r value; do
    [ -n "$value" ] || continue
    check_path "$key" "$value"
  done <<EOF
$values
EOF
done

values=$(extract glob)
if [ -n "$values" ]; then
  while IFS= read -r value; do
    [ -n "$value" ] || continue
    check_glob glob "$value"
  done <<EOF
$values
EOF
fi

exit 0
