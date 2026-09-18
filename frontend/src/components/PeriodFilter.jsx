import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

export default function PeriodFilter({ period, setPeriod, customRange, setCustomRange, onApply }) {
  const [showCustomInputs, setShowCustomInputs] = useState(period === 'custom');

  const options = [
    { id: 'today', label: 'Hoy' },
    { id: 'week', label: 'Esta semana' },
    { id: 'month', label: 'Este mes' },
    { id: 'year', label: 'Este año' },
    { id: 'custom', label: 'Personalizado' },
  ];

  const handleSelect = (id) => {
    setPeriod(id);
    if (id === 'custom') {
      setShowCustomInputs(true);
    } else {
      setShowCustomInputs(false);
      if (onApply) onApply(id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '4px',
          flexWrap: 'wrap',
          gap: '4px',
        }}
      >
        {options.map((opt) => {
          const active = period === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: active ? 'var(--primary)' : 'transparent',
                color: active ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.825rem',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {showCustomInputs && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--bg-card)',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Desde:</span>
            <input
              type="date"
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              value={customRange.from}
              onChange={(e) => setCustomRange({ ...customRange, from: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hasta:</span>
            <input
              type="date"
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              value={customRange.to}
              onChange={(e) => setCustomRange({ ...customRange, to: e.target.value })}
            />
          </div>

          <button
            onClick={() => onApply && onApply('custom')}
            className="btn btn-primary btn-sm"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
