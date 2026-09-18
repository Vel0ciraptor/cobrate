const db = require('../db');
const { calculateNextPaymentDate, formatDateToISO } = require('../services/dateService');
const { calculateClientFinances } = require('../services/debtService');

/**
 * Listar pagos con filtros opcionales de cliente y rango de fechas
 */
async function getPayments(req, res) {
  try {
    const { client_id, from, to } = req.query;

    let queryText = `
      SELECT 
        p.*,
        c.name as client_name,
        c.phone as client_phone,
        c.frequency as client_frequency
      FROM payments p
      JOIN clients c ON p.client_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (client_id) {
      params.push(client_id);
      queryText += ` AND p.client_id = $${params.length}`;
    }

    if (from) {
      params.push(from);
      queryText += ` AND p.payment_date >= $${params.length}`;
    }

    if (to) {
      params.push(to);
      queryText += ` AND p.payment_date <= $${params.length}`;
    }

    queryText += ` ORDER BY p.payment_date DESC, p.created_at DESC`;

    const result = await db.query(queryText, params);

    const payments = result.rows.map(p => ({
      ...p,
      amount: parseFloat(p.amount),
    }));

    return res.json(payments);
  } catch (err) {
    console.error('Error al obtener pagos:', err);
    return res.status(500).json({ error: 'Error al obtener registros de pagos' });
  }
}

/**
 * Registrar un nuevo pago (Transaccional)
 */
async function createPayment(req, res) {
  const clientTx = await db.getTransactionClient();
  try {
    const {
      client_id,
      amount,
      payment_date,
      period_start,
      period_end,
      notes,
    } = req.body;

    // 1. Validar cliente
    if (!client_id) {
      await clientTx.rollback();
      return res.status(400).json({ error: 'El ID del cliente es obligatorio' });
    }

    const clientRes = await clientTx.query(
      'SELECT * FROM clients WHERE id = $1 FOR UPDATE',
      [client_id]
    );

    if (clientRes.rows.length === 0) {
      await clientTx.rollback();
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const client = clientRes.rows[0];

    // 2. Validar monto
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      await clientTx.rollback();
      return res.status(400).json({ error: 'El monto debe ser un número válido mayor a 0' });
    }

    const finalPaymentDate = payment_date || formatDateToISO(new Date());

    // 3. Registrar el pago
    const insertRes = await clientTx.query(
      `INSERT INTO payments (
        client_id, amount, payment_date, period_start, period_end, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        client_id,
        numAmount,
        finalPaymentDate,
        period_start || null,
        period_end || null,
        notes ? notes.trim() : null,
      ]
    );
    const newPayment = insertRes.rows[0];

    // 5. Actualizar la próxima fecha de pago del cliente automáticamente
    const currentNextDate = client.next_payment_date
      ? String(client.next_payment_date).split('T')[0]
      : finalPaymentDate;

    const computedNextDate = calculateNextPaymentDate(
      currentNextDate,
      client.frequency,
      client.payment_day
    );

    await clientTx.query(
      `UPDATE clients SET
        next_payment_date = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2`,
      [computedNextDate, client_id]
    );

    // Commit transacción
    await clientTx.commit();

    // Obtener datos consolidados post-pago
    const paymentsSumRes = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE client_id = $1',
      [client_id]
    );
    const totalPaid = parseFloat(paymentsSumRes.rows[0].total);
    const updatedClient = {
      ...client,
      next_payment_date: computedNextDate,
    };
    const finances = calculateClientFinances(updatedClient, totalPaid);

    return res.status(201).json({
      message: 'Pago registrado exitosamente',
      payment: {
        ...newPayment,
        amount: parseFloat(newPayment.amount),
      },
      client: {
        id: client.id,
        name: client.name,
        next_payment_date: computedNextDate,
        total_paid: totalPaid,
        debt: finances.debt,
        financial_status: finances.status,
      },
    });
  } catch (err) {
    await clientTx.rollback();
    console.error('Error al registrar pago:', err);
    return res.status(500).json({ error: 'Error al registrar el pago en la base de datos' });
  }
}

/**
 * Eliminar / corregir pago como administrador
 */
async function deletePayment(req, res) {
  const clientTx = await db.getTransactionClient();
  try {
    const { id } = req.params;

    const paymentRes = await clientTx.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (paymentRes.rows.length === 0) {
      await clientTx.rollback();
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    const payment = paymentRes.rows[0];
    const clientId = payment.client_id;

    // Eliminar el pago
    await clientTx.query('DELETE FROM payments WHERE id = $1', [id]);

    await clientTx.commit();

    return res.json({
      message: 'Pago eliminado correctamente',
      id,
      client_id: clientId,
    });
  } catch (err) {
    await clientTx.rollback();
    console.error('Error al eliminar pago:', err);
    return res.status(500).json({ error: 'Error al eliminar pago' });
  }
}

module.exports = {
  getPayments,
  createPayment,
  deletePayment,
};
