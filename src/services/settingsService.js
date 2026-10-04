/**
 * CONSTRUCTA - settingsService
 * Arquitectura: INTERFAZ -> settingsService -> PERSISTENCIA / API -> db.json
 * 
 * Gestiona de forma centralizada y persistente:
 * - Apariencia / Tema: 'dark' (Oscuro) | 'light' (Claro)
 * - Tamaño de letra: 'small' (Pequeño) | 'normal' (Normal) | 'large' (Grande) | 'xlarge' (Muy grande)
 * - Alto contraste: boolean (false | true)
 * - Daltonismo semántico: 'normal' | 'red-green' | 'green-red' | 'blue-yellow'
 * - Reducción de movimiento: boolean (false | true)
 * - Voz y lectura nativa: { enabled, voiceURI, rate, pitch, volume }
 */

import storageService from './storageService.js';

const SETTINGS_STORAGE_KEY = 'constructa_global_settings';

export const DEFAULT_SETTINGS = {
  theme: 'dark', // 'dark' | 'light'
  textSize: 'normal', // 'small' | 'normal' | 'large' | 'xlarge'
  fontSize: 'normal', // alias de compatibilidad
  highContrast: false, // boolean: true | false
  colorVision: 'normal', // 'normal' | 'red-green' | 'green-red' | 'blue-yellow'
  reducedMotion: false, // boolean: true | false
  voice: {
    enabled: false,
    voiceURI: '',
    rate: 1, // 0.75 | 1 | 1.25 | 1.5 | 2
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

    // Sincronizar alias si viene fontSize o textSize
    if (partialSettings.textSize && !partialSettings.fontSize) {
      updated.fontSize = partialSettings.textSize;
    } else if (partialSettings.fontSize && !partialSettings.textSize) {
      updated.textSize = partialSettings.fontSize;
    }

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

    // 1. Tema (Oscuro / Claro)
    let activeTheme = settings.theme || 'dark';
    if (activeTheme === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      activeTheme = prefersDark ? 'dark' : 'light';
    }
    root.setAttribute('data-theme', activeTheme);
    root.style.colorScheme = activeTheme;

    // 2. Tamaño de letra (small, normal, large, xlarge)
    const effectiveSize = settings.textSize || settings.fontSize || 'normal';
    root.setAttribute('data-text-size', effectiveSize);
    root.setAttribute('data-font-size', effectiveSize);

    // 3. Alto Contraste
    const isHighContrast = Boolean(settings.highContrast);
    root.setAttribute('data-high-contrast', isHighContrast ? 'true' : 'false');

    // 4. Daltonismo semántico
    let cv = settings.colorVision || 'normal';
    // Mapeo retrocompatible
    if (cv === 'protanopia') cv = 'red-green';
    if (cv === 'deuteranopia') cv = 'green-red';
    if (cv === 'tritanopia') cv = 'blue-yellow';
    root.setAttribute('data-color-vision', cv);

    // 5. Reducción de movimiento
    if (settings.reducedMotion) {
      root.setAttribute('data-reduced-motion', 'true');
    } else {
      root.removeAttribute('data-reduced-motion');
    }

    // 6. Asistencia de voz nativa activa
    if (settings.voice?.enabled) {
      root.setAttribute('data-voice-enabled', 'true');
    } else {
      root.removeAttribute('data-voice-enabled');
    }
  }
};

export default settingsService;
