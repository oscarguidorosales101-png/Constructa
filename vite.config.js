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
        // Helper to parse JSON body
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

        if (req.url === '/api/db' && req.method === 'GET') {
          try {
            const dbData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
            return sendJson(200, dbData);
          } catch (err) {
            return sendJson(500, { ok: false, error: err.message });
          }
        }

        if (req.url === '/api/db' && req.method === 'POST') {
          parseJsonBody()
            .then((body) => {
              const currentDb = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
              const updatedDb = { ...currentDb, ...body };
              fs.writeFileSync(dbFilePath, JSON.stringify(updatedDb, null, 2), 'utf8');
              return sendJson(200, { ok: true, message: 'db.json actualizado correctamente' });
            })
            .catch((err) => sendJson(400, { ok: false, error: err.message }));
          return;
        }

        if (req.url === '/api/clients' && req.method === 'POST') {
          parseJsonBody()
            .then((clientData) => {
              const currentDb = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
              currentDb.clients = currentDb.clients || [];

              const cleanEmail = (clientData.email || '').trim().toLowerCase();
              if (!cleanEmail) {
                return sendJson(400, { ok: false, error: 'El correo electrónico es obligatorio.', code: 'VALIDATION_ERROR' });
              }

              const exists = currentDb.clients.some((c) => (c.email || '').toLowerCase() === cleanEmail || (c.aliasEmail || '').toLowerCase() === cleanEmail);
              if (exists) {
                return sendJson(409, {
                  ok: false,
                  error: 'Ya existe una cuenta asociada a este correo electrónico.',
                  code: 'DUPLICATE_EMAIL',
                });
              }

              const count = currentDb.clients.length + 1;
              const newId = `CLI-${String(count).padStart(3, '0')}`;
              const newClient = {
                id: newId,
                nombre: (clientData.nombre || '').trim(),
                empresa: (clientData.empresa || '').trim(),
                email: cleanEmail,
                telefono: (clientData.telefono || '').trim(),
                ciudad: (clientData.ciudad || '').trim() || 'Monterrey, N.L.',
                pais: clientData.pais || 'México',
                usuario: cleanEmail,
                clave: clientData.password || clientData.clave,
                rol: 'Cliente',
                avatar: ((clientData.nombre || 'CL').trim().slice(0, 2)).toUpperCase(),
                estadoVerificacion: 'Verificada',
                codigoVerificacion: clientData.codigoVerificacion || '749201',
                fechaRegistro: new Date().toISOString().split('T')[0],
                proyectosAsociados: clientData.proyectosAsociados || [],
              };

              currentDb.clients.push(newClient);
              fs.writeFileSync(dbFilePath, JSON.stringify(currentDb, null, 2), 'utf8');
              return sendJson(201, { ok: true, cliente: newClient });
            })
            .catch((err) => sendJson(400, { ok: false, error: err.message }));
          return;
        }

        if (req.url === '/api/settings' && (req.method === 'POST' || req.method === 'PUT')) {
          parseJsonBody()
            .then((settings) => {
              const currentDb = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
              currentDb.settings = { ...(currentDb.settings || {}), ...settings, updatedAt: new Date().toISOString() };
              fs.writeFileSync(dbFilePath, JSON.stringify(currentDb, null, 2), 'utf8');
              return sendJson(200, { ok: true, settings: currentDb.settings });
            })
            .catch((err) => sendJson(400, { ok: false, error: err.message }));
          return;
        }

        if (req.url === '/api/settings' && req.method === 'GET') {
          try {
            const currentDb = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
            return sendJson(200, { ok: true, settings: currentDb.settings || {} });
          } catch (err) {
            return sendJson(500, { ok: false, error: err.message });
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
