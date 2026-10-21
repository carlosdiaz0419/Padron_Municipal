/**
 * ════════════════════════════════════════════════════════════════════════════
 * PERMISSIONS SERVICE — Gestión de Matriz de Permisos y Accesos por Rol y Usuario
 * ════════════════════════════════════════════════════════════════════════════
 */

export const STORAGE_KEY_PERMISSIONS = 'padrones_role_permissions';
export const STORAGE_KEY_USER_OVERRIDES = 'padrones_user_permission_overrides';

export const MODULOS_SISTEMA = [
  {
    id: 'beneficiarios',
    nombre: 'Padrón y Beneficiarios',
    descripcion: 'Control de expedientes, registro inicial, actualización y asignación de apoyos DIF',
    permisos: [
      { id: 'beneficiarios.ver', nombre: 'Consultar listado de beneficiarios', desc: 'Permite buscar, filtrar y visualizar el padrón' },
      { id: 'beneficiarios.crear', nombre: 'Registrar nuevo beneficiario', desc: 'Acceso al formulario de captura oficial (Anexo 5)' },
      { id: 'beneficiarios.editar', nombre: 'Modificar datos del expediente', desc: 'Editar CURP, domicilio, discapacidad y servicios DIF' },
      { id: 'beneficiarios.eliminar', nombre: 'Eliminar beneficiario', desc: 'Dar de baja definitiva un expediente del padrón' },
      { id: 'beneficiarios.solicitudes', nombre: 'Agregar ayudas adicionales', desc: 'Añadir nuevas solicitudes institucionales a un beneficiario' },
    ],
  },
  {
    id: 'validacion',
    nombre: 'Validación y Dictamen',
    descripcion: 'Revisión técnica documental, aprobación de apoyos y registro de dictámenes',
    permisos: [
      { id: 'validacion.ver', nombre: 'Ver expedientes pendientes de validación', desc: 'Acceso a la mesa de supervisión y expedientes por evaluar' },
      { id: 'validacion.aprobar', nombre: 'Aprobar expedientes (Dictamen Positivo)', desc: 'Validar requisitos y cambiar estatus a Activo' },
      { id: 'validacion.rechazar', nombre: 'Rechazar / Observar expedientes', desc: 'Dictaminar no procedente e ingresar motivo de rechazo' },
    ],
  },
  {
    id: 'catalogos',
    nombre: 'Catálogos Oficiales',
    descripcion: 'Catálogo institucional de servicios de salud, ayudas técnicas y proyectos',
    permisos: [
      { id: 'catalogos.ver', nombre: 'Consultar catálogos de servicios', desc: 'Visualizar claves, códigos y conceptos de apoyos DIF' },
      { id: 'catalogos.crear', nombre: 'Crear nuevos servicios en el catálogo', desc: 'Registrar nuevas claves y descripciones de apoyos' },
      { id: 'catalogos.editar', nombre: 'Modificar o dar de baja servicios', desc: 'Editar nombres, códigos o desactivar conceptos' },
    ],
  },
  {
    id: 'reportes',
    nombre: 'Reportes y Estadísticas',
    descripcion: 'Métricas institucionales, gráficos de avance y exportación a Microsoft Excel / CSV',
    permisos: [
      { id: 'reportes.ver', nombre: 'Visualizar tableros e indicadores', desc: 'Acceso a gráficos de avance y distribución por área' },
      { id: 'reportes.exportar_general', nombre: 'Exportar Padrón Consolidado a Excel/CSV', desc: 'Descarga completa del padrón con folio y CURP' },
      { id: 'reportes.exportar_supervision', nombre: 'Exportar Resumen de Supervisión', desc: 'Descarga del balance de metas e indicadores DIF' },
    ],
  },
  {
    id: 'administracion',
    nombre: 'Seguridad y Administración',
    descripcion: 'Gestión de funcionarios, roles, matriz de permisos y bitácora de auditoría',
    permisos: [
      { id: 'admin.usuarios_ver', nombre: 'Ver lista de usuarios y roles', desc: 'Consultar funcionarios registrados en el sistema' },
      { id: 'admin.usuarios_gestionar', nombre: 'Crear y editar cuentas de usuarios', desc: 'Gestionar contraseñas, dependencias y roles' },
      { id: 'admin.permisos_modificar', nombre: 'Modificar matriz de permisos del sistema', desc: 'Cambiar los permisos globales de cada rol' },
      { id: 'admin.auditoria_ver', nombre: 'Consultar bitácora de auditoría', desc: 'Historial detallado de operaciones y accesos' },
    ],
  },
];

