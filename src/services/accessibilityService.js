/**
 * CONSTRUCTA - accessibilityService
 * Arquitectura: Capacidades Nativas del Navegador (Web Speech API) + Persistencia de Configuración
 * 
 * Cumplimiento estricto:
 * - NO utiliza librerías externas para voz.
 * - Utiliza window.speechSynthesis y SpeechSynthesisUtterance de forma robusta.
 * - Prioriza voces en español (es-MX, es-ES, es-419).
 * - Soporta velocidades: 0.75x, 1x, 1.25x, 1.5x, 2x.
 * - Soporta lectura de selección de texto y lectura de elementos clicados/tocados con filtros inteligentes.
 * - Notifica cambios de estado reactivos a widgets y modales.
 */

import settingsService from './settingsService.js';

export const OFFICIAL_AI_CONSTRUCTION_TEXT =
  'En una empresa de construcción, la inteligencia artificial (IA) optimiza la gestión administrativa, predice desviaciones de presupuesto y automatiza el control de avance en las obras.';

export const SAMPLE_TEXT = OFFICIAL_AI_CONSTRUCTION_TEXT;

export const SPEECH_RATES = [0.75, 1, 1.25, 1.5, 2];

let currentUtterance = null;
let stateListeners = new Set();
let currentState = {
  isSpeaking: false,
  isPaused: false,
  currentText: '',
  sourceType: null // 'selection' | 'element' | 'sample' | 'custom'
};

function notifyState(partial) {
  currentState = { ...currentState, ...partial };
  stateListeners.forEach((listener) => {
    try {
      listener(currentState);
    } catch (_) {}
  });
}

