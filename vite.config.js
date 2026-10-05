import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.resolve(__dirname, 'src/data/db.json');

function dbApiPlugin() {
  return {
    name: 'constructa-db-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
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
          users: { key: 'users', prefix: 'USR' }
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
                    email: newItem.email,
                    usuario: newItem.email,
                    clave: clientPassword,
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

        // Endpoint seguro para Gemini AI - La API Key reside únicamente en el servidor (process.env.GEMINI_API_KEY)
        if (req.url === '/api/ai/analyze' && req.method === 'POST') {
          parseJsonBody()
            .then(async (body) => {
              const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
              const { prompt, systemPrompt } = body;

              if (!geminiKey || !geminiKey.trim()) {
                return sendJson(200, {
                  ok: false,
                  noKey: true,
                  error: 'El análisis no está disponible en este momento.'
                });
              }

              try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`;
                const response = await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
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
                      temperature: 0.3,
                      maxOutputTokens: 1024
                    }
                  })
                });

                if (!response.ok) {
                  return sendJson(200, {
                    ok: false,
                    error: 'El análisis no está disponible en este momento.'
                  });
                }

                const data = await response.json();
                const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!generatedText) {
                  return sendJson(200, {
                    ok: false,
                    error: 'El análisis no está disponible en este momento.'
                  });
                }

                return sendJson(200, {
                  ok: true,
                  text: generatedText.trim(),
                  provider: 'Google Gemini'
                });
              } catch (_) {
                return sendJson(200, {
                  ok: false,
                  error: 'El análisis no está disponible en este momento.'
                });
              }
            })
            .catch(() => sendJson(400, { ok: false, error: 'El análisis no está disponible en este momento.' }));
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
