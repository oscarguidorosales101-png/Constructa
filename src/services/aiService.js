/**
 * CONSTRUCTA - aiService.js
 * Arquitectura Segura: UI -> aiService -> Proxy Backend (/api/ai/analyze) -> Google Gemini -> UI
 * 
 * Cumplimiento estricto:
 * 1. Cero API keys en frontend: La autenticación con Gemini se efectúa exclusivamente en el backend/proxy.
 * 2. Trazabilidad rigurosa: Diferenciación entre AI_REAL (Google Gemini) y AI_LOCAL_FALLBACK (Motor de Hechos).
 * 3. Contexto dinámico por obra: Aislamiento estricto de presupuestos, gastos, cronogramas, compras y personal.
 * 4. Memoria conversacional por proyecto y preguntas libres de operación corporativa.
 */

export const AI_ACTIONS = [
  { id: 'analizar', label: 'Analizar', promptPrefix: 'Realiza un análisis técnico y operativo exhaustivo del siguiente reporte en el contexto de una empresa constructora moderna:' },
  { id: 'resumir', label: 'Resumir', promptPrefix: 'Genera un resumen ejecutivo, conciso y de alto impacto del siguiente reporte enfocado a gerencia de proyectos de construcción:' },
  { id: 'explicar', label: 'Explicar', promptPrefix: 'Explica en detalle los conceptos clave y la aplicación práctica en obra del siguiente planteamiento:' },
  { id: 'ideas', label: 'Extraer ideas principales', promptPrefix: 'Extrae las ideas principales en una lista estructurada con viñetas y aplicaciones operativas claras a partir del siguiente reporte:' }
];

export const CONSTRUCTION_SAMPLE_TEXT =
  'En una empresa de construcción, la inteligencia artificial (IA) optimiza la gestión administrativa, predice desviaciones de presupuesto y automatiza el control de avance en las obras.';

/**
 * Extrae y sintetiza los hechos operativos reales de un proyecto específico
 */
export function buildProjectContext(project, data = {}) {
  if (!project) return null;

  const projectId = project.id;
  const projectName = project.nombre || 'Obra sin nombre';
  const projectCode = project.codigo || 'N/A';
  const clientName = project.cliente || 'No asignado';
  const location = project.ubicacion || 'No especificada';
  const status = project.estado || 'En planeación';
  const progressPct = Number(project.avance ?? project.progreso ?? 0);
  const budget = Number(project.presupuesto || 0);
  const startDate = project.fechaInicio || 'No definida';
  const endDate = project.fechaFinEstimada || project.fechaFin || 'No definida';
  const description = project.descripcion || '';

  // Gastos de este proyecto
  const allExpenses = data.expenses || [];
  const projectExpenses = allExpenses.filter((e) => e.proyectoId === projectId);
  const totalSpent = projectExpenses.reduce((sum, e) => sum + Number(e.monto || 0), 0);
  const budgetBalance = budget - totalSpent;
  const consumptionPct = budget > 0 ? ((totalSpent / budget) * 100).toFixed(1) : 0;
  const isOverBudget = budget > 0 && totalSpent > budget * 0.9;

  // Gastos por categoría
  const expensesByCategory = {};
  projectExpenses.forEach((e) => {
    const cat = e.categoria || 'Varios';
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(e.monto || 0);
  });

  // Fases de cronograma
  const allSchedule = data.schedule || [];
  const projectSchedule = allSchedule.filter((s) => s.proyectoId === projectId);
  const totalStages = projectSchedule.length;
  const completedStages = projectSchedule.filter((s) => s.estado === 'Completada').length;
  const inProgressStages = projectSchedule.filter((s) => s.estado === 'En curso' || s.estado === 'En progreso').length;
  const delayedStages = projectSchedule.filter((s) => s.estado === 'Retrasada').length;
  const stageNames = projectSchedule.map((s) => `${s.fase || s.etapa} (${s.avance || 0}% - ${s.estado || 'Pendiente'})`);
  const delayedStageDetails = projectSchedule
    .filter((s) => s.estado === 'Retrasada')
    .map((s) => `${s.fase || s.etapa} (Avance: ${s.avance || 0}%, Fin previsto: ${s.fechaFin || 'N/A'})`);
  const knownRisks = projectSchedule.filter((s) => s.riesgos).map((s) => `${s.fase || s.etapa}: ${s.riesgos}`);
  const deliverables = projectSchedule.map((s) => s.entregable || s.fase || s.etapa).filter(Boolean);

  // Órdenes de compra y suministros
  const allOrders = data.purchaseOrders || [];
  const projectOrders = allOrders.filter((o) => o.proyectoId === projectId);
  const totalOrdersAmount = projectOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const pendingDeliveryOrders = projectOrders.filter((o) => o.estado !== 'Entregada' && o.estado !== 'Cancelada');
  const materialsOrdered = [];
  projectOrders.forEach((o) => {
    (o.materiales || []).forEach((m) => {
      materialsOrdered.push(`${m.materialNombre || m.nombre || 'Material'} (${m.cantidad} uds) [${o.estado || 'Pendiente'}]`);
    });
  });

  // Proveedores vinculados
  const projectSupplierNames = [...new Set(projectOrders.map((o) => o.proveedorNombre || o.proveedor).filter(Boolean))];

  // Solicitudes de insumos y materiales críticos
  const allRequests = data.materialRequests || [];
  const projectRequests = allRequests.filter((r) => r.proyectoId === projectId);
  const urgentRequests = projectRequests.filter((r) => (r.urgencia || '').toLowerCase() === 'alta');

  const allMaterials = data.materials || [];
  const criticalMaterials = allMaterials.filter((m) => {
    const isUsedInOrders = projectOrders.some((o) =>
      (o.materiales || []).some((item) => item.materialId === m.id || item.materialNombre === m.nombre)
    );
    const isLow = Number(m.stockActual ?? m.stock ?? 0) <= Number(m.stockMinimo ?? 0);
    return isUsedInOrders && isLow;
  }).map((m) => `${m.nombre} (Stock: ${m.stockActual ?? m.stock ?? 0}, Mínimo: ${m.stockMinimo ?? 0})`);

  // Personal asignado
  const allEmployees = data.employees || [];
  const projectEmployees = allEmployees.filter((e) => e.proyectoId === projectId);
  const staffCount = projectEmployees.length;
  const staffRoles = projectEmployees.map((e) => `${e.nombre} (${e.puesto || 'Colaborador'})`);

  return {
    projectId,
    projectName,
    projectCode,
    clientName,
    location,
    status,
    progressPct,
    budget,
    totalSpent,
    budgetBalance,
    consumptionPct,
    isOverBudget,
    startDate,
    endDate,
    description,
    expensesByCategory,
    totalStages,
    completedStages,
    inProgressStages,
    delayedStages,
    delayedStageDetails,
    stageNames,
    knownRisks,
    deliverables,
    projectOrdersCount: projectOrders.length,
    totalOrdersAmount,
    pendingDeliveryOrdersCount: pendingDeliveryOrders.length,
    materialsOrdered,
    projectSupplierNames,
    criticalMaterials,
    urgentRequestsCount: urgentRequests.length,
    staffCount,
    staffRoles
  };
}


