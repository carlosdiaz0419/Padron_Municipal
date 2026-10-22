import React, { useState, useEffect } from 'react';
import { 
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
