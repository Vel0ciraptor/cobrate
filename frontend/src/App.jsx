import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Payments from './pages/Payments';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ClientModal from './components/ClientModal';
import PaymentModal from './components/PaymentModal';
import { clientsService } from './services/clients';
import {
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  UserPlus,
} from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payingClient, setPayingClient] = useState(null);
  const [allClientsForModal, setAllClientsForModal] = useState([]);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Cargar lista de clientes para el modal de pago global
  const loadClientsForModal = async () => {
    try {
      const data = await clientsService.getClients({ active: 'true' });
      setAllClientsForModal(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Handlers
  const handleOpenNewClient = () => {
    setEditingClient(null);
    setIsClientModalOpen(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  };

  const handleOpenNewPayment = async (client = null) => {
    setPayingClient(client);
    await loadClientsForModal();
    setIsPaymentModalOpen(true);
  };

  const handleViewClient = (client) => {
    setSelectedClientId(client.id);
    setCurrentTab('client-details');
  };

  const handleClientSaved = (savedClient) => {
    showToast(
      editingClient
        ? `✓ Cliente "${savedClient.name}" actualizado correctamente`
        : `✓ Cliente "${savedClient.name}" creado exitosamente`
    );
    // Refrescar vista si es necesario
  };

  const handlePaymentSuccess = (paymentRes) => {
    showToast(`✓ Pago registrado correctamente para ${paymentRes.client?.name || 'el cliente'}`);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-main)',
          color: 'var(--text-secondary)',
        }}
      >
        Iniciando Notas...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard General';
      case 'clients':
        return 'Gestión de Clientes';
      case 'client-details':
        return 'Ficha del Cliente';
      case 'payments':
        return 'Auditoría de Pagos';
      default:
        return 'Notas';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar (Desktop) */}
      <Sidebar
        currentTab={currentTab}
        setTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'client-details') setSelectedClientId(null);
        }}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Area */}
      <div className="main-content">
        <Navbar
          title={getPageTitle()}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNewClient={handleOpenNewClient}
          onNewPayment={() => handleOpenNewPayment(null)}
        />

        <main className="page-body">
          {currentTab === 'dashboard' && (
            <Dashboard
              key={toast?.message}
              onPayClient={(c) => handleOpenNewPayment(c)}
              onEditClient={handleEditClient}
              onViewClient={handleViewClient}
              onNewClient={handleOpenNewClient}
            />
          )}

          {currentTab === 'clients' && (
            <Clients
              key={toast?.message}
              onPayClient={(c) => handleOpenNewPayment(c)}
              onEditClient={handleEditClient}
              onNewClient={handleOpenNewClient}
              onViewClient={handleViewClient}
            />
          )}

          {currentTab === 'client-details' && (
            <ClientDetails
              key={toast?.message}
              clientId={selectedClientId}
              onBack={() => setCurrentTab('clients')}
              onPay={(c) => handleOpenNewPayment(c)}
              onEdit={handleEditClient}
            />
          )}

          {currentTab === 'payments' && (
            <Payments
              key={toast?.message}
              onNewPayment={() => handleOpenNewPayment(null)}
              onViewClient={handleViewClient}
            />
          )}
        </main>
      </div>

      {/* Floating Action Buttons en la parte inferior derecha (Mobile) */}
      <div className="mobile-floating-actions">
        <button
          onClick={handleOpenNewClient}
          className="fab-btn fab-btn-client"
          title="Agregar nuevo cliente"
        >
          <UserPlus size={16} />
          <span>+ Cliente</span>
        </button>

        <button
          onClick={() => handleOpenNewPayment(null)}
          className="fab-btn fab-btn-pay"
          title="Registrar cobro"
        >
          <DollarSign size={18} />
          <span>Cobrar</span>
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar - Todos los botones con aspecto idéntico */}
      <nav className="mobile-bottom-bar">
        <button
          className={`mobile-nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => {
            setCurrentTab('dashboard');
            setSelectedClientId(null);
          }}
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </button>

        <button
          className={`mobile-nav-btn ${currentTab === 'clients' || currentTab === 'client-details' ? 'active' : ''}`}
          onClick={() => {
            setCurrentTab('clients');
            setSelectedClientId(null);
          }}
        >
          <Users size={19} />
          <span>Clientes</span>
        </button>

        <button
          className={`mobile-nav-btn ${currentTab === 'payments' ? 'active' : ''}`}
          onClick={() => {
            setCurrentTab('payments');
            setSelectedClientId(null);
          }}
        >
          <CreditCard size={19} />
          <span>Pagos</span>
        </button>
      </nav>

      {/* Modals */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        client={editingClient}
        onSaved={handleClientSaved}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        client={payingClient}
        clients={allClientsForModal}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Toast Notification (Sección 11) */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