/**
 * Extrae y sintetiza los hechos operativos consolidados de toda la cartera de obras
 */
export function buildGlobalPortfolioContext(data = {}) {
  const projects = data.projects || [];
  const expenses = data.expenses || [];
  const materials = data.materials || [];
  const purchaseOrders = data.purchaseOrders || [];
  const schedule = data.schedule || [];

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.estado === 'En progreso' || p.estado === 'Activo' || p.estado === 'En construcción');
  const totalBudget = projects.reduce((acc, p) => acc + Number(p.presupuesto || 0), 0);
  const totalSpent = expenses.reduce((acc, e) => acc + Number(e.monto || 0), 0);
  const budgetConsumptionPct = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;
  const avgProgress = totalProjects > 0 ? (projects.reduce((acc, p) => acc + Number(p.avance || 0), 0) / totalProjects).toFixed(1) : 0;

  const overBudgetProjects = projects.filter((p) => {
    const pSpent = expenses.filter((e) => e.proyectoId === p.id).reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
    return p.presupuesto > 0 && pSpent > p.presupuesto * 0.9;
  });

  const delayedStages = schedule.filter((s) => s.estado === 'Retrasada');
  const delayedProjectIds = [...new Set(delayedStages.map((s) => s.proyectoId))];
  const delayedProjects = projects.filter((p) => delayedProjectIds.includes(p.id));

  const lowStockMaterials = materials.filter((m) => {
    const actual = Number(m.stockActual ?? m.stock ?? 0);
    const min = Number(m.stockMinimo ?? 0);
    return actual <= min;
  });

  return {
    totalProjects,
    activeProjectsCount: activeProjects.length,
    totalBudget,
    totalSpent,
    budgetConsumptionPct,
    avgProgress,
    overBudgetCount: overBudgetProjects.length,
    overBudgetNames: overBudgetProjects.map((p) => p.nombre),
    delayedCount: delayedProjects.length,
    delayedNames: delayedProjects.map((p) => p.nombre),
    lowStockCount: lowStockMaterials.length,
    lowStockNames: lowStockMaterials.map((m) => m.nombre),
    totalOrdersCount: purchaseOrders.length
  };
}


/**
 * Identifica si una pregunta menciona explícitamente una obra específica del catálogo
 */
export function resolveTargetProject(question = '', projects = [], defaultProject = null) {
  if (!question || !question.trim() || !Array.isArray(projects) || projects.length === 0) {
    return defaultProject;
  }
  const q = question.toLowerCase();

  for (const p of projects) {
    const pName = (p.nombre || '').toLowerCase();
    const pCode = (p.codigo || '').toLowerCase();
    const pId = (p.id || '').toLowerCase();

    // Coincidencia exacta de código o id
    if (pCode && q.includes(pCode)) return p;
    if (pId && q.includes(pId)) return p;
    if (pName && q.includes(pName)) return p;

    // Coincidencias por palabras distintivas (ej. "altavista", "nexus", "bicentenario")
    const words = pName.split(/\s+/).filter((w) => w.length > 4 && !['torre', 'complejo', 'residencial', 'puente', 'edificio', 'vías', 'acceso'].includes(w));
    if (words.some((w) => q.includes(w))) {
      return p;
    }
  }

  return defaultProject;
}

export const OUT_OF_SCOPE_RESPONSE =
  'Esta consulta está fuera del alcance del asistente de CONSTRUCTA. Puedo ayudarte únicamente con información relacionada con la operación, proyectos, clientes, proveedores, empleados, compras, obras, reportes y demás información disponible dentro de CONSTRUCTA.';

/**
 * Clasificador previo de relevancia para la operación de CONSTRUCTA
 */
