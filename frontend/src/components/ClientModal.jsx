import React, { useState, useEffect } from 'react';
import { X, UserCheck, Loader2 } from 'lucide-react';
import { clientsService } from '../services/clients';

export default function ClientModal({ isOpen, onClose, client, onSaved }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('DAILY');
  const [paymentDay, setPaymentDay] = useState('');
  const [startDate, setStartDate] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!client;

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (client) {
        setName(client.name || '');
        setPhone(client.phone || '');
        setAmount(client.amount || '');
        setFrequency(client.frequency || 'DAILY');
        setPaymentDay(client.payment_day !== null && client.payment_day !== undefined ? String(client.payment_day) : '');
        setStartDate(client.start_date ? String(client.start_date).split('T')[0] : '');
        setNextPaymentDate(client.next_payment_date ? String(client.next_payment_date).split('T')[0] : '');
        setNotes(client.notes || '');
      } else {
        const today = new Date().toISOString().split('T')[0];
        setName('');
        setPhone('');
        setAmount('');
        setFrequency('DAILY');
        setPaymentDay('');
        setStartDate(today);
        setNextPaymentDate(today);
        setNotes('');
      }
    }
  }, [isOpen, client]);

  // Si cambia la fecha de inicio en un nuevo cliente y no se ha modificado el próximo pago, sincronizar
  const handleStartDateChange = (e) => {
    const val = e.target.value;
    setStartDate(val);
    if (!isEditing) {
      setNextPaymentDate(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre completo es obligatorio');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('El monto de cobro debe ser mayor a 0');
      return;
    }
    if (!startDate) {
      setError('La fecha de inicio es requerida');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        amount: numAmount,
        frequency,
        payment_day: paymentDay ? parseInt(paymentDay, 10) : null,
        start_date: startDate,
        next_payment_date: nextPaymentDate || startDate,
        notes: notes ? notes.trim() : null,
      };

      let result;
      if (isEditing) {
        result = await clientsService.updateClient(client.id, payload);
      } else {
        result = await clientsService.createClient(payload);
      }

      onSaved(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>
                {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isEditing ? 'Actualiza los datos del cliente' : 'Registra un nuevo cliente para cobranzas'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ padding: '6px' }}>
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
          {/* Nombre */}
          <div className="form-group">
            <label className="form-label">Nombre Completo *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Juan Carlos Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Teléfono y Monto */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Teléfono / WhatsApp</label>
              <input
                type="text"
                className="form-input"
                placeholder="+591 70000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Monto de Cobro (Bs) *</label>
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
          </div>

          {/* Frecuencia y Día de pago */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Frecuencia *</label>
              <select
                className="form-select"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="DAILY">Diario</option>
                <option value="WEEKLY">Semanal</option>
                <option value="MONTHLY">Mensual</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                {frequency === 'WEEKLY'
                  ? 'Día de la semana'
                  : frequency === 'MONTHLY'
                  ? 'Día del mes (1-31)'
                  : 'Día de cobro'}
              </label>
              {frequency === 'WEEKLY' ? (
                <select
                  className="form-select"
                  value={paymentDay}
                  onChange={(e) => setPaymentDay(e.target.value)}
                >
                  <option value="">Cualquier día</option>
                  <option value="1">Lunes</option>
                  <option value="2">Martes</option>
                  <option value="3">Miércoles</option>
                  <option value="4">Jueves</option>
                  <option value="5">Viernes</option>
                  <option value="6">Sábado</option>
                  <option value="7">Domingo</option>
                </select>
              ) : frequency === 'MONTHLY' ? (
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="form-input"
                  placeholder="Ej: 5 (día del mes)"
                  value={paymentDay}
                  onChange={(e) => setPaymentDay(e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  disabled
                  className="form-input"
                  value="Cobro continuo diario"
                  style={{ opacity: 0.6 }}
                />
              )}
            </div>
          </div>

          {/* Fechas de inicio y próximo pago */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Fecha de Inicio *</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={handleStartDateChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Próximo Pago Programado *</label>
              <input
                type="date"
                className="form-input"
                value={nextPaymentDate}
                onChange={(e) => setNextPaymentDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="form-group">
            <label className="form-label">Observaciones</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Notas adicionales sobre el cliente o ubicación..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} disabled={loading} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: '130px' }}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{isEditing ? 'Guardar Cambios' : 'Crear Cliente'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
