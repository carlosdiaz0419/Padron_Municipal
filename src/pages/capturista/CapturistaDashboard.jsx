import React from 'react';
import { ClipboardList, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

function CapturistaDashboard() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <span>Panel de Captura</span>
        </h1>
        <p className="page-subtitle">
          Gestión del padrón de beneficiarios. Registra nuevos ciudadanos y actualiza expedientes existentes.
        </p>
      </div>

      <div className="cards-grid">
        <Link to="/capturista/beneficiarios" style={{ textDecoration: 'none' }}>
          <div className="card">
            <div className="card__icon-wrapper card__icon-wrapper--amber">
              <ClipboardList size={22} />
            </div>
            <h3>Padrón de Beneficiarios</h3>
            <p>Explora la lista completa, verifica estatus y edita registros activos.</p>
          </div>
        </Link>

        <Link to="/capturista/beneficiarios/nuevo" style={{ textDecoration: 'none' }}>
          <div className="card">
            <div className="card__icon-wrapper card__icon-wrapper--green">
              <UserPlus size={22} />
            </div>
            <h3>Nuevo Registro</h3>
            <p>Captura los datos socioeconómicos y personales de un nuevo beneficiario.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default CapturistaDashboard;
