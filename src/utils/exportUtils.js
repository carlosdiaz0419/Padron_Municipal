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

  const total = data.length;
  const activos = data.filter((b) => (b.estatus || '').toLowerCase() === 'activo').length;
  const pendientes = data.filter((b) => (b.estatus || '').toLowerCase() === 'pendiente').length;
  const rechazados = data.filter((b) => (b.estatus || '').toLowerCase() === 'rechazado').length;

  const colSpanCount = Math.max(columns.length, 6);

  const tableHeaders = columns
    .map(
      (c) =>
        `<th style="background-color: #0b1d3a; color: #ffffff; font-weight: bold; font-family: Calibri, Arial, sans-serif; font-size: 10.5pt; border: 1px solid #1e3a8a; padding: 10px 12px; text-align: left; vertical-align: middle;">${c.header}</th>`
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

          const headerLower = (c.header || '').toLowerCase();
          const keyLower = (c.key || '').toLowerCase();
          const valLower = String(val).toLowerCase().trim();

          let extraStyle = '';
          if (headerLower.includes('estatus') || keyLower.includes('estatus')) {
            if (valLower.includes('activo') || valLower.includes('aprobado')) {
              extraStyle = 'background-color: #dcfce7; color: #166534; font-weight: bold; text-align: center; border-radius: 4px;';
            } else if (valLower.includes('pendiente')) {
              extraStyle = 'background-color: #fef3c7; color: #92400e; font-weight: bold; text-align: center; border-radius: 4px;';
            } else if (valLower.includes('rechazado')) {
              extraStyle = 'background-color: #fee2e2; color: #991b1b; font-weight: bold; text-align: center; border-radius: 4px;';
            } else {
              extraStyle = 'text-align: center; font-weight: bold;';
            }
          } else if (headerLower.includes('curp') || headerLower.includes('folio')) {
            extraStyle = 'font-family: Consolas, Courier New, monospace; text-align: center; font-weight: 600;';
          } else if (headerLower.includes('edad') || headerLower.includes('fecha') || headerLower.includes('sexo')) {
            extraStyle = 'text-align: center;';
          }

          return `<td style="font-family: Calibri, Arial, sans-serif; font-size: 9.5pt; border: 1px solid #cbd5e1; padding: 8px 12px; background-color: ${bg}; color: #1e293b; vertical-align: middle; ${extraStyle}">${val}</td>`;
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
              <x:Name>Padrón Oficial DIF</x:Name>
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
        body { font-family: Calibri, Arial, sans-serif; }
      </style>
    </head>
    <body>
      <table style="border-collapse: collapse; width: 100%;">
        <!-- Membrete de Gobierno Municipal -->
        <tr>
          <td colspan="${colSpanCount}" style="font-size: 14pt; font-weight: bold; color: #ffffff; background-color: #0b1d3a; font-family: Calibri, Arial, sans-serif; padding: 12px 14px; text-align: center; letter-spacing: 0.5px;">
            H. AYUNTAMIENTO CONSTITUCIONAL DE TUXTLA GUTIÉRREZ, CHIAPAS
          </td>
        </tr>
        <tr>
          <td colspan="${colSpanCount}" style="font-size: 11pt; font-weight: bold; color: #ffffff; background-color: #1e3a8a; font-family: Calibri, Arial, sans-serif; padding: 8px 14px; text-align: center;">
            SISTEMA PARA EL DESARROLLO INTEGRAL DE LA FAMILIA (DIF MUNICIPAL)
          </td>
        </tr>
        <tr>
          <td colspan="${colSpanCount}" style="font-size: 12pt; font-weight: bold; color: #0369a1; background-color: #f0f9ff; font-family: Calibri, Arial, sans-serif; padding: 8px 14px; border: 1px solid #bae6fd;">
            ${title || 'PADRÓN INSTITUCIONAL DE BENEFICIARIOS'}
          </td>
        </tr>
        <tr>
          <td colspan="${colSpanCount}" style="font-size: 9.5pt; color: #475569; background-color: #ffffff; font-family: Calibri, Arial, sans-serif; padding: 6px 14px;">
            ${subtitle ? subtitle : 'Dirección de Asistencia Social y Salud Comunitaria — Padrón de Ayudas Técnicas'}
          </td>
        </tr>
        <!-- Fila de Metadatos y Estadísticas Rápidas -->
        <tr>
          <td colspan="${colSpanCount}" style="font-size: 9pt; color: #1e293b; background-color: #f1f5f9; font-family: Calibri, Arial, sans-serif; padding: 8px 14px; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #0b1d3a;">
            <strong>Emisión:</strong> ${fechaStr} &nbsp;|&nbsp; 
            <strong>Ejercicio Fiscal:</strong> 2026 - 2027 &nbsp;|&nbsp; 
            <strong>Total Registros:</strong> ${total} &nbsp;|&nbsp; 
            <strong>Activos / Validados:</strong> ${activos} &nbsp;|&nbsp; 
            <strong>Pendientes de Revisión:</strong> ${pendientes} &nbsp;|&nbsp; 
            <strong>Rechazados:</strong> ${rechazados}
          </td>
        </tr>
        <tr style="height: 14px;"></tr>

        <!-- Cabeceras de Datos -->
        <thead>
          <tr>${tableHeaders}</tr>
        </thead>

        <!-- Filas de Datos -->
        <tbody>
          ${tableRows}
        </tbody>

        <!-- Espaciador -->
        <tr style="height: 18px;"></tr>

        <!-- Bloque de Firmas Normativas de Validación y Autorización -->
        <tr>
          <td colspan="${Math.floor(colSpanCount / 3)}" style="text-align: center; padding-top: 30px; font-family: Calibri, Arial, sans-serif; font-size: 9pt; color: #334155; border-top: 1px solid #94a3b8;">
            <strong>ELABORÓ</strong><br/>
            C. Responsable de Captura y Padrón<br/>
            <span style="font-size: 8pt; color: #64748b;">Área de Registro DIF Municipal</span>
          </td>
          <td colspan="${Math.floor(colSpanCount / 3)}" style="text-align: center; padding-top: 30px; font-family: Calibri, Arial, sans-serif; font-size: 9pt; color: #334155; border-top: 1px solid #94a3b8;">
            <strong>REVISÓ Y VALIDÓ</strong><br/>
            Lic. Coordinación de Supervisión y Dictámenes<br/>
            <span style="font-size: 8pt; color: #64748b;">Dirección de Asistencia Social</span>
          </td>
          <td colspan="${colSpanCount - (Math.floor(colSpanCount / 3) * 2)}" style="text-align: center; padding-top: 30px; font-family: Calibri, Arial, sans-serif; font-size: 9pt; color: #334155; border-top: 1px solid #94a3b8;">
            <strong>AUTORIZÓ</strong><br/>
            Dirección General del Sistema DIF Municipal<br/>
            <span style="font-size: 8pt; color: #64748b;">H. Ayuntamiento de Tuxtla Gutiérrez</span>
          </td>
        </tr>

        <!-- Leyenda Legal Obligatoria -->
        <tr style="height: 12px;"></tr>
        <tr>
          <td colspan="${colSpanCount}" style="font-size: 8pt; color: #64748b; font-style: italic; text-align: center; padding: 10px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
            "Este programa es público, ajeno a cualquier partido político. Queda prohibido el uso para fines distintos a los establecidos en el programa."<br/>
            Documento digital generado a través del Sistema Institucional de Padrón de Beneficiarios DIF 2027.
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

  const printWindow = window.open('', '_blank', 'width=1180,height=850');
  if (!printWindow) {
    alert('Por favor permita las ventanas emergentes (pop-ups) para generar el archivo PDF.');
    return;
  }

  const colCount = columns.length;
  const isUltraWide = colCount > 18;
  const isWide = colCount > 10;
  const numColWidth = isUltraWide ? '1.8%' : isWide ? '2.8%' : '30px';

  const theadHtml = columns
    .map((c) => {
      let widthStyle = '';
      if (c.pdfWidth) {
        widthStyle = `width: ${c.pdfWidth}; min-width: ${c.pdfWidth}; max-width: ${c.pdfWidth};`;
      } else if (isUltraWide) {
        const autoPct = (98 / (colCount + 0.5)).toFixed(2);
        widthStyle = `width: ${autoPct}%; max-width: ${autoPct}%;`;
      }
      return `<th style="${widthStyle}">${c.header}</th>`;
    })
    .join('');

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

          const headerLower = (c.header || '').toLowerCase();
          const keyLower = (c.key || '').toLowerCase();
          const valLower = String(val).toLowerCase().trim();

          let formattedVal = val;
          if (headerLower.includes('estatus') || keyLower.includes('estatus')) {
            if (valLower.includes('activo') || valLower.includes('aprobado')) {
              formattedVal = `<span class="badge-pdf badge-activo">✓ ${val}</span>`;
            } else if (valLower.includes('pendiente')) {
              formattedVal = `<span class="badge-pdf badge-pendiente">⏳ ${val}</span>`;
            } else if (valLower.includes('rechazado')) {
              formattedVal = `<span class="badge-pdf badge-rechazado">✕ ${val}</span>`;
            } else {
              formattedVal = `<span class="badge-pdf">${val}</span>`;
            }
          } else if (headerLower.includes('curp') || headerLower.includes('folio')) {
            formattedVal = `<span class="text-mono">${val}</span>`;
          }

          let align = 'text-align: left;';
          if (
            headerLower.includes('estatus') ||
            headerLower.includes('curp') ||
            headerLower.includes('folio') ||
            headerLower.includes('edad') ||
            headerLower.includes('sexo') ||
            headerLower.includes('fecha') ||
            headerLower.includes('c.p.') ||
            headerLower.includes('dep.') ||
            headerLower.includes('tiene') ||
            headerLower.includes('apoyo') ||
            headerLower.includes('servicio m')
          ) {
            align = 'text-align: center;';
          }

          let widthStyle = '';
          if (c.pdfWidth) {
            widthStyle = `width: ${c.pdfWidth}; max-width: ${c.pdfWidth};`;
          } else if (isUltraWide) {
            const autoPct = (98 / (colCount + 0.5)).toFixed(2);
            widthStyle = `width: ${autoPct}%; max-width: ${autoPct}%;`;
          }

          return `<td style="${align} ${widthStyle}">${formattedVal}</td>`;
        })
        .join('');
      return `<tr><td style="width: ${numColWidth}; text-align: center; font-weight: 600; color: #64748b; background-color: #f8fafc;">${idx + 1}</td>${cells}</tr>`;
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
          margin: ${isUltraWide ? '3.5mm 3.5mm 5mm 3.5mm' : isWide ? '6mm 6mm 8mm 6mm' : '10mm 10mm 14mm 10mm'};
        }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: ${isUltraWide ? '4px' : '14px'};
          background: #ffffff;
          font-size: ${isUltraWide ? '5.5pt' : isWide ? '7pt' : '8.8pt'};
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        /* Barra de control en pantalla (se oculta al imprimir/guardar PDF) */
        .print-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 18px;
          background: #0b1d3a;
          color: #ffffff;
          border-radius: 9px;
          margin-bottom: 14px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.18);
        }
        .btn-print {
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 8px 20px;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
          font-size: 13px;
          box-shadow: 0 2px 6px rgba(37,99,235,0.3);
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
        .hint-text {
          font-size: 11.5px;
          color: #94a3b8;
        }
        @media print {
          .no-print { display: none !important; }
          body { 
            padding: 0 !important; 
            margin: 0 !important; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          table.data-table {
            width: 100% !important;
            max-width: 100% !important;
            table-layout: fixed !important;
          }
        }

        /* Encabezado Oficial */
        .header-official {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: ${isUltraWide ? '2px solid #0b1d3a' : '3px double #0b1d3a'};
          padding-bottom: ${isUltraWide ? '5px' : '10px'};
          margin-bottom: ${isUltraWide ? '6px' : '12px'};
        }
        .header-brand h1 {
          font-size: ${isUltraWide ? '10.5pt' : '13.5pt'};
          font-weight: 800;
          color: #0b1d3a;
          margin: 1px 0 0 0;
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }
        .header-brand h2 {
          font-size: ${isUltraWide ? '8.5pt' : '10.5pt'};
          font-weight: 700;
          color: #1d4ed8;
          margin: 1px 0 0 0;
        }
        .header-brand p {
          font-size: ${isUltraWide ? '6.8pt' : '8pt'};
          color: #64748b;
          margin: 1px 0 0 0;
        }
        .header-meta {
          text-align: right;
          font-size: ${isUltraWide ? '6.5pt' : '7.5pt'};
          color: #475569;
          line-height: 1.35;
        }
        .header-folio-badge {
          display: inline-block;
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
          font-weight: 700;
          padding: ${isUltraWide ? '1px 5px' : '2px 8px'};
          border-radius: 4px;
          margin-bottom: 2px;
          font-size: ${isUltraWide ? '6.2pt' : '7.5pt'};
        }

        /* Resumen de Métricas */
        .summary-cards {
          display: flex;
          gap: ${isUltraWide ? '6px' : '12px'};
          margin-bottom: ${isUltraWide ? '8px' : '14px'};
        }
        .summary-card {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: ${isUltraWide ? '4px 6px' : '8px 12px'};
          text-align: center;
          border-left: 3px solid #2563eb;
        }
        .summary-card-val {
          display: block;
          font-size: ${isUltraWide ? '10pt' : '13pt'};
          font-weight: 800;
          color: #0b1d3a;
        }
        .summary-card-lbl {
          font-size: ${isUltraWide ? '6pt' : '7.5pt'};
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
        }

        /* Tabla Oficial con table-layout: fixed garantizado al 100% de la hoja */
        table.data-table {
          width: 100% !important;
          max-width: 100% !important;
          table-layout: fixed !important;
          border-collapse: collapse;
          margin-top: 4px;
          box-sizing: border-box;
        }
        table.data-table thead {
          display: table-header-group;
        }
        table.data-table tr {
          page-break-inside: avoid;
        }
        table.data-table th {
          background-color: #0b1d3a;
          color: #ffffff;
          font-weight: 700;
          text-transform: uppercase;
          font-size: ${isUltraWide ? '4.8pt' : isWide ? '6.2pt' : '7.5pt'};
          padding: ${isUltraWide ? '2.5px 1px' : isWide ? '4px 3px' : '7px 9px'};
          border: 1px solid #1e3a8a;
          text-align: center;
          line-height: 1.05;
          letter-spacing: -0.2px;
          word-break: break-word;
          overflow-wrap: anywhere;
          hyphens: auto;
          box-sizing: border-box;
        }
        table.data-table td {
          border: 1px solid #cbd5e1;
          padding: ${isUltraWide ? '2px 1.5px' : isWide ? '4px 3px' : '6px 9px'};
          font-size: ${isUltraWide ? '5.1pt' : isWide ? '6.8pt' : '8pt'};
          color: #1e293b;
          vertical-align: middle;
          line-height: 1.1;
          word-break: break-word;
          overflow-wrap: anywhere;
          hyphens: auto;
          box-sizing: border-box;
        }
        table.data-table tr:nth-child(even) td {
          background-color: #f8fafc;
        }

        /* Badges de Estado */
        .badge-pdf {
          display: inline-block;
          padding: ${isUltraWide ? '1px 2px' : isWide ? '1.5px 4px' : '2px 7px'};
          border-radius: 3px;
          font-weight: 700;
          font-size: ${isUltraWide ? '4.6pt' : isWide ? '5.8pt' : '7.2pt'};
          letter-spacing: -0.2px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .badge-activo {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .badge-pendiente {
          background: #fffbeb;
          color: #92400e;
          border: 1px solid #fde68a;
        }
        .badge-rechazado {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .text-mono {
          font-family: "Consolas", "Courier New", monospace;
          font-weight: 600;
          font-size: ${isUltraWide ? '4.8pt' : isWide ? '6.2pt' : '8pt'};
          word-break: break-all;
          letter-spacing: -0.3px;
        }

        /* Bloque de Firmas Oficiales */
        .signatures-section {
          margin-top: ${isUltraWide ? '12px' : '28px'};
          page-break-inside: avoid;
          display: flex;
          justify-content: space-around;
          text-align: center;
          padding-top: ${isUltraWide ? '6px' : '15px'};
        }
        .sig-box {
          width: ${isUltraWide ? '180px' : '250px'};
          border-top: 1px solid #0f172a;
          padding-top: 3px;
          font-size: ${isUltraWide ? '6.2pt' : '7.5pt'};
          color: #334155;
          line-height: 1.25;
        }
        .sig-box strong {
          display: block;
          font-size: ${isUltraWide ? '6.8pt' : '8pt'};
          color: #0f172a;
          margin-bottom: 1px;
        }

        /* Pie de Página Oficial */
        .footer-legal {
          margin-top: ${isUltraWide ? '10px' : '24px'};
          border-top: 1px solid #e2e8f0;
          padding-top: 4px;
          font-size: ${isUltraWide ? '5.8pt' : '6.8pt'};
          color: #64748b;
          text-align: center;
          line-height: 1.3;
        }
      </style>
    </head>
    <body>
      <div class="print-toolbar no-print">
        <div>
          <div style="font-weight: 700; font-size: 13.5px;">📄 Vista Previa de Impresión Oficial (PDF)</div>
          <div class="hint-text">
            ${isUltraWide ? '✓ Formato ajustado al 100% del ancho de hoja (24 columnas completas visibles sin recortes).' : '💡 Consejo: Selecciona "Guardar como PDF" en la ventana de impresión para guardarlo en tu computadora.'}
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button onclick="window.print()" class="btn-print">🖨️ Guardar como PDF / Imprimir</button>
          <button onclick="window.close()" class="btn-close">Cerrar</button>
        </div>
      </div>

      <div class="header-official">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: ${isUltraWide ? '36px' : '46px'}; height: ${isUltraWide ? '36px' : '46px'}; background: #0b1d3a; border-radius: 8px; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
            <svg width="${isUltraWide ? '22' : '28'}" height="${isUltraWide ? '22' : '28'}" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </div>
          <div class="header-brand">
            <span style="font-size: ${isUltraWide ? '6.5pt' : '7.5pt'}; font-weight: 800; color: #64748b; letter-spacing: 0.8px; text-transform: uppercase;">
              H. Ayuntamiento Constitucional de Tuxtla Gutiérrez &bull; Chiapas
            </span>
            <h1>Sistema Municipal DIF Tuxtla Gutiérrez</h1>
            <h2>${title}</h2>
            <p>${subtitle}</p>
          </div>
        </div>
        <div class="header-meta">
          <div class="header-folio-badge">EXPEDIENTE OFICIAL DIF 2027</div><br/>
          <strong>Fecha:</strong> ${fechaHoy}<br/>
          <strong>Hora:</strong> ${horaEmision}<br/>
          <strong>Total Expedientes:</strong> ${data.length} registros
        </div>
      </div>

      ${summaryHtml}

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: ${numColWidth}; min-width: ${numColWidth}; max-width: ${numColWidth}; text-align: center;">#</th>
            ${theadHtml}
          </tr>
        </thead>
        <tbody>
          ${tbodyHtml}
        </tbody>
      </table>

      <div class="signatures-section">
        <div class="sig-box">
          <strong>C. Responsable de Captura y Padrón</strong>
          Área de Registro de Beneficiarios DIF
        </div>
        <div class="sig-box">
          <strong>Lic. Coordinación de Supervisión</strong>
          Dirección de Asistencia Social y Salud Comunitaria
        </div>
        <div class="sig-box">
          <strong>Dirección General DIF Municipal</strong>
          Sello Digital: DIF-TUX-${Date.now().toString(36).toUpperCase()}
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
 * Mapa completo de las 7 categorías y 34 servicios DIF (Anexo 5)
 * idéntico al formulario CapturistaFormulario.jsx
 */
export const CATEGORIAS_SERVICIOS_ANEXO5 = [
  {
    titulo: 'Servicios de Salud (CEMTRI)',
    items: [
      { id: 1, key: 'tl', codigo: 'T.L.', nombre: 'Terapia de Lenguaje' },
      { id: 2, key: 'tf', codigo: 'T.F.', nombre: 'Terapia Física' },
      { id: 3, key: 'to', codigo: 'T.O.', nombre: 'Terapia Ocupacional' },
      { id: 4, key: 'sh', codigo: 'S.H.', nombre: 'Estimulación / Salón Multisensorial' },
      { id: 5, key: 'cems', codigo: 'CEMS', nombre: 'Centro de Especialidades Médicas' },
      { id: 6, key: 'eavd', codigo: 'E.A.V.D.', nombre: 'Entrenamiento Actividades Vida Diaria' },
      { id: 7, key: 'tcc', codigo: 'T.C.C.', nombre: 'Terapia Cognitivo-Conductual' },
      { id: 8, key: 'cpsic', codigo: 'C.Psic.', nombre: 'Consulta Psicológica' },
    ],
  },
  {
    titulo: 'Casa del Abuelo',
    items: [
      { id: 9, key: 'estancia', codigo: 'Estancia', nombre: 'Estancia de Día' },
      { id: 10, key: 'evento', codigo: 'Evento', nombre: 'Evento Social / Cultural' },
      { id: 11, key: 'ejercicio', codigo: 'Ejercicio', nombre: 'Activación Física' },
      { id: 12, key: 'platica', codigo: 'Plática', nombre: 'Plática de Orientación' },
    ],
  },
  {
    titulo: 'Proyectos Especiales',
    items: [
      { id: 13, key: 'tux_lentes', codigo: 'Tux Lentes', nombre: 'Salud Visual (Lentes)' },
      { id: 14, key: 'prostodoncia', codigo: 'Prostodoncia', nombre: 'Prótesis Dental' },
    ],
  },
  {
    titulo: 'Servicios Jurídicos',
    items: [
      { id: 15, key: 'aj', codigo: 'A.J.', nombre: 'Asesoría Jurídica' },
      { id: 16, key: 'pl', codigo: 'P.L.', nombre: 'Patrocinio Legal' },
    ],
  },
  {
    titulo: 'Servicios de la Procuraduría',
    items: [
      { id: 17, key: 'ajmf', codigo: 'A.J.M.F.', nombre: 'Asesoría Jurídica y Mediación Familiar' },
      { id: 18, key: 'al', codigo: 'A.L.', nombre: 'Asesoría Legal' },
      { id: 19, key: 'cac', codigo: 'C.A.C.', nombre: 'Centro de Asistencia Comunitaria' },
      { id: 20, key: 'alojamiento', codigo: 'Alojamiento', nombre: 'Alojamiento Temporal' },
      { id: 21, key: 'b_alimento', codigo: 'B.Alimento', nombre: 'Bono / Apoyo Alimentario' },
    ],
  },
  {
    titulo: 'Servicios a Grupos Vulnerables',
    items: [
      { id: 22, key: 'ctfi', codigo: 'C.T.F.I.', nombre: 'Capacitación y Trabajo' },
      { id: 23, key: 'unetoc', codigo: 'UNETOC', nombre: 'Unidad de Enlace y Trabajo Comunitario' },
      { id: 24, key: 'cai', codigo: 'CAI', nombre: 'Centro de Atención Infantil' },
      { id: 25, key: 'tc', codigo: 'T.C.', nombre: 'Talleres Comunitarios' },
      { id: 26, key: 'penms', codigo: 'P.E.N.M.S.', nombre: 'Prevención Embarazo en Niñas y Adolescentes' },
      { id: 27, key: 'cm', codigo: 'C.M.', nombre: 'Consultorio Médico' },
      { id: 28, key: 'aam', codigo: 'A.A.M.', nombre: 'Atención al Adulto Mayor' },
      { id: 29, key: 'dpa', codigo: 'D.P.A.', nombre: 'Discapacidad y Proyectos Asistenciales' },
    ],
  },
  {
    titulo: 'Servicios Alimentarios',
    items: [
      { id: 30, key: 'capr', codigo: 'C.A.P.R.', nombre: 'Cocinas de Asistencia y Participación' },
      { id: 31, key: 'de', codigo: 'D.E.', nombre: 'Desayunos Escolares' },
      { id: 32, key: 'came', codigo: 'C.A.M.E.', nombre: 'Canasta Alimentaria a Madres Embarazadas' },
      { id: 33, key: 'cann', codigo: 'C.A.N.N.', nombre: 'Canasta Alimentaria a Niñas y Niños' },
      { id: 34, key: 'atmsv', codigo: 'A.T.M.S.V.', nombre: 'Asistencia Alimentaria a Sujetos Vulnerables' },
    ],
  },
];

/**
 * Devuelve un arreglo de textos con los servicios DIF activos de un beneficiario
 */
export function obtenerServiciosActivosTexto(b) {
  if (!b) return 'Ninguno seleccionado';
  const idsSet = new Set();
  const keysSet = new Set();

  if (Array.isArray(b.servicios)) {
    b.servicios.forEach((s) => {
      if (typeof s === 'number') idsSet.add(s);
      else if (s && typeof s === 'object') {
        if (s.id) idsSet.add(Number(s.id));
        if (s.codigo) keysSet.add(String(s.codigo).toLowerCase());
      }
    });
  }
  if (b.servicios_dif && typeof b.servicios_dif === 'object') {
    Object.entries(b.servicios_dif).forEach(([k, v]) => {
      if (v) keysSet.add(k.toLowerCase());
    });
  }

  const activos = [];
  CATEGORIAS_SERVICIOS_ANEXO5.forEach((cat) => {
    cat.items.forEach((item) => {
      if (
        idsSet.has(item.id) ||
        keysSet.has(item.key.toLowerCase()) ||
        keysSet.has(item.codigo.toLowerCase())
      ) {
        activos.push(item.codigo);
      }
    });
  });

  return activos.length > 0 ? activos.join(', ') : 'Sin servicios marcados';
}

/**
 * Columnas completas con TODOS los campos del formulario para exportación tabular (PDF y Excel)
 */
export const COLUMNAS_PADRON_COMPLETO = [
  { header: 'Folio', pdfWidth: '4.0%', render: (b) => b.folio || `DIF-2027-${String(b.id || 1).padStart(3, '0')}` },
  { header: 'Fecha Solicitud', pdfWidth: '3.5%', render: (b) => b.fecha_solicitud || (b.ultimaSolicitud ? String(b.ultimaSolicitud).slice(0, 10) : '—') },
  { header: 'Unidad Responsable', pdfWidth: '4.5%', render: (b) => b.dependencia_emisora || b.dependencia || 'Dirección de Asistencia Social' },
  { header: 'Nombre(s)', pdfWidth: '4.5%', render: (b) => b.nombres || b.nombre || '—' },
  { header: 'Apellido Paterno', pdfWidth: '4.0%', render: (b) => b.apellidoPaterno || b.apellido_paterno || '—' },
  { header: 'Apellido Materno', pdfWidth: '4.0%', render: (b) => b.apellidoMaterno || b.apellido_materno || '—' },
  { header: 'CURP', pdfWidth: '5.8%', render: (b) => b.curp || '—' },
  { header: 'Fecha Nacimiento', pdfWidth: '3.5%', render: (b) => b.fecha_nacimiento || (b.fechaNacimiento ? String(b.fechaNacimiento).slice(0, 10) : '—') },
  { header: 'Edad', pdfWidth: '1.8%', render: (b) => (b.edad !== undefined && b.edad !== null ? `${b.edad}` : '—') },
  { header: 'Sexo', pdfWidth: '1.8%', render: (b) => b.sexo || '—' },
  { header: 'Estado Civil', pdfWidth: '3.2%', render: (b) => b.estadoCivil || b.estado_civil || '—' },
  {
    header: 'Dep. Económico',
    pdfWidth: '2.8%',
    render: (b) =>
      b.esDependienteEconomico === true || b.es_dependiente_economico === 'Si' ? 'Sí' : 'No',
  },
  {
    header: 'Tutor Legal',
    pdfWidth: '4.0%',
    render: (b) => b.tutorNombre || b.nombre_tutor || 'N/A',
  },
  {
    header: 'Tiene Dependientes',
    pdfWidth: '2.8%',
    render: (b) =>
      b.tieneDependientesEconomicos === true || b.cuenta_con_dependientes === 'Si' ? 'Sí' : 'No',
  },
  {
    header: 'Vialidad y Número',
    pdfWidth: '6.2%',
    render: (b) => {
      const tv = b.domicilio?.tipoVialidad || b.tipo_vialidad || 'Calle';
      const nv = b.domicilio?.nombreVialidad || b.nombre_vialidad || '';
      const ne = b.domicilio?.numeroExterior || b.numero_exterior || 'S/N';
      return `${tv} ${nv} #${ne}`.trim();
    },
  },
  {
    header: 'Asentamiento / Colonia',
    pdfWidth: '5.8%',
    render: (b) => {
      const ta = b.domicilio?.tipoAsentamiento || b.tipo_asentamiento || 'Colonia';
      const na = b.domicilio?.nombreAsentamiento || b.nombre_asentamiento || b.colonia || '';
      return `${ta} ${na}`.trim();
    },
  },
  {
    header: 'C.P.',
    pdfWidth: '2.4%',
    render: (b) => b.domicilio?.codigoPostal || b.codigo_postal || b.codigoPostal || '—',
  },
  {
    header: 'Discapacidad',
    pdfWidth: '4.2%',
    render: (b) => b.tipoDiscapacidad || b.tipo_discapacidad || 'Ninguna',
  },
  {
    header: 'Ayuda Solicitada',
    pdfWidth: '5.5%',
    render: (b) => b.tipo_ayuda_solicitada || b.ultimaAyuda || '—',
  },
  {
    header: 'Apoyo DIF Estatal',
    pdfWidth: '3.8%',
    render: (b) => {
      const si =
        b.haRecibidoApoyoDifEstatal === true ||
        b.recibio_apoyo_dif_estatal === 'Si' ||
        b.solicitudes?.[0]?.haRecibidoApoyoDifEstatal === true;
      const desc =
        b.descripcionApoyoDifEstatal ||
        b.descripcion_apoyo_estatal ||
        b.solicitudes?.[0]?.descripcionApoyoDifEstatal ||
        '';
      return si ? `Sí${desc ? ` (${desc})` : ''}` : 'No';
    },
  },
  {
    header: 'Servicio Médico',
    pdfWidth: '2.8%',
    render: (b) =>
      b.cuentaServicioMedico === true || b.cuenta_servicio_medico === 'Si' ? 'Sí' : 'No',
  },
  {
    header: 'Apoyo Gubernamental',
    pdfWidth: '3.8%',
    render: (b) => {
      const si = b.cuentaApoyoGubernamental === true || b.cuenta_apoyo_gubernamental === 'Si';
      const desc = b.descripcionApoyoGubernamental || b.descripcion_apoyo_gubernamental || '';
      return si ? `Sí${desc ? ` (${desc})` : ''}` : 'No';
    },
  },
  {
    header: 'Servicios DIF (Anexo 5)',
    pdfWidth: '7.8%',
    render: (b) => obtenerServiciosActivosTexto(b),
  },
  {
    header: 'Estatus',
    pdfWidth: '3.5%',
    render: (b) => (b.estatus || 'activo').toUpperCase(),
  },
];

/**
 * Padrón Oficial Ejecutivo en PDF (10 columnas consolidadas de alta legibilidad para dictámenes oficiales)
 */
export const COLUMNAS_PADRON_OFICIAL_PDF = [
  { header: 'Folio', pdfWidth: '7%', render: (b) => b.folio || `DIF-2027-${String(b.id || 1).padStart(3, '0')}` },
  { header: 'Fecha', pdfWidth: '6.5%', render: (b) => b.fecha_solicitud || (b.ultimaSolicitud ? String(b.ultimaSolicitud).slice(0, 10) : '—') },
  {
    header: 'Beneficiario (Nombre Completo)',
    pdfWidth: '18%',
    render: (b) => {
      const nom = [b.nombres || b.nombre, b.apellidoPaterno || b.apellido_paterno, b.apellidoMaterno || b.apellido_materno].filter(Boolean).join(' ');
      return nom || '—';
    },
  },
  { header: 'CURP', pdfWidth: '12%', render: (b) => b.curp || '—' },
  { header: 'Edad/Sexo', pdfWidth: '6.5%', render: (b) => `${b.edad !== undefined && b.edad !== null ? b.edad : '—'} / ${b.sexo || '—'}` },
  {
    header: 'Domicilio Completo',
    pdfWidth: '17%',
    render: (b) => {
      const tv = b.domicilio?.tipoVialidad || b.tipo_vialidad || 'Calle';
      const nv = b.domicilio?.nombreVialidad || b.nombre_vialidad || '';
      const ne = b.domicilio?.numeroExterior || b.numero_exterior || 'S/N';
      const ta = b.domicilio?.tipoAsentamiento || b.tipo_asentamiento || 'Col.';
      const na = b.domicilio?.nombreAsentamiento || b.nombre_asentamiento || b.colonia || '';
      return `${tv} ${nv} #${ne}, ${ta} ${na}`.trim();
    },
  },
  {
    header: 'Discapacidad',
    pdfWidth: '9%',
    render: (b) => b.tipoDiscapacidad || b.tipo_discapacidad || 'Ninguna',
  },
  {
    header: 'Ayuda Solicitada',
    pdfWidth: '11%',
    render: (b) => b.tipo_ayuda_solicitada || b.ultimaAyuda || '—',
  },
  {
    header: 'Servicios DIF',
    pdfWidth: '8%',
    render: (b) => obtenerServiciosActivosTexto(b),
  },
  {
    header: 'Estatus',
    pdfWidth: '5%',
    render: (b) => (b.estatus || 'activo').toUpperCase(),
  },
];

/**
 * Generar la Ficha Técnica Individual de Expediente (Anexo 5 oficial) en PDF
 * con ABSOLUTAMENTE TODOS LOS CAMPOS del formulario CapturistaFormulario.jsx.
 */
export function exportFichaBeneficiarioPDF(beneficiario) {
  if (!beneficiario) return;

  const fechaEmision = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const printWindow = window.open('', '_blank', 'width=1020,height=880');
  if (!printWindow) {
    alert('Por favor permita las ventanas emergentes (pop-ups) para generar la ficha técnica en PDF.');
    return;
  }

  // 0. Identificación del expediente
  const folio = beneficiario.folio || `DIF-2027-${String(beneficiario.id || 1).padStart(3, '0')}`;
  const estatus = (beneficiario.estatus || 'activo').toUpperCase();
  const dependencia =
    beneficiario.dependencia_emisora ||
    beneficiario.dependencia ||
    'Dirección de Asistencia Social';
  const primeraSol = beneficiario.solicitudes?.[0] || {};
  const fechaSolicitud =
    beneficiario.fecha_solicitud ||
    (primeraSol.fechaSolicitud ? String(primeraSol.fechaSolicitud).slice(0, 10) : '') ||
    (beneficiario.ultimaSolicitud ? String(beneficiario.ultimaSolicitud).slice(0, 10) : '') ||
    fechaEmision;

  // 1. Datos Personales
  const nombres = beneficiario.nombres || beneficiario.nombre || '—';
  const apellidoPaterno = beneficiario.apellidoPaterno || beneficiario.apellido_paterno || '—';
  const apellidoMaterno = beneficiario.apellidoMaterno || beneficiario.apellido_materno || '—';
  const nombreCompleto =
    beneficiario.nombre_completo ||
    [nombres !== '—' ? nombres : '', apellidoPaterno !== '—' ? apellidoPaterno : '', apellidoMaterno !== '—' ? apellidoMaterno : '']
      .filter(Boolean)
      .join(' ') ||
    'Beneficiario Registrado';
  const curp = beneficiario.curp || 'SIN CURP REGISTRADA';
  const fechaNacimiento =
    beneficiario.fecha_nacimiento ||
    (beneficiario.fechaNacimiento ? String(beneficiario.fechaNacimiento).slice(0, 10) : 'No especificada');
  const edad =
    beneficiario.edad !== undefined && beneficiario.edad !== null && beneficiario.edad !== ''
      ? `${beneficiario.edad} años`
      : 'No especificada';
  const sexo =
    beneficiario.sexo === 'M'
      ? 'M — Mujer (Femenino)'
      : beneficiario.sexo === 'H'
      ? 'H — Hombre (Masculino)'
      : beneficiario.sexo || 'No especificado';
  const estadoCivil = beneficiario.estadoCivil || beneficiario.estado_civil || 'No especificado';

  // 2. Dependencia Económica y Tutor
  const esDependiente =
    beneficiario.esDependienteEconomico === true || beneficiario.es_dependiente_economico === 'Si'
      ? 'Sí'
      : 'No';
  const nombreTutor =
    beneficiario.tutorNombre || beneficiario.nombre_tutor || 'No aplica (Mayor de edad / Independiente)';
  const tieneDependientes =
    beneficiario.tieneDependientesEconomicos === true || beneficiario.cuenta_con_dependientes === 'Si'
      ? 'Sí'
      : 'No';

  // 3. Domicilio
  const tipoVialidad = beneficiario.domicilio?.tipoVialidad || beneficiario.tipo_vialidad || 'Calle';
  const nombreVialidad = beneficiario.domicilio?.nombreVialidad || beneficiario.nombre_vialidad || '—';
  const numeroExterior = beneficiario.domicilio?.numeroExterior || beneficiario.numero_exterior || 'S/N';
  const tipoAsentamiento =
    beneficiario.domicilio?.tipoAsentamiento || beneficiario.tipo_asentamiento || 'Colonia';
  const nombreAsentamiento =
    beneficiario.domicilio?.nombreAsentamiento ||
    beneficiario.nombre_asentamiento ||
    beneficiario.colonia ||
    '—';
  const codigoPostal =
    beneficiario.domicilio?.codigoPostal ||
    beneficiario.codigo_postal ||
    beneficiario.codigoPostal ||
    '—';

  // 4. Discapacidad y Solicitud de Ayuda
  const tipoDiscapacidad =
    beneficiario.tipoDiscapacidad || beneficiario.tipo_discapacidad || 'Ninguna';
  const tipoAyudaSolicitada =
    beneficiario.tipo_ayuda_solicitada ||
    primeraSol.tipoAyuda ||
    beneficiario.ultimaAyuda ||
    beneficiario.programa ||
    'Apoyo Asistencial DIF';
  const recibioApoyoDifEstatal =
    beneficiario.haRecibidoApoyoDifEstatal === true ||
    beneficiario.recibio_apoyo_dif_estatal === 'Si' ||
    primeraSol.haRecibidoApoyoDifEstatal === true
      ? 'Sí'
      : 'No';
  const descripcionApoyoEstatal =
    beneficiario.descripcionApoyoDifEstatal ||
    beneficiario.descripcion_apoyo_estatal ||
    primeraSol.descripcionApoyoDifEstatal ||
    'Ninguno especificado';

  // 5. Servicios Médicos y Apoyos Gubernamentales
  const cuentaServicioMedico =
    beneficiario.cuentaServicioMedico === true || beneficiario.cuenta_servicio_medico === 'Si'
      ? 'Sí'
      : 'No';
  const cuentaApoyoGubernamental =
    beneficiario.cuentaApoyoGubernamental === true || beneficiario.cuenta_apoyo_gubernamental === 'Si'
      ? 'Sí'
      : 'No';
  const descripcionApoyoGubernamental =
    beneficiario.descripcionApoyoGubernamental ||
    beneficiario.descripcion_apoyo_gubernamental ||
    'Ninguno especificado';

  // 6. Servicios DIF (Anexo 5) — Determinar cuáles están activos
  const idsActivos = new Set();
  const keysActivas = new Set();
  if (Array.isArray(beneficiario.servicios)) {
    beneficiario.servicios.forEach((s) => {
      if (typeof s === 'number') idsActivos.add(s);
      else if (s && typeof s === 'object') {
        if (s.id) idsActivos.add(Number(s.id));
        if (s.codigo) keysActivas.add(String(s.codigo).toLowerCase());
      }
    });
  }
  if (beneficiario.servicios_dif && typeof beneficiario.servicios_dif === 'object') {
    Object.entries(beneficiario.servicios_dif).forEach(([k, val]) => {
      if (val) keysActivas.add(k.toLowerCase());
    });
  }

  const categoriasHtml = CATEGORIAS_SERVICIOS_ANEXO5.map((cat) => {
    const chipsHtml = cat.items
      .map((item) => {
        const checked =
          idsActivos.has(item.id) ||
          keysActivas.has(item.key.toLowerCase()) ||
          keysActivas.has(item.codigo.toLowerCase());
        return `
          <div class="srv-chip ${checked ? 'srv-chip--active' : ''}">
            <span class="srv-box">${checked ? '☑' : '☐'}</span>
            <span><strong>${item.codigo}</strong> — ${item.nombre}</span>
          </div>
        `;
      })
      .join('');
    return `
      <div class="srv-cat-block">
        <div class="srv-cat-title">${cat.titulo}</div>
        <div class="srv-chips-grid">${chipsHtml}</div>
      </div>
    `;
  }).join('');

  // 7. Historial de solicitudes y observaciones
  const historialSolicitudes = Array.isArray(beneficiario.solicitudes) && beneficiario.solicitudes.length > 0
    ? beneficiario.solicitudes
    : [{
        fechaSolicitud,
        tipoAyuda: tipoAyudaSolicitada,
        haRecibidoApoyoDifEstatal: recibioApoyoDifEstatal === 'Sí',
        descripcionApoyoDifEstatal: descripcionApoyoEstatal !== 'Ninguno especificado' ? descripcionApoyoEstatal : null,
      }];

  const historialRowsHtml = historialSolicitudes
    .map(
      (s, i) => `
      <tr>
        <td style="text-align:center;">${i + 1}</td>
        <td>${s.fechaSolicitud ? String(s.fechaSolicitud).slice(0, 10) : fechaSolicitud}</td>
        <td><strong>${s.tipoAyuda || tipoAyudaSolicitada}</strong></td>
        <td>${s.haRecibidoApoyoDifEstatal ? 'Sí' : 'No'}</td>
        <td>${s.descripcionApoyoDifEstatal || 'Sin observaciones adicionales'}</td>
      </tr>
    `
    )
    .join('');

  const observacionesExtra = beneficiario.observaciones || '';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Expediente Completo ${folio} — ${nombreCompleto}</title>
      <style>
        @page { size: portrait; margin: 10mm 12mm; }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 12px;
          font-size: 8.5pt;
          background: #ffffff;
        }
        .print-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          background: #0b1d3a;
          color: #ffffff;
          border-radius: 8px;
          margin-bottom: 14px;
        }
        .btn-print {
          background: #2563eb; color: #ffffff; border: none; padding: 8px 16px;
          border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12.5px;
        }
        .btn-close {
          background: #334155; color: #ffffff; border: none; padding: 8px 14px;
          border-radius: 6px; cursor: pointer; font-size: 12.5px; margin-left: 6px;
        }
        @media print { .no-print { display: none !important; } body { padding: 0; } }

        .header-doc {
          border-bottom: 3px double #0b1d3a;
          padding-bottom: 8px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .doc-title { font-size: 12.5pt; font-weight: 800; color: #0b1d3a; text-transform: uppercase; }
        .doc-subtitle { font-size: 9pt; color: #2563eb; font-weight: 700; margin-top: 2px; }
        .folio-box {
          text-align: right;
          background: #f8fafc;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
        }
        .folio-tag { font-size: 10.5pt; font-weight: 800; color: #1e3a8a; font-family: monospace; }

        .section-header {
          background: #0b1d3a;
          color: #ffffff;
          padding: 4px 8px;
          font-weight: 700;
          font-size: 8pt;
          text-transform: uppercase;
          margin: 8px 0 5px 0;
          border-radius: 3px;
          letter-spacing: 0.02em;
        }
        .info-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5px 10px;
          margin-bottom: 6px;
        }
        .info-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 5px 10px;
          margin-bottom: 6px;
        }
        .info-field {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 4px 7px;
        }
        .info-label { font-size: 6.8pt; color: #64748b; font-weight: 700; text-transform: uppercase; }
        .info-val { font-size: 8.3pt; font-weight: 700; color: #0f172a; margin-top: 1px; word-break: break-word; }

        /* Grilla Anexo 5 Servicios DIF */
        .srv-cat-block {
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          padding: 4px 6px;
          margin-bottom: 5px;
          page-break-inside: avoid;
        }
        .srv-cat-title {
          font-size: 7.3pt;
          font-weight: 800;
          color: #1e3a8a;
          text-transform: uppercase;
          margin-bottom: 3px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 2px;
        }
        .srv-chips-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 3px 6px;
        }
        .srv-chip {
          font-size: 7pt;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 1.5px 4px;
          border-radius: 3px;
        }
        .srv-chip--active {
          background: #dbeafe;
          color: #1e40af;
          border: 1px solid #93c5fd;
          font-weight: 700;
        }
        .srv-box {
          font-size: 8.5pt;
          line-height: 1;
        }

        /* Tabla Historial Solicitudes */
        table.hist-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4px;
          font-size: 7.5pt;
        }
        table.hist-table th {
          background: #1e293b;
          color: #ffffff;
          padding: 4px 6px;
          text-align: left;
          font-size: 7pt;
          text-transform: uppercase;
        }
        table.hist-table td {
          border: 1px solid #cbd5e1;
          padding: 4px 6px;
        }

        .signatures {
          margin-top: 22px;
          display: flex;
          justify-content: space-between;
          text-align: center;
          page-break-inside: avoid;
        }
        .sig { width: 30%; border-top: 1px solid #0f172a; padding-top: 4px; font-size: 7.5pt; }
        .legal {
          margin-top: 12px;
          font-size: 6.5pt;
          color: #64748b;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 4px;
          line-height: 1.3;
        }
      </style>
    </head>
    <body>
      <div class="print-toolbar no-print">
        <span style="font-weight: 700;">📄 Cédula Oficial Completa de Beneficiario DIF (Anexo 5 — Todos los campos del formulario)</span>
        <div>
          <button onclick="window.print()" class="btn-print">🖨️ Guardar en PDF / Imprimir</button>
          <button onclick="window.close()" class="btn-close">Cerrar</button>
        </div>
      </div>

      <div class="header-doc">
        <div>
          <div class="doc-title">Sistema Municipal DIF Tuxtla Gutiérrez</div>
          <div class="doc-subtitle">Cédula Oficial de Registro del Padrón de Beneficiarios y Ayudas Técnicas (Anexo 5)</div>
          <div style="font-size: 7.5pt; color: #475569; margin-top: 2px;">
            <strong>Unidad Responsable:</strong> ${dependencia} &nbsp;|&nbsp; <strong>Fecha de Solicitud:</strong> ${fechaSolicitud} &nbsp;|&nbsp; <strong>Emisión:</strong> ${fechaEmision}
          </div>
        </div>
        <div class="folio-box">
          <div style="font-size: 7pt; color: #64748b; font-weight: 700;">FOLIO EXPEDIENTE</div>
          <div class="folio-tag">${folio}</div>
          <div style="font-size: 7pt; color: #059669; font-weight: 800; margin-top: 2px;">ESTATUS: ${estatus}</div>
        </div>
      </div>

      <!-- SECCIÓN 1: DATOS PERSONALES -->
      <div class="section-header">1. Datos Personales y de Identificación del Solicitante</div>
      <div class="info-grid-4">
        <div class="info-field">
          <div class="info-label">Nombre(s)</div>
          <div class="info-val">${nombres}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Apellido Paterno</div>
          <div class="info-val">${apellidoPaterno}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Apellido Materno</div>
          <div class="info-val">${apellidoMaterno}</div>
        </div>
        <div class="info-field">
          <div class="info-label">CURP (18 Caracteres)</div>
          <div class="info-val" style="font-family: monospace; color: #1e3a8a;">${curp}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Fecha de Nacimiento</div>
          <div class="info-val">${fechaNacimiento}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Edad Cumplida</div>
          <div class="info-val">${edad}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Sexo</div>
          <div class="info-val">${sexo}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Estado Civil</div>
          <div class="info-val">${estadoCivil}</div>
        </div>
      </div>

      <!-- SECCIÓN 2: DEPENDENCIA ECONÓMICA Y TUTOR -->
      <div class="section-header">2. Situación de Dependencia Económica y Tutor Legal</div>
      <div class="info-grid-3">
        <div class="info-field">
          <div class="info-label">¿Es Dependiente Económico?</div>
          <div class="info-val">${esDependiente}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Nombre del Padre, Madre o Tutor Legal</div>
          <div class="info-val">${nombreTutor}</div>
        </div>
        <div class="info-field">
          <div class="info-label">¿Cuenta con Dependientes Económicos?</div>
          <div class="info-val">${tieneDependientes}</div>
        </div>
      </div>

      <!-- SECCIÓN 3: DOMICILIO -->
      <div class="section-header">3. Domicilio y Ubicación Geográfica del Beneficiario</div>
      <div class="info-grid-3">
        <div class="info-field">
          <div class="info-label">Tipo de Vialidad</div>
          <div class="info-val">${tipoVialidad}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Nombre de Vialidad (Calle / Av.)</div>
          <div class="info-val">${nombreVialidad}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Número Exterior / Interior</div>
          <div class="info-val">${numeroExterior}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Tipo de Asentamiento</div>
          <div class="info-val">${tipoAsentamiento}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Nombre de Asentamiento / Colonia</div>
          <div class="info-val">${nombreAsentamiento}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Código Postal y Municipio</div>
          <div class="info-val">C.P. ${codigoPostal} — Tuxtla Gutiérrez, Chiapas</div>
        </div>
      </div>

      <!-- SECCIÓN 4: DISCAPACIDAD Y SOLICITUD DE AYUDA -->
      <div class="section-header">4. Condición de Discapacidad y Solicitud de Ayuda</div>
      <div class="info-grid-4">
        <div class="info-field">
          <div class="info-label">Tipo de Discapacidad</div>
          <div class="info-val">${tipoDiscapacidad}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Tipo de Ayuda Técnica / Apoyo Solicitado</div>
          <div class="info-val" style="color: #0369a1;">${tipoAyudaSolicitada}</div>
        </div>
        <div class="info-field">
          <div class="info-label">¿Ha Recibido Apoyo de DIF Estatal?</div>
          <div class="info-val">${recibioApoyoDifEstatal}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Descripción del Apoyo DIF Estatal</div>
          <div class="info-val">${descripcionApoyoEstatal}</div>
        </div>
      </div>

      <!-- SECCIÓN 5: SERVICIOS MÉDICOS Y APOYOS GUBERNAMENTALES -->
      <div class="section-header">5. Servicios Médicos y Programas de Apoyo Gubernamental</div>
      <div class="info-grid-3">
        <div class="info-field">
          <div class="info-label">¿Cuenta con Servicio Médico?</div>
          <div class="info-val">${cuentaServicioMedico}</div>
        </div>
        <div class="info-field">
          <div class="info-label">¿Cuenta con Apoyo Gubernamental?</div>
          <div class="info-val">${cuentaApoyoGubernamental}</div>
        </div>
        <div class="info-field">
          <div class="info-label">Descripción del Apoyo Gubernamental</div>
          <div class="info-val">${descripcionApoyoGubernamental}</div>
        </div>
      </div>

      <!-- SECCIÓN 6: SERVICIOS INSTITUCIONALES DIF (ANEXO 5 — 34 SERVICIOS) -->
      <div class="section-header">6. Servicios Institucionales DIF Solicitados / Otorgados (Catálogo Anexo 5)</div>
      ${categoriasHtml}

      <!-- SECCIÓN 7: HISTORIAL DE SOLICITUDES Y OBSERVACIONES -->
      <div class="section-header">7. Registro de Solicitudes de Ayuda del Beneficiario</div>
      <table class="hist-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">#</th>
            <th style="width: 95px;">Fecha Solicitud</th>
            <th>Tipo de Ayuda / Apoyo Solicitado</th>
            <th style="width: 110px;">Apoyo DIF Estatal</th>
            <th>Descripción / Observaciones</th>
          </tr>
        </thead>
        <tbody>
          ${historialRowsHtml}
        </tbody>
      </table>
      ${
        observacionesExtra
          ? `<div class="info-field" style="margin-top: 5px;"><div class="info-label">Observaciones Generales del Expediente</div><div class="info-val">${observacionesExtra}</div></div>`
          : ''
      }

      <div class="signatures">
        <div class="sig">
          <strong>${nombreCompleto}</strong><br/>
          Firma o Huella del Beneficiario / Tutor Legal
        </div>
        <div class="sig">
          <strong>Área de Captura y Trabajo Social</strong><br/>
          ${dependencia}
        </div>
        <div class="sig">
          <strong>Vo. Bo. Dirección General DIF</strong><br/>
          Sello Institucional • Tuxtla Gutiérrez 2024–2027
        </div>
      </div>

      <div class="legal">
        Este programa es de carácter público, no es patrocinado ni promovido por partido político alguno y sus recursos provienen de los impuestos que pagan todos los contribuyentes.
        Queda prohibido el uso de este programa con fines políticos, electorales, de lucro y otros distintos a los establecidos en el Padrón Municipal de Beneficiarios.
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

