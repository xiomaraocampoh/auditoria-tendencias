import React, { useEffect, useState } from 'react';
import { Eye, Plus, Search } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function Clients({ onOpenClient }) {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '<b>Nuevo cliente</b>', ownerUserId: 1, creditLimit: 0 });
  const [selected, setSelected] = useState('');

  async function load() {
    setClients(await apiFetch('/api/clients'));
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    await apiFetch('/api/clients', { method: 'POST', body: JSON.stringify(form) });
    setForm({ ...form, name: '', email: '' });
    load();
  }

  async function loadById() {
    const data = await apiFetch('/api/clients/' + selected);
    alert(JSON.stringify(data, null, 2));
  }

  return (
    <section className="content-grid wide-left">
      <form onSubmit={create} className="card-panel form-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CRM</p>
            <h2>Nuevo cliente</h2>
          </div>
          <Plus className="heading-icon" size={22} />
        </div>
        <div className="form-grid">
          <label>Nombre<input placeholder="Comercial Demo SAS" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Correo<input placeholder="contacto@empresa.test" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Telefono<input placeholder="555-1000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label>Direccion<input placeholder="Direccion comercial" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
          <label className="full">Observaciones<textarea rows="5" placeholder="Observaciones" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
          <label>Limite credito<input placeholder="5000000" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} /></label>
        </div>
        <button className="primary-action">Guardar cliente</button>
      </form>

      <div className="card-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Cartera</p>
            <h2>Clientes registrados</h2>
          </div>
        </div>
        <div className="inline toolbar">
          <input placeholder="ID cliente" value={selected} onChange={(e) => setSelected(e.target.value)} />
          <button className="btn-soft" onClick={loadById}><Search size={16} /> Consultar</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Cliente</th><th>Correo</th><th>Cupo</th><th>Notas</th><th></th></tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.email}</td>
                  <td>${Number(c.creditLimit || 0).toLocaleString()}</td>
                  <td><div className="notes-inline" dangerouslySetInnerHTML={{ __html: c.notes }} /></td>
                  <td><button className="icon-button table-action" onClick={() => onOpenClient(c.id)} title="Ver detalle"><Eye size={17} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
