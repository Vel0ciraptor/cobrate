import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || 'Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-main)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow decorative circles */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-card"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '36px 32px',
          position: 'relative',
          zIndex: 1,
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              backgroundColor: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '16px',
              boxShadow: '0 0 25px rgba(79, 70, 229, 0.5)',
            }}
          >
            <Wallet size={30} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
            Notas
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Acceso administrativo al sistema de cobros y notas financieras
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: 'var(--danger-bg)',
              color: '#FECACA',
              border: '1px solid var(--danger-border)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              >
                <User size={18} />
              </span>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '40px' }}
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              >
                <Lock size={18} />
              </span>
              <input
                type="password"
                className="form-input"
                style={{ width: '100%', paddingLeft: '40px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <span>Ingresar al Sistema</span>
            )}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Credenciales por defecto: <strong>admin</strong> / <strong>admin123</strong>
        </div>
      </div>
    </div>
  );
}
