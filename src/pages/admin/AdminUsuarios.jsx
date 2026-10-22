import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import BtnBackDashboard from '../../components/common/BtnBackDashboard';
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
  Building2,
  ShieldCheck,
  RotateCcw,
  Save,
  Search,
  Users,
  Lock,
  Sparkles,
  Layers,
  HelpCircle,
  Key,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Download,
  Check,
  ArrowLeft
} from 'lucide-react';
import { 
  MODULOS_SISTEMA, 
  DEFAULT_ROLE_PERMISSIONS, 
  getRolePermissions, 
  saveRolePermissions, 
  resetRolePermissions,
  getUserOverrides,
  saveUserOverrides
} from '../../services/permissions';
import {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../../services/api';
import './AdminUsuarios.css';

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
  { id: 4, nombre: 'Administrador General DIF', usuario: 'prueba@gmail.com.mx', rol: 'admin', dependencia: 'Dirección General DIF', activo: true, password: '123456789' },
  { id: 5, nombre: 'Capturista DIF Municipal', usuario: 'difmunicipal@gmail.com.mx', rol: 'capturista', dependencia: 'Dirección de Asistencia Social', activo: true, password: 'dif123' },
  { id: 6, nombre: 'Supervisor General DIF', usuario: 'supervisor@gmail.com.mx', rol: 'supervisor', dependencia: 'Dirección de Asistencia Social', activo: true, password: 'supervisor123' },
];

const STORAGE_USERS_KEY = 'padrones_usuarios_list';
const FAKE_DEMO_USERS = new Set(['admin', 'supervisor', 'capturista', 'consultor']);

function normalizeUsername(u) {
  return String(u || '').trim().replace(/\s+@\s*/g, '@').toLowerCase();
}

