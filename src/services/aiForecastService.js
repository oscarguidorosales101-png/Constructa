/**
 * CONSTRUCTA - aiForecastService
 * Módulo de Proyección Operativa y Presupuestaria con IA (Gemini)
 * Exclusivo para Administrador General.
 */

import { aiService } from './aiService.js';

export const aiForecastService = {
  /**
   * Construye indicadores cuantitativos exactos a partir de datos operacionales de CONSTRUCTA
   */
  buildOperationalSummary({ projects = [], expenses = [], materials = [], schedule = [] }) {
    const totalProyectos = projects.length;
    const proyectosActivos = projects.filter(
      (p) => p.estado === 'En progreso' || p.estado === 'Activo' || p.estado === 'En ejecución' || p.estado === 'En Ejecución'
    ).length;

    const presupuestoTotal = projects.reduce((acc, p) => acc + Number(p.presupuesto || 0), 0);
    const gastoTotal = expenses.reduce((acc, e) => acc + Number(e.monto || 0), 0);
    const consumoPresupuestarioPct = presupuestoTotal > 0 ? (gastoTotal / presupuestoTotal) * 100 : 0;
    const avancePromedio = totalProyectos > 0 ? projects.reduce((acc, p) => acc + Number(p.avance || 0), 0) / totalProyectos : 0;

    const materialesCriticos = materials.filter((m) => {
      const actual = Number(m.stockActual ?? m.stock ?? 0);
      const min = Number(m.stockMinimo ?? 0);
      return min > 0 && actual <= min;
    }).length;

    return {
      totalProyectos,
      proyectosActivos,
      presupuestoTotal,
      gastoTotal,
      consumoPresupuestarioPct: Number(consumoPresupuestarioPct.toFixed(1)),
      avancePromedio: Number(avancePromedio.toFixed(1)),
      materialesCriticos
    };
  },

  /**
   * Genera proyección al futuro interactuando con el proxy de IA del servidor
   */
  async generateProjection(operationalData) {
    try {
      const proxyRes = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Proyección futura',
          action: 'analizar'
        })
      });

      if (!proxyRes.ok) {
        const errorData = await proxyRes.json().catch(() => ({}));
        return {
          ok: false,
          error: errorData.error || 'Servicio de IA no disponible o no configurada en el servidor'
        };
      }

      const resJson = await proxyRes.json();
      if (resJson.data) {
        return {
          ok: true,
          data: resJson.data
        };
      }
      return {
        ok: true,
        data: {
          resumenEjecutivo: resJson.text || 'Análisis completado',
          desviacionesPresupuestarias: [],
          materialesCriticos: []
        }
      };
    } catch (err) {
      return {
        ok: false,
        error: 'Error de conexión con el servicio de IA'
      };
    }
  }
};

export default aiForecastService;
