# Take-Home Checklist

## Local Development
- [ ] No real secret values in the repo tree; `.env` replaced by a references file resolved at run time
- [ ] `.gitignore` covers `.env*` (except templates), `*.pem`, `*.key`, credential JSON, `.claude/settings.local.json`
- [ ] Dev credentials separate, least-privilege, low-limit and expiring
- [ ] `.npmrc` sets `ignore-scripts=true` and a min-release-age; Dependabot or Renovate cooldown to match

## CI/CD
- [ ] Zero long-lived cloud keys in Actions secrets; OIDC federation instead
- [ ] Trust policies pin `sub` to repo plus environment or branch, with no wildcards
- [ ] npm trusted publishing scoped to workflow file plus environment
- [ ] Workflow default permissions: `{}`; `id-token: write` only where needed
- [ ] Third-party actions pinned to full commit SHAs
- [ ] No `pull_request_target` running PR code; no cache shared between untrusted and release workflows
- [ ] Publish and deploy jobs run `npm ci --ignore-scripts` behind a protected environment

## Tokens
- [ ] No classic PATs; fine-grained tokens expire; the org caps maximum lifetime
- [ ] Bots and cross-repo automation use a GitHub App, not a person's PAT
- [ ] The agent has its own narrow identity instead of your `gh` login

## AI Agents
- [ ] Sandbox on and failing closed; home denied, project allowed; network allowlist
- [ ] Credential files and token env vars denied or masked for agent subprocesses
- [ ] Permission-bypass mode disabled through managed settings
- [ ] `.claude/`, `.vscode/`, `.mcp.json`, `AGENTS.md`, `CLAUDE.md` and `.github/workflows/` under CODEOWNERS
- [ ] MCP configs reference env vars, never literal keys
- [ ] Nobody pastes secrets into the chat

## Safety Nets
- [ ] Pre-commit secret scanning that also runs on the agent's commits
- [ ] Push protection enabled
- [ ] CI secret scan on PRs, full history nightly
- [ ] A honeytoken where only a leak or an attacker would find it
- [ ] A written revoke-first runbook with named owners