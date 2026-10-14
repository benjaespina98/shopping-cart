#!/bin/sh
# PostToolUse (Edit|Write): lintea SOLO el archivo recién editado con ESLint,
# si ESLint está instalado y configurado. Si no, sale 0 sin hacer nada.
# No usa --fix (no reescribe archivos), no instala nada, sin red ni eval.
# Si ESLint reporta errores, sale con 2 para que Claude vea la salida.
set -eu

input=$(cat)

file=$(printf '%s' "$input" \
  | sed -n -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"(([^"\\]|\\.)*)".*/\1/p' \
  | head -n 1)

if [ -z "$file" ]; then
  exit 0
fi

file=$(printf '%s' "$file" | sed -e 's/\\\\/\//g' -e 's/\\\//\//g' -e 's/\\/\//g')

# Solo código JS/JSX.
case "$file" in
  *.js | *.jsx | *.mjs | *.cjs) ;;
  *) exit 0 ;;
esac

[ -f "$file" ] || exit 0

root=${CLAUDE_PROJECT_DIR:-.}

# El paquete dueño del archivo: client/, server/ o la raíz.
case "$file" in
  */client/*) pkg="$root/client" ;;
  */server/*) pkg="$root/server" ;;
  *) pkg="$root" ;;
esac

# ESLint debe estar instalado (local al paquete o en la raíz) y tener config.
bin=""
for dir in "$pkg" "$root"; do
  if [ -x "$dir/node_modules/.bin/eslint" ] || [ -f "$dir/node_modules/.bin/eslint.cmd" ]; then
    bin="$dir"
    break
  fi
done
[ -n "$bin" ] || exit 0

has_config=0
for dir in "$pkg" "$root"; do
  for cfg in eslint.config.js eslint.config.mjs eslint.config.cjs .eslintrc.json .eslintrc.cjs .eslintrc.js .eslintrc.yml .eslintrc.yaml .eslintrc; do
    if [ -f "$dir/$cfg" ]; then
      has_config=1
    fi
  done
done
[ "$has_config" -eq 1 ] || exit 0

cd "$bin"
if out=$(npx --no-install eslint "$file" 2>&1); then
  exit 0
fi

printf 'ESLint reporto problemas en %s:\n%s\n' "$file" "$out" >&2
exit 2
