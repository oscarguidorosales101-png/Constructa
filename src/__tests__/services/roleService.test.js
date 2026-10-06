import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { roleService } from '../../services/roleService.js';

describe('roleService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Obtiene los roles base del sistema (7 roles)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 'ROL-001', nombre: 'Administrador General', esSistema: true },
        { id: 'ROL-002', nombre: 'Gerente de Construcción', esSistema: true },
        { id: 'ROL-003', nombre: 'Recursos Humanos / Reclutamiento', esSistema: true },
        { id: 'ROL-004', nombre: 'Entrevistador', esSistema: true },
        { id: 'ROL-005', nombre: 'Cliente', esSistema: true },
        { id: 'ROL-006', nombre: 'Proveedor', esSistema: true },
        { id: 'ROL-007', nombre: 'Usuario / Invitado', esSistema: true }
      ]
    });

    const roles = await roleService.getRoles();
    expect(roles.length).toBeGreaterThanOrEqual(7);
    expect(roles.map((r) => r.nombre)).toContain('Administrador General');
    expect(roles.map((r) => r.nombre)).toContain('Entrevistador');
  });

  it('2. Valida creación de rol dinámico (nombre y permisos obligatorios)', () => {
    const invalid = roleService.validateRoleData({
      nombre: '',
      permisos: []
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.nombre).toBeDefined();
    expect(invalid.errors.permisos).toBeDefined();
  });

  it('3. Crea un rol dinámico persistido (e.g. Supervisor de Obra)', async () => {
    const mockNewRole = {
      id: 'ROL-008',
      nombre: 'Supervisor de Obra',
      descripcion: 'Inspección de avance físico y bitácora',
      esSistema: false,
      permisos: ['proyectos', 'avances', 'materiales']
    };

    global.fetch = vi.fn().mockImplementation((url, opts) => {
      if (opts?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: async () => ({ ok: true, data: mockNewRole })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => []
      });
    });

    const res = await roleService.saveRole({
      nombre: 'Supervisor de Obra',
      descripcion: 'Inspección de avance físico y bitácora',
      permisos: ['proyectos', 'avances', 'materiales']
    });

    expect(res.ok).toBe(true);
    expect(res.role.id).toBe('ROL-008');
    expect(res.role.esSistema).toBe(false);
    expect(res.role.permisos).toContain('proyectos');
  });

  it('4. Impide la eliminación de roles base del sistema', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'ROL-001', nombre: 'Administrador General', esSistema: true }]
    });

    const res = await roleService.deleteRole('ROL-001');
    expect(res.ok).toBe(false);
    expect(res.error).toContain('rol base del sistema');
  });
});
