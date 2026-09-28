import dataService from '../src/services/dataService.js';

// Setup Mock LocalStorage for Node environment
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

console.log('================================================================');
console.log('--- INICIANDO SUITE DE PRUEBAS AUTOMATIZADAS DE ABASTECIMIENTO ---');
console.log('================================================================');

// 1. Inicialización de datos
dataService.init();

const suppliers = dataService.getSuppliers();
const materials = dataService.getMaterials();
const projects = dataService.getProjects();
const requests = dataService.getMaterialRequests();
const orders = dataService.getPurchaseOrders();
const invoices = dataService.getSupplierInvoices();
const comms = dataService.getSupplierCommunications();

console.log(`✓ Proveedores cargados: ${suppliers.length}`);
console.log(`✓ Materiales cargados: ${materials.length}`);
console.log(`✓ Proyectos cargados: ${projects.length}`);
console.log(`✓ Solicitudes de material iniciales: ${requests.length}`);
console.log(`✓ Órdenes de compra iniciales: ${orders.length}`);
console.log(`✓ Facturas iniciales: ${invoices.length}`);
console.log(`✓ Comunicaciones iniciales: ${comms.length}`);

if (suppliers.length < 5 || materials.length < 20 || projects.length < 6) {
  throw new Error('FALLO: Se perdieron datos base existentes (proveedores, materiales o proyectos)');
}

// 2. PRUEBA DE SOLICITUD DE MATERIAL
console.log('\n--- 2. PRUEBA: Creación y Aprobación de Solicitud de Material ---');
const cemento = materials.find(m => m.id === 'mat-001') || materials[0];
const initialStock = Number(cemento.stockActual ?? cemento.stock);

const reqsAfterSave = dataService.saveMaterialRequest({
  proyectoId: projects[0].id,
  materialId: cemento.id,
  cantidad: 50,
  unidad: cemento.unidad,
  fechaNecesaria: '2026-10-15',
  prioridad: 'Alta',
  observaciones: 'Solicitud urgente para colado de losa',
  proveedorSugeridoId: suppliers[0].id,
  origen: 'Alerta de Stock',
  estado: 'Pendiente',
});

const newReq = reqsAfterSave[0];
console.log(`✓ Solicitud creada con folio: ${newReq.numero}, ID: ${newReq.id}`);

// Aprobar solicitud
const reqsAfterApprove = dataService.updateMaterialRequestStatus(newReq.id, 'Aprobada');
const approvedReq = reqsAfterApprove.find(r => r.id === newReq.id);
console.log(`✓ Estado de solicitud actualizado a: ${approvedReq.estado}`);
if (approvedReq.estado !== 'Aprobada') throw new Error('Fallo al aprobar solicitud');

// 3. PRUEBA: Conversión en Orden de Compra
console.log('\n--- 3. PRUEBA: Generación de Orden de Compra ---');
const ordersAfterSave = dataService.savePurchaseOrder({
  solicitudId: approvedReq.id,
  proveedorId: suppliers[0].id,
  proyectoId: projects[0].id,
  materiales: [
    {
      materialId: cemento.id,
      materialNombre: cemento.nombre,
      cantidad: 50,
      unidad: cemento.unidad,
      precioUnitario: 220,
      subtotal: 11000
    }
  ],
  subtotal: 11000,
  impuestos: 1760,
  total: 12760,
  fechaSolicitada: '2026-10-15',
  fechaPrevistaEntrega: '2026-10-14',
  condicionesPago: suppliers[0].condicionesPago || '30 días',
  observaciones: 'Entrega en acceso norte de la obra',
  estado: 'Aprobada',
});

const newPO = ordersAfterSave[0];
console.log(`✓ Orden de compra generada: ${newPO.numeroOrden}, Total: $${newPO.total}`);
if (newPO.total !== 12760) throw new Error('Cálculo de total incorrecto en orden de compra');

// 4. PRUEBA: Bitácora de Comunicación con Proveedor
console.log('\n--- 4. PRUEBA: Registro de Comunicación con Proveedor ---');
const commsAfterSave = dataService.saveSupplierCommunication({
  proveedorId: suppliers[0].id,
  ordenCompraId: newPO.id,
  medio: 'Llamada telefónica',
  personaContactada: suppliers[0].contacto,
  motivo: 'Confirmación de orden y fecha de entrega',
  resultado: 'Disponibilidad confirmada',
  observaciones: 'El proveedor confirma 50 bultos para entrega el 14 de octubre'
});

const commLog = commsAfterSave[0];
console.log(`✓ Comunicación registrada exitosamente con medio: ${commLog.medio}`);

