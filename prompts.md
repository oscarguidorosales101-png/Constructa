# CONSTRUCTA — RESUMEN DE PROMPTS Y REQUERIMIENTOS DEL SISTEMA

Este documento recopila de forma estructurada, detallada y cronológica la información esencial de cada uno de los prompts entregados durante el ciclo de vida del proyecto **CONSTRUCTA — Sistema de Gestión para Empresa Constructora**.

---

## Índice Cronológico de Prompts

1. [Prompt 1: Prompt Maestro — Desarrollo Completo desde Cero (Antigravity 3.8 High)](#1-prompt-1--prompt-maestro--desarrollo-completo-desde-cero)
2. [Prompt 2: Solicitud de Diagnóstico y Resumen de Errores](#2-prompt-2--solicitud-de-diagnóstico-y-resumen-de-errores)
3. [Prompt 3: Fase de Pulido Visual, Responsive y Experiencia de Usuario](#3-prompt-3--fase-de-pulido-visual-responsive-y-experiencia-de-usuario)
4. [Prompt 4: Consolidación y Documentación Histórica en `prompts.md`](#4-prompt-4--consolidación-y-documentación-histórica)
5. [Prompt 5: Ampliación Profesional del Sistema Existente (Roles, Migración de Entrevistas, Agenda y Disponibilidad)](#5-prompt-5--ampliación-profesional-del-sistema-existente)
6. [Prompt 6: Ampliación Controlada — Proveedores, Compras, Pagos y Navegación](#6-prompt-6--ampliación-controlada--proveedores-compras-pagos-y-navegación)
7. [Prompt 7: Ajuste Profesional — Directorio de Proveedores y Dimensiones de Interfaz](#7-prompt-7--ajuste-profesional--directorio-de-proveedores-y-dimensiones-de-interfaz)
8. [Prompt 8: Prompt Maestro Unificado — Integración del Sitio Público, Área Privada, Autenticación, RRHH, Reclutamiento y Experiencia Empresarial](#8-prompt-8--prompt-maestro-unificado)

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

4. [Prompt 4: Consolidación y Documentación Histórica en `prompts.md`](#4-prompt-4--consolidación-y-documentación-histórica)
5. [Prompt 5: Ampliación Profesional del Sistema Existente (Roles, Migración de Entrevistas, Agenda y Disponibilidad)](#5-prompt-5--ampliación-profesional-del-sistema-existente)

---

## 4. Prompt 4 — Consolidación y Documentación Histórica

* **Fecha de emisión:** Intermedia.
* **Instrucción textual del usuario:** *"quiero que metas el resumen de cada prompt de la parte importante en el md, no toques codigo. Solo mete la informacion en el archivo llamado prompts.md (que sea la informacion importante)"*.
* **Restricciones:**
  * **No tocar código fuente** (`.jsx`, `.js`, `.css`, etc.).
  * Concentrar toda la información esencial, reglas y arquitectura en el archivo [`prompts.md`](file:///c:/Users/Foward/Desktop/ProyectoFinal-fronted/Constructa/prompts.md).
* **Resultado:** Creación del compendio maestro que centraliza los lineamientos de los prompts recibidos.

---

## 5. Prompt 5 — Ampliación Profesional del Sistema Existente

* **Fecha de emisión:** Fase de Ampliación y Maduración Arquitectónica.
* **Premisa crítica:** **EXTENDER SIN ROMPER**. No reconstruir desde cero, no eliminar los 62 colaboradores, los 22 materiales ni sus imágenes 3D, no alterar presupuestos ni cálculos financieros. Reutilizar antes de duplicar, migrar antes de eliminar.

### 5.1. Organización de Roles y Usuarios Autorizados
* **Regla estricta:** Diferenciar claramente **Empleado** (registro laboral de campo) vs **Usuario** (persona autorizada para acceder al sistema). Cero creación de cuentas para los 60+ colaboradores de obra.
* **Los 3 Roles y Cuentas Principales:**
  1. **Administrador (`admin@constructa.com` / `admin123`):**
     * Dirección General de Operaciones (Ing. Fernando Mendoza).
     * Gestión ejecutiva global: Proyectos, Empleados, Almacén, Proveedores, Presupuestos, Gastos, Cronograma, Avance, Reportes y Agenda.
     * Retiro de la administración directa de entrevistas tras la migración a RRHH.
  2. **Gerente de Construcción (`gerente@constructa.com` / `gerente123`):**
     * Gerente de Construcción y Operaciones (Ing. Carlos Mendoza Rivas).
     * Gestión operativa: Proyectos en ejecución, Avance de obra, Cuadrillas y horarios, Materiales y stock crítico, Proveedores, Gastos de proyectos, Cronograma y Agenda operativa.
     * Sin acceso a presupuestos financieros globales ni administración de usuarios/entrevistas. Puede participar como entrevistador técnico.
  3. **RRHH / Reclutamiento (`rrhh@constructa.com` / `rrhh123`):**
     * Coordinadora de Talento y Selección (Lic. Mariana Morales Solís).
     * Gestión de talento: Candidatos (postulantes), procesos de selección, Entrevistas laborales, Agenda de citas, consulta de plantilla y conversión de candidatos seleccionados a empleados.
     * Sin acceso a finanzas, compras, materiales ni cronogramas de obra.

### 5.2. Migración de la Funcionalidad de Entrevistas (Pasos 1 al 8)
1. **Paso 1:** Localización de la funcionalidad original en el sistema (`src/pages/Interviews/`).
2. **Paso 2:** Creación y configuración del rol RRHH / Reclutamiento.
3. **Paso 3:** Habilitación del acceso exclusivo de RRHH a Entrevistas y Candidatos.
4. **Paso 4:** Reutilización y conexión de componentes existentes (`ScheduleInterviewModal`, `InterviewResultModal`, etc.).
5. **Paso 5:** Verificación de capacidades de RRHH: programar, reprogramar, cancelar, registrar resultados y evaluar.
6. **Paso 6:** Validación de que el Administrador y el resto del sistema continúan funcionando al 100%.
7. **Paso 7:** Retiro de "Entrevistas" y "Candidatos" del menú y navegación del Administrador.
8. **Paso 8:** Comprobación definitiva: Administrador ya no administra directamente entrevistas; RRHH sí las administra. Cero duplicidad entre ambos roles.

### 5.3. Agenda Central Unificada (`#agenda`)
* Calendario y agenda centralizada que consolida cuatro fuentes en una sola vista:
  * **Entrevistas Laborales** (programadas por RRHH con candidato, hora y entrevistador).
  * **Reuniones de Obra** (coordinación de contratistas, comités de obra).
  * **Visitas Técnicas** (inspecciones estructurales, seguridad ambiental).
  * **Hitos de Proyecto** (fechas clave sincronizadas con el cronograma).
* Filtros paramétricos: `Todas`, `Entrevistas`, `Proyectos`, `Reuniones`, `Visitas`.
* Vistas por línea de tiempo cronológica y tarjetas ejecutivas.
* Registro de nuevas reuniones y visitas con validación de solapamiento de horarios.

### 5.4. Control de Disponibilidad y Detección de Conflictos
* Comprobación reactiva y cruzada antes de agendar o reprogramar cualquier entrevista o reunión.
* Si el entrevistador (ej. Ing. Carlos Mendoza) tiene ya asignada una reunión a las 09:00, una entrevista a las 10:00 o una visita a las 11:00, el sistema bloquea el horario y muestra un mensaje claro y comprensible:
  > *"Horario no disponible. El entrevistador ya tiene una actividad programada para este horario."*

### 5.5. Flujo de Contratación: Candidato Seleccionado → Empleado
* Cuando un candidato es dictaminado como favorable o seleccionado, se habilita la acción *"Contratar y Dar de Alta como Empleado"*.
* Se precargan automáticamente sus datos (nombre, DNI, teléfono, correo, puesto solicitado) y se completan las condiciones laborales (fecha de ingreso, jornada, horario, proyecto asignado y salario).
* Se da de alta en la nómina de personal (`employees`) sin alterar ni borrar a los 62 colaboradores iniciales, vinculando el ID en el expediente de selección.

### 5.6. Dashboards Adaptativos por Rol
* **Administrador:** Panel Corporativo con 8 KPIs, gráficos de balances y gastos, historial de operaciones y accesos rápidos globales.
* **Gerente de Construcción:** Panel Operativo con 7 KPIs de campo, alertas de stock bajo, sección "Mi Agenda Operativa y Entrevistas Asignadas" y gráficos de avance físico.
* **RRHH / Reclutamiento:** Panel de Talento con 6 KPIs de selección, widgets de "Próximas Citas de Entrevista" y "Candidatos en Proceso".

### 5.7. Control de Acceso Paramétrico (401, 403, 404)
* Implementación de [`src/utils/permissions.js`](file:///c:/Users/Foward/Desktop/ProyectoFinal-fronted/Constructa/src/utils/permissions.js) con matriz estricta por rol.
* **401:** Acceso no autenticado a cualquier sección privada.
* **403:** Usuario autenticado intentando acceder a una sección fuera de sus permisos (ej. Admin entrando a `#entrevistas`, Gerente entrando a `#presupuestos`, o RRHH entrando a `#materiales`).
* **404:** Rutas inexistentes.

---

## 6. Prompt 6 — Ampliación Controlada: Proveedores, Compras, Pagos y Navegación

* **Fecha de emisión:** Fase de Cadena de Suministro y Finanzas de Abastecimiento.
* **Premisas críticas e inquebrantables:**
  * **NO** modificar ni crear nuevos roles de usuario (se mantienen estrictamente Administrador, Gerente de Construcción y RRHH / Reclutamiento).
  * **NO** modificar la estructura de roles ya definida anteriormente.
  * **NO** alterar la migración de Entrevistas ya establecida.
  * **NO** crear cuentas para proveedores ni simular conexiones bancarias o transacciones con dinero real (flujo administrativo simulado internamente).
  * **NO** eliminar ni duplicar empleados (62), materiales (22) ni proyectos (6).
  * **Extender** el módulo de Proveedores para convertirlo de un simple directorio a un **Centro Integral de Abastecimiento y Seguimiento de Proveedores**.

---

### 6.1. Proveedores como Módulo Funcional y Perfil Comercial 360°
* **Evolución del módulo:** Pasa de ser una tarjeta estática de directorio a un centro de inteligencia de compras con 5 sub-vistas operativas:
  1. **Directorio:** Catálogo de proveedores homologados con filtros por especialidad y estado comercial.
  2. **Solicitudes:** Requerimientos de insumos originados desde obra o por alertas automáticas de inventario.
  3. **Órdenes de Compra:** Gestión de pedidos con cálculo de subtotal, IVA 16% y total.
  4. **Recepción:** Verificación física en obra con comparación entre lo pedido y lo recibido.
  5. **Facturas:** Cotejo tripartito (3-Way Match), validación fiscal y programación de pagos.
* **Atributos comerciales obligatorios por proveedor:**
  * Nombre de empresa / razón social y persona de contacto directo.
  * Teléfono, correo electrónico y dirección física.
  * Insumos y materiales que suministra.
  * **Condiciones de pago** (Contado, Crédito 15 días, Crédito 30 días, Crédito 45 días, Crédito 60 días).
  * **Tiempo estimado de entrega** (ej. 24 a 48 hrs, 3 a 5 días hábiles).
  * **Método habitual de contacto** (Llamada, Correo electrónico, WhatsApp / Mensaje, Presencial).
  * **Horario de atención** y observaciones comerciales.
  * Historial 360° interconectado: pedidos emitidos, entregas recibidas, incidencias y facturas/pagos asociados.
  * Resumen financiero en tiempo real: Pedidos activos, entregados, facturación pendiente, pagos programados, pagados y saldo pendiente.

---

### 6.2. Contacto con Proveedores y Bitácora de Comunicaciones
* **Registro administrativo sin dependencias externas:** Al no contar con backend de mensajería real, el sistema provee herramientas para:
  * Preparar contacto con copiado rápido al portapapeles de teléfonos, correos y números de orden.
  * Registrar formalmente la interacción realizada:
    * Fecha y hora exacta.
    * Medio utilizado (Llamada telefónica, Correo electrónico, Mensaje / WhatsApp, Visita presencial u Otro).
    * Persona de contacto interlocutora.
    * Motivo de la comunicación (Cotización, Confirmación de orden, Seguimiento de entrega, Reclamo por faltante, Coordinación de pago).
    * Resultado obtenido (Disponibilidad confirmada, Entrega reprogramada, Precio ratificado, Modificación solicitada, Sin respuesta).
    * Observaciones detalladas.

---

### 6.3. Solicitud de Materiales y Conexión con Alertas de Stock
* **Flujo de solicitud:** Generación de requerimientos de abastecimiento vinculados a un proyecto o a reposición de almacén central.
* **Estados de la solicitud:** `Pendiente`, `En revisión`, `Aprobada`, `Rechazada`, `Convertida en pedido`.
* **Conexión con Alerta de Stock (Requisito #5):**
  * Cuando un material alcanza o cae por debajo de su stock mínimo de seguridad, la alerta visual en el catálogo de materiales y en el dashboard ofrece la acción directa: **"Solicitar Reposición"**.
  * Al activarla, el sistema navega automáticamente a la pestaña de solicitudes de proveedores, abre el modal de solicitud y precarga:
    * El material crítico seleccionado.
    * La cantidad sugerida calculada automáticamente (`(stockMinimo * 2) - stockActual`).
    * La unidad de medida oficial.
    * El proveedor homologado sugerido.
    * El origen marcado como *"Alerta de Stock"*.
  * No crea lógicas independientes de inventario; utiliza la base existente de almacén.

---

### 6.4. Órdenes de Compra y Seguimiento Logístico
* **Generación de la Orden:** Una solicitud aprobada se puede convertir directamente en orden de compra, o crearse de forma independiente con múltiples líneas de insumos, cantidades, precios unitarios de referencia, subtotal, IVA (16%) y total.
* **Estados de la Orden de Compra:**
  1. `Borrador`
  2. `Pendiente de aprobación`
  3. `Aprobada`
  4. `Enviada al proveedor`
  5. `Confirmada`
  6. `Preparando pedido`
  7. `En camino`
  8. `Entregada`
  9. `Recibida parcialmente`
  10. `Cancelada`
* **Línea de Tiempo y Trazabilidad:** Modal especializado de seguimiento que visualiza la progresión clara del pedido:
  > Solicitud → Aprobación → Orden enviada → Confirmada → Preparando → En camino → Recibida
* **Confirmación explícita del proveedor:** Registro de confirmación de disponibilidad, cantidad, precio, fecha de entrega y control de modificaciones o falta de respuesta.
* **Fechas de Entrega y Alertas de Retraso:** Registro de fecha solicitada, prometida y real. Si la fecha prometida excede la solicitada, se activa una alerta visual destacada indicando posible impacto en el cronograma constructivo.

---

### 6.5. Recepción Física de Materiales, Incidencias y Actualización de Inventario
* **Verificación estricta en obra:** Modal de recepción que compara la **Cantidad Pedida** contra la **Cantidad Realmente Recibida** por cada ítem.
* **Detección automática de entrega parcial:** Si alguna cantidad recibida es inferior a la solicitada, la orden pasa a estado `Recibida parcialmente` con aviso de advertencia.
* **Registro de Incidencias:** Posibilidad de registrar formalmente incidencias categorizadas:
  * `Faltante de material`
  * `Exceso no solicitado`
  * `Material incorrecto o fuera de especificación`
  * `Material dañado o defectuoso`
  * `Entrega con retraso`
  * `Otro inconveniente`
* **Regla Crítica de Inventario (Requisito #13):**
  * El inventario físico se incrementa **únicamente por las unidades efectivamente recibidas**.
  * Si se pidieron 100 sacos y llegaron 98, el almacén aumenta exactamente en 98 unidades.
  * La actualización se canaliza a través del Kardex institucional (`registerStockMovement`), registrando la entrada formal vinculada a la orden de compra y proveedor sin duplicar lógica.

---

### 6.6. Facturas de Proveedores y Validación "3-Way Match" (Cotejo Tripartito)
* **Registro de Factura:** Folio fiscal, proveedor, orden de compra relacionada, fecha de emisión, fecha de vencimiento, subtotal, impuestos, total, método de pago y observaciones.
* **Control 3-Way Match (Requisito #17):**
  * Cotejo automatizado entre:
    1. **Orden de Compra:** ¿Qué se autorizó y a qué precio?
    2. **Recepción en Almacén:** ¿Qué mercancía física ingresó realmente?
    3. **Factura Comercial:** ¿Qué concepto y monto está cobrando el proveedor?
  * Si se detectan discrepancias (ej. el proveedor factura 100 unidades pero solo se recibieron 98, o el precio unitario cobrado no coincide con la orden acordada), el sistema despliega un banner de advertencia crítico:
    > *"Diferencia detectada: Revisa la orden, la recepción y la factura antes de continuar."*
  * **Bloqueo preventivo:** El sistema no permite programar ni autorizar el pago de la factura mientras existan discrepancias pendientes de resolución.

---

### 6.7. Flujo Administrativo Automatizado de Pagos
* **Proceso paso a paso:**
  > Factura recibida → Revisión → Validación 3-Way Match → Aprobación → Programada para pago → Pagada
* **Cálculo automático de fecha de pago (Requisito #19):** Según las condiciones comerciales del proveedor (Contado: mismo día; 15, 30, 45 o 60 días), el sistema calcula automáticamente la fecha prevista de pago a partir de la emisión de la factura, permitiendo ajustes explícitos si la dirección lo autoriza.
* **Sección de Pagos Programados:** Clasificación clara de facturas y obligaciones en: `Próximos a vencer`, `Vencidos`, `Pagados` y `En espera`.
* **Procesamiento de Pago Administrativo:** Al alcanzar la fecha programada y validarse la orden, se ejecuta el cambio de estado a `Pagada` con registro de fecha real y método de pago (Transferencia SPEI, Cheque corporativo, etc.). Cero transferencias bancarias reales.

---

### 6.8. Navegación Estandarizada mediante Botón "← Regresar"
* **Componente centralizado:** Implementación de [`src/components/common/BackButton.jsx`](file:///c:/Users/Foward/Desktop/ProyectoFinal-fronted/Constructa/src/components/common/BackButton.jsx) con estética oscura, borde sutil y tipografía gold de CONSTRUCTA.
* **Ubicación estratégica:** Colocado en la parte superior izquierda de vistas de detalle, sub-vistas operativas y modales de proceso:
  * Detalle 360° de Proveedores (`SupplierDetailView.jsx`) para regresar al directorio general.
  * Seguimiento logístico de órdenes (`OrderTrackingModal.jsx`).
  * Recepción de mercancía (`OrderReceptionModal.jsx`).
  * Registro y validación de facturas (`SupplierInvoiceModal.jsx`).
  * Solicitudes de material (`MaterialRequestModal.jsx`).
  * Formulario de emisión de órdenes de compra (`PurchaseOrderModal.jsx`).
* **Principio de no duplicidad (Requisito #31 y #32):** Se omite en pantallas principales donde no existe contexto previo relevante, y se diferencia formalmente de la acción "Cancelar" (abandonar formulario vs regresar en navegación).

---

### 6.9. Conexión con Dashboard, Presupuestos, Gastos y Reportes
* **Dashboard Corporativo y Operativo (Requisito #27):**
  * Incorporación de panel analítico de abastecimiento con 8 indicadores en tiempo real:
    1. *Pedidos Pendientes*
    2. *Pedidos en Camino*
    3. *Entregas Próximas (5 días)*
    4. *Recepciones Pendientes en Obra*
    5. *Facturas por Revisar*
    6. *Pagos Programados (con monto acumulado)*
    7. *Pagos Vencidos (con alerta roja)*
    8. *Materiales con Reposición Pendiente*
  * Acceso rápido en alertas de stock crítico para solicitar reposición directa.
* **Reportes y Estadísticas (Requisito #28):**
  * Nueva pestaña oficial: **"Compras y Abastecimiento"** en [`src/pages/Reports/Reports.jsx`](file:///c:/Users/Foward/Desktop/ProyectoFinal-fronted/Constructa/src/pages/Reports/Reports.jsx).
  * 4 tarjetas KPI globales de cadena de suministro.
  * Matriz consolidada de compras por proyecto.
  * Matriz de rendimiento, cumplimiento de entregas y saldos por proveedor.
  * Bitácora de órdenes de compra y recepción física (cantidades pedidas vs recibidas e incidencias).
  * Registro de facturas y estado del cotejo 3-Way Match.
  * Soporte completo para exportación en archivo CSV descargable.
* **Separación de Compromisos Financieros:** Diferenciación contable estricta entre:
  * *Presupuesto de Obra* (techo asignado al proyecto).
  * *Compromiso de Compra* (órdenes de compra emitidas).
  * *Gasto Registrado* (factura recepcionada e imputada).
  * *Pago Realizado* (desembolso financiero procesado).

---

## 7. Prompt 7 — Ajuste Profesional: Directorio de Proveedores y Dimensiones de Interfaz

* **Fecha de emisión:** Fase de Estabilización y Dimensionamiento Empresarial.
* **Premisa fundamental:** **Ajuste visual y responsive específico sobre el módulo de Proveedores y abastecimiento**. No modificar la lógica de negocio salvo correcciones visuales o de interacción, no eliminar datos, no reconstruir desde cero, no romper el sidebar ni la navegación global.

### 7.1. Identificación y Reestructuración del Directorio
* **Nombre Oficial:** La vista principal se identifica claramente como **"Directorio de Proveedores"**.
* **Estructura visual estandarizada:**
  * **Encabezado:** Título dinámico por pestaña, descripción institucional y botón de acción principal (`Nuevo Proveedor`, `Nueva Solicitud`, `Emitir Orden`, `Registrar Factura`).
  * **Barra de Búsqueda y Filtros:** Búsqueda en vivo (empresa, contacto, material suministrado, teléfono, correo), desplegables adaptativos de especialidad y estado, botón `Limpiar filtros` y botón móvil `Filtros`.
  * **Selector de Presentación:** Alternancia fluida entre **Vista de Tarjetas** (`LayoutGrid`) y **Vista de Tabla** (`TableIcon`).

### 7.2. Tarjetas Uniformes y Control de Desbordamiento
* **Jerarquía fija por tarjeta:**
  1. Razón Social (truncamiento con tooltip nativo).
  2. Persona de Contacto con icono corporativo.
  3. Insumos principales suministrados (máximo 3 chips + badge `+N más`).
  4. Resumen compacto de contacto (teléfono, email, pago y plazo de entrega).
  5. Barra de acciones con prioridad absoluta a `Ver Proveedor` (botón primario) y acciones complementarias (`Nuevo pedido`, `Editar`, `Eliminar`).
* **Prevención de desproporción:** Reglas CSS estrictas (`min-height`, `max-height`, `.text-truncate`, `word-break: break-word`) que impiden que textos extensos o listas de materiales ensanchen o deformen la cuadrícula.

### 7.3. Detalle 360° del Proveedor en Secciones Separadas
* **División en Paneles Específicos:** Reemplazo de la tarjeta gigante por paneles modulares:
  * Panel 1: *Información General del Proveedor* (razón social, especialidad, RFC, estado, saldo pendiente).
  * Panel 2: *Contacto & Logística Comercial* (representante, teléfono, correo, dirección, condiciones de pago, tiempo de entrega y horario de atención).
* **Resumen KPI Compacto:** 5 tarjetas métricas balanceadas de altura controlada: *Pedidos Pendientes*, *Pedidos en Camino*, *Facturas Pendientes*, *Pagos Programados* y *Pagos Realizados*.
* **7 Pestañas de Historial:** *Pedidos*, *Entregas y Recepciones*, *Facturas*, *Pagos & Liquidaciones*, *Insumos Homologados*, *Incidencias* y *Bitácora de Contactos*. Todas las tablas integradas en `.constructa-table-container` para scroll horizontal puramente local.

### 7.4. Formularios y Modales Adaptativos
* **Cuadrícula Responsive (`.form-grid-2`):**
  * Escritorio: 2 columnas balanceadas.
  * Tablet: Reorganización fluida.
  * Móvil (< 640px): 1 columna natural sin compresión de inputs.
  * Campos extensos (dirección, observaciones, total): Ocupan ancho completo con `.form-full-width`.
* **Modales Controlados:** Dimensiones máximas restringidas (`max-width: 640px - 780px`), altura máxima del 90vh, scroll interno suave y botones de acción siempre visibles y accesibles.
* **Seguimiento Logístico:** Flujo de estados con stepper adaptable (`Solicitud → Aprobación → Enviado → Confirmación → Preparando → En camino → Recibido`).
* **Recepción Comparativa:** Grid de 3 tarjetas con balance evidente: **Total Solicitado** vs **Total Recibido** vs **Total Faltante**.

### 7.5. Estados Vacíos Formales
* Sin proveedores registrados: *"No hay proveedores registrados."*
* Búsqueda sin coincidencias: *"No encontramos proveedores que coincidan con tu búsqueda."* (Cero errores técnicos o códigos 404 para búsquedas vacías).

### 7.6. Verificación Responsive Multi-Dispositivo
* Validación sin desbordamiento horizontal en el cuerpo de la página (`body`) en resoluciones:
  * Escritorio amplio / Laptop (1366px y 1024px)
  * Tablet (768px)
  * Móvil (480px, 390px, 360px)

---

## 8. Prompt 8 — Prompt Maestro Unificado: Integración del Sitio Público, Área Privada, Autenticación, RRHH, Reclutamiento y Experiencia Empresarial

* **Fecha de emisión:** Fase de Integración y Expansión Global.
* **Premisa fundamental:** **NO RECONSTRUIR CONSTRUCTA DESDE CERO**. Conservar la base funcional, datos de los 62 colaboradores, 22 materiales con renders 3D, proyectos, proveedores y finanzas. Ampliar el ecosistema conectando una experiencia pública de alto nivel con el área privada de gestión.

### 8.1. Dos Experiencias Conectadas pero Separadas
1. **Experiencia Pública (Sitio Oficial Corporativo):**
   * **Inicio:** Hero corporativo, propuesta de valor, métricas destacadas y CTAs hacia proyectos y bolsa de trabajo.
   * **Empresa y Filosofía:** Historia, Misión, Visión, 6 Valores rectores y acreditaciones (ISO 9001, ISO 14001, LEED, ESR).
   * **Especialidades:** 6 líneas de negocio (Edificación Vertical, Corporativo, Naves Industriales, Obra Civil, Reingeniería y Gestión EPC).
   * **Logros y Métricas:** Cifras verificables de impacto (145+ obras, 850k m², 18 años, 62 colaboradores, 99.4% calidad).
   * **Video Institucional:** Integración del video HTML5 existente en `public/video/` con controles nativos y fallback empresarial.
   * **Proyectos Públicos:** Reutilización de los proyectos reales del sistema, con búsqueda, filtros por estado, avance físico, presupuestos y modal de ficha técnica completa.
   * **Galería Fotográfica:** Registro visual de frentes de obra con selector por categoría y lightbox interactivo responsive.
   * **Trabaja con Nosotros (Bolsa de Empleo):** Convocatorias laborales estructuradas con estados (*Abierta*, *En evaluación*, *Concluida*), acordeón de requisitos/beneficios y banner para candidaturas espontáneas.
   * **Formulario de Postulación Pública:** Proceso sin necesidad de cuenta interna, multi-paso (datos personales, experiencia, formación, habilidades y subida de CV/documentos).
   * **Contacto:** Teléfonos, conmutadores, correos de operaciones/ventas/reclutamiento, WhatsApp directo, formulario validado y mapa embebido.
   * **Footer:** Identidad legal, enlaces rápidos, acceso al sistema y créditos.

2. **Experiencia Privada (Sistema Interno):**
   * Dashboard, Proyectos, Empleados, Materiales, Proveedores, Presupuestos, Gastos, Cronograma, Avance, Reportes, RRHH (Candidatos y Entrevistas).

### 8.2. Información Centralizada y Preparación White-Label
* Toda la información institucional, valores, especialidades, vacantes, estadísticas y video centralizados en `src/config/companyConfig.js`.
* Capacidad de migrar o vender el sistema a otra constructora modificando únicamente este archivo de configuración.

### 8.3. Flujo Único de Reclutamiento y Trazabilidad
```text
Postulación pública (sin login)
       ↓
Candidato registrado en RRHH (#postulantes)
       ↓
Expediente y Currículum Vitae unificado (con documentos adjuntos)
       ↓
Programación de Entrevista (módulo de entrevistas)
       ↓
Selección y Alta como Empleado (preservando datos y trazabilidad)
```

### 8.4. Autenticación, Roles y Seguridad en Enrutamiento
* **Mantenimiento estricto de los 3 roles corporativos:**
  1. `Administrator` (Acceso total)
  2. `Gerente de Construcción` (Operaciones, proyectos, cuadrillas, almacén, cronograma)
  3. `RRHH / Reclutamiento` (Personal, candidatos, entrevistas, agenda)
* **Separación de roles y cuentas:** Ni los candidatos ni los empleados registrados en el catálogo son automáticamente usuarios del sistema.
* **Control de acceso y estados HTTP:**
  * Acceso privado sin autenticación: Estado **401** (Sesión no iniciada) con enlace a Login.
  * Acceso a ruta no autorizada por rol: Estado **403** (Acceso no autorizado) con retorno al Dashboard.
  * Ruta inexistente: Estado **404** (Página no encontrada) con retorno a la raíz.
* **Botón visible de acceso:** `Iniciar Sesión` en cabecera pública y pie de página; botón `← Volver al Sitio Público` en pantalla de Login; y `Ver Sitio Público` en la barra lateral del sistema privado.
* **Cierre de sesión seguro:** Modal de confirmación, limpieza de credenciales y redirección protegida.

---

> **CONSTRUCTA — Sistema de Gestión para Empresa Constructora**  
> Documento generado como memoria técnica del proyecto.

