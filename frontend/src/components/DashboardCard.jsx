import React from 'react';

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary', // 'primary', 'success', 'warning', 'danger'
  badgeText,
  onClick,
}) {
  const colorMap = {
    primary: {
      bg: 'rgba(79, 70, 229, 0.15)',
      border: 'rgba(79, 70, 229, 0.3)',
      icon: '#6366F1',
      glow: 'rgba(79, 70, 229, 0.2)',
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.3)',
      icon: '#10B981',
      glow: 'rgba(16, 185, 129, 0.2)',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.3)',
      icon: '#F59E0B',
      glow: 'rgba(245, 158, 11, 0.2)',
    },
    danger: {
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.3)',
      icon: '#EF4444',
      glow: 'rgba(239, 68, 68, 0.2)',
    },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div
      className="glass-card kpi-card"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        background: `linear-gradient(180deg, var(--bg-card) 0%, rgba(17, 24, 39, 0.95) 100%)`,
        padding: '14px 16px',
      }}
    >
      {/* Top row: Title and Icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: scheme.bg,
              border: `1px solid ${scheme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: scheme.icon,
              flexShrink: 0,
            }}
          >
            <Icon size={17} />
          </div>
        )}
      </div>

      {/* Main value */}
      <div>
        <div
          style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
          className="tabular-nums"
        >
          {value}
        </div>
      </div>

      {/* Bottom details */}
      {(subtitle || badgeText) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '4px',
          }}
        >
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {subtitle}
          </span>
          {badgeText && (
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: scheme.bg,
                color: scheme.icon,
                border: `1px solid ${scheme.border}`,
                whiteSpace: 'nowrap',
              }}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
