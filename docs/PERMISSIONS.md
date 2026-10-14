# Permisos de Claude Code en este repo

Reglas de `.claude/settings.json` (`deny` / `ask` / `allow`). Sirven para **evitar errores**, no como
barrera de seguridad: la barrera real de producción es un ruleset de GitHub sobre `main` (hoy el ruleset
`protect-main` aplica a `develop`, la rama por defecto; `main` no tiene reglas) y el control humano del merge.

## Qué cubren

| Regla | Efecto |
|---|---|
| `deny` push a main y variantes | `git push*main*`, `*--force*`, `* -f*`, `*+*`, `*--delete*`, `*--all*`, `*--mirror*` |
| `deny` `gh api` de escritura | `-X`, `--method`, `-f`, `-F`, `--field`, `--raw-field`, `--input`, `graphql` (queda el GET de lectura) |
| `deny` `gh pr merge --admin` | evita saltear el ruleset |
| `deny` Vercel y seed | `vercel deploy`, `--prod`, `promote`, `rollback`, `env pull`, `npx vercel`; `npm*seed*`, `node*seed*` |
| `deny` `.env*` | `Read` y `Edit` de `.env`, `.env.*`; más el hook `guard-secrets.sh` |
| `ask` | `gh pr merge` (siempre pide confirmación) |
| `allow` | `gh pr create`, `gh pr view`, `gh pr checks`, `gh pr list` |

Cada regla existe con la forma `Bash(...)` y con la forma `PowerShell(...)`.

## Fuentes (documentación oficial de Claude Code)

- Comodines: `*` en cualquier posición, matchea cualquier texto incluidos espacios; el espacio antes de un
  `*` final es parte de la regla; `:*` equivale a ` *` final.
  https://code.claude.com/docs/en/permissions#wildcard-patterns
- Comandos compuestos: deny/ask se aplican si **cualquier** subcomando coincide.
  https://code.claude.com/docs/en/permissions#compound-commands
- Precedencia: deny, luego ask, luego allow.
  https://code.claude.com/docs/en/permissions#manage-permissions
- Herramienta PowerShell con reglas propias (`PowerShell(...)`, misma forma que Bash, sin distinguir
  mayúsculas). Una regla `Bash` **no** restringe PowerShell, y en Windows con Git Bash una regla `deny` de
  Bash apaga la herramienta PowerShell sin avisar.
  https://code.claude.com/docs/en/permissions#powershell y
  https://code.claude.com/docs/en/tools-reference#bash-deny-rules-also-turn-off-the-powershell-tool
- Límites: los patrones sobre argumentos son frágiles y no son una frontera de seguridad.
  https://code.claude.com/docs/en/permissions#bash-rule-limits

## Limitaciones conocidas

- **No cubre** `git -C . push origin main`, `sh -c '...'`, rutas absolutas (`/usr/bin/git push`),
  `git -c k=v push` ni un `git push` pelado estando parado en `main`. La documentación indica que el
  matching no ve a través de esos envoltorios.
- **No hay forma documentada de probar una regla offline** (no existe un `claude permissions test`). Las
  reglas se probaron con un simulador local de la semántica documentada, no con el matcher oficial. Usá
  `/permissions` para ver qué reglas quedaron cargadas.
- La herramienta PowerShell figura como *preview* en la documentación y no indica desde qué versión de
  Claude Code existe: no pude confirmar si tu versión la tiene habilitada.
- En un repo público, `gh pr create --body-file <ruta>` publica el contenido del archivo: por eso la skill
  `release-flow` exige cuerpo inline o un archivo generado en un directorio temporal.
- Los permisos son locales a esta máquina. El control que no depende de ella es un ruleset de GitHub
  sobre `main`, que **hoy no existe** (ver `docs/RELEASE.md`).
