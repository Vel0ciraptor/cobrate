const { Pool } = require('pg');
const { PGlite } = require('@electric-sql/pglite');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let dbMode = 'pg'; // 'pg' or 'pglite'
let pool = null;
let pglite = null;

async function initDb() {
  const connectionString = process.env.DATABASE_URL;
  const pgliteDir = path.join(__dirname, '../../data/pglite_db');

  // Try PostgreSQL connection first if configured
  if (connectionString) {
    try {
      const testPool = new Pool({
        connectionString,
        connectionTimeoutMillis: 2500,
      });
      // Test query with timeout
      await testPool.query('SELECT 1');
      pool = testPool;
      dbMode = 'pg';
      console.log('✅ Conectado exitosamente a PostgreSQL externo');
    } catch (err) {
      console.warn('⚠️ No se pudo conectar a PostgreSQL externo:', err.message);
      console.log('🔄 Iniciando motor PostgreSQL integrado (PGlite) con persistencia en disco...');
      if (!fs.existsSync(path.dirname(pgliteDir))) {
        fs.mkdirSync(path.dirname(pgliteDir), { recursive: true });
      }
      pglite = new PGlite(pgliteDir);
      dbMode = 'pglite';
      console.log('✅ Motor PostgreSQL integrado listo');
    }
  } else {
    if (!fs.existsSync(path.dirname(pgliteDir))) {
      fs.mkdirSync(path.dirname(pgliteDir), { recursive: true });
    }
    pglite = new PGlite(pgliteDir);
    dbMode = 'pglite';
    console.log('✅ Motor PostgreSQL integrado listo (Modo Local PGlite)');
  }

  // Run schema migrations
  await runSchema();
  // Ensure default admin exists
  await seedDefaultAdmin();
}

async function runSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  if (dbMode === 'pg') {
    await pool.query(schemaSql);
  } else {
    await pglite.exec(schemaSql);
  }
}

async function seedDefaultAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const res = await query('SELECT id FROM users WHERE username = $1', [username]);
  if (res.rows.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    await query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
      [username, hash]
    );
    console.log(`👤 Usuario administrador creado: "${username}" (Contraseña por defecto en .env)`);
  }
}

async function query(text, params = []) {
  if (dbMode === 'pg') {
    return pool.query(text, params);
  } else {
    const result = await pglite.query(text, params);
    return {
      rows: result.rows || [],
      rowCount: result.rows ? result.rows.length : 0,
    };
  }
}

async function getTransactionClient() {
  if (dbMode === 'pg') {
    const client = await pool.connect();
    await client.query('BEGIN');
    return {
      query: (text, params) => client.query(text, params),
      commit: async () => {
        await client.query('COMMIT');
        client.release();
      },
      rollback: async () => {
        await client.query('ROLLBACK');
        client.release();
      },
    };
  } else {
    // PGlite transaction helper
    await pglite.query('BEGIN');
    return {
      query: async (text, params) => {
        const result = await pglite.query(text, params);
        return {
          rows: result.rows || [],
          rowCount: result.rows ? result.rows.length : 0,
        };
      },
      commit: async () => {
        await pglite.query('COMMIT');
      },
      rollback: async () => {
        await pglite.query('ROLLBACK');
      },
    };
  }
}

module.exports = {
  initDb,
  query,
  getTransactionClient,
  getDbMode: () => dbMode,
};
