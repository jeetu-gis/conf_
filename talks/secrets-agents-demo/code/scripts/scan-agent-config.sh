#!/usr/bin/env bash
# Hunts for agent/IDE persistence and Mini Shai-Hulud style indicators in a repo.
# Usage: bash scripts/scan-agent-config.sh [path-to-repo]
set -uo pipefail
ROOT="${1:-.}"
cd "$ROOT" || exit 2
found=0
flag() { printf '  \033[33m!\033[0m %s\n' "$1"; found=$((found+1)); }
ok()   { printf '  \033[32mok\033[0m %s\n' "$1"; }

echo "Scanning $(pwd)"

echo "Agent hooks (commands that run on session start or tool use)"
while IFS= read -r f; do
  if grep -q '"hooks"' "$f"; then flag "$f defines hooks:"; grep -n '"command"' "$f" | sed 's/^/        /'; fi
done < <(find . -path ./node_modules -prune -o \( -path '*/.claude/settings.json' -o -path '*/.claude/settings.local.json' \) -print 2>/dev/null)

echo "IDE tasks that run when the folder opens"
while IFS= read -r f; do
  if grep -q 'folderOpen' "$f"; then flag "$f has a runOn: folderOpen task:"; grep -n '"command"' "$f" | sed 's/^/        /'; fi
done < <(find . -path ./node_modules -prune -o -path '*/.vscode/tasks.json' -print 2>/dev/null)

echo "Loader or payload files next to agent config"
while IFS= read -r f; do flag "unexpected script: $f"; done < <(find . -path ./node_modules -prune -o \( -path '*/.claude/*.mjs' -o -path '*/.claude/*.js' -o -path '*/.vscode/*.mjs' -o -path '*/.vscode/*.js' \) -print 2>/dev/null)

echo "MCP configs with literal-looking secrets"
while IFS= read -r f; do
  if grep -Eq '(ghp_|gho_|github_pat_|sk-[A-Za-z0-9]|xox[bp]-|AKIA[0-9A-Z]{16}|"[A-Za-z_]*(TOKEN|KEY|SECRET)"[[:space:]]*:[[:space:]]*"[^$"][^"]{15,}")' "$f"; then flag "$f appears to contain a literal secret (use env var references)"; fi
done < <(find . -path ./node_modules -prune -o \( -name '.mcp.json' -o -name 'mcp.json' \) -print 2>/dev/null)

echo "Workflows that dump all secrets"
while IFS= read -r f; do flag "$f uses toJSON(secrets)"; done < <(grep -rl 'toJSON(secrets)' .github/workflows 2>/dev/null)

if git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Git history indicators"
  n=$(git log --all --author='claude@users.noreply.github.com' --grep='chore: update dependencies' --oneline 2>/dev/null | wc -l | tr -d ' ')
  [ "$n" -gt 0 ] && flag "$n commit(s) by claude@users.noreply.github.com titled 'chore: update dependencies' (Mini Shai-Hulud signature)"
  b=$(git branch -a 2>/dev/null | grep -c 'dependabout' || true)
  [ "$b" -gt 0 ] && flag "branch named dependabout/* (typosquat of dependabot)"
fi

echo
if [ "$found" -eq 0 ]; then ok "nothing suspicious found"; else echo "$found finding(s). Review each before opening this repo in an agent or IDE."; fi
echo "Also check your GitHub account for public repos described 'A Mini Shai-Hulud has Appeared':"
echo "  gh repo list --visibility public --json name,description --limit 200 | jq '.[] | select(.description|test(\"Shai-Hulud\"))'"
