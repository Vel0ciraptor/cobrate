import React from 'react';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate, formatFrequency, getFrequencyDayLabel } from '../utils/formatters';
import { Eye, Edit2, DollarSign, Phone, MessageSquare, Calendar, AlertCircle } from 'lucide-react';

export default function ClientTable({
  clients = [],
  onPay,
  onEdit,
  onView,
  emptyMessage = 'No se encontraron clientes',
}) {
  if (clients.length === 0) {
    return (
      <div
        className="glass-card"
        style={{
          textAlign: 'center',
          padding: '36px 20px',
          color: 'var(--text-secondary)',
        }}
      >
        <p style={{ fontSize: '0.95rem', marginBottom: '6px' }}>{emptyMessage}</p>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Crea un cliente o ajusta los filtros de búsqueda.
        </span>
      </div>
    );
  }

  return (
    <>
      {/* 1. Desktop / Tablet Table View */}
      <div className="table-responsive desktop-table-view">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Cuota</th>
              <th>Frecuencia</th>
              <th>Próximo Pago</th>
              <th>Estado</th>
              <th>Deuda</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const dayLabel = getFrequencyDayLabel(client.frequency, client.payment_day);
              return (
                <tr key={client.id}>
                  <td>
                    <div
                      onClick={() => onView && onView(client)}
                      style={{ fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                      title="Ver detalle del cliente"
                    >
                      {client.name}
                    </div>
                    {client.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {client.notes}
                      </div>
                    )}
                  </td>

                  <td style={{ color: 'var(--text-secondary)' }}>
                    {client.phone ? (
                      <a
                        href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Contactar por WhatsApp"
                      >
                        {client.phone}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>

                  <td style={{ fontWeight: 600 }} className="tabular-nums">
                    {formatCurrency(client.amount)}
                  </td>

                  <td>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                      {formatFrequency(client.frequency)}
                      {dayLabel && ` (${dayLabel})`}
                    </span>
                  </td>

                  <td>
                    <span
                      style={{
                        fontWeight: 600,
                        color: client.is_overdue
                          ? 'var(--danger)'
                          : client.is_due_today
                          ? 'var(--warning)'
                          : 'var(--text-primary)',
                      }}
                    >
                      {formatDate(client.next_payment_date)}
                    </span>
                    {client.is_due_today && (
                      <span
                        style={{
                          marginLeft: '6px',
                          fontSize: '0.7rem',
                          color: 'var(--warning)',
                          fontWeight: 700,
                        }}
                      >
                        (HOY)
                      </span>
                    )}
                  </td>

                  <td>
                    <StatusBadge status={client.financial_status} />
                  </td>

                  <td className="tabular-nums">
                    <span
                      style={{
                        fontWeight: 700,
                        color: client.debt > 0 ? 'var(--danger)' : 'var(--success)',
                      }}
                    >
                      {formatCurrency(client.debt || 0)}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => onPay && onPay(client)}
                        className="btn btn-primary btn-sm"
                        title="Registrar pago"
                        style={{ padding: '6px 10px', fontSize: '0.775rem' }}
                      >
                        <DollarSign size={14} />
                        <span>Cobrar</span>
                      </button>

                      <button
                        onClick={() => onView && onView(client)}
                        className="btn btn-secondary btn-icon"
                        title="Ver ficha e historial"
                        style={{ padding: '6px' }}
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        onClick={() => onEdit && onEdit(client)}
                        className="btn btn-secondary btn-icon"
                        title="Editar cliente"
                        style={{ padding: '6px' }}
                      >
                        <Edit2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 2. High-Density Mobile Cards View */}
      <div className="mobile-cards-view">
        {clients.map((client) => {
          const dayLabel = getFrequencyDayLabel(client.frequency, client.payment_day);
          const cleanPhone = client.phone ? client.phone.replace(/[^0-9]/g, '') : '';

          return (
            <div key={client.id} className="mobile-client-card">
              {/* Header: Name, Status Badge, WhatsApp */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ minWidth: 0 }}>
                  <div
                    onClick={() => onView && onView(client)}
                    style={{
                      fontWeight: 700,
                      color: '#fff',
                      fontSize: '0.95rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                    }}
                  >
                    {client.name}
                  </div>
                  {client.phone && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Phone size={12} />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <StatusBadge status={client.financial_status} />
                </div>
              </div>

              {/* Data Row: Cuota, Vencimiento, Deuda */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Cuota
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }} className="tabular-nums">
                    {formatCurrency(client.amount)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {formatFrequency(client.frequency)} {dayLabel && `(${dayLabel})`}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Próximo
                  </div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: client.is_overdue
                        ? 'var(--danger)'
                        : client.is_due_today
                        ? 'var(--warning)'
                        : 'var(--text-primary)',
                    }}
                  >
                    {formatDate(client.next_payment_date)}
                  </div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                    {client.is_overdue ? (
                      <span style={{ color: 'var(--danger)' }}>¡VENCIDO!</span>
                    ) : client.is_due_today ? (
                      <span style={{ color: 'var(--warning)' }}>¡COBRAR HOY!</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Al día</span>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Deuda
                  </div>
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: client.debt > 0 ? 'var(--danger)' : 'var(--success)',
                    }}
                    className="tabular-nums"
                  >
                    {formatCurrency(client.debt || 0)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {client.debt > 0 ? 'Pendiente' : 'Saldado'}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <button
                  onClick={() => onPay && onPay(client)}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                  }}
                >
                  <DollarSign size={15} />
                  <span>Cobrar Cuota</span>
                </button>

                {cleanPhone && (
                  <a
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-icon"
                    style={{ padding: '8px', color: 'var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.12)' }}
                    title="WhatsApp"
                  >
                    <MessageSquare size={16} />
                  </a>
                )}

                <button
                  onClick={() => onView && onView(client)}
                  className="btn btn-secondary btn-icon"
                  style={{ padding: '8px' }}
                  title="Ver Ficha"
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() => onEdit && onEdit(client)}
                  className="btn btn-secondary btn-icon"
                  style={{ padding: '8px' }}
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
