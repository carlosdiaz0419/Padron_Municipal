import React from 'react';
import { BarChart3, Download } from 'lucide-react';

function SupervisorReportes() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Reportes de Supervisión</h1>
          <p className="page-subtitle">Informes de avance de captura, validación y metas asignadas.</p>
        </div>
        <button className="btn-primary">
          <Download size={16} />
          <span>Exportar Resumen</span>
        </button>
      </div>

      <div className="cards-grid">
        <div className="card">
          <div className="card__icon-wrapper card__icon-wrapper--green">
            <BarChart3 size={22} />
          </div>
          <h3>Avance de Validaciones</h3>
          <p>Porcentaje de registros evaluados respecto al total de expedientes recibidos.</p>
        </div>
      </div>
    </div>
  );
}

export default SupervisorReportes;
