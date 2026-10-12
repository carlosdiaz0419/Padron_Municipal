import React from 'react';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  ShieldCheck
} from 'lucide-react';

/**
 * AdminDashboard — Panel principal del Administrador con diseño moderno e iconos Lucide.
 */
function AdminDashboard() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <span>Panel de Administración</span>
        </h1>
        <p className="page-subtitle">
          Bienvenido al centro de control. Gestiona usuarios, catálogos y supervisa el estado general del padrón.
        </p>
      </div>

      <div className="cards-grid">
        <div className="card">
          <div className="card__icon-wrapper card__icon-wrapper--blue">
            <Users size={22} />
          </div>
          <h3>Usuarios y Accesos</h3>
          <p>Gestiona cuentas de capturistas, supervisores, consultores y administradores.</p>
        </div>

        <div className="card">
          <div className="card__icon-wrapper card__icon-wrapper--purple">
            <BookOpen size={22} />
          </div>
          <h3>Catálogos del Sistema</h3>
          <p>Administra programas sociales, municipios, localidades y tipos de apoyo.</p>
        </div>

        <div className="card">
          <div className="card__icon-wrapper card__icon-wrapper--green">
            <BarChart3 size={22} />
          </div>
          <h3>Métricas y Reportes</h3>
          <p>Estadísticas en tiempo real, exportaciones a Excel y resúmenes ejecutivos.</p>
        </div>

        <div className="card">
          <div className="card__icon-wrapper card__icon-wrapper--amber">
            <ShieldCheck size={22} />
          </div>
          <h3>Auditoría de Actividad</h3>
          <p>Historial detallado de altas, modificaciones y acciones realizadas por usuarios.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
