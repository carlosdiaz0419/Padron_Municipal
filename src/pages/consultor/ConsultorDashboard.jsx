import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  FileText, 
  Info 
} from 'lucide-react';

/**
 * ConsultorDashboard — Panel del Consultor con diseño moderno,
 * métricas de acceso, tarjetas de búsqueda y guía operativa.
 */
function ConsultorDashboard() {
  return (
    <div>
      {/* ── HERO BANNER DEL CONSULTOR ── */}
      <div className="dashboard-hero dashboard-hero--consultor">
        <div>
          <span className="dashboard-hero__badge">
            <Sparkles size={13} />
            Módulo de Consulta Oficial • Solo Lectura
          </span>
          <h1 className="dashboard-hero__title">Panel de Consulta</h1>
          <p className="dashboard-hero__desc">
            Acceso autorizado de solo lectura al Padrón Oficial de Beneficiarios Municipales. Consulta expedientes, verifica folios y valida apoyos entregados.
          </p>
        </div>
        <div className="dashboard-hero__meta">
          <div className="dashboard-hero__pill">
            <span className="status-dot-pulse"></span>
            <span>Consulta en Línea</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
            Tuxtla Gutiérrez 2024-2027
          </span>
        </div>
      </div>

      {/* ── MÉTRICAS DE CONSULTA ── */}
      <div className="stats-grid">
        <div className="stat-card stat-card--blue">
          <div className="stat-card__info">
            <span className="stat-card__label">Padrón Disponible</span>
            <span className="stat-card__value">1,280</span>
            <span className="stat-card__badge" style={{ color: '#0284c7' }}>
              Registros Indexados
            </span>
          </div>
          <div className="stat-card__icon">
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card stat-card--purple">
          <div className="stat-card__info">
            <span className="stat-card__label">Búsquedas Realizadas</span>
            <span className="stat-card__value">1,450</span>
            <span className="stat-card__badge" style={{ color: '#7c3aed' }}>
              Consultas Validadas
            </span>
          </div>
          <div className="stat-card__icon">
            <Search size={22} />
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__info">
            <span className="stat-card__label">Seguridad de Acceso</span>
            <span className="stat-card__value">Protegido</span>
            <span className="stat-card__badge" style={{ color: '#059669' }}>
              Sin Modificación de Datos
            </span>
          </div>
          <div className="stat-card__icon">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* ── MÓDULOS DISPONIBLES ── */}
      <div className="section-heading">
        <div>
          <h2 className="section-heading__title">
            <span>Herramientas de Consulta</span>
          </h2>
          <p className="section-heading__desc">
            Localiza beneficiarios por folio único, CURP, nombre o programa social
          </p>
        </div>
      </div>

      <div className="cards-grid">
        {/* Módulo 1: Búsqueda y Verificación */}
        <Link to="/consultor/busqueda" className="module-card-link">
          <div className="module-card module-card--cyan">
            <div className="module-card__accent"></div>
            <div className="module-card__header">
              <div className="module-card__icon-wrap">
                <Search size={24} />
              </div>
              <span className="module-card__category">Búsqueda Avanzada</span>
            </div>
            <h3 className="module-card__title">Búsqueda y Verificación de Beneficiarios</h3>
            <p className="module-card__desc">
              Consulta registros por CURP, folio DIF, nombre completo, municipio o programa social. Visualiza el historial completo del expediente.
            </p>
            <div className="module-card__footer">
              <span>Iniciar búsqueda</span>
              <span className="module-card__arrow"><ArrowRight size={16} /></span>
            </div>
          </div>
        </Link>

        {/* Módulo 2: Consulta por Folio Directo */}
        <Link to="/consultor/busqueda" className="module-card-link">
          <div className="module-card module-card--purple">
            <div className="module-card__accent"></div>
            <div className="module-card__header">
              <div className="module-card__icon-wrap">
                <FileText size={24} />
              </div>
              <span className="module-card__category">Folios DIF</span>
            </div>
            <h3 className="module-card__title">Cotejo de Apoyos y Ayudas Técnicas</h3>
            <p className="module-card__desc">
              Verifica si un ciudadano ya cuenta con apoyos entregados por el DIF Municipal o Estatal para evitar duplicidad de beneficios.
            </p>
            <div className="module-card__footer">
              <span>Verificar apoyos</span>
              <span className="module-card__arrow"><ArrowRight size={16} /></span>
            </div>
          </div>
        </Link>
      </div>

      {/* ── BANNER DE AYUDA Y PRIVACIDAD ── */}
      <div className="dashboard-tips-card">
        <div className="dashboard-tips__info">
          <div className="dashboard-tips__icon">
            <Info size={20} />
          </div>
          <div className="dashboard-tips__text">
            <h4>Aviso de Confidencialidad y Protección de Datos</h4>
            <p>La información contenida en el Padrón Municipal de Beneficiarios está clasificada como de carácter reservado y confidencial conforme a la Ley General de Protección de Datos Personales.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsultorDashboard;
