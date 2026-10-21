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
  { header: 'Folio', render: (b) => b.folio || `DIF-2027-${String(b.id || 1).padStart(3, '0')}` },
  { header: 'Fecha Solicitud', render: (b) => b.fecha_solicitud || (b.ultimaSolicitud ? String(b.ultimaSolicitud).slice(0, 10) : '—') },
  { header: 'Unidad Responsable', render: (b) => b.dependencia_emisora || b.dependencia || 'Dirección de Asistencia Social' },
  { header: 'Nombre(s)', render: (b) => b.nombres || b.nombre || '—' },
  { header: 'Apellido Paterno', render: (b) => b.apellidoPaterno || b.apellido_paterno || '—' },
  { header: 'Apellido Materno', render: (b) => b.apellidoMaterno || b.apellido_materno || '—' },
  { header: 'CURP', render: (b) => b.curp || '—' },
  { header: 'Fecha Nacimiento', render: (b) => b.fecha_nacimiento || (b.fechaNacimiento ? String(b.fechaNacimiento).slice(0, 10) : '—') },
  { header: 'Edad', render: (b) => (b.edad !== undefined && b.edad !== null ? `${b.edad}` : '—') },
  { header: 'Sexo', render: (b) => b.sexo || '—' },
  { header: 'Estado Civil', render: (b) => b.estadoCivil || b.estado_civil || '—' },
  {
    header: 'Dep. Económico',
    render: (b) =>
      b.esDependienteEconomico === true || b.es_dependiente_economico === 'Si' ? 'Sí' : 'No',
  },
  {
    header: 'Tutor Legal',
    render: (b) => b.tutorNombre || b.nombre_tutor || 'N/A',
  },
  {
    header: 'Tiene Dependientes',
    render: (b) =>
      b.tieneDependientesEconomicos === true || b.cuenta_con_dependientes === 'Si' ? 'Sí' : 'No',
  },
  {
    header: 'Vialidad y Número',
    render: (b) => {
      const tv = b.domicilio?.tipoVialidad || b.tipo_vialidad || 'Calle';
      const nv = b.domicilio?.nombreVialidad || b.nombre_vialidad || '';
      const ne = b.domicilio?.numeroExterior || b.numero_exterior || 'S/N';
      return `${tv} ${nv} #${ne}`.trim();
    },
  },
  {
    header: 'Asentamiento / Colonia',
    render: (b) => {
      const ta = b.domicilio?.tipoAsentamiento || b.tipo_asentamiento || 'Colonia';
      const na = b.domicilio?.nombreAsentamiento || b.nombre_asentamiento || b.colonia || '';
      return `${ta} ${na}`.trim();
    },
  },
  {
    header: 'C.P.',
    render: (b) => b.domicilio?.codigoPostal || b.codigo_postal || b.codigoPostal || '—',
  },
  {
    header: 'Discapacidad',
    render: (b) => b.tipoDiscapacidad || b.tipo_discapacidad || 'Ninguna',
  },
  {
    header: 'Ayuda Solicitada',
    render: (b) => b.tipo_ayuda_solicitada || b.ultimaAyuda || '—',
  },
  {
    header: 'Apoyo DIF Estatal',
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
    render: (b) =>
      b.cuentaServicioMedico === true || b.cuenta_servicio_medico === 'Si' ? 'Sí' : 'No',
  },
  {
    header: 'Apoyo Gubernamental',
    render: (b) => {
      const si = b.cuentaApoyoGubernamental === true || b.cuenta_apoyo_gubernamental === 'Si';
      const desc = b.descripcionApoyoGubernamental || b.descripcion_apoyo_gubernamental || '';
      return si ? `Sí${desc ? ` (${desc})` : ''}` : 'No';
    },
  },
  {
    header: 'Servicios DIF (Anexo 5)',
    render: (b) => obtenerServiciosActivosTexto(b),
  },
  {
    header: 'Estatus',
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

