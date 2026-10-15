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
    if (res.status === 500) {
      errorMsg = `Error 500 en Railway: ${errorMsg}. Verifica en tu panel de Railway que la base de datos esté encendida y conectada.`;
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
      'Coordinación CEMTRI y Salud';
  }
  return resolved;
}

/* ════════════════════════════════════════════════════════════════════════════
   MAPA OFICIAL DE SERVICIOS DIF (Clave Formulario <-> ID en PostgreSQL)
════════════════════════════════════════════════════════════════════════════ */
export const SERVICIOS_DIF_MAP = {
  tl: 1,           // T.L. - Terapia de Lenguaje (CEMTRI)
  tf: 2,           // T.F. - Terapia Física (CEMTRI)
  to: 3,           // T.O. - Terapia Ocupacional (CEMTRI)
  sh: 4,           // S.H. - Salud / Rehabilitación (CEMTRI)
  cems: 5,         // CEMS - Centro de Especialidades (CEMTRI)
  eavd: 6,         // E.A.V.D. - Actividades Vida Diaria (CEMTRI)
  tcc: 7,          // T.C.C. - Terapia Cognitivo-Conductual (CEMTRI)
  cpsic: 8,        // C.Psic. - Consulta Psicológica (CEMTRI)
  estancia: 9,     // Estancia - Casa del Abuelo
  evento: 10,      // Evento - Casa del Abuelo
  ejercicio: 11,   // Ejercicio - Casa del Abuelo
  platica: 12,     // Plática - Casa del Abuelo
  tux_lentes: 13,  // Tux Lentes - Proyectos
  prostodoncia: 14,// Prostodoncia - Proyectos
  aj: 15,          // A.J. - Asesoría Jurídica
  pl: 16,          // P.L. - Patrocinio Legal
  ajmf: 17,        // A.J.M.F. - Asesoría Jurídica y Mediación Familiar (Procuraduría)
  al: 18,          // A.L. - Asesoría Legal (Procuraduría)
  cac: 19,         // C.A.C. - Centro de Asistencia Comunitaria
  alojamiento: 20, // Alojamiento - Procuraduría
  b_alimento: 21,  // B.Alimento - Procuraduría
  ctfi: 22,        // C.T.F.I. - Grupos Vulnerables
  unetoc: 23,      // UNETOC - Grupos Vulnerables
  cai: 24,         // CAI - Grupos Vulnerables
  tc: 25,          // T.C. - Grupos Vulnerables
  penms: 26,       // P.E.N.M.S. - Grupos Vulnerables
  cm: 27,          // C.M. - Grupos Vulnerables
  aam: 28,         // A.A.M. - Grupos Vulnerables
  dpa: 29,         // D.P.A. - Grupos Vulnerables
  capr: 30,        // C.A.P.R. - Servicios Alimentarios
  de: 31,          // D.E. - Servicios Alimentarios
  came: 32,        // C.A.M.E. - Servicios Alimentarios
  cann: 33,        // C.A.N.N. - Servicios Alimentarios
  atmsv: 34,       // A.T.M.S.V. - Servicios Alimentarios
};

export const SERVICIOS_ID_TO_KEY = Object.entries(SERVICIOS_DIF_MAP).reduce((acc, [k, v]) => {
  acc[v] = k;
  return acc;
}, {});

/**
 * adaptarFormularioABackend — Convierte el formulario de React al esquema
 * estricto Zod exigido por el backend (beneficiarioSchema.strict()).
 */
