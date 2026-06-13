import React, { useState } from 'react';
import { DatabaseZap, Search as SearchIcon } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function Search() {
  const [q, setQ] = useState('');
  const [number, setNumber] = useState('');
  const [results, setResults] = useState([]);

  async function clientSearch() {
    setResults(await apiFetch('/api/clients/search?q=' + q));
  }

  async function invoiceSearch() {
    setResults(await apiFetch('/api/invoices/search?number=' + number + '&min=0'));
  }

  return (
    <section className="stack">
      <article className="card-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Exploracion</p>
            <h2>Busqueda global</h2>
          </div>
          <DatabaseZap className="heading-icon" size={22} />
        </div>
        <div className="search-grid">
          <div className="search-box">
            <label>Clientes</label>
            <div className="inline">
              <input placeholder="Nombre, correo u observacion" value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="primary-action" onClick={clientSearch}><SearchIcon size={17} /> Buscar</button>
            </div>
          </div>
          <div className="search-box">
            <label>Facturas</label>
            <div className="inline">
              <input placeholder="Numero factura" value={number} onChange={(e) => setNumber(e.target.value)} />
              <button className="btn-soft" onClick={invoiceSearch}><SearchIcon size={17} /> Buscar</button>
            </div>
          </div>
        </div>
      </article>
      <article className="card-panel">
        <h3>Resultados</h3>
        <pre>{JSON.stringify(results, null, 2)}</pre>
      </article>
    </section>
  );
}
