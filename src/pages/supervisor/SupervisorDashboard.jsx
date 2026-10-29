import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Info,
  CheckSquare,
  ClipboardList,
  BarChart3,
  ArrowRight,
  Eye,
  Check,
  XCircle,
  FileText
} from 'lucide-react';
import { getBeneficiarios } from '../../services/api';

/**
 * SupervisorDashboard — Panel principal del Supervisor conectado con métricas reales de la Base de Datos.
 */
function SupervisorDashboard() {
  const [stats, setStats] = useState({ validados: 0, pendientes: 0, total: 0 });
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getBeneficiarios({ limit: 100 })
      .then((res) => {
        if (!mounted) return;
        const list = res?.beneficiarios || (Array.isArray(res) ? res : []);
        const esVal = (s) => ['validado', 'aprobado', 'activo'].includes(String(s || '').toLowerCase());
        const esPend = (s) => ['pendiente', 'en proceso', 'por validar'].includes(String(s || 'pendiente').toLowerCase());
        
        const validados = list.filter((b) => esVal(b.estatus)).length;
        const pendientes = list.filter((b) => esPend(b.estatus)).length;
        
        setStats({ validados, pendientes, total: res?.total ?? list.length });
        setBeneficiarios(list.slice(0, 8)); // Mostrar los primeros 8 expedientes
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const getStatusBadge = (estatus) => {
    const s = String(estatus || 'pendiente').toLowerCase();
    if (s === 'validado' || s === 'aprobado' || s === 'activo') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
          <CheckCircle2 size={12} /> Aprobado
        </span>
      );
    }
    if (s === 'rechazado' || s === 'inactivo') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
          <XCircle size={12} /> Rechazado
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
        <Clock size={12} /> Pendiente
      </span>
    );
  };

  return (
    <div>
      {/* ── HERO BANNER DEL SUPERVISOR ── */}
      <div className="dashboard-hero dashboard-hero--supervisor">
        <div>
          <span className="dashboard-hero__badge">
            <Sparkles size={13} />
            Módulo de Supervisión • Control de Calidad
          </span>
          <h1 className="dashboard-hero__title">Panel de Supervisión</h1>
          <p className="dashboard-hero__desc">
            Supervisa los registros enviados por capturistas, valida la documentación socioeconómica y autoriza la incorporación al Padrón Municipal de Beneficiarios.
          </p>
        </div>
        <div className="dashboard-hero__meta">
          <div className="dashboard-hero__pill">
            <span className="status-dot-pulse"></span>
            <span>Validación Activa</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
            Tuxtla Gutiérrez 2024-2027
          </span>
        </div>
      </div>

      {/* ── METRICAS RÁPIDAS DE SUPERVISIÓN (BASE DE DATOS REAL) ── */}
      <div className="stats-grid">
        <div className="stat-card stat-card--green">
          <div className="stat-card__info">
            <span className="stat-card__label">Expedientes Validados</span>
            <span className="stat-card__value">{stats.validados}</span>
            <span className="stat-card__badge" style={{ color: '#059669' }}>
              Aprobados en Base de Datos
            </span>
          </div>
          <div className="stat-card__icon">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card stat-card--amber">
          <div className="stat-card__info">
            <span className="stat-card__label">Pendientes de Revisión</span>
            <span className="stat-card__value">{stats.pendientes}</span>
            <span className="stat-card__badge" style={{ color: '#d97706' }}>
              Requieren Dictamen
            </span>
          </div>
          <div className="stat-card__icon">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card stat-card--blue">
          <div className="stat-card__info">
            <span className="stat-card__label">Total en Padrón</span>
            <span className="stat-card__value">{stats.total}</span>
            <span className="stat-card__badge" style={{ color: '#2563eb' }}>
              Registros en Base de Datos
            </span>
          </div>
          <div className="stat-card__icon">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* ── BOTONES DE ACCESO RÁPIDO PARA EL SUPERVISOR ── */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '1.25rem 0' }}>
        <Link 
          to="/supervisor/validacion" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'linear-flex, #d97706', 
            backgroundColor: '#0284c7', 
            color: '#fff', 
            padding: '10px 18px', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontWeight: 600, 
            fontSize: '13px' 
          }}
        >
          <CheckSquare size={16} />
          <span>Dictaminar Expedientes Pendientes ({stats.pendientes})</span>
          <ArrowRight size={14} />
        </Link>
        <Link 
          to="/supervisor/beneficiarios" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: '#ffffff', 
            color: '#0f172a', 
            border: '1px solid #cbd5e1', 
            padding: '10px 18px', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontWeight: 600, 
            fontSize: '13px' 
          }}
        >
          <ClipboardList size={16} color="#0284c7" />
          <span>Ver Padrón de Beneficiarios Completo ({stats.total})</span>
        </Link>
        <Link 
          to="/supervisor/reportes" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: '#ffffff', 
            color: '#0f172a', 
            border: '1px solid #cbd5e1', 
            padding: '10px 18px', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontWeight: 600, 
            fontSize: '13px' 
          }}
        >
          <BarChart3 size={16} color="#059669" />
          <span>Generar Reporte de Supervisión</span>
        </Link>
      </div>

      {/* ── TABLA DE EXPEDIENTES EN TIEMPO REAL ── */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem', marginTop: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>
              Expedientes Recientes para Revisión y Control
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Supervisión en tiempo real de registros ingresados al padrón DIF Tuxtla Gutiérrez
            </p>
          </div>
          <Link to="/supervisor/beneficiarios" style={{ fontSize: '0.8rem', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
            Ver todos ({stats.total}) &rarr;
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            Cargando expedientes de la base de datos...
          </div>
        ) : beneficiarios.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            No hay expedientes registrados en el sistema.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>FOLIO</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>SOLICITANTE</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>CURP</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>AYUDA TÉCNICA</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>ASENTAMIENTO</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>ESTATUS</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'center' }}>ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {beneficiarios.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0284c7' }}>
                      {b.folio || `DIF-2027-${String(b.id).padStart(3, '0')}`}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>
                      {b.nombre_completo || b.nombre}
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#475569' }}>
                      {b.curp}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#334155' }}>
                      {b.tipo_ayuda_solicitada || b.ultimaAyuda || 'Apoyo Asistencial'}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>
                      {b.domicilio?.nombreAsentamiento || b.nombre_asentamiento || 'Tuxtla Gutiérrez'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {getStatusBadge(b.estatus)}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <Link 
                        to="/supervisor/validacion" 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          background: '#f1f5f9', 
                          color: '#0f172a', 
                          padding: '4px 8px', 
                          borderRadius: '6px', 
                          textDecoration: 'none', 
                          fontSize: '11px', 
                          fontWeight: 500 
                        }}
                      >
                        <CheckSquare size={12} color="#0284c7" />
                        <span>Revisar</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── TARJETA DE GUÍA RÁPIDA ── */}
      <div className="dashboard-tips-card" style={{ marginTop: '1.25rem' }}>
        <div className="dashboard-tips__info">
          <div className="dashboard-tips__icon">
            <Info size={20} />
          </div>
          <div className="dashboard-tips__text">
            <h4>Criterio de Validación Municipal</h4>
            <p>Los expedientes aprobados pasan inmediatamente al Padrón Oficial Definitivo disponible para la entrega de apoyos sociales y generación de cédulas oficiales (Anexo 5).</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupervisorDashboard;
