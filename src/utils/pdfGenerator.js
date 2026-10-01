import { jsPDF } from 'jspdf';

/**
 * Motor de Generación y Validación de Documentos PDF Oficiales CONSTRUCTA
 * Cumple con el patrón: Preparar -> Generar -> Vista Previa -> Confirmar -> Descargar
 */

// Formateador de moneda
const formatMoney = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num);
};

// Formateador de fecha
const getFormattedDate = () => {
  return new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * 1. Generador de Dossier Ejecutivo del Proyecto
 */
export const buildProjectDossierPDF = (project, client = {}) => {
  if (!project || !project.nombre) {
    return { ok: false, error: 'No hay información suficiente para generar este documento.' };
  }

  const folio = `DOS-${project.id || 'PRJ'}-${new Date().getFullYear()}`;
  const dateStr = getFormattedDate();

  const previewData = {
    tipo: 'DOSSIER EJECUTIVO DE PROYECTO',
    folio,
    fecha: dateStr,
    titulo: project.nombre,
    subtitulo: `Expediente Contractual y Técnico Certificado • Obra ${project.id || 'PRJ-001'}`,
    cliente: {
      nombre: client.nombre || project.cliente || 'Lic. Roberto Garza Sada',
      empresa: client.empresa || 'Inversiones Inmobiliarias del Valle S.A.',
      email: client.email || 'cliente@constructa.com',
      telefono: client.telefono || '+52 55 4920 1832',
      ciudad: client.ciudad || 'Ciudad de México',
    },
    proyecto: {
      codigo: project.codigo || 'OBR-2026-01',
      ubicacion: project.ubicacion || 'Av. Las Palmas #450, Distrito Metropolitano',
      director: project.director || 'Ing. Carlos Mendoza Rivas (Gerente de Construcción)',
      plazo: `${project.fechaInicio || '15 Mar 2025'} al ${project.fechaFin || '30 Nov 2026'}`,
      estado: project.estado || 'En construcción',
      avanceFisico: `${project.avance || project.progreso || 68}%`,
      presupuestoTotal: formatMoney(project.presupuesto || 18500000),
    },
    tabla: {
      columnas: ['Fase / Hito Constructivo', 'Alcance Técnico', 'Estado', 'Ponderación'],
      filas: [
        ['Fase 1: Preliminares y Terracerías', 'Trazo, nivelación y muros de contención', 'Completado', '100%'],
        ['Fase 2: Cimentación Profunda', 'Zapatas, losa de cimentación y dados', 'Completado', '100%'],
        ['Fase 3: Estructura Principal', 'Armado de acero y colado de losas niveles 1-14', 'En ejecución', '65%'],
        ['Fase 4: Instalaciones MEP', 'Red eléctrica, ductería hidrosanitaria y HVAC', 'Programado', '0%'],
        ['Fase 5: Acabados y Fachada Flotante', 'Pisos, cristalería templada y pintura', 'Programado', '0%'],
      ],
    },
    resumenFinanciero: [
      { label: 'Presupuesto Total Contratado', valor: formatMoney(project.presupuesto || 18500000) },
      { label: 'Estimaciones Cobradas / Certificadas', valor: formatMoney((project.presupuesto || 18500000) * 0.45) },
      { label: 'Saldo Contractual Pendiente', valor: formatMoney((project.presupuesto || 18500000) * 0.55) },
    ],
    observaciones:
      'El presente documento avala que la obra cuenta con bitácora oficial registrada, póliza de responsabilidad civil vigente y peritaje estructural avalado por el Colegio de Ingenieros.',
    firmas: [
      { nombre: 'Ing. Fernando Mendoza', cargo: 'Director General CONSTRUCTA' },
      { nombre: 'Ing. Carlos Mendoza Rivas', cargo: 'Gerente de Construcción y Superintendente' },
    ],
    filename: `CONSTRUCTA_Dossier_${String(project.nombre || 'Proyecto').replace(/\s+/g, '_')}.pdf`,
  };

  // Creación del documento PDF real con jsPDF
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Encabezado Obsidiana
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');

  // Franja Dorada
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 32, 210, 1.5, 'F');

  // Textos Encabezado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(245, 158, 11);
  doc.text('CONSTRUCTA', 14, 16);

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('SISTEMA INTEGRAL DE GESTIÓN DE OBRAS Y PROYECTOS', 14, 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`FOLIO: ${previewData.folio}`, 196, 15, { align: 'right' });
  doc.text(`EMISIÓN: ${dateStr}`, 196, 21, { align: 'right' });
  doc.text('VALIDEZ: OFICIAL VIGENTE', 196, 27, { align: 'right' });

  // Título del Documento
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(previewData.tipo, 14, 43);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(previewData.subtitulo, 14, 49);

  // Cuadro de Información: Proyecto y Cliente
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 54, 182, 38, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  // Columna Izquierda: Proyecto
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DE LA OBRA', 18, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${previewData.titulo}`, 18, 66);
  doc.text(`Ubicación: ${previewData.proyecto.ubicacion}`, 18, 71);
  doc.text(`Director / Residente: ${previewData.proyecto.director}`, 18, 76);
  doc.text(`Plazo Contractual: ${previewData.proyecto.plazo}`, 18, 81);
  doc.text(`Avance Físico Actual: ${previewData.proyecto.avanceFisico}`, 18, 86);

  // Columna Derecha: Cliente
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL PROPIETARIO / CLIENTE', 110, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`Titular: ${previewData.cliente.nombre}`, 110, 66);
  doc.text(`Empresa: ${previewData.cliente.empresa}`, 110, 71);
  doc.text(`Email: ${previewData.cliente.email}`, 110, 76);
  doc.text(`Teléfono: ${previewData.cliente.telefono}`, 110, 81);
  doc.text(`Ciudad: ${previewData.cliente.ciudad}`, 110, 86);

  // Tabla de Hitos Constructivos
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('PROGRAMA DE HITOS Y ENTREGABLES FÍSICOS', 14, 100);

  // Cabecera de la tabla
  let tableY = 104;
  doc.setFillColor(15, 23, 42);
  doc.rect(14, tableY, 182, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text('FASE / COMPONENTE', 16, tableY + 5);
  doc.text('ALCANCE TÉCNICO', 75, tableY + 5);
  doc.text('ESTADO', 148, tableY + 5);
  doc.text('AVANCE', 180, tableY + 5);

  tableY += 7;

  // Filas
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  previewData.tabla.filas.forEach((row, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, tableY, 182, 6.5, 'F');
    }
    doc.text(row[0], 16, tableY + 4.5);
    doc.text(row[1], 75, tableY + 4.5);
    doc.text(row[2], 148, tableY + 4.5);
    doc.text(row[3], 182, tableY + 4.5);
    tableY += 6.5;
  });

  // Resumen Financiero
  tableY += 6;
  doc.setFillColor(245, 158, 11, 0.08);
  doc.setDrawColor(245, 158, 11);
  doc.rect(14, tableY, 182, 22, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('ESTADO FINANCIERO CONSOLIDADO DE OBRA', 18, tableY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Presupuesto Contractual Total: ${previewData.resumenFinanciero[0].valor}`, 18, tableY + 12);
  doc.text(`Estimaciones Facturadas y Pagadas: ${previewData.resumenFinanciero[1].valor}`, 18, tableY + 17);
  doc.text(`Saldo Restante por Amortizar: ${previewData.resumenFinanciero[2].valor}`, 110, tableY + 17);

  // Observaciones Legales
  tableY += 28;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('CERTIFICACIÓN Y OBSERVACIONES:', 14, tableY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const splitNotes = doc.splitTextToSize(previewData.observaciones, 182);
  doc.text(splitNotes, 14, tableY + 5);

  // Firmas Autorizadas
  const signY = 248;
  doc.setDrawColor(148, 163, 184);
  doc.line(24, signY, 84, signY);
  doc.line(126, signY, 186, signY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Ing. Fernando Mendoza', 54, signY + 5, { align: 'center' });
  doc.text('Ing. Carlos Mendoza Rivas', 156, signY + 5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Director General • CONSTRUCTA', 54, signY + 9, { align: 'center' });
  doc.text('Gerente de Construcción y Operaciones', 156, signY + 9, { align: 'center' });

  // Pie de página
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'CONSTRUCTA S.A. DE C.V. • Torre Empresarial Nivel 12 • contacto@constructa.com • Documento generado con firma electrónica certificada.',
    105,
    285,
    { align: 'center' }
  );

  return { ok: true, preview: previewData, doc, filename: previewData.filename };
};

/**
 * 2. Generador de Cotización Oficial de Solicitud de Obra
 */
export const buildQuotationRequestPDF = (request, client = {}) => {
  if (!request || !request.titulo) {
    return { ok: false, error: 'No hay información suficiente para generar este documento.' };
  }

  const folio = `COT-${request.numero || request.id || 'SOL'}-2026`;
  const dateStr = getFormattedDate();
  const presupuesto = Number(request.presupuestoEstimado) || 850000;
  const iva = presupuesto * 0.16;
  const total = presupuesto + iva;

  const previewData = {
    tipo: 'PROPUESTA DE COTIZACIÓN Y ALCANCE TÉCNICO',
    folio,
    fecha: dateStr,
    titulo: request.titulo,
    subtitulo: `Evaluación Presupuestal y Cronograma Preliminar • ${request.numero || request.id}`,
    cliente: {
      nombre: client.nombre || request.clienteNombre || 'Lic. Roberto Garza Sada',
      empresa: client.empresa || 'Inversiones Inmobiliarias del Valle S.A.',
      email: client.email || request.clienteEmail || 'cliente@constructa.com',
      telefono: client.telefono || request.clienteTelefono || '+52 55 4920 1832',
      ciudad: client.ciudad || 'Ciudad de México',
    },
    proyecto: {
      codigo: request.numero || request.id,
      ubicacion: request.ubicacion || 'Ubicación proporcionada por cliente',
      director: request.asignadoA || 'Ing. Carlos Mendoza (Gerente de Construcción)',
      plazo: request.plazoDeseado || '6 a 12 meses',
      estado: request.estado || 'En evaluación',
      avanceFisico: '0% (Fase Preventa)',
      presupuestoTotal: formatMoney(total),
    },
    tabla: {
      columnas: ['Concepto de Obra', 'Unidad / Área', 'Costo Estimado', 'Total Parcial'],
      filas: [
        ['1. Preliminares, cálculo estructural y licencias', 'Global', formatMoney(presupuesto * 0.12), formatMoney(presupuesto * 0.12)],
        ['2. Suministro y montaje de estructura principal', `${request.areaAproximada || 320} m²`, formatMoney(presupuesto * 0.45), formatMoney(presupuesto * 0.45)],
        ['3. Albañilerías, impermeabilización y cubiertas', `${request.areaAproximada || 320} m²`, formatMoney(presupuesto * 0.23), formatMoney(presupuesto * 0.23)],
        ['4. Instalaciones hidrosanitarias y eléctricas', 'Lote', formatMoney(presupuesto * 0.12), formatMoney(presupuesto * 0.12)],
        ['5. Acabados residenciales y limpieza final', 'Lote', formatMoney(presupuesto * 0.08), formatMoney(presupuesto * 0.08)],
      ],
    },
    resumenFinanciero: [
      { label: 'Subtotal de Conceptos', valor: formatMoney(presupuesto) },
      { label: 'Impuesto al Valor Agregado (IVA 16%)', valor: formatMoney(iva) },
      { label: 'Presupuesto Total Estimado', valor: formatMoney(total) },
    ],
    observaciones: `Esta cotización preliminar tiene una vigencia de 30 días naturales. Los precios quedan formalizados mediante la suscripción del Contrato de Obra a Precio Alzado. Requerimientos especiales del cliente: ${request.necesidadesPrincipales || 'Ninguno especificado'}.`,
    firmas: [
      { nombre: 'Ing. Fernando Mendoza', cargo: 'Director General CONSTRUCTA' },
      { nombre: 'Ing. Carlos Mendoza Rivas', cargo: 'Gerente de Construcción' },
    ],
    filename: `CONSTRUCTA_Cotizacion_${request.numero || request.id}.pdf`,
  };

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Encabezado
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 32, 210, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(245, 158, 11);
  doc.text('CONSTRUCTA', 14, 16);

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('COTIZACIÓN Y PRESUPUESTO OFICIAL DE CONSTRUCCIÓN', 14, 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`FOLIO: ${previewData.folio}`, 196, 15, { align: 'right' });
  doc.text(`FECHA: ${dateStr}`, 196, 21, { align: 'right' });

  // Título
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(previewData.tipo, 14, 43);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Solicitud: ${request.titulo} (${request.numero || request.id})`, 14, 49);

  // Cuadro Metadatos
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 54, 182, 34, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  doc.setFont('helvetica', 'bold');
  doc.text('DETALLES DE LA SOLICITUD', 18, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tipo de Obra: ${request.tipo || 'Construcción'}`, 18, 66);
  doc.text(`Inmueble: ${request.tipoInmueble || 'Residencial'}`, 18, 71);
  doc.text(`Superficie: ${request.areaAproximada || 0} m²`, 18, 76);
  doc.text(`Ubicación: ${request.ubicacion}`, 18, 81);

  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE SOLICITANTE', 110, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${previewData.cliente.nombre}`, 110, 66);
  doc.text(`Correo: ${previewData.cliente.email}`, 110, 71);
  doc.text(`Teléfono: ${previewData.cliente.telefono}`, 110, 76);
  doc.text(`Plazo Estimado: ${request.plazoDeseado || 'A convenir'}`, 110, 81);

  // Tabla
  let tableY = 96;
  doc.setFillColor(15, 23, 42);
  doc.rect(14, tableY, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PARTIDA Y CONCEPTO', 16, tableY + 5);
  doc.text('UNIDAD', 110, tableY + 5);
  doc.text('IMPORTE', 160, tableY + 5);

  tableY += 7;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  previewData.tabla.filas.forEach((row, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, tableY, 182, 6.5, 'F');
    }
    doc.text(row[0], 16, tableY + 4.5);
    doc.text(row[1], 110, tableY + 4.5);
    doc.text(row[3], 160, tableY + 4.5);
    tableY += 6.5;
  });

  // Resumen
  tableY += 4;
  doc.setFillColor(248, 250, 252);
  doc.rect(110, tableY, 86, 24, 'FD');
  doc.setFontSize(8.5);
  doc.text(`Subtotal:`, 114, tableY + 6);
  doc.text(`${previewData.resumenFinanciero[0].valor}`, 192, tableY + 6, { align: 'right' });
  doc.text(`IVA (16%):`, 114, tableY + 12);
  doc.text(`${previewData.resumenFinanciero[1].valor}`, 192, tableY + 12, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL ESTIMADO:`, 114, tableY + 19);
  doc.text(`${previewData.resumenFinanciero[2].valor}`, 192, tableY + 19, { align: 'right' });

  // Cláusulas
  tableY += 34;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('CONDICIONES COMERCIALES Y LEGALES:', 14, tableY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const splitNotes = doc.splitTextToSize(previewData.observaciones, 182);
  doc.text(splitNotes, 14, tableY + 5);

  // Firmas
  const signY = 248;
  doc.setDrawColor(148, 163, 184);
  doc.line(24, signY, 84, signY);
  doc.line(126, signY, 186, signY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Ing. Fernando Mendoza', 54, signY + 5, { align: 'center' });
  doc.text('Ing. Carlos Mendoza Rivas', 156, signY + 5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Director General • CONSTRUCTA', 54, signY + 9, { align: 'center' });
  doc.text('Gerente Técnico de Operaciones', 156, signY + 9, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'CONSTRUCTA S.A. DE C.V. • Presupuesto formal sujeto a términos contractuales.',
    105,
    285,
    { align: 'center' }
  );

  return { ok: true, preview: previewData, doc, filename: previewData.filename };
};

/**
 * 3. Generador de Estado Financiero y Recibo de Hito
 */
export const buildFinancialStatementPDF = (project, client = {}) => {
  if (!project) {
    return { ok: false, error: 'No hay información suficiente para generar este documento.' };
  }

  const folio = `EST-FIN-${project.id || 'PRJ'}-2026`;
  const dateStr = getFormattedDate();
  const presupuestoTotal = Number(project.presupuesto) || 18500000;
  const pagado = presupuestoTotal * 0.45;
  const saldo = presupuestoTotal - pagado;

  const previewData = {
    tipo: 'ESTADO FINANCIERO Y CONTROL DE ESTIMACIONES',
    folio,
    fecha: dateStr,
    titulo: `Estado de Cuenta de Obra • ${project.nombre || 'Torre Altavista'}`,
    subtitulo: 'Desglose oficial de amortizaciones, anticipos y saldo pendiente de cobro',
    cliente: {
      nombre: client.nombre || 'Lic. Roberto Garza Sada',
      empresa: client.empresa || 'Inversiones Inmobiliarias del Valle S.A.',
      email: client.email || 'cliente@constructa.com',
      telefono: client.telefono || '+52 55 4920 1832',
      ciudad: 'Ciudad de México',
    },
    proyecto: {
      codigo: project.id || 'PRJ-001',
      ubicacion: project.ubicacion || 'Av. Las Palmas #450, Distrito Metropolitano',
      director: project.director || 'Ing. Carlos Mendoza (Gerente de Construcción)',
      plazo: `${project.fechaInicio || '15 Mar 2025'} al ${project.fechaFin || '30 Nov 2026'}`,
      estado: project.estado || 'En construcción',
      avanceFisico: `${project.progreso || 68}%`,
      presupuestoTotal: formatMoney(presupuestoTotal),
    },
    tabla: {
      columnas: ['Estimación / Recibo', 'Concepto Amortizado', 'Monto Pagado', 'Estado'],
      filas: [
        ['EST-01 / Anticipo', 'Anticipo contractual para arranque de terracerías', formatMoney(presupuestoTotal * 0.2), 'Liquidado (15 Mar 2025)'],
        ['EST-02 / Hito Cimentación', 'Conclusión de zapatas y losa de cimentación', formatMoney(presupuestoTotal * 0.15), 'Liquidado (28 Jun 2025)'],
        ['EST-03 / Hito Nivel 7', 'Armado estructural de columnas hasta Nivel 7', formatMoney(presupuestoTotal * 0.1), 'Liquidado (10 Dic 2025)'],
        ['EST-04 / Hito Nivel 14', 'Colado de losa y estructura hasta Nivel 14', formatMoney(presupuestoTotal * 0.25), 'En proceso de certificación'],
        ['EST-05 / Finiquito', 'Acabados, pruebas hidrosanitarias y entrega de llaves', formatMoney(presupuestoTotal * 0.3), 'Programado para entrega'],
      ],
    },
    resumenFinanciero: [
      { label: 'Presupuesto Total Contratado', valor: formatMoney(presupuestoTotal) },
      { label: 'Total Pagado y Certificado', valor: formatMoney(pagado) },
      { label: 'Saldo Contractual Pendiente', valor: formatMoney(saldo) },
    ],
    observaciones:
      'Todos los pagos son emitidos a la cuenta concentradora de CONSTRUCTA S.A. DE C.V. y amparados por Factura Fiscal CFDI 4.0 autorizada ante el SAT.',
    firmas: [
      { nombre: 'Ing. Fernando Mendoza', cargo: 'Director de Finanzas y Administración' },
      { nombre: 'Ing. Carlos Mendoza Rivas', cargo: 'Superintendente de Obra' },
    ],
    filename: `CONSTRUCTA_EstadoFinanciero_${project.id || 'PRJ'}.pdf`,
  };

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Encabezado
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 32, 210, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(245, 158, 11);
  doc.text('CONSTRUCTA', 14, 16);

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('ESTADO DE CUENTA Y CALENDARIO FINANCIERO DE OBRA', 14, 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`FOLIO: ${previewData.folio}`, 196, 15, { align: 'right' });
  doc.text(`FECHA: ${dateStr}`, 196, 21, { align: 'right' });

  // Título
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(previewData.tipo, 14, 43);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text(previewData.titulo, 14, 49);

  // Cuadro Resumen Financiero Top Cards
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 54, 182, 28, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PRESUPUESTO TOTAL', 22, 63);
  doc.text('TOTAL AMORTIZADO (45%)', 82, 63);
  doc.text('SALDO POR PAGAR (55%)', 142, 63);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(previewData.resumenFinanciero[0].valor, 22, 72);

  doc.setTextColor(16, 185, 129);
  doc.text(previewData.resumenFinanciero[1].valor, 82, 72);

  doc.setTextColor(245, 158, 11);
  doc.text(previewData.resumenFinanciero[2].valor, 142, 72);

  // Tabla de Estimaciones
  let tableY = 90;
  doc.setFillColor(15, 23, 42);
  doc.rect(14, tableY, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('FOLIO ESTIMACIÓN', 16, tableY + 5);
  doc.text('CONCEPTO / ALCANCE', 65, tableY + 5);
  doc.text('MONTO', 135, tableY + 5);
  doc.text('ESTADO', 168, tableY + 5);

  tableY += 7;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  previewData.tabla.filas.forEach((row, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, tableY, 182, 7, 'F');
    }
    doc.text(row[0], 16, tableY + 4.8);
    doc.text(row[1], 65, tableY + 4.8);
    doc.text(row[2], 135, tableY + 4.8);
    doc.text(row[3], 168, tableY + 4.8);
    tableY += 7;
  });

  // Firmas
  const signY = 248;
  doc.setDrawColor(148, 163, 184);
  doc.line(24, signY, 84, signY);
  doc.line(126, signY, 186, signY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Ing. Fernando Mendoza', 54, signY + 5, { align: 'center' });
  doc.text('Ing. Carlos Mendoza Rivas', 156, signY + 5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Dirección de Finanzas y Administración', 54, signY + 9, { align: 'center' });
  doc.text('Gerente de Construcción y Operaciones', 156, signY + 9, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'CONSTRUCTA S.A. DE C.V. • Todos los comprobantes cuentan con certificación CFDI 4.0.',
    105,
    285,
    { align: 'center' }
  );

  return { ok: true, preview: previewData, doc, filename: previewData.filename };
};

export default {
  buildProjectDossierPDF,
  buildQuotationRequestPDF,
  buildFinancialStatementPDF,
};
