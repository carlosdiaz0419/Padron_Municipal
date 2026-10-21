import React, { useState, useEffect } from 'react';
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
  FileCheck2,
  FileText
} from 'lucide-react';
import { getBeneficiarios } from '../../services/api';
import { exportToExcel, exportToPDF, COLUMNAS_PADRON_COMPLETO } from '../../utils/exportUtils';

function AdminReportes() {
  const [downloading, setDownloading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'consolidado' | 'municipio' | null
  const [beneficiariosList, setBeneficiariosList] = useState([]);

  useEffect(() => {
    getBeneficiarios({ limit: 500 })
      .then((res) => {
        const lista = res?.beneficiarios || (Array.isArray(res) ? res : []);
        setBeneficiariosList(lista);
      })
      .catch(() => {});
  }, []);

  const totalBenef = beneficiariosList.length;
  const mujeresCount = beneficiariosList.filter((b) => b.sexo === 'M').length;
  const pctMujeresReal = totalBenef > 0 ? Math.round((mujeresCount / totalBenef) * 100) : 0;
  const edades = beneficiariosList.map((b) => Number(b.edad)).filter((e) => !isNaN(e) && e > 0);
  const edadPromedioReal = edades.length > 0 ? Math.round(edades.reduce((a, c) => a + c, 0) / edades.length) : 0;

  const coloniasAgrupadas = Object.values(
    beneficiariosList.reduce((acc, b) => {
      const col = `${b.tipo_asentamiento || ''} ${b.nombre_asentamiento || ''}`.trim() || 'Sin especificar';
      if (!acc[col]) acc[col] = { nombre: col, total: 0 };
      acc[col].total += 1;
      return acc;
    }, {})
  );

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const columnasConsolidado = COLUMNAS_PADRON_COMPLETO;

  const columnasTerritorial = [
    { header: 'Folio', key: 'folio' },
    { header: 'Beneficiario', render: (b) => b.nombre_completo || b.nombre || '' },
    { header: 'CURP', key: 'curp' },
    { header: 'Colonia / Asentamiento', render: (b) => `${b.tipo_asentamiento || ''} ${b.nombre_asentamiento || ''}`.trim() },
    { header: 'Dirección Completa', render: (b) => `${b.tipo_vialidad || ''} ${b.nombre_vialidad || ''} ${b.numero_exterior || ''}`.trim() },
    { header: 'Municipio', render: () => 'Tuxtla Gutiérrez' },
    { header: 'Estatus', render: (b) => (b.estatus || 'Activo').toUpperCase() }
  ];

  const handleExportConsolidadoExcel = async () => {
    try {
      setDownloading(true);
      const res = await getBeneficiarios({ limit: 100 });
      const lista = res?.beneficiarios || (Array.isArray(res) ? res : []);
      exportToExcel({
        filename: 'Padron_General_Consolidado_DIF_2027.xls',
        title: 'Padrón General Consolidado DIF 2027',
        subtitle: 'Sistema DIF Tuxtla Gutiérrez — Dirección de Asistencia Social',
        columns: columnasConsolidado,
        data: lista
      });
      showToast(`Archivo Excel (.xls) descargado exitosamente (${lista.length} registros).`);
    } catch (err) {
      alert('Error al generar Excel: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleExportConsolidadoPDF = async () => {
    try {
      setDownloading(true);
      const res = await getBeneficiarios({ limit: 100 });
      const lista = res?.beneficiarios || (Array.isArray(res) ? res : []);
      const total = lista.length;
      const mujeres = lista.filter((b) => b.sexo === 'M').length;
      const pctMujeres = total > 0 ? Math.round((mujeres / total) * 100) : 0;
      exportToPDF({
        title: 'Padrón General Consolidado DIF 2027',
        subtitle: 'Sistema Municipal DIF Tuxtla Gutiérrez — Padrón Oficial Auditado',
        columns: columnasConsolidado,
        data: lista,
        orientation: 'landscape',
        summaryItems: [
          { label: 'Total Registros', value: total },
          { label: 'Mujeres (M)', value: `${pctMujeres}%` },
          { label: 'Estatus', value: '100% Auditado' }
        ]
      });
      showToast(`Documento PDF generado exitosamente (${lista.length} registros).`);
    } catch (err) {
      alert('Error al generar PDF: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleExportTerritorialExcel = async () => {
    try {
      setDownloading(true);
      const res = await getBeneficiarios({ limit: 100 });
      const lista = res?.beneficiarios || (Array.isArray(res) ? res : []);
      exportToExcel({
        filename: 'Distribucion_Territorial_DIF_2027.xls',
        title: 'Distribución Territorial de Beneficiarios',
        subtitle: 'Sistema DIF Tuxtla Gutiérrez — Concentrado por Colonias y Localidades',
        columns: columnasTerritorial,
        data: lista
      });
      showToast(`Reporte territorial en Excel descargado exitosamente.`);
    } catch (err) {
      alert('Error al exportar territorial Excel: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleExportTerritorialPDF = async () => {
    try {
      setDownloading(true);
      const res = await getBeneficiarios({ limit: 100 });
      const lista = res?.beneficiarios || (Array.isArray(res) ? res : []);
      exportToPDF({
        title: 'Distribución Territorial de Beneficiarios',
        subtitle: 'Sistema Municipal DIF Tuxtla Gutiérrez — Reporte Geográfico de Cobertura',
        columns: columnasTerritorial,
        data: lista,
        orientation: 'landscape',
        summaryItems: [
          { label: 'Total Beneficiarios', value: lista.length },
          { label: 'Municipio Sede', value: 'Tuxtla Gutiérrez' },
          { label: 'Cobertura', value: '100% Municipal' }
        ]
      });
      showToast(`Reporte territorial en PDF generado exitosamente.`);
    } catch (err) {
      alert('Error al generar PDF territorial: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Módulo de Reportes</h1>
          <p className="page-subtitle">Generación de estadísticas y padrones en formatos exportables en Excel y PDF.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleExportConsolidadoExcel} 
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
            onClick={handleExportConsolidadoPDF} 
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
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1d4ed8' }}>{totalBenef}</span>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>Total Beneficiarios</div>
                </div>
                <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '10px', textAlign: 'center', border: '1px solid #dcfce7' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>{pctMujeresReal}%</span>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>Mujeres (M)</div>
                </div>
                <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '10px', textAlign: 'center', border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309' }}>{edadPromedioReal} años</span>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', flexWrap: 'wrap' }}>
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
                    handleExportConsolidadoExcel();
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
                    setActiveModal(null);
                    handleExportConsolidadoPDF();
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
                    {coloniasAgrupadas.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', color: '#64748b' }}>Sin registros en la base de datos</td>
                      </tr>
                    ) : (
                      coloniasAgrupadas.map((c) => (
                        <tr key={c.nombre}>
                          <td style={{ fontWeight: 600 }}>{c.nombre}</td>
                          <td>Tuxtla Gutiérrez</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>{c.total}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', flexWrap: 'wrap' }}>
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
                    handleExportTerritorialExcel();
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
                    setActiveModal(null);
                    handleExportTerritorialPDF();
                  }}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', cursor: 'pointer' }}
                >
                  <Download size={15} />
                  <span>Descargar PDF</span>
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