export function adaptarFormularioABackend(form, isUpdate = false) {
  if (!form) return {};

  // Normalizar Estado Civil exacto según enum PostgreSQL / Zod
  let estadoCivil = form.estadoCivil || form.estado_civil || 'Soltero(a)';
  if (estadoCivil.includes('Soltero')) estadoCivil = 'Soltero(a)';
  else if (estadoCivil.includes('Casado')) estadoCivil = 'Casado(a)';
  else if (estadoCivil.includes('Viudo')) estadoCivil = 'Viudo(a)';
  else if (estadoCivil.includes('Divorciado')) estadoCivil = 'Divorciado(a)';
  else if (estadoCivil.toLowerCase().includes('libre')) estadoCivil = 'Unión libre';
  else if (estadoCivil.includes('Separado')) estadoCivil = 'Separado(a)';
  else estadoCivil = 'Soltero(a)';

  // Normalizar Servicios a lista de IDs enteros [1, 2, ...]
  let servicios = [];
  if (Array.isArray(form.servicios)) {
    servicios = form.servicios.map(Number).filter((n) => Number.isInteger(n) && n > 0);
  } else if (form.servicios_dif && typeof form.servicios_dif === 'object') {
    servicios = Object.entries(form.servicios_dif)
      .filter(([, activo]) => Boolean(activo))
      .map(([clave]) => SERVICIOS_DIF_MAP[clave])
      .filter(Boolean);
  }

  // Domicilio anidado (objeto exacto exigido por backend)
  const domicilio = {
    tipoVialidad: String(form.domicilio?.tipoVialidad || form.tipo_vialidad || 'Calle').trim(),
    nombreVialidad: String(form.domicilio?.nombreVialidad || form.nombre_vialidad || 'Sin nombre').trim(),
    numeroExterior: String(form.domicilio?.numeroExterior || form.numero_exterior || 'S/N').trim(),
    tipoAsentamiento: String(form.domicilio?.tipoAsentamiento || form.tipo_asentamiento || 'Colonia').trim(),
    nombreAsentamiento: String(form.domicilio?.nombreAsentamiento || form.nombre_asentamiento || 'Centro').trim(),
    codigoPostal: String(form.domicilio?.codigoPostal || form.codigo_postal || '29000').trim().padStart(5, '0').slice(0, 5),
  };

  // Tutor (obligatorio si menor de 18 años)
  const tutor = form.tutorNombre || form.nombre_tutor || null;
  const tutorClean = tutor && String(tutor).trim() ? String(tutor).trim() : null;

  // Ayuda inicial anidada
  const fechaHoy = new Date().toISOString().split('T')[0];
  const ayuda = {
    fechaSolicitud: form.ayuda?.fechaSolicitud || form.fecha_solicitud || fechaHoy,
    tipoAyuda: String(form.ayuda?.tipoAyuda || form.tipo_ayuda_solicitada || form.programa || 'Apoyo Asistencial').trim(),
    haRecibidoApoyoDifEstatal: Boolean(
      form.ayuda?.haRecibidoApoyoDifEstatal || 
      form.recibio_apoyo_dif_estatal === 'Si' || 
      form.recibio_apoyo_dif_estatal === true
    ),
    descripcionApoyoDifEstatal: form.ayuda?.descripcionApoyoDifEstatal || form.descripcion_apoyo_estatal || null,
  };

  const payload = {
    nombres: String(form.nombres || form.nombre || '').trim(),
    apellidoPaterno: String(form.apellidoPaterno || form.apellido_paterno || '').trim(),
    apellidoMaterno: form.apellidoMaterno || form.apellido_materno ? String(form.apellidoMaterno || form.apellido_materno).trim() : null,
    fechaNacimiento: String(form.fechaNacimiento || form.fecha_nacimiento || '').slice(0, 10),
    curp: String(form.curp || '').trim().toUpperCase(),
    estadoCivil,
    esDependienteEconomico: Boolean(
      form.esDependienteEconomico === true || 
      form.es_dependiente_economico === 'Si'
    ),
    tutorNombre: tutorClean,
    tieneDependientesEconomicos: Boolean(
      form.tieneDependientesEconomicos === true || 
      form.cuenta_con_dependientes === 'Si'
    ),
    sexo: form.sexo === 'M' ? 'M' : 'H',
    domicilio,
    tipoDiscapacidad: String(form.tipoDiscapacidad || form.tipo_discapacidad || 'Ninguna').trim(),
    cuentaServicioMedico: Boolean(
      form.cuentaServicioMedico === true || 
      (typeof form.cuenta_servicio_medico === 'string' && form.cuenta_servicio_medico.startsWith('Si'))
    ),
    cuentaApoyoGubernamental: Boolean(
      form.cuentaApoyoGubernamental === true || 
      form.cuenta_apoyo_gubernamental === 'Si'
    ),
    descripcionApoyoGubernamental: form.descripcionApoyoGubernamental || form.descripcion_apoyo_gubernamental || null,
    servicios,
  };

  // En creación es obligatorio el bloque ayuda; en edición es opcional
  if (!isUpdate || form.ayuda || form.tipo_ayuda_solicitada) {
    payload.ayuda = ayuda;
  }

  return payload;
}

