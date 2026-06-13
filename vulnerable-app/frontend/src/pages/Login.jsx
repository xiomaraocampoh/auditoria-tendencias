import React, { useState } from 'react';
import { LockKeyhole, ShieldAlert } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    console.log('Login desde frontend:', username, password);
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (data.token) {
      localStorage.setItem('session', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      onLogin(data);
    } else {
      setError(data.error || 'Error desconocido');
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand-mark large"><LockKeyhole size={34} /></div>
        <p className="eyebrow">Sistema empresarial</p>
        <h1>CarteraPro Risk Lab</h1>
        <p>Gestion de clientes, facturas vencidas y soportes de pago en un entorno academico controlado.</p>
        <div className="login-stat">
          <strong>360</strong>
          <span>vista de cartera para analisis SAST y DAST</span>
        </div>
      </section>
      <form onSubmit={submit} className="login-card">
        <div>
          <p className="eyebrow">Acceso</p>
          <h2>Iniciar sesion</h2>
        </div>
        <label>Usuario<input value={username} onChange={(e) => setUsername(e.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button type="submit" className="primary-action"><LockKeyhole size={17} /> Entrar</button>
        <div className="lab-note"><ShieldAlert size={16} /> Laboratorio vulnerable local</div>
        {error && <div className="alert-box danger">{error}</div>}
      </form>
    </main>
  );
}
