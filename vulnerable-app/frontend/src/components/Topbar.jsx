import React from 'react';
import { Bell, CalendarDays, CircleDollarSign } from 'lucide-react';

const titles = {
  dashboard: 'Dashboard ejecutivo',
  clients: 'Gestion de clientes',
  invoices: 'Gestion de facturas',
  search: 'Busqueda global',
  uploads: 'Soportes de pago',
  admin: 'Panel administrativo',
  clientDetail: 'Detalle de cliente'
};

export default function Topbar({ screen, session }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Cuentas por cobrar</p>
        <h1>{titles[screen] || 'Cartera'}</h1>
      </div>
      <div className="topbar-actions">
        <span className="pill muted"><CalendarDays size={16} /> Corte operativo</span>
        <span className="pill success"><CircleDollarSign size={16} /> Local</span>
        <button className="ghost-icon" title="Notificaciones">
          <Bell size={18} />
        </button>
        <div className="profile-chip">
          <span>{session?.user?.fullName || session?.user?.username}</span>
        </div>
      </div>
    </header>
  );
}
