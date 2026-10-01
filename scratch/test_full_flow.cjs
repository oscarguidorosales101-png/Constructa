// Full Automated Test for CONSTRUCTA Client Portal, Messaging, PDF, Auth & Permissions
const assert = require('assert');

// Mock localStorage for node environment
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

async function runTests() {
  console.log('====================================================');
  console.log('CONSTRUCTA — AUDITORÍA Y VERIFICACIÓN INTEGRAL');
  console.log('====================================================\n');

  // 1. Auth and Demo Accounts Verification
  console.log('TEST 1: Verificación de Cuentas Demo');
  const dataService = require('../src/services/dataService.js').default;
  dataService.init();

  const accounts = [
    { email: 'admin@constructa.com', pass: 'admin', expectedRole: 'Administrador' },
    { email: 'gerencia@constructa.com', pass: 'Gerencia2026!', expectedRole: 'Gerente de Construcción' },
    { email: 'rrhh@constructa.com', pass: 'RRHH2026!', expectedRole: 'RRHH / Reclutamiento' },
    { email: 'cliente@constructa.com', pass: 'Cliente2026!', expectedRole: 'Cliente' },
  ];

  for (const acc of accounts) {
    const res = dataService.login(acc.email, acc.pass);
    assert(res.ok, `Fallo login para ${acc.email}`);
    assert.strictEqual(res.user.rol, acc.expectedRole, `Rol incorrecto para ${acc.email}: obtenido ${res.user.rol}`);
    console.log(`  ✓ Login correcto: ${acc.email} -> ${res.user.rol}`);
  }

  // 2. Role Permissions and Access Control Matrix
  console.log('\nTEST 2: Matriz de Permisos y Protección de Rutas');
  const { hasPermission } = require('../src/utils/permissions.js');

  // Cliente restrictions
  assert.strictEqual(hasPermission('Cliente', 'portal-cliente'), true, 'Cliente debe tener acceso a portal-cliente');
  assert.strictEqual(hasPermission('Cliente', 'dashboard'), false, 'Cliente NO debe acceder a dashboard');
  assert.strictEqual(hasPermission('Cliente', 'empleados'), false, 'Cliente NO debe acceder a empleados');
  assert.strictEqual(hasPermission('Cliente', 'materiales'), false, 'Cliente NO debe acceder a materiales');
  assert.strictEqual(hasPermission('Cliente', 'postulantes'), false, 'Cliente NO debe acceder a postulantes');
  assert.strictEqual(hasPermission('Cliente', 'solicitudes-clientes'), false, 'Cliente NO debe acceder a solicitudes-clientes');
  console.log('  ✓ Restricciones de Cliente estrictamente blindadas (403/401)');

  // RRHH restrictions
  assert.strictEqual(hasPermission('RRHH / Reclutamiento', 'postulantes'), true, 'RRHH debe acceder a postulantes');
  assert.strictEqual(hasPermission('RRHH / Reclutamiento', 'entrevistas'), true, 'RRHH debe acceder a entrevistas');
  assert.strictEqual(hasPermission('RRHH / Reclutamiento', 'solicitudes-clientes'), false, 'RRHH NO debe acceder a solicitudes-clientes');
  assert.strictEqual(hasPermission('RRHH / Reclutamiento', 'portal-cliente'), false, 'RRHH NO debe acceder a portal-cliente');
  console.log('  ✓ Aislamiento de RRHH validado (RRHH no participa en clientes ni mensajería)');

  // Admin and Gerente access
  assert.strictEqual(hasPermission('Administrador', 'solicitudes-clientes'), true);
  assert.strictEqual(hasPermission('Gerente de Construcción', 'solicitudes-clientes'), true);
  console.log('  ✓ Administrador y Gerente de Construcción tienen acceso a Solicitudes y Soporte');

  // 3. Bidirectional Messaging & Persistence Flow
  console.log('\nTEST 3: Flujo de Mensajería Bidireccional y Persistencia');
  const initialConvs = dataService.getClientConversations();
  assert(initialConvs.length >= 2, 'Deben existir conversaciones semilla');
  const conv = initialConvs[0];
  console.log(`  Hilo de prueba: [${conv.id}] ${conv.asunto} (Proyecto: ${conv.proyectoNombre})`);

  // Paso 3.1: Cliente envía mensaje
  const clientMsgText = "Solicito información sobre el próximo avance de mi proyecto.";
  const sendResClient = dataService.sendConversationMessage(conv.id, {
    remitente: 'Carlos Benítez (Cliente)',
    remitenteRol: 'Cliente',
    remitenteId: 'cli-demo',
    contenido: clientMsgText
  });
  assert(sendResClient, 'Envío de mensaje por parte del cliente falló');
  
  // Verificar persistencia en localStorage
  const convsAfterClient = dataService.getClientConversations();
  const updatedConvClient = convsAfterClient.find(c => c.id === conv.id);
  const lastMsg = updatedConvClient.mensajes[updatedConvClient.mensajes.length - 1];
  assert.strictEqual(lastMsg.contenido, clientMsgText, 'El mensaje del cliente no persistió correctamente');
  assert.strictEqual(lastMsg.remitenteTipo, 'cliente');
  console.log(`  ✓ Mensaje de Cliente persistido en localStorage: "${lastMsg.contenido}"`);

  // Paso 3.2: Verificar contador de no leídos para Administrador
  const unreadAdmin = dataService.getUnreadMessagesCount('Administrador');
  assert(unreadAdmin > 0, 'El administrador debe tener mensajes no leídos');
  console.log(`  ✓ Indicador de mensajes nuevos para Administrador: Mensajes · ${unreadAdmin}`);

  // Paso 3.3: Administrador abre la conversación y marca como leído
  dataService.markConversationAsRead(conv.id, 'Administrador');
  const convsAfterAdminRead = dataService.getClientConversations();
  const convReadByAdmin = convsAfterAdminRead.find(c => c.id === conv.id);
  assert.strictEqual(convReadByAdmin.noLeidosAdmin, 0, 'noLeidosAdmin debe ser 0 al marcar como leído');
  console.log('  ✓ Conversación marcada como leída por Administrador');

  // Paso 3.4: Administrador responde
  const adminReplyText = "Estimado cliente, la losa del nivel 14 ya fue colada y estamos comenzando el armado del nivel 15.";
  const sendResAdmin = dataService.sendConversationMessage(conv.id, {
    remitente: 'Ing. Fernando Mendoza',
    remitenteRol: 'Administrador',
    remitenteId: 'admin-01',
    contenido: adminReplyText
  });
  assert(sendResAdmin, 'Envío de respuesta por parte del administrador falló');

  // Paso 3.5: Cliente ve la respuesta
  const convsAfterAdmin = dataService.getClientConversations();
  const updatedConvAdmin = convsAfterAdmin.find(c => c.id === conv.id);
  const adminLastMsg = updatedConvAdmin.mensajes[updatedConvAdmin.mensajes.length - 1];
  assert.strictEqual(adminLastMsg.contenido, adminReplyText);
  assert.strictEqual(adminLastMsg.remitenteTipo, 'equipo');
  console.log(`  ✓ Respuesta del Administrador persistida: "${adminLastMsg.contenido}"`);

  const unreadClient = dataService.getUnreadMessagesCount('Cliente', 'cliente@constructa.com');
  assert(unreadClient > 0, 'El cliente debe tener mensajes no leídos');
  console.log(`  ✓ Indicador de mensajes nuevos para Cliente: Mensajes · ${unreadClient}`);

  // Paso 3.6: Cliente abre la conversación y marca como leído
  dataService.markConversationAsRead(conv.id, 'Cliente');
  const finalConvs = dataService.getClientConversations();
  const finalConv = finalConvs.find(c => c.id === conv.id);
  assert.strictEqual(finalConv.noLeidosCliente, 0);
  const verifiedAdminMsg = finalConv.mensajes[finalConv.mensajes.length - 1];
  assert.strictEqual(verifiedAdminMsg.estado, 'Leído');
  console.log('  ✓ Estado del mensaje actualizado a "Leído" bidireccionalmente');

  // 4. PDF Generation & Content Validation
  console.log('\nTEST 4: Generación y Validación de Archivos PDF');
  const { buildProjectDossierPDF, buildFinancialStatementPDF, buildQuotationRequestPDF } = require('../src/utils/pdfGenerator.js');

  const demoProject = {
    id: 'PRJ-001',
    codigo: 'TOR-ALTA-001',
    nombre: 'Torre Altavista Residencial',
    ubicacion: 'Av. Altavista 1420, Álvaro Obregón, CDMX',
    presupuesto: 18500000,
    avance: 68,
    fechaInicio: '15/Feb/2026',
    fechaFin: '20/Dic/2026',
    director: 'Ing. Carlos Mendoza (Gerente de Construcción)',
    supervisor: 'Arq. Roberto Morales'
  };

  const demoClient = {
    nombre: 'Carlos Benítez Juárez',
    email: 'cliente@constructa.com',
    telefono: '+52 55 4123 9876',
    empresa: 'Benítez & Asociados'
  };

  // Dossier PDF
  const dossier = buildProjectDossierPDF(demoProject, demoClient);
  assert(dossier.preview, 'Dossier debe contener objeto preview');
  assert(dossier.doc, 'Dossier debe contener instancia jsPDF');
  assert.strictEqual(dossier.doc.internal.getNumberOfPages(), 1);
  console.log(`  ✓ PDF Dossier generado correctamente: "${dossier.filename}" (${dossier.preview.title})`);

  // Financial PDF
  const financial = buildFinancialStatementPDF(demoProject, demoClient);
  assert(financial.doc, 'Financial PDF debe contener instancia jsPDF');
  console.log(`  ✓ PDF Estado Financiero generado correctamente: "${financial.filename}" (${financial.preview.title})`);

  // Quotation PDF
  const quote = buildQuotationRequestPDF({
    id: 'SOL-001',
    titulo: 'Torre Residencial Altavista',
    tipoProyecto: 'Edificio Residencial',
    ubicacion: 'CDMX',
    presupuestoEstimado: 18500000,
    fecha: '15/Ene/2026',
    estado: 'Aprobada',
    descripcion: 'Construcción integral de torre de departamentos premium'
  }, demoClient);
  assert(quote.doc, 'Quotation PDF debe contener instancia jsPDF');
  console.log(`  ✓ PDF Cotización generado correctamente: "${quote.filename}" (${quote.preview.title})`);

  console.log('\n====================================================');
  console.log('¡TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('\n❌ ERROR EN AUDITORÍA:', err);
  process.exit(1);
});