function AdminUsuarios() {
  // ── Pestaña Activa ('usuarios' | 'permisos') ──
  const [activeTab, setActiveTab] = useState('usuarios');

  // ── Lista de Usuarios ──
  const [usuarios, setUsuarios] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const cleaned = parsed
            .filter((u) => u.rol !== 'consultor' && !FAKE_DEMO_USERS.has(normalizeUsername(u.usuario)))
            .map((u) => {
              const normUser = normalizeUsername(u.usuario);
              if (normUser === 'supervisor@gmail.com.mx') {
                return {
                  ...u,
                  usuario: 'supervisor@gmail.com.mx',
                  nombre: (!u.nombre || u.nombre.includes('@')) ? 'Supervisor General DIF' : u.nombre,
                  rol: 'supervisor',
                  dependencia: u.dependencia || 'Dirección de Asistencia Social',
                };
              }
              return { ...u, usuario: normUser || u.usuario };
            });

          // Eliminar duplicados por usuario normalizado
          const uniqueMap = new Map();
          cleaned.forEach((u) => {
            const key = normalizeUsername(u.usuario);
            if (key && !uniqueMap.has(key)) {
              uniqueMap.set(key, u);
            }
          });
          const deduped = Array.from(uniqueMap.values());

          if (!deduped.some((u) => normalizeUsername(u.usuario) === 'prueba@gmail.com.mx')) {
            deduped.unshift(INITIAL_USERS[0]);
          }
          if (!deduped.some((u) => normalizeUsername(u.usuario) === 'difmunicipal@gmail.com.mx')) {
            deduped.splice(1, 0, INITIAL_USERS[1]);
          }
          if (!deduped.some((u) => normalizeUsername(u.usuario) === 'supervisor@gmail.com.mx')) {
            deduped.splice(2, 0, INITIAL_USERS[2]);
          }
          return deduped;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_USERS;
  });

  // Sincronizar con la Base de Datos del Backend (/api/usuarios) al abrir la vista
  useEffect(() => {
    let mounted = true;
    getUsuarios()
      .then((res) => {
        if (!mounted) return;
        const dbList = Array.isArray(res) ? res : (res?.data || []);
        if (!Array.isArray(dbList) || dbList.length === 0) return;

        setUsuarios((prev) => {
          const mergedMap = new Map();
          prev.forEach((u) => {
            mergedMap.set(normalizeUsername(u.usuario), u);
          });

          dbList.forEach((dbU) => {
            const rawUser = dbU.usuario || dbU.username || '';
            const normUser = normalizeUsername(rawUser);
            if (!normUser) return;
            // Omitir cuentas demo genéricas sin correo si ya están las cuentas reales con correo
            if (['admin', 'capturista', 'supervisor'].includes(normUser) && mergedMap.size >= 3 && !mergedMap.has(normUser)) {
              return;
            }
            const existing = mergedMap.get(normUser);
            if (existing) {
              mergedMap.set(normUser, {
                ...existing,
                id: dbU.id || existing.id,
                usuario: normUser,
                rol: (dbU.rol || existing.rol || 'capturista').toLowerCase(),
                activo: dbU.activo !== undefined ? Boolean(dbU.activo) : existing.activo,
                nombre: (dbU.nombre && !dbU.nombre.includes('@')) ? dbU.nombre : existing.nombre,
                dependencia: dbU.dependencia || existing.dependencia,
              });
            } else {
              mergedMap.set(normUser, {
                id: dbU.id || Date.now(),
                nombre: (dbU.nombre && !dbU.nombre.includes('@'))
                  ? dbU.nombre
                  : normUser === 'supervisor@gmail.com.mx'
                    ? 'Supervisor General DIF'
                    : normUser === 'prueba@gmail.com.mx'
                      ? 'Administrador General DIF'
                      : normUser === 'difmunicipal@gmail.com.mx'
                        ? 'Capturista DIF Municipal'
                        : rawUser,
                usuario: normUser,
                rol: (dbU.rol || 'capturista').toLowerCase(),
                dependencia:
                  dbU.dependencia ||
                  (dbU.rol === 'admin'
                    ? 'Dirección General DIF'
                    : 'Dirección de Asistencia Social'),
                activo: dbU.activo !== false,
                fecha_registro: dbU.creado_en
                  ? new Date(dbU.creado_en).toLocaleDateString('es-MX')
                  : new Date().toLocaleDateString('es-MX'),
              });
            }
          });

          return Array.from(mergedMap.values());
        });
      })
      .catch(() => {
        // Si el backend está desconectado, se mantiene la lista local sincronizada
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Guardar usuarios en localStorage cuando cambien
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(usuarios));
    } catch (e) {
      console.error('Error al guardar usuarios en localStorage:', e);
    }
  }, [usuarios]);

  // ── Matriz de Permisos por Rol ──
  const [rolePermissions, setRolePermissions] = useState(getRolePermissions);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ── Filtros y Búsqueda ──
  const [searchUser, setSearchUser] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos' | 'activos' | 'inactivos'
  const [searchPermission, setSearchPermission] = useState('');
  const [moduleFilter, setModuleFilter] = useState('todos');

  // ── Modales ──
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserNewPassword, setEditUserNewPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Modal de Restablecer Contraseña dedicado
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
    showPassword: false,
    requireChangeNextLogin: true,
  });

  // Modal de Excepciones de Permisos
  const [userOverridesModal, setUserOverridesModal] = useState(null);
  const [userOverridesTemp, setUserOverridesTemp] = useState({});

  // ── Notificaciones Toast ──
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Formulario Nuevo Usuario
  const [newUser, setNewUser] = useState({
    nombre: '',
    usuario: '',
    password: '',
    rol: 'capturista',
    dependencia: 'Dirección de Asistencia Social',
    activo: true,
  });

  // ── CONTEO DE PERMISOS ACTIVOS POR ROL ──
  const rolePermissionCounts = useMemo(() => {
    const roles = ['admin', 'supervisor', 'capturista'];
    const totalPermissions = MODULOS_SISTEMA.reduce((acc, m) => acc + m.permisos.length, 0);
    const counts = {};

    roles.forEach((r) => {
      if (r === 'admin') {
        counts[r] = { active: totalPermissions, total: totalPermissions };
      } else {
        const perms = rolePermissions[r] || {};
        const activeCount = Object.values(perms).filter(Boolean).length;
        counts[r] = { active: activeCount, total: totalPermissions };
      }
    });

    return counts;
  }, [rolePermissions]);

  // ── MANEJADORES DE USUARIOS ──
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newUser.nombre.trim() || !newUser.usuario.trim() || !newUser.password.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const cleanUsuario = normalizeUsername(newUser.usuario);
    const existe = usuarios.some((u) => normalizeUsername(u.usuario) === cleanUsuario);
    if (existe) {
      alert(`El nombre de usuario "${cleanUsuario}" ya está en uso.`);
      return;
    }

    const creado = {
      id: Date.now(),
      nombre: newUser.nombre.trim(),
      usuario: cleanUsuario,
      rol: newUser.rol,
      dependencia: newUser.dependencia || 'Dirección de Asistencia Social',
      activo: newUser.activo,
      password: newUser.password.trim(),
      fecha_registro: new Date().toLocaleDateString('es-MX'),
    };

    try {
      const resDb = await crearUsuario(creado);
      if (resDb?.data?.id) {
        creado.id = resDb.data.id;
      }
    } catch (_) {
      // Continuar con guardado local si falla red
    }

    setUsuarios([...usuarios, creado]);
    setShowCreateModal(false);
    setNewUser({ nombre: '', usuario: '', password: '', rol: 'capturista', dependencia: 'Dirección de Asistencia Social', activo: true });
    showToast(`Usuario "${creado.nombre}" registrado exitosamente con rol ${creado.rol}.`);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser.nombre.trim() || !editingUser.usuario.trim()) {
      alert('Por favor complete el nombre y usuario.');
      return;
    }

    const cleanUsuario = normalizeUsername(editingUser.usuario);
    const payloadUpdate = {
      ...editingUser,
      usuario: cleanUsuario,
    };
    if (editUserNewPassword.trim()) {
      payloadUpdate.password = editUserNewPassword.trim();
      payloadUpdate.fecha_cambio_clave = new Date().toLocaleDateString('es-MX');
    }

    try {
      await actualizarUsuario(editingUser.id, payloadUpdate);
    } catch (_) {}

    setUsuarios(
      usuarios.map((u) => (u.id === editingUser.id ? payloadUpdate : u))
    );
    const updatedName = editingUser.nombre;
    setEditingUser(null);
    setEditUserNewPassword('');
    setShowEditPassword(false);
    showToast(`Usuario "${updatedName}" actualizado correctamente.`);
  };

  const handleDeleteUser = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar al usuario ${nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await eliminarUsuario(id);
    } catch (_) {}
    setUsuarios(usuarios.filter((u) => u.id !== id));
    if (editingUser?.id === id) setEditingUser(null);
    showToast(`Usuario "${nombre}" eliminado del sistema.`);
  };

  const handleToggleUserActive = async (user) => {
    const nuevoEstado = !user.activo;
    try {
      await actualizarUsuario(user.id, { ...user, activo: nuevoEstado });
    } catch (_) {}
    setUsuarios((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, activo: nuevoEstado } : u))
    );
    showToast(`Usuario "${user.nombre}" marcado como ${nuevoEstado ? 'Activo' : 'Inactivo'}.`);
  };

  // ── MANEJADORES DE CAMBIO DE CONTRASEÑA ──
  const handleOpenPasswordModal = (user) => {
    setPasswordModalUser(user);
    setPasswordForm({
      newPassword: '',
      confirmPassword: '',
      showPassword: false,
      requireChangeNextLogin: true,
    });
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `DIF${new Date().getFullYear()}-${code}!`;
    setPasswordForm((prev) => ({
      ...prev,
      newPassword: generated,
      confirmPassword: generated,
      showPassword: true,
    }));
    showToast('Contraseña segura generada automáticamente.');
  };

  const handleCopyPassword = () => {
    if (!passwordForm.newPassword) return;
    navigator.clipboard.writeText(passwordForm.newPassword);
    showToast('Contraseña copiada al portapapeles.');
  };

  const handleSavePasswordReset = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword.trim()) {
      alert('Por favor ingrese la nueva contraseña.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('La confirmación de la contraseña no coincide.');
      return;
    }

    try {
      await actualizarUsuario(passwordModalUser.id, {
        ...passwordModalUser,
        password: passwordForm.newPassword.trim(),
      });
    } catch (_) {}

    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === passwordModalUser.id
          ? {
              ...u,
              password: passwordForm.newPassword.trim(),
              fecha_cambio_clave: new Date().toLocaleDateString('es-MX'),
              requiere_cambio_clave: passwordForm.requireChangeNextLogin,
            }
          : u
      )
    );
    showToast(`Contraseña de "${passwordModalUser.nombre}" restablecida con éxito.`);
    setPasswordModalUser(null);
  };

  // ── EXPORTAR DIRECTORIO DE USUARIOS A CSV ──
  const handleExportUsersCSV = () => {
    const header = 'ID,Nombre_Completo,Usuario,Rol,Dependencia,Estado,Fecha_Actualizacion\n';
    const rows = filteredUsers.map((u) =>
      `"${u.id}","${u.nombre}","${u.usuario}","${u.rol}","${u.dependencia || 'DIF Municipal'}","${u.activo ? 'Activo' : 'Inactivo'}","${u.fecha_cambio_clave || new Date().toLocaleDateString('es-MX')}"`
    );
    const csvContent = '\uFEFF' + header + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Directorio_Usuarios_DIF_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Directorio con ${filteredUsers.length} usuarios exportado a Excel/CSV.`);
  };

  // ── MANEJADORES DE MATRIZ DE PERMISOS ──
  const handleTogglePermission = (role, permissionId) => {
    if (role === 'admin') return;

    setRolePermissions((prev) => {
      const currentRolePerms = prev[role] || {};
      const newVal = !currentRolePerms[permissionId];
      return {
        ...prev,
        [role]: {
          ...currentRolePerms,
          [permissionId]: newVal,
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleSavePermissions = () => {
    const success = saveRolePermissions(rolePermissions);
    if (success) {
      setHasUnsavedChanges(false);
      showToast('¡Matriz de permisos guardada y aplicada exitosamente en todo el sistema DIF!');
    } else {
      showToast('Ocurrió un error al guardar la matriz de permisos.', 'error');
    }
  };

  const handleResetPermissions = () => {
    if (!window.confirm('¿Deseas restablecer todos los permisos a la configuración normativa predeterminada del DIF?')) {
      return;
    }
    const defaults = resetRolePermissions();
    setRolePermissions(defaults);
    setHasUnsavedChanges(false);
    showToast('Permisos restablecidos a los valores normativos institucionales.');
  };

  // ── MANEJADOR DE EXCEPCIONES INDIVIDUALES POR USUARIO ──
  const handleOpenUserOverrides = (user) => {
    setUserOverridesModal(user);
    const existing = getUserOverrides(user);
    setUserOverridesTemp({ ...existing });
  };

  const handleSaveUserOverrides = () => {
    if (!userOverridesModal) return;
    saveUserOverrides(userOverridesModal, userOverridesTemp);
    showToast(`Permisos personalizados de "${userOverridesModal.nombre}" actualizados correctamente.`);
    setUserOverridesModal(null);
  };

  const handleClearUserOverrides = () => {
    setUserOverridesTemp({});
  };

  // ── FILTRADO DE USUARIOS ──
  const filteredUsers = useMemo(() => {
    let list = usuarios;
    if (statusFilter === 'activos') {
      list = list.filter((u) => u.activo);
    } else if (statusFilter === 'inactivos') {
      list = list.filter((u) => !u.activo);
    }
    if (!searchUser.trim()) return list;
    const term = searchUser.toLowerCase();
    return list.filter(
      (u) =>
        u.nombre.toLowerCase().includes(term) ||
        u.usuario.toLowerCase().includes(term) ||
        u.rol.toLowerCase().includes(term) ||
        (u.dependencia && u.dependencia.toLowerCase().includes(term))
    );
  }, [usuarios, searchUser, statusFilter]);

  // ── FILTRADO DE MÓDULOS DE PERMISOS ──
  const filteredModules = useMemo(() => {
    let list = MODULOS_SISTEMA;
    if (moduleFilter !== 'todos') {
      list = list.filter((m) => m.id === moduleFilter);
    }
    if (searchPermission.trim()) {
      const term = searchPermission.toLowerCase();
      list = list.map((m) => {
        const matchingPerms = m.permisos.filter(
          (p) => p.nombre.toLowerCase().includes(term) || p.desc.toLowerCase().includes(term) || p.id.toLowerCase().includes(term)
        );
        return { ...m, permisos: matchingPerms };
      }).filter((m) => m.permisos.length > 0);
    }
    return list;
  }, [moduleFilter, searchPermission]);

  return (
    <div>
      {/* Botón Volver al Dashboard en la parte superior izquierda */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
        <BtnBackDashboard to="/admin" />
      </div>

      {/* ── ENCABEZADO DE PÁGINA ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">
            <ShieldCheck size={26} style={{ color: '#2563eb' }} />
            <span>Usuarios, Credenciales y Permisos</span>
          </h1>
          <p className="page-subtitle">
            Gestión integral de funcionarios municipales, restablecimiento de contraseñas y matriz de permisos por área.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {activeTab === 'usuarios' ? (
            <>
              <button
                onClick={handleExportUsersCSV}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1rem', cursor: 'pointer' }}
                title="Descargar lista de funcionarios en Excel / CSV"
              >
                <Download size={16} />
                <span>Exportar</span>
              </button>
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', cursor: 'pointer' }}
              >
                <UserPlus size={16} />
                <span>Nuevo Usuario</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleResetPermissions}
                className="btn-reset-perm"
                title="Restablecer todos los permisos a la norma oficial"
              >
                <RotateCcw size={15} />
                <span>Restablecer</span>
              </button>
              <button
                onClick={handleSavePermissions}
                className={`btn-save-perm ${hasUnsavedChanges ? 'btn-save-perm--unsaved' : ''}`}
              >
                <Save size={16} />
                <span>{hasUnsavedChanges ? 'Guardar Cambios Pendientes' : 'Permisos Guardados'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── NOTIFICACIONES TOAST ── */}
      {notification && (
        <div className={`alert alert--${notification.type}`} style={{ marginBottom: '1.25rem' }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* ── PESTAÑAS PRINCIPALES (TABS) ── */}
      <div className="admin-tabs-nav">
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`admin-tab-btn ${activeTab === 'usuarios' ? 'admin-tab-btn--active' : ''}`}
        >
          <Users size={18} />
          <span>Cuentas de Usuarios</span>
          <span className="admin-tab-badge">{usuarios.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('permisos')}
          className={`admin-tab-btn ${activeTab === 'permisos' ? 'admin-tab-btn--active' : ''}`}
        >
          <KeyRound size={18} />
          <span>Matriz de Permisos por Rol</span>
          <span className="admin-tab-badge" style={{ background: hasUnsavedChanges ? '#fef3c7' : '#ecfdf5', color: hasUnsavedChanges ? '#b45309' : '#047857' }}>
            {hasUnsavedChanges ? 'Cambios sin guardar' : 'Configurado'}
          </span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          PESTAÑA 1: CUENTAS DE USUARIOS
          ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'usuarios' && (
        <div>
          {/* Barra de Filtros y Búsqueda */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="perm-search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, usuario o rol..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  style={{ width: '280px' }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="perm-filter-select"
              >
                <option value="todos">Todos los Estados</option>
                <option value="activos">Solo Activos</option>
                <option value="inactivos">Solo Inactivos</option>
              </select>
            </div>

            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Mostrando <strong>{filteredUsers.length}</strong> de {usuarios.length} funcionarios
            </span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Usuario</th>
                  <th>Rol Asignado</th>
                  <th>Dependencia / Área</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones de Cuenta</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
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
                      <button
                        onClick={() => handleToggleUserActive(u)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                        title="Haga clic para alternar entre Activo e Inactivo"
                      >
                        {u.activo ? (
                          <span className="badge badge--activo" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                            <CheckCircle size={12} /> Activo
                          </span>
                        ) : (
                          <span className="badge badge--inactivo" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                            <XCircle size={12} /> Inactivo
                          </span>
                        )}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {/* Botón de Cambiar Contraseña */}
                        <button
                          onClick={() => handleOpenPasswordModal(u)}
                          className="btn-sm"
                          style={{ color: '#d97706', borderColor: '#fde68a', background: '#fffbeb', cursor: 'pointer' }}
                          title="Restablecer contraseña de este usuario"
                        >
                          <Key size={13} />
                          <span>Contraseña</span>
                        </button>

                        {/* Botón de Permisos Individuales */}
                        <button
                          onClick={() => handleOpenUserOverrides(u)}
                          className="btn-sm"
                          style={{ color: '#2563eb', borderColor: '#bfdbfe', background: '#eff6ff', cursor: 'pointer' }}
                          title="Gestionar permisos específicos para este usuario"
                        >
                          <KeyRound size={13} />
                          <span>Permisos</span>
                        </button>

                        {/* Botón de Editar Usuario */}
                        <button 
                          onClick={() => {
                            setEditingUser({ ...u });
                            setEditUserNewPassword('');
                            setShowEditPassword(false);
                          }}
                          className="btn-sm" 
                          style={{ cursor: 'pointer' }}
                          title="Editar usuario"
                        >
                          <Edit3 size={13} />
                          <span>Editar</span>
                        </button>

                        {/* Botón Eliminar */}
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
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No se encontraron usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          PESTAÑA 2: MATRIZ DE PERMISOS POR ROL
          ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'permisos' && (
        <div>
          {/* Tarjetas Informativas de Roles */}
          <div className="role-cards-grid">
            <div className="role-summary-card role-summary-card--admin">
              <div className="role-card__info">
                <span className="role-card__name">
                  Administrador
                  <Lock size={13} style={{ color: '#6366f1' }} />
                </span>
                <span className="role-card__desc">Control maestro e inmutable</span>
                <div className="role-card__count">
                  <span className="role-card__badge role-card__badge--admin">
                    {rolePermissionCounts.admin.active} / {rolePermissionCounts.admin.total} permisos
                  </span>
                </div>
              </div>
              <div className="role-card__icon-box">
                <ShieldCheck size={22} />
              </div>
            </div>

            <div className="role-summary-card role-summary-card--supervisor">
              <div className="role-card__info">
                <span className="role-card__name">Supervisor</span>
                <span className="role-card__desc">Validación, dictamen y reportes</span>
                <div className="role-card__count">
                  <span className="role-card__badge role-card__badge--supervisor">
                    {rolePermissionCounts.supervisor.active} / {rolePermissionCounts.supervisor.total} activos
                  </span>
                </div>
              </div>
              <div className="role-card__icon-box">
                <CheckCircle2 size={22} />
              </div>
            </div>

            <div className="role-summary-card role-summary-card--capturista">
              <div className="role-card__info">
                <span className="role-card__name">Capturista</span>
                <span className="role-card__desc">Registro de padrón y expedientes</span>
                <div className="role-card__count">
                  <span className="role-card__badge role-card__badge--capturista">
                    {rolePermissionCounts.capturista.active} / {rolePermissionCounts.capturista.total} activos
                  </span>
                </div>
              </div>
              <div className="role-card__icon-box">
                <UserPlus size={22} />
              </div>
            </div>
          </div>

          {/* Barra de Herramientas y Filtros de Matriz */}
          <div className="perm-toolbar">
            <div className="perm-toolbar__filters">
              <div className="perm-search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Filtrar permisos o acciones..."
                  value={searchPermission}
                  onChange={(e) => setSearchPermission(e.target.value)}
                />
              </div>

              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="perm-filter-select"
              >
                <option value="todos">Todos los Módulos ({MODULOS_SISTEMA.length})</option>
                {MODULOS_SISTEMA.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="perm-toolbar__actions">
              {hasUnsavedChanges && (
                <span style={{ fontSize: '0.82rem', color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={15} /> Tienes cambios sin guardar
                </span>
              )}
              <button
                onClick={handleResetPermissions}
                className="btn-reset-perm"
                title="Restablecer valores originales"
              >
                <RotateCcw size={14} />
                <span>Restablecer</span>
              </button>
              <button
                onClick={handleSavePermissions}
                className={`btn-save-perm ${hasUnsavedChanges ? 'btn-save-perm--unsaved' : ''}`}
              >
                <Save size={15} />
                <span>{hasUnsavedChanges ? 'Guardar Cambios' : 'Permisos Guardados'}</span>
              </button>
            </div>
          </div>

          {/* Tabla de Matriz de Permisos */}
          <div className="perm-matrix-wrapper">
            <table className="perm-matrix-table">
              <thead>
                <tr>
                  <th style={{ width: '55%' }}>Capacidad / Acción del Sistema</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Shield size={14} style={{ color: '#6366f1' }} />
                      <span>Admin</span>
                    </div>
                  </th>
                  <th style={{ width: '15%', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                      <span>Supervisor</span>
                    </div>
                  </th>
                  <th style={{ width: '15%', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <UserCheck size={14} style={{ color: '#f59e0b' }} />
                      <span>Capturista</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredModules.map((modulo) => (
                  <React.Fragment key={modulo.id}>
                    {/* Fila separadora por Módulo */}
                    <tr className="perm-module-row">
                      <td colSpan={4}>
                        <div className="perm-module-header">
                          <div className="perm-module-title">
                            <Layers size={16} style={{ color: '#2563eb' }} />
                            <span>{modulo.nombre}</span>
                            <span className="perm-module-desc">({modulo.descripcion})</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                            {modulo.permisos.length} {modulo.permisos.length === 1 ? 'permiso' : 'permisos'}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Filas de Permisos individuales */}
                    {modulo.permisos.map((p) => (
                      <tr key={p.id} className="perm-row">
                        <td>
                          <span className="perm-action-name">{p.nombre}</span>
                          <span className="perm-action-desc">{p.desc}</span>
                        </td>

                        {/* Administrador (Control Total Fijo) */}
                        <td style={{ textAlign: 'center' }}>
                          <span className="admin-lock-badge" title="El rol Administrador retiene acceso maestro irrestricto">
                            <Lock size={11} /> Control Total
                          </span>
                        </td>

                        {/* Supervisor Toggle */}
                        <td style={{ textAlign: 'center' }}>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={!!rolePermissions.supervisor?.[p.id]}
                              onChange={() => handleTogglePermission('supervisor', p.id)}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </td>

                        {/* Capturista Toggle */}
                        <td style={{ textAlign: 'center' }}>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={!!rolePermissions.capturista?.[p.id]}
                              onChange={() => handleTogglePermission('capturista', p.id)}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}

                {filteredModules.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      No se encontraron permisos que coincidan con los criterios de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: RESTABLECER CONTRASEÑA DE USUARIO (DEDICADO)
          ══════════════════════════════════════════════════════════════ */}
      {passwordModalUser && (
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
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              background: '#fffbeb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Key size={20} color="#d97706" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#92400e' }}>
                  Restablecer Contraseña
                </h3>
              </div>
              <button 
                onClick={() => setPasswordModalUser(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePasswordReset} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.84rem', color: '#64748b' }}>Funcionario:</div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                  {passwordModalUser.nombre}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Usuario: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0369a1' }}>{passwordModalUser.usuario}</span> | Rol: <span style={{ textTransform: 'capitalize' }}>{passwordModalUser.rol}</span>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Nueva Contraseña *
                </label>
                <div className="password-input-group">
                  <input
                    type={passwordForm.showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordForm({ ...passwordForm, showPassword: !passwordForm.showPassword })}
                    className="password-toggle-btn"
                    title={passwordForm.showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {passwordForm.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Barra de utilidades de contraseña */}
                <div className="password-generator-bar">
                  <span style={{ color: '#64748b' }}>¿Deseas una clave recomendada?</span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="btn-generate-pwd"
                      title="Generar contraseña automática institucional"
                    >
                      <RefreshCw size={12} />
                      <span>Generar</span>
                    </button>
                    {passwordForm.newPassword && (
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="btn-copy-pwd"
                        title="Copiar contraseña generada"
                      >
                        <Copy size={12} />
                        <span>Copiar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type={passwordForm.showPassword ? 'text' : 'password'}
                  placeholder="Repita la nueva contraseña"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={passwordForm.requireChangeNextLogin}
                    onChange={(e) => setPasswordForm({ ...passwordForm, requireChangeNextLogin: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Requerir cambio de contraseña en el próximo inicio de sesión</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="btn-sm"
                  style={{ padding: '0.6rem 1rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.25rem', cursor: 'pointer', background: '#d97706', borderColor: '#d97706' }}
                >
                  Actualizar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: EXCEPCIONES INDIVIDUALES DE PERMISOS POR USUARIO
          ══════════════════════════════════════════════════════════════ */}
      {userOverridesModal && (
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
          <div className="user-overrides-modal" style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Header Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <KeyRound size={20} color="#2563eb" />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    Permisos de: {userOverridesModal.nombre}
                  </h3>
                </div>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Rol base: <strong style={{ textTransform: 'capitalize' }}>{userOverridesModal.rol}</strong> | Dependencia: {userOverridesModal.dependencia}
                </p>
              </div>
              <button 
                onClick={() => setUserOverridesModal(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo del Modal de Excepciones */}
            <div className="user-overrides-body">
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.84rem', color: '#0369a1', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <HelpCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Aquí puedes asignar <strong>permisos especiales</strong> a este funcionario específico. Puedes forzar que tenga acceso a una acción, denegarlo explícitamente, o dejarlo en <em>"Heredar del Rol"</em> para que siga las reglas generales.
                </span>
              </div>

              {MODULOS_SISTEMA.map((modulo) => (
                <div key={modulo.id} style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>
                    {modulo.nombre}
                  </h4>
                  {modulo.permisos.map((p) => {
                    const currentOverride = userOverridesTemp[p.id];
                    const roleDefault = rolePermissions[userOverridesModal.rol]?.[p.id] ?? false;

                    return (
                      <div key={p.id} className="override-perm-item">
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.86rem', color: '#1e293b' }}>{p.nombre}</span>
                          <span style={{ display: 'block', fontSize: '0.76rem', color: '#64748b' }}>
                            Por rol ({userOverridesModal.rol}): {roleDefault ? 'Permitido' : 'No permitido'}
                          </span>
                        </div>

                        <div className="override-btn-group">
                          <button
                            type="button"
                            onClick={() => {
                              const copy = { ...userOverridesTemp };
                              delete copy[p.id];
                              setUserOverridesTemp(copy);
                            }}
                            className={`override-chip-btn ${currentOverride === undefined ? 'override-chip-btn--active-inherit' : ''}`}
                            title="Seguir regla del rol"
                          >
                            Heredar Rol
                          </button>

                          <button
                            type="button"
                            onClick={() => setUserOverridesTemp({ ...userOverridesTemp, [p.id]: true })}
                            className={`override-chip-btn ${currentOverride === true ? 'override-chip-btn--active-allow' : ''}`}
                            title="Forzar acceso concedido para este usuario"
                          >
                            Permitir
                          </button>

                          <button
                            type="button"
                            onClick={() => setUserOverridesTemp({ ...userOverridesTemp, [p.id]: false })}
                            className={`override-chip-btn ${currentOverride === false ? 'override-chip-btn--active-deny' : ''}`}
                            title="Bloquear acceso para este usuario"
                          >
                            Denegar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              borderTop: '1px solid #f1f5f9',
              background: '#f8fafc'
            }}>
              <button
                type="button"
                onClick={handleClearUserOverrides}
                className="btn-sm"
                style={{ cursor: 'pointer' }}
              >
                Limpiar Excepciones (100% Rol)
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setUserOverridesModal(null)}
                  className="btn-sm"
                  style={{ padding: '0.6rem 1rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveUserOverrides}
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.25rem', cursor: 'pointer' }}
                >
                  Guardar Excepciones
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: NUEVO USUARIO
          ══════════════════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════════════════
          MODAL: EDITAR USUARIO
          ══════════════════════════════════════════════════════════════ */}
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
            maxWidth: '500px',
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

              {/* Campo opcional de nueva contraseña en el modal de edición */}
              <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Cambiar Contraseña (Opcional)
                </label>
                <div className="password-input-group">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder="Dejar en blanco para conservar la actual"
                    value={editUserNewPassword}
                    onChange={(e) => setEditUserNewPassword(e.target.value)}
                    style={{ background: '#ffffff' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="password-toggle-btn"
                  >
                    {showEditPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
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
