import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Users, 
  FileCheck, 
  Clock, 
  Info 
} from 'lucide-react';
import { getBeneficiarios } from '../../services/api';

/**
 * CapturistaDashboard — Panel del Capturista conectado con los registros reales de la Base de Datos.
 */
function CapturistaDashboard() {
  const [totalPadron, setTotalPadron] = useState(0);

  useEffect(() => {
    let mounted = true;
    getBeneficiarios({ limit: 100 })
      .then((res) => {
        if (!mounted) return;
        const list = res?.beneficiarios || (Array.isArray(res) ? res : []);
        setTotalPadron(res?.total ?? list.length);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      {/* ── HERO BANNER DEL CAPTURISTA ── */}
      <div className="dashboard-hero dashboard-hero--capturista">
        <div>
          <span className="dashboard-hero__badge">
            <Sparkles size={13} />
            Módulo de Captura y Afiliación Municipal
          </span>
          <h1 className="dashboard-hero__title">Panel de Captura</h1>
          <p className="dashboard-hero__desc">
            Gestión y registro de beneficiarios del Ayuntamiento de Tuxtla Gutiérrez. Registra nuevos ciudadanos, valida datos con la CURP y actualiza expedientes existentes.
          </p>
        </div>
        <div className="dashboard-hero__meta">
          <div className="dashboard-hero__pill">
            <span className="status-dot-pulse"></span>
            <span>Módulo de Afiliación Activo</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
            Secretaría de Planeación
          </span>
        </div>
      </div>

      {/* ── MÉTRICAS DEL CAPTURISTA (BASE DE DATOS REAL) ── */}
      <div className="stats-grid">
        <div className="stat-card stat-card--amber">
          <div className="stat-card__info">
            <span className="stat-card__label">Capturas Registradas</span>
            <span className="stat-card__value">{totalPadron}</span>
            <span className="stat-card__badge" style={{ color: '#d97706' }}>
              Expedientes en Base de Datos
            </span>
          </div>
          <div className="stat-card__icon">
            <FileCheck size={22} />
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__info">
            <span className="stat-card__label">Padrón Municipal</span>
            <span className="stat-card__value">{totalPadron}</span>
            <span className="stat-card__badge" style={{ color: '#059669' }}>
              Ciudadanos Registrados
            </span>
          </div>
          <div className="stat-card__icon">
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card stat-card--blue">
          <div className="stat-card__info">
            <span className="stat-card__label">Autocompletado Oficial</span>
            <span className="stat-card__value">CURP</span>
            <span className="stat-card__badge" style={{ color: '#2563eb' }}>
              Cálculo Automático de Edad y Sexo
            </span>
          </div>
          <div className="stat-card__icon">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* ── BANNER DE RECOMENDACIÓN ── */}
      <div className="dashboard-tips-card">
        <div className="dashboard-tips__info">
          <div className="dashboard-tips__icon">
            <Info size={20} />
          </div>
          <div className="dashboard-tips__text">
            <h4>Autocompletado con CURP</h4>
            <p>Al ingresar una CURP válida en el formulario de alta, el sistema calcula automáticamente la fecha de nacimiento, edad y género del beneficiario.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CapturistaDashboard;
