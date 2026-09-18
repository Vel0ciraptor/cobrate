/**
 * Utilidades para el cálculo de fechas de cobros y periodicidad
 */

// Formatear Date a YYYY-MM-DD en hora local
function formatDateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parsear 'YYYY-MM-DD' a Date en hora local (evitando desfases de zona horaria UTC)
function parseISODate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return new Date(dateStr);
  
  // Si viene como string ISO completo o YYYY-MM-DD
  const cleanStr = String(dateStr).split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

/**
 * Obtiene el último día válido para un año y mes dado (0-indexado)
 */
function getLastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Calcula la siguiente fecha de pago según frecuencia y configuración
 * @param {string} currentDateStr - Fecha actual programada 'YYYY-MM-DD'
 * @param {'DAILY' | 'WEEKLY' | 'MONTHLY'} frequency - Frecuencia de cobro
 * @param {number|null} paymentDay - Día de pago (1-7 para semanal, 1-31 para mensual)
 * @returns {string} - Próxima fecha 'YYYY-MM-DD'
 */
function calculateNextPaymentDate(currentDateStr, frequency, paymentDay = null) {
  const current = parseISODate(currentDateStr);
  const next = new Date(current.getTime());

  switch (frequency) {
    case 'DAILY': {
      // Sumar exactamente 1 día
      next.setDate(next.getDate() + 1);
      break;
    }

    case 'WEEKLY': {
      // Sumar 7 días
      next.setDate(next.getDate() + 7);
      
      // Si se definió un paymentDay específico (1 = Lunes, 7 = Domingo)
      if (paymentDay && paymentDay >= 1 && paymentDay <= 7) {
        // En JS: Domingo = 0, Lunes = 1, ... Sábado = 6
        const targetJsDay = paymentDay === 7 ? 0 : paymentDay;
        const currentJsDay = next.getDay();
        const diff = (targetJsDay - currentJsDay + 7) % 7;
        if (diff !== 0) {
          next.setDate(next.getDate() + diff);
        }
      }
      break;
    }

    case 'MONTHLY': {
      const currentMonth = current.getMonth();
      const currentYear = current.getFullYear();

      // Próximo mes
      let targetMonth = currentMonth + 1;
      let targetYear = currentYear;
      if (targetMonth > 11) {
        targetMonth = 0;
        targetYear += 1;
      }

      // Determinar día deseado
      const targetDayConfigured = paymentDay && paymentDay >= 1 && paymentDay <= 31
        ? paymentDay
        : current.getDate();

      const lastDayOfTargetMonth = getLastDayOfMonth(targetYear, targetMonth);
      const finalDay = Math.min(targetDayConfigured, lastDayOfTargetMonth);

      next.setFullYear(targetYear, targetMonth, finalDay);
      break;
    }

    default:
      next.setDate(next.getDate() + 1);
  }

  return formatDateToISO(next);
}

/**
 * Determina el estado del cliente: 'PAID' (Pagado), 'PENDING' (Pendiente), 'OVERDUE' (Vencido)
 * @param {string} nextPaymentDateStr - 'YYYY-MM-DD'
 * @param {number} pendingAmount - Monto de deuda pendiente
 */
function calculateClientStatus(nextPaymentDateStr, pendingAmount = 0) {
  const todayStr = formatDateToISO(new Date());
  
  if (pendingAmount <= 0) {
    return 'PAID';
  }

  if (nextPaymentDateStr < todayStr) {
    return 'OVERDUE';
  }

  return 'PENDING';
}

/**
 * Obtiene el rango de fechas para un filtro dado
 */
function getPeriodRange(period, customFrom = null, customTo = null) {
  const now = new Date();
  const todayStr = formatDateToISO(now);

  switch (period) {
    case 'today':
      return { from: todayStr, to: todayStr };

    case 'week': {
      // Inicio de la semana (Lunes)
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { from: formatDateToISO(monday), to: formatDateToISO(sunday) };
    }

    case 'month': {
      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      return { from: formatDateToISO(firstDay), to: formatDateToISO(lastDay) };
    }

    case 'year': {
      const year = now.getFullYear();
      return { from: `${year}-01-01`, to: `${year}-12-31` };
    }

    case 'custom':
      return {
        from: customFrom || todayStr,
        to: customTo || todayStr,
      };

    default:
      // default 'month'
      const year = now.getFullYear();
      const month = now.getMonth();
      return {
        from: formatDateToISO(new Date(year, month, 1)),
        to: formatDateToISO(new Date(year, month + 1, 0)),
      };
  }
}

module.exports = {
  formatDateToISO,
  parseISODate,
  getLastDayOfMonth,
  calculateNextPaymentDate,
  calculateClientStatus,
  getPeriodRange,
};
