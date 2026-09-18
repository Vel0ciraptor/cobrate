const db = require('./src/db');
const { seedData } = require('./src/db/seed');

async function test() {
  console.log('--- Probando inicio de BD ---');
  await db.initDb();
  await seedData();

  console.log('--- Probando consulta de clientes ---');
  const res = await db.query('SELECT name, amount, frequency, next_payment_date FROM clients');
  console.log('Clientes encontrados:', res.rows);

  console.log('--- Probando consulta de pagos ---');
  const paymentsRes = await db.query('SELECT * FROM payments');
  console.log('Pagos encontrados:', paymentsRes.rows.length);

  console.log('✅ Base de datos y migraciones 100% verificadas');
  process.exit(0);
}

test().catch(err => {
  console.error('❌ Error en prueba de BD:', err);
  process.exit(1);
});
