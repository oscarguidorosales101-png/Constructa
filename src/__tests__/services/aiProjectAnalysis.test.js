import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiService, buildProjectContext, buildGlobalPortfolioContext } from '../../services/aiService.js';
import { hasPermission } from '../../utils/permissions.js';

describe('Pruebas Automatizadas de IA y Proyección por Obra (AI-001 a AI-012)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  const mockProjectA = {
    id: 'PRJ-001',
    codigo: 'OBR-2026-01',
    nombre: 'Torre Altavista Residencial',
    cliente: 'Inversiones del Valle',
    ubicacion: 'Av. Las Palmas 450',
    estado: 'En construcción',
    presupuesto: 4500000,
    avance: 63,
    fechaInicio: '2025-03-15',
    fechaFinEstimada: '2026-11-30'
  };

  const mockProjectB = {
    id: 'PRJ-002',
    codigo: 'OBR-2026-02',
    nombre: 'Complejo Corporativo Nexus',
    cliente: 'Grupo Financiero Capital',
    ubicacion: 'Boulevard Empresarial 1200',
    estado: 'En construcción',
    presupuesto: 7800000,
    avance: 78,
    fechaInicio: '2025-06-01',
    fechaFinEstimada: '2027-04-15'
  };

  const mockProjectC = {
    id: 'PRJ-003',
    codigo: 'OBR-2026-03',
    nombre: 'Puente Bicentenario & Vías de Acceso',
    cliente: 'Ministerio de Obras Públicas',
    ubicacion: 'Carretera Nacional Km 14',
    estado: 'En planeación',
    presupuesto: 15200000,
    avance: 15,
    fechaInicio: '2026-01-10',
    fechaFinEstimada: '2028-06-30'
  };

  const mockData = {
    projects: [mockProjectA, mockProjectB, mockProjectC],
    expenses: [
      { id: 'EXP-001', proyectoId: 'PRJ-001', monto: 3200000, categoria: 'Materiales' },
      { id: 'EXP-002', proyectoId: 'PRJ-001', monto: 1000000, categoria: 'Mano de obra' },
      { id: 'EXP-003', proyectoId: 'PRJ-002', monto: 4500000, categoria: 'Estructura' },
      { id: 'EXP-004', proyectoId: 'PRJ-003', monto: 1200000, categoria: 'Estudios de Suelo' }
    ],
    schedule: [
      { id: 'SCH-001', proyectoId: 'PRJ-001', fase: 'Cimentación', avance: 100, estado: 'Completada' },
      { id: 'SCH-002', proyectoId: 'PRJ-001', fase: 'Estructura', avance: 45, estado: 'Retrasada', riesgos: 'Falta de acero' },
      { id: 'SCH-003', proyectoId: 'PRJ-002', fase: 'Fachada', avance: 80, estado: 'En curso' },
      { id: 'SCH-004', proyectoId: 'PRJ-003', fase: 'Diseño Estructural', avance: 30, estado: 'En curso' }
    ],
    purchaseOrders: [
      { id: 'OC-001', proyectoId: 'PRJ-001', total: 450000, estado: 'En tránsito', proveedorNombre: 'Aceros del Norte', materiales: [{ materialNombre: 'Varilla #4', cantidad: 500 }] },
      { id: 'OC-002', proyectoId: 'PRJ-002', total: 200000, estado: 'Entregada', proveedorNombre: 'Concretos Pro', materiales: [{ materialNombre: 'Cemento Gris', cantidad: 300 }] },
      { id: 'OC-003', proyectoId: 'PRJ-003', total: 600000, estado: 'Pendiente', proveedorNombre: 'Vigas y Pilotes SA', materiales: [{ materialNombre: 'Pilotes', cantidad: 40 }] }
    ],
    materials: [
      { id: 'MAT-001', nombre: 'Varilla #4', stockActual: 10, stockMinimo: 50 },
      { id: 'MAT-002', nombre: 'Cemento Gris', stockActual: 80, stockMinimo: 40 }
    ],
    employees: [
      { id: 'EMP-001', nombre: 'Ing. Carlos Mendoza', puesto: 'Residente', proyectoId: 'PRJ-001' }
    ]
  };

  it('AI-001: La solicitud real llega al backend (/api/ai/analyze)', async () => {
    let capturedUrl = '';
    let capturedMethod = '';
    let capturedBody = null;

    global.fetch = vi.fn().mockImplementation(async (url, options) => {
      capturedUrl = url;
      capturedMethod = options?.method;
      capturedBody = JSON.parse(options?.body || '{}');
      return {
        ok: true,
        json: async () => ({
          ok: true,
          text: 'Análisis generado exitosamente por Google Gemini.',
          provider: 'Google Gemini',
          isRealGemini: true,
          durationMs: 450
        })
      };
    });

    const res = await aiService.analyzeProject({
      project: mockProjectA,
      data: mockData,
      question: '¿Qué riesgos presenta Torre Altavista?'
    });

    expect(capturedUrl).toBe('/api/ai/analyze');
    expect(capturedMethod).toBe('POST');
    expect(capturedBody.prompt).toContain('Torre Altavista');
    expect(res.ok).toBe(true);
  });

  it('AI-002: Gemini responde correctamente y se clasifica como AI_REAL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        text: 'Respuesta analítica de Gemini 1.5 Flash.',
        provider: 'Google Gemini (1.5 Flash)',
        model: 'gemini-1.5-flash',
        isRealGemini: true,
        durationMs: 820
      })
    });

    const res = await aiService.analyzeProject({
      project: mockProjectA,
      data: mockData
    });

    expect(res.ok).toBe(true);
    expect(res.engineType).toBe('AI_REAL');
    expect(res.isRealGemini).toBe(true);
    expect(res.text).toContain('Respuesta analítica de Gemini');
  });

  it('AI-003: Error de API no produce loading infinito y retorna resultado manejado', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ ok: false, error: 'Internal Server Error' })
    });

    const res = await aiService.analyzeProject({
      project: mockProjectA,
      data: mockData
    });

    // En caso de fallo externo, se activa el motor analítico de hechos o se devuelve estado estructurado
    expect(res).toBeDefined();
    expect(res.text).toBeDefined();
    expect(res.engineType).toBe('AI_LOCAL_FALLBACK');
    expect(res.isRealGemini).toBe(false);
  });

  it('AI-004: Reintento funciona de manera idempotente tras una falla inicial', async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Network failure');
      }
      return {
        ok: true,
        json: async () => ({
          ok: true,
          text: 'Recuperado tras reintento.',
          provider: 'Google Gemini',
          isRealGemini: true
        })
      };
    });

    // Intento 1: falla la conexión -> activa fallback
    const res1 = await aiService.analyzeProject({ project: mockProjectA, data: mockData });
    expect(res1.engineType).toBe('AI_LOCAL_FALLBACK');

    // Intento 2 (Reintento): tiene éxito con la IA
    const res2 = await aiService.analyzeProject({ project: mockProjectA, data: mockData });
    expect(res2.engineType).toBe('AI_REAL');
    expect(res2.text).toContain('Recuperado tras reintento');
  });

  it('AI-005: Pregunta general funciona sobre la cartera completa', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, noKey: true })
    });

    const res = await aiService.analyzeProject({
      project: null,
      data: mockData,
      question: '¿Cuál proyecto presenta mayor riesgo?'
    });

    expect(res.ok).toBe(true);
    expect(res.facts).toBeDefined();
    expect(res.facts.totalProjects).toBe(3);
    expect(res.facts.totalBudget).toBe(27500000);
  });

  it('AI-006: Pregunta sobre una obra específica utiliza datos aislados de esa obra', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, noKey: true })
    });

    const res = await aiService.analyzeProject({
      project: mockProjectA,
      data: mockData,
      question: '¿Está dentro del presupuesto?'
    });

    expect(res.ok).toBe(true);
    expect(res.facts.projectName).toBe('Torre Altavista Residencial');
    expect(res.facts.budget).toBe(4500000);
    expect(res.facts.totalSpent).toBe(4200000); // 3200000 + 1000000
    expect(res.facts.isOverBudget).toBe(true); // 4200000 / 4500000 = 93.3% > 90%
  });

  it('AI-007: Cambio de obra cambia el contexto y no mezcla información entre obras (Secuencia Obra A -> Obra B -> Obra C)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, noKey: true })
    });

    // 1. Obra A -> Pregunta sobre riesgos
    const resA = await aiService.analyzeProject({
      project: mockProjectA,
      data: mockData,
      question: '¿Qué riesgos tiene actualmente?'
    });
    expect(resA.facts.projectId).toBe('PRJ-001');
    expect(resA.facts.projectName).toBe('Torre Altavista Residencial');
    expect(resA.facts.delayedStages).toBe(1);
    expect(resA.text).toContain('Estructura');

    // 2. Obra B -> Pregunta sobre presupuesto
    const resB = await aiService.analyzeProject({
      project: mockProjectB,
      data: mockData,
      question: '¿Está dentro del presupuesto?'
    });
    expect(resB.facts.projectId).toBe('PRJ-002');
    expect(resB.facts.projectName).toBe('Complejo Corporativo Nexus');
    expect(resB.facts.budget).toBe(7800000);
    expect(resB.facts.totalSpent).toBe(4500000);
    expect(resB.facts.delayedStages).toBe(0);
    expect(resB.text).not.toContain('Torre Altavista');

    // 3. Obra C -> Pregunta sobre compras y materiales
    const resC = await aiService.analyzeProject({
      project: mockProjectC,
      data: mockData,
      question: '¿Qué materiales pueden convertirse en un problema?'
    });
    expect(resC.facts.projectId).toBe('PRJ-003');
    expect(resC.facts.projectName).toBe('Puente Bicentenario & Vías de Acceso');
    expect(resC.facts.budget).toBe(15200000);
    expect(resC.facts.totalSpent).toBe(1200000);
    expect(resC.facts.progressPct).toBe(15);
    expect(resC.text).not.toContain('Nexus');
    expect(resC.text).not.toContain('Altavista');
  });

  it('AI-008: Modificar datos de una obra actualiza el contexto enviado a IA dinámicamente', () => {
    // Escenario: El administrador registra un nuevo gasto para Proyecto A de $200,000
    const updatedData = {
      ...mockData,
      expenses: [
        ...mockData.expenses,
        { id: 'EXP-004', proyectoId: 'PRJ-001', monto: 200000, categoria: 'Acabados' }
      ]
    };

    const initialContext = buildProjectContext(mockProjectA, mockData);
    const updatedContext = buildProjectContext(mockProjectA, updatedData);

    expect(initialContext.totalSpent).toBe(4200000);
    expect(updatedContext.totalSpent).toBe(4400000);
    expect(updatedContext.budgetBalance).toBe(100000);
    expect(Number(updatedContext.consumptionPct)).toBeGreaterThan(Number(initialContext.consumptionPct));
  });

  it('AI-009: Cliente no puede acceder al módulo de IA ni Proyección al Futuro', () => {
    const isClientAllowed = hasPermission('Cliente', 'proyeccion-futuro');
    const isAdminAllowed = hasPermission('Administrador', 'proyeccion-futuro');
    const isGerenteAllowed = hasPermission('Gerente de Construcción', 'proyeccion-futuro');

    expect(isClientAllowed).toBe(false);
    expect(isGerenteAllowed).toBe(false);
    expect(isAdminAllowed).toBe(true);
  });

  it('AI-010: La API key nunca aparece en las respuestas de la IA ni en el objeto facts', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        text: 'Análisis seguro sin credenciales expuestas.',
        provider: 'Google Gemini',
        isRealGemini: true
      })
    });

    const res = await aiService.analyzeProject({ project: mockProjectA, data: mockData });
    const stringified = JSON.stringify(res);

    expect(stringified).not.toContain('AIza');
    expect(stringified).not.toContain('GEMINI_API_KEY');
    expect(stringified).not.toContain('apiKey');
  });

  it('AI-011: Separación estricta: El fallback nunca se presenta falsamente como Gemini', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, noKey: true })
    });

    const res = await aiService.analyzeProject({ project: mockProjectA, data: mockData });

    expect(res.engineType).toBe('AI_LOCAL_FALLBACK');
    expect(res.isRealGemini).toBe(false);
    expect(res.provider).not.toBe('Google Gemini');
    expect(res.provider).toContain('Motor Analítico CONSTRUCTA');
  });

  it('AI-012: Timeout funciona y maneja la interrupción sin congelamiento de UI', async () => {
    global.fetch = vi.fn().mockImplementation(async () => {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      throw err;
    });

    const res = await aiService.analyzeProject({ project: mockProjectA, data: mockData });

    expect(res.ok).toBe(false);
    expect(res.engineType).toBe('AI_ERROR');
    expect(res.technicalCause).toBe('TIMEOUT');
    expect(res.error).toBe('No fue posible obtener una respuesta de IA en este momento.');
  });
});