/**
 * adaptarBackendAFormulario — Convierte la respuesta del backend
 * al formato plano que utiliza el formulario CapturistaFormulario.jsx
 */
export function adaptarBackendAFormulario(raw) {
  if (!raw) return {};

  const servicios_dif = {};
  if (Array.isArray(raw.servicios)) {
    raw.servicios.forEach((s) => {
      const sId = typeof s === 'object' ? s.id : s;
      const key = SERVICIOS_ID_TO_KEY[sId];
      if (key) servicios_dif[key] = true;
    });
  }

  const primeraAyuda = raw.solicitudes?.[0] || {};

  return {
    id: raw.id,
    nombre: raw.nombres || '',
    apellido_paterno: raw.apellidoPaterno || '',
    apellido_materno: raw.apellidoMaterno || '',
    fecha_nacimiento: raw.fechaNacimiento ? String(raw.fechaNacimiento).slice(0, 10) : '',
    edad: raw.edad !== undefined && raw.edad !== null ? String(raw.edad) : '',
    curp: raw.curp || '',
    estado_civil: raw.estadoCivil || 'Soltero(a)',
    sexo: raw.sexo || 'H',
    es_dependiente_economico: raw.esDependienteEconomico ? 'Si' : 'No',
    nombre_tutor: raw.tutorNombre || '',
    cuenta_con_dependientes: raw.tieneDependientesEconomicos ? 'Si' : 'No',

    // Domicilio
    tipo_vialidad: raw.domicilio?.tipoVialidad || 'Calle',
    nombre_vialidad: raw.domicilio?.nombreVialidad || '',
    numero_exterior: raw.domicilio?.numeroExterior || '',
    tipo_asentamiento: raw.domicilio?.tipoAsentamiento || 'Colonia',
    nombre_asentamiento: raw.domicilio?.nombreAsentamiento || '',
    codigo_postal: raw.domicilio?.codigoPostal || '',

    // Discapacidad y Salud
    tipo_discapacidad: raw.tipoDiscapacidad || 'Ninguna',
    cuenta_servicio_medico: raw.cuentaServicioMedico ? 'Si' : 'No',
    cuenta_apoyo_gubernamental: raw.cuentaApoyoGubernamental ? 'Si' : 'No',
    descripcion_apoyo_gubernamental: raw.descripcionApoyoGubernamental || '',

    // Solicitud de Ayuda
    tipo_ayuda_solicitada: primeraAyuda.tipoAyuda || '',
    fecha_solicitud: primeraAyuda.fechaSolicitud ? String(primeraAyuda.fechaSolicitud).slice(0, 10) : '',
    recibio_apoyo_dif_estatal: primeraAyuda.haRecibidoApoyoDifEstatal ? 'Si' : 'No',
    descripcion_apoyo_estatal: primeraAyuda.descripcionApoyoDifEstatal || '',

    // Servicios
    servicios_dif,
    dependencia_emisora: raw.dependencia_emisora || raw.dependencia || 'Dirección de Asistencia Social',
  };
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

  const queryString = query.toString();
  const url = queryString ? `${API_URL}/beneficiarios?${queryString}` : `${API_URL}/beneficiarios`;

  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const raw = await handleResponse(res);

  // Normalizar para que funcione tanto con el formato { page, limit, total, data: [] } del backend
  // como con componentes que esperan res.beneficiarios
  const dataList = raw?.data || raw?.beneficiarios || (Array.isArray(raw) ? raw : []);
  const total = raw?.total ?? dataList.length;
  const page = raw?.page ?? (params.page || 1);
  const limit = raw?.limit ?? (params.limit || 20);
  const totalPaginas = Math.ceil(total / limit) || 1;

  const beneficiarios = dataList.map((b) => ({
    ...b,
    folio: b.folio || `DIF-2027-${String(b.id).padStart(3, '0')}`,
    nombre_completo: b.nombre_completo || b.nombre || [b.nombres, b.apellidoPaterno, b.apellidoMaterno].filter(Boolean).join(' '),
    tipo_ayuda_solicitada: b.tipo_ayuda_solicitada || b.ultimaAyuda || b.programa || 'Por asignar',
    fecha_solicitud: b.fecha_solicitud || b.ultimaSolicitud || '',
    codigo_postal: b.codigo_postal || b.codigoPostal || '',
    estatus: b.estatus || 'activo',
    dependencia: b.dependencia || b.dependencia_emisora || 'DIF - Asistencia Social',
  }));

  return {
    ...raw,
    total,
    page,
    limit,
    totalPaginas,
    beneficiarios,
    data: beneficiarios,
  };
}

