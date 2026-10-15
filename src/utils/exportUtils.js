/**
 * ════════════════════════════════════════════════════════════════════════════
 * EXPORT UTILS — Generador de Documentos Oficiales en Excel y PDF
 * Sistema Municipal DIF Tuxtla Gutiérrez — Padrón de Beneficiarios
 * ════════════════════════════════════════════════════════════════════════════
 */

/**
 * Descargar datos en formato Microsoft Excel (.xls nativo con estilos y colores).
 * Compatible con Microsoft Excel, Google Sheets y LibreOffice Calc.
 */
export function exportToExcel({ filename = 'Reporte_DIF', title, subtitle = '', columns = [], data = [] }) {
  const cleanFilename = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  const fechaStr = new Date().toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const tableHeaders = columns
    .map(
      (c) =>
        `<th style="background-color: #0b1d3a; color: #ffffff; font-weight: bold; font-family: Arial, sans-serif; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left;">${c.header}</th>`
    )
    .join('');

  const tableRows = data
    .map((row, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const cells = columns
        .map((c) => {
          let val = '';
          if (typeof c.render === 'function') {
            val = c.render(row);
          } else {
            val = row[c.key] !== undefined && row[c.key] !== null ? String(row[c.key]) : '';
          }
          return `<td style="font-family: Arial, sans-serif; font-size: 9pt; border: 1px solid #e2e8f0; padding: 6px 10px; background-color: ${bg}; color: #1e293b;">${val}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Padrón DIF</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; }
      </style>
    </head>
    <body>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td colspan="${columns.length}" style="font-size: 15pt; font-weight: bold; color: #0b1d3a; font-family: Arial, sans-serif; padding: 8px 0;">
            SISTEMA PARA EL DESARROLLO INTEGRAL DE LA FAMILIA (DIF MUNICIPAL)
          </td>
        </tr>
        <tr>
          <td colspan="${columns.length}" style="font-size: 12pt; font-weight: bold; color: #2563eb; font-family: Arial, sans-serif; padding-bottom: 4px;">
            ${title || 'Padrón Oficial de Beneficiarios'}
          </td>
        </tr>
        ${subtitle ? `<tr><td colspan="${columns.length}" style="font-size: 9.5pt; color: #475569; font-family: Arial, sans-serif; padding-bottom: 4px;">${subtitle}</td></tr>` : ''}
        <tr>
          <td colspan="${columns.length}" style="font-size: 8.5pt; color: #64748b; font-family: Arial, sans-serif; padding-bottom: 12px;">
            Fecha y Hora de Emisión: ${fechaStr} | Ejercicio Fiscal 2026-2027 | Total Registros: ${data.length}
          </td>
        </tr>
        <tr></tr>
        <thead>
          <tr>${tableHeaders}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
        <tr></tr>
        <tr>
          <td colspan="${columns.length}" style="font-size: 8pt; color: #94a3b8; font-style: italic; padding-top: 10px;">
            "Este programa es público, ajeno a cualquier partido político. Queda prohibido el uso para fines distintos a los establecidos en el programa."
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generar y descargar documento oficial en PDF con cabecera institucional,
 * tabla formal, firmas normativas y aviso de privacidad de ley.
 */
export function exportToPDF({
  title = 'Padrón Oficial de Beneficiarios',
  subtitle = 'Sistema DIF Municipal — Dirección de Asistencia Social',
  columns = [],
  data = [],
  orientation = 'landscape',
  summaryItems = [],
}) {
  const fechaHoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const horaEmision = new Date().toLocaleTimeString('es-MX');

  const printWindow = window.open('', '_blank', 'width=1100,height=850');
  if (!printWindow) {
    alert('Por favor permita las ventanas emergentes (pop-ups) para generar el archivo PDF.');
    return;
  }

  const theadHtml = columns.map((c) => `<th>${c.header}</th>`).join('');

  const tbodyHtml = data
    .map((row, idx) => {
      const cells = columns
        .map((c) => {
          let val = '';
          if (typeof c.render === 'function') {
            val = c.render(row);
          } else {
            val = row[c.key] !== undefined && row[c.key] !== null ? String(row[c.key]) : '';
          }
          return `<td>${val}</td>`;
        })
        .join('');
      return `<tr><td>${idx + 1}</td>${cells}</tr>`;
    })
    .join('');

  const summaryHtml =
    summaryItems.length > 0
      ? `
      <div class="summary-cards">
        ${summaryItems
          .map(
            (s) => `
          <div class="summary-card">
            <span class="summary-card-val">${s.value}</span>
            <span class="summary-card-lbl">${s.label}</span>
          </div>
        `
          )
          .join('')}
      </div>
    `
      : '';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${title} — DIF Municipal</title>
      <style>
        @page {
          size: ${orientation};
          margin: 12mm 10mm 15mm 10mm;
        }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 15px;
          background: #ffffff;
          font-size: 9pt;
        }
        /* Barra de control en pantalla (se oculta al imprimir/guardar PDF) */
        .print-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: #0b1d3a;
          color: #ffffff;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .btn-print {
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
          font-size: 13px;
        }
        .btn-print:hover { background: #1d4ed8; }
        .btn-close {
          background: #334155;
          color: #ffffff;
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
        }
        @media print {
          .no-print { display: none !important; }
          body { padding: 0; }
        }

        /* Encabezado Oficial */
        .header-official {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 3px double #0b1d3a;
          padding-bottom: 10px;
          margin-bottom: 12px;
        }
        .header-brand h1 {
          font-size: 14pt;
          font-weight: 800;
          color: #0b1d3a;
          margin: 0;
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }
        .header-brand h2 {
          font-size: 10pt;
          font-weight: 700;
          color: #2563eb;
          margin: 2px 0 0 0;
        }
        .header-brand p {
          font-size: 8pt;
          color: #64748b;
          margin: 2px 0 0 0;
        }
        .header-meta {
          text-align: right;
          font-size: 7.5pt;
          color: #475569;
          line-height: 1.4;
        }
        .header-folio-badge {
          display: inline-block;
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          margin-bottom: 4px;
        }

        /* Resumen de Métricas */
        .summary-cards {
          display: flex;
          gap: 12px;
          margin-bottom: 14px;
        }
        .summary-card {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px 12px;
          text-align: center;
        }
        .summary-card-val {
          display: block;
          font-size: 13pt;
          font-weight: 800;
          color: #0b1d3a;
        }
        .summary-card-lbl {
          font-size: 7.5pt;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
        }

        /* Tabla Oficial */
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          page-break-inside: auto;
        }
        table.data-table tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        table.data-table th {
          background-color: #0b1d3a;
          color: #ffffff;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 7.5pt;
          padding: 6px 8px;
          border: 1px solid #0b1d3a;
          text-align: left;
        }
        table.data-table td {
          border: 1px solid #cbd5e1;
          padding: 5px 8px;
          font-size: 8pt;
          color: #1e293b;
        }
        table.data-table tr:nth-child(even) td {
          background-color: #f8fafc;
        }

        /* Bloque de Firmas Oficiales */
        .signatures-section {
          margin-top: 30px;
          page-break-inside: avoid;
          display: flex;
          justify-content: space-around;
          text-align: center;
          padding-top: 15px;
        }
        .sig-box {
          width: 240px;
          border-top: 1px solid #0f172a;
          padding-top: 4px;
          font-size: 7.5pt;
          color: #334155;
        }
        .sig-box strong {
          display: block;
          font-size: 8pt;
          color: #0f172a;
          margin-bottom: 2px;
        }

        /* Pie de Página Oficial */
        .footer-legal {
          margin-top: 25px;
          border-top: 1px solid #e2e8f0;
          padding-top: 6px;
          font-size: 6.8pt;
          color: #64748b;
          text-align: center;
          line-height: 1.35;
        }
      </style>
    </head>
    <body>
      <div class="print-toolbar no-print">
        <div style="font-weight: 700; font-size: 14px;">
          📄 Vista Previa de Impresión Oficial (PDF)
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick="window.print()" class="btn-print">🖨️ Guardar como PDF / Imprimir</button>
          <button onclick="window.close()" class="btn-close">Cerrar</button>
        </div>
      </div>

      <div class="header-official">
        <div class="header-brand">
          <h1>Sistema Municipal DIF Tuxtla Gutiérrez</h1>
          <h2>${title}</h2>
          <p>${subtitle}</p>
        </div>
        <div class="header-meta">
          <div class="header-folio-badge">REPORTE OFICIAL DIF-2027</div><br/>
          <strong>Fecha:</strong> ${fechaHoy}<br/>
          <strong>Hora:</strong> ${horaEmision}<br/>
          <strong>Registros:</strong> ${data.length} expedientes
        </div>
      </div>

      ${summaryHtml}

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 25px;">#</th>
            ${theadHtml}
          </tr>
        </thead>
        <tbody>
          ${tbodyHtml}
        </tbody>
      </table>

      <div class="signatures-section">
        <div class="sig-box">
          <strong>Lic. Funcionario Responsable</strong>
          Área de Captura y Registro de Beneficiarios
        </div>
        <div class="sig-box">
          <strong>Dirección de Asistencia Social</strong>
          Coordinación de Evaluación y Dictámenes DIF
        </div>
        <div class="sig-box">
          <strong>Sello Digital Institucional</strong>
          Folio de Autenticidad: DIF-TUX-${Date.now().toString(36).toUpperCase()}
        </div>
      </div>

      <div class="footer-legal">
        Este programa es de carácter público, no es patrocinado ni promovido por partido político alguno y sus recursos provienen de los impuestos que pagan todos los contribuyentes.<br/>
        Queda prohibido el uso de este programa con fines políticos, electorales, de lucro y otros distintos a los establecidos. Sistema Municipal DIF Chiapas 2026-2027.
      </div>

      <script>
        // Lanzar diálogo de impresión automáticamente tras cargar estilos
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Generar la Ficha Técnica Individual de Expediente (Anexo 5 oficial) en PDF
 * para un beneficiario específico.
 */
export function exportFichaBeneficiarioPDF(beneficiario) {
  if (!beneficiario) return;

  const fechaEmision = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const printWindow = window.open('', '_blank', 'width=950,height=800');
  if (!printWindow) {
    alert('Por favor permita las ventanas emergentes (pop-ups) para generar la ficha técnica en PDF.');
    return;
  }

  const folio = beneficiario.folio || `BEN-2026-${String(beneficiario.id || 1).padStart(3, '0')}`;
  const nombre = beneficiario.nombre_completo || beneficiario.nombre || 'Beneficiario Registrado';
  const curp = beneficiario.curp || 'SIN CURP REGISTRADA';
  const edad = beneficiario.edad ? `${beneficiario.edad} años` : 'No especificada';
  const sexo = beneficiario.sexo === 'M' ? 'Mujer (Femenino)' : beneficiario.sexo === 'H' ? 'Hombre (Masculino)' : (beneficiario.sexo || 'No especificado');
  const discapacidad = beneficiario.tipo_discapacidad || 'Ninguna registrada';
  const apoyo = beneficiario.tipo_ayuda_solicitada || beneficiario.programa || 'Apoyo Asistencial DIF';
  const dependencia = beneficiario.dependencia || beneficiario.dependencia_emisora || 'Dirección de Asistencia Social';
  const domicilio = `${beneficiario.tipo_vialidad || 'Calle'} ${beneficiario.nombre_vialidad || ''} ${beneficiario.numero_exterior || 'S/N'}, ${beneficiario.tipo_asentamiento || 'Colonia'} ${beneficiario.nombre_asentamiento || ''}`;
  const estatus = (beneficiario.estatus || 'activo').toUpperCase();

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Expediente ${folio} — ${nombre}</title>
      <style>
        @page { size: portrait; margin: 12mm 15mm; }
        body {
          font-family: Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 15px;
          font-size: 9pt;
        }
        .print-toolbar {
          display: flex;
          justify-content: space-between;
          padding: 10px 16px;
          background: #0b1d3a;
          color: #ffffff;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .btn-print {
          background: #2563eb; color: #ffffff; border: none; padding: 8px 16px;
          border-radius: 6px; font-weight: 700; cursor: pointer;
        }
        @media print { .no-print { display: none !important; } body { padding: 0; } }

        .header-doc {
          border-bottom: 3px double #0b1d3a;
          padding-bottom: 10px;
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .doc-title { font-size: 13pt; font-weight: 800; color: #0b1d3a; text-transform: uppercase; }
        .doc-subtitle { font-size: 9.5pt; color: #2563eb; font-weight: 700; }
        .folio-box {
          text-align: right;
          background: #f1f5f9;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
        }
        .folio-tag { font-size: 11pt; font-weight: 800; color: #1e3a8a; font-family: monospace; }

        .section-header {
          background: #0b1d3a;
          color: #ffffff;
          padding: 4px 8px;
          font-weight: 700;
          font-size: 8.5pt;
          text-transform: uppercase;
          margin: 10px 0 6px 0;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px 12px;
          margin-bottom: 10px;
        }
        .info-field {
          border-bottom: 1px dashed #cbd5e1;
          padding-bottom: 3px;
        }
        .info-label { font-size: 7.5pt; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .info-val { font-size: 9pt; font-weight: 700; color: #0f172a; margin-top: 1px; }

        .signatures {
          margin-top: 35px;
          display: flex;
          justify-content: space-between;
          text-align: center;
        }
        .sig { width: 45%; border-top: 1px solid #0f172a; padding-top: 4px; font-size: 8pt; }
        .legal {
          margin-top: 25px;
          font-size: 7pt;
          color: #64748b;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 6px;
          line-height: 1.35;
        }
      </style>
    </head>
    <body>
      <div class="print-toolbar no-print">
        <span style="font-weight: 700;">Expediente de Beneficiario (Ficha Individual DIF)</span>
        <button onclick="window.print()" class="btn-print">🖨️ Descargar en PDF / Imprimir</button>
      </div>

      <div class="header-doc">
        <div>
          <div class="doc-title">Sistema Municipal DIF Tuxtla Gutiérrez</div>
          <div class="doc-subtitle">Cédula Oficial de Registro de Beneficiario (Anexo 5)</div>
          <div style="font-size: 8pt; color: #64748b;">Padrón Único de Asistencia Social Municipal • Ejercicio Fiscal 2026-2027</div>
        </div>
        <div class="folio-box">
          <div style="font-size: 7.5pt; color: #64748b;">FOLIO EXPEDIENTE</div>
          <div class="folio-tag">${folio}</div>
          <div style="font-size: 7.5pt; color: #059669; font-weight: 700; margin-top: 2px;">ESTATUS: ${estatus}</div>
        </div>
      </div>

      <div class="section-header">1. Datos de Identificación del Ciudadano</div>
      <div class="info-grid">
        <div class="info-field">
          <div class="info-label">Nombre Completo del Beneficiario</div>
          <div class="info-val">${nombre}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Clave Única de Registro de Población (CURP)</div>
          <div class="info-val" style="font-family: monospace;">${curp}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Edad y Género</div>
          <div class="info-val">${edad} • ${sexo}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Condición / Tipo de Discapacidad</div>
          <div class="info-val">${discapacidad}</div>
        </div>
      </div>

      <div class="section-header">2. Ubicación y Domicilio Geográfico</div>
      <div class="info-grid">
        <div class="info-field" style="grid-column: span 2;">
          <div class="info-label">Dirección / Vialidad y Asentamiento</div>
          <div class="info-val">${domicilio}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Municipio</div>
          <div class="info-val">Tuxtla Gutiérrez, Chiapas</div>
        </div>
        <div class="info-field">
          <div class="info-label">Zona de Cobertura</div>
          <div class="info-val">Urbana / DIF Municipal Central</div>
        </div>
      </div>

      <div class="section-header">3. Apoyo Institucional Asignado</div>
      <div class="info-grid">
        <div class="info-field">
          <div class="info-label">Programa / Servicio Solicitado</div>
          <div class="info-val" style="color: #0369a1;">${apoyo}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Dependencia Emisora Responsable</div>
          <div class="info-val">${dependencia}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Fecha de Incorporación al Padrón</div>
          <div class="info-val">${fechaEmision}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Vigencia del Expediente</div>
          <div class="info-val">Anual (2026-2027)</div>
        </div>
      </div>

      <div class="signatures">
        <div class="sig">
          <strong>Firma del Beneficiario / Tutor</strong>
          Aceptación de Términos del Programa
        </div>
        <div class="sig">
          <strong>Firma y Sello del Funcionario DIF</strong>
          Servidor Público Habilitado
        </div>
      </div>

      <div class="legal">
        Este programa es de carácter público, no es patrocinado ni promovido por partido político alguno y sus recursos provienen de los impuestos que pagan todos los contribuyentes.
        Queda prohibido el uso de este programa con fines políticos, electorales, de lucro y otros distintos a los establecidos en el padrón municipal de beneficiarios.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 350);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
