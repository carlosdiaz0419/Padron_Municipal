import React from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { getBeneficiarios } from '../../services/api';
import { 
  Plus, 
  Edit3, 
  AlertCircle, 
  Loader2, 
  CheckCircle, 
  Clock, 
  XCircle 
} from 'lucide-react';

/**
 * CapturistaBeneficiarios — Listado de beneficiarios con tabla moderna y Lucide icons.
 */
function CapturistaBeneficiarios() {
  const { data, loading, error } = useFetch(getBeneficiarios, []);

  const beneficiarios = data?.beneficiarios || [];

  const getStatusBadge = (estatus) => {
    switch (estatus) {
      case 'activo':
        return (
          <span className="badge badge--activo">
            <CheckCircle size={12} /> Activo
          </span>
        );
      case 'pendiente':
        return (
          <span className="badge badge--pendiente">
            <Clock size={12} /> Pendiente
          </span>
        );
      case 'inactivo':
      case 'rechazado':
        return (
          <span className="badge badge--inactivo">
            <XCircle size={12} /> {estatus.charAt(0).toUpperCase() + estatus.slice(1)}
          </span>
        );
      default:
        return <span className="badge">{estatus}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Padrón de Beneficiarios</h1>
          <p className="page-subtitle">Listado oficial de ciudadanos registrados en programas sociales.</p>
        </div>
        <Link to="/capturista/beneficiarios/nuevo" className="btn-primary">
          <Plus size={16} />
          <span>Nuevo Beneficiario</span>
        </Link>
      </div>

      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={28} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Cargando padrón...</p>
        </div>
      )}

      {error && (
        <div className="alert alert--error">
          <AlertCircle size={18} />
          <span>Error al consultar beneficiarios: {error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Solicitante</th>
                <th>CURP</th>
                <th>Discapacidad</th>
                <th>Ayuda Técnica</th>
                <th>Asentamiento</th>
                <th>Estatus</th>
                <th style={{ textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {beneficiarios.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                    No hay beneficiarios registrados en el padrón DIF.
                  </td>
                </tr>
              ) : (
                beneficiarios.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{b.folio}</td>
                    <td>
                      <div>
                        <strong>{b.nombre_completo}</strong>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {b.edad ? `${b.edad} años` : ''} {b.sexo ? `(${b.sexo})` : ''}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#475569' }}>{b.curp}</td>
                    <td>
                      <span className="badge badge--inactivo">{b.tipo_discapacidad}</span>
                    </td>
                    <td style={{ fontWeight: 500, color: '#1e293b' }}>{b.tipo_ayuda_solicitada}</td>
                    <td style={{ color: '#475569', fontSize: '0.84rem' }}>
                      {b.tipo_asentamiento} {b.nombre_asentamiento}
                    </td>
                    <td>{getStatusBadge(b.estatus)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/capturista/beneficiarios/editar/${b.id}`} className="btn-sm">
                        <Edit3 size={13} />
                        <span>Editar</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CapturistaBeneficiarios;
