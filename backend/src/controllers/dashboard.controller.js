const db = require('../db');
const { getPeriodRange, formatDateToISO } = require('../services/dateService');
const { calculateClientFinances } = require('../services/debtService');

/**
 * Obtener estadísticas consolidadas del Dashboard
 */
async function getDashboardSummary(req, res) {
  try {
    const { period = 'month', from, to } = req.query;
    const dateRange = getPeriodRange(period, from, to);
    const todayStr = formatDateToISO(new Date());

    // 1. Total cobrado dentro del período seleccionado
    const collectedRes = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total_collected, COUNT(id) as payment_count
       FROM payments
       WHERE payment_date >= $1 AND payment_date <= $2`,
      [dateRange.from, dateRange.to]
    );
    const totalCollected = parseFloat(collectedRes.rows[0].total_collected);
    const periodPaymentsCount = parseInt(collectedRes.rows[0].payment_count, 10);

    // 2. Obtener todos los clientes activos con sus pagos históricos acumulados
    const clientsRes = await db.query(`
      SELECT 
        c.*,
        COALESCE(SUM(p.amount), 0) as total_paid
      FROM clients c
      LEFT JOIN payments p ON c.id = p.client_id
      WHERE c.active = true
      GROUP BY c.id
      ORDER BY c.next_payment_date ASC
    `);

    let activeClientsCount = clientsRes.rows.length;
    let totalPending = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let todayDueCount = 0;
    let todayDueAmount = 0;

    const todayClients = [];
    const overdueClients = [];
    const upcomingClients = [];

    // Próximos 7 días para 'upcoming'
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const sevenDaysStr = formatDateToISO(sevenDaysLater);

    for (const client of clientsRes.rows) {
      const nextDateStr = client.next_payment_date
        ? String(client.next_payment_date).split('T')[0]
        : '';
      const clientAmount = parseFloat(client.amount);
      const finances = calculateClientFinances(client, client.total_paid);

      totalPending += finances.debt;

      const clientInfo = {
        id: client.id,
        name: client.name,
        phone: client.phone,
        amount: clientAmount,
        frequency: client.frequency,
        next_payment_date: nextDateStr,
        debt: finances.debt,
        financial_status: finances.status,
      };

      if (finances.isOverdue) {
        overdueCount += 1;
        overdueAmount += finances.debt > 0 ? finances.debt : clientAmount;
        overdueClients.push(clientInfo);
      } else if (finances.isDueToday) {
        todayDueCount += 1;
        todayDueAmount += clientAmount;
        todayClients.push(clientInfo);
      } else if (nextDateStr > todayStr && nextDateStr <= sevenDaysStr) {
        upcomingClients.push(clientInfo);
      }
    }

    // 3. Pagos efectivamente realizados en el día de hoy
    const todayPaymentsRes = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as amount, COUNT(id) as count
       FROM payments
       WHERE payment_date = $1`,
      [todayStr]
    );
    const todayCollectedAmount = parseFloat(todayPaymentsRes.rows[0].amount);
    const todayCollectedCount = parseInt(todayPaymentsRes.rows[0].count, 10);

    return res.json({
      period,
      dateRange,
      totalCollected,
      periodPaymentsCount,
      totalPending: Math.round(totalPending * 100) / 100,
      activeClients: activeClientsCount,
      todayPayments: {
        count: todayDueCount,
        amount: Math.round(todayDueAmount * 100) / 100,
        collectedCount: todayCollectedCount,
        collectedAmount: todayCollectedAmount,
      },
      overdue: {
        count: overdueCount,
        amount: Math.round(overdueAmount * 100) / 100,
      },
      todayClients,
      overdueClients,
      upcomingClients,
    });
  } catch (err) {
    console.error('Error al generar dashboard:', err);
    return res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
}

module.exports = {
  getDashboardSummary,
};
