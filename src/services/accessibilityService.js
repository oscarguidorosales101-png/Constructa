/**
 * CONSTRUCTA - accessibilityService
 * Arquitectura: Capacidades Nativas del Navegador (Web Speech API) + Configuración Persistente
 * 
 * NO utiliza librerías externas.
 * Utiliza window.speechSynthesis y SpeechSynthesisUtterance de forma estricta.
 */

import settingsService from './settingsService.js';

export const OFFICIAL_AI_CONSTRUCTION_TEXT =
  'En una empresa de construcción, la inteligencia artificial (IA) optimiza la gestión administrativa, predice desviaciones de presupuesto y automatiza el control de avance en las obras';

export const SAMPLE_TEXT = OFFICIAL_AI_CONSTRUCTION_TEXT;

let currentUtterance = null;

export const accessibilityService = {
  SAMPLE_TEXT: OFFICIAL_AI_CONSTRUCTION_TEXT,
  OFFICIAL_AI_CONSTRUCTION_TEXT,

  /**
   * Obtiene la lista real de voces provistas por el navegador
   */
  getAvailableVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [];
    }
    const rawVoices = window.speechSynthesis.getVoices() || [];
    return rawVoices.map((v) => {
      const lowerName = v.name.toLowerCase();
      let detectedGender = 'Estándar';

      // Detección fundamentada en metadatos conocidos sin inventar voces
      if (
        lowerName.includes('female') ||
        lowerName.includes('mujer') ||
        lowerName.includes('sabina') ||
        lowerName.includes('helena') ||
        lowerName.includes('laura') ||
        lowerName.includes('monica') ||
        lowerName.includes('zira') ||
        lowerName.includes('lucia')
      ) {
        detectedGender = 'Mujer';
      } else if (
        lowerName.includes('male') ||
        lowerName.includes('hombre') ||
        lowerName.includes('jorge') ||
        lowerName.includes('pablo') ||
        lowerName.includes('raul') ||
        lowerName.includes('david') ||
        lowerName.includes('alvaro')
      ) {
        detectedGender = 'Hombre';
      }

      return {
        voiceURI: v.voiceURI,
        name: v.name,
        lang: v.lang,
        default: v.default,
        gender: detectedGender,
        genderGuess: detectedGender,
        isSpanish: v.lang.startsWith('es')
      };
    });
  },

  /**
   * Alias de compatibilidad
   */
  getVoices() {
    return this.getAvailableVoices();
  },

  /**
   * Suscribe a cambios en la lista de voces
   */
  onVoicesChanged(callback) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return () => {};
    window.speechSynthesis.onvoiceschanged = () => {
      callback(this.getAvailableVoices());
    };
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  },

  /**
   * Reproduce texto utilizando la voz configurada
   */
  speak(text, options = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (options.onError) options.onError(new Error('SpeechSynthesis no está soportado en este navegador.'));
      return;
    }

    // 1. Cancelar cualquier reproducción previa para evitar acumulación
    window.speechSynthesis.cancel();

    if (!text || !text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text.trim());
    currentUtterance = utterance;

    // Configurar voz seleccionada
    const allVoices = window.speechSynthesis.getVoices();
    const settings = settingsService.getSettings();
    const targetVoiceURI = options.voiceURI || settings.voice?.voiceURI;

    if (targetVoiceURI) {
      const matched = allVoices.find((v) => v.voiceURI === targetVoiceURI);
      if (matched) utterance.voice = matched;
    } else {
      // Priorizar voz en español por defecto
      const spanishVoice = allVoices.find((v) => v.lang.startsWith('es'));
      if (spanishVoice) utterance.voice = spanishVoice;
    }

    utterance.rate = options.rate || settings.voice?.rate || 1;
    utterance.pitch = options.pitch || settings.voice?.pitch || 1;
    utterance.volume = options.volume || settings.voice?.volume || 1;

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) {
      utterance.onend = () => {
        currentUtterance = null;
        options.onEnd();
      };
    }
    if (options.onError) {
      utterance.onerror = (e) => {
        currentUtterance = null;
        options.onError(e);
      };
    }
    if (options.onPause) utterance.onpause = options.onPause;
    if (options.onResume) utterance.onresume = options.onResume;

    window.speechSynthesis.speak(utterance);
  },

  /**
   * Pausa la lectura en curso
   */
  pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  },

  /**
   * Reanuda la lectura pausada
   */
  resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  },

  /**
   * Detiene inmediatamente la lectura
   */
  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    }
  },

  /**
   * Consulta si hay lectura activa
   */
  isSpeaking() {
    return Boolean(typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking);
  },

  /**
   * Consulta si la lectura está en pausa
   */
  isPaused() {
    return Boolean(typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.paused);
  }
};

export default accessibilityService;
