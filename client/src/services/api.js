const BASE_URL = `http://${window.location.hostname}:5000/api`;

export const authApi = {
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

async function request(path, options = {}) {
  const token = localStorage.getItem('afsys_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { headers, ...options });
  if (res.status === 401 && !path.includes('/auth/login')) {
    localStorage.removeItem('afsys_token');
    localStorage.removeItem('afsys_user');
    window.location.reload();
    return;
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const tariffApi = {
  getAll: () => request('/tariff'),
  create: (body) => request('/tariff', { method: 'POST', body: JSON.stringify(body) }),
  update: (company, code, body) => request(`/tariff/${company}/${code}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (company, code) => request(`/tariff/${company}/${code}`, { method: 'DELETE' }),
};

export const vesselApi = {
  getAll: () => request('/vessels'),
  create: (body) => request('/vessels', { method: 'POST', body: JSON.stringify(body) }),
  update: (company, code, body) => request(`/vessels/${company}/${code}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (company, code) => request(`/vessels/${company}/${code}`, { method: 'DELETE' }),
};

export const lineApi = {
  getAll: () => request('/lines'),
  getOne: (code) => request(`/lines/${code}`),
  create: (body) => request('/lines', { method: 'POST', body: JSON.stringify(body) }),
  update: (code, body) => request(`/lines/${code}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (code) => request(`/lines/${code}`, { method: 'DELETE' }),
};

export const countryApi = {
  getAll: () => request('/countries'),
  getOne: (code) => request(`/countries/${code}`),
  create: (body) => request('/countries', { method: 'POST', body: JSON.stringify(body) }),
  update: (code, body) => request(`/countries/${code}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (code) => request(`/countries/${code}`, { method: 'DELETE' }),
};

export const currencyApi = {
  getAll: () => request('/currencies'),
  getOne: (company, code) => request(`/currencies/${company}/${code}`),
  create: (body) => request('/currencies', { method: 'POST', body: JSON.stringify(body) }),
  update: (company, code, body) => request(`/currencies/${company}/${code}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (company, code) => request(`/currencies/${company}/${code}`, { method: 'DELETE' }),
};

export const officeApi = {
  getAll: () => request('/offices'),
  getOne: (company, serial) => request(`/offices/${company}/${serial}`),
  create: (body) => request('/offices', { method: 'POST', body: JSON.stringify(body) }),
  update: (company, serial, body) => request(`/offices/${company}/${serial}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (company, serial) => request(`/offices/${company}/${serial}`, { method: 'DELETE' }),
};

export const userApi = {
  getAll: () => request('/users'),
  getOne: (code) => request(`/users/${code}`),
  create: (body) => request('/users', { method: 'POST', body: JSON.stringify(body) }),
  update: (code, body) => request(`/users/${code}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (code) => request(`/users/${code}`, { method: 'DELETE' }),
};

export const vesselCallApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const qs = params.toString();
    return request(qs ? `/vessel-calls?${qs}` : '/vessel-calls');
  },
  getOne: (company, refno) => request(`/vessel-calls/${company}/${refno}`),
  create: (body) => request('/vessel-calls', { method: 'POST', body: JSON.stringify(body) }),
  update: (company, refno, body) => request(`/vessel-calls/${company}/${refno}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (company, refno) => request(`/vessel-calls/${company}/${refno}`, { method: 'DELETE' }),
};

export const arMasterApi = {
  getAll: () => request('/ar-master'),
  getOne: (code) => request(`/ar-master/${code}`),
  create: (body) => request('/ar-master', { method: 'POST', body: JSON.stringify(body) }),
  update: (code, body) => request(`/ar-master/${code}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (code) => request(`/ar-master/${code}`, { method: 'DELETE' }),
};

export const basisMasterApi = {
  getAll: () => request('/basis-master'),
  create: (body) => request('/basis-master', { method: 'POST', body: JSON.stringify(body) }),
  update: (code, body) => request(`/basis-master/${code}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (code) => request(`/basis-master/${code}`, { method: 'DELETE' }),
};

export const dashboardApi = {
  get: () => request('/dashboard'),
};

export const supplyInquiryApi = {
  search: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return request(`/supply-inquiry?${params.toString()}`);
  },
};

export const supplyDetailsApi = {
  getByArCode: (arCode) => request(`/supply-details/by-party/${encodeURIComponent(arCode)}`),
  getByCall: (company, refno, party) => request(`/supply-details/${company}/${refno}${party ? `?party=${encodeURIComponent(party)}` : ''}`),
  create: (body) => request('/supply-details', { method: 'POST', body: JSON.stringify(body) }),
  update: (ctid, body) => request(`/supply-details/${encodeURIComponent(ctid)}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (ctid) => request(`/supply-details/${encodeURIComponent(ctid)}`, { method: 'DELETE' }),
};

export const docTypeMasterApi = {
  getAll: (module) => request(module ? `/doc-type-master?module=${encodeURIComponent(module)}` : '/doc-type-master'),
  getOne: (company, code) => request(`/doc-type-master/${company}/${code}`),
  create: (body) => request('/doc-type-master', { method: 'POST', body: JSON.stringify(body) }),
  update: (company, code, body) => request(`/doc-type-master/${company}/${code}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (company, code) => request(`/doc-type-master/${company}/${code}`, { method: 'DELETE' }),
};

export const arInvoiceApi = {
  getLov: () => request('/ar-invoice/lov'),
  nextDocNumber: () => request('/ar-invoice/next-doc-number'),
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const qs = params.toString();
    return request(qs ? `/ar-invoice?${qs}` : '/ar-invoice');
  },
  getOne: (company, docType, docNumber) => request(`/ar-invoice/${company}/${docType}/${encodeURIComponent(docNumber)}`),
  create: (body) => request('/ar-invoice', { method: 'POST', body: JSON.stringify(body) }),
  update: (company, docType, docNumber, body) => request(`/ar-invoice/${company}/${docType}/${encodeURIComponent(docNumber)}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (company, docType, docNumber) => request(`/ar-invoice/${company}/${docType}/${encodeURIComponent(docNumber)}`, { method: 'DELETE' }),
  addLine: (company, docType, docNumber, body) => request(`/ar-invoice/${company}/${docType}/${encodeURIComponent(docNumber)}/lines`, { method: 'POST', body: JSON.stringify(body) }),
  addLines: (company, docType, docNumber, lines) => request(`/ar-invoice/${company}/${docType}/${encodeURIComponent(docNumber)}/lines/batch`, { method: 'POST', body: JSON.stringify({ lines }) }),
  updateLine: (company, docType, docNumber, serial, body) => request(`/ar-invoice/${company}/${docType}/${encodeURIComponent(docNumber)}/lines/${serial}`, { method: 'PUT', body: JSON.stringify(body) }),
  removeLine: (company, docType, docNumber, serial) => request(`/ar-invoice/${company}/${docType}/${encodeURIComponent(docNumber)}/lines/${serial}`, { method: 'DELETE' }),
};
