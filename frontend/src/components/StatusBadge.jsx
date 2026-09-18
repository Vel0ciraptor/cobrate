import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const normalized = (status || '').toUpperCase();

  switch (normalized) {
    case 'PAID':
    case 'PAGADO':
      return (
        <span className="badge badge-paid">
          <CheckCircle2 size={13} />
          Pagado
        </span>
      );

    case 'OVERDUE':
    case 'VENCIDO':
      return (
        <span className="badge badge-overdue">
          <AlertCircle size={13} />
          Vencido
        </span>
      );

    case 'PENDING':
    case 'PENDIENTE':
    default:
      return (
        <span className="badge badge-pending">
          <Clock size={13} />
          Pendiente
        </span>
      );
  }
}
