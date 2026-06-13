import React from 'react';
import {
  BarChart3,
  Building2,
  FileText,
  FolderUp,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldAlert
} from 'lucide-react';

export default function Nav({ screen, setScreen, session, logout }) {
  const isAdmin = session && session.user && session.user.role === 'admin';
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Building2 },
    { id: 'invoices', label: 'Facturas', icon: FileText },
    { id: 'search', label: 'Busqueda global', icon: Search },
    { id: 'uploads', label: 'Soportes', icon: FolderUp }
  ];
  if (isAdmin) {
    items.push({ id: 'admin', label: 'Administracion', icon: Settings });
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><BarChart3 size={24} /></div>
        <div>
          <strong>CarteraPro</strong>
          <span>Risk Lab</span>
        </div>
      </div>

      <div className="lab-warning">
        <ShieldAlert size={16} />
        <span>Ambiente local vulnerable</span>
      </div>

      <nav className="side-menu">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => setScreen(item.id)} className={screen === item.id ? 'active' : ''}>
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">{session?.user?.username?.substring(0, 2).toUpperCase()}</div>
        <div className="sidebar-user">
          <strong>{session?.user?.username}</strong>
          <span>{session?.user?.role}</span>
        </div>
        <button className="icon-button" onClick={logout} title="Salir">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
