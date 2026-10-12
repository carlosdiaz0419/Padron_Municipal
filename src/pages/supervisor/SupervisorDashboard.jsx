import React from 'react';
import { CheckSquare, BarChart3 } from 'lucide-react';

function SupervisorDashboard() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <span>Panel de Supervisión</span>
        </h1>
        <p className="page-subtitle">
          Supervisa los registros enviados por capturistas, valida información y revisa reportes de cobertura.
        </p>
      </div>

      <div className="cards-grid">
        <div className="card">
          <div className="card__icon-wrapper card__icon-wrapper--green">
            <CheckSquare size={22} />
          </div>
          <h3>Validación de Registros</h3>
          <p>Revisa y aprueba solicitudes en estatus pendiente con cotejo de documentación.</p>
        </div>

        <div className="card">
          <div className="card__icon-wrapper card__icon-wrapper--blue">
            <BarChart3 size={22} />
          </div>
          <h3>Reportes de Supervisión</h3>
          <p>Consulta métricas por municipio, capturista y programa social asignado.</p>
        </div>
      </div>
    </div>
  );
}

export default SupervisorDashboard;
