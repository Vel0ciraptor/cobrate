import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Search,
  RefreshCw,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import PeriodFilter from '../components/PeriodFilter';
import ClientTable from '../components/ClientTable';
import { dashboardService } from '../services/dashboard';
import { clientsService } from '../services/clients';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportClientsToCSV } from '../utils/exportUtils';

export default function Dashboard({ onPayClient, onEditClient, onViewClient }) {
  const [period, setPeriod] = useState('month');
  const [customRange, setCustomRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const [summary, setSummary] = useState(null);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'today', 'overdue'

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumData, clientsData] = await Promise.all([
        dashboardService.getSummary(
          period,
          period === 'custom' ? customRange.from : null,
          period === 'custom' ? customRange.to : null
        ),
        clientsService.getClients(),
      ]);
      setSummary(sumData);
      setClients(clientsData);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const handleApplyCustom = () => {
    loadData();
  };

  // Filtrado de clientes
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm));

    if (!matchesSearch) return false;

    if (activeTab === 'today') return c.is_due_today;
    if (activeTab === 'overdue') return c.is_overdue;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Header & Period Selector (Primer Panel) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Panel de Control
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Estado de cobranzas, morosidad y cobros del día
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => exportClientsToCSV(clients, `Notas_Resumen_${period}_${new Date().toISOString().split('T')[0]}.csv`)}
            className="btn-export"
            title="Descargar listado y deudas en formato compatible con Excel (.csv / .xls)"
          >
            <FileSpreadsheet size={15} />
            <span>Exportar Excel / CSV</span>
          </button>

          <PeriodFilter
            period={period}
            setPeriod={setPeriod}
            customRange={customRange}
            setCustomRange={setCustomRange}
            onApply={handleApplyCustom}
          />
        </div>
      </div>

      {/* 2. Urgent Alerts Chips (Compactos para Mobile y Desktop) */}
      {summary && (summary.overdue.count > 0 || summary.todayPayments.count > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: summary.overdue.count > 0 && summary.todayPayments.count > 0 ? 'repeat(auto-fit, minmax(240px, 1fr))' : '1fr', gap: '8px' }}>
          {summary.overdue.count > 0 && (
            <div
              onClick={() => setActiveTab('overdue')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: '#FECACA',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--danger)',
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.2 }}>
                    🔴 {summary.overdue.count} {summary.overdue.count === 1 ? 'cliente en mora' : 'clientes en mora'}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                    Deuda total: {formatCurrency(summary.overdue.amount)}
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(239, 68, 68, 0.25)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Cobrar <ArrowRight size={12} />
              </span>
            </div>
          )}

          {summary.todayPayments.count > 0 && (
            <div
              onClick={() => setActiveTab('today')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                color: '#FEF08A',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(245, 158, 11, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--warning)',
                    flexShrink: 0,
                  }}
                >
                  <Clock size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.2 }}>
                    🟡 {summary.todayPayments.count} {summary.todayPayments.count === 1 ? 'cobro para hoy' : 'cobros para hoy'}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                    Monto esperado: {formatCurrency(summary.todayPayments.amount)}
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(245, 158, 11, 0.25)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Ver <ArrowRight size={12} />
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. Grid de Tarjetas Principales (KPIs) */}
      <div
        className="kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px',
        }}
      >
        <DashboardCard
          title="Total Cobrado"
          value={formatCurrency(summary?.totalCollected || 0)}
          subtitle={`${summary?.periodPaymentsCount || 0} cobros`}
          icon={TrendingUp}
          color="success"
          badgeText={period.toUpperCase()}
          onClick={() => setActiveTab('all')}
        />

        <DashboardCard
          title="Deuda Pendiente"
          value={formatCurrency(summary?.totalPending || 0)}
          subtitle="Saldo total por cobrar"
          icon={DollarSign}
          color="warning"
          onClick={() => setActiveTab('all')}
        />

        <DashboardCard
          title="Vencidos en Mora"
          value={formatCurrency(summary?.overdue?.amount || 0)}
          subtitle={`${summary?.overdue?.count || 0} clientes atrasados`}
          icon={AlertTriangle}
          color="danger"
          badgeText={summary?.overdue?.count > 0 ? `${summary.overdue.count} moroso(s)` : '0'}
          onClick={() => setActiveTab('overdue')}
        />

        <DashboardCard
          title="Cobros de Hoy"
          value={formatCurrency(summary?.todayPayments?.amount || 0)}
          subtitle={`${summary?.todayPayments?.count || 0} cuotas pendientes`}
          icon={Calendar}
          color="warning"
          badgeText={summary?.todayPayments?.count > 0 ? `${summary.todayPayments.count} hoy` : '0'}
          onClick={() => setActiveTab('today')}
        />

        <DashboardCard
          title="Clientes Activos"
          value={summary?.activeClients || 0}
          subtitle="Cartera vigente"
          icon={Users}
          color="primary"
          onClick={() => setActiveTab('all')}
        />
      </div>

      {/* 4. Lista Principal en el Primer Panel (Con búsqueda y filtros en 1 toque) */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* Quick tab switcher with counts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('all')}
              className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
            >
              Todos ({clients.length})
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`btn btn-sm ${activeTab === 'today' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '6px 10px',
                fontSize: '0.8rem',
                ...(activeTab !== 'today' && summary?.todayPayments.count > 0 ? { borderColor: 'var(--warning)', color: 'var(--warning)' } : {}),
              }}
            >
              Hoy ({summary?.todayPayments.count || 0})
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`btn btn-sm ${activeTab === 'overdue' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '6px 10px',
                fontSize: '0.8rem',
                ...(activeTab !== 'overdue' && summary?.overdue.count > 0 ? { borderColor: 'var(--danger)', color: 'var(--danger)' } : {}),
              }}
            >
              Vencidos ({summary?.overdue.count || 0})
            </button>
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '260px' }}>
            <span
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            >
              <Search size={14} />
            </span>
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '32px', paddingRight: '10px', fontSize: '0.825rem', height: '36px' }}
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Client Table / High-Density Mobile Cards */}
        <ClientTable
          clients={filteredClients}
          onPay={onPayClient}
          onEdit={onEditClient}
          onView={onViewClient}
          emptyMessage={
            activeTab === 'overdue'
              ? '🎉 ¡No hay cobros vencidos en mora!'
              : activeTab === 'today'
              ? 'No hay cobros programados para el día de hoy.'
              : 'No se encontraron clientes.'
          }
        />
      </div>
    </div>
  );
}
