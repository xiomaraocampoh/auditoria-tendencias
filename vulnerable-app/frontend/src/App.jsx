import React, { useState } from 'react';
import Login from './pages/Login.jsx';
import Clients from './pages/Clients.jsx';
import Invoices from './pages/Invoices.jsx';
import Search from './pages/Search.jsx';
import Admin from './pages/Admin.jsx';
import Uploads from './pages/Uploads.jsx';
import Nav from './components/Nav.jsx';
import Topbar from './components/Topbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ClientDetail from './pages/ClientDetail.jsx';
import { getInitialSession } from './services/api';

export default function App() {
  const [session, setSession] = useState(getInitialSession());
  const [screen, setScreen] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(null);

  function logout() {
    localStorage.removeItem('session');
    setSession(null);
  }

  function openClient(id) {
    setSelectedClientId(id);
    setScreen('clientDetail');
  }

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  return (
    <div className="app-shell">
      <Nav screen={screen} setScreen={setScreen} session={session} logout={logout} />
      <div className="workspace">
        <Topbar screen={screen} session={session} />
        <main className="container-fluid app-content">
        {screen === 'dashboard' && <Dashboard />}
        {screen === 'clients' && <Clients onOpenClient={openClient} />}
        {screen === 'clientDetail' && <ClientDetail clientId={selectedClientId} back={() => setScreen('clients')} />}
        {screen === 'invoices' && <Invoices />}
        {screen === 'search' && <Search />}
        {screen === 'uploads' && <Uploads />}
        {screen === 'admin' && <Admin />}
        </main>
      </div>
    </div>
  );
}
