import React, { useEffect, useState } from 'react';
import { Bug, ExternalLink, ServerCog, UsersRound } from 'lucide-react';
import { API_URL, apiFetch } from '../services/api';

export default function Admin() {
  const [panel, setPanel] = useState({});
  const [config, setConfig] = useState({});

  useEffect(() => {
    apiFetch('/api/admin/panel').then(setPanel);
    apiFetch('/api/admin/config').then(setConfig);
    apiFetch('/api/admin/debug').then((d) => console.log('Debug backend:', d));
  }, []);

  return (
    <section className="stack">
      <div className="metric-grid three">
        <article className="metric-card"><span className="metric-icon blue"><UsersRound size={22} /></span><p>Usuarios</p><strong>{panel.users?.length || 0}</strong></article>
        <article className="metric-card"><span className="metric-icon green"><ServerCog size={22} /></span><p>Clientes</p><strong>{panel.clients?.length || 0}</strong></article>
        <article className="metric-card"><span className="metric-icon orange"><ServerCog size={22} /></span><p>Facturas</p><strong>{panel.invoices?.length || 0}</strong></article>
      </div>
      <div className="content-grid">
        <article className="card-panel">
          <div className="section-heading"><div><p className="eyebrow">Sistema</p><h2>Configuracion expuesta</h2></div></div>
          <pre>{JSON.stringify(config, null, 2)}</pre>
        </article>
        <article className="card-panel">
          <div className="section-heading"><div><p className="eyebrow">Accesos</p><h2>Usuarios</h2></div></div>
          <pre>{JSON.stringify(panel.users, null, 2)}</pre>
        </article>
      </div>
      <article className="card-panel">
        <div className="section-heading">
          <div><p className="eyebrow">DAST</p><h2>Superficie vulnerable rastreable</h2></div>
          <Bug className="heading-icon warning" size={22} />
        </div>
        <div className="vuln-grid">
          <form method="GET" action={`${API_URL}/api/admin/lab/xss`} className="mini-lab-form">
            <label>Reflected XSS<input name="msg" defaultValue={'<script>alert("zap")</script>'} /></label>
            <button className="btn-soft">Enviar</button>
          </form>
          <form method="GET" action={`${API_URL}/api/admin/lab/redirect`} className="mini-lab-form">
            <label>Open redirect<input name="next" defaultValue="http://example.com" /></label>
            <button className="btn-soft">Redirigir</button>
          </form>
          <form method="GET" action={`${API_URL}/api/admin/lab/file`} className="mini-lab-form">
            <label>Path traversal<input name="path" defaultValue="../package.json" /></label>
            <button className="btn-soft">Leer archivo</button>
          </form>
          <form method="GET" action={`${API_URL}/api/admin/lab/cmd`} className="mini-lab-form">
            <label>Command injection<input name="cmd" defaultValue="whoami" /></label>
            <button className="btn-soft">Ejecutar</button>
          </form>
          <form method="GET" action={`${API_URL}/api/admin/lab/fetch`} className="mini-lab-form">
            <label>SSRF<input name="url" defaultValue="http://localhost:4000/api/admin/config" /></label>
            <button className="btn-soft">Solicitar URL</button>
          </form>
          <form method="GET" action={`${API_URL}/api/admin/lab/sql-dump`} className="mini-lab-form">
            <label>SQL dinamico<input name="table" defaultValue="users" /></label>
            <input name="limit" defaultValue="10" />
            <button className="btn-soft">Consultar</button>
          </form>
          <form method="GET" action={`${API_URL}/api/admin/lab/eval`} className="mini-lab-form">
            <label>Eval inseguro<input name="code" defaultValue="process.env.JWT_SECRET" /></label>
            <button className="btn-soft">Evaluar</button>
          </form>
          <a className="lab-link" href={`${API_URL}/api/admin/lab/cookie`} target="_blank">
            <ExternalLink size={16} /> Crear cookies inseguras
          </a>
          <a className="lab-link" href={`${API_URL}/api/admin/lab/headers?user=admin`} target="_blank">
            <ExternalLink size={16} /> Reflejar headers y query
          </a>
        </div>
      </article>
    </section>
  );
}
