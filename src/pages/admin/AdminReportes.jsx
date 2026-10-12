import React from 'react';
import { BarChart3, Download, FileSpreadsheet } from 'lucide-react';

function AdminReportes() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Módulo de Reportes</h1>
          <p className="page-subtitle">Generación de estadísticas y padrones en formatos exportables.</p>
        </div>
        <button className="btn-primary">
          <Download size={16} />
          <span>Exportar a Excel</span>
        </button>
      </div>

      <div className="cards-grid">
        <div className="card">
          <div className="card__icon-wrapper card__icon-wrapper--blue">
            <BarChart3 size={22} />
          </div>
          <h3>Padrón General Consolidado</h3>
          <p>Listado general de beneficiarios activos filtrados por ejercicio fiscal.</p>
        </div>
        <div className="card">
          <div className="card__icon-wrapper card__icon-wrapper--green">
            <FileSpreadsheet size={22} />
          </div>
          <h3>Distribución por Municipio</h3>
          <p>Concentrado de beneficiarios agrupados por municipio y localidad.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminReportes;
