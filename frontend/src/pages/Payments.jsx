import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Trash2, Filter, DollarSign, FileSpreadsheet } from 'lucide-react';
import { paymentsService } from '../services/payments';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportPaymentsToCSV } from '../utils/exportUtils';

export default function Payments({ onNewPayment, onViewClient }) {
  const [payments, setPayments] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentsService.getPayments({
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setPayments(data);
    } catch (err) {
      console.error('Error cargando pagos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadPayments();
  };

  const handleClearFilter = () => {
    setFromDate('');
    setToDate('');
    paymentsService.getPayments().then(setPayments);
  };

  const handleDelete = async (p) => {
    if (window.confirm(`¿Confirmas la eliminación del pago de ${formatCurrency(p.amount)} de "${p.client_name}"?`)) {
      try {
        await paymentsService.deletePayment(p.id);
        loadPayments();
      } catch (err) {
        alert('Error al eliminar pago: ' + err.message);
      }
    }
  };

  const totalAmount = payments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
            Registro General de Pagos
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Auditoría cronológica de todos los cobros efectuados en el sistema
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => exportPaymentsToCSV(payments, `Notas_Historial_Pagos_${new Date().toISOString().split('T')[0]}.csv`)}
            className="btn-export"
            title="Descargar historial de cobros en Excel/CSV"
          >
            <FileSpreadsheet size={16} />
            <span>Exportar Excel / CSV</span>
          </button>

          <button onClick={onNewPayment} className="btn btn-primary">
            <DollarSign size={18} />
            <span>Registrar Cobro</span>
          </button>
        </div>
      </div>

      {/* Date Filters & Summary Banner */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Desde:</span>
            <input
              type="date"
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hasta:</span>
            <input
              type="date"
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-secondary btn-sm">
            Filtrar
          </button>

          {(fromDate || toDate) && (
            <button type="button" onClick={handleClearFilter} className="btn btn-secondary btn-sm" style={{ opacity: 0.7 }}>
              Limpiar
            </button>
          )}
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Registrado en Vista</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }} className="tabular-nums">
              {formatCurrency(totalAmount)}
            </div>
          </div>
          <div style={{ textAlign: 'right', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cantidad de Pagos</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }} className="tabular-nums">
              {payments.length}
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table (Desktop / Tablet) */}
      <div className="table-responsive desktop-table-view">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha de Pago</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Monto Cobrado</th>
              <th>Período / Nota</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>
                    {formatDate(p.payment_date)}
                  </td>

                  <td>
                    <span
                      style={{ fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                      onClick={() => onViewClient && onViewClient({ id: p.client_id, name: p.client_name })}
                      title="Ver ficha del cliente"
                    >
                      {p.client_name}
                    </span>
                  </td>

                  <td style={{ color: 'var(--text-secondary)' }}>
                    {p.client_phone || '-'}
                  </td>

                  <td style={{ fontWeight: 700, color: 'var(--success)' }} className="tabular-nums">
                    {formatCurrency(p.amount)}
                  </td>

                  <td style={{ color: 'var(--text-secondary)' }}>
                    {p.period_start && p.period_end
                      ? `${formatDate(p.period_start)} al ${formatDate(p.period_end)}`
                      : p.notes || 'Cuota regular'}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(p)}
                      className="btn btn-danger btn-icon"
                      title="Eliminar este cobro como Administrador"
                      style={{ padding: '6px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No se encontraron registros de pagos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards for Payments */}
      <div className="mobile-cards-view">
        {payments.length > 0 ? (
          payments.map((p) => (
            <div key={p.id} className="mobile-client-card" style={{ gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div
                    onClick={() => onViewClient && onViewClient({ id: p.client_id, name: p.client_name })}
                    style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem', cursor: 'pointer' }}
                  >
                    {p.client_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Fecha: {formatDate(p.payment_date)}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success)' }} className="tabular-nums">
                    {formatCurrency(p.amount)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {p.notes || 'Cuota regular'}
                </span>

                <button
                  onClick={() => handleDelete(p)}
                  className="btn btn-danger btn-icon"
                  style={{ padding: '4px 8px' }}
                  title="Eliminar pago"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
            No se encontraron registros de pagos.
          </div>
        )}
      </div>
    </div>
  );
}
