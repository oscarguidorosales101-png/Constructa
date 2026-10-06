import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { haciendaService } from '../../services/haciendaService.js';

describe('haciendaService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Valida formato de identificación (< 9 dígitos)', async () => {
    const result = await haciendaService.consultar('12345');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('9 y 12 dígitos');
  });

  it('2. Valida identificación vacía o nula', async () => {
    const result = await haciendaService.consultar('');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Ingrese un número de identificación');
  });

  it('3. Consulta exitosa con cédula física y extrae ÚNICAMENTE nombre y tipoIdentificacion', async () => {
    // Mock fetch de Hacienda
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        nombre: 'JUAN PEREZ GONZALEZ',
        tipoIdentificacion: '01',
        situacion: { estado: 'INSCRITO', moroso: 'NO' },
        actividades: [{ codigo: '41001', descripcion: 'Construcción' }],
        regimen: { codigo: '01', descripcion: 'Tradicional' }
      })
    });

    const result = await haciendaService.consultar('109870654');

    expect(result.ok).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.nombre).toBe('JUAN PEREZ GONZALEZ');
    expect(result.data.tipoIdentificacion).toBe('Física');
    expect(result.data.identificacion).toBe('109870654');

    // Comprobar estrictamente que NO se exportaron datos innecesarios de Hacienda a la entidad
    expect(result.data.situacion).toBeUndefined();
    expect(result.data.actividades).toBeUndefined();
    expect(result.data.regimen).toBeUndefined();
  });

  it('4. Consulta exitosa con cédula jurídica mapeando tipo Jurídica', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        nombre: 'CONSTRUCTORA DEL VALLE S.A.',
        tipoIdentificacion: '02'
      })
    });

    const result = await haciendaService.consultar('3101123456');

    expect(result.ok).toBe(true);
    expect(result.data.nombre).toBe('CONSTRUCTORA DEL VALLE S.A.');
    expect(result.data.tipoIdentificacion).toBe('Jurídica');
  });

  it('5. Maneja identificación inexistente (HTTP 404)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' })
    });

    const result = await haciendaService.consultar('199999999');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('no registrada en el padrón de Hacienda');
  });

  it('6. Maneja error de servidor HTTP 500', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal Server Error' })
    });

    const result = await haciendaService.consultar('109870654');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Servicio de Hacienda temporalmente inaccesible');
  });

  it('7. Maneja error de red o timeout', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network request failed'));

    const result = await haciendaService.consultar('109870654');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Error de conexión');
  });

  it('8. Maneja respuesta inesperada o sin nombre', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({})
    });

    const result = await haciendaService.consultar('109870654');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('No se obtuvo el nombre');
  });
});
