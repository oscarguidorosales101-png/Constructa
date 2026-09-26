/**
 * Utilidades avanzadas de búsqueda para CONSTRUCTA.
 * Proporciona normalización de texto tolerante a acentos (diacríticos),
 * insensible a mayúsculas/minúsculas, soporte de coincidencias parciales,
 * búsqueda multi-palabra y manejo seguro de valores nulos, numéricos y anidados.
 */

/**
 * Normaliza un texto eliminando acentos/diacríticos, convirtiendo a minúsculas
 * y quitando espacios redundantes al inicio y al final.
 * 
 * @param {any} value - Valor a normalizar (texto, número, etc.)
 * @returns {string} Texto normalizado y limpio
 */
export const normalizeSearchText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

/**
 * Evalúa si una consulta de búsqueda coincide con un conjunto de campos.
 * Soporta búsqueda de términos múltiples separados por espacios (cada término debe encontrarse en algún campo).
 * 
 * @param {string} query - Término o frase buscada por el usuario
 * @param {Array<any>} fields - Lista de campos a inspeccionar (strings, números, arrays de textos)
 * @returns {boolean} True si coincide o si la búsqueda está vacía
 */
export const matchSearch = (query, fields = []) => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  // Separar en palabras clave para permitir búsquedas compuestas (ej. "Oscar Guido", "Acero 1/2")
  const words = normalizedQuery.split(/\s+/).filter(Boolean);

  // Aplanar campos y normalizarlos para comparación
  const flatFields = fields.flat(Infinity).filter(f => f !== null && f !== undefined);
  const normalizedFields = flatFields.map(f => normalizeSearchText(f));

  // Cada palabra clave de la búsqueda debe encontrarse en al menos uno de los campos
  return words.every(word =>
    normalizedFields.some(field => field.includes(word))
  );
};

export default {
  normalizeSearchText,
  matchSearch,
};
