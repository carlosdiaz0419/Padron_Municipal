export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const DEFAULT_ROLE_PERMISSIONS = {
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

  return res.status(200).json({
    rolePermissions: DEFAULT_ROLE_PERMISSIONS,
    userOverrides: {},
  });
}