export const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    'beneficiarios.ver': true,
    'beneficiarios.crear': true,
    'beneficiarios.editar': true,
    'beneficiarios.eliminar': true,
    'beneficiarios.solicitudes': true,
    'validacion.ver': true,
    'validacion.aprobar': true,
    'validacion.rechazar': true,
    'catalogos.ver': true,
    'catalogos.crear': true,
    'catalogos.editar': true,
    'reportes.ver': true,
    'reportes.exportar_general': true,
    'reportes.exportar_supervision': true,
    'admin.usuarios_ver': true,
    'admin.usuarios_gestionar': true,
    'admin.permisos_modificar': true,
    'admin.auditoria_ver': true,
  },
  supervisor: {
    'beneficiarios.ver': true,
    'beneficiarios.crear': true,
    'beneficiarios.editar': true,
    'beneficiarios.eliminar': true,
    'beneficiarios.solicitudes': true,
    'validacion.ver': true,
    'validacion.aprobar': true,
    'validacion.rechazar': true,
    'catalogos.ver': true,
    'catalogos.crear': false,
    'catalogos.editar': false,
    'reportes.ver': true,
    'reportes.exportar_general': true,
    'reportes.exportar_supervision': true,
    'admin.usuarios_ver': false,
    'admin.usuarios_gestionar': false,
    'admin.permisos_modificar': false,
    'admin.auditoria_ver': false,
  },
  capturista: {
    'beneficiarios.ver': true,
    'beneficiarios.crear': true,
    'beneficiarios.editar': true,
    'beneficiarios.eliminar': true,
    'beneficiarios.solicitudes': true,
    'validacion.ver': false,
    'validacion.aprobar': false,
    'validacion.rechazar': false,
    'catalogos.ver': true,
    'catalogos.crear': false,
    'catalogos.editar': false,
    'reportes.ver': false,
    'reportes.exportar_general': true,
    'reportes.exportar_supervision': false,
    'admin.usuarios_ver': false,
    'admin.usuarios_gestionar': false,
    'admin.permisos_modificar': false,
    'admin.auditoria_ver': false,
  },
};

function getAuthHeadersForPerms() {
  try {
    const raw = localStorage.getItem('padrones_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.token || parsed?.jwt || parsed?.accessToken;
      if (token && !String(token).startsWith('local-jwt-')) {
        return {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };
      }
    }
  } catch (_) {}
  return { 'Content-Type': 'application/json' };
}

function pushPermissionsToBackend() {
  try {
    const rolePermissions = getRolePermissions();
    const rawOverrides = localStorage.getItem(STORAGE_KEY_USER_OVERRIDES);
    const userOverrides = rawOverrides ? JSON.parse(rawOverrides) : {};
    fetch('/api/usuarios/permisos', {
      method: 'PUT',
      headers: getAuthHeadersForPerms(),
      body: JSON.stringify({ rolePermissions, userOverrides }),
    }).catch(() => {});
  } catch (_) {}
}

export async function syncPermissionsFromBackend() {
  try {
    const res = await fetch('/api/usuarios/permisos', {
      method: 'GET',
      headers: getAuthHeadersForPerms(),
    });
    if (!res.ok) return;
    const data = await res.json();
    let changed = false;
    if (data?.rolePermissions && typeof data.rolePermissions === 'object') {
      localStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(data.rolePermissions));
      changed = true;
    }
    if (data?.userOverrides && typeof data.userOverrides === 'object') {
      localStorage.setItem(STORAGE_KEY_USER_OVERRIDES, JSON.stringify(data.userOverrides));
      changed = true;
    }
    if (changed) {
      window.dispatchEvent(new Event('padrones_permissions_updated'));
    }
  } catch (_) {}
}

/**
 * Obtener la matriz actual de permisos por rol.
 */
