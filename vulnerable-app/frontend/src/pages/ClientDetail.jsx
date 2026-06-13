import React, { useEffect, useState } from 'react';
import { ArrowLeft, Mail, MapPin, Phone, Save } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function ClientDetail({ clientId, back }) {
  const [client, setClient] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!clientId) return;
    apiFetch('/api/clients/' + clientId).then((data) => {
      setClient(data);
      setNotes(data.notes || '');
    });
  }, [clientId]);

  async function saveNotes() {
    await apiFetch('/api/clients/' + clientId + '/notes', {
      method: 'PUT',
      body: JSON.stringify({ notes })
    });
    const data = await apiFetch('/api/clients/' + clientId);
    setClient(data);
  }

  if (!client) {
    return <section className="card-panel">Cargando detalle...</section>;
  }

  return (
    <section className="stack">
      <button className="btn-soft fit" onClick={back}><ArrowLeft size={17} /> Volver</button>
      <div className="client-hero">
        <div>
          <p className="eyebrow">Cliente #{client.id}</p>
          <h2>{client.name}</h2>
          <div className="client-meta">
            <span><Mail size={16} /> {client.email}</span>
            <span><Phone size={16} /> {client.phone}</span>
            <span><MapPin size={16} /> {client.address}</span>
          </div>
        </div>
        <div className="credit-box">
          <span>Cupo aprobado</span>
          <strong>${Number(client.creditLimit || 0).toLocaleString()}</strong>
        </div>
      </div>
      <div className="content-grid">
        <article className="card-panel">
          <h3>Observaciones registradas</h3>
          <div className="notes-preview" dangerouslySetInnerHTML={{ __html: client.notes }} />
        </article>
        <article className="card-panel">
          <h3>Actualizar observaciones</h3>
          <textarea rows="8" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button className="primary-action" onClick={saveNotes}><Save size={17} /> Guardar observacion</button>
        </article>
      </div>
    </section>
  );
}
