import { formatCurrency, formatDate, formatFrequency, getFrequencyDayLabel } from './formatters';

/**
 * Utilidad rápida y segura para exportar datos a CSV compatible con Excel (.csv / .xls)
 * Utiliza Byte Order Mark (BOM) UTF-8 para garantizar acentos, caracteres especiales y números en Excel sin corrupción.
 */

function downloadCSV(csvContent, filename = 'export.csv') {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exportar lista de clientes a archivo CSV/Excel
 */
export function exportClientsToCSV(clients = [], customFilename = null) {
  const headers = [
    'Nombre del Cliente',
    'Teléfono',
    'Monto Cuota (Bs)',
    'Frecuencia',
    'Día de Cobro',
    'Fecha de Inicio',
    'Próximo Pago',
    'Estado',
    'Deuda Acumulada (Bs)',
    'Total Pagado (Bs)',
    'Cantidad de Pagos',
    'Activo',
    'Observaciones',
  ];

  const rows = clients.map((c) => {
    const dayLabel = getFrequencyDayLabel(c.frequency, c.payment_day) || '';
    return [
      escapeCSV(c.name),
      escapeCSV(c.phone || ''),
      escapeCSV(c.amount),
      escapeCSV(formatFrequency(c.frequency)),
      escapeCSV(dayLabel),
      escapeCSV(formatDate(c.start_date)),
      escapeCSV(formatDate(c.next_payment_date)),
      escapeCSV(c.financial_status || 'PENDING'),
      escapeCSV(c.debt || 0),
      escapeCSV(c.total_paid || 0),
      escapeCSV(c.payment_count || 0),
      escapeCSV(c.active ? 'SÍ' : 'NO'),
      escapeCSV(c.notes || ''),
    ].join(';');
  });

  const csvContent = [headers.join(';'), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, customFilename || `Notas_Clientes_${dateStr}.csv`);
}

/**
 * Exportar historial de pagos a archivo CSV/Excel
 */
export function exportPaymentsToCSV(payments = [], customFilename = null) {
  const headers = [
    'ID Pago',
    'Fecha de Pago',
    'Cliente',
    'Teléfono',
    'Monto Pagado (Bs)',
    'Período / Cuota',
    'Observaciones',
    'Fecha de Registro',
  ];

  const rows = payments.map((p) => {
    const periodStr = p.period_start && p.period_end
      ? `${formatDate(p.period_start)} al ${formatDate(p.period_end)}`
      : p.notes || 'Cuota regular';

    return [
      escapeCSV(p.id),
      escapeCSV(formatDate(p.payment_date)),
      escapeCSV(p.client_name || ''),
      escapeCSV(p.client_phone || ''),
      escapeCSV(p.amount),
      escapeCSV(periodStr),
      escapeCSV(p.notes || ''),
      escapeCSV(p.created_at ? formatDate(p.created_at) : ''),
    ].join(';');
  });

  const csvContent = [headers.join(';'), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, customFilename || `Notas_Pagos_${dateStr}.csv`);
}
