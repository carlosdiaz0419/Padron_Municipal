import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  FileCheck2, 
  Percent,
  ShieldCheck
} from 'lucide-react';
import { getBeneficiarios } from '../../services/api';

function SupervisorReportes() {
  const [downloading, setDownloading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const exportarResumenCSV = async () => {
    try {
      setDownloading(true);
      const res = await getBeneficiarios({ limit: 500 });
      const lista = res?.beneficiarios || [];

      const total = lista.length;
      const activos = lista.filter((b) => b.estatus === 'activo').length;
      const pendientes = lista.filter((b) => b.estatus === 'pendiente').length;
      const otros = total - activos - pendientes;
      const pct = total > 0 ? Math.round((activos / total) * 100) : 0;

      const csvHeader = 'Indicador,Valor,Descripcion\n';
      const rows = [
        `"Total Expedientes Recibidos",${total},"Total de solicitudes registradas en el periodo"`,
        `"Expedientes Validados y Activos",${activos},"Expedientes que cumplen todos los requisitos normativos"`,
        `"Expedientes Pendientes de Evaluacion",${pendientes},"En espera de revision de comprobantes y dictamen"`,
        `"Expedientes Observados / Rechazados",${otros},"Requieren correccion o no cumplen criterios"`,
        `"Porcentaje Global de Avance","${pct}%","Meta institucional DIF Tuxtla Gutierrez 2027"`,
      ];

      const csvContent = '\uFEFF' + csvHeader + rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Reporte_Supervision_Avance_DIF_2027.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Resumen de supervisión descargado exitosamente.');
    } catch (err) {
      alert('Error al exportar resumen: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Reportes de Supervisión</h1>
          <p className="page-subtitle">Informes de avance de captura, validación y metas asignadas.</p>
        </div>
        <button 
          onClick={exportarResumenCSV} 
          disabled={downloading}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: downloading ? 'not-allowed' : 'pointer' }}
        >
          <Download size={16} />
          <span>{downloading ? 'Generando Reporte...' : 'Exportar Resumen'}</span>
        </button>
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
                  <span style={{ color: '#059669' }}>67% Completado</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: '67%', height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '999px' }}></div>
                </div>
              </div>

              {/* MÉTRICAS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>3</span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Total Expedientes</div>
                </div>
                <div style={{ padding: '0.85rem', background: '#f0fdf4', borderRadius: '10px', textAlign: 'center', border: '1px solid #dcfce7' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803d' }}>2</span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Aprobados</div>
                </div>
                <div style={{ padding: '0.85rem', background: '#fffbeb', borderRadius: '10px', textAlign: 'center', border: '1px solid #fef3c7' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#b45309' }}>1</span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Pendientes</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
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
                    exportarResumenCSV();
                  }}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', cursor: 'pointer' }}
                >
                  <Download size={15} />
                  <span>Descargar Resumen</span>
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
