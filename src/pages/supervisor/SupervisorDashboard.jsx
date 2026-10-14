import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  BarChart3, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Info 
} from 'lucide-react';

/**
 * SupervisorDashboard — Panel principal del Supervisor con diseño moderno,
 * KPIs de cotejo, módulos interactivos con enlaces directos y tarjeta informativa.
 */
function SupervisorDashboard() {
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

      {/* ── METRICAS RÁPIDAS DE SUPERVISIÓN ── */}
      <div className="stats-grid">
        <div className="stat-card stat-card--green">
          <div className="stat-card__info">
            <span className="stat-card__label">Expedientes Validados</span>
            <span className="stat-card__value">847</span>
            <span className="stat-card__badge" style={{ color: '#059669' }}>
              Aprobados Oficialmente
            </span>
          </div>
          <div className="stat-card__icon">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card stat-card--amber">
          <div className="stat-card__info">
            <span className="stat-card__label">Pendientes de Revisión</span>
            <span className="stat-card__value">12</span>
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
            <span className="stat-card__label">Cobertura de Programas</span>
            <span className="stat-card__value">100%</span>
            <span className="stat-card__badge" style={{ color: '#2563eb' }}>
              Zonas de Atención Prioritaria
            </span>
          </div>
          <div className="stat-card__icon">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* ── SECCIÓN DE MÓDULOS DE ACCIÓN ── */}
      <div className="section-heading">
        <div>
          <h2 className="section-heading__title">
            <span>Módulos de Supervisión y Dictaminación</span>
          </h2>
          <p className="section-heading__desc">
            Revisa solicitudes pendientes o genera informes consolidados de avance
          </p>
        </div>
      </div>

      <div className="cards-grid">
        {/* Módulo 1: Validación */}
        <Link to="/supervisor/validacion" className="module-card-link">
          <div className="module-card module-card--green">
            <div className="module-card__accent"></div>
            <div className="module-card__header">
              <div className="module-card__icon-wrap">
                <CheckSquare size={24} />
              </div>
              <span className="module-card__category">Revisión</span>
            </div>
            <h3 className="module-card__title">Validación de Registros</h3>
            <p className="module-card__desc">
              Revisa y aprueba solicitudes en estatus pendiente, verificando documentación oficial, CURP y comprobantes de domicilio.
            </p>
            <div className="module-card__footer">
              <span>Dictaminar solicitudes</span>
              <span className="module-card__arrow"><ArrowRight size={16} /></span>
            </div>
          </div>
        </Link>

        {/* Módulo 2: Reportes */}
        <Link to="/supervisor/reportes" className="module-card-link">
          <div className="module-card module-card--blue">
            <div className="module-card__accent"></div>
            <div className="module-card__header">
              <div className="module-card__icon-wrap">
                <BarChart3 size={24} />
              </div>
              <span className="module-card__category">Estadísticas</span>
            </div>
            <h3 className="module-card__title">Reportes de Supervisión</h3>
            <p className="module-card__desc">
              Consulta métricas por municipio, capturista asignado, estatus de expedientes y avance de metas por programa social.
            </p>
            <div className="module-card__footer">
              <span>Consultar estadísticas</span>
              <span className="module-card__arrow"><ArrowRight size={16} /></span>
            </div>
          </div>
        </Link>
      </div>

      {/* ── TARJETA DE GUÍA RÁPIDA ── */}
      <div className="dashboard-tips-card">
        <div className="dashboard-tips__info">
          <div className="dashboard-tips__icon">
            <Info size={20} />
          </div>
          <div className="dashboard-tips__text">
            <h4>Criterio de Validación Municipal</h4>
            <p>Los expedientes aprobados pasan inmediatamente al Padrón Oficial Definitivo disponible para la entrega de apoyos sociales.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupervisorDashboard;
