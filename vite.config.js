import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.resolve(__dirname, 'src/data/db.json');

function dbApiPlugin() {
  return {
    name: 'constructa-db-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parseJsonBody = () =>
          new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch (err) {
                reject(err);
              }
            });
            req.on('error', reject);
          });

        const sendJson = (statusCode, data) => {
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        const readDb = () => JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
        const writeDb = (data) => fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');

        const [pathname] = (req.url || '').split('?');
        const parts = pathname.split('/').filter(Boolean); // e.g. ['api', 'suppliers', 'PRV-001']

        if (parts[0] !== 'api') {
          return next();
        }

        const resource = parts[1];
        const resourceId = parts[2];

        // 1. ENDPOINT GENERAL DE SINCRONIZACIÓN /api/db
        if (resource === 'db') {
          if (req.method === 'GET') {
            try {
              return sendJson(200, readDb());
            } catch (err) {
              return sendJson(500, { ok: false, error: err.message });
            }
          }
          if (req.method === 'POST') {
            return parseJsonBody()
              .then((body) => {
                const currentDb = readDb();
                const updatedDb = { ...currentDb, ...body };
                writeDb(updatedDb);
                return sendJson(200, { ok: true, message: 'db.json actualizado correctamente' });
              })
              .catch((err) => sendJson(400, { ok: false, error: err.message }));
          }
        }

        // 2. CONFIGURACIÓN Y PREFERENCIAS /api/settings
        if (resource === 'settings') {
          if (req.method === 'GET') {
            try {
              const currentDb = readDb();
              return sendJson(200, { ok: true, settings: currentDb.settings || {} });
            } catch (err) {
              return sendJson(500, { ok: false, error: err.message });
            }
          }
          if (req.method === 'POST' || req.method === 'PUT') {
            return parseJsonBody()
              .then((settings) => {
                const currentDb = readDb();
                currentDb.settings = { ...(currentDb.settings || {}), ...settings, updatedAt: new Date().toISOString() };
                writeDb(currentDb);
                return sendJson(200, { ok: true, settings: currentDb.settings });
              })
              .catch((err) => sendJson(400, { ok: false, error: err.message }));
          }
        }

        // 3. MAPEO RESTFUL PARA COLECCIONES DE CONSTRUCTA
        const collectionKeys = {
          suppliers: { key: 'suppliers', prefix: 'PRV' },
          employees: { key: 'employees', prefix: 'EMP' },
          clients: { key: 'clients', prefix: 'CLI' },
          projects: { key: 'projects', prefix: 'PRJ' },
          requests: { key: 'requests', prefix: 'SOL' },
          materials: { key: 'materials', prefix: 'MAT' },
          expenses: { key: 'expenses', prefix: 'GAS' },
          users: { key: 'users', prefix: 'USR' },
          roles: { key: 'roles', prefix: 'ROL' },
          purchaseOrders: { key: 'purchaseOrders', prefix: 'OC' },
          materialRequests: { key: 'materialRequests', prefix: 'REQ' },
          supplierInvoices: { key: 'supplierInvoices', prefix: 'FAC' }
        };

        if (collectionKeys[resource]) {
          const { key, prefix } = collectionKeys[resource];

          // GET /api/:resource o GET /api/:resource/:id
          if (req.method === 'GET') {
            try {
              const currentDb = readDb();
              const items = currentDb[key] || [];
              if (resourceId) {
                const single = items.find((i) => String(i.id) === String(resourceId));
                if (!single) return sendJson(404, { ok: false, error: 'No encontrado' });
                return sendJson(200, single);
              }
              return sendJson(200, items);
            } catch (err) {
              return sendJson(500, { ok: false, error: err.message });
            }
          }

          // POST /api/:resource (CREACIÓN CON PERSISTENCIA REAL EN DB.JSON)
          if (req.method === 'POST' && !resourceId) {
            return parseJsonBody()
              .then((itemData) => {
                const currentDb = readDb();
                currentDb[key] = currentDb[key] || [];

                // Validación específica para clientes
                if (resource === 'clients') {
                  const cleanEmail = (itemData.email || '').trim().toLowerCase();
                  if (!cleanEmail) {
                    return sendJson(400, { ok: false, error: 'El correo electrónico es obligatorio.', code: 'VALIDATION_ERROR' });
                  }
                  const exists = currentDb.clients.some((c) => (c.email || '').toLowerCase() === cleanEmail);
                  if (exists) {
                    return sendJson(409, { ok: false, error: 'Ya existe una cuenta asociada a este correo electrónico.', code: 'DUPLICATE_EMAIL' });
                  }
                }

                // Generación de ID consecutivo
                let newId = itemData.id;
                if (!newId) {
                  const existingNums = currentDb[key].map((item) => {
                    const match = String(item.id || '').match(/\d+/);
                    return match ? parseInt(match[0], 10) : 0;
                  });
                  const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
                  newId = `${prefix}-${String(maxNum + 1).padStart(3, '0')}`;
                }

                const newItem = {
                  ...itemData,
                  id: newId
                };

                // Enriquecimiento para Cliente + Usuario relacionado
                if (resource === 'clients') {
                  const userId = `USR-${newId.replace('CLI-', '')}`;
                  const clientPassword = itemData.password || itemData.clave || 'Cliente2026!';
                  newItem.userId = userId;
                  newItem.rol = 'Cliente';
                  newItem.identificacion = itemData.identificacion || '';
                  newItem.tipoIdentificacion = itemData.tipoIdentificacion || 'Física';
                  newItem.clave = clientPassword;
                  newItem.password = clientPassword;
                  newItem.codigoVerificacion = itemData.codigoVerificacion || '749201';
                  newItem.estadoVerificacion = 'Verificada';
                  newItem.fechaRegistro = newItem.fechaRegistro || new Date().toISOString().split('T')[0];
                  newItem.proyectosAsociados = newItem.proyectosAsociados || [];

                  // Persistir usuario relacionado en users
                  currentDb.users = currentDb.users || [];
                  const newUser = {
                    id: userId,
                    clienteId: newId,
                    nombre: newItem.nombre,
                    identificacion: newItem.identificacion,
                    tipoIdentificacion: newItem.tipoIdentificacion,
                    email: newItem.email,
                    usuario: newItem.email,
                    clave: clientPassword,
                    password: clientPassword,
                    rol: 'Cliente',
                    activo: true,
                    fechaCreacion: new Date().toISOString()
                  };
                  currentDb.users.push(newUser);
                }

                // Añadir al inicio o fin según colección
                currentDb[key].push(newItem);

                // Escribir físicamente a db.json
                writeDb(currentDb);

                return sendJson(201, {
                  ok: true,
                  data: newItem,
                  item: newItem,
                  cliente: newItem,
                  client: newItem,
                  [resource.slice(0, -1)]: newItem,
                  [resource]: currentDb[key],
                  message: `${resource} persistido exitosamente en db.json`
                });
              })
              .catch((err) => sendJson(400, { ok: false, error: err.message }));
          }

          // PUT o PATCH /api/:resource/:id (MODIFICACIÓN)
          if ((req.method === 'PUT' || req.method === 'PATCH') && resourceId) {
            return parseJsonBody()
              .then((itemData) => {
                const currentDb = readDb();
                currentDb[key] = currentDb[key] || [];
                const idx = currentDb[key].findIndex((i) => String(i.id) === String(resourceId));

                if (idx === -1) {
                  return sendJson(404, { ok: false, error: `Elemento ${resourceId} no encontrado` });
                }

                const updatedItem = {
                  ...currentDb[key][idx],
                  ...itemData,
                  id: resourceId
                };
                currentDb[key][idx] = updatedItem;

                writeDb(currentDb);

                return sendJson(200, {
                  ok: true,
                  data: updatedItem,
                  item: updatedItem,
                  [resource.slice(0, -1)]: updatedItem,
                  [resource]: currentDb[key]
                });
              })
              .catch((err) => sendJson(400, { ok: false, error: err.message }));
          }

          // DELETE /api/:resource/:id (ELIMINACIÓN)
          if (req.method === 'DELETE' && resourceId) {
            const currentDb = readDb();
            currentDb[key] = currentDb[key] || [];
            currentDb[key] = currentDb[key].filter((i) => String(i.id) !== String(resourceId));

            writeDb(currentDb);

            return sendJson(200, {
              ok: true,
              [resource]: currentDb[key],
              message: `Elemento ${resourceId} eliminado de db.json`
            });
          }
        }

        // Proxy para API de Hacienda de Costa Rica (https://api.hacienda.go.cr/fe/ae)
        if (req.url.startsWith('/api/hacienda') && req.method === 'GET') {
          const urlObj = new URL(req.url, 'http://localhost');
          const identificacion = urlObj.searchParams.get('identificacion');

          if (!identificacion || !identificacion.trim()) {
            return sendJson(400, {
              ok: false,
              code: 'MISSING_PARAM',
              error: 'El parámetro identificacion es requerido.'
            });
          }

          const cleanId = identificacion.replace(/\D/g, '');
          if (cleanId.length < 9 || cleanId.length > 12) {
            return sendJson(400, {
              ok: false,
              code: 'INVALID_FORMAT',
              error: 'La identificación debe tener entre 9 y 12 dígitos numéricos.'
            });
          }

          try {
            const haciendaUrl = `https://api.hacienda.go.cr/fe/ae?identificacion=${encodeURIComponent(cleanId)}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const haciendaRes = await fetch(haciendaUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'CONSTRUCTA-ERP/1.0'
              },
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (haciendaRes.status === 404) {
              return sendJson(404, {
                ok: false,
                code: 'NOT_FOUND',
                error: 'Identificación no registrada en el padrón de Hacienda de Costa Rica.'
              });
            }

            if (!haciendaRes.ok) {
              return sendJson(haciendaRes.status, {
                ok: false,
                code: `HTTP_${haciendaRes.status}`,
                error: 'Error al consultar el servicio tributario de Hacienda.'
              });
            }

            const data = await haciendaRes.json();
            const tipoMap = {
              '01': 'Cédula Física',
              '02': 'Cédula Jurídica',
              '03': 'DIMEX',
              '04': 'NITE'
            };

            return sendJson(200, {
              ok: true,
              identificacion: cleanId,
              nombre: data.nombre || '',
              tipoIdentificacion: data.tipoIdentificacion || '01',
              tipoIdentificacionDescripcion: tipoMap[data.tipoIdentificacion] || 'Identificación Tributaria'
            });
          } catch (haciendaErr) {
            const isTimeout = haciendaErr.name === 'AbortError';
            return sendJson(504, {
              ok: false,
              code: isTimeout ? 'TIMEOUT' : 'CONNECTION_ERROR',
              error: isTimeout
                ? 'Tiempo de espera agotado al consultar Hacienda.'
                : 'No se pudo conectar con el servicio de Hacienda de Costa Rica.'
            });
          }
        }

        // Función auxiliar para leer variables del servidor desde process.env o archivo .env
        const getServerEnv = (key, defaultVal = '') => {
          if (process.env[key] && process.env[key].trim()) {
            return process.env[key].trim();
          }
          try {
            const envPath = path.resolve(__dirname, '.env');
            if (fs.existsSync(envPath)) {
              const envContent = fs.readFileSync(envPath, 'utf8');
              const regex = new RegExp(`^\\s*${key}\\s*=\\s*([^\\r\\n#]+)`, 'm');
              const match = envContent.match(regex);
              if (match && match[1]) {
                const val = match[1].trim().replace(/^["']|["']$/g, '');
                if (val) return val;
              }
            }
          } catch (_) {}
          return defaultVal;
        };

        // 3.5 SERVICIO SEGURO DE CONTACTO Y CORREO OFICIAL (/api/contact)
        if (req.url.startsWith('/api/contact')) {
          if (req.method === 'POST') {
            return parseJsonBody()
              .then(async (body) => {
                // Anti-spam honeypot
                if (body.honeypot || body.website || body._gotcha) {
                  return sendJson(200, {
                    ok: true,
                    message: 'Mensaje procesado.'
                  });
                }

                const nombre = (body.nombre || '').trim();
                const email = (body.email || '').trim().toLowerCase();
                const telefono = (body.telefono || '').trim();
                const asunto = (body.asunto || 'Cotización de Obra Nueva').trim();
                const mensaje = (body.mensaje || '').trim();

                // Validaciones
                if (!nombre) {
                  return sendJson(400, {
                    ok: false,
                    error: 'El nombre o razón social es obligatorio.'
                  });
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!email || !emailRegex.test(email)) {
                  return sendJson(400, {
                    ok: false,
                    error: 'El formato de correo electrónico no es válido.'
                  });
                }

                if (!mensaje) {
                  return sendJson(400, {
                    ok: false,
                    error: 'La descripción del requerimiento o mensaje es obligatoria.'
                  });
                }

                if (mensaje.length < 5) {
                  return sendJson(400, {
                    ok: false,
                    error: 'El mensaje debe tener al menos 5 caracteres.'
                  });
                }

                if (mensaje.length > 5000) {
                  return sendJson(400, {
                    ok: false,
                    error: 'El mensaje excede el límite máximo permitido (5,000 caracteres).'
                  });
                }

                // Persistencia en db.json
                const currentDb = readDb();
                currentDb.requests = currentDb.requests || [];
                currentDb.contactMessages = currentDb.contactMessages || [];

                // ID consecutivo SOL-xxx
                const existingNums = currentDb.requests.map((r) => {
                  const match = String(r.id || '').match(/\d+/);
                  return match ? parseInt(match[0], 10) : 0;
                });
                const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
                const newId = `SOL-${String(maxNum + 1).padStart(3, '0')}`;

                const nuevaSolicitud = {
                  id: newId,
                  clienteNombre: nombre,
                  clienteEmail: email,
                  clienteTelefono: telefono,
                  tipo: asunto,
                  titulo: `[Web] ${asunto} - ${nombre}`,
                  descripcion: mensaje,
                  ubicacion: 'Contacto Web Público',
                  origen: 'Formulario Web',
                  estado: 'Pendiente',
                  prioridad: 'Media',
                  fechaCreacion: new Date().toISOString()
                };

                currentDb.requests.push(nuevaSolicitud);

                // Destinatario oficial del servidor
                const contactEmail = getServerEnv('CONTACT_EMAIL', 'contacto@constructa.cr');
                const smtpHost = getServerEnv('SMTP_HOST', '');
                const smtpPort = parseInt(getServerEnv('SMTP_PORT', '587'), 10);
                const smtpSecure = getServerEnv('SMTP_SECURE', 'false') === 'true';
                const smtpUser = getServerEnv('SMTP_USER', '');
                const smtpPass = getServerEnv('SMTP_PASS', '');
                const smtpFrom = getServerEnv('SMTP_FROM', `"CONSTRUCTA Notificaciones" <${contactEmail}>`);

                let emailDelivery = {
                  attempted: false,
                  sent: false,
                  status: 'PENDING_SMTP_CONFIG'
                };

                if (smtpHost && smtpUser && smtpPass) {
                  emailDelivery.attempted = true;
                  try {
                    const transporter = nodemailer.createTransport({
                      host: smtpHost,
                      port: smtpPort,
                      secure: smtpSecure,
                      auth: {
                        user: smtpUser,
                        pass: smtpPass
                      }
                    });

                    await transporter.sendMail({
                      from: smtpFrom,
                      to: contactEmail,
                      replyTo: email,
                      subject: `[CONSTRUCTA Contacto Web] ${asunto} - ${nombre}`,
                      text: `Nueva solicitud recibida:\n\nID: ${newId}\nNombre: ${nombre}\nEmail: ${email}\nTeléfono: ${telefono || 'No registrado'}\nAsunto: ${asunto}\n\nMensaje:\n${mensaje}\n\nFecha: ${new Date().toLocaleString()}`,
                      html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                          <h2 style="color: #d97706; margin-top: 0;">CONSTRUCTA — Solicitud de Contacto Web</h2>
                          <p><strong>Identificador:</strong> ${newId}</p>
                          <p><strong>Nombre / Razón Social:</strong> ${nombre}</p>
                          <p><strong>Correo Electrónico:</strong> <a href="mailto:${email}">${email}</a></p>
                          <p><strong>Teléfono:</strong> ${telefono || 'No registrado'}</p>
                          <p><strong>Tipo de Requerimiento:</strong> ${asunto}</p>
                          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                          <h3 style="color: #0f172a;">Descripción del Proyecto:</h3>
                          <p style="white-space: pre-wrap; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #cbd5e1;">${mensaje}</p>
                          <footer style="margin-top: 20px; font-size: 0.8rem; color: #64748b;">
                            Generado automáticamente por el portal web CONSTRUCTA.
                          </footer>
                        </div>
                      `
                    });
                    emailDelivery.sent = true;
                    emailDelivery.status = 'DELIVERED';
                  } catch (mailErr) {
                    console.error('[Contact SMTP Error]:', mailErr.message);
                    emailDelivery.sent = false;
                    emailDelivery.status = 'SMTP_ERROR';
                    emailDelivery.error = mailErr.message;
                  }
                } else {
                  emailDelivery.status = 'PERSISTED_NO_SMTP_CREDENTIALS';
                }

                currentDb.contactMessages.push({
                  id: `MSG-${Date.now()}`,
                  requestId: newId,
                  nombre,
                  email,
                  telefono,
                  asunto,
                  mensaje,
                  recipient: contactEmail,
                  delivery: emailDelivery,
                  fecha: new Date().toISOString()
                });

                writeDb(currentDb);

                return sendJson(200, {
                  ok: true,
                  requestId: newId,
                  emailSent: emailDelivery.sent,
                  deliveryStatus: emailDelivery.status,
                  recipient: contactEmail,
                  requiresSmtpConfig: !emailDelivery.attempted,
                  message: emailDelivery.sent
                    ? 'Mensaje enviado exitosamente al correo oficial de CONSTRUCTA.'
                    : 'Solicitud recibida y registrada exitosamente en el sistema de atención corporativa.'
                });
              })
              .catch((err) => sendJson(400, { ok: false, error: err.message }));
          }

          if (req.method === 'GET') {
            const contactEmail = getServerEnv('CONTACT_EMAIL', 'contacto@constructa.cr');
            const smtpHost = getServerEnv('SMTP_HOST', '');
            const smtpUser = getServerEnv('SMTP_USER', '');
            return sendJson(200, {
              ok: true,
              service: 'constructa-contact-api',
              officialRecipient: contactEmail,
              smtpConfigured: Boolean(smtpHost && smtpUser)
            });
          }
        }

        // Función auxiliar para obtener la clave de Gemini sin reiniciar el servidor y sin exponerla al cliente
        const getGeminiApiKey = () => {
          const direct = getServerEnv('GEMINI_API_KEY');
          if (direct) return direct;
          return getServerEnv('VITE_GEMINI_API_KEY', '');
        };

        // 4. API DE CONSTRUCTA - SERVICIO INTERNO DE INFORMACIÓN EMPRESARIAL (/api/constructa/info)
        if (req.url.startsWith('/api/constructa/info') && req.method === 'GET') {
          try {
            const currentDb = readDb();
            const projects = currentDb.projects || [];
            const expenses = currentDb.expenses || [];
            const employees = currentDb.employees || [];
            const clients = currentDb.clients || [];
            const suppliers = currentDb.suppliers || [];
            const materials = currentDb.materials || [];
            const schedule = currentDb.schedule || [];
            const purchaseOrders = currentDb.purchaseOrders || [];
            const materialRequests = currentDb.materialRequests || [];
            const supplierInvoices = currentDb.supplierInvoices || [];

            const totalPresupuesto = projects.reduce((s, p) => s + Number(p.presupuesto || 0), 0);
            const totalGastado = expenses.reduce((s, e) => s + Number(e.monto || 0), 0);
            const avancePromedio = projects.length > 0 
              ? Math.round(projects.reduce((s, p) => s + Number(p.avance ?? p.progreso ?? 0), 0) / projects.length) 
              : 0;

            const obrasConRetraso = schedule.filter(s => s.estado === 'Retrasada').map(s => s.fase || s.etapa);
            const materialesBajoStock = materials.filter(m => Number(m.stockActual ?? m.stock ?? 0) <= Number(m.stockMinimo ?? 0)).map(m => m.nombre);

            const info = {
              ok: true,
              empresa: {
                nombre: 'CONSTRUCTA S.A.',
                cedulaJuridica: '3-101-789456',
                pais: 'Costa Rica',
                moneda: 'CRC / USD',
                tipo: 'Constructora y Desarrolladora de Infraestructura',
                contacto: 'contacto@constructa.cr'
              },
              metricas: {
                totalProyectos: projects.length,
                proyectosActivos: projects.filter(p => (p.estado || '').toLowerCase().includes('ejecución') || (p.estado || '').toLowerCase().includes('desarrollo')).length,
                avancePromedio,
                presupuestoTotal: totalPresupuesto,
                gastoTotal: totalGastado,
                saldoDisponible: totalPresupuesto - totalGastado,
                porcentajeEjecucion: totalPresupuesto > 0 ? Number(((totalGastado / totalPresupuesto) * 100).toFixed(1)) : 0
              },
              proyectos: projects.map(p => ({
                id: p.id,
                nombre: p.nombre,
                estado: p.estado,
                avance: p.avance ?? p.progreso ?? 0,
                presupuesto: p.presupuesto,
                cliente: p.cliente
              })),
              clientes: clients.map(c => ({ id: c.id, nombre: c.nombre, email: c.email })),
              proveedores: suppliers.map(s => ({ id: s.id, nombre: s.nombre, categoria: s.categoria })),
              operaciones: {
                totalEmpleados: employees.length,
                ordenesCompra: purchaseOrders.length,
                solicitudesMateriales: materialRequests.length,
                facturasProveedores: supplierInvoices.length
              },
              alertas: {
                obrasConRetraso: [...new Set(obrasConRetraso)],
                materialesBajoStock: [...new Set(materialesBajoStock)]
              },
              timestamp: new Date().toISOString()
            };

            return sendJson(200, info);
          } catch (err) {
            return sendJson(500, { ok: false, error: 'Error al consultar información de CONSTRUCTA: ' + err.message });
          }
        }

        // Endpoint para verificar estado de configuración de IA y n8n sin exponer credenciales
        if (req.url === '/api/ai/status' && req.method === 'GET') {
          let n8nOnline = false;
          try {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 1200);
            const n8nRes = await fetch('http://localhost:5678/healthz', { signal: ctrl.signal });
            clearTimeout(t);
            n8nOnline = n8nRes.ok;
          } catch (_) {}

          const key = getGeminiApiKey();
          return sendJson(200, {
            ok: true,
            n8nConnected: n8nOnline,
            n8nEndpoint: 'http://localhost:5678/webhook/constructa-ai',
            configured: Boolean(key && key.length > 10),
            provider: n8nOnline ? 'n8n Workflow + Gemini AI' : 'Sin Conexión n8n',
            model: 'gemini-3.5-flash-lite',
            status: n8nOnline ? 'IA CONECTADA' : 'IA NO DISPONIBLE'
          });
        }

        // Endpoint de Operación CONSTRUCTA IA - Enrutamiento directo y real a N8N Webhook
        if (req.url === '/api/ai/operation' && req.method === 'POST') {
          const startTime = Date.now();
          return parseJsonBody()
            .then(async (body) => {
              const { question, role, projectId, projectName, context } = body;
              if (!question || !question.trim()) {
                return sendJson(400, { ok: false, error: 'La pregunta no puede estar vacía.' });
              }

              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 35000);

                const n8nRes = await fetch('http://localhost:5678/webhook/constructa-ai', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ question, role, projectId, projectName, context }),
                  signal: controller.signal
                });
                clearTimeout(timeoutId);

                const durationMs = Date.now() - startTime;

                if (!n8nRes.ok) {
                  const errText = await n8nRes.text().catch(() => '');
                  return sendJson(200, {
                    ok: false,
                    success: false,
                    isRealAI: false,
                    httpStatus: n8nRes.status,
                    error: `N8N webhook respondió con código ${n8nRes.status}: ${errText.slice(0, 120)}`,
                    durationMs
                  });
                }

                const data = await n8nRes.json();
                return sendJson(200, {
                  ok: Boolean(data.success),
                  success: Boolean(data.success),
                  isRealAI: true,
                  provider: 'n8n (Gemini AI Real)',
                  answer: data.answer || '',
                  text: data.answer || '',
                  projectId: data.projectId || projectId || null,
                  projectName: data.projectName || projectName || null,
                  analysisType: data.analysisType || 'GENERAL',
                  risks: data.risks || [],
                  recommendations: data.recommendations || [],
                  timestamp: data.timestamp || new Date().toISOString(),
                  durationMs
                });
              } catch (err) {
                const durationMs = Date.now() - startTime;
                return sendJson(200, {
                  ok: false,
                  success: false,
                  isRealAI: false,
                  error: err.name === 'AbortError' 
                    ? 'Tiempo de espera agotado al conectar con el webhook de N8N.' 
                    : 'N8N no responde en http://localhost:5678/webhook/constructa-ai. Verifique que el servicio n8n esté activo.',
                  technicalCause: {
                    reason: err.name === 'AbortError' ? 'TIMEOUT' : 'CONNECTION_ERROR',
                    message: err.message,
                    durationMs
                  }
                });
              }
            })
            .catch((err) => sendJson(400, { ok: false, error: 'Petición inválida: ' + err.message }));
        }

        // Endpoint seguro para Gemini AI - La API Key reside únicamente en el servidor
        if (req.url === '/api/ai/analyze' && req.method === 'POST') {
          const startTime = Date.now();
          parseJsonBody()
            .then(async (body) => {
              const geminiKey = getGeminiApiKey();
              const { prompt, systemPrompt } = body;

              if (!geminiKey || !geminiKey.trim()) {
                console.log('[AI Server] GEMINI_API_KEY no configurada.');
                return sendJson(200, {
                  ok: false,
                  noKey: true,
                  error: 'El servicio de IA generativa no está configurado (falta GEMINI_API_KEY en .env).',
                  technicalCause: {
                    reason: 'NO_API_KEY',
                    durationMs: Date.now() - startTime
                  }
                });
              }

              try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey.trim()}`;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 20000);

                const response = await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  signal: controller.signal,
                  body: JSON.stringify({
                    system_instruction: {
                      parts: [{ text: systemPrompt || 'Eres el Analista de IA Corporativo de CONSTRUCTA.' }]
                    },
                    contents: [
                      {
                        parts: [{ text: prompt || 'Analiza la situación actual de las obras.' }]
                      }
                    ],
                    generationConfig: {
                      temperature: 0.2,
                      maxOutputTokens: 1500
                    }
                  })
                });
                clearTimeout(timeoutId);

                const durationMs = Date.now() - startTime;

                if (!response.ok) {
                  const errText = await response.text().catch(() => '');
                  console.error(`[AI Server] HTTP error ${response.status}: ${errText.slice(0, 100)}`);
                  return sendJson(200, {
                    ok: false,
                    httpStatus: response.status,
                    error: response.status === 429 ? 'Límite de cuota excedido en el proveedor de IA. Intente en unos momentos.' : 'El análisis de IA no está disponible en este momento.',
                    technicalCause: {
                      reason: 'HTTP_ERROR',
                      status: response.status,
                      durationMs
                    }
                  });
                }

                const data = await response.json();
                const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!generatedText) {
                  return sendJson(200, {
                    ok: false,
                    error: 'El modelo no devolvió una respuesta válida.',
                    technicalCause: {
                      reason: 'EMPTY_RESPONSE',
                      durationMs
                    }
                  });
                }

                return sendJson(200, {
                  ok: true,
                  text: generatedText.trim(),
                  provider: 'Google Gemini',
                  model: 'gemini-3.5-flash-lite',
                  isRealGemini: true,
                  durationMs
                });
              } catch (aiErr) {
                const durationMs = Date.now() - startTime;
                console.error('[AI Server] Exception:', aiErr.name, aiErr.message);
                return sendJson(200, {
                  ok: false,
                  error: aiErr.name === 'AbortError' ? 'Tiempo de espera agotado al conectar con el servicio de IA.' : 'El análisis no está disponible en este momento.',
                  technicalCause: {
                    reason: aiErr.name === 'AbortError' ? 'TIMEOUT' : 'EXCEPTION',
                    message: aiErr.message,
                    durationMs
                  }
                });
              }
            })
            .catch(() => sendJson(400, { ok: false, error: 'Petición inválida.' }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), dbApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false,
    watch: {
      ignored: ['**/src/data/db.json'],
    },
  },
});
