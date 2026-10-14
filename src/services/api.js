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
 * getAuthHeaders — Devuelve los headers requeridos con token JWT Bearer.
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
      const token = parsed?.token || parsed?.jwt || parsed?.accessToken;
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
 * handleResponse — Procesa la respuesta de fetch y extrae JSON o mensaje de error.
 */
export async function handleResponse(res) {
  if (!res.ok) {
    let errorMsg = `Error HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      errorMsg = errJson.message || errJson.error || errJson.msg || errorMsg;
    } catch {
      // No era JSON
    }
    throw new Error(errorMsg);
  }
  if (res.status === 204) return true;
  return res.json();
}

/* ════════════════════════════════════════════
   DATOS MOCK (Desarrollo y Modo Demo)
════════════════════════════════════════════ */
const MOCK_USERS = {
  admin:       { id: 1, nombre: 'Administrador', rol: 'admin',       token: 'mock-token-admin' },
  supervisor:  { id: 2, nombre: 'Supervisor',     rol: 'supervisor',  token: 'mock-token-supervisor' },
  capturista:  { id: 3, nombre: 'Capturista',     rol: 'capturista',  token: 'mock-token-capturista' },
  consultor:   { id: 4, nombre: 'Consultor',      rol: 'consultor',   token: 'mock-token-consultor' },
};

const MOCK_SERVICIOS_AGRUPADOS = {
  salud_cemtri: [
    { id: 1, clave: 'tl', codigo: 'T.L.', nombre: 'Terapia de Lenguaje', categoria: 'Salud - CEMTRI' },
    { id: 2, clave: 'tf', codigo: 'T.F.', nombre: 'Terapia Física', categoria: 'Salud - CEMTRI' },
    { id: 3, clave: 'to', codigo: 'T.O.', nombre: 'Terapia Ocupacional', categoria: 'Salud - CEMTRI' },
    { id: 4, clave: 'sh', codigo: 'S.H.', nombre: 'Salud / Rehabilitación', categoria: 'Salud - CEMTRI' },
    { id: 5, clave: 'cems', codigo: 'CEMS', nombre: 'Centro de Especialidades Médicas', categoria: 'Salud - CEMTRI' },
    { id: 6, clave: 'eavd', codigo: 'E.A.V.D.', nombre: 'Actividades de la Vida Diaria', categoria: 'Salud - CEMTRI' },
    { id: 7, clave: 'tcc', codigo: 'T.C.C.', nombre: 'Terapia Cognitivo-Conductual', categoria: 'Salud - CEMTRI' },
    { id: 8, clave: 'cpsic', codigo: 'C.Psic.', nombre: 'Consulta Psicológica', categoria: 'Salud - CEMTRI' },
  ],
  asistencia_juridica: [
    { id: 9, clave: 'at_jur', codigo: 'AT.JUR.', nombre: 'Atención Jurídica General', categoria: 'Jurídica' },
    { id: 10, clave: 'c_mat', codigo: 'C.MAT.', nombre: 'Convenios en Materia Familiar', categoria: 'Jurídica' },
    { id: 11, clave: 'div', codigo: 'DIV.', nombre: 'Divorcios y Alimentos', categoria: 'Jurídica' },
  ],
  nutricion_alimentaria: [
    { id: 12, clave: 'd_alim', codigo: 'D.ALIM.', nombre: 'Dotaciones Alimentarias Básicas', categoria: 'Nutrición' },
    { id: 13, clave: 'c_nut', codigo: 'C.NUT.', nombre: 'Consulta de Orientación Nutricional', categoria: 'Nutrición' },
  ],
  apoyos_tecnicos: [
    { id: 14, clave: 'silla_ruedas', codigo: 'SR', nombre: 'Silla de Ruedas Estándar', categoria: 'Ayudas Técnicas' },
    { id: 15, clave: 'andadera', codigo: 'AND', nombre: 'Andadera para Adulto Mayor', categoria: 'Ayudas Técnicas' },
    { id: 16, clave: 'baston', codigo: 'BAS', nombre: 'Bastón de Cuatro Puntos', categoria: 'Ayudas Técnicas' },
  ],
};

const MOCK_BENEFICIARIOS = [
  {
    id: 1,
    folio: 'DIF-2027-001',
    fecha_solicitud: '2027-01-15',
    nombre: 'Jorge Luis',
    apellido_paterno: 'Caceres',
    apellido_materno: 'Murillo',
    nombre_completo: 'Jorge Luis Caceres Murillo',
    curp: 'CAMJ701225HCSCRHL5',
    fecha_nacimiento: '1970-12-25',
    edad: 55,
    sexo: 'H',
    estado_civil: 'Casado (a)',
    tipo_vialidad: 'Calle',
    nombre_vialidad: 'Venustiano Carranza',
    numero_exterior: '15',
    tipo_asentamiento: 'Colonia',
    nombre_asentamiento: 'Los Limones',
    codigo_postal: '29015',
    tipo_discapacidad: 'Motriz',
    tipo_ayuda_solicitada: 'Silla de ruedas',
    recibio_apoyo_dif_estatal: 'Si',
    descripcion_apoyo_estatal: 'Silla de ruedas estándar',
    cuenta_servicio_medico: 'No',
    cuenta_apoyo_gubernamental: 'Si',
    descripcion_apoyo_gubernamental: 'Pensión para el Bienestar de las Personas Adultas Mayores',
    estatus: 'activo',
    created_at: '2027-01-15',
  },
  {
    id: 2,
    folio: 'DIF-2027-002',
    fecha_solicitud: '2027-01-18',
    nombre: 'Rosa María',
    apellido_paterno: 'Penagos',
    apellido_materno: 'Ruíz',
    nombre_completo: 'Rosa María Penagos Ruíz',
    curp: 'PERM680514MCSRNS02',
    fecha_nacimiento: '1968-05-14',
    edad: 58,
    sexo: 'M',
    estado_civil: 'Viudo (a)',
    tipo_vialidad: 'Avenida',
    nombre_vialidad: 'Presa Malpaso',
    numero_exterior: '42',
    tipo_asentamiento: 'Residencial',
    nombre_asentamiento: 'La Hacienda',
    codigo_postal: '29030',
    tipo_discapacidad: 'Motriz',
    tipo_ayuda_solicitada: 'Andadera',
    recibio_apoyo_dif_estatal: 'No',
    descripcion_apoyo_estatal: '',
    cuenta_servicio_medico: 'Si - IMSS Bienestar',
    cuenta_apoyo_gubernamental: 'No',
    descripcion_apoyo_gubernamental: '',
    estatus: 'pendiente',
    created_at: '2027-01-18',
  },
  {
    id: 3,
    folio: 'DIF-2027-003',
    fecha_solicitud: '2027-02-02',
    nombre: 'Mónica',
    apellido_paterno: 'Gómez',
    apellido_materno: 'Pérez',
    nombre_completo: 'Mónica Gómez Pérez',
    curp: 'GOPM900311MCSRRN08',
    fecha_nacimiento: '1990-03-11',
    edad: 36,
    sexo: 'M',
    estado_civil: 'Soltero (a)',
    tipo_vialidad: 'Calle',
    nombre_vialidad: 'Central Norte',
    numero_exterior: '108',
    tipo_asentamiento: 'Barrio',
    nombre_asentamiento: 'San Roque',
    codigo_postal: '29000',
    tipo_discapacidad: 'Visual',
    tipo_ayuda_solicitada: 'Bastón para invidente',
    recibio_apoyo_dif_estatal: 'No',
    descripcion_apoyo_estatal: '',
    cuenta_servicio_medico: 'Si - IMSS',
    cuenta_apoyo_gubernamental: 'No',
    descripcion_apoyo_gubernamental: '',
    estatus: 'activo',
    created_at: '2027-02-02',
  },
];

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
   2. POST /api/auth/login — Devuelve el token JWT (Público)
════════════════════════════════════════════════════════════════════════════ */
export async function login(usuario, password) {
  const uClean = usuario?.trim().toLowerCase();
  const pClean = String(password || '').trim();
  const isDemoPass = pClean === '123' || pClean === '1234';
  const mockUser = MOCK_USERS[uClean];

  // Si son credenciales de demostración para pruebas locales (Admin, Supervisor, Capturista, Consultor):
  // Ingresar inmediatamente para permitir pruebas completas sin generar errores 401 en consola
  if (mockUser && isDemoPass) {
    return mockUser;
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: usuario?.trim(),
        username: usuario?.trim(),
        password: pClean,
      }),
    });
    const data = await handleResponse(res);

    // Normalizar formato de respuesta de token
    if (data.user && !data.rol) {
      return {
        ...data.user,
        token: data.token || data.jwt || data.accessToken,
      };
    }
    return data;
  } catch (error) {
    if (mockUser && isDemoPass) {
      return mockUser;
    }
    throw error;
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   3. GET /api/catalogos/servicios — Catálogo con IDs agrupado por categoría (Todos)
════════════════════════════════════════════════════════════════════════════ */
export async function getCatalogosServicios() {
  try {
    const res = await fetch(`${API_URL}/catalogos/servicios`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(res);
  } catch (error) {
    return MOCK_SERVICIOS_AGRUPADOS;
  }
}
export const getServicios = getCatalogosServicios;

/* ════════════════════════════════════════════════════════════════════════════
   4. GET /api/beneficiarios — Listado paginado (page, limit, q, curp) (Todos)
════════════════════════════════════════════════════════════════════════════ */
export async function getBeneficiarios(params = {}) {
  try {
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
    return await handleResponse(res);
  } catch (error) {
    // Fallback de desarrollo con datos simulados
    let list = [...MOCK_BENEFICIARIOS];
    const search = (params.q || params.busqueda || '').toLowerCase();
    if (search) {
      list = list.filter(
        (b) =>
          b.nombre_completo?.toLowerCase().includes(search) ||
          b.curp?.toLowerCase().includes(search) ||
          b.folio?.toLowerCase().includes(search)
      );
    }
    if (params.curp) {
      list = list.filter((b) => b.curp?.toLowerCase() === params.curp.toLowerCase());
    }
    if (params.programa) {
      list = list.filter((b) => b.programa?.toLowerCase().includes(params.programa.toLowerCase()));
    }
    const page = parseInt(params.page, 10) || 1;
    const limit = parseInt(params.limit, 10) || 10;
    return {
      beneficiarios: list,
      total: list.length,
      page,
      limit,
      totalPaginas: Math.ceil(list.length / limit) || 1,
    };
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   5. GET /api/beneficiarios/:id — Detalle con solicitudes y servicios (Todos)
════════════════════════════════════════════════════════════════════════════ */
export async function getBeneficiarioById(id) {
  try {
    const res = await fetch(`${API_URL}/beneficiarios/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(res);
  } catch (error) {
    const found = MOCK_BENEFICIARIOS.find((b) => String(b.id) === String(id));
    if (found) return found;
    throw error;
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   6. POST /api/beneficiarios — Crear beneficiario con primera solicitud (Admin, Capturista)
════════════════════════════════════════════════════════════════════════════ */
export async function crearBeneficiario(data) {
  try {
    const res = await fetch(`${API_URL}/beneficiarios`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  } catch (error) {
    const isMock = localStorage.getItem('padrones_user')?.includes('mock-token');
    if (isMock) {
      const nuevo = {
        ...data,
        id: Date.now(),
        folio: `DIF-2027-${String(Math.floor(Math.random() * 900) + 100)}`,
        created_at: new Date().toISOString().split('T')[0],
        estatus: data.estatus || 'activo',
      };
      MOCK_BENEFICIARIOS.unshift(nuevo);
      return nuevo;
    }
    throw error;
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   7. PUT /api/beneficiarios/:id — Actualizar datos y servicios (Admin, Capturista)
════════════════════════════════════════════════════════════════════════════ */
export async function actualizarBeneficiario(id, data) {
  try {
    const res = await fetch(`${API_URL}/beneficiarios/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  } catch (error) {
    const isMock = localStorage.getItem('padrones_user')?.includes('mock-token');
    if (isMock) {
      const idx = MOCK_BENEFICIARIOS.findIndex((b) => String(b.id) === String(id));
      if (idx !== -1) {
        MOCK_BENEFICIARIOS[idx] = { ...MOCK_BENEFICIARIOS[idx], ...data };
        return MOCK_BENEFICIARIOS[idx];
      }
      return data;
    }
    throw error;
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   8. POST /api/beneficiarios/:id/solicitudes — Agregar otra ayuda a beneficiario (Admin, Capturista)
════════════════════════════════════════════════════════════════════════════ */
export async function agregarSolicitudBeneficiario(id, solicitudData) {
  try {
    const res = await fetch(`${API_URL}/beneficiarios/${id}/solicitudes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(solicitudData),
    });
    return await handleResponse(res);
  } catch (error) {
    const isMock = localStorage.getItem('padrones_user')?.includes('mock-token');
    if (isMock) {
      return { success: true, message: 'Solicitud registrada exitosamente (Modo Demo)' };
    }
    throw error;
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   9. DELETE /api/beneficiarios/:id — Eliminar beneficiario (Admin, Capturista)
════════════════════════════════════════════════════════════════════════════ */
export async function eliminarBeneficiario(id) {
  try {
    const res = await fetch(`${API_URL}/beneficiarios/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await handleResponse(res);
  } catch (error) {
    const isMock = localStorage.getItem('padrones_user')?.includes('mock-token');
    if (isMock) {
      const idx = MOCK_BENEFICIARIOS.findIndex((b) => String(b.id) === String(id));
      if (idx !== -1) {
        MOCK_BENEFICIARIOS.splice(idx, 1);
      }
      return { success: true };
    }
    throw error;
  }
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
