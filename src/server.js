const express = require('express');
const { Pool } = require('pg');
const fs = require('node:fs');
const path = require('node:path');

const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

const app = express();
const port = Number(process.env.PORT || 3000);
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'flores_db',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  };
const pool = new Pool(poolConfig);

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    nombre: 'API de flores',
    estado: 'disponible',
    rutas: {
      flores: '/api/flores',
      florPorId: '/api/flores/:id',
      salud: '/api/health',
    },
  });
});

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected', message: error.message });
  }
});

app.get('/api/flores', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, color, temporada, precio, stock, descripcion
       FROM flores
       WHERE ($1::text IS NULL OR nombre ILIKE '%' || $1 || '%')
         AND ($2::text IS NULL OR color ILIKE '%' || $2 || '%')
       ORDER BY id`,
      [req.query.nombre || null, req.query.color || null],
    );
    res.json(rows);
  } catch (error) { next(error); }
});

app.get('/api/flores/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM flores WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Flor no encontrada' });
    res.json(rows[0]);
  } catch (error) { next(error); }
});

app.post('/api/flores', async (req, res, next) => {
  try {
    const { nombre, color, temporada, precio, stock = 0, descripcion = '' } = req.body;
    if (!nombre || !color || !temporada || !Number.isFinite(Number(precio))) {
      return res.status(400).json({ error: 'nombre, color, temporada y precio son obligatorios' });
    }
    const { rows } = await pool.query(
      `INSERT INTO flores (nombre, color, temporada, precio, stock, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nombre, color, temporada, precio, stock, descripcion],
    );
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
});

app.put('/api/flores/:id', async (req, res, next) => {
  try {
    const { nombre, color, temporada, precio, stock, descripcion } = req.body;
    const { rows } = await pool.query(
      `UPDATE flores SET nombre=$1, color=$2, temporada=$3, precio=$4, stock=$5, descripcion=$6
       WHERE id=$7 RETURNING *`,
      [nombre, color, temporada, precio, stock, descripcion, req.params.id],
    );
    if (!rows.length) return res.status(404).json({ error: 'Flor no encontrada' });
    res.json(rows[0]);
  } catch (error) { next(error); }
});

app.delete('/api/flores/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM flores WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Flor no encontrada' });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const host = process.env.RENDER ? '0.0.0.0' : '127.0.0.1';
const server = app.listen(port, host, () => {
  console.log(`API de flores disponible en http://${host}:${port}`);
  if (!process.env.RENDER) console.log('Deja esta terminal abierta mientras usas la API. Presiona Ctrl+C para detenerla.');
});

// Keep the HTTP listener referenced so Node stays alive while the API is running.
server.ref();
server.on('error', (error) => {
  console.error(`No se pudo mantener activa la API: ${error.message}`);
  process.exitCode = 1;
});
server.on('close', () => console.log('El servidor de la API se detuvo.'));
