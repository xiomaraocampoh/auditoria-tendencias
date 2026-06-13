import React, { useEffect, useState } from 'react';
import { FileUp, Link2 } from 'lucide-react';
import { apiFetch, API_URL, uploadFile } from '../services/api';

export default function Uploads() {
  const [invoiceId, setInvoiceId] = useState('1');
  const [file, setFile] = useState(null);
  const [uploads, setUploads] = useState([]);

  async function load() {
    setUploads(await apiFetch('/api/uploads'));
  }

  useEffect(() => { load(); }, []);

  async function send(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('invoiceId', invoiceId);
    fd.append('support', file);
    await uploadFile(fd);
    load();
  }

  return (
    <section className="stack">
      <article className="card-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recaudo</p>
            <h2>Carga de soportes</h2>
          </div>
          <FileUp className="heading-icon" size={22} />
        </div>
        <form onSubmit={send} className="upload-form">
          <label>Factura ID<input value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} /></label>
          <label>Archivo soporte<input type="file" onChange={(e) => setFile(e.target.files[0])} /></label>
          <button className="primary-action">Subir soporte</button>
        </form>
      </article>
      <article className="card-panel">
        <h3>Archivos cargados</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Factura</th><th>Archivo</th><th>Usuario</th><th>Enlace</th></tr></thead>
            <tbody>
              {uploads.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.invoiceId}</td>
                  <td>{u.originalName}</td>
                  <td>{u.uploadedBy}</td>
                  <td><a className="table-link" href={API_URL + '/uploads/' + u.fileName} target="_blank"><Link2 size={16} /> Abrir</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
