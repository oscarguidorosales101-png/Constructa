/**
 * CONSTRUCTA - clientService
 * Arquitectura: INTERFAZ -> clientService -> PERSISTENCIA / API -> db.json
 * 
 * Centraliza la validación, registro y consulta de cuentas de clientes
 * garantizando persistencia real en db.json y sincronización de estado.
 */

import storageService from './storageService.js';
import dataService from './dataService.js';

const STORAGE_KEYS = {
  CLIENTS: 'clientes',
  CLIENT_CONVERSATIONS: 'conversaciones_clientes',
};

export const clientService = {
  /**
   * Obtiene la lista oficial de clientes desde la capa de persistencia
   */
  async getClients() {
    try {
      const res = await fetch('/api/db');
      if (res.ok) {
        const db = await res.json();
        if (Array.isArray(db.clients)) {
          storageService.set(STORAGE_KEYS.CLIENTS, db.clients);
          return db.clients;
        }
      }
    } catch (_) {}
    return dataService.getClients();
  },

  /**
   * Valida exhaustivamente el payload de registro de cliente
   */
  validateRegistrationData(data) {
    const errors = {};

    if (!data.nombre || !data.nombre.trim()) {
      errors.nombre = 'El nombre completo o razón social es obligatorio.';
    }

    const email = (data.email || '').trim().toLowerCase();
    if (!email) {
      errors.email = 'El correo electrónico es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'El formato de correo no es válido.';
    }

    if (!data.password) {
      errors.password = 'La contraseña es obligatoria.';
    } else if (data.password.length < 8) {
      errors.password = 'La contraseña debe contener al menos 8 caracteres.';
    }

    if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Registra un nuevo cliente conectando con la API de persistencia y db.json
   */
  async registerClient(clientData) {
    // 1. Validación previa en capa de servicio
    const validation = this.validateRegistrationData(clientData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return {
        ok: false,
        error: firstError,
        errors: validation.errors,
        code: 'VALIDATION_ERROR'
      };
    }

    const cleanEmail = clientData.email.trim().toLowerCase();

    // 2. Comprobar duplicado en la capa de datos actual
    const existingLocal = (await this.getClients()).find(
      (c) => (c.email || '').toLowerCase() === cleanEmail || (c.aliasEmail || '').toLowerCase() === cleanEmail
    );
    if (existingLocal) {
      return {
        ok: false,
        error: 'Este correo ya está registrado.',
        code: 'DUPLICATE_EMAIL'
      };
    }

    // 3. Persistir hacia la API y db.json
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        if (response.status === 409 || result.code === 'DUPLICATE_EMAIL') {
          return {
            ok: false,
            error: 'Este correo ya está registrado.',
            code: 'DUPLICATE_EMAIL'
          };
        }
        return {
          ok: false,
          error: result.error || 'No se pudo completar el registro en el servidor.',
          code: result.code || 'SERVER_ERROR'
        };
      }

      const newClient = result.cliente;

      // 4. Sincronizar almacenamiento local y memoria de dataService
      const currentClients = dataService.getClients();
      if (!currentClients.some((c) => c.id === newClient.id || c.email === newClient.email)) {
        storageService.set(STORAGE_KEYS.CLIENTS, [...currentClients, newClient]);
      }

      // 5. Sembrar mensaje de bienvenida privado en Mesa de Ayuda
      this._seedWelcomeConversation(newClient);

      return {
        ok: true,
        cliente: newClient,
        message: 'Cliente registrado con éxito y persistido en db.json.'
      };
    } catch (networkErr) {
      // Fallback tolerante si el endpoint HTTP no responde (e.g. build estático / offline)
      try {
        const fallbackClient = dataService.saveClient(clientData);
        return {
          ok: true,
          cliente: fallbackClient,
          message: 'Cliente registrado en almacenamiento de contingencia.'
        };
      } catch (err) {
        const isDup = err.message && (err.message.includes('Ya existe') || err.message.includes('registrado'));
        return {
          ok: false,
          error: isDup ? 'Este correo ya está registrado.' : err.message || 'Error de red al registrar cliente.',
          code: isDup ? 'DUPLICATE_EMAIL' : 'NETWORK_ERROR'
        };
      }
    }
  },

  /**
   * Sembrar conversación de bienvenida privada
   */
  _seedWelcomeConversation(client) {
    try {
      const allConvs = dataService.getClientConversations ? dataService.getClientConversations() : [];
      const exists = allConvs.some((c) => c.clienteId === client.id && c.asunto === 'Bienvenido a CONSTRUCTA');
      if (exists) return;

      const welcomeConv = {
        id: `CONV-${Date.now().toString().slice(-4)}`,
        clienteId: client.id,
        clienteNombre: client.nombre,
        clienteEmail: client.email,
        proyectoId: null,
        proyectoNombre: 'Mesa de Ayuda y Soporte',
        solicitudId: null,
        asunto: 'Bienvenido a CONSTRUCTA',
        responsable: 'Equipo CONSTRUCTA',
        responsableRol: 'Administrador',
        estado: 'Abierta',
        fechaCreacion: client.fechaRegistro || new Date().toISOString().split('T')[0],
        ultimaActualizacion: `${client.fechaRegistro || new Date().toISOString().split('T')[0]} 09:00`,
        noLeidosCliente: 1,
        noLeidosAdmin: 0,
        mensajes: [
          {
            id: 'MSG-' + Date.now().toString().slice(-6),
            remitente: 'Soporte CONSTRUCTA',
            remitenteRol: 'Administrador',
            remitenteTipo: 'equipo',
            contenido:
              'Tu cuenta ya está activa. Desde tu portal podrás consultar tus proyectos, realizar solicitudes, compartir documentación y comunicarte con el equipo responsable de tu proyecto.\n\nEstamos disponibles para orientarte durante el proceso.',
            fecha: client.fechaRegistro || new Date().toISOString().split('T')[0],
            hora: '09:00',
            estado: 'Enviado'
          }
        ]
      };

      storageService.set(KEYS.CLIENT_CONVERSATIONS, [welcomeConv, ...allConvs]);
    } catch (_) {}
  },

  /**
   * Verificación de código de cuenta de cliente
   */
  async verifyClientAccount(email, code) {
    return dataService.verifyClientAccount(email, code);
  }
};

export default clientService;
