import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiForecastService } from '../../services/aiForecastService.js';

describe('aiForecastService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockOperationalData = {
    projects: [
      { id: 'PRJ-001', nombre: 'Torre Aurora', estado: 'En Ejecución', avance: 65, presupuesto: 1200000 },
      { id: 'PRJ-002', nombre: 'Parque Industrial Sur', estado: 'En Ejecución', avance: 40, presupuesto: 850000 }
    ],
    expenses: [
      { id: 'GAS-001', proyectoId: 'PRJ-001', monto: 750000, categoria: 'Materiales' },
      { id: 'GAS-002', proyectoId: 'PRJ-002', monto: 400000, categoria: 'Mano de obra' }
    ],
    materials: [
      { id: 'MAT-001', nombre: 'Cemento Gris 50kg', stockActual: 15, stockMinimo: 30, unidad: 'Sacos' },
      { id: 'MAT-002', nombre: 'Varilla Corrugada #4', stockActual: 100, stockMinimo: 50, unidad: 'Piezas' }
    ],
    schedule: [
      { id: 'SCH-001', proyectoId: 'PRJ-001', actividad: 'Cimentación', estado: 'Completado', progreso: 100 },
      { id: 'SCH-002', proyectoId: 'PRJ-001', actividad: 'Estructura', estado: 'En Proceso', progreso: 60 }
    ]
  };

  it('1. Construye indicadores cuantitativos exactos a partir de datos operacionales de CONSTRUCTA', () => {
    const summary = aiForecastService.buildOperationalSummary(mockOperationalData);

    expect(summary.totalProyectos).toBe(2);
    expect(summary.proyectosActivos).toBe(2);
    expect(summary.presupuestoTotal).toBe(2050000);
    expect(summary.gastoTotal).toBe(1150000);
    expect(summary.materialesCriticos).toBe(1); // Cemento tiene stockActual 15 < stockMinimo 30
  });

  it('2. Envía solicitud a la API de análisis /api/ai/analyze y procesa la proyección', async () => {
    const mockAiResponse = {
      ok: true,
      data: {
        resumenEjecutivo: 'La cartera se encuentra con un 56.1% de presupuesto ejecutado.',
        desviacionesPresupuestarias: [
          { proyecto: 'Torre Aurora', riesgo: 'Moderado', recomendacion: 'Monitorear compras' }
        ],
        riesgosRetraso: [
          { proyecto: 'Torre Aurora', impacto: 'Bajo', probabilidad: 'Baja' }
        ],
        materialesCriticos: [
          { material: 'Cemento Gris 50kg', stockActual: 15, stockMinimo: 30 }
        ],
        tendencias: ['Aceleración en obras'],
        recomendacionesEstrategicas: ['Optimizar abastecimiento temprano']
      }
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAiResponse
    });

    const projection = await aiForecastService.generateProjection(mockOperationalData);

    expect(projection.ok).toBe(true);
    expect(projection.data.resumenEjecutivo).toBeDefined();
    expect(projection.data.desviacionesPresupuestarias.length).toBeGreaterThan(0);
  });

  it('3. Maneja fallas de conexión o API key no configurada devolviendo mensaje amigable', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ ok: false, error: 'GEMINI_API_KEY no configurada en el servidor' })
    });

    const projection = await aiForecastService.generateProjection(mockOperationalData);

    expect(projection.ok).toBe(false);
    expect(projection.error).toContain('no configurada');
  });
});