export function classifyQuestionRelevance(question = '', projects = []) {
  if (!question || !question.trim()) {
    return { isOutOfScope: false, isHybrid: false, activeQuery: '', rawQuery: '' };
  }

  const raw = question.trim();
  const lower = raw.toLowerCase();

  // 1. Patrones de cultura general, personajes ficticios, chistes, memes, entretenimiento o ciencias ajenas
  const outOfScopePatterns = [
    /\bgoku\b/,
    /\bdragon\s*ball\b/,
    /\bvegeta\b/,
    /\banime\b/,
    /\bnaruto\b/,
    /\bbebita\s*vaca\b/,
    /\bvaca\s*lola\b/,
    /\bchiste\b/,
    /\bchistes\b/,
    /\bcanci[oó]n\b/,
    /\bcanciones\b/,
    /\bpoema\b/,
    /\bpoemas\b/,
    /\badivinanza\b/,
    /\bcuento\b/,
    /\breceta\b/,
    /\bf[ií]sica\b/,
    /\bqu[ií]mica\b/,
    /\bcu[aá]ntica\b/,
    /\bastronom[ií]a\b/,
    /\bplaneta\b/,
    /\buniverso\b/,
    /\bcapital\s+de\b/,
    /\bpresidente\s+de\b/,
    /\brey\s+de\b/,
    /\bqui[eé]n\s+fue\b/,
    /\bqui[eé]n\s+es\b(?!\s+(el\s+)?(director|residente|gerente|ingeniero|arquitecto|responsable|cliente|proveedor|empleado|carlos\s+mendoza))/,
    /\bcu[aá]ntos\s+a[nñ]os\s+tiene\b(?!\s+(la\s+)?(obra|constructa|empresa))/,
    /\bqui[eé]n\s+pint[oó]\b/,
    /\bqui[eé]n\s+descubri[oó]\b/,
    /\bdistancia\s+entre\b/,
    /\ba[nñ]o\s+del\s+descubrimiento\b/,
    /\bpel[ií]cula\b/,
    /\bf[uú]tbol\b/
  ];

  const hasOutOfScope = outOfScopePatterns.some((pattern) => pattern.test(lower));

  // 2. Vocabulario operativo y de construcción de CONSTRUCTA
  const constructaTerms = [
    'obra', 'obras', 'proyecto', 'proyectos', 'construc', 'presupuesto', 'presupuestos',
    'gasto', 'gastos', 'gastado', 'costo', 'costos', 'costará', 'costara', 'saldo', 'dinero',
    'cronograma', 'avance', 'progreso', 'etapa', 'fase', 'retraso', 'atraso', 'atrasada', 'atrasadas',
    'material', 'materiales', 'cemento', 'varilla', 'arena', 'grava', 'almacén', 'almacen', 'stock',
    'compra', 'compras', 'pedido', 'proveedor', 'proveedores', 'orden de compra', 'factura', 'facturas',
    'empleado', 'empleados', 'personal', 'cuadrilla', 'colaborador', 'trabajador', 'cliente', 'clientes',
    'solicitud', 'cotización', 'cotizacion', 'agenda', 'altavista', 'nexus', 'bicentenario', 'lomas', 'santa fe',
    'riesgo', 'riesgos', 'hipoteca', 'fianza', 'flujo de caja', 'concreto', 'hormigón', 'hormigon', 'bitácora', 'bitacora',
    'estimación', 'estimacion', 'licencia', 'licencias', 'permiso', 'permisos', 'plano', 'planos', 'maquinaria', 'equipo',
    'equipos', 'subcontratista', 'contratista', 'seguridad', 'calidad', 'incidente', 'incidentes'
  ];

  const projectNames = projects.map((p) => (p.nombre || '').toLowerCase()).filter(Boolean);
  const projectCodes = projects.map((p) => (p.codigo || p.id || '').toLowerCase()).filter(Boolean);

  const hasConstructa =
    constructaTerms.some((t) => lower.includes(t)) ||
    projectNames.some((pName) => lower.includes(pName)) ||
    projectCodes.some((pCode) => lower.includes(pCode));

  // Caso 1: Pregunta puramente fuera del alcance
  if (hasOutOfScope && !hasConstructa) {
    return {
      isOutOfScope: true,
      isHybrid: false,
      activeQuery: raw,
      rawQuery: raw
    };
  }

  // Caso 2: Pregunta híbrida / disfrazada (Ej. "¿Quién es Goku y cuánto cuesta actualmente la obra Torre Altavista?")
  if (hasOutOfScope && hasConstructa) {
    const parts = raw.split(/\s+(?:y|e|además|ademas|pero|también|tambien|;|,)\s+/i);
    const constructaPart = parts.find((part) => {
      const pLower = part.toLowerCase();
      return (
        constructaTerms.some((t) => pLower.includes(t)) ||
        projectNames.some((pName) => pLower.includes(pName)) ||
        projectCodes.some((pCode) => pLower.includes(pCode))
      );
    });

    return {
      isOutOfScope: false,
      isHybrid: true,
      activeQuery: (constructaPart || raw).trim(),
      rawQuery: raw
    };
  }

  // Caso 3: Pregunta sin términos explícitos pero sobre marcha general de la empresa
  const isGenericOperational =
    lower.includes('cómo vamos') ||
    lower.includes('como vamos') ||
    lower.includes('cómo va') ||
    lower.includes('como va') ||
    lower.includes('novedades') ||
    lower.includes('resumen') ||
    lower.includes('estado general') ||
    lower.includes('hola') ||
    lower.includes('buenos días') ||
    lower.includes('buenas tardes');

  if (!hasConstructa && !isGenericOperational) {
    return {
      isOutOfScope: true,
      isHybrid: false,
      activeQuery: raw,
      rawQuery: raw
    };
  }

  return {
    isOutOfScope: false,
    isHybrid: false,
    activeQuery: raw,
    rawQuery: raw
  };
}

/**
 * Clasifica la intención de una pregunta del usuario
 */
export function detectQuestionIntent(question = '') {
  if (!question || !question.trim()) return 'DEFAULT_PROJECTION';
  const q = question.toLowerCase().trim();

  // 1. Información no disponible / predicción de mercado futuro no existente
  if (
    (q.includes('costará') || q.includes('va a costar') || q.includes('precio') || q.includes('valor')) &&
    (q.includes('meses') || q.includes('años') || q.includes('dentro de') || q.includes('en el futuro') || q.includes('exactamente') || q.includes('dentro de 8'))
  ) {
    return 'UNAVAILABLE_FUTURE_DATA';
  }

  // 2. Preguntas de cultura general o no relacionadas con la empresa
  if (
    q.includes('capital de') ||
    q.includes('presidente de') ||
    q.includes('quién pintó') ||
    q.includes('quien pinto') ||
    q.includes('cuántos continentes') ||
    q.includes('distancia entre') ||
    q.includes('año del descubrimiento')
  ) {
    return 'GENERAL_NON_CONSTRUCTION';
  }

  // 3. Preguntas conceptuales generales (financieras, legales o constructivas)
  if (
    q.includes('hipoteca') ||
    q.includes('fianza') ||
    q.includes('flujo de caja') ||
    q.includes('cash flow') ||
    q.includes('hormigón') ||
    q.includes('hormigon') ||
    q.includes('concreto armado') ||
    q.includes('bitácora') ||
    q.includes('bitacora') ||
    q.includes('estimación de obra') ||
    q.includes('estimacion de obra') ||
    q.includes('vicios ocultos') ||
    q.includes('subcontratista')
  ) {
    return 'CONCEPTUAL_KNOWLEDGE';
  }

  // 4. Preguntas globales sobre la operación consolidada de CONSTRUCTA
  if (
    q.includes('hemos gastado') ||
    q.includes('gasto total') ||
    q.includes('mayor riesgo') ||
    q.includes('atención prioritaria') ||
    q.includes('atencion prioritaria') ||
    q.includes('obras están atrasadas') ||
    q.includes('obras estan atrasadas') ||
    q.includes('dónde se está gastando más') ||
    q.includes('donde se esta gastando mas') ||
    q.includes('riesgo de abastecimiento') ||
    q.includes('cambiado el presupuesto')
  ) {
    return 'GLOBAL_CONSTRUCTA';
  }

  // 5. Simulación cuantitativa sobre presupuesto / gastos
  if (q.includes('aumenta') || q.includes('increment') || (q.includes('%') && (q.includes('gasto') || q.includes('presupuesto')))) {
    return 'OBRA_SIMULATION';
  }

  // 6. Consultas sobre una obra (riesgos, estado, presupuesto, compras, personal)
  if (
    q.includes('riesgo') ||
    q.includes('retras') ||
    q.includes('presupuesto') ||
    q.includes('gasto') ||
    q.includes('material') ||
    q.includes('cómo va') ||
    q.includes('como va') ||
    q.includes('avance') ||
    q.includes('revisar primero') ||
    q.includes('problema')
  ) {
    return 'OBRA_SPECIFIC';
  }

  // Si comienza por preguntas abiertas generales que no mencionan obra
  if (q.startsWith('qué es ') || q.startsWith('que es ') || q.startsWith('cuál es ') || q.startsWith('cual es ') || q.startsWith('cómo es ') || q.startsWith('como es ')) {
    return 'GENERAL_NON_CONSTRUCTION';
  }

  return 'GENERAL_OPEN';
}

