import React from 'react';
import { LayoutDashboard, Users, CreditCard, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentTab, setTab, isOpen, onClose }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'payments', label: 'Historial de Pagos', icon: CreditCard },
  ];

  const handleNav = (tabId) => {
    setTab(tabId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 90,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: '#0E1424',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transition: 'transform 0.3s ease',
          ...(isOpen
            ? { position: 'fixed', top: 0, bottom: 0, left: 0 }
            : {}),
        }}
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '24px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 15px rgba(79, 70, 229, 0.4)',
            }}
          >
            <Wallet size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
              Notas
            </h1>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Gestión de Cobros
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: active ? 'var(--primary)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: 'var(--primary)',
                fontSize: '0.9rem',
              }}
            >
              {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.username || 'Administrador'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--success)' }}>En línea</div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Cerrar sesión"
            className="btn btn-secondary btn-icon"
            style={{ padding: '8px', color: 'var(--text-secondary)' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
