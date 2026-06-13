const API_URL = import.meta.env.VITE_API_URL || '';
const SCAN_SESSION = {
  token: 'token-1-admin-admin',
  user: {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    email: 'admin@local.test',
    fullName: 'Administrador del Laboratorio'
  },
  message: 'Sesion automatica para escaneo DAST local'
};

export function getSession() {
  const raw = localStorage.getItem('session');
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.log('Sesion corrupta:', raw, e);
    return null;
  }
}

export function getInitialSession() {
  const params = new URLSearchParams(window.location.search);
  const scanMode = params.get('zap') === 'auto' || params.get('dast') === 'auto';
  if (scanMode) {
    localStorage.setItem('session', JSON.stringify(SCAN_SESSION));
    localStorage.setItem('token', SCAN_SESSION.token);
    localStorage.setItem('currentUser', JSON.stringify(SCAN_SESSION.user));
    return SCAN_SESSION;
  }
  return getSession();
}

export async function apiFetch(path, options = {}) {
  const session = getSession();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (session && session.token) {
    headers.Authorization = session.token;
  }
  console.log('Llamando API con sesion:', session);
  const response = await fetch(API_URL + path, { ...options, headers });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return { raw: text, parseError: e.message };
  }
}

export async function uploadFile(formData) {
  const session = getSession();
  return fetch(API_URL + '/api/uploads', {
    method: 'POST',
    headers: {
      Authorization: session ? session.token : ''
    },
    body: formData
  }).then((r) => r.json());
}

export { API_URL };