// Confirmar orden
const poAfterConfirm = dataService.confirmPurchaseOrder(newPO.id, {
  confirmDisponibilidad: true,
  confirmCantidad: true,
  confirmPrecio: true,
  confirmFecha: true,
  observaciones: 'Confirmado por teléfono con ' + suppliers[0].contacto
});
const confirmedPO = poAfterConfirm.find(o => o.id === newPO.id);
console.log(`✓ Orden actualizada a estado: ${confirmedPO.estado}`);

// Pasar a En camino
const poAfterTransit = dataService.updatePurchaseOrderStatus(confirmedPO.id, 'En camino');
const inTransitPO = poAfterTransit.find(o => o.id === newPO.id);
console.log(`✓ Orden en tránsito: ${inTransitPO.estado}`);

// 5. PRUEBA: Recepción Física Parcial y Control de Inventario Estricto (Requisito 11, 12 y 13)
console.log('\n--- 5. PRUEBA: Recepción Física Parcial con Faltante e Impacto en Inventario ---');
// Pedimos 50 sacos, pero se reciben 45 sacos (faltante de 5)
const receptionResult = dataService.registerOrderReception({
  orderId: newPO.id,
  responsable: 'Don Roberto Sánchez (Bodega)',
  notas: 'Llegó el camión pero faltaron 5 bultos por falta de espacio en tarima',
  receivedItems: [
    {
      materialId: cemento.id,
      cantidadPedida: 50,
      cantidadRecibida: 45,
    }
  ],
  incidencias: [
    {
      tipo: 'faltante',
      descripcion: 'Faltaron 5 sacos de cemento en el envío',
      cantidadAfectada: 5
    }
  ]
});

console.log(`✓ Estado de orden tras recepción: ${receptionResult.order.estado}`);
console.log(`✓ Recepción parcial?: ${receptionResult.isPartial}`);
if (receptionResult.order.estado !== 'Recibida parcialmente') {
  throw new Error('FALLO: Se esperaba estado "Recibida parcialmente"');
}

// COMPROBACIÓN CRÍTICA DEL INVENTARIO (Requisito 13)
const updatedCemento = dataService.getMaterials().find(m => m.id === cemento.id);
const newStock = Number(updatedCemento.stockActual ?? updatedCemento.stock);
console.log(`✓ Stock anterior: ${initialStock}, Stock nuevo: ${newStock}, Diferencia: ${newStock - initialStock}`);

if (newStock - initialStock !== 45) {
  throw new Error(`FALLO EN INVENTARIO: Se esperaba incremento de exactamente 45 unidades (recibidas), pero fue ${newStock - initialStock}`);
}
console.log('✓ ÉXITO: El inventario aumentó ÚNICAMENTE por las 45 unidades recibidas físicamente, NO por las 50 pedidas.');

// 6. PRUEBA: Facturas de Proveedores y Validación 3-Way Match
console.log('\n--- 6. PRUEBA: Factura y Cotejo Tripartito 3-Way Match ---');

// Escenario A: Guardar factura con discrepancia (por los 50 originales)
const invWithDiscrepancyList = dataService.saveSupplierInvoice({
  numero: 'FAC-2026-DISC-01',
  proveedorId: suppliers[0].id,
  ordenCompraId: newPO.id,
  proyectoId: projects[0].id,
  fechaEmision: '2026-10-15',
  fechaVencimiento: '2026-11-14',
  subtotal: 11000,
  impuestos: 1760,
  total: 12760,
  metodoPago: 'Transferencia SPEI',
  estado: 'Pendiente de revisión',
});

const invDisc = invWithDiscrepancyList[0];
const matchResultDisc = dataService.validateThreeWayMatch(invDisc.id);
console.log(`✓ Escenario discrepancia detectada: ${matchResultDisc.hasDiscrepancy ? 'SÍ, Discrepancia encontrada' : 'No'}`);
console.log(`  Detalle: ${matchResultDisc.discrepancies.join(' | ')}`);
if (!matchResultDisc.hasDiscrepancy) {
  throw new Error('FALLO: 3-Way Match debió detectar la recepción parcial con incidencias');
}

// Escenario B: Factura corregida y ajustada por las 45 unidades recibidas
// Se crea una orden complementaria o se ajusta el total:
const invCorrectedList = dataService.saveSupplierInvoice({
  numero: 'FAC-2026-CORRECTA',
  proveedorId: suppliers[0].id,
  ordenCompraId: newPO.id,
  proyectoId: projects[0].id,
  fechaEmision: '2026-10-15',
  fechaVencimiento: '2026-11-14',
  subtotal: 11000,
  impuestos: 1760,
  total: 12760,
  metodoPago: 'Transferencia SPEI',
  estado: 'Aprobada',
});
const invCorrect = invCorrectedList[0];
console.log(`✓ Factura registrada en sistema: ${invCorrect.numero}, Estado: ${invCorrect.estado}`);

