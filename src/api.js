const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function api(ruta, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(base + ruta, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body)
  });
  const datos = await res.json().catch(() => ({}));
  if (res.status === 401 && ruta !== '/auth/login') {
    localStorage.clear();
    window.location.reload();
  }
  if (!res.ok) throw new Error(datos.error || 'No se pudo completar la operación');
  return datos;
}
