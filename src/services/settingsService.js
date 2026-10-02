/**
 * CONSTRUCTA - settingsService
 * Arquitectura: INTERFAZ -> settingsService -> PERSISTENCIA / API -> db.json
 * 
 * Gestiona de forma centralizada la configuración global de:
 * - Tema (Oscuro / Claro / Sistema)
 * - Tamaño de letra (Pequeña / Normal / Grande / Muy grande)
 * - Accesibilidad cromática / Daltonismo (Normal / Alto contraste / Protanopia / Deuteranopia / Tritanopia)
 * - Reducción de movimiento
 * - Preferencias de Voz (SpeechSynthesis)
 */

import storageService from './storageService.js';

const SETTINGS_STORAGE_KEY = 'constructa_global_settings';

export const DEFAULT_SETTINGS = {
  theme: 'dark', // 'dark' | 'light' | 'system'
  fontSize: 'normal', // 'small' | 'normal' | 'large' | 'xlarge'
  colorVision: 'normal', // 'normal' | 'high-contrast' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  reducedMotion: false,
  voice: {
    enabled: false,
    voiceURI: '',
    rate: 1,
    pitch: 1,
    volume: 1
  },
  updatedAt: new Date().toISOString()
};

export const settingsService = {
  /**
   * Inicializa la configuración global leyendo de persistencia remota o local
   */
  async init() {
    return this.fetchRemoteSettings();
  },

  /**
   * Obtiene la configuración actual
   */
  getSettings() {
    const local = storageService.get(SETTINGS_STORAGE_KEY, null);
    if (local) return { ...DEFAULT_SETTINGS, ...local };
    return { ...DEFAULT_SETTINGS };
  },

  /**
   * Carga configuración remota desde db.json si está disponible
   */
  async fetchRemoteSettings() {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.settings) {
          const merged = { ...DEFAULT_SETTINGS, ...data.settings };
          storageService.set(SETTINGS_STORAGE_KEY, merged);
          this.applySettings(merged);
          return merged;
        }
      }
    } catch (_) {}
    const current = this.getSettings();
    this.applySettings(current);
    return current;
  },

  /**
   * Guarda nueva configuración de manera persistente en db.json y storage local
   */
  async saveSettings(partialSettings) {
    const current = this.getSettings();
    const updated = {
      ...current,
      ...partialSettings,
      updatedAt: new Date().toISOString()
    };

    // 1. Guardar localmente para respuesta instantánea
    storageService.set(SETTINGS_STORAGE_KEY, updated);

    // 2. Aplicar inmediatamente al DOM
    this.applySettings(updated);

    // 3. Persistir hacia la API y db.json
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const data = await res.json();
        return { ok: true, settings: data.settings || updated };
      }
    } catch (_) {}

    return { ok: true, settings: updated };
  },

  /**
   * Aplica los atributos globales al elemento raíz <html> para variables CSS
   */
  applySettings(settings) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Tema (Oscuro / Claro / Sistema)
    let activeTheme = settings.theme || 'dark';
    if (activeTheme === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      activeTheme = prefersDark ? 'dark' : 'light';
    }
    root.setAttribute('data-theme', activeTheme);
    root.style.colorScheme = activeTheme;

    // 2. Tamaño de letra
    root.setAttribute('data-font-size', settings.fontSize || 'normal');

    // 3. Daltonismo y Accesibilidad Cromática
    root.setAttribute('data-color-vision', settings.colorVision || 'normal');

    // 4. Reducción de movimiento
    if (settings.reducedMotion) {
      root.setAttribute('data-reduced-motion', 'true');
    } else {
      root.removeAttribute('data-reduced-motion');
    }
  }
};

export default settingsService;
