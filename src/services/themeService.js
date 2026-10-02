/**
 * CONSTRUCTA - themeService
 * Arquitectura: INTERFAZ -> themeService -> settingsService -> API -> db.json
 */

import settingsService from './settingsService.js';

export const themeService = {
  getTheme() {
    return settingsService.getSettings().theme || 'dark';
  },

  async setTheme(theme) {
    return settingsService.saveSettings({ theme });
  },

  async toggleTheme() {
    const current = this.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    await this.setTheme(next);
    return next;
  }
};

export default themeService;
