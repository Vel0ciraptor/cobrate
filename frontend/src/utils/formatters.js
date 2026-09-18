// Utilidades para formatear moneda y fechas

export function formatCurrency(amount) {
  const val = parseFloat(amount) || 0;
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    currencyDisplay: 'symbol',
  }).format(val).replace('BOB', 'Bs');
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const cleanStr = String(dateStr).split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function formatFrequency(freq) {
  switch (freq) {
    case 'DAILY':
      return 'Diario';
    case 'WEEKLY':
      return 'Semanal';
    case 'MONTHLY':
      return 'Mensual';
    default:
      return freq;
  }
}

export function getFrequencyDayLabel(frequency, paymentDay) {
  if (frequency === 'WEEKLY' && paymentDay) {
    const days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return days[paymentDay] || '';
  }
  if (frequency === 'MONTHLY' && paymentDay) {
    return `Día ${paymentDay}`;
  }
  return '';
}
