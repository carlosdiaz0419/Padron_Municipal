import React from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

function ConsultorDashboard() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <span>Panel de Consulta</span>
        </h1>
        <p className="page-subtitle">
          Acceso de solo lectura al padrón oficial. Búsqueda y verificación de folios de beneficiarios.
        </p>
      </div>

      <div className="cards-grid">
        <Link to="/consultor/busqueda" style={{ textDecoration: 'none' }}>
          <div className="card">
            <div className="card__icon-wrapper card__icon-wrapper--purple">
              <Search size={22} />
            </div>
            <h3>Búsqueda y Verificación</h3>
            <p>Consulta registros por CURP, nombre completo, municipio o programa social.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default ConsultorDashboard;
