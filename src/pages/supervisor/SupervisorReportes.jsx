import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BtnBackDashboard from '../../components/common/BtnBackDashboard';
import { 
  BarChart3, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  FileCheck2, 
  Percent,
  ShieldCheck,
  FileSpreadsheet,
  ArrowLeft
} from 'lucide-react';
import { getBeneficiarios } from '../../services/api';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

function SupervisorReportes() {
  const [downloading, setDownloading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [resumen, setResumen] = useState({ total: 0, activos: 0, pendientes: 0, pct: 0 });

  useEffect(() => {
    getBeneficiarios({ limit: 500 })
      .then((res) => {
        const lista = res?.beneficiarios || (Array.isArray(res) ? res : []);
        const total = lista.length;
        const activos = lista.filter((b) => (b.estatus || 'activo').toLowerCase() === 'activo').length;
        const pendientes = lista.filter((b) => (b.estatus || '').toLowerCase() === 'pendiente').length;
        const pct = total > 0 ? Math.round((activos / total) * 100) : 0;
        setResumen({ total, activos, pendientes, pct });
      })
      .catch(() => {});
  }, []);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const getMetricasSupervision = async () => {
    const res = await getBeneficiarios({ limit: 100 });
    const lista = res?.beneficiarios || (Array.isArray(res) ? res : []);

    const total = lista.length;
    const activos = lista.filter((b) => b.estatus === 'activo').length;
    const pendientes = lista.filter((b) => b.estatus === 'pendiente').length;
    const rechazados = lista.filter((b) => b.estatus === 'rechazado').length;
    const otros = total - activos - pendientes - rechazados;
    const pct = total > 0 ? Math.round((activos / total) * 100) : 0;

    const dataFilas = [
      { indicador: 'Total Expedientes Recibidos', valor: total, descripcion: 'Total de solicitudes registradas en el periodo', meta: '100%' },
      { indicador: 'Expedientes Validados y Activos', valor: activos, descripcion: 'Expedientes que cumplen todos los requisitos normativos y dictamen favorable', meta: '90%' },
      { indicador: 'Expedientes Pendientes de Evaluación', valor: pendientes, descripcion: 'En proceso de revisión de documentación y comprobantes', meta: 'Máx. 10%' },
      { indicador: 'Expedientes Rechazados / Observados', valor: rechazados + otros, descripcion: 'Requieren subsanar inconsistencias o fueron declinados', meta: '0%' },
      { indicador: 'Porcentaje Global de Avance', valor: `${pct}%`, descripcion: 'Meta institucional de dictaminación DIF Tuxtla Gutiérrez 2027', meta: '100%' },
    ];

    const columns = [
      { header: 'Indicador de Supervisión', key: 'indicador' },
      { header: 'Resultado / Conteo', key: 'valor' },
      { header: 'Descripción Operativa', key: 'descripcion' },
      { header: 'Meta Normativa', key: 'meta' }
    ];

    return { total, activos, pendientes, rechazados, pct, dataFilas, columns };
  };

  const handleExportSupervisorExcel = async () => {
    try {
      setDownloading(true);
      const { dataFilas, columns } = await getMetricasSupervision();
      exportToExcel({
        filename: 'Reporte_Supervision_Avance_DIF_2027.xls',
        title: 'Informe de Supervisión y Control Operativo DIF 2027',
        subtitle: 'Sistema DIF Tuxtla Gutiérrez — Dirección de Asistencia Social',
        columns,
        data: dataFilas
      });
      showToast('Reporte de supervisión en Excel descargado exitosamente.');
    } catch (err) {
      alert('Error al generar Excel: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleExportSupervisorPDF = async () => {
    try {
      setDownloading(true);
      const { total, activos, pct, dataFilas, columns } = await getMetricasSupervision();
      exportToPDF({
        title: 'Informe de Supervisión y Control Operativo DIF 2027',
        subtitle: 'Dirección de Asistencia Social — Coordinación de Evaluación y Dictámenes DIF',
        columns,
        data: dataFilas,
        orientation: 'landscape',
        summaryItems: [
          { label: 'Expedientes Recibidos', value: total },
          { label: 'Aprobados y Activos', value: activos },
          { label: 'Avance Global', value: `${pct}%` }
        ]
      });
      showToast('Documento PDF oficial de supervisión generado exitosamente.');
    } catch (err) {
      alert('Error al generar PDF: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      {/* Botón Volver al Dashboard en la parte superior izquierda */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
        <BtnBackDashboard to="/supervisor" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Reportes de Supervisión</h1>
          <p className="page-subtitle">Informes de avance de captura, validación y metas asignadas en Excel y PDF.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            onClick={handleExportSupervisorExcel} 
            disabled={downloading}
            className="btn-secondary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              cursor: downloading ? 'not-allowed' : 'pointer',
              background: '#f0fdf4',
              color: '#166534',
              borderColor: '#bbf7d0',
              fontWeight: 600
            }}
          >
            <FileSpreadsheet size={16} color="#16a34a" />
            <span>{downloading ? 'Descargando...' : 'Descargar Excel (.xls)'}</span>
          </button>
          <button 
            onClick={handleExportSupervisorPDF} 
            disabled={downloading}
            className="btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              cursor: downloading ? 'not-allowed' : 'pointer'
            }}
          >
            <Download size={16} />
            <span>{downloading ? 'Generando...' : 'Descargar PDF Oficial'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="alert alert--success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      <div className="cards-grid">
        <div 
          className="card" 
          onClick={() => setShowModal(true)}
          style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #e2e8f0' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="card__icon-wrapper card__icon-wrapper--green">
            <BarChart3 size={22} />
          </div>
          <h3 style={{ marginTop: '0.75rem', marginBottom: '0.4rem', color: '#0f172a' }}>Avance de Validaciones</h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Porcentaje de registros evaluados respecto al total de expedientes recibidos.</p>
          <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Consultar avance y porcentajes</span> &rarr;
          </div>
        </div>
      </div>

      {/* ── MODAL: AVANCE DE VALIDACIONES ── */}
      {showModal && (
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
            maxWidth: '560px',
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
                <ShieldCheck size={20} color="#059669" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Avance de Validaciones DIF 2027
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.25rem' }}>
                Estado actual del proceso de dictaminación de ayudas técnicas y servicios comunitarios:
              </p>

              {/* BARRA DE PROGRESO */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  <span>Progreso de Dictaminación</span>
                  <span style={{ color: '#059669' }}>{resumen.pct}% Completado</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${resumen.pct}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '999px' }}></div>
                </div>
              </div>

              {/* MÉTRICAS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{resumen.total}</span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Total Expedientes</div>
                </div>
                <div style={{ padding: '0.85rem', background: '#f0fdf4', borderRadius: '10px', textAlign: 'center', border: '1px solid #dcfce7' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803d' }}>{resumen.activos}</span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Aprobados</div>
                </div>
                <div style={{ padding: '0.85rem', background: '#fffbeb', borderRadius: '10px', textAlign: 'center', border: '1px solid #fef3c7' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#b45309' }}>{resumen.pendientes}</span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Pendientes</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-sm"
                  style={{ padding: '0.6rem 1.1rem', cursor: 'pointer' }}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    handleExportSupervisorExcel();
                  }}
                  className="btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0', fontWeight: 600, cursor: 'pointer' }}
                >
                  <FileSpreadsheet size={15} color="#16a34a" />
                  <span>Descargar Excel (.xls)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    handleExportSupervisorPDF();
                  }}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', cursor: 'pointer' }}
                >
                  <Download size={15} />
                  <span>Descargar PDF Oficial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupervisorReportes;
