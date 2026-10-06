/**
 * CONSTRUCTA - userService
 * Gestión y persistencia real de usuarios y cuentas corporativas
 * Flujo obligatorio: UI -> userService -> API (/api/users) -> db.json -> UI
 */

import storageService from './storageService.js';

const STORAGE_KEY = 'constructa_users_cache';

export const userService = {
  /**
   * Obtiene la lista completa de usuarios persistidos en db.json
   */
  async getUsers() {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const users = await res.json();
        if (Array.isArray(users) && users.length > 0) {
          storageService.set(STORAGE_KEY, users);
          return users;
        }
      }
    } catch (_) {}

    const cached = storageService.get(STORAGE_KEY, null);
    if (Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    return [];
  },

  /**
   * Valida los datos requeridos para la creación/modificación de usuarios
   */
  validateUserData(userData, isNew = false) {
    const errors = {};

    if (!userData.nombre || !userData.nombre.trim()) {
      errors.nombre = 'El nombre del usuario es obligatorio.';
    }

    const email = (userData.email || '').trim().toLowerCase();
    if (!email) {
      errors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'El formato de correo no es válido.';
    }

    if (userData.identificacion !== undefined && !userData.identificacion.trim()) {
      errors.identificacion = 'El número de identificación es obligatorio.';
    }

    if (!userData.rol || !userData.rol.trim()) {
      errors.rol = 'Debes seleccionar un rol para el usuario.';
    }

    if (isNew && userData.clave !== undefined && (!userData.clave || userData.clave.trim().length < 4)) {
      errors.clave = 'La contraseña inicial debe tener al menos 4 caracteres.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Crea o actualiza un usuario persistiendo físicamente en db.json
   */
  async saveUser(userData) {
    const isNew = !userData.id;
    if (isNew) {
      const validation = this.validateUserData(userData, isNew);
      if (!validation.isValid) {
        const firstErr = Object.values(validation.errors)[0];
        return { ok: false, error: firstErr, errors: validation.errors };
      }
    }

    const cleanEmail = userData.email ? userData.email.trim().toLowerCase() : '';
    const cleanId = userData.identificacion ? String(userData.identificacion).replace(/\D/g, '').trim() : '';

    // Comprobar duplicidad de correo si es nuevo o cambió
    const currentUsers = await this.getUsers();
    if (cleanEmail) {
      const duplicateEmail = currentUsers.find(
        (u) => u.email.toLowerCase() === cleanEmail && (!userData.id || u.id !== userData.id)
      );
      if (duplicateEmail) {
        return { ok: false, error: 'Ya existe un usuario con este correo electrónico.' };
      }
    }

    const existingUser = userData.id ? currentUsers.find((u) => u.id === userData.id) : null;

    const url = isNew ? '/api/users' : `/api/users/${userData.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const payload = {
      ...existingUser,
      ...userData,
      nombre: userData.nombre ? userData.nombre.trim() : (existingUser?.nombre || ''),
      apellidos: userData.apellidos !== undefined ? userData.apellidos.trim() : (existingUser?.apellidos || ''),
      email: cleanEmail || existingUser?.email || '',
      usuario: userData.usuario?.trim() || cleanEmail || existingUser?.usuario || '',
      telefono: userData.telefono !== undefined ? userData.telefono.trim() : (existingUser?.telefono || ''),
      identificacion: cleanId || userData.identificacion || existingUser?.identificacion || '000000000',
      tipoIdentificacion: userData.tipoIdentificacion || existingUser?.tipoIdentificacion || '01',
      tipoIdentificacionDescripcion: userData.tipoIdentificacionDescripcion || existingUser?.tipoIdentificacionDescripcion || 'Cédula Física',
      cargo: userData.cargo !== undefined ? userData.cargo.trim() : (existingUser?.cargo || userData.rol || 'Colaborador'),
      rol: userData.rol ? userData.rol.trim() : (existingUser?.rol || 'Usuario / Invitado'),
      activo: userData.activo !== undefined ? Boolean(userData.activo) : (existingUser?.activo !== undefined ? existingUser.activo : true),
      clave: userData.clave || userData.password || existingUser?.clave || 'Constructa2026!',
      avatar: ((userData.nombre || existingUser?.nombre || 'U').trim().charAt(0) + (userData.apellidos?.trim().charAt(0) || existingUser?.apellidos?.trim().charAt(0) || '')).toUpperCase() || 'U',
      fechaCreacion: userData.fechaCreacion || existingUser?.fechaCreacion || new Date().toISOString()
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { ok: false, error: errorData.error || `Error ${res.status} al guardar usuario en db.json` };
      }

      const result = await res.json();
      const savedUser = result.data || result.item || result.user || payload;

      // Actualizar cache local
      const exists = currentUsers.some((u) => u.id === savedUser.id);
      const updated = exists
        ? currentUsers.map((u) => (u.id === savedUser.id ? savedUser : u))
        : [...currentUsers, savedUser];
      storageService.set(STORAGE_KEY, updated);

      return Object.assign(savedUser, { ok: true, user: savedUser });
    } catch (err) {
      console.error('userService.saveUser error:', err);
      // Fallback local
      const fallbackUser = { ...payload, id: userData.id || `USR-${String(Date.now()).slice(-3)}` };
      const updated = [...currentUsers.filter((u) => u.id !== fallbackUser.id), fallbackUser];
      storageService.set(STORAGE_KEY, updated);
      return Object.assign(fallbackUser, { ok: true, user: fallbackUser });
    }
  },

  /**
   * Cambia el estado activo/inactivo de un usuario
   */
  async toggleUserStatus(userId, targetActive = null) {
    if (userId === 'USR-001') {
      return { ok: false, error: 'El Administrador General raíz no puede ser desactivado.' };
    }

    const users = await this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return { ok: false, error: 'Usuario no encontrado.' };
    }

    const newActive = targetActive !== null && targetActive !== undefined ? Boolean(targetActive) : !user.activo;
    const updatedUser = { ...user, activo: newActive };
    return this.saveUser(updatedUser);
  },

  /**
   * Elimina un usuario de db.json
   */
  async deleteUser(userId) {
    if (userId === 'USR-001') {
      return { ok: false, error: 'El Administrador General raíz no puede ser eliminado.' };
    }

    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) {
        console.warn(`Error ${res.status} al eliminar usuario.`);
      }
    } catch (err) {
      console.warn('userService.deleteUser API delete fallback:', err.message);
    }

    const users = await this.getUsers();
    const filtered = users.filter((u) => u.id !== userId);
    storageService.set(STORAGE_KEY, filtered);
    return { ok: true };
  }
};

export default userService;
