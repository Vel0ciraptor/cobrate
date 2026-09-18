import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Filter, Eye, Edit2, DollarSign, Trash2, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import ClientTable from '../components/ClientTable';
import ConfirmPasswordModal from '../components/ConfirmPasswordModal';
import { clientsService } from '../services/clients';
import { formatCurrency } from '../utils/formatters';
import { exportClientsToCSV } from '../utils/exportUtils';

export default function Clients({ onPayClient, onEditClient, onNewClient, onViewClient }) {
  const [clients, setClients] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // all, paid, pending, overdue
  const [activeFilter, setActiveFilter] = useState('true'); // 'true', 'false', 'all'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, client: null, loading: false, error: '' });

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientsService.getClients({
        status: statusFilter,
        search,
        active: activeFilter,
      });
      setClients(data);
    } catch (err) {
      console.error('Error cargando clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [statusFilter, activeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadClients();
  };

  const handleDeleteClick = (client) => {
    setDeleteModal({ open: true, client, loading: false, error: '' });
  };

  const handleDeleteConfirm = async (password) => {
    const client = deleteModal.client;
    setDeleteModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      await clientsService.deleteClient(client.id, password);
      setDeleteModal({ open: false, client: null, loading: false, error: '' });
      loadClients();
    } catch (err) {
      setDeleteModal(prev => ({ ...prev, loading: false, error: err.message || 'Error al eliminar cliente' }));
    }
  };

  const handleDeleteClose = () => {
    if (!deleteModal.loading) {
      setDeleteModal({ open: false, client: null, loading: false, error: '' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Primary Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
            Cartera de Clientes
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Administra los datos de clientes, frecuencias de cobro y deudas
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => exportClientsToCSV(clients, `Notas_Clientes_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`)}
            className="btn-export"
            title="Descargar clientes y estado de deuda en Excel/CSV"
          >
            <FileSpreadsheet size={16} />
            <span>Exportar Excel / CSV</span>
          </button>

          <button onClick={onNewClient} className="btn btn-primary">
            <UserPlus size={18} />
            <span>Agregar Cliente</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="glass-card"
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Search form */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '380px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            >
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '36px' }}
              placeholder="Buscar por nombre o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Buscar
          </button>
        </form>

        {/* State filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estado:</span>
            <select
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="overdue">Vencidos</option>
              <option value="paid">Al día / Pagados</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visibilidad:</span>
            <select
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="true">Solo Activos</option>
              <option value="false">Solo Inactivos</option>
              <option value="all">Ver Todos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <ClientTable
        clients={clients}
        onPay={onPayClient}
        onEdit={onEditClient}
        onView={onViewClient}
        onDelete={handleDeleteClick}
        emptyMessage="No se encontraron clientes con los filtros seleccionados."
      />

      {/* Password Confirmation Modal */}
      <ConfirmPasswordModal
        isOpen={deleteModal.open}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        loading={deleteModal.loading}
        error={deleteModal.error}
      />
    </div>
  );
}
