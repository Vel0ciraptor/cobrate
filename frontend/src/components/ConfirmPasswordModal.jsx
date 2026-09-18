import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldAlert, Loader2 } from 'lucide-react';

export default function ConfirmPasswordModal({ isOpen, onClose, onConfirm, loading = false, error = '' }) {
  const [password, setPassword] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim() && !loading) {
      onConfirm(password.trim());
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--danger-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldAlert size={20} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              Confirmar Eliminación
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ padding: '6px' }} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          Ingresa tu contraseña de administrador para autorizar la eliminación de este cliente. Esta acción no se puede deshacer.
        </p>

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
            fontSize: '0.825rem',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Contraseña de Administrador
            </label>
            <input
              ref={inputRef}
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-danger" disabled={loading || !password.trim()}>
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Eliminando...</span>
                </>
              ) : (
                <span>Eliminar Cliente</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
