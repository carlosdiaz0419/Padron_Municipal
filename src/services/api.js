/**
 * ════════════════════════════════════════════════════════════════════════════
 * API CLIENT — Conexión oficial de rutas con el backend vía Fetch
 * Basado en la especificación de rutas del Sistema de Padrón de Beneficiarios:
 * 
 * 1. GET    /health                             — Verifica que backend y BD respondan (público)
 * 2. POST   /api/auth/login                     — Devuelve el token JWT (público)
 * 3. GET    /api/catalogos/servicios            — Catálogo de servicios con IDs por categoría (todos)
 * 4. GET    /api/beneficiarios                  — Listado paginado (page, limit, q, curp) (todos)
 * 5. GET    /api/beneficiarios/:id              — Detalle con solicitudes y servicios (todos)
 * 6. POST   /api/beneficiarios                  — Crear beneficiario con primera solicitud (admin, capturista)
 * 7. PUT    /api/beneficiarios/:id              — Actualizar datos y servicios (admin, capturista)
 * 8. POST   /api/beneficiarios/:id/solicitudes  — Agregar otra ayuda a beneficiario existente (admin, capturista)
 * 9. DELETE /api/beneficiarios/:id              — Eliminar beneficiario (admin, capturista)
 * ════════════════════════════════════════════════════════════════════════════
 */

function normalizeUrl(url) {
  if (!url) return '';
  let cleaned = String(url).trim().replace(/\/+$/, '');
  // Forzar siempre https:// en Railway y dominios remotos para evitar el error de preflight por redirect 301
  if (/^http:\/\//i.test(cleaned) && !cleaned.includes('localhost') && !cleaned.includes('127.0.0.1')) {
    cleaned = cleaned.replace(/^http:\/\//i, 'https://');
  }
  return cleaned;
}

// En entorno de desarrollo (localhost), usamos las rutas relativas ('/api' y '/health')
// para que pasen a través del proxy de Vite configurado en vite.config.mjs.
// Esto elimina por completo el error de CORS porque la llamada es Same-Origin para el navegador.
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const envBackend = (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL)) ||
  (typeof process !== 'undefined' && process.env && (process.env.REACT_APP_BACKEND_URL || process.env.VITE_BACKEND_URL));

const envApi = (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL)) ||
  (typeof process !== 'undefined' && process.env && (process.env.REACT_APP_API_URL || process.env.VITE_API_URL));

const shouldUseProxy = isLocalhost && (!envApi || envApi.startsWith('/') || envApi.includes('localhost') || envApi.includes('railway.app'));

const RAW_BACKEND = shouldUseProxy 
  ? '' 
  : (envBackend || (envApi ? envApi.replace(/\/api\/?$/, '') : 'https://backend-beneficiarios-production.up.railway.app'));

const RAW_API = shouldUseProxy 
  ? '/api' 
  : (envApi || `${RAW_BACKEND}/api`);

const BACKEND_BASE = normalizeUrl(RAW_BACKEND);
const API_URL = normalizeUrl(RAW_API);

/**
 * getAuthHeaders — Devuelve los headers requeridos con token JWT Bearer real.
 */
export function getAuthHeaders(extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  const stored = localStorage.getItem('padrones_user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Si el almacenamiento local contiene un token simulado antiguo, limpiarlo para evitar rechazos 401
      if (typeof parsed?.token === 'string' && parsed.token.startsWith('mock-token')) {
        localStorage.removeItem('padrones_user');
        return headers;
      }
      const token = parsed?.token || parsed?.jwt || parsed?.accessToken || parsed?.access_token;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // Ignorar error de lectura de localStorage
    }
  }
  return headers;
}

/**
 * handleResponse — Procesa la respuesta de fetch y extrae JSON o mensaje de error detallado.
 */
