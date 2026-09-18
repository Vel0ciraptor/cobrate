-- Esquema DDL para el Sistema de Gestión de Cobros

-- Tabla de usuarios administrativos
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    amount NUMERIC(12,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY')),
    payment_day INTEGER,
    start_date DATE NOT NULL,
    next_payment_date DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    amount NUMERIC(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    period_start DATE,
    period_end DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices de optimización de consultas
CREATE INDEX IF NOT EXISTS idx_clients_next_payment ON clients(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(active);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
