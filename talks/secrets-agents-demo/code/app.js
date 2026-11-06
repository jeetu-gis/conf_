// Tiny app that "needs" secrets. It prints only redacted values.
const redact = (v) => (v ? `${v.slice(0, 4)}…(${v.length} chars)` : '(missing)');

const needed = ['DATABASE_URL', 'STRIPE_SECRET_KEY', 'OPENAI_API_KEY'];
console.log('App starting with config:');
for (const name of needed) {
  console.log(`  ${name.padEnd(18)} ${redact(process.env[name])}`);
}
console.log(process.env.DATABASE_URL ? 'Ready.' : 'Missing config: run via "op run --env-file=.env.tpl -- npm start" or source .env');
