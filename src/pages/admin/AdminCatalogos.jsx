import React from 'react';
import { Plus } from 'lucide-react';

function AdminCatalogos() {
  const programas = [
    { id: 1, clave: 'PAM-2026', nombre: 'Pensión Adultos Mayores', cupo: '50,000' },
    { id: 2, clave: 'BB-2026', nombre: 'Becas para el Bienestar', cupo: '25,000' },
    { id: 3, clave: 'AMT-2026', nombre: 'Apoyo a Madres Trabajadoras', cupo: '15,000' },
    { id: 4, clave: 'JCF-2026', nombre: 'Jóvenes Construyendo Futuro', cupo: '30,000' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Catálogos del Sistema</h1>
          <p className="page-subtitle">Programas sociales vigentes, municipios y catálogos de referencia.</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} />
          <span>Nuevo Programa</span>
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Clave</th>
              <th>Nombre del Programa Social</th>
              <th>Meta / Cupo Anual</th>
              <th style={{ textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {programas.map((p) => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.clave}</td>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>{p.nombre}</td>
                <td>{p.cupo} beneficiarios</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-sm">Configurar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminCatalogos;
