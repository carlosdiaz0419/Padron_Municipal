/**
 * formatters.js — Utilidades de formato para la UI.
 */

/**
 * formatFecha — Formatea una fecha ISO a formato legible en español.
 * @param {string} isoString
 * @returns {string} e.g. "12 de octubre de 2026"
 */
export function formatFecha(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * formatNombre — Capitaliza cada palabra de un nombre.
 * @param {string} str
 * @returns {string}
 */
export function formatNombre(str = '') {
  return str
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * ROLES — Mapa de roles a etiquetas amigables.
 */
export const ROLES = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  capturista: 'Capturista',
};

/**
 * ESTATUS — Etiquetas de estatus de beneficiarios.
 */
export const ESTATUS = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  pendiente: 'Pendiente de validación',
  rechazado: 'Rechazado',
};
