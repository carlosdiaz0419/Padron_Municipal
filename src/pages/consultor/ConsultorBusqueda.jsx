import React, { useState } from 'react';
import { getBeneficiarios } from '../../services/api';
import { 
  Search, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

/**
 * ConsultorBusqueda — Búsqueda de beneficiarios (solo lectura) con Lucide icons.
 */
function ConsultorBusqueda() {
  const [filtros, setFiltros] = useState({ busqueda: '', programa: '', municipio: '' });
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [buscado, setBuscado] = useState(false);

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleBuscar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await getBeneficiarios(filtros);
      setResultados(data?.beneficiarios || []);
      setBuscado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      default:
        return (
          <span className="badge badge--inactivo">
            <XCircle size={12} /> {estatus}
          </span>
        );
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <span>Consulta Pública de Padrones</span>
        </h1>
        <p className="page-subtitle">Módulo de consulta y validación de beneficiarios (Acceso de Solo Lectura).</p>
      </div>

      <form onSubmit={handleBuscar} className="search-form">
        <div className="form-row">
          <div className="form-group" style={{ flex: 1.5 }}>
            <label>Nombre o CURP</label>
            <input
              name="busqueda"
              value={filtros.busqueda}
              onChange={handleChange}
              placeholder="Buscar por nombre, apellidos o CURP..."
            />
          </div>
          <div className="form-group">
            <label>Programa Social</label>
            <input 
              name="programa" 
              value={filtros.programa} 
              onChange={handleChange} 
              placeholder="Ej. Adultos Mayores" 
            />
          </div>
          <div className="form-group">
            <label>Municipio</label>
            <input 
              name="municipio" 
              value={filtros.municipio} 
              onChange={handleChange} 
              placeholder="Ej. Guadalajara" 
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Buscando en padrón...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Filtrar Registros</span>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="alert alert--error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {buscado && (
        <div className="table-wrapper">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.86rem' }}>
            Se encontraron <strong>{resultados.length}</strong> registro(s) coincidentes
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Nombre Completo</th>
                <th>CURP</th>
                <th>Programa</th>
                <th>Municipio</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {resultados.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                    No se encontraron coincidencias para los criterios ingresados.
                  </td>
                </tr>
              ) : (
                resultados.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{b.folio}</td>
                    <td>{b.nombre_completo}</td>
                    <td style={{ fontFamily: 'monospace', color: '#475569' }}>{b.curp}</td>
                    <td>{b.programa}</td>
                    <td>{b.municipio}</td>
                    <td>{getStatusBadge(b.estatus)}</td>
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

export default ConsultorBusqueda;
