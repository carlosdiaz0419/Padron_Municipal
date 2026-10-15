import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  X, 
  Layers, 
  Users, 
  MapPin,
  Table,
  FileCheck2
} from 'lucide-react';
import { getBeneficiarios } from '../../services/api';

function AdminReportes() {
  const [downloading, setDownloading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'consolidado' | 'municipio' | null

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const exportarCSV = async (tipo = 'general') => {
    try {
      setDownloading(true);
      const res = await getBeneficiarios({ limit: 1000 });
      const lista = res?.beneficiarios || [];

      let csvHeader = '';
      let csvRows = [];

      if (tipo === 'municipio') {
        csvHeader = 'Folio,Beneficiario,CURP,Asentamiento,Vialidad,Municipio,Estatus\n';
        csvRows = lista.map((b) => 
          `"${b.folio || ''}","${b.nombre_completo || b.nombre || ''}","${b.curp || ''}","${b.tipo_asentamiento || ''} ${b.nombre_asentamiento || ''}","${b.tipo_vialidad || ''} ${b.nombre_vialidad || ''} ${b.numero_exterior || ''}","Tuxtla Gutiérrez","${b.estatus || 'Activo'}"`
        );
      } else {
        csvHeader = 'Folio,Fecha_Solicitud,Nombre_Completo,CURP,Edad,Sexo,Discapacidad,Ayuda_Solicitada,Asentamiento,Estatus\n';
        csvRows = lista.map((b) => 
          `"${b.folio || ''}","${b.fecha_solicitud || ''}","${b.nombre_completo || b.nombre || ''}","${b.curp || ''}","${b.edad || ''}","${b.sexo || ''}","${b.tipo_discapacidad || ''}","${b.tipo_ayuda_solicitada || ''}","${b.tipo_asentamiento || ''} ${b.nombre_asentamiento || ''}","${b.estatus || 'Activo'}"`
        );
      }

      // Añadir BOM (\uFEFF) para que Microsoft Excel reconozca tildes y caracteres en español correctamente
      const csvContent = '\uFEFF' + csvHeader + csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', tipo === 'municipio' ? 'Distribucion_Por_Municipio_DIF_2027.csv' : 'Padron_General_Consolidado_DIF_2027.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Archivo Excel/CSV descargado exitosamente (${lista.length} registros).`);
    } catch (err) {
      alert('Error al generar el archivo exportable: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Módulo de Reportes</h1>
          <p className="page-subtitle">Generación de estadísticas y padrones en formatos exportables.</p>
        </div>
        <button 
          onClick={() => exportarCSV('general')} 
          disabled={downloading}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: downloading ? 'not-allowed' : 'pointer' }}
        >
          <Download size={16} />
          <span>{downloading ? 'Generando Excel...' : 'Exportar a Excel'}</span>
        </button>
      </div>

      {notification && (
        <div className="alert alert--success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      <div className="cards-grid">
        {/* TARJETA 1: Padrón General Consolidado */}
        <div 
          className="card" 
          onClick={() => setActiveModal('consolidado')}
          style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #e2e8f0' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="card__icon-wrapper card__icon-wrapper--blue">
            <BarChart3 size={22} />
          </div>
          <h3 style={{ marginTop: '0.75rem', marginBottom: '0.4rem', color: '#0f172a' }}>Padrón General Consolidado</h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Listado general de beneficiarios activos filtrados por ejercicio fiscal.</p>
          <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Ver reporte y métricas</span> &rarr;
          </div>
        </div>

        {/* TARJETA 2: Distribución por Municipio */}
        <div 
          className="card" 
          onClick={() => setActiveModal('municipio')}
          style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #e2e8f0' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="card__icon-wrapper card__icon-wrapper--green">
            <FileSpreadsheet size={22} />
          </div>
          <h3 style={{ marginTop: '0.75rem', marginBottom: '0.4rem', color: '#0f172a' }}>Distribución por Municipio</h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Concentrado de beneficiarios agrupados por municipio y localidad.</p>
          <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Ver distribución geográfica</span> &rarr;
          </div>
        </div>
      </div>

      {/* ── MODAL: PADRÓN GENERAL CONSOLIDADO ── */}
      {activeModal === 'consolidado' && (
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
            maxWidth: '620px',
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
                <BarChart3 size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Padrón General Consolidado DIF 2027
                </h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.25rem' }}>
                Resumen ejecutivo de beneficiarios del Sistema DIF Tuxtla Gutiérrez para el ejercicio fiscal 2027.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '10px', textAlign: 'center', border: '1px solid #dbeafe' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1d4ed8' }}>100%</span>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>Padrón Auditado</div>
                </div>
                <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '10px', textAlign: 'center', border: '1px solid #dcfce7' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>67%</span>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>Mujeres (M)</div>
                </div>
                <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '10px', textAlign: 'center', border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309' }}>50 años</span>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>Edad Promedio</div>
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', background: '#f8fafc' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.6rem' }}>
                  Campos exportados en el consolidado:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.78rem' }}>
                  <span className="badge badge--activo">Folio Oficial</span>
                  <span className="badge badge--activo">Nombre y Apellidos</span>
                  <span className="badge badge--activo">CURP</span>
                  <span className="badge badge--activo">Tipo Discapacidad</span>
                  <span className="badge badge--activo">Ayuda Técnica</span>
                  <span className="badge badge--activo">Colonia / Asentamiento</span>
                  <span className="badge badge--activo">Estatus</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="btn-sm"
                  style={{ padding: '0.6rem 1.1rem', cursor: 'pointer' }}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    exportarCSV('general');
                  }}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', cursor: 'pointer' }}
                >
                  <Download size={15} />
                  <span>Descargar Archivo CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DISTRIBUCIÓN POR MUNICIPIO ── */}
      {activeModal === 'municipio' && (
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
            maxWidth: '620px',
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
                <MapPin size={20} color="#059669" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Distribución Territorial de Beneficiarios
                </h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.25rem' }}>
                Concentrado de apoyos y padrones clasificados por colonias y asentamientos del municipio de Tuxtla Gutiérrez:
              </p>

              <div className="table-wrapper" style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Asentamiento / Colonia</th>
                      <th>Municipio</th>
                      <th style={{ textAlign: 'right' }}>Beneficiarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Colonia Los Limones</td>
                      <td>Tuxtla Gutiérrez</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>1</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Residencial La Hacienda</td>
                      <td>Tuxtla Gutiérrez</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>1</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Barrio San Roque</td>
                      <td>Tuxtla Gutiérrez</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>1</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="btn-sm"
                  style={{ padding: '0.6rem 1.1rem', cursor: 'pointer' }}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    exportarCSV('municipio');
                  }}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', cursor: 'pointer' }}
                >
                  <Download size={15} />
                  <span>Exportar Reporte Territorial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReportes;
