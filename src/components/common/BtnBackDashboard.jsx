import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Botón profesional e institucional "Volver al Dashboard"
 * Presenta un diseño moderno con microinteracciones, badge de icono con elevación suave
 * y animación al pasar el cursor.
 */
export default function BtnBackDashboard({ 
  to = '/admin', 
  label = 'Volver al Dashboard',
  style = {}
}) {
  return (
    <Link 
      to={to} 
      className="btn-back-dashboard" 
      title={label}
      style={style}
    >
      <span className="btn-back-dashboard__icon-badge">
        <ArrowLeft size={15} strokeWidth={2.4} />
      </span>
      <span>{label}</span>
    </Link>
  );
}
