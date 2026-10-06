# CONSTRUCTA — Automatizaciones y Workflows de n8n

Este directorio contiene las integraciones de automatización y supervisión operativa para el ecosistema **CONSTRUCTA**, desacopladas de la aplicación web React/Vite.

---

## 📁 Estructura del Directorio

```text
/n8n/
├── README.md                                   # Guía general de automatizaciones n8n
├── workflows/
│   ├── CONSTRUCTA_Alerta_Operativa.json        # Workflow 01: Supervisión y alertas operativas (cada 30 min)
│   └── CONSTRUCTA_Reporte_Ejecutivo_Diario.json# Workflow 02: Reporte gerencial consolidado diario (7:00 AM)
├── docs/
│   ├── CONFIGURACION.md                        # Guía de importación, credenciales y variables de entorno
│   └── PRUEBAS.md                              # Reporte técnico y evidencia de las 7 pruebas obligatorias
└── tests/
    └── run_tests.js                            # Suite de validación y simulación automatizada
```

> **Aclaración sobre `tests/run_tests.js`:**  
> Este script complementario permite certificar la lógica determinística, la deduplicación anti-spam, la resiliencia ante caídas de la API y el ensamblado de correos en entornos CI/CD sin requerir credenciales activas de Gmail.

---

## 🚀 Workflows Implementados

### 1. `CONSTRUCTA — Alerta Operativa Automática` (`CONSTRUCTA_Alerta_Operativa`)
* **Disparador:** `Schedule Trigger` cada 30 minutos (permite también prueba manual).
* **Fuente de Datos:** API REST de CONSTRUCTA (`GET /api/db`).
* **Objetivo:** Detectar en tiempo real:
  - Obras con atraso de fecha contractual o desfase significativo de avance físico.
  - Sobrecostos presupuestarios (desviación = gasto - presupuesto, umbrales configurables al 5%, 10% y 20%).
  - Insumos en bodega agotados o por debajo del 50% del stock mínimo.
  - Órdenes de compra vencidas o pendientes de entrega por parte de proveedores.
* **Mecanismo Anti-Spam:** Almacén persistente de n8n (`$getWorkflowStaticData('global')`). Genera una clave única por alerta (`tipo + '_' + proyectoId + '_' + idProblema`) y solo despacha correo si:
  1. La alerta es nueva.
  2. Su gravedad aumentó (ej. de MEDIO a ALTO).
  3. Hubo un cambio significativo en las métricas.
  4. Transcurrieron más de 24 horas como recordatorio.
* **Notificación:** Despacho agrupado en un único correo por Gmail con plantilla HTML ejecutiva, ordenada por severidad (CRÍTICO > ALTO > MEDIO > BAJO).

---

### 2. `CONSTRUCTA — Reporte Ejecutivo Diario` (`CONSTRUCTA_Reporte_Ejecutivo_Diario`)
* **Disparador:** `Schedule Trigger` diario a las 7:00 AM (`0 7 * * *`, zona horaria configurable `America/Costa_Rica`).
* **Fuente de Datos:** API REST de CONSTRUCTA (`GET /api/db`).
* **Métricas Computadas (13 KPIs):**
  1. Proyectos totales.
  2. Proyectos activos.
  3. Proyectos finalizados.
  4. Proyectos atrasados.
  5. Avance físico promedio.
  6. Presupuesto global autorizado.
  7. Gasto real acumulado.
  8. Porcentaje de ejecución presupuestaria.
  9. Órdenes de compra pendientes y retrasadas.
  10. Materiales en nivel crítico y agotados.
  11. Solicitudes de obra pendientes y de alta prioridad.
  12. Total de riesgos consolidados.
  13. Total de riesgos clasificados como críticos.
* **Estado General:** Clasificación determinística entre `ESTABLE`, `ATENCIÓN` o `CRÍTICO`.
* **Resumen Ejecutivo:** Asistido por IA (llamada segura a `/api/ai/analyze` con directiva estricta de cero alucinaciones) y respaldado por un resumen determinístico en caso de contingencia.
* **Notificación:** Despacho gerencial diario vía Gmail con tarjeta de estado general, balances financieros, barras de avance y matriz de riesgos en formato HTML responsive.

---

## 🔒 Seguridad y Buenas Prácticas

1. **Aislamiento Total:** Ningún archivo de n8n se encuentra dentro de `src/`, ni altera componentes ni dependencias de React.
2. **Cero Secretos Hardcodeados:** Las credenciales de Gmail utilizan OAuth2 nativo de n8n (`constructa_gmail_cred`), y las URLs o destinatarios se leen desde variables de entorno.
3. **Manejo de Errores y Tolerancia a Fallos:** Si la API de CONSTRUCTA o Gmail experimentan caídas temporales, el sistema no emite falsas alarmas operativas ni pierde el historial de incidencias.
