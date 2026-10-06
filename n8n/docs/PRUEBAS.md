# Certificación Técnica de Pruebas Obligatorias (n8n — CONSTRUCTA)

Este documento detalla la ejecución, trazabilidad y resultados de las **7 Pruebas Obligatorias** ejecutadas sobre los workflows de n8n para el sistema **CONSTRUCTA**.

---

## 📊 Matriz Resumen de Pruebas

| ID | Nombre de la Prueba | Alcance Evaluado | Resultado | Estado |
| :---: | :--- | :--- | :---: | :---: |
| **P-01** | **Ejecución Manual Alerta Operativa** | Respuesta de API, procesamiento de reglas de negocio, ordenamiento de severidad y construcción de correo HTML. | **100% PASS** | ✅ APROBADA |
| **P-02** | **Ejecución Inmediata Siguiente** | Mecanismo de deduplicación anti-spam en almacén persistente. Cero correos repetidos si la situación no cambia. | **100% PASS** | ✅ APROBADA |
| **P-03** | **Inyección de Nuevo Riesgo Crítico** | Detección inmediata de nuevas desviaciones no registradas y actualización de bitácora. | **100% PASS** | ✅ APROBADA |
| **P-04** | **Ejecución Reporte Ejecutivo Diario** | Cómputo de los 13 KPIs gerenciales, balance financiero, estado general y plantilla HTML responsive. | **100% PASS** | ✅ APROBADA |
| **P-05** | **Simulación de API Caída** | Detección de `API_ERROR` sin emisión de falsas alarmas operativas ni reportes corruptos. | **100% PASS** | ✅ APROBADA |
| **P-06** | **Tolerancia a Fallos en Gmail** | Preservación de contexto y estado de alertas en el tracker ante contingencias en el proveedor de correo. | **100% PASS** | ✅ APROBADA |
| **P-07** | **Resiliencia ante Colecciones Vacías** | Comportamiento seguro y sin excepciones ante colecciones sin registros o nulas. | **100% PASS** | ✅ APROBADA |

**Resultado Global:** **66/66 aserciones aprobadas** (0 fallos).

---

## 🔬 Detalle de Ejecución por Escenario

### PRUEBA 1: Ejecutar Manualmente Alerta Operativa
* **Entrada:** Datos reales obtenidos desde `http://localhost:5173/api/db` (6 proyectos, 30 gastos, 22 materiales, 4 órdenes de compra).
* **Verificaciones:**
  - La API de CONSTRUCTA responde con código `200 OK`.
  - Se detectaron 12 situaciones operativas reales que requieren atención (ej. *Condominio Los Cedros Fase II* con fecha contractual vencida, insumos de acero y cemento por debajo de stock mínimo, órdenes de compra en camino atrasadas).
  - Las alertas se consolidaron y ordenaron jerárquicamente: `CRÍTICO` > `ALTO` > `MEDIO`.
  - Se generó el asunto profesional: `[CONSTRUCTA] 12 alertas operativas detectadas`.
  - Se estructuró el cuerpo HTML con badges de severidad, impacto y acción recomendada.
  - La bitácora persistente registró el evento con estado `ALERTA_ENVIADA`.

---

### PRUEBA 2: Ejecutar Nuevamente Inmediatamente (Deduplicación / Cero Spam)
* **Entrada:** Misma base de datos de CONSTRUCTA ejecutada de forma consecutiva (simulando la ejecución automática de los siguientes 30 minutos).
* **Verificaciones:**
  - El almacén estático persistente identificó que los 12 `alertKey` ya habían sido notificados.
  - No hubo incremento de severidad ni transcurrieron las 24 horas del recordatorio periódico.
  - `shouldSendEmail = false`.
  - **No se envió correo duplicado.**
  - La ejecución concluyó con estado registrado: `SIN_ALERTAS`.

---

### PRUEBA 3: Inyección de Condición de Riesgo Crítico
* **Entrada:** Adición de un nuevo proyecto (`Hospital de Emergencias Norte`) con fecha límite expirada y gastos que superan en un 50% su presupuesto autorizado.
* **Verificaciones:**
  - El motor analítico identificó inmediatamente la nueva clave `SOBRECOSTO_PRESUPUESTO_PRJ-TEST-CRITICO_EXCESO_50PCT`.
  - Clasificó la alerta con nivel `CRÍTICO`.
  - Habilitó el despacho de un nuevo correo (`shouldSendEmail = true`).
  - La bitácora registró el nuevo evento como `ALERTA_ENVIADA`.

---

### PRUEBA 4: Ejecutar Reporte Ejecutivo Diario
* **Entrada:** Datos operativos consolidados de CONSTRUCTA.
* **Métricas Verificadas:**
  1. Total de Proyectos: `6`.
  2. Proyectos Activos: `5`.
  3. Proyectos Finalizados: `1` (*Centro Logístico Industrial Norte*).
  4. Proyectos Atrasados: `1` (*Condominio Los Cedros Fase II*).
  5. Avance Físico Promedio: `72%`.
  6. Presupuesto Total: `$36,017,000 MXN`.
  7. Gasto Acumulado: `$16,910,000.6 MXN`.
  8. Ejecución Presupuestaria: `47.0%`.
  9. Órdenes de Compra Pendientes: `4` (`2` con atraso de arribo).
  10. Materiales Críticos: `19` insumos con stock por debajo del mínimo.
  11. Solicitudes Pendientes: `3` solicitudes comerciales y `4` requerimientos de materiales.
  12. Total de Riesgos: `4`.
  13. Riesgos Críticos: `2`.
* **Estado General Computado:** `CRÍTICO` (derivado de la presencia de atraso contractual en obras activas).
* **Verificaciones:** Plantilla HTML completa y sin etiquetas `undefined`.

---

### PRUEBA 5: Resiliencia ante API Caída
* **Entrada:** Simulación de fallo en el servicio backend (`ECONNREFUSED connect 127.0.0.1:5173`, HTTP 503).
* **Verificaciones:**
  - El nodo de análisis detectó el fallo sin interrumpir la ejecución con excepciones no controladas.
  - **No se emitieron falsas alertas operativas.**
  - Se registró en la bitácora técnica con estado: `API_ERROR`.

---

### PRUEBA 6: Trazabilidad ante Fallo de Correo (Gmail)
* **Verificaciones:**
  - Nodo Gmail configurado con `onError: continueRegularOutput`.
  - Si el token o la cuota de Gmail fallan, el flujo no pierde el estado de las alertas detectadas en `staticData.alertTracker`.
  - La próxima ejecución puede reintentar el despacho sin pérdida de información histórica.

---

### PRUEBA 7: Resiliencia ante Colecciones Vacías o Nulas
* **Entrada:** Objeto con arrays vacíos (`projects: []`, `expenses: []`, `materials: []`, etc.).
* **Verificaciones:**
  - Cero divisiones por cero en cálculos de porcentaje.
  - Cero alertas disparadas (`shouldSendEmail = false`).
  - Estado general clasificado como `ESTABLE`.
  - Resumen ejecutivo determinístico generado correctamente.

---

## 🛠️ Comando para Reproducir las Pruebas

Para re-ejecutar la suite completa de pruebas en cualquier momento:

```powershell
node n8n/tests/run_tests.js
```
