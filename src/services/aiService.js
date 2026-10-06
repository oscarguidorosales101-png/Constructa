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
   */
  async analyzeProject({
    project = null,
    data = {},
    question = '',
    conversationHistory = []
  }) {
    const isSingleProject = Boolean(project);
    const projectFacts = isSingleProject ? buildProjectContext(project, data) : null;
    const globalFacts = !isSingleProject ? buildGlobalPortfolioContext(data) : null;

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
        text: 'No hay información suficiente para generar una predicción confiable. Se requiere registrar obras activas.',
        engineType: 'AI_LOCAL_FALLBACK'
      };
    }

    // Preparación del System Prompt
    const systemPrompt = isSingleProject
      ? `Eres el Asesor Especializado de Ingeniería y Finanzas de CONSTRUCTA asignado a la obra "${projectFacts.projectName}".
Analiza con rigor profesional los hechos reales de esta obra específica. No inventes cifras. Si falta un dato indícalo con profesionalismo.
Estructura tus respuestas con claridad ejecutiva en secciones: RESUMEN, ESTADO PRESUPUESTARIO, RIESGOS DE CRONOGRAMA, MATERIALES/ABASTECIMIENTO y RECOMENDACIONES.`
      : `Eres el Director de Inteligencia Analítica de CONSTRUCTA. Analiza la cartera global de proyectos basándote exclusivamente en los hechos reales consolidados suministrados.
Estructura tu reporte en: RESUMEN EJECUTIVO, CONTROL PRESUPUESTARIO, ALERTAS OPERATIVAS y RECOMENDACIONES ESTRATÉGICAS.`;

    // Preparación del texto de hechos (Contexto estricto del proyecto seleccionado)
    let contextText = '';
    if (isSingleProject) {
      contextText = `
FICHA TÉCNICA Y OPERATIVA ACTUAL DE LA OBRA:
- Nombre: ${projectFacts.projectName} (Código: ${projectFacts.projectCode})
- Cliente: ${projectFacts.clientName} | Ubicación: ${projectFacts.location}
- Estado de Obra: ${projectFacts.status} | Avance Físico Actual: ${projectFacts.progressPct}%
- Presupuesto Oficial Autorizado: $${projectFacts.budget.toLocaleString()} MXN
- Gasto Real Acumulado: $${projectFacts.totalSpent.toLocaleString()} MXN (Tasa de Consumo: ${projectFacts.consumptionPct}%)
- Saldo Financiero Disponible: $${projectFacts.budgetBalance.toLocaleString()} MXN
- Alerta Presupuestal: ${projectFacts.isOverBudget ? 'SÍ (Supera el 90% del presupuesto asignado)' : 'NO (Dentro del margen esperado)'}
- Periodo Contractual: Inicio ${projectFacts.startDate} a Cierre Estimado ${projectFacts.endDate}
- Cronograma: ${projectFacts.totalStages} etapas registradas (${projectFacts.completedStages} concluidas, ${projectFacts.inProgressStages} en curso, ${projectFacts.delayedStages} retrasadas).
- Fases: ${projectFacts.stageNames.join('; ') || 'Sin desglose de fases'}
- Etapas Retrasadas Específicas: ${projectFacts.delayedStageDetails.join(', ') || 'Ninguna etapa reporta retraso'}
- Riesgos Documentados en Cronograma: ${projectFacts.knownRisks.join(', ') || 'Ninguno registrado formalmente'}
- Entregables Clave: ${projectFacts.deliverables.join(', ') || 'No definidos'}
- Compras y Pedidos: ${projectFacts.projectOrdersCount} órdenes emitidas por un monto de $${projectFacts.totalOrdersAmount.toLocaleString()} MXN (${projectFacts.pendingDeliveryOrdersCount} pendientes de entrega).
- Insumos Comprados: ${projectFacts.materialsOrdered.slice(0, 5).join(', ') || 'Sin órdenes activas'}
- Proveedores Vinculados: ${projectFacts.projectSupplierNames.join(', ') || 'Sin proveedores asignados en órdenes'}
- Materiales en Riesgo de Stock en Obra: ${projectFacts.criticalMaterials.join(', ') || 'Stock de insumos en niveles regulares'}
- Solicitudes Urgentes de Insumos: ${projectFacts.urgentRequestsCount}
- Personal en Sitio: ${projectFacts.staffCount} colaboradores asignados (${projectFacts.staffRoles.slice(0, 4).join(', ') || 'Sin personal asignado'}).
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

    // Historial previo de conversación para este proyecto
    let conversationContext = '';
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationContext = '\nMEMORIA DE LA CONVERSACIÓN ACTUAL SOBRE ESTE PROYECTO:\n' +
        conversationHistory.map((m) => `${m.role === 'user' ? 'Administrador' : 'IA'}: ${m.text}`).join('\n') + '\n';
    }

    const promptUserInstruction = question && question.trim()
      ? `PREGUNTA ESPECÍFICA DEL ADMINISTRADOR: "${question.trim()}"\nResponde directamente a la consulta utilizando como base los hechos operativos descritos. Si se solicita simulación porcentual de gasto, efectúa el cálculo numérico exacto.`
      : 'Genera un informe completo de proyección al futuro, riesgos y recomendaciones de obra.';

    const fullPrompt = `${contextText}\n${conversationContext}\n${promptUserInstruction}`;

    // Intentar solicitud real a Gemini mediante el proxy backend con AbortController de 15s
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

    // Motor Analítico Local de CONSTRUCTA (Fallback basado en hechos reales)
    // Se ejecuta si no hay GEMINI_API_KEY o el servicio externo no está disponible.
    // NUNCA se presenta como respuesta generada por Gemini: engineType: 'AI_LOCAL_FALLBACK'
    let localReport = '';

    if (isSingleProject) {
      const qLower = (question || '').toLowerCase();

      // Si el usuario hizo una pregunta de simulación de gastos (e.g. "¿Qué pasa si el gasto aumenta 10%?")
      if (qLower.includes('aumenta') || qLower.includes('increment') || qLower.includes('%') || (qLower.includes('gasto') && qLower.includes('más'))) {
        const pctMatch = qLower.match(/(\d+)\s*%/);
        const simPct = pctMatch ? Number(pctMatch[1]) : 10;
        const currentSpent = projectFacts.totalSpent;
        const additionalSpent = currentSpent * (simPct / 100);
        const projectedTotal = currentSpent + additionalSpent;
        const projectedConsumption = projectFacts.budget > 0 ? ((projectedTotal / projectFacts.budget) * 100).toFixed(1) : 0;
        const projectedBalance = projectFacts.budget - projectedTotal;

        localReport = `
### ANÁLISIS DE SENSIBILIDAD PRESUPUESTARIA (${simPct}% DE INCREMENTO EN GASTO)
- **Gasto Actual Registrado:** $${currentSpent.toLocaleString()} MXN (${projectFacts.consumptionPct}% del presupuesto).
- **Incremento Simulado (+${simPct}%):** +$${Math.round(additionalSpent).toLocaleString()} MXN.
- **Gasto Proyectado Resultante:** $${Math.round(projectedTotal).toLocaleString()} MXN.
- **Nuevo Nivel de Consumo Presupuestario:** **${projectedConsumption}%** (Saldo proyectado: $${Math.round(projectedBalance).toLocaleString()} MXN).
- **Diagnóstico:** ${projectedTotal > projectFacts.budget
  ? `CRÍTICO: Un incremento del ${simPct}% generaría un sobrecosto de $${Math.round(Math.abs(projectedBalance)).toLocaleString()} MXN por encima del fondo autorizado. Se requiere autorización de ampliación o control de partidas.`
  : `VIABLE PERO EXIGENTE: El presupuesto absorbe el incremento, pero reduce el colchón de contingencia a $${Math.round(projectedBalance).toLocaleString()} MXN.`}

**Recomendación:** Auditar las órdenes de compra pendientes (${projectFacts.pendingDeliveryOrdersCount} en tránsito) antes de comprometer nuevos desembolsos.
`.trim();
      } else if (qLower.includes('riesgo') || qLower.includes('retras') || qLower.includes('problema') || qLower.includes('atrasad')) {
        localReport = `
### EVALUACIÓN DE RIESGOS OPERATIVOS: ${projectFacts.projectName}
1. **Riesgo Presupuestal:** ${projectFacts.isOverBudget
  ? `ALTO: La obra ya consumió el ${projectFacts.consumptionPct}% de sus fondos oficiales mientras su avance físico reporta ${projectFacts.progressPct}%.`
  : `BAJO: Consumo del ${projectFacts.consumptionPct}% congruente con el avance físico (${projectFacts.progressPct}%).`}
2. **Riesgo de Cronograma:** ${projectFacts.delayedStages > 0
  ? `MODERADO-ALTO: Presenta ${projectFacts.delayedStages} etapa(s) con estatus de retraso (${projectFacts.delayedStageDetails.join(', ')}). Riesgo de desplazar el hito contractual del ${projectFacts.endDate}.`
  : `BAJO: Las ${projectFacts.totalStages} etapas registradas se desenvuelven conforme al cronograma previsto.`}
3. **Riesgo de Cadena de Suministro:** ${projectFacts.criticalMaterials.length > 0
  ? `ALERTAS: Insumos con bajo inventario: ${projectFacts.criticalMaterials.join(', ')}.`
  : `ESTABLE: Se registran ${projectFacts.pendingDeliveryOrdersCount} órdenes pendientes de arribo en obra.`}
`.trim();
      } else if (qLower.includes('material') || qLower.includes('abastecim') || qLower.includes('compra')) {
        localReport = `
### ANÁLISIS DE MATERIALES Y ABASTECIMIENTO: ${projectFacts.projectName}
- **Órdenes de Compra Vigentes:** ${projectFacts.projectOrdersCount} órdenes por un acumulado de $${projectFacts.totalOrdersAmount.toLocaleString()} MXN.
- **Entregas Pendientes en Obra:** ${projectFacts.pendingDeliveryOrdersCount} órdenes en tránsito.
- **Proveedores Activos:** ${projectFacts.projectSupplierNames.join(', ') || 'Sin órdenes asignadas a proveedores registrados'}.
- **Insumos Críticos Detectados:** ${projectFacts.criticalMaterials.join(', ') || 'No se registran materiales con quiebre de stock para esta obra'}.
- **Solicitudes Urgentes:** ${projectFacts.urgentRequestsCount} requerimiento(s) clasificados con alta prioridad.
`.trim();
      } else if (qLower.includes('revisar primero') || qLower.includes('prioritari') || qLower.includes('atenci')) {
        localReport = `
### ATENCIÓN PRIORITARIA RECOMENDADA: ${projectFacts.projectName}
1. **${projectFacts.delayedStages > 0 ? 'CRONOGRAMA DE FASES RETRASADAS' : 'MONITOREO DE CRONOGRAMA'}:** ${projectFacts.delayedStages > 0 ? `Revisar inmediatamente ${projectFacts.delayedStageDetails.join(', ')} para reprogramar cuadrillas.` : 'Las etapas marchan al día.'}
2. **${projectFacts.isOverBudget ? 'CONTENCIÓN DE GASTO PRESUPUESTARIO' : 'SEGUIMIENTO PRESUPUESTARIO'}:** ${projectFacts.isOverBudget ? `El gasto acumula ${projectFacts.consumptionPct}% del presupuesto ($${projectFacts.totalSpent.toLocaleString()} MXN ejercido). Auditar partidas antes de autorizar nuevos pedidos.` : `Saldo saludable de $${projectFacts.budgetBalance.toLocaleString()} MXN disponible.`}
3. **LOGÍSTICA DE ARRIBO:** Dar seguimiento a ${projectFacts.pendingDeliveryOrdersCount} órdenes de compra pendientes de arribo para no detener frentes de trabajo.
`.trim();
      } else {
        localReport = `
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
      }
    } else {
      localReport = `
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

    return {
      ok: true,
      text: localReport,
      provider: 'Motor Analítico CONSTRUCTA (Fallback Hechos Operativos)',
      model: 'Inferencia Operativa Local',
      isRealGemini: false,
      engineType: 'AI_LOCAL_FALLBACK',
      facts: isSingleProject ? projectFacts : globalFacts
    };
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
