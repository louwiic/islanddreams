import { execFileSync } from 'node:child_process';
const dsn = process.env.NEWSLETTER_DATABASE_URL;
if (!dsn) throw new Error('Set NEWSLETTER_DATABASE_URL to the project owner connection, or run newsletter-queue.sql in the PGBase SQL editor.');
const connection = new URL(dsn);
const password = decodeURIComponent(connection.password);
connection.password = '';
try {
  execFileSync('psql', [connection.toString(), '-X', '-v', 'ON_ERROR_STOP=1', '-f', new URL('./newsletter-queue.sql', import.meta.url).pathname], {
    env: { ...process.env, ...(password ? { PGPASSWORD: password } : {}) }, stdio: ['ignore', 'ignore', 'pipe'],
  });
} catch { throw new Error('Queue migration failed. Private connection details omitted.'); }
console.log('Newsletter queue installed. No campaigns scheduled or emails sent.');