export function getRolePermissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PERMISSIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        admin: { ...DEFAULT_ROLE_PERMISSIONS.admin, ...(parsed.admin || {}) },
        supervisor: { ...DEFAULT_ROLE_PERMISSIONS.supervisor, ...(parsed.supervisor || {}) },
        capturista: { ...DEFAULT_ROLE_PERMISSIONS.capturista, ...(parsed.capturista || {}) },
      };
    }
  } catch (err) {
    console.error('Error al leer permisos de localStorage:', err);
  }
  return JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
}

/**
 * Guardar la matriz de permisos por rol en localStorage y en el backend.
 */
export function saveRolePermissions(matrix) {
  try {
    localStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(matrix));
    pushPermissionsToBackend();
    window.dispatchEvent(new Event('padrones_permissions_updated'));
    return true;
  } catch (err) {
    console.error('Error al guardar permisos:', err);
    return false;
  }
}

/**
 * Restablecer permisos a los valores predeterminados normativos.
 */
export function resetRolePermissions() {
  try {
    localStorage.removeItem(STORAGE_KEY_PERMISSIONS);
    localStorage.removeItem(STORAGE_KEY_USER_OVERRIDES);
    fetch('/api/usuarios/permisos', {
      method: 'PUT',
      headers: getAuthHeadersForPerms(),
      body: JSON.stringify({ rolePermissions: DEFAULT_ROLE_PERMISSIONS, userOverrides: {} }),
    }).catch(() => {});
    window.dispatchEvent(new Event('padrones_permissions_updated'));
    return JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
  } catch (err) {
    console.error('Error al restablecer permisos:', err);
    return DEFAULT_ROLE_PERMISSIONS;
  }
}

function normalizeUserKey(u) {
  return String(u || '').trim().replace(/\s+@\s*/g, '@').toLowerCase();
}

/**
 * Obtener excepciones/permisos específicos asignados a un usuario individual.
 * Acepta tanto un ID como un objeto usuario ({ id, usuario, username }).
 */
export function getUserOverrides(userOrId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_OVERRIDES);
    if (raw) {
      const all = JSON.parse(raw);
      if (userOrId && typeof userOrId === 'object') {
        const uname = normalizeUserKey(userOrId.usuario || userOrId.username);
        if (uname && all[uname] && Object.keys(all[uname]).length > 0) {
          return all[uname];
        }
        if (userOrId.id !== undefined && all[String(userOrId.id)]) {
          return all[String(userOrId.id)];
        }
        return {};
      }
      const key = String(userOrId);
      return all[key] || all[normalizeUserKey(key)] || {};
    }
  } catch {
    // Retornar vacío si falla
  }
  return {};
}

/**
 * Guardar excepciones/permisos específicos para un usuario individual (por ID y por username).
 */
export function saveUserOverrides(userOrId, overrides) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_OVERRIDES);
    const all = raw ? JSON.parse(raw) : {};
    if (userOrId && typeof userOrId === 'object') {
      if (userOrId.id !== undefined) {
        all[String(userOrId.id)] = overrides;
      }
      const uname = normalizeUserKey(userOrId.usuario || userOrId.username);
      if (uname) {
        all[uname] = overrides;
      }
    } else {
      all[String(userOrId)] = overrides;
    }
    localStorage.setItem(STORAGE_KEY_USER_OVERRIDES, JSON.stringify(all));
    pushPermissionsToBackend();
    window.dispatchEvent(new Event('padrones_permissions_updated'));
    return true;
  } catch (err) {
    console.error('Error al guardar overrides de usuario:', err);
    return false;
  }
}

/**
 * Verificar si un usuario o rol tiene habilitado un permiso específico.
 * @param {{ id?: string|number, usuario?: string, username?: string, rol?: string }} user
 * @param {string} permissionId (ej. 'beneficiarios.eliminar')
 */
export function checkPermission(user, permissionId) {
  if (!user) return false;
  const role = (user.rol || '').toLowerCase();
  if (role === 'admin') return true; // Administrador siempre tiene acceso total

  // 1. Revisar si el usuario tiene una excepción individual configurada (por username o ID)
  const overrides = getUserOverrides(user);
  if (overrides && typeof overrides[permissionId] === 'boolean') {
    return overrides[permissionId];
  }

  // 2. Revisar la matriz de permisos de su rol
  const roleMatrix = getRolePermissions();
  if (roleMatrix[role] && typeof roleMatrix[role][permissionId] === 'boolean') {
    return roleMatrix[role][permissionId];
  }

  return false;
}
