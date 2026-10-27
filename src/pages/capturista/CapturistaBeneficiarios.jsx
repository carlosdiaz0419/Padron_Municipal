import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BtnBackDashboard from '../../components/common/BtnBackDashboard';
import { 
  getBeneficiarios, 
  eliminarBeneficiario, 
  agregarSolicitudBeneficiario,
  getCatalogosServicios 
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, 
  Edit3, 
  Trash2,
  FilePlus2,
  AlertCircle, 
  Loader2, 
  CheckCircle, 
  Clock, 
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  Download,
  FileSpreadsheet,
  Printer,
  ArrowLeft
} from 'lucide-react';
import { exportToExcel, exportToPDF, exportFichaBeneficiarioPDF, COLUMNAS_PADRON_COMPLETO } from '../../utils/exportUtils';

/**
 * CapturistaBeneficiarios — Listado de beneficiarios conectado con rutas completas:
 * - GET /api/beneficiarios (con q, curp, page, limit)
 * - DELETE /api/beneficiarios/:id
 * - POST /api/beneficiarios/:id/solicitudes
 */
function CapturistaBeneficiarios() {
  const { user, hasPermission } = useAuth();
  const rolePrefix = `/${(user?.rol || 'capturista').toLowerCase()}/beneficiarios`;
  const canVer = hasPermission('beneficiarios.ver');
  const canCrear = hasPermission('beneficiarios.crear');
  const canEditar = hasPermission('beneficiarios.editar');
  const canEliminar = hasPermission('beneficiarios.eliminar');
  const canSolicitudes = hasPermission('beneficiarios.solicitudes');
  // En el Padrón de Beneficiarios, los botones de descarga de Excel y PDF siempre están habilitados para todos los usuarios
  const canExportar = true;

  const [beneficiarios, setBeneficiarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Estado para modal de Nueva Solicitud (POST /api/beneficiarios/:id/solicitudes)
  const [modalBeneficiario, setModalBeneficiario] = useState(null);
  const [catalogoServicios, setCatalogoServicios] = useState([]);
  const [solicitudForm, setSolicitudForm] = useState({
    tipo_ayuda_solicitada: '',
    observaciones: '',
    fecha_solicitud: new Date().toISOString().split('T')[0]
  });
  const [submittingSolicitud, setSubmittingSolicitud] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const cargarBeneficiarios = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit,
      };
      const trimmed = searchTerm.trim();
      if (trimmed) {
        // Si tiene formato de CURP (18 caracteres)
        if (/^[A-Z]{4}\d{6}[HM][A-Z0-9]{7}$/i.test(trimmed)) {
          params.curp = trimmed.toUpperCase();
        } else {
          params.q = trimmed;
        }
      }

      const res = await getBeneficiarios(params);
      const list = res?.beneficiarios || (Array.isArray(res) ? res : []);
      setBeneficiarios(list);
      setTotalPages(res?.totalPaginas || Math.ceil((res?.total || list.length) / limit) || 1);
      setTotalCount(res?.total ?? list.length);
    } catch (err) {
      setError(err.message || 'Error al obtener la lista de beneficiarios');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm]);

  useEffect(() => {
    cargarBeneficiarios();
  }, [cargarBeneficiarios]);

  // Cargar catálogo de servicios para el modal
  useEffect(() => {
    async function loadCatalogos() {
      try {
        const data = await getCatalogosServicios();
        if (Array.isArray(data)) {
          setCatalogoServicios(data);
        } else if (data && typeof data === 'object') {
          const list = Object.values(data).flat();
          setCatalogoServicios(list);
        }
      } catch {
        // En caso de error, el modal aún permite escritura manual
      }
    }
    loadCatalogos();
  }, []);

  const columnasExportar = COLUMNAS_PADRON_COMPLETO;

  const handleExportExcel = async () => {
    try {
      let dataToExport = beneficiarios;
      if (totalCount > beneficiarios.length) {
        const res = await getBeneficiarios({ limit: 100, q: searchTerm.trim() || undefined });
        dataToExport = res?.beneficiarios || dataToExport;
      }
      exportToExcel({
        filename: 'Padron_Beneficiarios_DIF_2027.xls',
        title: 'Padrón Oficial de Beneficiarios DIF Tuxtla Gutiérrez',
        subtitle: 'Sistema Integral de Gestión de Asistencia Social',
        columns: columnasExportar,
        data: dataToExport
      });
      setActionSuccess(`Padrón exportado a Excel (.xls) exitosamente (${dataToExport.length} registros).`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert('Error al exportar a Excel: ' + err.message);
    }
  };

  const handleExportPDF = async () => {
    try {
      let dataToExport = beneficiarios;
      if (totalCount > beneficiarios.length) {
        const res = await getBeneficiarios({ limit: 100, q: searchTerm.trim() || undefined });
        dataToExport = res?.beneficiarios || dataToExport;
      }
      exportToPDF({
        title: 'Padrón Oficial de Beneficiarios DIF Tuxtla Gutiérrez',
        subtitle: 'Relación Nominal de Expedientes de Asistencia Social',
        columns: COLUMNAS_PADRON_COMPLETO,
        data: dataToExport,
        orientation: 'landscape',
        summaryItems: [
          { label: 'Total Expedientes', value: dataToExport.length },
          { label: 'Municipio', value: 'Tuxtla Gutiérrez' },
          { label: 'Ciclo Fiscal', value: '2026-2027' }
        ]
      });
    } catch (err) {
      alert('Error al exportar a PDF: ' + err.message);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    cargarBeneficiarios();
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar el registro de ${nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      setLoading(true);
      await eliminarBeneficiario(id);
      setActionSuccess(`Beneficiario ${nombre} eliminado correctamente.`);
      setTimeout(() => setActionSuccess(''), 4000);
      await cargarBeneficiarios();
    } catch (err) {
      setError(err.message || 'Error al eliminar beneficiario');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSolicitudModal = (b) => {
    setModalBeneficiario(b);
    setSolicitudForm({
      tipo_ayuda_solicitada: '',
      observaciones: '',
      fecha_solicitud: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmitSolicitud = async (e) => {
    e.preventDefault();
    if (!solicitudForm.tipo_ayuda_solicitada) {
      alert('Por favor especifique la ayuda o servicio solicitado.');
      return;
    }
    try {
      setSubmittingSolicitud(true);
      await agregarSolicitudBeneficiario(modalBeneficiario.id, solicitudForm);
      setModalBeneficiario(null);
      setActionSuccess(`Nueva solicitud registrada para ${modalBeneficiario.nombre_completo}.`);
      setTimeout(() => setActionSuccess(''), 4000);
      await cargarBeneficiarios();
    } catch (err) {
      alert(err.message || 'Error al agregar solicitud');
    } finally {
      setSubmittingSolicitud(false);
    }
  };

  const getStatusBadge = (estatus) => {
    switch (estatus) {
      case 'activo':
        return (
          <span className="badge badge--activo">
            <CheckCircle size={12} /> Activo
          </span>
        );
      case 'pendiente':
        return (
          <span className="badge badge--pendiente">
            <Clock size={12} /> Pendiente
          </span>
        );
      case 'inactivo':
      case 'rechazado':
        return (
          <span className="badge badge--inactivo">
            <XCircle size={12} /> {estatus.charAt(0).toUpperCase() + estatus.slice(1)}
          </span>
        );
      default:
        return <span className="badge">{estatus || 'Activo'}</span>;
    }
  };

  if (!canVer) {
    return (
      <div style={{ padding: '2.5rem', background: '#fff', borderRadius: '14px', border: '1px solid #fecaca', textAlign: 'center', maxWidth: '580px', margin: '2rem auto' }}>
        <AlertCircle size={40} color="#dc2626" style={{ marginBottom: '0.75rem' }} />
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: '#991b1b', fontWeight: 700 }}>
          Acceso Restringido al Padrón de Beneficiarios
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5 }}>
          Tu cuenta o rol actual no cuenta con el permiso <strong>Ver Padrón de Beneficiarios</strong> (<code>beneficiarios.ver</code>). Solicita al Administrador que lo habilite en la Matriz de Permisos o en Permisos Individuales.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Botón Volver al Dashboard en la parte superior izquierda */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
        <BtnBackDashboard to={`/${(user?.rol || 'admin').toLowerCase()}`} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Padrón de Beneficiarios</h1>
          <p className="page-subtitle">Listado oficial de ciudadanos registrados en formatos exportables.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {canExportar && (
            <>
              <button
                onClick={handleExportExcel}
                className="btn-secondary"
                title="Exportar padrón a Microsoft Excel (.xls)"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.45rem', 
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
                  color: '#15803d', 
                  borderColor: '#86efac', 
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.18)',
                  cursor: 'pointer'
                }}
              >
                <FileSpreadsheet size={16} color="#16a34a" />
                <span>Excel (.xls)</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="btn-secondary"
                title="Exportar padrón oficial en formato PDF"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.45rem', 
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
                  color: '#1e40af', 
                  borderColor: '#93c5fd', 
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.18)',
                  cursor: 'pointer'
                }}
              >
                <Download size={16} color="#2563eb" />
                <span>Padrón PDF</span>
              </button>
            </>
          )}
          {canCrear && (
            <Link to={`${rolePrefix}/nuevo`} className="btn-primary">
              <Plus size={16} />
              <span>Nuevo Beneficiario</span>
            </Link>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="alert alert--success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="alert alert--error" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ── BARRA DE BÚSQUEDA ── */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
          <input
            type="text"
            placeholder="Buscar por Nombre, Apellidos o CURP (parámetros 'q' y 'curp')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.5rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
              background: '#ffffff'
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>
        <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
          Buscar
        </button>
      </form>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={28} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Consultando padrón...</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Solicitante</th>
                <th>CURP</th>
                <th>Dependencia Emisora</th>
                <th>Discapacidad</th>
                <th>Ayuda Técnica</th>
                <th>Asentamiento</th>
                <th>Estatus</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {beneficiarios.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                    No se encontraron beneficiarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                beneficiarios.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{b.folio || `DIF-2027-${String(b.id).padStart(3, '0')}`}</td>
                    <td>
                      <div>
                        <strong>{b.nombre_completo || `${b.nombre || ''} ${b.apellido_paterno || ''} ${b.apellido_materno || ''}`}</strong>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {b.edad ? `${b.edad} años` : ''} {b.sexo ? `(${b.sexo})` : ''}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#475569' }}>{b.curp}</td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        <Building2 size={11} /> {b.dependencia || b.dependencia_emisora || 'DIF - Asistencia Social'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge--inactivo">{b.tipo_discapacidad || 'N/A'}</span>
                    </td>
                    <td style={{ fontWeight: 500, color: '#1e293b' }}>{b.tipo_ayuda_solicitada || 'Por asignar'}</td>
                    <td style={{ color: '#475569', fontSize: '0.84rem' }}>
                      {b.tipo_asentamiento || 'Colonia'} {b.nombre_asentamiento || ''}
                    </td>
                    <td>{getStatusBadge(b.estatus)}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {/* Botón Imprimir Ficha Oficial PDF (Anexo 5) */}
                        <button 
                          onClick={() => exportFichaBeneficiarioPDF(b)} 
                          className="btn-sm" 
                          title="Imprimir Cédula Oficial de Beneficiario (Anexo 5) en PDF"
                          style={{ background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0', fontWeight: 500 }}
                        >
                          <Printer size={13} />
                          <span>Ficha PDF</span>
                        </button>

                        {/* Botón Nueva Solicitud (POST /api/beneficiarios/:id/solicitudes) */}
                        {canSolicitudes && (
                          <button 
                            onClick={() => handleOpenSolicitudModal(b)} 
                            className="btn-sm" 
                            title="Agregar otra ayuda o servicio"
                            style={{ background: '#f8fafc', color: '#0284c7', borderColor: '#bae6fd' }}
                          >
                            <FilePlus2 size={13} />
                            <span>+ Ayuda</span>
                          </button>
                        )}

                        {/* Botón Editar (PUT /api/beneficiarios/:id) */}
                        {canEditar && (
                          <Link to={`${rolePrefix}/editar/${b.id}`} className="btn-sm" title="Editar expediente">
                            <Edit3 size={13} />
                            <span>Editar</span>
                          </Link>
                        )}

                        {/* Botón Eliminar (DELETE /api/beneficiarios/:id) */}
                        {canEliminar && (
                          <button 
                            onClick={() => handleEliminar(b.id, b.nombre_completo || b.nombre)} 
                            className="btn-sm" 
                            title="Eliminar beneficiario"
                            style={{ color: '#ef4444', borderColor: '#fecaca', background: '#fff5f5' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* ── PAGINACIÓN ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b' }}>
            <span>Mostrando página {page} de {totalPages} ({totalCount} beneficiarios en total)</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setPage((p) => Math.max(1, p - 1))} 
                disabled={page <= 1}
                className="btn-sm"
                style={{ opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={14} /> Anterior
              </button>
              <button 
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                disabled={page >= totalPages}
                className="btn-sm"
                style={{ opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
              >
                Siguiente <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: AGREGAR SOLICITUD A BENEFICIARIO EXISTENTE ── */}
      {modalBeneficiario && (
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
            maxWidth: '520px',
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
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Nueva Solicitud de Ayuda
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Expediente: <strong>{modalBeneficiario.nombre_completo || modalBeneficiario.nombre}</strong> ({modalBeneficiario.curp}) • Dependencia: <span style={{ color: '#0369a1', fontWeight: 600 }}>{modalBeneficiario.dependencia || modalBeneficiario.dependencia_emisora || 'DIF Municipal'}</span>
                </p>
              </div>
              <button 
                onClick={() => setModalBeneficiario(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitSolicitud} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Servicio o Apoyo Solicitado *
                </label>
                <input
                  type="text"
                  list="servicios-datalist"
                  placeholder="Selecciona o escribe el apoyo..."
                  value={solicitudForm.tipo_ayuda_solicitada}
                  onChange={(e) => setSolicitudForm({ ...solicitudForm, tipo_ayuda_solicitada: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                  required
                />
                <datalist id="servicios-datalist">
                  {catalogoServicios.map((s, idx) => (
                    <option key={idx} value={s.nombre || s.clave}>
                      {s.codigo ? `[${s.codigo}] ` : ''}{s.categoria ? `(${s.categoria})` : ''}
                    </option>
                  ))}
                  <option value="Silla de ruedas estándar" />
                  <option value="Andadera ortopédica" />
                  <option value="Bastón de cuatro puntos" />
                  <option value="Terapia de Lenguaje (CEMTRI)" />
                  <option value="Terapia Física (CEMTRI)" />
                  <option value="Consulta Psicológica" />
                  <option value="Dotaciones Alimentarias Básicas" />
                </datalist>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Fecha de Solicitud
                </label>
                <input
                  type="date"
                  value={solicitudForm.fecha_solicitud}
                  onChange={(e) => setSolicitudForm({ ...solicitudForm, fecha_solicitud: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Observaciones / Justificación
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles adicionales sobre la solicitud o necesidad técnica..."
                  value={solicitudForm.observaciones}
                  onChange={(e) => setSolicitudForm({ ...solicitudForm, observaciones: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setModalBeneficiario(null)}
                  className="btn-sm"
                  style={{ padding: '0.6rem 1rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingSolicitud}
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.25rem' }}
                >
                  {submittingSolicitud ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <span>Registrar Solicitud</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CapturistaBeneficiarios;
