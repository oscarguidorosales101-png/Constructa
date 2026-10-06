import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { userService } from '../../services/userService.js';

describe('userService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Valida campos obligatorios de usuario', () => {
    const invalid = userService.validateUserData({
      nombre: '',
      email: 'no-es-correo',
      rol: ''
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.nombre).toBeDefined();
    expect(invalid.errors.email).toBeDefined();
    expect(invalid.errors.rol).toBeDefined();
  });

  it('2. Valida correo electrónico con formato correcto', () => {
    const valid = userService.validateUserData({
      nombre: 'Carlos Monge',
      email: 'carlos@constructa.com',
      rol: 'Gerente de Construcción'
    });

    expect(valid.isValid).toBe(true);
    expect(Object.keys(valid.errors).length).toBe(0);
  });

  it('3. Crea usuario exitosamente comunicando con /api/users y db.json', async () => {
    const mockCreated = {
      id: 'USR-006',
      nombre: 'Elena Solís',
      email: 'elena@constructa.com',
      rol: 'Supervisor de Obra',
      identificacion: '112233445',
      tipoIdentificacion: 'Física',
      activo: true
    };

    global.fetch = vi.fn().mockImplementation((url, opts) => {
      if (opts?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: async () => ({ ok: true, data: mockCreated })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => []
      });
    });

    const res = await userService.saveUser({
      nombre: 'Elena Solís',
      email: 'elena@constructa.com',
      rol: 'Supervisor de Obra',
      identificacion: '112233445',
      tipoIdentificacion: 'Física'
    });

    expect(res.ok).toBe(true);
    expect(res.user.id).toBe('USR-006');
    expect(res.user.nombre).toBe('Elena Solís');
  });

  it('4. Detecta duplicado de correo electrónico al crear usuario', async () => {
    global.fetch = vi.fn().mockImplementation((url, opts) => {
      if (opts?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          status: 409,
          json: async () => ({ ok: false, error: 'Ya existe un usuario con este correo electrónico.' })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [{ id: 'USR-001', email: 'admin@constructa.com' }]
      });
    });

    const res = await userService.saveUser({
      nombre: 'Admin Falso',
      email: 'admin@constructa.com',
      rol: 'Administrador General'
    });

    expect(res.ok).toBe(false);
    expect(res.error).toContain('correo');
  });

  it('5. Alterna estado activo/inactivo (toggleStatus)', async () => {
    global.fetch = vi.fn().mockImplementation((url, opts) => {
      if (opts?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true, data: { id: 'USR-002', activo: false } })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [{ id: 'USR-002', activo: true }]
      });
    });

    const res = await userService.toggleUserStatus('USR-002', false);
    expect(res.ok).toBe(true);
    expect(res.user.activo).toBe(false);
  });

  it('6. Protege al Administrador General raíz (USR-001) contra desactivación y eliminación', async () => {
    const toggleRes = await userService.toggleUserStatus('USR-001', false);
    expect(toggleRes.ok).toBe(false);
    expect(toggleRes.error).toContain('no puede ser desactivado');

    const deleteRes = await userService.deleteUser('USR-001');
    expect(deleteRes.ok).toBe(false);
    expect(deleteRes.error).toContain('no puede ser eliminado');
  });
});
