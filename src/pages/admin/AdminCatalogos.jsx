import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BtnBackDashboard from '../../components/common/BtnBackDashboard';
import { 
  Plus, 
  Layers, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Settings, 
  Trash2, 
  X, 
  Check, 
  FolderPlus,
  ArrowLeft
} from 'lucide-react';
import {
  getCatalogosServicios,
  createCatalogoServicio,
  updateCatalogoServicio,
  deleteCatalogoServicio,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function AdminCatalogos() {
  const { hasPermission } = useAuth();
  const canCrear = hasPermission('catalogos.crear');
  const canEditar = hasPermission('catalogos.editar');

  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [configuringService, setConfiguringService] = useState(null);

  // Formulario Nuevo Servicio
  const [newServicio, setNewServicio] = useState({
    codigo: '',
    nombre: '',
    categoria: 'CEMTRI',
  });

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const sortMenorAMayor = (lista) =>
    [...lista].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

  useEffect(() => {
    async function loadCatalogos() {
      try {
        setLoading(true);
        const data = await getCatalogosServicios();
        if (Array.isArray(data)) {
          setServicios(sortMenorAMayor(data));
        } else if (data && typeof data === 'object') {
          const flattened = Object.entries(data).flatMap(([catKey, items]) => {
            if (Array.isArray(items)) {
              return items.map((item) => ({ ...item, categoria_grupo: catKey, categoria: item.categoria || catKey }));
            }
            return [];
          });
          setServicios(sortMenorAMayor(flattened));
        }
      } catch (err) {
        setError(err.message || 'Error al obtener catálogos de servicios');
      } finally {
        setLoading(false);
      }
    }
    loadCatalogos();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newServicio.nombre.trim() || !newServicio.codigo.trim()) {
      alert('Por favor complete el código y nombre del servicio.');
      return;
    }

    const payload = {
      codigo: newServicio.codigo.trim().toUpperCase(),
      nombre: newServicio.nombre.trim(),
      categoria: newServicio.categoria,
    };

    try {
      const creado = await createCatalogoServicio(payload);
      const nuevo = {
        id: creado?.id || (servicios.length > 0 ? Math.max(...servicios.map((s) => s.id || 0)) + 1 : 1),
        codigo: creado?.codigo || payload.codigo,
        clave: (creado?.codigo || payload.codigo).toLowerCase(),
        nombre: creado?.nombre || payload.nombre,
        categoria: creado?.categoria || payload.categoria,
      };
      setServicios((prev) => sortMenorAMayor([...prev, nuevo]));
    } catch (_) {
      const nuevo = {
        id: servicios.length > 0 ? Math.max(...servicios.map((s) => s.id || 0)) + 1 : 1,
        codigo: payload.codigo,
        clave: payload.codigo.toLowerCase(),
        nombre: payload.nombre,
        categoria: payload.categoria,
      };
      setServicios((prev) => sortMenorAMayor([...prev, nuevo]));
    }

    setShowCreateModal(false);
    setNewServicio({ codigo: '', nombre: '', categoria: 'CEMTRI' });
    showToast(`Servicio "${payload.nombre}" agregado con éxito al catálogo.`);
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    if (!configuringService.nombre.trim() || !(configuringService.codigo || configuringService.clave || '').trim()) {
      alert('Por favor complete todos los campos.');
      return;
    }

    const payload = {
      codigo: (configuringService.codigo || configuringService.clave || '').trim(),
      nombre: configuringService.nombre.trim(),
      categoria: configuringService.categoria || configuringService.categoria_grupo || 'General',
    };

    try {
      await updateCatalogoServicio(configuringService.id, payload);
    } catch (_) {}

    setServicios((prev) =>
      sortMenorAMayor(
        prev.map((s) => (s.id === configuringService.id ? { ...s, ...configuringService, ...payload } : s))
      )
    );
    const updatedName = configuringService.nombre;
    setConfiguringService(null);
    showToast(`Servicio "${updatedName}" actualizado correctamente.`);
  };

  const handleDeleteService = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar el servicio "${nombre}" del catálogo?`)) {
      return;
    }
    try {
      await deleteCatalogoServicio(id);
    } catch (_) {}
    setServicios((prev) => sortMenorAMayor(prev.filter((s) => s.id !== id)));
    if (configuringService?.id === id) setConfiguringService(null);
    showToast(`Servicio "${nombre}" eliminado de la base de datos.`);
  };

  return (
    <div>
      {/* Botón Volver al Dashboard en la parte superior izquierda */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
        <BtnBackDashboard to="/admin" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Catálogos de Servicios</h1>
          <p className="page-subtitle">Catálogo institucional de servicios y apoyos con IDs por categoría (GET /api/catalogos/servicios).</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {canCrear && (
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', cursor: 'pointer' }}
            >
              <Plus size={16} />
              <span>Nuevo Servicio</span>
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className={`alert alert--${notification.type}`} style={{ marginBottom: '1.25rem' }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={28} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Cargando catálogo de servicios...</p>
        </div>
      )}

      {error && (
        <div className="alert alert--error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {!loading && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Código / Clave</th>
                <th>Nombre del Servicio</th>
                <th>Categoría</th>
                <th style={{ textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {servicios.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                    No hay servicios registrados en el catálogo.
                  </td>
                </tr>
              ) : (
                servicios.map((s) => (
                  <tr key={s.id || s.clave || s.codigo}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0284c7' }}>#{s.id}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.codigo || s.clave}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{s.nombre}</td>
                    <td>
                      <span className="badge badge--activo" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                        <Layers size={12} /> {s.categoria || s.categoria_grupo || 'General'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {canEditar ? (
                        <button 
                          onClick={() => setConfiguringService({ ...s })}
                          className="btn-sm" 
                          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          title="Configurar servicio"
                        >
                          <Settings size={13} />
                          <span>Configurar</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Solo lectura</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL: NUEVO SERVICIO ── */}
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
                <FolderPlus size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Registrar Nuevo Servicio / Apoyo
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
                  Código o Abreviatura Oficial *
                </label>
                <input
                  type="text"
                  placeholder="Ej. T.F. o AND"
                  value={newServicio.codigo}
                  onChange={(e) => setNewServicio({ ...newServicio, codigo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Nombre Oficial del Servicio o Apoyo *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Terapia Física Especializada"
                  value={newServicio.nombre}
                  onChange={(e) => setNewServicio({ ...newServicio, nombre: e.target.value })}
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
                  Categoría Institucional *
                </label>
                <select
                  value={newServicio.categoria}
                  onChange={(e) => setNewServicio({ ...newServicio, categoria: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    background: '#ffffff'
                  }}
                >
                  <option value="Salud - CEMTRI">Salud - CEMTRI</option>
                  <option value="Ayudas Técnicas">Ayudas Técnicas</option>
                  <option value="Jurídica">Asistencia Jurídica</option>
                  <option value="Nutrición">Nutrición y Alimentación</option>
                  <option value="Casa del Abuelo">Casa del Abuelo</option>
                  <option value="Grupos Vulnerables">Grupos Vulnerables</option>
                  <option value="General">General</option>
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
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIGURAR SERVICIO ── */}
      {configuringService && (
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
                <Settings size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Configurar Servicio #{configuringService.id}
                </h3>
              </div>
              <button 
                onClick={() => setConfiguringService(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfigSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Código / Clave
                </label>
                <input
                  type="text"
                  value={configuringService.codigo || configuringService.clave || ''}
                  onChange={(e) => setConfiguringService({ ...configuringService, codigo: e.target.value })}
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
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  value={configuringService.nombre || ''}
                  onChange={(e) => setConfiguringService({ ...configuringService, nombre: e.target.value })}
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
                  Categoría
                </label>
                <select
                  value={configuringService.categoria || configuringService.categoria_grupo || 'General'}
                  onChange={(e) => setConfiguringService({ ...configuringService, categoria: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    background: '#ffffff'
                  }}
                >
                  <option value="Salud - CEMTRI">Salud - CEMTRI</option>
                  <option value="Ayudas Técnicas">Ayudas Técnicas</option>
                  <option value="Jurídica">Asistencia Jurídica</option>
                  <option value="Nutrición">Nutrición y Alimentación</option>
                  <option value="Casa del Abuelo">Casa del Abuelo</option>
                  <option value="Grupos Vulnerables">Grupos Vulnerables</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleDeleteService(configuringService.id, configuringService.nombre)}
                  className="btn-sm"
                  style={{ color: '#ef4444', borderColor: '#fecaca', background: '#fff5f5', cursor: 'pointer' }}
                >
                  <Trash2 size={13} />
                  <span>Eliminar</span>
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setConfiguringService(null)}
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
                    Actualizar
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

export default AdminCatalogos;
