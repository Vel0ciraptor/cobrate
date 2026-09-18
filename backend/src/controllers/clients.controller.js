const db = require('../db');
const bcrypt = require('bcryptjs');
const { calculateClientFinances } = require('../services/debtService');
const { calculateNextPaymentDate, formatDateToISO } = require('../services/dateService');

/**
 * Listar clientes con filtros de estado y búsqueda
 */
async function getClients(req, res) {
  try {
    const { status, search, active = 'true' } = req.query;

    let queryText = `
      SELECT 
        c.*,
        COALESCE(SUM(p.amount), 0) as total_paid,
        COUNT(p.id) as payment_count
      FROM clients c
      LEFT JOIN payments p ON c.id = p.client_id
      WHERE 1=1
    `;
    const params = [];

    // Filtro de activo
    if (active === 'true') {
      params.push(true);
      queryText += ` AND c.active = $${params.length}`;
    } else if (active === 'false') {
      params.push(false);
      queryText += ` AND c.active = $${params.length}`;
    }

    // Búsqueda por nombre o teléfono
    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      queryText += ` AND (LOWER(c.name) LIKE $${params.length} OR LOWER(c.phone) LIKE $${params.length})`;
    }

    queryText += ` GROUP BY c.id ORDER BY c.next_payment_date ASC, c.name ASC`;

    const result = await db.query(queryText, params);

    // Calcular deuda y estado para cada cliente
    const clientsWithFinances = result.rows.map(client => {
      const finances = calculateClientFinances(client, client.total_paid);
      return {
        ...client,
        amount: parseFloat(client.amount),
        total_paid: parseFloat(client.total_paid),
        payment_count: parseInt(client.payment_count, 10),
        debt: finances.debt,
        financial_status: finances.status,
        is_due_today: finances.isDueToday,
        is_overdue: finances.isOverdue,
      };
    });

    // Filtro por estado en memoria si se solicitó
    let filtered = clientsWithFinances;
    if (status && status !== 'all') {
      const upperStatus = status.toUpperCase();
      filtered = filtered.filter(c => c.financial_status === upperStatus);
    }

    return res.json(filtered);
  } catch (err) {
    console.error('Error al listar clientes:', err);
    return res.status(500).json({ error: 'Error al obtener clientes' });
  }
}

/**
 * Obtener un cliente por ID junto con su historial de pagos
 */
