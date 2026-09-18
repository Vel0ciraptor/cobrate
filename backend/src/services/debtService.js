const { parseISODate, formatDateToISO } = require('./dateService');

/**
 * Calcula la cantidad de cuotas devengadas/generadas entre start_date y targetDate (por defecto hoy)
 */
function getElapsedPeriods(startDateStr, frequency, paymentDay, targetDate = new Date()) {
  const start = parseISODate(startDateStr);
  const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  
  if (start > target) {
    // Si la fecha de inicio es a futuro, aún no se devengaron cuotas previas
    return 1; // Al menos la primera cuota inicial a vencer
  }

  switch (frequency) {
    case 'DAILY': {
      const diffTime = target.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays + 1);
    }

    case 'WEEKLY': {
      const diffTime = target.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(diffDays / 7);
      return Math.max(1, weeks + 1);
    }

    case 'MONTHLY': {
      let months = (target.getFullYear() - start.getFullYear()) * 12 + (target.getMonth() - start.getMonth());
      if (target.getDate() >= start.getDate()) {
        months += 1;
      }
      return Math.max(1, months);
    }

    default:
      return 1;
  }
}

/**
 * Calcula la deuda y estado financiero de un cliente
 * @param {Object} client - Objeto cliente con start_date, next_payment_date, amount, frequency, payment_day
 * @param {number} totalPaid - Suma de pagos realizados
 */
function calculateClientFinances(client, totalPaid = 0) {
  const amount = parseFloat(client.amount) || 0;
  const paid = parseFloat(totalPaid) || 0;
  const todayStr = formatDateToISO(new Date());
  const nextPaymentStr = client.next_payment_date ? String(client.next_payment_date).split('T')[0] : todayStr;

  // Cuotas devengadas hasta hoy
  const periods = getElapsedPeriods(client.start_date, client.frequency, client.payment_day);
  const totalExpected = periods * amount;

  // Deuda actual = cuotas devengadas - total pagado
  const debt = Math.max(0, Math.round((totalExpected - paid) * 100) / 100);

  // Determinar estado: 'PAID' (Pagado), 'PENDING' (Pendiente), 'OVERDUE' (Vencido)
  let status = 'PENDING';
  const isDueToday = nextPaymentStr === todayStr;
  const isOverdue = nextPaymentStr < todayStr;

  if (debt <= 0 && nextPaymentStr > todayStr) {
    status = 'PAID';
  } else if (isOverdue) {
    status = 'OVERDUE';
  } else {
    // Si nextPaymentStr >= today y tiene deuda o vence hoy
    status = 'PENDING';
  }

  return {
    totalExpected,
    totalPaid: paid,
    debt,
    status,
    isDueToday,
    isOverdue,
  };
}

module.exports = {
  getElapsedPeriods,
  calculateClientFinances,
};
