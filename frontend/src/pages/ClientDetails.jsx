import React, { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, Calendar, Phone, Edit2, Trash2, ShieldAlert, FileSpreadsheet } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { clientsService } from '../services/clients';
import { paymentsService } from '../services/payments';
import { formatCurrency, formatDate, formatFrequency, getFrequencyDayLabel } from '../utils/formatters';
import { exportPaymentsToCSV } from '../utils/exportUtils';

export default function ClientDetails({ clientId, onBack, onPay, onEdit }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadClientDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await clientsService.getClientById(clientId);
      setClient(data);
    } catch (err) {
      setError(err.message || 'Error al cargar detalles del cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      loadClientDetails();
    }
  }, [clientId]);

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('¿Confirmas la eliminación de este pago? Como administrador, el sistema recalculará la deuda y saldos.')) {
      try {
        await paymentsService.deletePayment(paymentId);
        loadClientDetails();
      } catch (err) {
        alert('Error al eliminar pago: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        Cargando ficha del cliente...
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '36px' }}>
        <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error || 'Cliente no encontrado'}</p>
        <button onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Volver al listado</span>
        </button>
      </div>
    );
  }

  const dayLabel = getFrequencyDayLabel(client.frequency, client.payment_day);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button onClick={onBack} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Volver a Clientes</span>
        </button>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {client.payments && client.payments.length > 0 && (
            <button
              onClick={() => exportPaymentsToCSV(client.payments, `Notas_Pagos_${client.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)}
              className="btn-export"
              title="Descargar historial de este cliente en Excel/CSV"
            >
              <FileSpreadsheet size={15} />
              <span>Exportar Excel / CSV</span>
            </button>
          )}
          <button onClick={() => onEdit(client)} className="btn btn-secondary btn-sm">
            <Edit2 size={15} />
            <span>Editar Datos</span>
          </button>
          <button onClick={() => onPay(client)} className="btn btn-primary btn-sm">
            <DollarSign size={15} />
            <span>Registrar Pago</span>
          </button>
        </div>
      </div>

      {/* Client Profile Header Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                {client.name}
              </h2>
              <StatusBadge status={client.financial_status} />
              {!client.active && (
                <span className="badge" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                  Inactivo
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {client.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={15} color="var(--primary)" />
                  <a
                    href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'inherit' }}
                  >
                    {client.phone}
                  </a>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} color="var(--primary)" />
                <span>Fecha de inicio: <strong>{formatDate(client.start_date)}</strong></span>
              </div>
            </div>

            {client.notes && (
              <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                "{client.notes}"
              </p>
            )}
          </div>
        </div>

        {/* Financial Summary Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cuota Asignada
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }} className="tabular-nums">
              {formatCurrency(client.amount)}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {formatFrequency(client.frequency)} {dayLabel && `(${dayLabel})`}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Próximo Cobro
            </span>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: client.is_overdue
                  ? 'var(--danger)'
                  : client.is_due_today
                  ? 'var(--warning)'
                  : '#fff',
              }}
            >
              {formatDate(client.next_payment_date)}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {client.is_overdue ? 'Cuota vencida' : client.is_due_today ? 'Debe cobrar hoy' : 'Próxima fecha programada'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Pagado
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }} className="tabular-nums">
              {formatCurrency(client.total_paid || 0)}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {client.payment_count} pago(s) registrado(s)
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Deuda Pendiente
            </span>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: client.debt > 0 ? 'var(--danger)' : 'var(--success)',
              }}
              className="tabular-nums"
            >
              {formatCurrency(client.debt || 0)}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {client.debt > 0 ? 'Saldo pendiente de cobro' : 'Completamente al día'}
            </span>
          </div>
        </div>
      </div>

      {/* Historial de Pagos (Sección 9) */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>
              Historial de Pagos
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Registro de todas las cuotas abonadas por el cliente
            </p>
          </div>

          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Total abonado: <strong style={{ color: 'var(--success)' }}>{formatCurrency(client.total_paid || 0)}</strong>
          </span>
        </div>

        {client.payments && client.payments.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="table-responsive desktop-table-view">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha de Pago</th>
                    <th>Monto Pagado</th>
                    <th>Período Correspondiente</th>
                    <th>Observación</th>
                    <th>Registrado</th>
                    <th style={{ textAlign: 'right' }}>Acción Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {client.payments.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, color: '#fff' }}>
                        {formatDate(p.payment_date)}
                      </td>

                      <td style={{ fontWeight: 700, color: 'var(--success)' }} className="tabular-nums">
                        {formatCurrency(p.amount)}
                      </td>

                      <td style={{ color: 'var(--text-secondary)' }}>
                        {p.period_start && p.period_end
                          ? `${formatDate(p.period_start)} al ${formatDate(p.period_end)}`
                          : p.notes && p.notes.toLowerCase().includes('cuota')
                          ? p.notes
                          : 'Cuota regular'}
                      </td>

                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {p.notes || '-'}
                      </td>

                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(p.created_at).toLocaleDateString('es-BO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeletePayment(p.id)}
                          className="btn btn-danger btn-icon"
                          title="Eliminar o anular este pago como Administrador"
                          style={{ padding: '6px' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="mobile-cards-view">
              {client.payments.map((p) => (
                <div key={p.id} className="mobile-client-card" style={{ gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fecha: </span>
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{formatDate(p.payment_date)}</strong>
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--success)' }} className="tabular-nums">
                      {formatCurrency(p.amount)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {p.notes || 'Cuota regular'}
                    </span>
                    <button
                      onClick={() => handleDeletePayment(p.id)}
                      className="btn btn-danger btn-icon"
                      style={{ padding: '4px 8px' }}
                      title="Eliminar pago"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Aún no se han registrado pagos para este cliente.
          </div>
        )}
      </div>
    </div>
  );
}
