# CONSTRUCTA — RESUMEN DE PROMPTS Y REQUERIMIENTOS DEL SISTEMA

Este documento recopila de forma estructurada, detallada y cronológica la información esencial de cada uno de los prompts entregados durante el ciclo de vida del proyecto **CONSTRUCTA — Sistema de Gestión para Empresa Constructora**.

---

## Índice Cronológico de Prompts

1. [Prompt 1: Prompt Maestro — Desarrollo Completo desde Cero (Antigravity 3.8 High)](#1-prompt-1--prompt-maestro--desarrollo-completo-desde-cero)
2. [Prompt 2: Solicitud de Diagnóstico y Resumen de Errores](#2-prompt-2--solicitud-de-diagnóstico-y-resumen-de-errores)
3. [Prompt 3: Fase de Pulido Visual, Responsive y Experiencia de Usuario](#3-prompt-3--fase-de-pulido-visual-responsive-y-experiencia-de-usuario)
4. [Prompt 4: Consolidación y Documentación Histórica en `prompts.md`](#4-prompt-4--consolidación-y-documentación-histórica)

---

## 1. Prompt 1 — Prompt Maestro: Desarrollo Completo desde Cero

* **Fecha de emisión:** Inicio del proyecto.
* **Rol asignado:** Desarrollador Frontend Senior.
* **Premisa inquebrantable:** Construir desde cero una aplicación web empresarial SPA completa llamada **CONSTRUCTA**, sin asumir código previo, empaquetada íntegramente dentro del directorio `Constructa/`.

### 1.1. Objetivo General y Pila Tecnológica
* **Propósito:** Software para gestión integral de una constructora: obras, cuadrillas de personal, insumos de almacén, compras, subcontratas, presupuestos, flujos de caja, avance físico y reportes ejecutivos.
* **Tecnologías:**
  * **Core:** React 18+ (SPA moderna) con Vite como empaquetador ultrarrápido.
  * **Iconografía:** Lucide React (vectorial corporativa).
  * **Estilos:** CSS puro modular / Vanilla CSS estructurado (sin Tailwind no solicitado), con variables semánticas HSL y tokens de diseño.
  * **Persistencia:** `localStorage` local con normalización de esquema, sincronización y semillas automáticas.
  * **Navegación:** Enrutamiento interno por hash (`#dashboard`, `#proyectos`, `#empleados`, etc.) con interceptores de autenticación y páginas de estado HTTP.

### 1.2. Identidad Visual: "Negro Elegante Corporativo"
* **Paleta de color obligatoria:**
  * Fondos: Obsidiana profundo (`#0a0d14`), paneles y tarjetas (`#111724` / `#131926`), bordes sutiles (`#1e293b` / `#25334d`).
  * Tipografía: Texto principal blanco puro (`#ffffff`), texto secundario gris pizarra (`#94a3b8`).
  * Acentos empresariales: Dorado / Ámbar (`#f59e0b`), Esmeralda para estados positivos (`#10b981`), Rojo / Escarlata para alertas y stock bajo (`#ef4444`), Cian / Azul para datos informativos (`#38bdf8`).
* **Regla de oro:** Cero controles nativos grises o blancos del navegador; estética sobria, seria y de alto impacto visual sin sensación de plantilla genérica.

### 1.3. Seguridad, Sesión y Control de Acceso
* **Login Corporativo:** Credenciales de demostración preconfiguradas:
  * **Usuario:** `admin@constructa.com`
  * **Contraseña:** `admin`
  * Rol: Administrador General / Director de Obra.
* **Protección de Rutas y Páginas de Estado:**
  * `401 — Sesión no iniciada:` Al intentar acceder a cualquier ruta protegida sin sesión activa.
  * `403 — Acceso no autorizado:` Al intentar realizar operaciones restringidas sin permisos.
  * `404 — Página no encontrada:` En caso de hashes inválidos o rutas inexistentes.
* **Cierre de sesión:** Flujo con confirmación modal centrada, destrucción de tokens de sesión y redirección obligatoria a `#login`.

### 1.4. Módulos Funcionales Exigidos

| Módulo | Especificaciones Clave del Requerimiento |
| :--- | :--- |
| **Dashboard** | 8 tarjetas KPI interconectadas (Proyectos Activos, Finalizados, Personal Total, Insumos, Stock Bajo, Presupuesto Total, Gastado, Disponible), 2 gráficos de barras conectadas y tabla de historial reciente con enlaces a reportes. |
| **Proyectos** | 6 obras iniciales completas (Torre Boreal, Residencial Las Acacias, Centro Logístico Norte, etc.). Vistas en tarjetas y tabla, barra de avance, clientes, responsables, presupuestos y modal de detalle completo. |
| **Personal y Cuadrillas** | Mínimo 60 colaboradores ficticios (se implementaron 62) con DNI único, roles (ingenieros, albañiles, electricistas, etc.), horarios de turno, días laborales, proyecto asignado y estados (Activo, Descanso, Licencia). |
| **Materiales** | Catálogo con 22 insumos reales del rubro de la construcción, cada uno con render 3D de alta fidelidad, control de stock actual, stock mínimo, precio unitario, alertas de reorden y modal de movimientos Kardex. |
| **Proveedores** | Directorio de empresas distribuidoras y subcontratistas homologadas con contacto, teléfono, correo, CIF/RFC y materiales provistos. |
| **Presupuestos** | Análisis financiero de los 6 proyectos: fondos autorizados, gastos ejecutados, balances remanentes, indicadores de alerta por sobrecosto y barras de ejecución. |
| **Gastos** | Registro de comprobantes y facturas con categorías (Materiales, Mano de obra, Transporte, Herramientas, Servicios, Otros), proyecto asociado, monto e impacto automático en presupuestos. |
| **Cronograma** | Línea de tiempo tipo Gantt / actividades con fechas de inicio, finalización, responsable, estado (Pendiente, En progreso, Completada, Retrasada) y porcentaje. |
| **Avance de Obra** | Certificación porcentual física de obras (0% a 100%), etapas constructivas (cimentación, estructura, acabados, entrega) y modal para actualizar avance en tiempo real. |
| **Reportes y Estadísticas** | Centro tipo hoja de cálculo con 6 pestañas temáticas, matrices de consolidación, filtros por obra, botón de impresión y exportación en formato CSV descargable. |

### 1.5. Reglas de Interactividad y Experiencia
* Todos los botones deben tener acción real (nada puramente decorativo).
* Búsqueda en vivo combinada con filtros de selección múltiple.
* Diálogos de confirmación modales antes de eliminar o dar de baja cualquier registro.
* Sistema de notificaciones toast flotantes para éxito, advertencia y error.

---

## 2. Prompt 2 — Solicitud de Diagnóstico y Resumen de Errores

* **Fecha de emisión:** Intermedia (tras primera entrega del código base).
* **Instrucción textual del usuario:** *"dame un md en resumen de lo que hiciste, ya que miro varios errores"*.
* **Objetivo:** Analizar exhaustivamente el estado de la aplicación, identificar desajustes visuales o funcionales y elaborar un diagnóstico técnico documentado en `resumen_desarrollo_y_correcciones.md`.

### 2.1. Hallazgos y Diagnóstico Técnico Realizado

1. **Desplegables `<select>` Nativos Grises:**
   * Los `<select>` del navegador mantenían el tema gris de Windows, rompiendo la identidad visual oscura.
2. **Duplicidad de Cierre de Sesión:**
   * Existían dos botones de cierre de sesión: uno en el encabezado superior derecho y otro en el pie del sidebar.
3. **Accesos Rápidos del Dashboard:**
   * Los 4 botones de la barra de accesos rápidos carecían del paso de parámetros necesario para abrir directamente las acciones requeridas (como abrir el modal de nuevo gasto o filtrar horarios de personal).
4. **Desbordamiento Horizontal en Dispositivos Móviles:**
   * Tablas financieras extensas y rejillas rígidas provocaban scroll horizontal en toda la página en resoluciones estrechas (< 480px).
5. **Normalización de Nombres de Propiedades:**
   * Se requirió blindar alias bidireccionales entre servicios y componentes (`fechaFin` vs `fechaFinEstimada`, `stock` vs `stockActual`, `imagen` vs `imagenKey`, `monto` vs `presupuesto`).

---

## 3. Prompt 3 — Fase de Pulido Visual, Responsive y Experiencia de Usuario

* **Fecha de emisión:** Fase de Refinamiento y Optimización.
* **Premisa fundamental:** **CONSTRUCTA YA EXISTE Y FUNCIONA**. No borrar el proyecto, no rehacer desde cero, no eliminar los 62 empleados, los 22 materiales ni sus imágenes 3D, no alterar la lógica matemática de presupuestos. Solo pulir, adaptar y elevar la calidad visual.

### 3.1. Requerimientos Esenciales y Decisiones de Diseño

#### A. Cierre de Sesión Único (Requerimientos #4 y #5)
* **Eliminación:** Suprimir definitivamente el botón "Cerrar sesión" del encabezado superior derecho.
* **Conservación:** Mantener **únicamente** el acceso de cierre de sesión en el bloque de usuario del sidebar (inferior izquierdo en escritorio y dentro de la navegación desplegable en móvil).
* **Comportamiento:** Diálogo de confirmación centrado estilo obsidiana, limpieza de sesión y protección de rutas.

#### B. Corrección Universal de Selects (Requerimiento #3)
* Eliminar el estilo gris nativo en **TODOS** los desplegables de la aplicación.
* Implementar fondo oscuro (`#0e1420`), texto blanco, borde sutil (`rgba(255, 255, 255, 0.16)`), estado focus ámbar y flecha chevron SVG dorada incrustada como vector.

#### C. Dashboard — Accesos Rápidos Conectados (Requerimiento #6, #7, #8, #9)
* **Explorar Proyectos:** Redirecciona directamente a `#proyectos`.
* **Registrar Gasto:** Navega a `#gastos` y **abre automáticamente el modal de creación de gasto**.
* **Gestionar Materiales:** Redirecciona directamente a `#materiales`.
* **Ver Horarios de Personal:** Navega a `#empleados` activando automáticamente la vista de **Horarios / Agenda**.
* **Revisar Inventario:** Navega a `#materiales` filtrando inmediatamente los insumos con stock crítico o bajo.
* **KPIs Interactivos:** Las 8 tarjetas deben contar con cursor interactivo y navegación a sus módulos correspondientes.
* **Gráficos adaptables:** Ancho 100% y visualización optimizada para proyección y pantallas táctiles.

#### D. Personal y Cuadrillas en Móvil (Requerimientos #13, #14, #15)
* **Filtros en móvil:** Reemplazar los 4 selects en línea por un botón compacto **"Filtros"** que despliega un cajón oscuro ordenado con selector de proyectos, especialidades y estados, más botón para limpiar.
* **Vista Horarios:** En escritorio se mantiene la tabla corporativa; en móvil se activa la vista por **tarjetas adaptativas de horario** con datos prioritarios (nombre, puesto, proyecto, días y horario destacado en píldora) y botones de acción cómodos para touch.

#### E. Proyectos (Requerimiento #16)
* Las tarjetas de proyecto deben priorizar:
  1. Nombre y código de obra.
  2. Estado con distintivo visual.
  3. Barra de avance.
  4. Presupuesto asignado.
  5. **Monto gastado acumulado** en tiempo real.
  6. **Plazo / Fecha relevante** de entrega.

#### F. Regla General Contra el Scroll Horizontal (Requerimiento #23)
* Prohibición absoluta de desbordamiento horizontal en el cuerpo de la página (`body width > viewport`).
* Tablas extensas encapsuladas dentro de contenedores locales (`.constructa-table-container`) con desplazamiento horizontal interno suave.

#### G. Formularios y Modales Responsive (Requerimientos #24 y #25)
* Formularios colapsables a una sola columna en pantallas móviles.
* Modales adaptados a pantallas de teléfonos (`max-height: 94vh`, cabecera visible, cuerpo desplazable y botones táctiles verticales en el pie).

#### H. Lenguaje Empresarial de Estados (Requerimiento #26)
* Prohibición de mostrar textos técnicos, errores de código, objetos JSON, o menciones a `localStorage` al usuario. Uso exclusivo de mensajes empresariales claros.

---

## 4. Prompt 4 — Consolidación y Documentación Histórica

* **Fecha de emisión:** Actual.
* **Instrucción textual del usuario:** *"quiero que metas el resumen de cada prompt de la parte importante en el md, no toques codigo. Solo mete la informacion en el archivo llamado prompts.md (que sea la informacion importante)"*.
* **Restricciones:**
  * **No tocar código fuente** (`.jsx`, `.js`, `.css`, etc.).
  * Concentrar toda la información esencial, reglas y arquitectura en el archivo [`prompts.md`](file:///c:/Users/Foward/Desktop/ProyectoFinal-fronted/Constructa/prompts.md).
* **Resultado:** Creación de este compendio maestro que centraliza los lineamientos de los cuatro prompts recibidos, sirviendo como guía de referencia del sistema CONSTRUCTA.

---

> **CONSTRUCTA — Sistema de Gestión para Empresa Constructora**  
> Documento generado como memoria técnica del proyecto.
