import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList,
  CheckSquare, 
  BarChart3, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Info 
} from 'lucide-react';
import { getBeneficiarios } from '../../services/api';

/**
 * SupervisorDashboard — Panel principal del Supervisor conectado con métricas reales de la Base de Datos.
 */
function SupervisorDashboard() {
  const [stats, setStats] = useState({ validados: 0, pendientes: 0, total: 0 });

  useEffect(() => {
    let mounted = true;
    getBeneficiarios({ limit: 100 })
      .then((res) => {
        if (!mounted) return;
        const list = res?.beneficiarios || (Array.isArray(res) ? res : []);
        const validados = list.filter((b) => (b.estatus || 'activo') === 'activo').length;
        const pendientes = list.filter((b) => b.estatus === 'pendiente').length;
        setStats({ validados, pendientes, total: list.length });
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

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
        {/* Módulo 0: Padrón de Beneficiarios */}
        <Link to="/supervisor/beneficiarios" className="module-card-link">
          <div className="module-card module-card--amber">
            <div className="module-card__accent"></div>
            <div className="module-card__header">
              <div className="module-card__icon-wrap">
                <ClipboardList size={24} />
              </div>
              <span className="module-card__category">Padrón</span>
            </div>
            <h3 className="module-card__title">Padrón de Beneficiarios</h3>
            <p className="module-card__desc">
              Consulta el listado oficial de beneficiarios, exporta en Excel o PDF, imprime fichas oficiales, agrega ayudas, edita o registra nuevos expedientes.
            </p>
            <div className="module-card__footer">
              <span>Ver listado general</span>
              <span className="module-card__arrow"><ArrowRight size={16} /></span>
            </div>
          </div>
        </Link>

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