export const aiService = {
  CONSTRUCTION_SAMPLE_TEXT,

  /**
   * Consulta el estado en el servidor sin exponer secretos
   */
  async checkServerStatus() {
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}
    return { ok: false, configured: false, provider: 'Google Gemini' };
  },

  /**
   * Consulta rápida de proveedores
   */
  getStatus() {
    return {
      gemini: { configured: true },
      openai: { configured: false },
      anyConfigured: true,
      activeProvider: 'gemini'
    };
  },

  /**
   * Genera análisis o proyecciones para un proyecto seleccionado o para la cartera completa
   * Comprende preguntas en lenguaje natural sin obligar a usar términos de obra y sin inventar datos
   */
  async analyzeProject({
    project = null,
    data = {},
    question = '',
    conversationHistory = []
  }) {
    // 0. Pre-validación estricta de pertinencia para CONSTRUCTA
    const relevance = classifyQuestionRelevance(question, data.projects || []);
    if (relevance.isOutOfScope) {
      return {
        ok: true,
        text: OUT_OF_SCOPE_RESPONSE,
        isOutOfScope: true,
        provider: 'Asistente CONSTRUCTA',
        model: 'Filtro de Pertinencia Operativa',
        isRealGemini: false,
        engineType: 'AI_LOCAL_FALLBACK',
        facts: null
      };
    }

    const effectiveQuestion = relevance.isHybrid ? relevance.activeQuery : question;

    // 1. Identificar si la pregunta se refiere a un proyecto específico mencionado en el texto
    const targetProject = resolveTargetProject(effectiveQuestion, data.projects || [], project);
    const isSingleProject = Boolean(targetProject);
    const projectFacts = isSingleProject ? buildProjectContext(targetProject, data) : null;
    const globalFacts = buildGlobalPortfolioContext(data);
    const intent = detectQuestionIntent(effectiveQuestion);

    // Validación de datos mínimos
    if (isSingleProject && !projectFacts) {
      return {
        ok: false,
        error: 'No se encontró la información del proyecto seleccionado.',
        engineType: 'AI_ERROR'
      };
    }
    if (!isSingleProject && (!data.projects || data.projects.length === 0)) {
      return {
        ok: true,
        insufficientData: true,
        text: 'No hay información suficiente en CONSTRUCTA para generar una predicción confiable. Se requiere registrar obras activas.',
        engineType: 'AI_LOCAL_FALLBACK'
      };
    }

    // 2. Preparación del System Prompt para Gemini (AI_REAL) con instrucciones de clasificación y naturalidad
    const systemPrompt = `Eres el Asistente Inteligente de CONSTRUCTA para Dirección General y Operaciones de Obra.

DIRECTRICES FUNDAMENTALES DE RESPUESTA:
1. RESTRICCIÓN EXCLUSIVA A CONSTRUCTA:
   - TIENES ESTRICTAMENTE PROHIBIDO responder preguntas de conocimiento general ajenas a la empresa (como cultura general, personajes ficticios como Goku, anime, chistes, canciones, física o memes).
   - Ante preguntas ajenas a CONSTRUCTA, debes responder EXACTAMENTE:
     "${OUT_OF_SCOPE_RESPONSE}"
   - Si la pregunta es híbrida o disfrazada (ej. "¿Quién es Goku y cuánto cuesta actualmente la obra Torre Altavista?"), ignora totalmente la parte ajena y responde ÚNICAMENTE la consulta relacionada con CONSTRUCTA utilizando los datos disponibles.
2. CONTEXTO OPERATIVO Y CERO ALUCINACIONES:
   - Responde siempre basándote en los datos disponibles de CONSTRUCTA proporcionados.
   - NUNCA inventes números, porcentajes, presupuestos, fechas ni personal. Si un dato no está en el contexto, indica claramente: "No tengo información suficiente en CONSTRUCTA para determinarlo con exactitud."
3. ESTILO:
   - Responde en español formal, técnico y ejecutivo, sin código ni formato JSON.`;

    // 3. Preparación del bloque de contexto para Gemini
    let contextText = '';
    if (isSingleProject) {
      contextText = `
FICHA TÉCNICA Y OPERATIVA DE LA OBRA "${projectFacts.projectName}":
- Código: ${projectFacts.projectCode} | Cliente: ${projectFacts.clientName} | Ubicación: ${projectFacts.location}
- Estado Actual: ${projectFacts.status} | Avance Físico Certificado: ${projectFacts.progressPct}%
- Presupuesto Oficial Autorizado: $${projectFacts.budget.toLocaleString()} MXN
- Gasto Real Acumulado: $${projectFacts.totalSpent.toLocaleString()} MXN (Tasa de Consumo: ${projectFacts.consumptionPct}%)
- Saldo Financiero Disponible: $${projectFacts.budgetBalance.toLocaleString()} MXN
- Alerta Presupuestal: ${projectFacts.isOverBudget ? 'SÍ (Supera el 90% del presupuesto asignado)' : 'NO (Dentro del margen esperado)'}
- Fechas de Contrato: Inicio ${projectFacts.startDate} | Cierre Estimado ${projectFacts.endDate}
- Cronograma: ${projectFacts.totalStages} etapas (${projectFacts.completedStages} completadas, ${projectFacts.inProgressStages} en curso, ${projectFacts.delayedStages} retrasadas).
- Fases: ${projectFacts.stageNames.join('; ') || 'Sin desglose'}
- Etapas Retrasadas: ${projectFacts.delayedStageDetails.join(', ') || 'Ninguna etapa reporta retraso'}
- Riesgos Documentados: ${projectFacts.knownRisks.join(', ') || 'Ninguno registrado formalmente'}
- Compras: ${projectFacts.projectOrdersCount} órdenes emitidas por $${projectFacts.totalOrdersAmount.toLocaleString()} MXN (${projectFacts.pendingDeliveryOrdersCount} pendientes de arribo en obra).
- Insumos Comprados: ${projectFacts.materialsOrdered.slice(0, 5).join(', ') || 'Sin compras activas'}
- Proveedores Vinculados: ${projectFacts.projectSupplierNames.join(', ') || 'Sin proveedores registrados'}
- Materiales en Riesgo de Stock en Obra: ${projectFacts.criticalMaterials.join(', ') || 'Niveles regulares'}
- Solicitudes Urgentes: ${projectFacts.urgentRequestsCount}
- Personal en Sitio: ${projectFacts.staffCount} colaboradores (${projectFacts.staffRoles.slice(0, 4).join(', ') || 'Sin personal asignado'}).
`;
    } else {
      contextText = `
CONSOLIDADO OPERATIVO CORPORATIVO DE CONSTRUCTA:
- Total de Proyectos en Cartera: ${globalFacts.totalProjects} (${globalFacts.activeProjectsCount} en construcción/activos).
- Fondo Global Autorizado: $${globalFacts.totalBudget.toLocaleString()} MXN
- Gasto Acumulado en Obras: $${globalFacts.totalSpent.toLocaleString()} MXN (${globalFacts.budgetConsumptionPct}% ejercido)
- Avance Físico Promedio Ponderado: ${globalFacts.avgProgress}%
- Obras con Gasto Superior al 90% del Presupuesto: ${globalFacts.overBudgetCount} (${globalFacts.overBudgetNames.join(', ') || 'Ninguna'})
- Obras con Etapas Atrasadas en Cronograma: ${globalFacts.delayedCount} (${globalFacts.delayedNames.join(', ') || 'Ninguna'})
- Insumos en Almacén en o bajo Stock Mínimo: ${globalFacts.lowStockCount} (${globalFacts.lowStockNames.join(', ') || 'Niveles óptimos'})
- Total de Órdenes de Compra Registradas: ${globalFacts.totalOrdersCount}
`;
    }

    // Historial previo de conversación
    let conversationContext = '';
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationContext = '\nMEMORIA DE LA CONVERSACIÓN RECIENTE:\n' +
        conversationHistory.map((m) => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.text}`).join('\n') + '\n';
    }

    const promptUserInstruction = question && question.trim()
      ? `PREGUNTA DEL USUARIO:\n"${question.trim()}"`
      : 'Genera un informe completo de proyección al futuro, riesgos y recomendaciones operativas.';

    const fullPrompt = `DATOS DEL SISTEMA DISPONIBLES COMO CONTEXTO (Utilízalos ÚNICAMENTE si la pregunta se refiere a CONSTRUCTA o a sus obras):\n${contextText}\n${conversationContext}\n${promptUserInstruction}`;

    // 4. Intentar solicitud real a Google Gemini mediante el proxy backend con AbortController (15s)
    try {
      const clientAbort = new AbortController();
      const clientTimeout = setTimeout(() => clientAbort.abort(), 15000);

      const proxyRes = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: clientAbort.signal,
        body: JSON.stringify({
          prompt: fullPrompt,
          systemPrompt,
          action: 'analizar'
        })
      });
      clearTimeout(clientTimeout);

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data.ok && data.text && data.isRealGemini) {
          return {
            ok: true,
            text: data.text,
            provider: 'Google Gemini (1.5 Flash)',
            model: data.model || 'gemini-1.5-flash',
            isRealGemini: true,
            engineType: 'AI_REAL',
            durationMs: data.durationMs,
            facts: isSingleProject ? projectFacts : globalFacts
          };
        }
      }
    } catch (fetchErr) {
      if (fetchErr.name === 'AbortError') {
        return {
          ok: false,
          error: 'No fue posible obtener una respuesta de IA en este momento.',
          engineType: 'AI_ERROR',
          technicalCause: 'TIMEOUT'
        };
      }
    }

    // 5. Motor Analítico Local de CONSTRUCTA (Fallback basado en hechos reales e intención natural)
    // Se activa cuando no hay GEMINI_API_KEY o el servicio externo está inaccesible.
    // NUNCA se hace pasar por Gemini: engineType: 'AI_LOCAL_FALLBACK'
    let localResponse = '';
    const qLower = (question || '').toLowerCase();

    // Caso A: Información no disponible o predicciones futuras exactas imposibles
    if (intent === 'UNAVAILABLE_FUTURE_DATA') {
      localResponse = 'No tengo información suficiente en CONSTRUCTA para determinarlo. El sistema registra los costos históricos y los precios pactados en órdenes de compra vigentes, pero no dispone de proyecciones oficiales de precios de mercado a futuro para estimar ese valor con exactitud.';
    }
    // Caso B: Pregunta general no relacionada con CONSTRUCTA
    else if (intent === 'GENERAL_NON_CONSTRUCTION') {
      localResponse = OUT_OF_SCOPE_RESPONSE;
    }
    // Caso C: Pregunta conceptual general (construcción, legal o finanzas)
    else if (intent === 'CONCEPTUAL_KNOWLEDGE') {
      if (qLower.includes('hipoteca')) {
        localResponse = 'Una hipoteca es un producto financiero a largo plazo mediante el cual una entidad bancaria presta capital para la adquisición, edificación o rehabilitación de un bien inmueble. La propia propiedad funge como garantía colateral del pago del préstamo. Si el prestatario cubre las cuotas estipuladas, la garantía hipotecaria queda liberada; si incurre en impago, la entidad crediticia posee el derecho legal de ejecutar la garantía para recuperar los fondos adeudados.';
      } else if (qLower.includes('fianza')) {
        localResponse = 'Una fianza en la industria de la construcción es una garantía legal y mercantil emitida por una compañía afianzadora para respaldar el cumplimiento de un contrato de obra. Sus modalidades principales son: fianza de anticipo (cautela el uso debido de los recursos iniciales), fianza de cumplimiento (avala la entrega en tiempo, costo y calidad pactados) y fianza de vicios ocultos (responde por defectos constructivos detectados con posterioridad a la recepción de la obra).';
      } else if (qLower.includes('flujo de caja') || qLower.includes('cash flow')) {
        localResponse = 'El flujo de caja es el registro y balance proyectado entre las entradas de efectivo (cobros de estimaciones a clientes, anticipos) y las salidas monetarias (nóminas de cuadrillas, compras de insumos, subcontratos) de una empresa o proyecto en un periodo determinado. Es vital para prevenir baches de liquidez y mantener la continuidad operativa en los frentes de trabajo.';
      } else if (qLower.includes('hormigón') || qLower.includes('hormigon') || qLower.includes('concreto')) {
        localResponse = 'El hormigón armado (o concreto armado) es un material compuesto estructural que combina la elevada resistencia a la compresión del concreto con la resistencia a la tracción del acero de refuerzo (varillas y mallas electrosoldadas). Esta unión mecánica dota a la estructura de solidez, ductilidad y resistencia ante esfuerzos sísmicos en cimentaciones, columnas, trabes y losas.';
      } else if (qLower.includes('bitácora') || qLower.includes('bitacora')) {
        localResponse = 'La bitácora de obra es el instrumento legal y técnico oficial donde se asientan de manera cronológica los acontecimientos relevantes de la construcción: condiciones climáticas, autorizaciones de colado, modificaciones de proyecto, incidentes de seguridad y acuerdos entre el constructor y la supervisión técnica.';
      } else if (qLower.includes('estimación') || qLower.includes('estimacion')) {
        localResponse = 'Una estimación de obra es la cuantificación y valuación monetaria periódica de los volúmenes de trabajo realmente ejecutados y aprobados durante un periodo específico (quincenal o mensual), formulada con base en los conceptos y precios unitarios del contrato para su revisión y cobro.';
      } else {
        localResponse = 'Este concepto forma parte del conocimiento técnico y administrativo de la construcción. Para una explicación extendida o adaptada a normativas particulares, se recomienda consultar las especificaciones contractuales o habilitar la conectividad con Gemini / N8N.';
      }
    }
    // Caso D: Pregunta global sobre CONSTRUCTA
    else if (intent === 'GLOBAL_CONSTRUCTA') {
      if (qLower.includes('hemos gastado') || qLower.includes('gasto total')) {
        localResponse = `En CONSTRUCTA se registra un gasto real acumulado de $${globalFacts.totalSpent.toLocaleString()} MXN entre todas las obras en cartera, sobre un fondo autorizado global de $${globalFacts.totalBudget.toLocaleString()} MXN (tasa de consumo del ${globalFacts.budgetConsumptionPct}%).`;
      } else if (qLower.includes('mayor riesgo') || qLower.includes('atención prioritaria') || qLower.includes('atencion prioritaria')) {
        localResponse = `${globalFacts.overBudgetCount > 0 ? `El proyecto con mayor atención prioritaria presupuestaria es ${globalFacts.overBudgetNames.join(', ')}, habiendo superado el 90% de sus fondos autorizados.` : 'Ninguna obra registra sobregiro presupuestal crítico.'} ${globalFacts.delayedCount > 0 ? `En cronograma, se requiere atención prioritaria en ${globalFacts.delayedNames.join(', ')} por registrar etapas con estatus de retraso.` : 'Las obras marchan dentro de los tiempos de cronograma pactados.'}`;
      } else if (qLower.includes('obras están atrasadas') || qLower.includes('obras estan atrasadas')) {
        localResponse = globalFacts.delayedCount > 0
          ? `Actualmente se registran ${globalFacts.delayedCount} obras con fases retrasadas en cronograma: ${globalFacts.delayedNames.join(', ')}.`
          : 'Ninguna obra registra retrasos críticos en sus fases de cronograma.';
      } else if (qLower.includes('dónde se está gastando más') || qLower.includes('donde se esta gastando mas')) {
        localResponse = globalFacts.overBudgetCount > 0
          ? `Las obras con mayor presión financiera (gasto superior al 90% de su presupuesto autorizado) son: ${globalFacts.overBudgetNames.join(', ')}.`
          : 'Todas las obras operan dentro de los márgenes financieros programados.';
      } else if (qLower.includes('riesgo de abastecimiento')) {
        localResponse = globalFacts.lowStockCount > 0
          ? `Se identifican ${globalFacts.lowStockCount} materiales con existencias en o por debajo del stock mínimo de seguridad: ${globalFacts.lowStockNames.join(', ')}.`
          : 'Los niveles de inventario de materiales se encuentran en rangos óptimos.';
      } else if (qLower.includes('cambiado el presupuesto')) {
        localResponse = `El presupuesto global autorizado asciende a $${globalFacts.totalBudget.toLocaleString()} MXN para las ${globalFacts.totalProjects} obras de la cartera. Se ha ejercido un acumulado de $${globalFacts.totalSpent.toLocaleString()} MXN, manteniendo un saldo disponible consolidado de $${(globalFacts.totalBudget - globalFacts.totalSpent).toLocaleString()} MXN.`;
      } else {
        localResponse = `La cartera de CONSTRUCTA comprende ${globalFacts.totalProjects} obras con un avance físico promedio del ${globalFacts.avgProgress}%, un presupuesto global de $${globalFacts.totalBudget.toLocaleString()} MXN y un gasto ejercido de $${globalFacts.totalSpent.toLocaleString()} MXN.`;
      }
    }
    // Caso E: Simulación porcentual de gasto sobre la obra
    else if (intent === 'OBRA_SIMULATION' && isSingleProject) {
      const pctMatch = qLower.match(/(\d+)\s*%/);
      const simPct = pctMatch ? Number(pctMatch[1]) : 10;
      const currentSpent = projectFacts.totalSpent;
      const additionalSpent = currentSpent * (simPct / 100);
      const projectedTotal = currentSpent + additionalSpent;
      const projectedConsumption = projectFacts.budget > 0 ? ((projectedTotal / projectFacts.budget) * 100).toFixed(1) : 0;
      const projectedBalance = projectFacts.budget - projectedTotal;

      localResponse = `
### ANÁLISIS DE SENSIBILIDAD PRESUPUESTARIA (+${simPct}% EN GASTO)
- **Gasto Actual en ${projectFacts.projectName}:** $${currentSpent.toLocaleString()} MXN (${projectFacts.consumptionPct}% del presupuesto).
- **Incremento Simulado (+${simPct}%):** +$${Math.round(additionalSpent).toLocaleString()} MXN adicionales.
- **Gasto Proyectado Resultante:** $${Math.round(projectedTotal).toLocaleString()} MXN.
- **Nuevo Nivel de Consumo:** **${projectedConsumption}%** (Saldo proyectado: $${Math.round(projectedBalance).toLocaleString()} MXN).
- **Diagnóstico:** ${projectedTotal > projectFacts.budget
  ? `CRÍTICO: Un aumento del ${simPct}% generaría un sobrecosto de $${Math.round(Math.abs(projectedBalance)).toLocaleString()} MXN por encima del fondo autorizado. Se requerirá ampliación formal de presupuesto o contención estricta de compras.`
  : `VIABLE: El presupuesto autorizado absorbe el incremento, pero reduce la reserva de contingencia a $${Math.round(projectedBalance).toLocaleString()} MXN.`}

**Recomendación:** Auditar las órdenes de compra pendientes (${projectFacts.pendingDeliveryOrdersCount} en tránsito) antes de autorizar nuevos compromisos económicos.
`.trim();
    }
    // Caso F: Consultas específicas sobre una obra
    else if (isSingleProject && (intent === 'OBRA_SPECIFIC' || question.trim())) {
      if (qLower.includes('riesgo') || qLower.includes('problema') || qLower.includes('retras')) {
        localResponse = `
### EVALUACIÓN DE RIESGOS: ${projectFacts.projectName}
1. **Riesgo Presupuestal:** ${projectFacts.isOverBudget
  ? `ALTO: La obra ya consumió el ${projectFacts.consumptionPct}% de sus fondos autorizados ($${projectFacts.totalSpent.toLocaleString()} MXN) mientras su avance físico reporta ${projectFacts.progressPct}%.`
  : `CONTROLADO: Consumo financiero del ${projectFacts.consumptionPct}% congruente con el avance físico reportado (${projectFacts.progressPct}%).`}
2. **Riesgo de Cronograma:** ${projectFacts.delayedStages > 0
  ? `MODERADO-ALTO: Registra ${projectFacts.delayedStages} etapa(s) con estatus de retraso (${projectFacts.delayedStageDetails.join(', ')}). Existe riesgo de comprometer la fecha contractual del ${projectFacts.endDate}.`
  : `BAJO: Las ${projectFacts.totalStages} etapas marchan conforme al calendario.`}
3. **Riesgo de Abastecimiento:** ${projectFacts.criticalMaterials.length > 0
  ? `ATENCIÓN: Insumos con bajo inventario: ${projectFacts.criticalMaterials.join(', ')}.`
  : `REGULAR: Se registran ${projectFacts.pendingDeliveryOrdersCount} órdenes de compra pendientes de arribo en sitio.`}
`.trim();
      } else if (qLower.includes('presupuesto') || qLower.includes('dentro del presupuesto')) {
        localResponse = `
### SITUACIÓN PRESUPUESTAL: ${projectFacts.projectName}
- **Presupuesto Autorizado:** $${projectFacts.budget.toLocaleString()} MXN.
- **Gasto Real Acumulado:** $${projectFacts.totalSpent.toLocaleString()} MXN (**${projectFacts.consumptionPct}%** ejercido).
- **Saldo Disponible:** $${projectFacts.budgetBalance.toLocaleString()} MXN.
- **Dictamen:** ${projectFacts.isOverBudget
  ? 'ALERTA: La obra supera el 90% de sus fondos autorizados. El ritmo de gasto supera proporcionalmente el avance físico certificado.'
  : 'ESTABLE: La obra se mantiene dentro del presupuesto autorizado y dispone de saldo suficiente para las siguientes partidas.'}
`.trim();
      } else if (qLower.includes('material') || qLower.includes('abastecim') || qLower.includes('compra')) {
        localResponse = `
### CADENA DE SUMINISTRO: ${projectFacts.projectName}
- **Órdenes de Compra:** ${projectFacts.projectOrdersCount} órdenes gestionadas ($${projectFacts.totalOrdersAmount.toLocaleString()} MXN).
- **Entregas en Tránsito:** ${projectFacts.pendingDeliveryOrdersCount} pedidos pendientes de recepción en obra.
- **Insumos en Alerta:** ${projectFacts.criticalMaterials.join(', ') || 'No se registran materiales con quiebre de stock para esta obra'}.
- **Solicitudes Urgentes:** ${projectFacts.urgentRequestsCount} requerimiento(s) clasificados con alta prioridad.
`.trim();
      } else if (qLower.includes('revisar primero') || qLower.includes('prioritari')) {
        localResponse = `
### ACCIONES PRIORITARIAS: ${projectFacts.projectName}
1. **${projectFacts.delayedStages > 0 ? 'CRONOGRAMA' : 'SUPERVISIÓN'}:** ${projectFacts.delayedStages > 0 ? `Reprogramar cuadrillas para atender ${projectFacts.delayedStageDetails.join(', ')}.` : 'Monitorear hitos de la fase actual.'}
2. **FINANZAS:** ${projectFacts.isOverBudget ? `Auditar partidas de costo tras alcanzar el ${projectFacts.consumptionPct}% de consumo.` : `Preservar el saldo de $${projectFacts.budgetBalance.toLocaleString()} MXN.`}
3. **LOGÍSTICA:** Supervisar las ${projectFacts.pendingDeliveryOrdersCount} órdenes pendientes de arribo en sitio.
`.trim();
      } else {
        localResponse = `
### ESTADO DE LA OBRA: ${projectFacts.projectName} (${projectFacts.projectCode})
- **Cliente y Ubicación:** ${projectFacts.clientName} — ${projectFacts.location}
- **Avance Físico Actual:** **${projectFacts.progressPct}%** (Estatus: ${projectFacts.status}).
- **Finanzas:** $${projectFacts.totalSpent.toLocaleString()} MXN ejercidos de un presupuesto de $${projectFacts.budget.toLocaleString()} MXN (**${projectFacts.consumptionPct}%** consumido).
- **Cronograma:** ${projectFacts.totalStages} etapas registradas (${projectFacts.delayedStages > 0 ? `${projectFacts.delayedStages} retrasadas` : 'al día'}).
- **Fecha Prevista de Conclusión:** ${projectFacts.endDate}.
`.trim();
      }
    }
    // Caso G: Reporte ejecutivo por defecto (cuando no se especifica pregunta puntual)
    else {
      if (isSingleProject) {
        localResponse = `
### 1. RESUMEN EJECUTIVO DE LA OBRA
- **Proyecto:** ${projectFacts.projectName} (${projectFacts.projectCode})
- **Cliente y Sitio:** ${projectFacts.clientName} — ${projectFacts.location}
- **Estado Actual:** ${projectFacts.status} con un avance físico registrado del **${projectFacts.progressPct}%**.

### 2. SITUACIÓN PRESUPUESTAL Y GASTOS
- **Presupuesto Autorizado:** $${projectFacts.budget.toLocaleString()} MXN.
- **Gasto Real Acumulado:** $${projectFacts.totalSpent.toLocaleString()} MXN (**${projectFacts.consumptionPct}%** consumido).
- **Saldo Disponible:** $${projectFacts.budgetBalance.toLocaleString()} MXN.
- **Diagnóstico Financiero:** ${projectFacts.isOverBudget
  ? `ALERTA DE DESVIACIÓN: La obra ha ejercido más del 90% de su presupuesto. La tasa de consumo financiero supera proporcionalmente el avance físico certificado (${projectFacts.progressPct}%).`
  : `Márgenes controlados: El gasto ejercido guarda una relación congruente con el avance físico reportado (${projectFacts.progressPct}%).`}

### 3. RIESGOS DE CRONOGRAMA Y FASES
- **Etapas Planificadas:** ${projectFacts.totalStages} fases (${projectFacts.completedStages} completadas, ${projectFacts.inProgressStages} activas, ${projectFacts.delayedStages} retrasadas).
- **Compromiso Contractual:** Fecha estimada de terminación: ${projectFacts.endDate}.
- **Riesgos Detectados:** ${projectFacts.delayedStages > 0
  ? `Existen ${projectFacts.delayedStages} etapas con demoras (${projectFacts.delayedStageDetails.join(', ')}) que podrían desplazar la fecha final si no se refuerzan las cuadrillas.`
  : 'El ritmo de ejecución de las fases actuales se mantiene dentro de los hitos programados.'}

### 4. ABASTECIMIENTO Y MATERIALES CRÍTICOS
- **Órdenes de Compra:** ${projectFacts.projectOrdersCount} órdenes gestionadas ($${projectFacts.totalOrdersAmount.toLocaleString()} MXN), con **${projectFacts.pendingDeliveryOrdersCount} pendientes de recepción en obra**.
- **Requerimientos Urgentes:** ${projectFacts.urgentRequestsCount > 0 ? `${projectFacts.urgentRequestsCount} solicitudes de materiales marcadas con alta urgencia.` : 'Sin solicitudes pendientes de urgencia alta.'}
- **Insumos Críticos:** ${projectFacts.criticalMaterials.join(', ') || 'Niveles de insumos regulares'}.

### 5. RECOMENDACIONES DE LA DIRECCIÓN
1. ${projectFacts.isOverBudget ? 'Realizar una auditoría inmediata a las partidas de mayor peso para frenar costos adicionales no pactados.' : 'Monitorear la certificación de avance contra facturación de subcontratistas.'}
2. Asegurar la recepción oportuna de las ${projectFacts.pendingDeliveryOrdersCount} órdenes de compra en tránsito para evitar paros de cuadrilla.
3. Actualizar la bitácora de obra con las mediciones de la última semana.
`.trim();
      } else {
        localResponse = `
### 1. RESUMEN EJECUTIVO DE CARTERA
- **Cartera de Obras:** ${globalFacts.totalProjects} obras registradas (${globalFacts.activeProjectsCount} activas en ejecución) con un avance físico promedio del **${globalFacts.avgProgress}%**.
- **Presupuesto Global:** $${globalFacts.totalBudget.toLocaleString()} MXN autorizado; $${globalFacts.totalSpent.toLocaleString()} MXN ejercido (**${globalFacts.budgetConsumptionPct}%** de consumo financiero global).

### 2. ALERTAS PRESUPUESTALES Y DE CRONOGRAMA
- **Obras con Desviación Presupuestaria:** ${globalFacts.overBudgetCount > 0
  ? `${globalFacts.overBudgetCount} obras con consumo superior al 90% (${globalFacts.overBudgetNames.join(', ')}). Requieren intervención prioritaria.`
  : 'Todas las obras operan dentro de los márgenes financieros normales.'}
- **Obras con Etapas Atrasadas:** ${globalFacts.delayedCount > 0
  ? `${globalFacts.delayedCount} obras con etapas retrasadas (${globalFacts.delayedNames.join(', ')}).`
  : 'Ninguna obra presenta retrasos críticos en cronograma.'}
- **Insumos en Almacén Crítico:** ${globalFacts.lowStockCount > 0
  ? `${globalFacts.lowStockCount} materiales en o por debajo del stock mínimo (${globalFacts.lowStockNames.join(', ')}).`
  : 'El almacén central mantiene existencias suficientes.'}

### 3. RECOMENDACIONES CORPORATIVAS
1. Concentrar la supervisión técnica en ${globalFacts.overBudgetNames[0] || globalFacts.delayedNames[0] || 'las obras activas'}.
2. Reponer oportunamente los insumos con stock mínimo para evitar cuellos de botella en cuadrillas.
3. Consolidar el cierre mensual de estimaciones financieras con los clientes principales.
`.trim();
      }
    }

    return {
      ok: true,
      text: localResponse,
      provider: 'Motor Analítico CONSTRUCTA (Análisis Estadístico Operativo)',
      model: 'Cálculo Estadístico Operativo',
      isRealGemini: false,
      engineType: 'AI_LOCAL_FALLBACK',
      facts: isSingleProject ? projectFacts : globalFacts
    };
  },

  /**
   * Pregunta Libre sobre la Operación de CONSTRUCTA — Conexión Real y Exclusiva con N8N
   */
  async askAiOperation({ question, role = 'Administrador', project = null, data = {} }) {
    if (!question || !question.trim()) {
      return { ok: false, success: false, error: 'Por favor ingresa una pregunta válida.' };
    }

    const relevance = classifyQuestionRelevance(question, data.projects || []);
    if (relevance.isOutOfScope) {
      return {
        ok: true,
        success: true,
        answer: OUT_OF_SCOPE_RESPONSE,
        text: OUT_OF_SCOPE_RESPONSE,
        isOutOfScope: true,
        isRealAI: false,
        engineType: 'AI_LOCAL_FALLBACK',
        status: 'IA CONECTADA'
      };
    }

    const effectiveQuestion = relevance.isHybrid ? relevance.activeQuery : question;
    const targetProject = resolveTargetProject(effectiveQuestion, data.projects || [], project);
    const isSingleProject = Boolean(targetProject);
    const projectFacts = isSingleProject ? buildProjectContext(targetProject, data) : null;
    const globalFacts = buildGlobalPortfolioContext(data);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const res = await fetch('/api/ai/operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question: effectiveQuestion.trim(),
          role,
          projectId: targetProject?.id || null,
          projectName: targetProject?.nombre || null,
          context: {
            ...globalFacts,
            projectFacts,
            projects: (data.projects || []).map((p) => `${p.codigo || p.id} ${p.nombre}`)
          }
        })
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const result = await res.json();
        if (result.ok && result.success) {
          return {
            ok: true,
            success: true,
            isRealAI: true,
            answer: result.answer,
            text: result.answer,
            projectId: result.projectId,
            projectName: result.projectName,
            targetProject,
            analysisType: result.analysisType,
            risks: result.risks || [],
            recommendations: result.recommendations || [],
            timestamp: result.timestamp,
            durationMs: result.durationMs,
            engineType: 'AI_REAL',
            status: 'IA CONECTADA'
          };
        } else {
          return {
            ok: false,
            success: false,
            isRealAI: false,
            error: result.error || 'N8N no devolvió una respuesta válida.',
            engineType: 'AI_ERROR',
            status: 'IA NO DISPONIBLE'
          };
        }
      } else {
        return {
          ok: false,
          success: false,
          isRealAI: false,
          error: `Error HTTP ${res.status} al conectar con N8N.`,
          engineType: 'AI_ERROR',
          status: 'IA NO DISPONIBLE'
        };
      }
    } catch (err) {
      return {
        ok: false,
        success: false,
        isRealAI: false,
        error: err.name === 'AbortError'
          ? 'Tiempo de espera agotado al conectar con N8N.'
          : 'N8N no responde en http://localhost:5678/webhook/constructa-ai. Verifique que el servicio n8n esté activo.',
        engineType: 'AI_ERROR',
        status: 'IA NO DISPONIBLE'
      };
    }
  },

  /**
   * Alias de compatibilidad con versiones previas
   */
  async analyzeOperationalData(params) {
    return this.analyzeProject({ data: params });
  },

  /**
   * Generación de texto para el asistente general del Administrador
   */
  async generate({ prompt, action = 'analizar' }) {
    if (!prompt || !prompt.trim()) {
      return { ok: false, error: 'Por favor ingresa un texto válido.' };
    }

    const actionObj = AI_ACTIONS.find((a) => a.id === action) || AI_ACTIONS[0];
    const systemPrompt = 'Eres el Asistente de Inteligencia Artificial Corporativo de CONSTRUCTA. Responde de forma técnica, profesional, estructurada y en español sin código ni JSON.';
    const userPrompt = `${actionObj.promptPrefix}\n\n"${prompt.trim()}"`;

    try {
      const proxyRes = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          systemPrompt,
          action
        })
      });

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data.ok && data.text) {
          return {
            ok: true,
            text: data.text,
            provider: data.provider || 'Google Gemini (1.5 Flash)',
            isRealGemini: Boolean(data.isRealGemini),
            engineType: data.isRealGemini ? 'AI_REAL' : 'AI_LOCAL_FALLBACK'
          };
        }
      }
    } catch (_) {}

    return {
      ok: false,
      error: 'El análisis no está disponible en este momento.',
      engineType: 'AI_ERROR'
    };
  }
};

export default aiService;
