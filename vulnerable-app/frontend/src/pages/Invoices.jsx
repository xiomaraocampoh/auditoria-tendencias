import React, { useEffect, useState } from 'react';
import { AlertTriangle, FilePlus2, Filter } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [form, setForm] = useState({ clientId: 1, invoiceNumber: 'FAC-', amount: 1000, dueDate: '2025-12-01', status: 'open', comments: '' });

  async function load() {
    setInvoices(await apiFetch('/api/invoices'));
    setOverdue(await apiFetch('/api/invoices/overdue'));
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    await apiFetch('/api/invoices', { method: 'POST', body: JSON.stringify(form) });
    load();
  }

  function statusBadge(status, dueDate) {
    const isOverdue = status !== 'paid' && dueDate < new Date().toISOString().substring(0, 10);
    if (isOverdue || status === 'overdue') return <span className="badge-status overdue">Vencida</span>;
    if (status === 'paid') return <span className="badge-status paid">Pagada</span>;
    return <span className="badge-status pending">Pendiente</span>;
  }

  return (
    <section className="stack">
      <div className="content-grid wide-left">
        <form onSubmit={create} className="card-panel form-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Facturacion</p>
              <h2>Registrar factura</h2>
            </div>
            <FilePlus2 className="heading-icon" size={22} />
          </div>
          <div className="form-grid">
            <label>Cliente ID<input placeholder="Cliente ID" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} /></label>
            <label>Numero<input placeholder="FAC-004" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} /></label>
            <label>Valor<input placeholder="1000000" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
            <label>Vencimiento<input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
            <label>Estado<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="open">Abierta</option>
            <option value="overdue">Vencida</option>
            <option value="paid">Pagada</option>
            </select></label>
            <label className="full">Comentarios<textarea placeholder="Comentarios" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} /></label>
          </div>
          <button className="primary-action">Guardar factura</button>
        </form>

        <article className="card-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Riesgo de mora</p>
              <h2>Facturas vencidas</h2>
            </div>
            <AlertTriangle className="heading-icon warning" size={22} />
          </div>
          <div className="table-wrap compact">
            <table className="data-table">
              <thead><tr><th>Factura</th><th>Cliente</th><th>Valor</th><th>Vence</th></tr></thead>
              <tbody>
                {overdue.map((i) => (
                  <tr key={i.id}><td>{i.invoiceNumber}</td><td>{i.clientName}</td><td>${Number(i.amount || 0).toLocaleString()}</td><td>{i.dueDate}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <article className="card-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Operaciones</p>
            <h2>Todas las facturas</h2>
          </div>
          <span className="pill muted"><Filter size={16} /> filtros visuales</span>
        </div>
        <div className="status-filter">
          <span className="badge-status pending">Pendientes</span>
          <span className="badge-status overdue">Vencidas</span>
          <span className="badge-status paid">Pagadas</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Factura</th><th>Cliente</th><th>Valor</th><th>Vencimiento</th><th>Estado</th><th>Comentarios</th></tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td><strong>{i.invoiceNumber}</strong></td>
                  <td>{i.clientName || i.clientId}</td>
                  <td>${Number(i.amount || 0).toLocaleString()}</td>
                  <td>{i.dueDate}</td>
                  <td>{statusBadge(i.status, i.dueDate)}</td>
                  <td>{i.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