async function getClientById(req, res) {
  try {
    const { id } = req.params;

    const clientRes = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
    if (clientRes.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const client = clientRes.rows[0];

    // Obtener pagos
    const paymentsRes = await db.query(
      'SELECT * FROM payments WHERE client_id = $1 ORDER BY payment_date DESC, created_at DESC',
      [id]
    );

    const payments = paymentsRes.rows.map(p => ({
      ...p,
      amount: parseFloat(p.amount),
    }));

    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const finances = calculateClientFinances(client, totalPaid);

    return res.json({
      ...client,
      amount: parseFloat(client.amount),
      total_paid: totalPaid,
      payment_count: payments.length,
      debt: finances.debt,
      financial_status: finances.status,
      is_due_today: finances.isDueToday,
      is_overdue: finances.isOverdue,
      payments,
    });
  } catch (err) {
    console.error('Error al obtener cliente:', err);
    return res.status(500).json({ error: 'Error al obtener detalle del cliente' });
  }
}

/**
 * Crear cliente
 */
async function createClient(req, res) {
  try {
    const {
      name,
      phone,
      amount,
      frequency,
      payment_day,
      start_date,
      next_payment_date,
      notes,
    } = req.body;

    // Validaciones
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'El monto debe ser un número mayor a cero' });
    }
    if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(frequency)) {
      return res.status(400).json({ error: 'Frecuencia no válida (DAILY, WEEKLY, MONTHLY)' });
    }
    if (!start_date) {
      return res.status(400).json({ error: 'La fecha de inicio es obligatoria' });
    }

    // Si no se envía next_payment_date, usar start_date o calcular
    const finalNextPayment = next_payment_date || start_date;
    const paymentDayNum = payment_day ? parseInt(payment_day, 10) : null;

    const result = await db.query(
      `INSERT INTO clients (
        name, phone, amount, frequency, payment_day, start_date, next_payment_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        name.trim(),
        phone ? phone.trim() : null,
        numAmount,
        frequency,
        paymentDayNum,
        start_date,
        finalNextPayment,
        notes ? notes.trim() : null,
      ]
    );

    const newClient = result.rows[0];
    const finances = calculateClientFinances(newClient, 0);

    return res.status(201).json({
      ...newClient,
      amount: parseFloat(newClient.amount),
      total_paid: 0,
      debt: finances.debt,
      financial_status: finances.status,
    });
  } catch (err) {
    console.error('Error al crear cliente:', err);
    return res.status(500).json({ error: 'Error al crear cliente' });
  }
}

/**
 * Editar cliente
 */
async function updateClient(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      amount,
      frequency,
      payment_day,
      start_date,
      next_payment_date,
      active,
      notes,
    } = req.body;

    const clientCheck = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const current = clientCheck.rows[0];
    const updatedName = name !== undefined ? name.trim() : current.name;
    const updatedPhone = phone !== undefined ? (phone ? phone.trim() : null) : current.phone;
    const updatedAmount = amount !== undefined ? parseFloat(amount) : parseFloat(current.amount);
    const updatedFrequency = frequency !== undefined ? frequency : current.frequency;
    const updatedPaymentDay = payment_day !== undefined ? (payment_day ? parseInt(payment_day, 10) : null) : current.payment_day;
    const updatedStartDate = start_date !== undefined ? start_date : current.start_date;
    const updatedNextPayment = next_payment_date !== undefined ? next_payment_date : current.next_payment_date;
    const updatedActive = active !== undefined ? Boolean(active) : current.active;
    const updatedNotes = notes !== undefined ? (notes ? notes.trim() : null) : current.notes;

    const result = await db.query(
      `UPDATE clients SET
        name = $1,
        phone = $2,
        amount = $3,
        frequency = $4,
        payment_day = $5,
        start_date = $6,
        next_payment_date = $7,
        active = $8,
        notes = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *`,
      [
        updatedName,
        updatedPhone,
        updatedAmount,
        updatedFrequency,
        updatedPaymentDay,
        updatedStartDate,
        updatedNextPayment,
        updatedActive,
        updatedNotes,
        id,
      ]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar cliente:', err);
    return res.status(500).json({ error: 'Error al actualizar cliente' });
  }
}

/**
 * Eliminar cliente con verificación de contraseña de administrador
 */
async function deleteClient(req, res) {
  try {
    const { id } = req.params;
    const password = req.headers['x-admin-password'] || req.body?.password;

    // 1. Validar que se haya enviado la contraseña
    if (!password || !String(password).trim()) {
      return res.status(400).json({ error: 'Debes ingresar tu contraseña de administrador para autorizar la eliminación.' });
    }

    // 2. Verificar que el usuario autenticado tenga un ID válido
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Sesión de administrador no válida. Inicia sesión nuevamente.' });
    }

    // 3. Verificar existencia del cliente
    const clientRes = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
    if (clientRes.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    const clientToDelete = clientRes.rows[0];

    // 4. Verificar la contraseña del administrador actual
    const userRes = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario administrador no válido' });
    }

    const passwordHash = userRes.rows[0].password_hash;
    if (!passwordHash) {
      return res.status(500).json({ error: 'El usuario administrador no tiene contraseña configurada' });
    }

    const isMatch = await bcrypt.compare(String(password).trim(), passwordHash);
    if (!isMatch) {
      return res.status(403).json({ error: 'Contraseña incorrecta. No se autorizó la eliminación del cliente.' });
    }

    // 5. Eliminación atómica segura mediante transacción
    const clientTx = await db.getTransactionClient();
    try {
      // Eliminar registros de pagos del cliente
      await clientTx.query('DELETE FROM payments WHERE client_id = $1', [id]);
      // Eliminar el registro del cliente
      await clientTx.query('DELETE FROM clients WHERE id = $1', [id]);
      await clientTx.commit();
    } catch (txErr) {
      await clientTx.rollback();
      throw txErr;
    }

    return res.json({
      message: `Cliente "${clientToDelete.name}" eliminado correctamente`,
      id,
    });
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    return res.status(500).json({ error: 'Error interno al eliminar el cliente' });
  }
}

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
