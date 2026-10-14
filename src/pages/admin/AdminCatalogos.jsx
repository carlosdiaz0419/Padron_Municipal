import React, { useEffect, useState } from 'react';
import { Plus, Layers, Loader2, AlertCircle } from 'lucide-react';
import { getCatalogosServicios } from '../../services/api';

function AdminCatalogos() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCatalogos() {
      try {
        setLoading(true);
        const data = await getCatalogosServicios();
        if (Array.isArray(data)) {
          setServicios(data);
        } else if (data && typeof data === 'object') {
          // Aplanar si viene agrupado por categoría
          const flattened = Object.entries(data).flatMap(([catKey, items]) => {
            if (Array.isArray(items)) {
              return items.map((item) => ({ ...item, categoria_grupo: catKey }));
            }
            return [];
          });
          setServicios(flattened);
        }
      } catch (err) {
        setError(err.message || 'Error al obtener catálogos de servicios');
      } finally {
        setLoading(false);
      }
    }
    loadCatalogos();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Catálogos de Servicios</h1>
          <p className="page-subtitle">Catálogo institucional de servicios y apoyos con IDs por categoría (GET /api/catalogos/servicios).</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={28} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Cargando catálogo de servicios...</p>
        </div>
      )}

      {error && (
        <div className="alert alert--error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {!loading && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Código / Clave</th>
                <th>Nombre del Servicio</th>
                <th>Categoría</th>
                <th style={{ textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {servicios.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                    No hay servicios registrados en el catálogo.
                  </td>
                </tr>
              ) : (
                servicios.map((s) => (
                  <tr key={s.id || s.clave || s.codigo}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0284c7' }}>#{s.id}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.codigo || s.clave}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{s.nombre}</td>
                    <td>
                      <span className="badge badge--activo" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                        <Layers size={12} /> {s.categoria || s.categoria_grupo || 'General'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-sm">Configurar</button>
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

export default AdminCatalogos;
