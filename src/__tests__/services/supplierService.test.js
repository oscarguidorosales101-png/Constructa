import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supplierService } from '../../services/supplierService.js';

describe('supplierService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Valida campos obligatorios de proveedor', () => {
    const invalid = supplierService.validateSupplierData({
      nombre: '',
      email: 'invalido',
      categoria: ''
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.nombre).toBeDefined();
    expect(invalid.errors.email).toBeDefined();
  });

  it('2. Registra proveedor con datos validados de Hacienda en /api/suppliers', async () => {
    const mockSupplier = {
      id: 'PRV-004',
      nombre: 'ACEROS Y PERFILES S.A.',
      identificacion: '3101888999',
      tipoIdentificacion: 'Jurídica',
      email: 'ventas@aceros.cr',
      telefono: '2233-4455',
      categoria: 'Estructuras y Acero',
      estado: 'Activo'
    };

    global.fetch = vi.fn().mockImplementation((url, opts) => {
      if (opts?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: async () => ({ ok: true, data: mockSupplier })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [mockSupplier]
      });
    });

    const res = await supplierService.saveSupplier({
      nombre: 'ACEROS Y PERFILES S.A.',
      identificacion: '3101888999',
      tipoIdentificacion: 'Jurídica',
      email: 'ventas@aceros.cr',
      telefono: '2233-4455',
      categoria: 'Estructuras y Acero'
    });

    expect(res.ok).toBe(true);
    expect(res.supplier.id).toBe('PRV-004');
    expect(res.supplier.identificacion).toBe('3101888999');
    expect(res.supplier.tipoIdentificacion).toBe('Jurídica');
  });
});
