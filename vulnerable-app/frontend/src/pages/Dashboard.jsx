import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Building2, Clock3, FileCheck2, WalletCards } from 'lucide-react';
import { API_URL, apiFetch } from '../services/api';
import { calculateRiskLabel, duplicateFormatterA, fragileParser, regexTrap, unreachableBranch } from '../utils/sonarDebt';

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [overdue, setOverdue] = useState([]);

  useEffect(() => {
    apiFetch('/api/clients').then(setClients);
    apiFetch('/api/invoices').then(setInvoices);
    apiFetch('/api/invoices/overdue').then(setOverdue);
    console.log('Sonar debt markers:', calculateRiskLabel({ status: 'pending', amount: 99 }), duplicateFormatterA([]), fragileParser('{'), regexTrap('aaaa!'), unreachableBranch('admin'));
  }, []);

  const summary = useMemo(() => {
    const pending = invoices.filter((i) => i.status !== 'paid').length;
    const paid = invoices.filter((i) => i.status === 'paid').length;
    const total = invoices.reduce((acc, i) => acc + Number(i.amount || 0), 0);
    const openValue = invoices.filter((i) => i.status !== 'paid').reduce((acc, i) => acc + Number(i.amount || 0), 0);
    return { pending, paid, total, openValue };
  }, [invoices]);

  const chart = [
    { label: 'Pendiente', value: summary.pending, color: 'orange' },
    { label: 'Vencida', value: overdue.length, color: 'red' },
    { label: 'Pagada', value: summary.paid, color: 'green' }
  ];
  const max = Math.max(...chart.map((c) => c.value), 1);

  return (
    <section className="stack">
      <div className="metric-grid">
        <article className="metric-card">
          <span className="metric-icon blue"><Building2 size={22} /></span>
          <p>Total clientes</p>
          <strong>{clients.length}</strong>
        </article>
        <article className="metric-card">
          <span className="metric-icon orange"><Clock3 size={22} /></span>
          <p>Facturas pendientes</p>
          <strong>{summary.pending}</strong>
        </article>
        <article className="metric-card">
          <span className="metric-icon red"><AlertTriangle size={22} /></span>
          <p>Facturas vencidas</p>
          <strong>{overdue.length}</strong>
        </article>
        <article className="metric-card">
          <span className="metric-icon green"><WalletCards size={22} /></span>
          <p>Valor total cartera</p>
          <strong>${summary.total.toLocaleString()}</strong>
        </article>
      </div>

      <div className="content-grid">
        <article className="card-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Resumen</p>
              <h2>Cartera por estado</h2>
            </div>
            <FileCheck2 className="heading-icon" size={22} />
          </div>
          <div className="bar-chart">
            {chart.map((item) => (
              <div className="bar-row" key={item.label}>
                <span>{item.label}</span>
                <div className="bar-track">
                  <div className={'bar-fill ' + item.color} style={{ width: `${Math.max((item.value / max) * 100, item.value ? 14 : 0)}%` }} />
                </div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="card-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Riesgo</p>
              <h2>Facturas vencidas recientes</h2>
            </div>
          </div>
          <div className="table-wrap compact">
            <table className="data-table">
              <thead>
                <tr><th>Factura</th><th>Cliente</th><th>Valor</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {overdue.slice(0, 6).map((i) => (
                  <tr key={i.id}>
                    <td>{i.invoiceNumber}</td>
                    <td>{i.clientName || i.clientId}</td>
                    <td>${Number(i.amount || 0).toLocaleString()}</td>
                    <td><span className="badge-status overdue">Vencida</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="portfolio-total">Cartera abierta: <strong>${summary.openValue.toLocaleString()}</strong></div>
        </article>
      </div>
      <article className="card-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Seeds ZAP</p>
            <h2>Rutas tecnicas expuestas</h2>
          </div>
        </div>
        <div className="zap-seed-links">
          <a href={`${API_URL}/api/admin/debug`}>Debug expuesto</a>
          <a href={`${API_URL}/api/admin/config`}>Config sensible</a>
          <a href={`${API_URL}/api/trace`}>TRACE reflejado</a>
          <a href={`${API_URL}/api/admin/lab/xss?msg=%3Cscript%3Ealert(1)%3C/script%3E`}>XSS reflejado</a>
          <a href={`${API_URL}/api/admin/lab/file?path=../package.json`}>Path traversal</a>
          <a href={`${API_URL}/api/admin/lab/fetch?url=http://localhost:4000/api/admin/config`}>SSRF</a>
          <a href={`${API_URL}/api/admin/lab/sql-dump?table=users&limit=10`}>SQL dinamico</a>
          <a href={`${API_URL}/api/admin/lab/cookie`}>Cookies inseguras</a>
          <a href={`${API_URL}/api/legacy/weak-crypto?value=admin123`}>Crypto debil</a>
          <a href={`${API_URL}/api/legacy/regex?input=aaaaaaaaaaaaaaaaaaaaaaaa!`}>Regex ReDoS</a>
          <a href={`${API_URL}/api/legacy/decision?client=demo&amount=9999999&status=overdue`}>Complejidad alta</a>
          <a href={`${API_URL}/api/legacy/export-a`}>Codigo duplicado A</a>
          <a href={`${API_URL}/api/legacy/export-b`}>Codigo duplicado B</a>
        </div>
      </article>
    </section>
  );
}