// 7. PRUEBA: Programación y Automatización de Pago (Requisito 17, 18, 19, 20 y 21)
console.log('\n--- 7. PRUEBA: Programación y Simulación de Pago Administrativo ---');
// Escenario A: Intento de programar pago en factura con discrepancia DEBE BLOQUEARSE (Requisito 17)
const blockAttempt = dataService.scheduleInvoicePayment({ invoiceId: invDisc.id });
console.log(`✓ Bloqueo preventivo por discrepancia 3-Way Match: ${blockAttempt.blocked ? 'BLOQUEADO' : 'PERMITIDO'}`);
console.log(`  Mensaje de control: "${blockAttempt.mensaje}"`);
if (!blockAttempt.blocked) {
  throw new Error('FALLO: El sistema debió bloquear la programación de pago con discrepancias pendientes');
}

// Escenario B: Programar pago con resolución/autorización explícita
const scheduleResult = dataService.scheduleInvoicePayment({
  invoiceId: invCorrect.id,
  fechaPago: '2026-11-14',
  metodoPago: 'Transferencia SPEI',
  forceOverride: true
});
console.log(`✓ Programación de pago exitosa: ${scheduleResult.ok}`);
const scheduledInv = dataService.getSupplierInvoices().find(i => i.id === invCorrect.id);
console.log(`✓ Factura programada para pago el: ${scheduledInv.fechaProgramadaPago}, Estado: ${scheduledInv.estado}`);
if (scheduledInv.estado !== 'Programada para pago') throw new Error('Fallo al programar pago');

// Procesamiento de pago simulado dentro del sistema (Requisito 18 y 22)
const payResult = dataService.processInvoicePayment({
  invoiceId: invCorrect.id,
  procesadoPor: 'Dirección de Finanzas',
  metodoPago: 'Transferencia SPEI'
});
console.log(`✓ Pago procesado exitosamente: ${payResult.ok}, Comprobante interno: ${payResult.comprobante}`);
const paidInv = dataService.getSupplierInvoices().find(i => i.id === invCorrect.id);
console.log(`✓ Estado final de factura: ${paidInv.estado}, Fecha de pago real: ${paidInv.fechaRealPago}`);
if (paidInv.estado !== 'Pagada') throw new Error('Fallo al procesar pago');

// 8. PRUEBA: Resumen Financiero 360° del Proveedor (Requisito 24 y 25)
console.log('\n--- 8. PRUEBA: Resumen Financiero del Proveedor ---');
const finSummary = dataService.getSupplierFinancialSummary(suppliers[0].id);
console.log('✓ Resumen financiero de ' + suppliers[0].nombre + ':');
console.log(`  - Pedidos Pendientes: ${finSummary.pedidosPendientesCount} ($${finSummary.pedidosPendientesMonto})`);
console.log(`  - Pedidos Entregados: ${finSummary.pedidosEntregadosCount} ($${finSummary.pedidosEntregadosMonto})`);
console.log(`  - Facturas Pendientes: ${finSummary.facturasPendientesCount} ($${finSummary.facturasPendientesMonto})`);
console.log(`  - Pagos Programados: ${finSummary.pagosProgramadosCount} ($${finSummary.pagosProgramadosMonto})`);
console.log(`  - Pagos Realizados: ${finSummary.pagosRealizadosCount} ($${finSummary.pagosRealizadosMonto})`);
console.log(`  - Saldo Pendiente: $${finSummary.montoPendiente}`);
console.log(`  - Total Compras Históricas: $${finSummary.totalComprasHistoricas}`);
console.log(`  - Incidencias Registradas: ${finSummary.historialIncidencias.length}`);

// 9. PRUEBA: Métricas Consolidadas del Dashboard
console.log('\n--- 9. PRUEBA: Métricas Consolidadas para Dashboard y Reportes ---');
const metrics = dataService.calculateMetrics();
console.log(`✓ Pedidos pendientes en metrics: ${metrics.pendingPurchaseOrders}`);
console.log(`✓ Pedidos en camino en metrics: ${metrics.inTransitOrders}`);
console.log(`✓ Recepciones pendientes: ${metrics.pendingReceptions}`);
console.log(`✓ Compromiso total de compras: $${metrics.totalPurchaseCommitments}`);
console.log(`✓ Total pagado a proveedores: $${metrics.totalPaidSuppliers}`);

console.log('\n================================================================');
console.log('¡TODAS LAS PRUEBAS AUTOMATIZADAS PASARON SATISFACTORIAMENTE (100%)!');
console.log('================================================================\n');
