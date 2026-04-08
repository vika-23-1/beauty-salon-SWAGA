const API_BASE = '';

async function apiRequest(method, url, data = null, token = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (token) options.headers['x-auth-token'] = token;
  if (data) options.body = JSON.stringify(data);
  const res = await fetch(API_BASE + url, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка сервера');
  return json;
}

const api = {
  register: (data) => apiRequest('POST', '/register', data),
  login: (data) => apiRequest('POST', '/login', data),
  getServices: (token) => apiRequest('GET', '/services', null, token),
  getMasters: (token) => apiRequest('GET', '/masters', null, token),
  getAppointments: (token) => apiRequest('GET', '/appointments', null, token),
  createAppointment: (data, token) => apiRequest('POST', '/appointments', data, token),
  deleteAppointment: (id, token) => apiRequest('DELETE', `/appointments/${id}`, null, token),
  addService: (data, token) => apiRequest('POST', '/services', data, token),
  deleteService: (id, token) => apiRequest('DELETE', `/services/${id}`, null, token),
  addMaster: (data, token) => apiRequest('POST', '/masters', data, token),
  deleteMaster: (id, token) => apiRequest('DELETE', `/masters/${id}`, null, token),
};
