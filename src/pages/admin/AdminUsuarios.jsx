import React, { useState } from 'react';
import { 
  Plus, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  UserPlus,
  KeyRound,
  UserCheck,
  Building2
} from 'lucide-react';

export const DEPENDENCIAS_MUNICIPALES = [
  'Dirección General DIF',
  'Dirección de Asistencia Social',
  'Coordinación de Salud y CEMTRI',
  'Casa del Abuelo y Adultos Mayores',
  'Procuraduría de Protección DIF',
  'Secretaría de Desarrollo Social',
  'Instituto Municipal de las Mujeres',
  'Secretaría de Planeación Municipal',
];

const INITIAL_USERS = [
  { id: 1, nombre: 'Lic. Roberto Gómez', usuario: 'admin', rol: 'admin', dependencia: 'Dirección General DIF', activo: true },
  { id: 2, nombre: 'Ing. Laura Méndez', usuario: 'supervisor', rol: 'supervisor', dependencia: 'Dirección de Asistencia Social', activo: true },
  { id: 3, nombre: 'Miguel Ángel Torres', usuario: 'capturista', rol: 'capturista', dependencia: 'Coordinación de Salud y CEMTRI', activo: true },
  { id: 4, nombre: 'Dra. Patricia Silva', usuario: 'consultor', rol: 'consultor', dependencia: 'Secretaría de Planeación Municipal', activo: true },
];

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState(INITIAL_USERS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [notification, setNotification] = useState(null);

  // Formulario Nuevo Usuario
  const [newUser, setNewUser] = useState({
    nombre: '',
    usuario: '',
    password: '',
    rol: 'capturista',
    dependencia: 'Dirección de Asistencia Social',
    activo: true,
  });

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newUser.nombre.trim() || !newUser.usuario.trim() || !newUser.password.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const existe = usuarios.some((u) => u.usuario.toLowerCase() === newUser.usuario.toLowerCase());
    if (existe) {
      alert(`El nombre de usuario "${newUser.usuario}" ya está en uso.`);
      return;
    }

    const creado = {
      id: Date.now(),
      nombre: newUser.nombre.trim(),
      usuario: newUser.usuario.trim().toLowerCase(),
      rol: newUser.rol,
      dependencia: newUser.dependencia || 'Dirección de Asistencia Social',
      activo: newUser.activo,
    };

    setUsuarios([...usuarios, creado]);
    setShowCreateModal(false);
    setNewUser({ nombre: '', usuario: '', password: '', rol: 'capturista', dependencia: 'Dirección de Asistencia Social', activo: true });
    showToast(`Usuario "${creado.nombre}" registrado exitosamente.`);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingUser.nombre.trim() || !editingUser.usuario.trim()) {
      alert('Por favor complete el nombre y usuario.');
      return;
    }

    setUsuarios(usuarios.map((u) => (u.id === editingUser.id ? editingUser : u)));
    const updatedName = editingUser.nombre;
    setEditingUser(null);
    showToast(`Usuario "${updatedName}" actualizado correctamente.`);
  };

  const handleDeleteUser = (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar al usuario ${nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }
    setUsuarios(usuarios.filter((u) => u.id !== id));
    if (editingUser?.id === id) setEditingUser(null);
    showToast(`Usuario "${nombre}" eliminado del sistema.`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">Administra credenciales, roles asignados y permisos de acceso al sistema.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', cursor: 'pointer' }}
        >
          <Plus size={16} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {notification && (
        <div className={`alert alert--${notification.type}`} style={{ marginBottom: '1.25rem' }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Usuario</th>
              <th>Rol Asignado</th>
              <th>Dependencia / Área</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>{u.nombre}</td>
                <td style={{ color: '#475569', fontFamily: 'monospace' }}>{u.usuario}</td>
                <td>
                  <span className="badge badge--activo" style={{ textTransform: 'capitalize' }}>
                    <Shield size={12} /> {u.rol}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.82rem', color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: 500 }}>
                    <Building2 size={12} style={{ color: '#6366f1' }} /> {u.dependencia || 'DIF Municipal'}
                  </span>
                </td>
                <td>
                  {u.activo ? (
                    <span className="badge badge--activo" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                      <CheckCircle size={12} /> Activo
                    </span>
                  ) : (
                    <span className="badge badge--inactivo" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                      <XCircle size={12} /> Inactivo
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => setEditingUser({ ...u })}
                      className="btn-sm" 
                      style={{ cursor: 'pointer' }}
                      title="Editar usuario"
                    >
                      <Edit3 size={13} />
                      <span>Editar</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(u.id, u.nombre)}
                      className="btn-sm" 
                      style={{ color: '#ef4444', borderColor: '#fecaca', background: '#fff5f5', cursor: 'pointer' }}
                      title="Eliminar usuario"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MODAL: NUEVO USUARIO ── */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <UserPlus size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Nuevo Usuario del Sistema
                </h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Lic. Carlos Morales"
                  value={newUser.nombre}
                  onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Nombre de Usuario (Login) *
                </label>
                <input
                  type="text"
                  placeholder="Ej. cmorales"
                  value={newUser.usuario}
                  onChange={(e) => setNewUser({ ...newUser, usuario: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Contraseña Inicial *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Rol Asignado *
                </label>
                <select
                  value={newUser.rol}
                  onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    background: '#ffffff'
                  }}
                >
                  <option value="admin">Administrador (Control Total)</option>
                  <option value="supervisor">Supervisor (Validación y Reportes)</option>
                  <option value="capturista">Capturista (Registro de Padrón)</option>
                  <option value="consultor">Consultor (Solo Lectura)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Dependencia u Organismo Asignado *
                </label>
                <select
                  value={newUser.dependencia}
                  onChange={(e) => setNewUser({ ...newUser, dependencia: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    background: '#ffffff'
                  }}
                >
                  {DEPENDENCIAS_MUNICIPALES.map((dep) => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-sm"
                  style={{ padding: '0.6rem 1rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.25rem', cursor: 'pointer' }}
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDITAR USUARIO ── */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Edit3 size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Editar Usuario: {editingUser.usuario}
                </h3>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={editingUser.nombre}
                  onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Usuario (ID de Acceso)
                </label>
                <input
                  type="text"
                  value={editingUser.usuario}
                  onChange={(e) => setEditingUser({ ...editingUser, usuario: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Rol Asignado
                </label>
                <select
                  value={editingUser.rol}
                  onChange={(e) => setEditingUser({ ...editingUser, rol: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    background: '#ffffff'
                  }}
                >
                  <option value="admin">Administrador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="capturista">Capturista</option>
                  <option value="consultor">Consultor</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Dependencia u Organismo Asignado
                </label>
                <select
                  value={editingUser.dependencia || 'Dirección de Asistencia Social'}
                  onChange={(e) => setEditingUser({ ...editingUser, dependencia: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    background: '#ffffff'
                  }}
                >
                  {DEPENDENCIAS_MUNICIPALES.map((dep) => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingUser.activo}
                    onChange={(e) => setEditingUser({ ...editingUser, activo: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Usuario Activo en el Sistema</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleDeleteUser(editingUser.id, editingUser.nombre)}
                  className="btn-sm"
                  style={{ color: '#ef4444', borderColor: '#fecaca', background: '#fff5f5', cursor: 'pointer' }}
                >
                  <Trash2 size={13} />
                  <span>Eliminar</span>
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="btn-sm"
                    style={{ padding: '0.6rem 1rem', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '0.6rem 1.25rem', cursor: 'pointer' }}
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsuarios;
