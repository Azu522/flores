const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

async function main() {
  if (process.env.DATABASE_URL) {
    const db = new Client({ connectionString: process.env.DATABASE_URL });
    await db.connect();
    await db.query(fs.readFileSync(path.join(__dirname, '..', 'database.sql'), 'utf8'));
    const { rows } = await db.query('SELECT count(*)::int AS total FROM flores');
    await db.end();
    console.log(`Base de datos lista; ${rows[0].total} flores disponibles.`);
    return;
  }

  const config = {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD,
  };
  const dbName = process.env.PGDATABASE || 'flores_db';
  const admin = new Client({ ...config, database: 'postgres' });
  await admin.connect();
  const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (!exists.rowCount) await admin.query(`CREATE DATABASE "${dbName.replaceAll('"', '""')}"`);
  await admin.end();

  const db = new Client({ ...config, database: dbName });
  await db.connect();
  await db.query(fs.readFileSync(path.join(__dirname, '..', 'database.sql'), 'utf8'));
  const { rows } = await db.query('SELECT count(*)::int AS total FROM flores');
  await db.end();
  console.log(`Base de datos lista; ${rows[0].total} flores disponibles.`);
}

main().catch((error) => {
  console.error(`No se pudo preparar PostgreSQL: ${error.message}`);
  process.exitCode = 1;
});
