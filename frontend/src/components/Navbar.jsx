import React from 'react';
import { Menu, UserPlus, PlusCircle, Wallet } from 'lucide-react';

export default function Navbar({ onOpenMobileMenu, onNewClient, onNewPayment, title }) {
  return (
    <header
      className="navbar-header"
      style={{
        height: '60px',
        backgroundColor: 'rgba(14, 20, 36, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onOpenMobileMenu}
          className="btn btn-secondary btn-icon mobile-only"
          style={{ display: 'none', padding: '6px' }}
          aria-label="Abrir menú"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>
            {title}
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onNewClient}
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          title="Agregar nuevo cliente"
        >
          <UserPlus size={15} />
          <span className="desktop-btn-label">+ Cliente</span>
        </button>

        <button
          onClick={onNewPayment}
          className="btn btn-primary btn-sm"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          title="Registrar cobro rápido"
        >
          <PlusCircle size={15} />
          <span>Cobrar</span>
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .navbar-header {
            padding: 0 12px !important;
            height: 52px !important;
          }
          .mobile-only {
            display: inline-flex !important;
          }
          .sidebar {
            position: fixed !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            transform: translateX(-100%);
          }
          .sidebar-open {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </header>
  );
}
