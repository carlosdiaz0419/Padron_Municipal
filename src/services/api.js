const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

/**
 * getAuthHeaders — Devuelve los headers con el token JWT para peticiones autenticadas.
 */
function getAuthHeaders() {
  const stored = localStorage.getItem('padrones_user');
  if (!stored) return { 'Content-Type': 'application/json' };
  const { token } = JSON.parse(stored);
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * handleResponse — Maneja la respuesta de fetch y lanza errores con mensaje del servidor.
 */
async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json();
}

/* ════════════════════════════════════════════
   AUTENTICACIÓN
════════════════════════════════════════════ */

/**
 * USUARIOS DE PRUEBA — Solo para desarrollo frontend sin backend.
 * ⚠️ Eliminar o comentar este bloque cuando el backend esté listo.
 */
const MOCK_USERS = {
  admin:       { id: 1, nombre: 'Administrador',  rol: 'admin',       token: 'mock-token-admin' },
  supervisor:  { id: 2, nombre: 'Supervisor',      rol: 'supervisor',  token: 'mock-token-supervisor' },
  capturista:  { id: 3, nombre: 'Capturista',      rol: 'capturista',  token: 'mock-token-capturista' },
  consultor:   { id: 4, nombre: 'Consultor',       rol: 'consultor',   token: 'mock-token-consultor' },
};

// Datos de ejemplo basados en la Base General DIF 2027 (Ayudas Técnicas)
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

/**
 * login — Autentica al usuario y devuelve { id, nombre, rol, token }.
 * En desarrollo: usa usuarios mock si el backend no está disponible.
 * @param {string} usuario
 * @param {string} password
 */
export async function login(usuario, password) {
  // ── MODO MOCK (sin backend) ──────────────────────────────────────
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password }),
    });
    return await handleResponse(res);
  } catch {
    // Backend no disponible → usar mock
    const mockUser = MOCK_USERS[usuario.toLowerCase()];
    if (mockUser && (password === '1234' || password === '123')) {
      return mockUser;
    }
    throw new Error(
      'Credenciales incorrectas. (Usuarios de prueba: admin, supervisor, capturista, consultor — contraseña: 1234)'
    );
  }
}


/* ════════════════════════════════════════════
   BENEFICIARIOS
════════════════════════════════════════════ */

/**
 * getBeneficiarios — Lista todos los beneficiarios (con paginación y filtros opcionales).
 * @param {{ page?, limit?, busqueda?, programa?, estatus? }} params
 */
export async function getBeneficiarios(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/beneficiarios?${query}`, {
      headers: getAuthHeaders(),
    });
    return await handleResponse(res);
  } catch {
    // Si backend no responde, filtrar los datos mock
    let list = [...MOCK_BENEFICIARIOS];
    if (params.busqueda) {
      const q = params.busqueda.toLowerCase();
      list = list.filter(
        (b) =>
          b.nombre_completo.toLowerCase().includes(q) ||
          b.curp.toLowerCase().includes(q) ||
          b.folio.toLowerCase().includes(q)
      );
    }
    if (params.programa) {
      list = list.filter((b) =>
        b.programa.toLowerCase().includes(params.programa.toLowerCase())
      );
    }
    if (params.municipio) {
      list = list.filter((b) =>
        b.municipio.toLowerCase().includes(params.municipio.toLowerCase())
      );
    }
    return { beneficiarios: list, total: list.length, page: 1, limit: 10 };
  }
}

/**
 * getBeneficiarioById — Obtiene un beneficiario por su ID.
 * @param {string|number} id
 */
export async function getBeneficiarioById(id) {
  const res = await fetch(`${API_URL}/beneficiarios/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

/**
 * crearBeneficiario — Crea un nuevo beneficiario en el padrón.
 * @param {Object} data
 */
export async function crearBeneficiario(data) {
  const res = await fetch(`${API_URL}/beneficiarios`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * actualizarBeneficiario — Actualiza los datos de un beneficiario.
 * @param {string|number} id
 * @param {Object} data
 */
export async function actualizarBeneficiario(id, data) {
  const res = await fetch(`${API_URL}/beneficiarios/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * eliminarBeneficiario — Elimina (baja lógica) un beneficiario.
 * @param {string|number} id
 */
export async function eliminarBeneficiario(id) {
  const res = await fetch(`${API_URL}/beneficiarios/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

/* ════════════════════════════════════════════
   USUARIOS (solo Admin)
════════════════════════════════════════════ */

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

export async function actualizarUsuario(id, data) {
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function eliminarUsuario(id) {
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

/* ════════════════════════════════════════════
   CATÁLOGOS (solo Admin)
════════════════════════════════════════════ */

export async function getProgramas() {
  const res = await fetch(`${API_URL}/catalogos/programas`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function getMunicipios() {
  const res = await fetch(`${API_URL}/catalogos/municipios`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

/* ════════════════════════════════════════════
   REPORTES
════════════════════════════════════════════ */

export async function getReporteGeneral(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/reportes/general?${query}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

/* ════════════════════════════════════════════
   AUDITORÍA (solo Admin)
════════════════════════════════════════════ */

export async function getAuditoria(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/auditoria?${query}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}
