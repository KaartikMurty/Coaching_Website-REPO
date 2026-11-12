const BASE = import.meta.env.VITE_API_URL || '/api';
export const getToken = () => { try { return localStorage.getItem('token'); } catch { return null; } };
export const setToken = t => { try { t ? localStorage.setItem('token', t) : localStorage.removeItem('token'); } catch {} };

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const t = getToken();
  if (t) headers.Authorization = 'Bearer ' + t;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || 'Request failed');
  }
  return res;
}
export const json = async (...a) => (await api(...a)).json();

export async function download(id, name) {
  const blob = await (await api(`/materials/${id}/file`)).blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
