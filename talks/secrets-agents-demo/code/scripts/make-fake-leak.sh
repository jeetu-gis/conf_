#!/usr/bin/env bash
# Simulates an agent "helpfully" hardcoding a token. The token is random and FAKE,
# but has the real GitHub PAT shape so scanners fire. Run: npm run demo:fake-leak
set -euo pipefail
cd "$(dirname "$0")/.."
rand() { LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c "$1"; }

if [ "${1:-}" = "--clean" ]; then
  git restore --staged demo/agent-written-config.js 2>/dev/null || true
  rm -f demo/agent-written-config.js && echo "Removed demo/agent-written-config.js"; exit 0
fi

cat > demo/agent-written-config.js <<JS
// Added by the agent while "fixing" a failing API call.
export const github = {
  baseUrl: 'https://api.github.com',
  token: 'ghp_$(rand 36)', // TODO move to env
};
JS
echo "Wrote demo/agent-written-config.js with a fake ghp_ token."
echo "Now run:  git add demo/agent-written-config.js && git commit -m 'fix api client'"
echo "Clean up: npm run demo:fake-leak -- --clean"