/* ════════════════════════════════════════════════════════════════════════════
   5. GET /api/beneficiarios/:id — Detalle con solicitudes y servicios (Todos)
════════════════════════════════════════════════════════════════════════════ */
export async function getBeneficiarioById(id) {
  const res = await fetch(`${API_URL}/beneficiarios/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const raw = await handleResponse(res);
  return {
    ...raw,
    ...adaptarBackendAFormulario(raw),
  };
}

/* ════════════════════════════════════════════════════════════════════════════
   6. POST /api/beneficiarios — Crear beneficiario con primera solicitud (Admin, Capturista)
════════════════════════════════════════════════════════════════════════════ */
export async function crearBeneficiario(data) {
  const payload = adaptarFormularioABackend(data, false);
  const res = await fetch(`${API_URL}/beneficiarios`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/* ════════════════════════════════════════════════════════════════════════════
   7. PUT /api/beneficiarios/:id — Actualizar datos y servicios (Admin, Capturista)
════════════════════════════════════════════════════════════════════════════ */
export async function actualizarBeneficiario(id, data) {
  // Si nos mandan un formulario completo, adaptarlo al esquema Zod
  const payload = (data.nombres || data.nombre || data.curp)
    ? adaptarFormularioABackend(data, true)
    : data;

  const res = await fetch(`${API_URL}/beneficiarios/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/* ════════════════════════════════════════════════════════════════════════════
   8. POST /api/beneficiarios/:id/solicitudes — Agregar otra ayuda a beneficiario (Admin, Capturista)
════════════════════════════════════════════════════════════════════════════ */
export async function agregarSolicitudBeneficiario(id, solicitudData) {
  const payload = {
    fechaSolicitud: solicitudData.fechaSolicitud || solicitudData.fecha_solicitud || new Date().toISOString().split('T')[0],
    tipoAyuda: String(solicitudData.tipoAyuda || solicitudData.tipo_ayuda_solicitada || 'Apoyo Asistencial').trim(),
    haRecibidoApoyoDifEstatal: Boolean(
      solicitudData.haRecibidoApoyoDifEstatal || 
      solicitudData.recibio_apoyo_dif_estatal === 'Si' || 
      solicitudData.recibio_apoyo_dif_estatal === true
    ),
    descripcionApoyoDifEstatal: solicitudData.descripcionApoyoDifEstatal || solicitudData.descripcion_apoyo_estatal || solicitudData.observaciones || null,
  };

  const res = await fetch(`${API_URL}/beneficiarios/${id}/solicitudes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
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
