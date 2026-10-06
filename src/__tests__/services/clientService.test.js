import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clientService } from '../../services/clientService.js';

describe('clientService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Valida payload de registro de cliente (nombre, email y contraseña segura)', () => {
    const invalid = clientService.validateRegistrationData({
      nombre: '',
      email: 'bad-email',
      password: '123'
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.nombre).toBeDefined();
    expect(invalid.errors.email).toBeDefined();
    expect(invalid.errors.password).toBeDefined();
  });

  it('2. Registra exitosamente un cliente conectando con /api/clients', async () => {
    const mockClient = {
      id: 'CLI-005',
      nombre: 'Desarrollos Urbanos S.A.',
      identificacion: '3101999888',
      tipoIdentificacion: 'Jurídica',
      email: 'contacto@desarrollos.cr',
      telefono: '2222-3344',
      rol: 'Cliente',
      codigoVerificacion: '749201',
      estadoVerificacion: 'Verificada'
    };

    global.fetch = vi.fn().mockImplementation((url, opts) => {
      if (opts?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: async () => ({ ok: true, data: mockClient, cliente: mockClient })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ clients: [] })
      });
    });

    const res = await clientService.registerClient({
      nombre: 'Desarrollos Urbanos S.A.',
      identificacion: '3101999888',
      tipoIdentificacion: 'Jurídica',
      email: 'contacto@desarrollos.cr',
      telefono: '2222-3344',
      password: 'PasswordSeguro2026!'
    });

    expect(res.ok).toBe(true);
    expect(res.cliente.id).toBe('CLI-005');
    expect(res.cliente.identificacion).toBe('3101999888');
  });

  it('3. Rechaza registro si el correo ya está registrado (HTTP 409 / DUPLICATE_EMAIL)', async () => {
    global.fetch = vi.fn().mockImplementation((url, opts) => {
      if (opts?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          status: 409,
          json: async () => ({
            ok: false,
            error: 'Ya existe una cuenta asociada a este correo electrónico.',
            code: 'DUPLICATE_EMAIL'
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ clients: [] })
      });
    });

    const res = await clientService.registerClient({
      nombre: 'Cliente Repetido',
      email: 'existente@constructa.com',
      password: 'PasswordSeguro2026!'
    });

    expect(res.ok).toBe(false);
    expect(res.error).toContain('registrado');
  });
});
