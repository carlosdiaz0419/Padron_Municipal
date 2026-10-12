import React from 'react';
import { Plus, Shield, CheckCircle } from 'lucide-react';

function AdminUsuarios() {
  const usuariosEjemplo = [
    { id: 1, nombre: 'Lic. Roberto Gómez', usuario: 'admin', rol: 'admin', activo: true },
    { id: 2, nombre: 'Ing. Laura Méndez', usuario: 'supervisor', rol: 'supervisor', activo: true },
    { id: 3, nombre: 'Miguel Ángel Torres', usuario: 'capturista', rol: 'capturista', activo: true },
    { id: 4, nombre: 'Dra. Patricia Silva', usuario: 'consultor', rol: 'consultor', activo: true },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">Administra credenciales, roles asignados y permisos de acceso al sistema.</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Usuario</th>
              <th>Rol Asignado</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosEjemplo.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>{u.nombre}</td>
                <td style={{ color: '#475569' }}>{u.usuario}</td>
                <td>
                  <span className="badge badge--activo" style={{ textTransform: 'capitalize' }}>
                    <Shield size={12} /> {u.rol}
                  </span>
                </td>
                <td>
                  <span className="badge badge--activo">
                    <CheckCircle size={12} /> Activo
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-sm">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsuarios;
