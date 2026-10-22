import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BtnBackDashboard from '../../components/common/BtnBackDashboard';
import { 
  Check, 
  X, 
  Eye, 
  FileCheck2, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  User, 
  MapPin, 
  Accessibility, 
  HelpCircle,
  FileText,
  Calendar,
  Filter,
  Building2,
  Printer,
  ArrowLeft
} from 'lucide-react';
import { getBeneficiarios, actualizarBeneficiario } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { exportFichaBeneficiarioPDF } from '../../utils/exportUtils';

function SupervisorValidacion() {
  const { hasPermission } = useAuth();
  const canAprobar = hasPermission('validacion.aprobar');
  const canRechazar = hasPermission('validacion.rechazar');

  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pendientes'); // 'pendientes' | 'validados' | 'rechazados'
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState(null);

  // Modales
  const [inspectModal, setInspectModal] = useState(null); // Expediente en revisión
  const [approveModal, setApproveModal] = useState(null); // Expediente a aprobar con confirmación explícita
  const [approveNotes, setApproveNotes] = useState('');
  const [cumpleRequisitos, setCumpleRequisitos] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);   // Expediente a rechazar
  const [rejectReason, setRejectReason] = useState('Documentación incompleta o ilegible');
  const [rejectNotes, setRejectNotes] = useState('');

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        const res = await getBeneficiarios({ limit: 100 });
        const list = res?.beneficiarios || (Array.isArray(res) ? res : []);
        
        const expedientesApi = list.map((b) => ({
          ...b,
          nombre: b.nombre_completo || `${b.nombre || ''} ${b.apellido_paterno || ''}`.trim() || 'Beneficiario',
          programa: b.tipo_ayuda_solicitada || b.programa || 'Programa DIF',
          dependencia: b.dependencia || b.dependencia_emisora || 'DIF Municipal - Dirección de Asistencia Social',
          municipio: b.municipio || b.nombre_asentamiento || 'Tuxtla Gutiérrez',
          estatus: b.estatus || 'pendiente',
        }));
        setExpedientes(expedientesApi);
      } catch (err) {
        showToast(err.message || 'Error al conectar con la API de beneficiarios', 'error');
        setExpedientes([]);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  // Abrir modal de aprobación (no aprueba en automático)
  const handleAbrirAprobacion = (expediente) => {
    setApproveModal(expediente);
    setApproveNotes('');
    setCumpleRequisitos(true);
  };

  // Confirmar y dictaminar la aprobación formalmente
  const handleConfirmarAprobacion = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!approveModal) return;
    if (!cumpleRequisitos) {
      showToast('Debes certificar el cumplimiento de requisitos normativos para autorizar.', 'warning');
      return;
    }

    try {
      const dictamenFinal = approveNotes.trim() || 'Aprobado conforme a la norma oficial DIF 2027';
      const fechaHoy = new Date().toLocaleDateString('es-MX');

      await actualizarBeneficiario(approveModal.id, { 
        estatus: 'activo',
        dictamen: dictamenFinal,
        fecha_validacion: fechaHoy
      });

      setExpedientes((prev) =>
        prev.map((item) =>
          item.id === approveModal.id
            ? { 
                ...item, 
                estatus: 'activo', 
                dictamen: dictamenFinal,
                fecha_validacion: fechaHoy 
              }
            : item
        )
      );

      if (inspectModal?.id === approveModal.id) {
        setInspectModal(null);
      }

      showToast(`¡Expediente ${approveModal.folio} (${approveModal.nombre || approveModal.nombre_completo}) APROBADO y autorizado! Ha pasado a estatus ACTIVO.`);
      setApproveModal(null);
    } catch (err) {
      showToast(`Error al aprobar: ${err.message}`, 'error');
    }
  };

  // Abrir modal de rechazo
  const handleAbrirRechazo = (expediente) => {
    setRejectModal(expediente);
    setRejectReason('Documentación incompleta o ilegible');
    setRejectNotes('');
  };

  // Confirmar rechazo
  const handleConfirmarRechazo = async (e) => {
    e.preventDefault();
    if (!rejectModal) return;

    try {
      const motivoCompleto = rejectNotes.trim()
        ? `${rejectReason}: ${rejectNotes.trim()}`
        : rejectReason;

      await actualizarBeneficiario(rejectModal.id, {
        estatus: 'rechazado',
        motivo_rechazo: motivoCompleto
      });

      setExpedientes((prev) =>
        prev.map((item) =>
          item.id === rejectModal.id
            ? {
                ...item,
                estatus: 'rechazado',
                motivo_rechazo: motivoCompleto,
                fecha_validacion: new Date().toLocaleDateString('es-MX')
              }
            : item
        )
      );

      if (inspectModal?.id === rejectModal.id) {
        setInspectModal(null);
      }

      showToast(`Expediente ${rejectModal.folio} marcado como RECHAZADO con motivo registrado.`, 'warning');
      setRejectModal(null);
    } catch (err) {
      showToast(`Error al rechazar: ${err.message}`, 'error');
    }
  };

  // Filtros
  const filtrados = expedientes.filter((exp) => {
    const cumpleEstatus =
      activeTab === 'pendientes'
        ? exp.estatus === 'pendiente'
        : activeTab === 'validados'
        ? exp.estatus === 'activo'
        : exp.estatus === 'rechazado';

    const q = search.trim().toLowerCase();
    if (!q) return cumpleEstatus;

    const coincide =
      (exp.folio && exp.folio.toLowerCase().includes(q)) ||
      (exp.nombre && exp.nombre.toLowerCase().includes(q)) ||
      (exp.nombre_completo && exp.nombre_completo.toLowerCase().includes(q)) ||
      (exp.curp && exp.curp.toLowerCase().includes(q)) ||
      (exp.programa && exp.programa.toLowerCase().includes(q));

    return cumpleEstatus && coincide;
  });

  const conteoPendientes = expedientes.filter((e) => e.estatus === 'pendiente').length;
  const conteoAprobados = expedientes.filter((e) => e.estatus === 'activo').length;
  const conteoRechazados = expedientes.filter((e) => e.estatus === 'rechazado').length;

  return (
    <div>
      {/* ── NOTIFICACIÓN TOAST ── */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          background: notification.type === 'error' ? '#ef4444' : notification.type === 'warning' ? '#f59e0b' : '#059669',
          color: '#ffffff',
          padding: '0.85rem 1.4rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.9rem',
          fontWeight: 500,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : notification.type === 'warning' ? <Clock size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Botón Volver al Dashboard en la parte superior izquierda */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
        <BtnBackDashboard to="/supervisor" />
      </div>

      {/* ── ENCABEZADO ── */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">
            <span>Validación de Expedientes</span>
          </h1>
          <p className="page-subtitle">
            Revisa los beneficiarios capturados que requieren autorización para pasar a estatus Activo y recibir apoyos.
          </p>
        </div>
      </div>

      {/* ── TARJETAS DE INDICADORES RÁPIDOS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div 
          onClick={() => setActiveTab('pendientes')}
          style={{
            background: activeTab === 'pendientes' ? '#f0fdf4' : '#ffffff',
            border: activeTab === 'pendientes' ? '2px solid #10b981' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.1rem 1.25rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pendientes de Validar
            </span>
            <Clock size={18} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.4rem' }}>
            {conteoPendientes}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
            Requieren revisión y dictamen
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('validados')}
          style={{
            background: activeTab === 'validados' ? '#ecfdf5' : '#ffffff',
            border: activeTab === 'validados' ? '2px solid #059669' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.1rem 1.25rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Aprobados / Activos
            </span>
            <CheckCircle2 size={18} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.4rem' }}>
            {conteoAprobados}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
            Expedientes autorizados con éxito
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('rechazados')}
          style={{
            background: activeTab === 'rechazados' ? '#fef2f2' : '#ffffff',
            border: activeTab === 'rechazados' ? '2px solid #dc2626' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.1rem 1.25rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Rechazados / En Corrección
            </span>
            <XCircle size={18} style={{ color: '#dc2626' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.4rem' }}>
            {conteoRechazados}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
            Requieren solventar observaciones
          </div>
        </div>
      </div>

      {/* ── BARRA DE BÚSQUEDA Y PESTAÑAS ── */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '8px', padding: '3px', flexWrap: 'wrap', maxWidth: '100%' }}>
          <button
            onClick={() => setActiveTab('pendientes')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'pendientes' ? '#ffffff' : 'transparent',
              color: activeTab === 'pendientes' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'pendientes' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Pendientes ({conteoPendientes})
          </button>
          <button
            onClick={() => setActiveTab('validados')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'validados' ? '#ffffff' : 'transparent',
              color: activeTab === 'validados' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'validados' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Aprobados ({conteoAprobados})
          </button>
          <button
            onClick={() => setActiveTab('rechazados')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'rechazados' ? '#ffffff' : 'transparent',
              color: activeTab === 'rechazados' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'rechazados' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Rechazados ({conteoRechazados})
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '200px', flex: '1 1 240px', maxWidth: '100%' }}>
          <input
            type="text"
            placeholder="Buscar por folio, nombre o CURP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.85rem 0.5rem 2.2rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              outline: 'none',
              background: '#ffffff'
            }}
          />
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>
      </div>

      {/* ── TABLA PRINCIPAL ── */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Nombre Completo</th>
              <th>CURP</th>
              <th>Dependencia Emisora</th>
              <th>Programa / Ayuda</th>
              <th>Ubicación</th>
              <th>Estatus</th>
              <th style={{ textAlign: 'right' }}>Acciones y Decisión</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  {activeTab === 'pendientes'
                    ? 'No hay expedientes pendientes de validación en este momento.'
                    : activeTab === 'validados'
                    ? 'No hay expedientes aprobados registrados.'
                    : 'No hay expedientes rechazados registrados.'}
                </td>
              </tr>
            ) : (
              filtrados.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                    {p.folio || `BEN-2026-${String(p.id).padStart(3, '0')}`}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                      {p.nombre || p.nombre_completo}
                    </div>
                    {p.edad && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {p.edad} años {p.sexo ? `• ${p.sexo}` : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#334155' }}>
                    {p.curp}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      <Building2 size={11} /> {p.dependencia || p.dependencia_emisora || 'DIF - Asistencia Social'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#0369a1' }}>
                      {p.programa || p.tipo_ayuda_solicitada || 'Apoyo Municipal'}
                    </div>
                    {p.tipo_discapacidad && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        {p.tipo_discapacidad}
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.84rem', color: '#475569' }}>
                    {p.municipio || 'Tuxtla Gutiérrez'}
                    {p.nombre_asentamiento && (
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                        {p.tipo_asentamiento} {p.nombre_asentamiento}
                      </div>
                    )}
                  </td>
                  <td>
                    {p.estatus === 'activo' ? (
                      <span className="badge badge--activo">
                        <CheckCircle2 size={12} /> Aprobado
                      </span>
                    ) : p.estatus === 'rechazado' ? (
                      <span className="badge badge--inactivo" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                        <XCircle size={12} /> Rechazado
                      </span>
                    ) : (
                      <span className="badge badge--pendiente">
                        <Clock size={12} /> Pendiente
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {/* Botón Ver Detalle */}
                      <button
                        onClick={() => setInspectModal(p)}
                        className="btn-sm"
                        title="Ver expediente completo"
                        style={{ background: '#f8fafc', color: '#334155', borderColor: '#cbd5e1' }}
                      >
                        <Eye size={13} />
                        <span>Revisar</span>
                      </button>

                      {p.estatus === 'pendiente' ? (
                        <>
                          {/* Botón Aprobar */}
                          {canAprobar && (
                            <button
                              onClick={() => handleAbrirAprobacion(p)}
                              className="btn-sm"
                              title="Aprobar expediente con confirmación y dictamen"
                              style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0', fontWeight: 600 }}
                            >
                              <Check size={14} /> Aprobar
                            </button>
                          )}

                          {/* Botón Rechazar */}
                          {canRechazar && (
                            <button
                              onClick={() => handleAbrirRechazo(p)}
                              className="btn-sm"
                              title="Rechazar expediente o solicitar corrección"
                              style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca', fontWeight: 600 }}
                            >
                              <X size={14} /> Rechazar
                            </button>
                          )}
                        </>
                      ) : p.estatus === 'rechazado' ? (
                        canAprobar && (
                          <button
                            onClick={() => handleAbrirAprobacion(p)}
                            className="btn-sm"
                            title="Reconsiderar y aprobar expediente"
                            style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}
                          >
                            <Check size={13} /> Reconsiderar
                          </button>
                        )
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 500, padding: '0.2rem 0.5rem' }}>
                          ✓ Validado
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── MODAL: VER EXPEDIENTE COMPLETO PARA REVISIÓN ── */}
      {inspectModal && (
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
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Cabecera del modal */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    Expediente {inspectModal.folio || `BEN-${inspectModal.id}`}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {inspectModal.nombre || inspectModal.nombre_completo} • Dictamen de Validación
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectModal(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido con Scroll */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Sección 1: Datos del Beneficiario */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                  1. Información Ciudadana
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Nombre:</span>{' '}
                    <strong>{inspectModal.nombre || inspectModal.nombre_completo}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>CURP:</span>{' '}
                    <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>{inspectModal.curp}</code>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Edad / Sexo:</span>{' '}
                    <span>{inspectModal.edad || 35} años ({inspectModal.sexo || 'No especificado'})</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Fecha Registro:</span>{' '}
                    <span>{inspectModal.fecha_solicitud || '2027-02-15'}</span>
                  </div>
                  <div style={{ gridColumn: '1 / -1', background: '#eff6ff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.25rem' }}>
                    <Building2 size={14} style={{ color: '#2563eb', flexShrink: 0 }} />
                    <span style={{ color: '#1e40af', fontSize: '0.82rem' }}>Dependencia que elaboró el expediente:</span>{' '}
                    <strong style={{ color: '#1e3a8a', fontSize: '0.85rem' }}>{inspectModal.dependencia || inspectModal.dependencia_emisora || 'DIF Municipal - Dirección de Asistencia Social'}</strong>
                  </div>
                </div>
              </div>

              {/* Sección 2: Discapacidad y Apoyo Solicitado */}
              <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                  2. Solicitud de Asistencia Social
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#166534' }}>Discapacidad:</span>{' '}
                    <strong>{inspectModal.tipo_discapacidad || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#166534' }}>Ayuda / Servicio Solicitado:</span>{' '}
                    <strong>{inspectModal.programa || inspectModal.tipo_ayuda_solicitada || 'Por asignar'}</strong>
                  </div>
                </div>
              </div>

              {/* Sección 3: Domicilio */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                  3. Domicilio y Cobertura
                </div>
                <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4' }}>
                  <div>
                    <strong>Dirección:</strong> {inspectModal.tipo_vialidad || 'Calle'} {inspectModal.nombre_vialidad || 'Principal'} #{inspectModal.numero_exterior || 'S/N'}, {inspectModal.tipo_asentamiento || 'Colonia'} {inspectModal.nombre_asentamiento || 'Centro'}, C.P. {inspectModal.codigo_postal || '29000'}
                  </div>
                  <div style={{ marginTop: '0.25rem', color: '#64748b' }}>
                    <strong>Municipio:</strong> {inspectModal.municipio || 'Tuxtla Gutiérrez'}
                  </div>
                </div>
              </div>

              {/* Si está rechazado, mostrar el motivo */}
              {inspectModal.motivo_rechazo && (
                <div style={{ background: '#fef2f2', padding: '0.9rem', borderRadius: '10px', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.85rem' }}>
                  <strong>Observación de Rechazo:</strong> {inspectModal.motivo_rechazo}
                </div>
              )}
            </div>

            {/* Pie de Acciones */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.65rem',
              padding: '1rem 1.25rem',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setInspectModal(null)}
                  className="btn-sm"
                  style={{ background: '#ffffff', color: '#475569', borderColor: '#cbd5e1' }}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => exportFichaBeneficiarioPDF(inspectModal)}
                  className="btn-sm"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    background: '#eff6ff', 
                    color: '#1d4ed8', 
                    borderColor: '#bfdbfe', 
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="Generar Ficha Oficial (Anexo 5) en PDF"
                >
                  <Printer size={14} color="#2563eb" />
                  <span>Ficha Oficial (PDF)</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {canRechazar && (
                  <button
                    onClick={() => {
                      handleAbrirRechazo(inspectModal);
                    }}
                    className="btn-sm"
                    style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca', fontWeight: 600 }}
                  >
                    <X size={14} /> Rechazar Solicitud
                  </button>
                )}
                {canAprobar && (
                  <button
                    onClick={() => {
                      handleAbrirAprobacion(inspectModal);
                    }}
                    className="btn-primary"
                    style={{ background: '#059669', borderColor: '#059669' }}
                  >
                    <Check size={16} /> Aprobar Expediente
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRMAR APROBACIÓN CON DICTAMEN (NO APRUEBA SOLO) ── */}
      {approveModal && (
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
          zIndex: 10001,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #bbf7d0',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #dcfce7',
              background: '#f0fdf4',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#166534' }}>
                <CheckCircle2 size={22} color="#16a34a" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#14532d' }}>
                  Aprobar Expediente — {approveModal.folio}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setApproveModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmarAprobacion} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.2rem' }}>Beneficiario a autorizar:</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  {approveModal.nombre || approveModal.nombre_completo}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span><strong>CURP:</strong> <code style={{ fontFamily: 'monospace' }}>{approveModal.curp}</code></span>
                  <span><strong>Ayuda:</strong> {approveModal.programa || approveModal.tipo_ayuda_solicitada || 'Apoyo DIF'}</span>
                </div>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.85rem 1rem', borderRadius: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.85rem', color: '#92400e', lineHeight: 1.45, fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={cumpleRequisitos}
                    onChange={(e) => setCumpleRequisitos(e.target.checked)}
                    style={{ marginTop: '0.2rem', cursor: 'pointer', accentColor: '#16a34a', width: '16px', height: '16px' }}
                  />
                  <span>
                    Certifico que he revisado el expediente digital y los documentos probatorios. El beneficiario cumple con los requisitos normativos para pasar a estatus <strong>ACTIVO</strong>.
                  </span>
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Observaciones o Dictamen del Supervisor (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  placeholder="Ej: Expediente verificado con dictamen médico favorable y estudio socioeconómico aprobado..."
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setApproveModal(null)}
                  className="btn-secondary"
                  style={{ padding: '0.55rem 1.1rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!cumpleRequisitos}
                  className="btn-primary"
                  style={{
                    background: cumpleRequisitos ? '#059669' : '#9ca3af',
                    borderColor: cumpleRequisitos ? '#059669' : '#9ca3af',
                    color: '#ffffff',
                    fontWeight: 700,
                    padding: '0.55rem 1.4rem',
                    cursor: cumpleRequisitos ? 'pointer' : 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Confirmar y Autorizar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: REGISTRAR RECHAZO CON OBSERVACIONES ── */}
      {rejectModal && (
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
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#fef2f2',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#dc2626' }}>
                <AlertCircle size={22} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#991b1b' }}>
                  Rechazar Expediente {rejectModal.folio}
                </h3>
              </div>
              <button
                onClick={() => setRejectModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmarRechazo} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.4 }}>
                Indica la causa por la cual el expediente de <strong>{rejectModal.nombre || rejectModal.nombre_completo}</strong> no puede ser aprobado en este momento.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Motivo Principal
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  <option value="Documentación incompleta o ilegible">Documentación incompleta o ilegible</option>
                  <option value="CURP no coincide con el Registro Civil">CURP no coincide con el Registro Civil</option>
                  <option value="Domicilio fuera de la cobertura municipal de atención">Domicilio fuera de la cobertura municipal</option>
                  <option value="Duplicidad de apoyo con otra dependencia federal o estatal">Duplicidad de apoyo en el periodo actual</option>
                  <option value="No cumple con el perfil socioeconómico requerido">No cumple con el perfil socioeconómico requerido</option>
                  <option value="Otro motivo especificado en observaciones">Otro motivo (especificar abajo)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Observaciones Adicionales para el Capturista
                </label>
                <textarea
                  rows={3}
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Ej: Faltó subir el comprobante de domicilio reciente (máximo 3 meses)..."
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRejectModal(null)}
                  className="btn-sm"
                  style={{ background: '#f8fafc', color: '#475569', borderColor: '#cbd5e1' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-sm"
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    padding: '0.5rem 1.25rem'
                  }}
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupervisorValidacion;
