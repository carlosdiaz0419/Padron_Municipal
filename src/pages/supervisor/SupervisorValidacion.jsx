import React from 'react';
import { Check, X } from 'lucide-react';

function SupervisorValidacion() {
  const pendientes = [
    { id: 2, folio: 'BEN-2026-002', nombre: 'José Luis Morales Sánchez', curp: 'MOSL920823HDFRRN02', programa: 'Becas para el Bienestar', municipio: 'Zapopan' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <span>Validación de Expedientes</span>
        </h1>
        <p className="page-subtitle">Revisa los beneficiarios capturados que requieren autorización para pasar a estatus Activo.</p>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Nombre Completo</th>
              <th>CURP</th>
              <th>Programa</th>
              <th>Municipio</th>
              <th style={{ textAlign: 'right' }}>Decisión</th>
            </tr>
          </thead>
          <tbody>
            {pendientes.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>{p.folio}</td>
                <td>{p.nombre}</td>
                <td style={{ fontFamily: 'monospace' }}>{p.curp}</td>
                <td>{p.programa}</td>
                <td>{p.municipio}</td>
                <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button className="btn-sm" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                    <Check size={14} /> Aprobar
                  </button>
                  <button className="btn-sm" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>
                    <X size={14} /> Rechazar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SupervisorValidacion;
