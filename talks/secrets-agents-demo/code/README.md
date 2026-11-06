# Demo kit: Stop Handing Your Secrets to an Agent

Everything here is harmless. Secrets are generated locally, random and fake. The "malicious"
package only prints, redacted, what it *could* read, and makes no network calls.

##

| Step | Command | Why |
| --- | --- | --- |
| 1 | `npm run setup` | Writes a fake `.env`, inits git, installs the pre-commit hook |
| 2 | `pipx install pre-commit && pre-commit install` | If setup said pre-commit was missing |
| 3 | `export DEMO_GITHUB_TOKEN=ghp_FAKE...` (setup prints one) | Gives demo 1 an env var to find |
| 4 | Linux/WSL2 only: `sudo apt-get install bubblewrap socat` | Claude Code sandbox dependencies (macOS needs nothing) |
| 5 | `claude --version` | Credentials settings need v2.1.187+, env masking v2.1.199+ |
| 6 | Record every demo once as a screen capture | Fallback if Wi-Fi, auth or a version bump breaks it |
| 7 | Terminal: large font, light-on-dark, clear scrollback, hide your prompt's hostname | Readability; don't leak your own info |

<br />

## Demo 1: What an install script sees 

```bash
npm run demo:install-unsafe      # what npm does by default when scripts are enabled
```
<br />

```bash
npm run demo:install-safe        # same install, --ignore-scripts: nothing runs
cat .env.tpl                     # references, not values: safe to commit, safe for the agent to read
op run --env-file=.env.tpl -- npm start   # optional: AWS SSM or 1Password CLI + a "demo" vault item
```

<br />

## Demo 2: Give the agent less to leak 

Open Claude Code in this folder. The committed `.claude/settings.json` turns on the sandbox,
denies `~/` and `.env`, allows only registry.npmjs.org, and strips token env vars.

1. Ask: **"Show me the contents of .env"** → the Read tool is denied by `permissions.deny`.
2. Ask: **"Run cat .env"** → blocked by the OS sandbox (denyRead), not by a prompt.
3. Ask: **"Run npm run demo:install-unsafe"** → the same postinstall now finds no home credential
   files and no `DEMO_GITHUB_TOKEN`. Say: "Same package, same laptop. The difference is the boundary."
4. Ask: **"curl** **<https://example.com>"** → network allowlist blocks it.
5. Optional, masked token (rehearse first; experimental TLS termination):
   ```bash
   export GH_TOKEN=$(gh auth token)
   claude --settings demo/mask-settings.json
   ```
   Ask: **"echo the first 12 characters of $GH\_TOKEN"** → a sentinel, not your token.
   Ask: **"curl -s -H "Authorization: Bearer $GH\_TOKEN"** **<https://api.github.com/user>** **| head -5"**
   → it authenticates, because the proxy swaps the real token in only for api.github.com.
   Say: "The agent can use the token. It cannot read it. That's the whole talk in one command."
   Note: mask entries are ignored in a repo's `.claude/settings.json` on purpose; that's why this
   comes from `--settings`. Go-based CLIs like `gh` can fail TLS under the macOS sandbox; use curl.

Then the persistence beat:
```bash
bash scripts/scan-agent-config.sh demo/poisoned-repo
```
<br />

## Demo 3: The safety net catches an agent-written token 

```bash
npm run demo:fake-leak
git add demo/agent-written-config.js && git commit -m "fix api client"
```

<br />



## Reset 

```bash
rm -rf node_modules .git .env && npm run setup
```
