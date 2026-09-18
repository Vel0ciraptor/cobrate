import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, DollarSign } from 'lucide-react';
import { paymentsService } from '../services/payments';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function PaymentModal({
  isOpen,
  onClose,
  client,
  clients = [],
  onPaymentSuccess,
}) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sincronizar cuando cambia el cliente preseleccionado o se abre el modal
  useEffect(() => {
    if (isOpen) {
      setError('');
      const today = new Date().toISOString().split('T')[0];
      setPaymentDate(today);

      const targetClient = client || (clients.length > 0 ? clients[0] : null);
      if (targetClient) {
        setSelectedClientId(targetClient.id);
        setAmount(targetClient.amount || '');
        setNotes(`Pago de cuota ${targetClient.frequency === 'DAILY' ? 'diaria' : targetClient.frequency === 'WEEKLY' ? 'semanal' : 'mensual'}`);
      } else {
        setSelectedClientId('');
        setAmount('');
        setNotes('');
      }
    }
  }, [isOpen, client, clients]);

  const handleClientChange = (e) => {
    const id = e.target.value;
    setSelectedClientId(id);
    const found = clients.find((c) => c.id === id);
    if (found) {
      setAmount(found.amount || '');
      setNotes(`Pago de cuota ${found.frequency === 'DAILY' ? 'diaria' : found.frequency === 'WEEKLY' ? 'semanal' : 'mensual'}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClientId) {
      setError('Debes seleccionar un cliente');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await paymentsService.createPayment({
        client_id: selectedClientId,
        amount: numAmount,
        payment_date: paymentDate,
        period_start: periodStart || null,
        period_end: periodEnd || null,
        notes: notes.trim(),
      });
      onPaymentSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentClient = client || clients.find((c) => c.id === selectedClientId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Registrar Pago</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ingresa los datos del pago recibido
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ padding: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--danger-bg)',
              color: '#FECACA',
              border: '1px solid var(--danger-border)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Cliente selector */}
          <div className="form-group">
            <label className="form-label">Cliente *</label>
            {client ? (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                {client.name} {client.phone && `(${client.phone})`}
              </div>
            ) : (
              <select
                className="form-select"
                value={selectedClientId}
                onChange={handleClientChange}
                required
              >
                <option value="">-- Selecciona un cliente --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - Cuota: {formatCurrency(c.amount)} ({c.frequency})
                  </option>
                ))}
              </select>
            )}
          </div>

          {currentClient && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '16px',
                fontSize: '0.8rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Próximo pago actual: </span>
                <strong style={{ color: '#fff' }}>{formatDate(currentClient.next_payment_date)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Deuda calculada: </span>
                <strong style={{ color: currentClient.debt > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {formatCurrency(currentClient.debt || 0)}
                </strong>
              </div>
            </div>
          )}

          {/* Monto & Fecha */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Monto (Bs) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Pago *</label>
              <input
                type="date"
                className="form-input"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Rango de período opcional */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Período Desde (opcional)</label>
              <input
                type="date"
                className="form-input"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Período Hasta (opcional)</label>
              <input
                type="date"
                className="form-input"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>

          {/* Observación */}
          <div className="form-group">
            <label className="form-label">Observaciones / Nota</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Pago cuota semanal en efectivo"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ minWidth: '140px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Confirmar Pago</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
