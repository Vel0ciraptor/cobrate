const db = require('./index');
const { formatDateToISO } = require('../services/dateService');

async function seedData() {
  console.log('🌱 Verificando si existen datos de prueba iniciales...');

  const clientsCountRes = await db.query('SELECT COUNT(id) as count FROM clients');
  const count = parseInt(clientsCountRes.rows[0].count, 10);

  if (count > 0) {
    console.log(`ℹ️ La base de datos ya contiene ${count} clientes. Se omite la carga de demo.`);
    return;
  }

  console.log('🚀 Creando datos de prueba iniciales para demostración...');

  const today = new Date();
  const todayStr = formatDateToISO(today);

  // Ayer (Vencido)
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 2);
  const overdueStr = formatDateToISO(yesterday);

  // Próxima semana
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 5);
  const nextWeekStr = formatDateToISO(nextWeek);

  // Inicio hace un mes
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const oneMonthAgoStr = formatDateToISO(oneMonthAgo);

  // 1. Crear clientes
  const c1 = await db.query(`
    INSERT INTO clients (name, phone, amount, frequency, payment_day, start_date, next_payment_date, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `, ['Carlos Méndez (Cobro de Hoy)', '+591 71234567', 30.00, 'DAILY', null, oneMonthAgoStr, todayStr, 'Cobro diario en quiosco']);

  const c2 = await db.query(`
    INSERT INTO clients (name, phone, amount, frequency, payment_day, start_date, next_payment_date, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `, ['María Esther Vargas (Vencido)', '+591 76543210', 150.00, 'WEEKLY', 1, oneMonthAgoStr, overdueStr, 'Cobro semanal puesto 12']);

  const c3 = await db.query(`
    INSERT INTO clients (name, phone, amount, frequency, payment_day, start_date, next_payment_date, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `, ['Taller Hermanos Gómez (Al Día)', '+591 70011223', 500.00, 'MONTHLY', 15, oneMonthAgoStr, nextWeekStr, 'Cobro mensual de alquiler de local']);

  const c4 = await db.query(`
    INSERT INTO clients (name, phone, amount, frequency, payment_day, start_date, next_payment_date, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `, ['Lucía Fernández', '+591 78901234', 80.00, 'WEEKLY', 5, oneMonthAgoStr, nextWeekStr, 'Servicio semanal']);

  // 2. Registrar algunos pagos para demostrar el historial y cálculo financiero
  const c3Id = c3.rows[0].id;
  await db.query(`
    INSERT INTO payments (client_id, amount, payment_date, period_start, period_end, notes)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [c3Id, 500.00, todayStr, oneMonthAgoStr, todayStr, 'Pago mensual puntual correspondiente al período']);

  const c1Id = c1.rows[0].id;
  await db.query(`
    INSERT INTO payments (client_id, amount, payment_date, notes)
    VALUES ($1, $2, $3, $4)
  `, [c1Id, 30.00, overdueStr, 'Pago adelantado de cuota anterior']);

  console.log('✅ Clientes y pagos de demostración creados exitosamente.');
}

module.exports = { seedData };
