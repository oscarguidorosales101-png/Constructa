/**
 * CONSTRUCTA - haciendaService
 * Integración oficial con la API del Ministerio de Hacienda de Costa Rica
 * Endpoint: https://api.hacienda.go.cr/fe/ae?identificacion={id}
 * 
 * Cumplimiento arquitectónico:
 * - NO almacena ni propaga la respuesta cruda completa de Hacienda.
 * - Extrae exclusivamente: 'nombre' y 'tipoIdentificacion'.
 * - Normaliza códigos tributarios de Costa Rica (01 = Cédula Física, 02 = Cédula Jurídica, 03 = DIMEX, 04 = NITE).
 * - Maneja timeout, errores 404, 400 y fallas de red con mensajes claros y comprensibles.
 */

const HACIENDA_BASE_URL = 'https://api.hacienda.go.cr/fe/ae';

export const TIPO_IDENTIFICACION_MAP = {
  '01': 'Cédula Física',
  '02': 'Cédula Jurídica',
  '03': 'DIMEX',
  '04': 'NITE'
};

export const haciendaService = {
  /**
   * Consulta una identificación en el padrón tributario de Costa Rica
   * @param {string} rawId - Número de cédula o identificación (física, jurídica, DIMEX, NITE)
   * @returns {Promise<{ ok: boolean, data?: { identificacion: string, nombre: string, tipoIdentificacion: string }, error?: string, code?: string }>}
   */
  async consultar(rawId) {
    if (rawId === undefined || rawId === null || String(rawId).trim() === '') {
      return {
        ok: false,
        code: 'EMPTY_IDENTIFICACION',
        error: 'Ingrese un número de identificación para consultar.'
      };
    }

    const cleanId = String(rawId).replace(/\D/g, '').trim();

    if (cleanId.length < 9 || cleanId.length > 12) {
      return {
        ok: false,
        code: 'INVALID_LENGTH',
        error: 'Identificación debe tener entre 9 y 12 dígitos numéricos (ej. 109870654 o 3101123456).'
      };
    }

    // Intentar consulta directa a Hacienda (soporta CORS nativo con access-control-allow-origin: *) o proxy local
    const urls = [
      `${HACIENDA_BASE_URL}?identificacion=${encodeURIComponent(cleanId)}`,
      `/api/hacienda?identificacion=${encodeURIComponent(cleanId)}`
    ];

    let lastError = null;

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.status === 404) {
          return {
            ok: false,
            code: 'NOT_FOUND',
            error: 'Identificación no registrada en el padrón de Hacienda de Costa Rica.'
          };
        }

        if (response.status >= 500) {
          lastError = {
            ok: false,
            code: 'SERVER_ERROR',
            error: 'Servicio de Hacienda temporalmente inaccesible. Reintente en unos momentos.'
          };
          continue;
        }

        if (!response.ok) {
          lastError = {
            ok: false,
            code: 'HTTP_ERROR',
            error: `Hacienda respondió con código HTTP ${response.status}.`
          };
          continue;
        }

        const data = await response.json();
        if (!data || !data.nombre) {
          return {
            ok: false,
            code: 'NO_NAME',
            error: 'No se obtuvo el nombre de la persona o razón social en la respuesta de Hacienda.'
          };
        }

        const rawTipo = String(data.tipoIdentificacion || '01');
        const tipoDescripcion = TIPO_IDENTIFICACION_MAP[rawTipo] || 'Cédula Física';
        const tipoSimple = tipoDescripcion.includes('Jurídica') ? 'Jurídica' : 'Física';

        // Regla: Extraer y retornar ÚNICAMENTE nombre y tipo de identificación
        return {
          ok: true,
          data: {
            identificacion: cleanId,
            nombre: String(data.nombre).trim(),
            tipoIdentificacion: tipoSimple,
            tipoDescripcion: tipoDescripcion
          },
          identificacion: cleanId,
          nombre: String(data.nombre).trim(),
          tipoIdentificacion: tipoSimple,
          tipoDescripcion: tipoDescripcion
        };
      } catch (err) {
        if (err.name === 'AbortError') {
          lastError = {
            ok: false,
            code: 'TIMEOUT',
            error: 'Tiempo de espera agotado al consultar Hacienda. Por favor reintente.'
          };
        } else {
          lastError = {
            ok: false,
            code: 'NETWORK_ERROR',
            error: 'Error de conexión con el servicio de Hacienda. Verifique su red.'
          };
        }
      }
    }

    return lastError || {
      ok: false,
      code: 'SERVICE_UNAVAILABLE',
      error: 'Servicio de Hacienda temporalmente inaccesible. Puede ingresar el nombre manualmente.'
    };
  },

  async consultarIdentificacion(rawId) {
    return this.consultar(rawId);
  }
};

export default haciendaService;
