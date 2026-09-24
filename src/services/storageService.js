/**
 * Capa de persistencia local segura y organizada para CONSTRUCTA.
 * Los nombres técnicos y detalles de bajo nivel quedan encapsulados aquí.
 */

const STORAGE_PREFIX = 'constructa_app_data_v1_';

export const storageService = {
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch {
      return false;
    }
  },

  clearAll() {
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(k);
        }
      });
      return true;
    } catch {
      return false;
    }
  },
};

export default storageService;