export async function handleResponse(res) {
  if (!res.ok) {
    let errorMsg = `Error HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      errorMsg = errJson.message || errJson.error || errJson.msg || errorMsg;
      if (errJson.detalles && Array.isArray(errJson.detalles)) {
        const detallesStr = errJson.detalles
          .map((d) => (d.campo ? `${d.campo}: ${d.mensaje}` : d.mensaje || JSON.stringify(d)))
          .join(', ');
        if (detallesStr) {
          errorMsg = `${errorMsg} (${detallesStr})`;
        }
      }
    } catch {
      // No era JSON
    }
    throw new Error(errorMsg);
  }
  if (res.status === 204) return true;
  return res.json();
}

/* ════════════════════════════════════════════════════════════════════════════
   1. GET /health — Verifica que backend y BD respondan (Público)
════════════════════════════════════════════════════════════════════════════ */
export async function checkHealth() {
  const res = await fetch(`${BACKEND_BASE}/health`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(res);
}

/* ════════════════════════════════════════════════════════════════════════════
   2. POST /api/auth/login — Devuelve el token JWT real desde la API (Público)
════════════════════════════════════════════════════════════════════════════ */
export async function login(usuario, password) {
  const uClean = usuario?.trim();
  const pClean = String(password || '').trim();

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuario: uClean,
      username: uClean,
      password: pClean,
    }),
  });
  const data = await handleResponse(res);

  // Normalizar formato de respuesta de token y asignar dependencia si no viene incluida
  const token = data.token || data.jwt || data.accessToken || data.access_token;
  const userObj = data.user || data.usuario || data;

  const resolved = {
    ...userObj,
    token,
    id: userObj.id || data.id,
    nombre: userObj.nombre || userObj.name || userObj.username || uClean,
    usuario: userObj.usuario || userObj.username || uClean,
    rol: (userObj.rol || userObj.role || data.rol || data.role || 'capturista').toLowerCase(),
    dependencia: userObj.dependencia || data.dependencia,
  };

  if (!resolved.dependencia) {
    resolved.dependencia = 
      resolved.rol === 'admin' ? 'Dirección General DIF' :
      resolved.rol === 'supervisor' ? 'Dirección de Asistencia Social' :
      resolved.rol === 'capturista' ? 'Coordinación CEMTRI y Salud' : 'Secretaría de Planeación Municipal';
  }
  return resolved;
}

/* ════════════════════════════════════════════════════════════════════════════
   3. GET /api/catalogos/servicios — Catálogo con IDs agrupado por categoría (Todos)
════════════════════════════════════════════════════════════════════════════ */
export async function getCatalogosServicios() {
  const res = await fetch(`${API_URL}/catalogos/servicios`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}
export const getServicios = getCatalogosServicios;

/* ════════════════════════════════════════════════════════════════════════════
   4. GET /api/beneficiarios — Listado paginado real (page, limit, q, curp) (Todos)
════════════════════════════════════════════════════════════════════════════ */
export async function getBeneficiarios(params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  
  // Parámetro 'q' (búsqueda por nombre)
  const q = params.q || params.busqueda;
  if (q) query.append('q', q);

  // Parámetro 'curp' (búsqueda exacta)
  if (params.curp) query.append('curp', params.curp);
  if (params.programa) query.append('programa', params.programa);
  if (params.municipio) query.append('municipio', params.municipio);
  if (params.estatus) query.append('estatus', params.estatus);

  const queryString = query.toString();
  const url = queryString ? `${API_URL}/beneficiarios?${queryString}` : `${API_URL}/beneficiarios`;

  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

/* ════════════════════════════════════════════════════════════════════════════
   5. GET /api/beneficiarios/:id — Detalle con solicitudes y servicios (Todos)
════════════════════════════════════════════════════════════════════════════ */
export async function getBeneficiarioById(id) {
  const res = await fetch(`${API_URL}/beneficiarios/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

/* ════════════════════════════════════════════════════════════════════════════
   6. POST /api/beneficiarios — Crear beneficiario con primera solicitud (Admin, Capturista)
════════════════════════════════════════════════════════════════════════════ */
export async function crearBeneficiario(data) {
  const res = await fetch(`${API_URL}/beneficiarios`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/* ════════════════════════════════════════════════════════════════════════════
   7. PUT /api/beneficiarios/:id — Actualizar datos y servicios (Admin, Capturista)
════════════════════════════════════════════════════════════════════════════ */
export async function actualizarBeneficiario(id, data) {
  const res = await fetch(`${API_URL}/beneficiarios/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/* ════════════════════════════════════════════════════════════════════════════
   8. POST /api/beneficiarios/:id/solicitudes — Agregar otra ayuda a beneficiario (Admin, Capturista)
════════════════════════════════════════════════════════════════════════════ */
export async function agregarSolicitudBeneficiario(id, solicitudData) {
  const res = await fetch(`${API_URL}/beneficiarios/${id}/solicitudes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(solicitudData),
  });
  return handleResponse(res);
}

/* ════════════════════════════════════════════════════════════════════════════
   9. DELETE /api/beneficiarios/:id — Eliminar beneficiario (Admin, Capturista)
════════════════════════════════════════════════════════════════════════════ */
export async function eliminarBeneficiario(id) {
  const res = await fetch(`${API_URL}/beneficiarios/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

/* ════════════════════════════════════════════════════════════════════════════
   UTILIDADES ADICIONALES (Compatibilidad con vistas existentes)
════════════════════════════════════════════════════════════════════════════ */
export async function getUsuarios() {
  const res = await fetch(`${API_URL}/usuarios`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function crearUsuario(data) {
  const res = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getProgramas() {
  return getCatalogosServicios();
}

export async function getMunicipios() {
  const res = await fetch(`${API_URL}/catalogos/municipios`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function getReporteGeneral(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/reportes/general?${query}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function getAuditoria(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/auditoria?${query}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}
