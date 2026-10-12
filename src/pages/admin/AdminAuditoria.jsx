import React from 'react';


function AdminAuditoria() {
  const logs = [
    { id: 1, usuario: 'admin', accion: 'ALTA_USUARIO', detalle: 'Se creó usuario capturista #3', fecha: '2026-10-12 11:20:10' },
    { id: 2, usuario: 'capturista', accion: 'REGISTRO_PADRON', detalle: 'Registro de beneficiario BEN-2026-003', fecha: '2026-10-12 10:45:00' },
    { id: 3, usuario: 'supervisor', accion: 'VALIDACION_APROBADA', detalle: 'Validó expediente BEN-2026-001', fecha: '2026-10-12 09:15:30' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <span>Bitácora de Auditoría</span>
        </h1>
        <p className="page-subtitle">Registro de operaciones realizadas en el sistema para trazabilidad y seguridad.</p>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Operación Realizada</th>
              <th>Detalle de Acción</th>
              <th>Fecha y Hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>{log.usuario}</td>
                <td>
                  <span className="badge badge--inactivo" style={{ fontFamily: 'monospace' }}>
                    {log.accion}
                  </span>
                </td>
                <td style={{ color: '#334155' }}>{log.detalle}</td>
                <td style={{ color: '#64748b', fontSize: '0.84rem' }}>{log.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminAuditoria;
