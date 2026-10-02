/**
 * CONSTRUCTA - aiService
 * Arquitectura: UI -> aiService -> Proveedor Configurado -> OpenAI / Gemini -> Respuesta -> UI
 * 
 * Cumplimiento estricto:
 * - NO inventa API keys.
 * - NO inventa credenciales.
 * - NO utiliza respuestas simuladas o hardcodeadas.
 * - Detecta qué proveedor está realmente configurado en el entorno.
 * - Soporta Google Gemini (1.5 Flash) y OpenAI (GPT-4o-mini).
 */

export const AI_ACTIONS = [
  { id: 'analizar', label: 'Analizar', promptPrefix: 'Realiza un análisis técnico y operativo exhaustivo del siguiente texto en el contexto de una empresa constructora moderna:' },
  { id: 'resumir', label: 'Resumir', promptPrefix: 'Genera un resumen ejecutivo, conciso y de alto impacto del siguiente texto enfocado a gerencia de proyectos de construcción:' },
  { id: 'explicar', label: 'Explicar', promptPrefix: 'Explica en detalle los conceptos clave y la aplicación práctica en obra del siguiente planteamiento:' },
  { id: 'ideas', label: 'Extraer ideas principales', promptPrefix: 'Extrae las ideas principales en una lista estructurada con viñetas y aplicaciones operativas claras a partir del siguiente texto:' }
];

export const CONSTRUCTION_SAMPLE_TEXT =
  'En una empresa de construcción, la inteligencia artificial (IA) optimiza la gestión administrativa, predice desviaciones de presupuesto y automatiza el control de avance en las obras';

export const aiConfig = {
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || ''
};

export const aiService = {
  CONSTRUCTION_SAMPLE_TEXT,

  /**
   * Consulta el estado estructurado de configuración de proveedores
   */
  getStatus() {
    const hasGemini = Boolean(aiConfig.geminiApiKey && aiConfig.geminiApiKey.trim());
    const hasOpenAI = Boolean(aiConfig.openaiApiKey && aiConfig.openaiApiKey.trim());
    return {
      gemini: { configured: hasGemini },
      openai: { configured: hasOpenAI },
      anyConfigured: hasGemini || hasOpenAI,
      activeProvider: hasGemini ? 'gemini' : hasOpenAI ? 'openai' : null
    };
  },

  /**
   * Alias de compatibilidad
   */
  getConfiguredProviders() {
    const status = this.getStatus();
    return {
      gemini: status.gemini.configured,
      openai: status.openai.configured,
      anyConfigured: status.anyConfigured
    };
  },

  /**
   * Interfaz universal para generación con prompt o text
   */
  async generate({ prompt, text, action = 'analizar', provider = null }) {
    const content = (prompt || text || '').trim();
    return this.generateResponse({ text: content, action, provider });
  },

  /**
   * Genera respuesta de IA llamando a la API real del proveedor seleccionado
   */
  async generateResponse({ text, action = 'analizar', provider = null }) {
    if (!text || !text.trim()) {
      return {
        ok: false,
        error: 'Por favor ingresa o carga un texto para procesar.',
        code: 'EMPTY_TEXT'
      };
    }

    const { gemini, openai } = this.getConfiguredProviders();

    // Seleccionar proveedor activo
    let targetProvider = provider;
    if (!targetProvider) {
      if (gemini) targetProvider = 'gemini';
      else if (openai) targetProvider = 'openai';
      else targetProvider = 'gemini'; // Default para diagnóstico
    }

    // Verificar si el proveedor cuenta con clave real
    if (targetProvider === 'gemini' && !gemini) {
      return {
        ok: false,
        error: 'El proveedor Google Gemini no está configurado. Agrega VITE_GEMINI_API_KEY en tu archivo .env.',
        code: 'GEMINI_NOT_CONFIGURED',
        provider: 'gemini'
      };
    }

    if (targetProvider === 'openai' && !openai) {
      return {
        ok: false,
        error: 'El proveedor OpenAI no está configurado. Agrega VITE_OPENAI_API_KEY en tu archivo .env.',
        code: 'OPENAI_NOT_CONFIGURED',
        provider: 'openai'
      };
    }

    const actionObj = AI_ACTIONS.find((a) => a.id === action) || AI_ACTIONS[0];
    const systemPrompt = 'Eres el Asistente de Inteligencia Artificial de CONSTRUCTA, una empresa líder en ingeniería y construcción. Responde de forma técnica, profesional, estructurada y en español.';
    const userPrompt = `${actionObj.promptPrefix}\n\n"${text.trim()}"`;

    if (targetProvider === 'gemini') {
      return this._callGeminiAPI(systemPrompt, userPrompt, action);
    } else {
      return this._callOpenAIAPI(systemPrompt, userPrompt, action);
    }
  },

  /**
   * Llamada a la API oficial de Google Gemini (gemini-1.5-flash)
   */
  async _callGeminiAPI(systemPrompt, userPrompt, action) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${aiConfig.geminiApiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              parts: [{ text: userPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error?.message || `Error HTTP ${response.status} de Gemini API`;
        return {
          ok: false,
          error: `No fue posible completar la solicitud con Gemini: ${message}`,
          code: 'API_ERROR',
          provider: 'gemini'
        };
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        return {
          ok: false,
          error: 'Gemini no devolvió contenido generado en la respuesta.',
          code: 'EMPTY_RESPONSE',
          provider: 'gemini'
        };
      }

      return {
        ok: true,
        text: generatedText.trim(),
        provider: 'Google Gemini (1.5 Flash)',
        action
      };
    } catch (networkError) {
      return {
        ok: false,
        error: `Error de red al conectar con Gemini API: ${networkError.message}`,
        code: 'NETWORK_ERROR',
        provider: 'gemini'
      };
    }
  },

  /**
   * Llamada a la API oficial de OpenAI (Chat Completions)
   */
  async _callOpenAIAPI(systemPrompt, userPrompt, action) {
    const url = 'https://api.openai.com/v1/chat/completions';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aiConfig.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.4,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error?.message || `Error HTTP ${response.status} de OpenAI API`;
        return {
          ok: false,
          error: `No fue posible completar la solicitud con OpenAI: ${message}`,
          code: 'API_ERROR',
          provider: 'openai'
        };
      }

      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content;

      if (!generatedText) {
        return {
          ok: false,
          error: 'OpenAI no devolvió texto en la respuesta.',
          code: 'EMPTY_RESPONSE',
          provider: 'openai'
        };
      }

      return {
        ok: true,
        text: generatedText.trim(),
        provider: 'OpenAI (GPT-4o-mini)',
        action
      };
    } catch (networkError) {
      return {
        ok: false,
        error: `Error de red al conectar con OpenAI API: ${networkError.message}`,
        code: 'NETWORK_ERROR',
        provider: 'openai'
      };
    }
  }
};

export default aiService;
