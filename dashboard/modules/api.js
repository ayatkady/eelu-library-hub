const BASE = window.__API_BASE__ || 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('adminToken') || null;
}

function headers() {
  const h = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
}

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const opts = Object.assign({ headers: headers(), credentials: 'include' }, options);
  try {
    const res = await fetch(url, opts);
    if (res.status === 401) {
      // Token expired or invalid — force logout
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      document.dispatchEvent(new Event('auth:expired'));
      throw new Error('Session expired. Please login again.');
    }
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || res.statusText || 'Request failed');
    }
    return await res.json().catch(() => null);
  } catch (err) {
    console.error('API request error', url, err);
    throw err;
  }
}

export const api = {
  get:  (p)        => request(p, { method: 'GET' }),
  post: (p, body)  => request(p, { method: 'POST',  body: JSON.stringify(body) }),
  put:  (p, body)  => request(p, { method: 'PUT',   body: JSON.stringify(body) }),
  patch:(p, body)  => request(p, { method: 'PATCH', body: JSON.stringify(body) }),
  del:  (p)        => request(p, { method: 'DELETE' }),
};
