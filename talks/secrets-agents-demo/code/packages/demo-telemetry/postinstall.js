// HARMLESS DEMO. Read-only, redacted, no network, writes nothing.
// Shows what ANY install script (or any agent subprocess) can see as you.
const fs = require('fs');
const os = require('os');
const path = require('path');

const home = os.homedir();
const project = process.env.INIT_CWD || process.cwd();
const tilde = (p) => p.replace(home, '~');
const redact = (v = '') => (v.length <= 4 ? '****' : `${v.slice(0, 4)}${'*'.repeat(Math.min(12, v.length - 4))} (${v.length} chars)`);
const exists = (p) => { try { fs.accessSync(p, fs.constants.R_OK); return true; } catch { return false; } };
const color = (c, s) => (process.stdout.isTTY ? `\x1b[${c}m${s}\x1b[0m` : s);
const hit = (label, detail) => console.log(`  ${color('33', '*')} ${label}${detail ? color('2', '  ' + detail) : ''}`);

console.log(color('1', '\n[demo-telemetry] postinstall is running as ' + os.userInfo().username + '. Here is what I can read:\n'));

// 1. Environment variables that look like secrets
console.log(color('1', 'Environment variables'));
const secretish = /(TOKEN|SECRET|PASSWORD|PASSWD|API_?KEY|PRIVATE_KEY|ACCESS_KEY|CREDENTIAL|DATABASE_URL|_PAT$)/i;
const envHits = Object.entries(process.env).filter(([k]) => secretish.test(k) && !k.startsWith('npm_'));
if (envHits.length === 0) console.log('  (none that look like secrets)');
for (const [k, v] of envHits) hit(k, redact(v));

// 2. .env files in the project that ran the install
console.log(color('1', '\n.env files in ' + tilde(project)));
let envFiles = [];
try { envFiles = fs.readdirSync(project).filter((f) => /^\.env(\..+)?$/.test(f) && f !== '.env.tpl' && f !== '.env.example'); } catch {}
if (envFiles.length === 0) console.log('  (none)');
for (const f of envFiles) {
  let text;
  try { text = fs.readFileSync(path.join(project, f), 'utf8'); } catch { console.log(`  ${color('32', 'x')} ${f}  exists, but reading it was BLOCKED`); continue; }
  const lines = text.split('\n').filter((l) => /^[A-Z0-9_]+=/.test(l));
  hit(f, `${lines.length} values`);
  for (const l of lines) {
    const [k, ...rest] = l.split('=');
    console.log(`      ${k.padEnd(20)} ${redact(rest.join('='))}`);
  }
}

// 3. Well-known credential locations in $HOME (existence only; contents never printed)
console.log(color('1', '\nCredential files in your home directory (existence only)'));
const targets = [
  '.aws/credentials', '.aws/config', '.ssh', '.npmrc', '.git-credentials', '.config/gh/hosts.yml',
  '.docker/config.json', '.kube/config', '.config/gcloud/application_default_credentials.json',
  '.azure', '.pypirc', '.terraform.d/credentials.tfrc.json', '.claude.json', '.claude/settings.json',
  '.bash_history', '.zsh_history',
];
let homeHits = 0;
for (const t of targets) {
  const p = path.join(home, t);
  if (!exists(p)) continue;
  homeHits++;
  let detail = 'readable';
  if (t === '.ssh') {
    try { const keys = fs.readdirSync(p).filter((f) => /^id_/.test(f) && !f.endsWith('.pub')); detail = keys.length ? `private keys: ${keys.join(', ')}` : 'no id_* keys'; } catch { detail = 'present'; }
  } else if (t === '.npmrc') {
    try { detail = /_authToken/.test(fs.readFileSync(p, 'utf8')) ? 'contains an npm auth token' : 'no auth token'; } catch {}
  } else if (t === '.config/gh/hosts.yml') {
    try { detail = /oauth_token/.test(fs.readFileSync(p, 'utf8')) ? 'contains a GitHub OAuth token' : 'present (token may be in OS keychain)'; } catch {}
  }
  hit('~/' + t, detail);
}
if (homeHits === 0) console.log('  (none found, or not readable from here)');

// 4. Agent and MCP config in the project
console.log(color('1', '\nAgent and MCP config in the project'));
let agentHits = 0;
for (const f of ['.mcp.json', '.claude/settings.json', '.vscode/tasks.json', '.cursor/mcp.json']) {
  if (exists(path.join(project, f))) { agentHits++; hit(f, 'readable, and writable by me'); }
}
if (agentHits === 0) console.log('  (none)');

// 5. AI coding agents on PATH (never executed)
console.log(color('1', '\nAI coding agents installed on PATH (not executed)'));
const agents = ['claude', 'gemini', 'codex', 'q', 'copilot', 'cursor-agent', 'aider'];
const dirs = (process.env.PATH || '').split(path.delimiter);
let agentFound = 0;
for (const a of agents) {
  const found = dirs.find((d) => exists(path.join(d, a)) || exists(path.join(d, a + '.cmd')));
  if (found) { agentFound++; hit(a, tilde(path.join(found, a))); }
}
if (agentFound === 0) console.log('  (none found)');
else console.log(color('2', '    s1ngularity (Aug 2025) invoked agents like these with permission-bypass flags to hunt for secrets.'));

console.log(color('1', '\nNothing was sent anywhere and nothing was written.'));
console.log('A real payload would now encrypt this and commit it to a new public repo on YOUR GitHub account via api.github.com,');
console.log('then write .claude/settings.json and .vscode/tasks.json hooks into every repo your token can push to.\n');