export const accessibilityService = {
  SAMPLE_TEXT: OFFICIAL_AI_CONSTRUCTION_TEXT,
  OFFICIAL_AI_CONSTRUCTION_TEXT,
  SPEECH_RATES,

  /**
   * Suscribe a cambios en el estado de reproducción de voz
   */
  subscribe(listener) {
    stateListeners.add(listener);
    listener(currentState);
    return () => stateListeners.delete(listener);
  },

  /**
   * Obtiene el estado actual del lector de voz
   */
  getState() {
    return { ...currentState };
  },

  /**
   * Obtiene la lista real de voces provistas por el navegador ordenadas con prioridad al español
   */
  getAvailableVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [];
    }
    const rawVoices = window.speechSynthesis.getVoices() || [];

    const mapped = rawVoices.map((v) => {
      const lowerName = v.name.toLowerCase();
      let detectedGender = 'Estándar';

      // Detección fundamentada en nombres conocidos de voces TTS comunes
      if (
        lowerName.includes('female') ||
        lowerName.includes('mujer') ||
        lowerName.includes('sabina') ||
        lowerName.includes('helena') ||
        lowerName.includes('laura') ||
        lowerName.includes('monica') ||
        lowerName.includes('zira') ||
        lowerName.includes('lucia') ||
        lowerName.includes('paulina') ||
        lowerName.includes('hilda') ||
        lowerName.includes('mia')
      ) {
        detectedGender = 'Femenina';
      } else if (
        lowerName.includes('male') ||
        lowerName.includes('hombre') ||
        lowerName.includes('jorge') ||
        lowerName.includes('pablo') ||
        lowerName.includes('raul') ||
        lowerName.includes('david') ||
        lowerName.includes('alvaro') ||
        lowerName.includes('diego') ||
        lowerName.includes('carlos')
      ) {
        detectedGender = 'Masculina';
      }

      const isSpanish = (v.lang || '').toLowerCase().startsWith('es');
      const isMexican = (v.lang || '').toLowerCase().includes('es-mx') || lowerName.includes('mexico') || lowerName.includes('méxico');
      const isSpain = (v.lang || '').toLowerCase().includes('es-es') || lowerName.includes('spain') || lowerName.includes('españa');
      const isLatam = (v.lang || '').toLowerCase().includes('es-419') || lowerName.includes('latino') || lowerName.includes('latin');

      let priority = 100;
      if (isMexican) priority = 10;
      else if (isSpain) priority = 20;
      else if (isLatam) priority = 15;
      else if (isSpanish) priority = 30;

      return {
        voiceURI: v.voiceURI,
        name: v.name,
        lang: v.lang,
        default: v.default,
        gender: detectedGender,
        genderGuess: detectedGender,
        isSpanish,
        priority
      };
    });

    // Ordenar: primero las voces en español de mayor prioridad, luego el resto
    return mapped.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
  },

  /**
   * Alias de compatibilidad
   */
  getVoices() {
    return this.getAvailableVoices();
  },

  /**
   * Suscribe a eventos onvoiceschanged del sintetizador nativo
   */
  onVoicesChanged(callback) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return () => {};
    const handler = () => {
      callback(this.getAvailableVoices());
    };
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = handler;
    }
    return () => {
      if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged === handler) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  },

  /**
   * Limpia y normaliza texto para una locución natural y comprensible
   */
  cleanTextForSpeech(raw) {
    if (!raw || typeof raw !== 'string') return '';
    return raw
      .replace(/<[^>]*>/g, ' ') // Quitar etiquetas HTML
      .replace(/\{[^}]*\}/g, ' ') // Quitar JSON o bloques de código
      .replace(/\[\s*([!✓×i?])\s*\]/g, '$1') // Normalizar tags accesibles
      .replace(/https?:\/\/\S+/g, 'enlace web') // Simplificar URLs
      .replace(/[\r\n\t]+/g, ' ') // Espacios continuos
      .replace(/\s{2,}/g, ' ')
      .trim();
  },

  /**
   * Extrae texto legible humanamente de un elemento DOM sin leer código ni clases
   */
  extractReadableText(el) {
    if (!el || !(el instanceof HTMLElement)) return '';

    // Ignorar elementos técnicos o irrelevantes
    const tag = el.tagName.toLowerCase();
    if (['script', 'style', 'code', 'pre', 'svg', 'path', 'meta', 'link'].includes(tag)) {
      return '';
    }

    // Verificar si el elemento está oculto
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return '';
    }

    // Si tiene aria-label descriptivo y es un control interactivo
    if (el.getAttribute('aria-label') && (tag === 'button' || tag === 'a' || tag === 'input')) {
      return el.getAttribute('aria-label');
    }

    // Si es un input o textarea
    if (tag === 'input' || tag === 'textarea') {
      const placeholder = el.getAttribute('placeholder') || '';
      const val = el.value || '';
      return val ? `Campo de texto: ${val}` : placeholder ? `Campo: ${placeholder}` : 'Campo de texto';
    }

    // Si es un badge o estado
    if (el.classList.contains('badge') || el.classList.contains('status-badge') || el.classList.contains('symbol-tag')) {
      return `Estado: ${el.innerText.trim()}`;
    }

    // Clonar elemento y remover subelementos no deseados (como SVGs o scripts)
    const clone = el.cloneNode(true);
    clone.querySelectorAll('script, style, svg, .skip-link, [aria-hidden="true"]').forEach((node) => node.remove());

    const text = clone.innerText || clone.textContent || '';
    return this.cleanTextForSpeech(text);
  },

  /**
   * Reproduce texto utilizando la voz y velocidad configurada
   */
  speak(text, options = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      const err = new Error('SpeechSynthesis no está soportado en este navegador.');
      if (options.onError) options.onError(err);
      notifyState({ isSpeaking: false, isPaused: false });
      return;
    }

    const cleaned = this.cleanTextForSpeech(text);
    if (!cleaned) {
      if (options.onEmpty) options.onEmpty();
      return;
    }

    // Cancelar cualquier lectura previa para evitar superposición
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}

    const utterance = new SpeechSynthesisUtterance(cleaned);
    currentUtterance = utterance;

    // Configurar voz seleccionada
    const allVoices = window.speechSynthesis.getVoices() || [];
    const settings = settingsService.getSettings();
    const targetVoiceURI = options.voiceURI || settings.voice?.voiceURI;

    if (targetVoiceURI) {
      const matched = allVoices.find((v) => v.voiceURI === targetVoiceURI);
      if (matched) utterance.voice = matched;
    } else {
      // Priorizar voz en español preferida
      const sortedVoices = this.getAvailableVoices();
      const spanishVoice = sortedVoices.find((v) => v.isSpanish);
      if (spanishVoice) {
        const nativeMatch = allVoices.find((v) => v.voiceURI === spanishVoice.voiceURI);
        if (nativeMatch) utterance.voice = nativeMatch;
      }
    }

    // Ajustar velocidad (respetando los niveles 0.75x a 2x)
    const rate = Number(options.rate || settings.voice?.rate || 1);
    utterance.rate = Math.max(0.5, Math.min(2.5, rate));
    utterance.pitch = Number(options.pitch || settings.voice?.pitch || 1);
    utterance.volume = Number(options.volume || settings.voice?.volume || 1);

    utterance.onstart = () => {
      notifyState({
        isSpeaking: true,
        isPaused: false,
        currentText: cleaned,
        sourceType: options.sourceType || 'custom'
      });
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      currentUtterance = null;
      notifyState({ isSpeaking: false, isPaused: false, currentText: '' });
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      currentUtterance = null;
      notifyState({ isSpeaking: false, isPaused: false, currentText: '' });
      if (options.onError) options.onError(e);
    };

    utterance.onpause = () => {
      notifyState({ isPaused: true });
      if (options.onPause) options.onPause();
    };

    utterance.onresume = () => {
      notifyState({ isPaused: false });
      if (options.onResume) options.onResume();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[accessibilityService] Error al sintetizar voz:', err);
      notifyState({ isSpeaking: false, isPaused: false });
    }
  },

  /**
   * Lee la selección actual de texto en la pantalla
   */
  readSelection(options = {}) {
    if (typeof window === 'undefined') return false;
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';

    if (!selectedText) {
      this.speak('Por favor selecciona con el cursor o tocando la pantalla el texto que deseas escuchar.', {
        sourceType: 'selection',
        ...options
      });
      return false;
    }

    this.speak(selectedText, {
      sourceType: 'selection',
      ...options
    });
    return true;
  },

  /**
   * Lee un elemento DOM específico al hacer click o tocarlo
   */
  readElement(domElement, options = {}) {
    const text = this.extractReadableText(domElement);
    if (!text) return false;

    // Resaltar brevemente el elemento de forma accesible
    if (domElement && domElement.classList) {
      domElement.classList.add('speech-reading-highlight');
      setTimeout(() => {
        domElement.classList.remove('speech-reading-highlight');
      }, 2500);
    }

    this.speak(text, {
      sourceType: 'element',
      ...options
    });
    return true;
  },

  /**
   * Pausa la locución activa
   */
  pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      notifyState({ isPaused: true });
    }
  },

  /**
   * Reanuda la locución pausada
   */
  resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      notifyState({ isPaused: false });
    }
  },

  /**
   * Detiene inmediatamente cualquier locución
   */
  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
      currentUtterance = null;
      notifyState({ isSpeaking: false, isPaused: false, currentText: '' });
    }
  },

  /**
   * Consulta si hay locución activa
   */
  isSpeaking() {
    return Boolean(typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking);
  },

  /**
   * Consulta si la locución está pausada
   */
  isPaused() {
    return Boolean(typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.paused);
  }
};

export default accessibilityService;
