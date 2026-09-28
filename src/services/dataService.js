import storageService from './storageService.js';
import db from '../data/db.json';

const KEYS = {
  INITIALIZED: 'constructa_db_init_v3',
  PROJECTS: 'proyectos',
  EMPLOYEES: 'empleados',
  MATERIALS: 'materiales',
  SUPPLIERS: 'proveedores',
  EXPENSES: 'gastos',
  SCHEDULE: 'cronograma',
  MOVEMENTS: 'movimientos_inventario',
  HISTORY: 'historial_movimientos',
  APPLICANTS: 'postulantes',
  INTERVIEWS: 'entrevistas',
  AGENDA: 'agenda_actividades',
  AUTH: 'sesion_usuario',
};

// Usuarios del sistema con acceso autorizado por rol
export const SYSTEM_USERS = [
  {
    id: 'USR-001',
    nombre: 'Ing. Fernando Mendoza',
    cargo: 'Director General de Operaciones',
    email: 'admin@constructa.com',
    usuario: 'admin',
    clave: 'admin',
    rol: 'Administrador',
    avatar: 'FM',
    descripcion: 'Control general del sistema, configuración corporativa, finanzas y supervisión global.',
  },
  {
    id: 'USR-002',
    nombre: 'Ing. Carlos Mendoza Rivas',
    cargo: 'Gerente de Construcción y Operaciones',
    email: 'gerente@constructa.com',
    usuario: 'gerente',
    clave: 'gerente123',
    rol: 'Gerente de Construcción',
    avatar: 'CM',
    descripcion: 'Supervisión de obras, cuadrillas de personal, avance físico, control de almacén y agenda operativa.',
  },
  {
    id: 'USR-003',
    nombre: 'Lic. Mariana Morales Solís',
    cargo: 'Coordinadora de Talento y Selección',
    email: 'rrhh@constructa.com',
    usuario: 'rrhh',
    clave: 'rrhh123',
    rol: 'RRHH / Reclutamiento',
    avatar: 'MM',
    descripcion: 'Gestión de candidatos, programación de entrevistas laborales, agenda de citas y contratación.',
  },
];

// Usuario administrador corporativo predeterminado (compatibilidad hacia atrás)
export const DEFAULT_ADMIN = SYSTEM_USERS[0];

// Actividades iniciales de demostración para la agenda centralizada
export const DEFAULT_AGENDA_ACTIVITIES = [
  {
    id: 'ACT-001',
    titulo: 'Reunión de coordinación de proyecto: Torre Altavista',
    tipo: 'Reuniones',
    fecha: '2026-03-27',
    horaInicio: '09:00',
    horaFin: '09:45',
    duracionMinutos: 45,
    responsable: 'Ing. Carlos Mendoza Rivas',
    proyectoId: 'PRJ-001',
    proyectoNombre: 'Torre Altavista Residencial',
    ubicacion: 'Sala de Juntas Obra 1 / Oficina Central',
    estado: 'Programada',
    descripcion: 'Revisión semanal de avance de cimentación y entrega de subcontratas con superintendentes.',
  },
  {
    id: 'ACT-002',
    titulo: 'Visita de obra técnica: Inspección Estructural Torre Altavista',
    tipo: 'Visitas',
    fecha: '2026-03-27',
    horaInicio: '11:00',
    horaFin: '11:30',
    duracionMinutos: 30,
    responsable: 'Ing. Carlos Mendoza Rivas',
    proyectoId: 'PRJ-001',
    proyectoNombre: 'Torre Altavista Residencial',
    ubicacion: 'Losa Nivel 14, Frente Torre Altavista',
    estado: 'Programada',
    descripcion: 'Verificación de armado de acero y control de calidad de colado de columnas.',
  },
  {
    id: 'ACT-003',
    titulo: 'Reunión con Subcontratista de Instalaciones Eléctricas',
    tipo: 'Reuniones',
    fecha: '2026-03-27',
    horaInicio: '15:00',
    horaFin: '16:00',
    duracionMinutos: 60,
    responsable: 'Ing. Carlos Mendoza Rivas',
    proyectoId: 'PRJ-001',
    proyectoNombre: 'Torre Altavista Residencial',
    ubicacion: 'Oficina Técnica de Obra',
    estado: 'Programada',
    descripcion: 'Alineación de cronograma de cableado y revisión de suministros certificados.',
  },
  {
    id: 'ACT-004',
    titulo: 'Visita técnica de supervisión ambiental y seguridad',
    tipo: 'Visitas',
    fecha: '2026-03-28',
    horaInicio: '10:00',
    horaFin: '11:30',
    duracionMinutos: 90,
    responsable: 'Arq. Sofía Valenzuela Morales',
    proyectoId: 'PRJ-002',
    proyectoNombre: 'Complejo Corporativo Nexus',
    ubicacion: 'Complejo Nexus Poniente',
    estado: 'Programada',
    descripcion: 'Recorrido de seguridad industrial y protocolos de trabajo en alturas con el comité.',
  },
  {
    id: 'ACT-005',
    titulo: 'Comité de Dirección y Revisión de Hitos Mensuales',
    tipo: 'Reuniones',
    fecha: '2026-03-30',
    horaInicio: '09:00',
    horaFin: '11:00',
    duracionMinutos: 120,
    responsable: 'Ing. Fernando Mendoza',
    proyectoId: null,
    proyectoNombre: 'General Corporativo',
    ubicacion: 'Sala Magna Dirección General',
    estado: 'Programada',
    descripcion: 'Evaluación ejecutiva de presupuestos, avance físico general y cartera de proyectos.',
  },
];

// Generador de IDs únicos incrementales sin riesgo de colisión
const generateNextId = (list, prefix) => {
  const max = list.reduce((highest, item) => {
    const digits = String(item?.id || '').replace(/\D/g, '');
    const num = parseInt(digits, 10);
    return isNaN(num) ? highest : Math.max(highest, num);
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
};

export const dataService = {
  // Inicialización de la capa de datos
  init() {
    const isInitialized = storageService.get(KEYS.INITIALIZED, false);
    
    // Si es la primera vez que se carga la aplicación, se inicializa con db.json
    if (!isInitialized) {
      storageService.set(KEYS.PROJECTS, db.projects || []);
      storageService.set(KEYS.EMPLOYEES, db.employees || []);
      storageService.set(KEYS.MATERIALS, db.materials || []);
      storageService.set(KEYS.SUPPLIERS, db.suppliers || []);
      storageService.set(KEYS.EXPENSES, db.expenses || []);
      storageService.set(KEYS.SCHEDULE, db.schedule || []);
      storageService.set(KEYS.MOVEMENTS, db.inventoryMovements || []);
      storageService.set(KEYS.HISTORY, db.history || []);
      storageService.set(KEYS.APPLICANTS, db.applicants || []);
      storageService.set(KEYS.INTERVIEWS, db.interviews || []);
      storageService.set(KEYS.AGENDA, DEFAULT_AGENDA_ACTIVITIES);
      storageService.set(KEYS.INITIALIZED, true);
    } else {
      // Si por alguna razón alguna colección estuviera ausente o vacía en el almacenamiento local, se recupera de db.json
      if (!storageService.get(KEYS.PROJECTS)) storageService.set(KEYS.PROJECTS, db.projects || []);
      if (!storageService.get(KEYS.EMPLOYEES)) storageService.set(KEYS.EMPLOYEES, db.employees || []);
      if (!storageService.get(KEYS.MATERIALS)) storageService.set(KEYS.MATERIALS, db.materials || []);
      if (!storageService.get(KEYS.SUPPLIERS)) storageService.set(KEYS.SUPPLIERS, db.suppliers || []);
      if (!storageService.get(KEYS.EXPENSES)) storageService.set(KEYS.EXPENSES, db.expenses || []);
      if (!storageService.get(KEYS.SCHEDULE)) storageService.set(KEYS.SCHEDULE, db.schedule || []);
      if (!storageService.get(KEYS.MOVEMENTS)) storageService.set(KEYS.MOVEMENTS, db.inventoryMovements || []);
      if (!storageService.get(KEYS.HISTORY)) storageService.set(KEYS.HISTORY, db.history || []);
      if (!storageService.get(KEYS.APPLICANTS)) storageService.set(KEYS.APPLICANTS, db.applicants || []);
      if (!storageService.get(KEYS.INTERVIEWS)) storageService.set(KEYS.INTERVIEWS, db.interviews || []);
      if (!storageService.get(KEYS.AGENDA)) storageService.set(KEYS.AGENDA, DEFAULT_AGENDA_ACTIVITIES);
    }
  },

  // Restablecer datos a los valores iniciales de db.json
  resetAllData() {
    storageService.set(KEYS.PROJECTS, db.projects || []);
    storageService.set(KEYS.EMPLOYEES, db.employees || []);
    storageService.set(KEYS.MATERIALS, db.materials || []);
    storageService.set(KEYS.SUPPLIERS, db.suppliers || []);
    storageService.set(KEYS.EXPENSES, db.expenses || []);
    storageService.set(KEYS.SCHEDULE, db.schedule || []);
    storageService.set(KEYS.MOVEMENTS, db.inventoryMovements || []);
    storageService.set(KEYS.HISTORY, db.history || []);
    storageService.set(KEYS.APPLICANTS, db.applicants || []);
    storageService.set(KEYS.INTERVIEWS, db.interviews || []);
    storageService.set(KEYS.AGENDA, DEFAULT_AGENDA_ACTIVITIES);
    storageService.set(KEYS.INITIALIZED, true);
  },

  // ----------------------------------------------------
  // GESTIÓN DE SESIÓN Y AUTENTICACIÓN MULTI-ROL
  // ----------------------------------------------------
  getSession() {
    return storageService.get(KEYS.AUTH, null);
  },

  getSystemUsers() {
    return SYSTEM_USERS;
  },

  login(identifier, password) {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Buscar coincidencia en la lista de usuarios del sistema
    const matchedUser = SYSTEM_USERS.find(
      (u) => u.email.toLowerCase() === cleanId || u.usuario.toLowerCase() === cleanId
    );

    if (matchedUser) {
      const validPasswords = [matchedUser.clave, `${matchedUser.usuario}123`, 'admin123', 'admin'];
      if (validPasswords.includes(cleanPass)) {
        const sessionData = {
          usuario: matchedUser,
          fechaInicio: new Date().toISOString(),
          activo: true,
        };
        storageService.set(KEYS.AUTH, sessionData);
        return { ok: true, usuario: matchedUser };
      }
    }

    return {
      ok: false,
      mensaje: 'Credenciales inválidas. Comprueba tu usuario y clave corporativa.',
    };
  },

  logout() {
    storageService.remove(KEYS.AUTH);
    return true;
  },

  // ----------------------------------------------------
  // HISTORIAL Y AUDITORÍA
  // ----------------------------------------------------
  getHistory() {
    return storageService.get(KEYS.HISTORY, db.history || []);
  },

  addHistoryEntry(tipo, descripcion, proyectoRelacionado = null, monto = null) {
    const list = this.getHistory();
    const dateStr = new Date().toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newEntry = {
      id: 'HIST-' + Date.now().toString().slice(-6),
      fecha: dateStr,
      tipo,
      descripcion,
      proyectoRelacionado: proyectoRelacionado || 'General',
      proyecto: proyectoRelacionado || 'General',
      monto,
    };

    const updated = [newEntry, ...list].slice(0, 100);
    storageService.set(KEYS.HISTORY, updated);
    return newEntry;
  },

  // ----------------------------------------------------
  // PROYECTOS (con normalización bidireccional)
  // ----------------------------------------------------
  getProjects() {
    const list = storageService.get(KEYS.PROJECTS, db.projects || []);
    return list.map((p) => {
      const endDate = p.fechaFinEstimada || p.fechaFin || '';
      return {
        ...p,
        fechaFin: endDate,
        fechaFinEstimada: endDate,
        presupuesto: Number(p.presupuesto) || 0,
        avance: Number(p.avance) || 0,
      };
    });
  },

  getProjectById(id) {
    const list = this.getProjects();
    return list.find((p) => p.id === id) || null;
  },

  saveProject(project) {
    const list = this.getProjects();
    let updated;
    const isNew = !project.id || !list.some((p) => p.id === project.id);
    const endDate = project.fechaFinEstimada || project.fechaFin || '';

    if (isNew) {
      const newId = generateNextId(list, 'PRJ');
      const itemToSave = {
        ...project,
        id: newId,
        codigo: project.codigo || 'OBR-' + new Date().getFullYear() + '-' + newId.replace('PRJ-', ''),
        fechaFin: endDate,
        fechaFinEstimada: endDate,
        avance: Number(project.avance) || 0,
        presupuesto: Number(project.presupuesto) || 0,
      };
      updated = [itemToSave, ...list];
      this.addHistoryEntry('Proyecto Creado', `Apertura de obra: ${project.nombre}`, project.nombre, itemToSave.presupuesto);
    } else {
      updated = list.map((p) =>
        p.id === project.id
          ? {
              ...p,
              ...project,
              fechaFin: endDate,
              fechaFinEstimada: endDate,
              avance: Number(project.avance) >= 0 ? Number(project.avance) : p.avance,
              presupuesto: Number(project.presupuesto) || p.presupuesto,
            }
          : p
      );
      this.addHistoryEntry('Proyecto Actualizado', `Modificación en parámetros de: ${project.nombre}`, project.nombre);
    }

    storageService.set(KEYS.PROJECTS, updated);
    return updated;
  },

  deleteProject(id) {
    const list = this.getProjects();
    const target = list.find((p) => p.id === id);
    const updated = list.filter((p) => p.id !== id);
    storageService.set(KEYS.PROJECTS, updated);

    if (target) {
      this.addHistoryEntry('Proyecto Eliminado', `Cierre de registro de obra: ${target.nombre}`, target.nombre);
    }
    return updated;
  },

  updateProjectProgress(id, newProgress) {
    const list = this.getProjects();
    const target = list.find((p) => p.id === id);
    const clampedProgress = Math.min(100, Math.max(0, Number(newProgress) || 0));

    const updated = list.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          avance: clampedProgress,
          estado: clampedProgress === 100 ? 'Finalizado' : p.estado === 'Finalizado' ? 'En construcción' : p.estado,
        };
      }
      return p;
    });
    storageService.set(KEYS.PROJECTS, updated);

    if (target) {
      this.addHistoryEntry(
        'Avance Actualizado',
        `Progreso de ${target.nombre} registrado en ${clampedProgress}%`,
        target.nombre
      );
    }
    return updated;
  },

  // ----------------------------------------------------
  // EMPLEADOS (Preserva los 62 colaboradores)
  // ----------------------------------------------------
  getEmployees() {
    const list = storageService.get(KEYS.EMPLOYEES, db.employees || []);
    return list.map((e) => ({
      ...e,
      dni: e.dni || (e.id ? 'DNI-' + e.id.replace('EMP-', '') : 'DNI-000'),
    }));
  },

  getEmployeeById(id) {
    const list = this.getEmployees();
    return list.find((e) => e.id === id) || null;
  },

  saveEmployee(employee) {
    const list = this.getEmployees();
    let updated;
    const isNew = !employee.id || !list.some((e) => e.id === employee.id);

    if (isNew) {
      const newId = generateNextId(list, 'EMP');
      const itemToSave = {
        ...employee,
        id: newId,
        dni: employee.dni || ('DNI-' + newId.replace('EMP-', '')),
        fechaIngreso: employee.fechaIngreso || new Date().toISOString().split('T')[0],
      };
      updated = [itemToSave, ...list];
      this.addHistoryEntry('Empleado Registrado', `Alta de colaborador: ${employee.nombre} (${employee.puesto})`);
    } else {
      updated = list.map((e) => (e.id === employee.id ? { ...e, ...employee } : e));
      this.addHistoryEntry('Empleado Modificado', `Actualización de ficha: ${employee.nombre}`);
    }

    storageService.set(KEYS.EMPLOYEES, updated);
    return updated;
  },

  deleteEmployee(id) {
    const list = this.getEmployees();
    const target = list.find((e) => e.id === id);
    const updated = list.filter((e) => e.id !== id);
    storageService.set(KEYS.EMPLOYEES, updated);

    if (target) {
      this.addHistoryEntry('Baja de Personal', `Desvinculación de personal: ${target.nombre}`);
    }
    return updated;
  },

  // ----------------------------------------------------
  // MATERIALES (Preserva los 22 insumos y sus imágenes)
  // ----------------------------------------------------
  getMaterials() {
    const list = storageService.get(KEYS.MATERIALS, db.materials || []);
    return list.map((m) => {
      const stock = m.stockActual !== undefined ? Number(m.stockActual) : Number(m.stock || 0);
      const img = m.imagenKey || m.imagen || 'cemento-portland';
      return {
        ...m,
        stock,
        stockActual: stock,
        imagen: img,
        imagenKey: img,
        stockMinimo: Number(m.stockMinimo) || 0,
        precioUnitario: Number(m.precioUnitario) || 0,
      };
    });
  },

  getMaterialById(id) {
    const list = this.getMaterials();
    return list.find((m) => m.id === id) || null;
  },

  saveMaterial(material) {
    const list = this.getMaterials();
    let updated;
    const isNew = !material.id || !list.some((m) => m.id === material.id);
    const stockVal = material.stockActual !== undefined ? Number(material.stockActual) : Number(material.stock || 0);
    const imgKey = material.imagenKey || material.imagen || 'cemento-portland';

    if (isNew) {
      const newId = generateNextId(list, 'MAT');
      const itemToSave = {
        ...material,
        id: newId,
        codigo: material.codigo || 'MT-GEN-' + newId.replace('MAT-', ''),
        stock: stockVal,
        stockActual: stockVal,
        imagen: imgKey,
        imagenKey: imgKey,
        stockMinimo: Number(material.stockMinimo) || 0,
        precioUnitario: Number(material.precioUnitario) || 0,
      };
      updated = [itemToSave, ...list];
      this.addHistoryEntry('Material Registrado', `Ingreso al catálogo: ${material.nombre}`);
    } else {
      updated = list.map((m) =>
        m.id === material.id
          ? {
              ...m,
              ...material,
              stock: stockVal,
              stockActual: stockVal,
              imagen: imgKey,
              imagenKey: imgKey,
              stockMinimo: Number(material.stockMinimo) >= 0 ? Number(material.stockMinimo) : m.stockMinimo,
              precioUnitario: Number(material.precioUnitario) || m.precioUnitario,
            }
          : m
      );
      this.addHistoryEntry('Material Actualizado', `Modificación en ficha de: ${material.nombre}`);
    }

    storageService.set(KEYS.MATERIALS, updated);
    return updated;
  },

  deleteMaterial(id) {
    const list = this.getMaterials();
    const target = list.find((m) => m.id === id);
    const updated = list.filter((m) => m.id !== id);
    storageService.set(KEYS.MATERIALS, updated);

    if (target) {
      this.addHistoryEntry('Material Retirado', `Baja de catálogo: ${target.nombre}`);
    }
    return updated;
  },

  // ----------------------------------------------------
  // MOVIMIENTOS DE INVENTARIO (Kardex de entradas y salidas)
  // ----------------------------------------------------
  getInventoryMovements() {
    return storageService.get(KEYS.MOVEMENTS, db.inventoryMovements || []);
  },

  registerStockMovement({ materialId, tipo, cantidad, proyectoId, responsable, motivo }) {
    const materials = this.getMaterials();
    const material = materials.find((m) => m.id === materialId);
    if (!material) return { ok: false, mensaje: 'Material no encontrado en inventario.' };

    const qty = Number(cantidad);
    if (isNaN(qty) || qty <= 0) {
      return { ok: false, mensaje: 'La cantidad debe ser un valor positivo mayor a cero.' };
    }

    let newStock = material.stockActual;
    if (tipo === 'Salida') {
      if (material.stockActual < qty) {
        return {
          ok: false,
          mensaje: `No hay existencias suficientes. Stock actual disponible: ${material.stockActual} ${material.unidad}.`,
        };
      }
      newStock -= qty;
    } else {
      newStock += qty;
    }

    // Actualizar stock del material
    const updatedMaterials = materials.map((m) =>
      m.id === materialId ? { ...m, stock: newStock, stockActual: newStock } : m
    );
    storageService.set(KEYS.MATERIALS, updatedMaterials);

    // Guardar movimiento
    const movements = this.getInventoryMovements();
    const projects = this.getProjects();
    const project = projects.find((p) => p.id === proyectoId);
    const projectName = project ? project.nombre : 'Almacén General';

    const newMov = {
      id: 'MOV-' + Date.now().toString().slice(-6),
      fecha: new Date().toISOString().split('T')[0],
      materialId,
      materialNombre: material.nombre,
      tipo,
      cantidad: qty,
      unidad: material.unidad,
      proyectoId: proyectoId || null,
      responsable: responsable || 'Bodega Central',
      motivo: motivo || (tipo === 'Entrada' ? 'Recepción de compra' : 'Envío para ejecución de obra'),
    };

    const nextMovements = [newMov, ...movements];
    storageService.set(KEYS.MOVEMENTS, nextMovements);

    // Historial
    const actionDesc =
      tipo === 'Entrada'
        ? `Ingreso de ${qty} ${material.unidad} de ${material.nombre}`
        : `Despacho de ${qty} ${material.unidad} de ${material.nombre} a obra`;
    this.addHistoryEntry(
      tipo === 'Entrada' ? 'Material Ingresado' : 'Material Despachado',
      actionDesc,
      projectName
    );

    return { 
      ok: true, 
      materials: updatedMaterials,
      movements: nextMovements,
      material: { ...material, stock: newStock, stockActual: newStock }, 
      movimiento: newMov 
    };
  },

  // ----------------------------------------------------
  // PROVEEDORES
  // ----------------------------------------------------
  getSuppliers() {
    const list = storageService.get(KEYS.SUPPLIERS, db.suppliers || []);
    return list.map((s) => {
      const name = s.nombreComercial || s.nombre || 'Proveedor Comercial';
      const cat = s.categoria || s.especialidad || 'Suministro General';
      return {
        ...s,
        nombre: name,
        nombreComercial: name,
        especialidad: cat,
        categoria: cat,
        rfc: s.rfc || s.cif || '',
      };
    });
  },

  getSupplierById(id) {
    const list = this.getSuppliers();
    return list.find((s) => s.id === id) || null;
  },

  saveSupplier(supplier) {
    const list = this.getSuppliers();
    let updated;
    const isNew = !supplier.id || !list.some((s) => s.id === supplier.id);
    const name = supplier.nombreComercial || supplier.nombre || '';
    const cat = supplier.categoria || supplier.especialidad || 'General';

    if (isNew) {
      const newId = generateNextId(list, 'PRV');
      const itemToSave = {
        ...supplier,
        id: newId,
        nombre: name,
        nombreComercial: name,
        especialidad: cat,
        categoria: cat,
      };
      updated = [itemToSave, ...list];
      this.addHistoryEntry('Proveedor Registrado', `Alta de proveedor: ${name}`);
    } else {
      updated = list.map((s) =>
        s.id === supplier.id
          ? {
              ...s,
              ...supplier,
              nombre: name,
              nombreComercial: name,
              especialidad: cat,
              categoria: cat,
            }
          : s
      );
      this.addHistoryEntry('Proveedor Modificado', `Actualización de proveedor: ${name}`);
    }

    storageService.set(KEYS.SUPPLIERS, updated);
    return updated;
  },

  deleteSupplier(id) {
    const list = this.getSuppliers();
    const target = list.find((s) => s.id === id);
    const updated = list.filter((s) => s.id !== id);
    storageService.set(KEYS.SUPPLIERS, updated);

    if (target) {
      this.addHistoryEntry('Proveedor Retirado', `Baja de proveedor: ${target.nombre || target.nombreComercial}`);
    }
    return updated;
  },

  // ----------------------------------------------------
  // GASTOS (Interconectado con Proyectos y Presupuestos)
  // ----------------------------------------------------
  getExpenses() {
    const list = storageService.get(KEYS.EXPENSES, db.expenses || []);
    return list.map((g) => {
      const desc = g.concepto || g.descripcion || 'Gasto operativo';
      return {
        ...g,
        concepto: desc,
        descripcion: desc,
        monto: Number(g.monto) || 0,
      };
    });
  },

  getExpenseById(id) {
    const list = this.getExpenses();
    return list.find((g) => g.id === id) || null;
  },

  saveExpense(expense) {
    const list = this.getExpenses();
    const projects = this.getProjects();
    const project = projects.find((p) => p.id === expense.proyectoId);
    const projectName = project ? project.nombre : 'Proyecto General';
    const desc = expense.concepto || expense.descripcion || 'Gasto operativo';

    let updated;
    const isNew = !expense.id || !list.some((g) => g.id === expense.id);

    if (isNew) {
      const newId = generateNextId(list, 'GST');
      const itemToSave = {
        ...expense,
        id: newId,
        concepto: desc,
        descripcion: desc,
        monto: Number(expense.monto) || 0,
        fecha: expense.fecha || new Date().toISOString().split('T')[0],
      };
      updated = [itemToSave, ...list];
      this.addHistoryEntry('Gasto Registrado', `${desc} (${expense.categoria})`, projectName, itemToSave.monto);
    } else {
      updated = list.map((g) =>
        g.id === expense.id
          ? {
              ...g,
              ...expense,
              concepto: desc,
              descripcion: desc,
              monto: Number(expense.monto) || g.monto,
            }
          : g
      );
      this.addHistoryEntry('Gasto Actualizado', `Modificación de gasto: ${desc}`, projectName, expense.monto);
    }

    storageService.set(KEYS.EXPENSES, updated);
    return updated;
  },

  deleteExpense(id) {
    const list = this.getExpenses();
    const target = list.find((g) => g.id === id);
    const updated = list.filter((g) => g.id !== id);
    storageService.set(KEYS.EXPENSES, updated);

    if (target) {
      const desc = target.concepto || target.descripcion || 'Gasto';
      this.addHistoryEntry('Gasto Eliminado', `Cancelación de gasto: ${desc}`, null, target.monto);
    }
    return updated;
  },

  // ----------------------------------------------------
  // CRONOGRAMA Y ACTIVIDADES
  // ----------------------------------------------------
  getSchedule() {
    const list = storageService.get(KEYS.SCHEDULE, db.schedule || []);
    return list.map((a) => {
      const est = a.estado === 'Completado' ? 'Completada' : a.estado || 'Pendiente';
      return {
        ...a,
        estado: est,
        avance: Number(a.avance) || 0,
      };
    });
  },

  getActivityById(id) {
    const list = this.getSchedule();
    return list.find((a) => a.id === id) || null;
  },

  saveActivity(activity) {
    const list = this.getSchedule();
    const projects = this.getProjects();
    const project = projects.find((p) => p.id === activity.proyectoId);
    const projectName = project ? project.nombre : 'Proyecto General';
    const est = activity.estado === 'Completado' ? 'Completada' : activity.estado || 'Pendiente';

    let updated;
    const isNew = !activity.id || !list.some((a) => a.id === activity.id);

    if (isNew) {
      const newId = generateNextId(list, 'ACT');
      const itemToSave = {
        ...activity,
        id: newId,
        estado: est,
        avance: Number(activity.avance) || 0,
      };
      updated = [itemToSave, ...list];
      this.addHistoryEntry('Actividad Programada', `Nueva tarea en cronograma: ${activity.actividad}`, projectName);
    } else {
      updated = list.map((a) =>
        a.id === activity.id
          ? {
              ...a,
              ...activity,
              estado: est,
              avance: Number(activity.avance) >= 0 ? Number(activity.avance) : a.avance,
            }
          : a
      );
      this.addHistoryEntry('Actividad Modificada', `Actualización de tarea: ${activity.actividad}`, projectName);
    }

    storageService.set(KEYS.SCHEDULE, updated);
    return updated;
  },

  deleteActivity(id) {
    const list = this.getSchedule();
    const target = list.find((a) => a.id === id);
    const updated = list.filter((a) => a.id !== id);
    storageService.set(KEYS.SCHEDULE, updated);

    if (target) {
      this.addHistoryEntry('Actividad Retirada', `Eliminación de actividad: ${target.actividad}`);
    }
    return updated;
  },

  // ----------------------------------------------------
  // GESTIÓN DE POSTULANTES Y EXPEDIENTES LABORALES
  // ----------------------------------------------------
  getApplicants() {
    return storageService.get(KEYS.APPLICANTS, []);
  },

  getApplicantById(id) {
    return this.getApplicants().find((a) => a.id === id);
  },

  saveApplicant(applicantData) {
    const list = this.getApplicants();
    const today = new Date().toISOString().split('T')[0];
    let updated;

    if (!applicantData.id) {
      // Nuevo postulante
      const newId = generateNextId(list, 'POS');
      const newApplicant = {
        ...applicantData,
        id: newId,
        fechaPostulacion: applicantData.fechaPostulacion || today,
        estado: applicantData.estado || 'Recibida',
        formacion: applicantData.formacion || [],
        habilidades: applicantData.habilidades || [],
        experiencias: applicantData.experiencias || [],
        referencias: applicantData.referencias || [],
        historial: [
          {
            fecha: today,
            evento: 'Postulación registrada en el sistema de selección de CONSTRUCTA',
          },
        ],
        empleadoId: null,
      };
      updated = [newApplicant, ...list];
      this.addHistoryEntry(
        'Postulante Registrado',
        `Candidatura registrada: ${newApplicant.nombre} para ${newApplicant.puestoSolicitado || 'plaza operativa'}`
      );
    } else {
      // Modificar postulante existente
      updated = list.map((a) => {
        if (a.id === applicantData.id) {
          const historial = [...(a.historial || [])];
          if (applicantData.estado && applicantData.estado !== a.estado) {
            historial.push({
              fecha: today,
              evento: `Estado actualizado a "${applicantData.estado}"`,
            });
          }
          return {
            ...a,
            ...applicantData,
            historial,
          };
        }
        return a;
      });
      this.addHistoryEntry(
        'Expediente Actualizado',
        `Actualización de datos del postulante: ${applicantData.nombre || applicantData.id}`
      );
    }

    storageService.set(KEYS.APPLICANTS, updated);
    return updated;
  },

  deleteApplicant(id) {
    const list = this.getApplicants();
    const target = list.find((a) => a.id === id);
    const updated = list.filter((a) => a.id !== id);
    storageService.set(KEYS.APPLICANTS, updated);

    // Cancelar entrevistas asociadas a este postulante si existen
    const interviews = this.getInterviews().map((i) =>
      i.postulanteId === id && i.estado === 'Programada'
        ? { ...i, estado: 'Cancelada', observaciones: 'Cancelada por retiro del postulante' }
        : i
    );
    storageService.set(KEYS.INTERVIEWS, interviews);

    if (target) {
      this.addHistoryEntry('Postulante Retirado', `Eliminación de candidatura: ${target.nombre}`);
    }
    return updated;
  },

  // Convertir postulante seleccionado en empleado formal de CONSTRUCTA
  convertApplicantToEmployee(applicantId, employeeData) {
    const applicant = this.getApplicantById(applicantId);
    if (!applicant) {
      throw new Error('No se encontró el expediente del postulante');
    }

    const today = new Date().toISOString().split('T')[0];

    // 1. Dar de alta en la nómina de empleados
    const newEmployeeData = {
      nombre: employeeData.nombre || applicant.nombre,
      puesto: employeeData.puesto || applicant.puestoSolicitado,
      especialidad: employeeData.especialidad || applicant.area || applicant.puestoSolicitado,
      dni: employeeData.dni || applicant.dni,
      email: employeeData.email || applicant.email,
      telefono: employeeData.telefono || applicant.telefono,
      proyectoId: employeeData.proyectoId || applicant.proyectoAsignadoTentativo || 'PRJ-001',
      horario: employeeData.horario || '07:00 - 16:00',
      diasLaborales: employeeData.diasLaborales || 'Lunes a Viernes',
      estado: employeeData.estado || 'Activo',
      salario: employeeData.salario || employeeData.sueldo || null,
      observaciones: `Contratado mediante proceso de selección CONSTRUCTA (Expediente ${applicant.id}).`,
    };

    const updatedEmployees = this.saveEmployee(newEmployeeData);
    const createdEmployee = updatedEmployees.find((e) => e.dni === newEmployeeData.dni) || updatedEmployees[0];

    // 2. Actualizar estado y vincular en el expediente del postulante sin borrar su historial
    const updatedApplicants = this.getApplicants().map((a) => {
      if (a.id === applicantId) {
        return {
          ...a,
          estado: 'Seleccionado',
          empleadoId: createdEmployee?.id || 'EMP-NUEVO',
          historial: [
            ...(a.historial || []),
            {
              fecha: today,
              evento: `Candidato formalmente contratado y dado de alta como empleado (ID Nómina: ${createdEmployee?.id || 'Activo'}). Asignado a obra.`,
            },
          ],
        };
      }
      return a;
    });

    storageService.set(KEYS.APPLICANTS, updatedApplicants);

    this.addHistoryEntry(
      'Empleado Contratado',
      `Contratación exitosa de postulante: ${applicant.nombre} para ${newEmployeeData.puesto}`,
      newEmployeeData.proyectoId
    );

    return {
      applicant: updatedApplicants.find((a) => a.id === applicantId),
      employee: createdEmployee,
      employees: updatedEmployees,
      applicants: updatedApplicants,
    };
  },

  // ----------------------------------------------------
  // GESTIÓN DE ENTREVISTAS Y PREVENCIÓN DE CONFLICTOS
  // ----------------------------------------------------
  timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  },

  calculateEndTime(startTime, durationMinutes = 45) {
    if (!startTime) return '';
    const [h, m] = startTime.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return startTime;
    const totalMinutes = h * 60 + m + Number(durationMinutes || 0);
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  },

  checkInterviewConflict({ fecha, horaInicio, duracionMinutos = 45, entrevistador, postulanteId }, excludeId = null) {
    if (!fecha || !horaInicio) return { conflict: false };

    const horaFin = this.calculateEndTime(horaInicio, duracionMinutos);
    const startMin = this.timeToMinutes(horaInicio);
    const endMin = this.timeToMinutes(horaFin);

    // 1. Verificar solapamiento con entrevistas existentes
    const interviews = this.getInterviews();
    const sameDayInterviews = interviews.filter(
      (i) => i.fecha === fecha && i.id !== excludeId && i.estado !== 'Cancelada'
    );

    for (const existing of sameDayInterviews) {
      const existStart = this.timeToMinutes(existing.horaInicio);
      const existEnd = this.timeToMinutes(existing.horaFin);
      const overlaps = startMin < existEnd && endMin > existStart;

      if (overlaps) {
        if (postulanteId && existing.postulanteId === postulanteId) {
          return {
            conflict: true,
            type: 'candidate',
            message: `El candidato ya cuenta con una cita programada para este horario (${existing.horaInicio} a ${existing.horaFin}). Selecciona otro horario.`,
            existing,
          };
        }

        if (
          entrevistador &&
          existing.entrevistador &&
          (existing.entrevistador.trim().toLowerCase().includes(entrevistador.trim().toLowerCase()) ||
           entrevistador.trim().toLowerCase().includes(existing.entrevistador.trim().toLowerCase()))
        ) {
          return {
            conflict: true,
            type: 'interviewer',
            message: `Horario no disponible. El entrevistador ya tiene una actividad programada para este horario (Entrevista técnica de ${existing.horaInicio} a ${existing.horaFin}).`,
            existing,
          };
        }
      }
    }

    // 2. Verificar solapamiento con actividades de agenda (reuniones de obra, visitas técnicas)
    const agendaList = this.getAgendaActivities();
    const sameDayAgenda = agendaList.filter(
      (a) => a.fecha === fecha && a.id !== excludeId && a.estado !== 'Cancelada'
    );

    for (const act of sameDayAgenda) {
      const actStart = this.timeToMinutes(act.horaInicio);
      const actEnd = this.timeToMinutes(act.horaFin);
      const overlaps = startMin < actEnd && endMin > actStart;

      if (overlaps) {
        if (
          entrevistador &&
          act.responsable &&
          (act.responsable.trim().toLowerCase().includes(entrevistador.trim().toLowerCase()) ||
           entrevistador.trim().toLowerCase().includes(act.responsable.trim().toLowerCase()))
        ) {
          return {
            conflict: true,
            type: 'interviewer',
            message: `Horario no disponible. El entrevistador ya tiene una actividad programada para este horario (${act.tipo}: "${act.titulo}" de ${act.horaInicio} a ${act.horaFin}).`,
            existing: act,
          };
        }
      }
    }

    return { conflict: false };
  },

  // ----------------------------------------------------
  // GESTIÓN DE AGENDA CENTRALIZADA Y ACTIVIDADES
  // ----------------------------------------------------
  getAgendaActivities() {
    return storageService.get(KEYS.AGENDA, DEFAULT_AGENDA_ACTIVITIES);
  },

  saveAgendaActivity(activityData) {
    const list = this.getAgendaActivities();
    const horaFin = activityData.horaFin || this.calculateEndTime(activityData.horaInicio, activityData.duracionMinutos || 60);

    let updated;
    if (!activityData.id) {
      const newId = generateNextId(list, 'ACT');
      const newActivity = {
        ...activityData,
        id: newId,
        horaFin,
        duracionMinutos: Number(activityData.duracionMinutos) || 60,
        estado: activityData.estado || 'Programada',
      };
      updated = [newActivity, ...list];
      this.addHistoryEntry(
        'Actividad de Agenda Creada',
        `${newActivity.tipo}: ${newActivity.titulo} (${newActivity.responsable})`,
        newActivity.proyectoId
      );
    } else {
      updated = list.map((a) => (a.id === activityData.id ? { ...a, ...activityData, horaFin } : a));
      this.addHistoryEntry(
        'Actividad de Agenda Actualizada',
        `Actualización en agenda: ${activityData.titulo}`,
        activityData.proyectoId
      );
    }

    storageService.set(KEYS.AGENDA, updated);
    return updated;
  },

  deleteAgendaActivity(id) {
    const list = this.getAgendaActivities();
    const target = list.find((a) => a.id === id);
    const updated = list.filter((a) => a.id !== id);
    storageService.set(KEYS.AGENDA, updated);
    if (target) {
      this.addHistoryEntry('Actividad de Agenda Retirada', `Retiro de agenda: ${target.titulo}`);
    }
    return updated;
  },

  getUnifiedAgenda({ fecha = null, tipo = 'ALL', responsable = 'ALL' } = {}) {
    const interviews = this.getInterviews();
    const activities = this.getAgendaActivities();
    const schedule = this.getSchedule();

    const unified = [];

    // 1. Integración de entrevistas activas
    interviews.forEach((inv) => {
      unified.push({
        id: inv.id,
        titulo: `Entrevista: ${inv.postulanteNombre} (${inv.puesto})`,
        tipo: 'Entrevistas',
        fecha: inv.fecha,
        horaInicio: inv.horaInicio,
        horaFin: inv.horaFin || this.calculateEndTime(inv.horaInicio, inv.duracionMinutos || 45),
        duracionMinutos: inv.duracionMinutos || 45,
        responsable: inv.entrevistador,
        proyectoId: null,
        proyectoNombre: 'Selección y Reclutamiento',
        ubicacion: inv.tipo,
        estado: inv.estado,
        descripcion: inv.observaciones || 'Entrevista laboral coordinada por RRHH',
        resultado: inv.resultado,
        evaluacion: inv.evaluacion,
        source: 'interview',
        raw: inv,
      });
    });

    // 2. Actividades de agenda (reuniones, visitas de obra, coordinación)
    activities.forEach((act) => {
      unified.push({
        ...act,
        source: 'agenda',
      });
    });

    // 3. Actividades del cronograma de proyectos (hitos clave de obra)
    schedule.forEach((task) => {
      unified.push({
        id: `SCH-${task.id}`,
        titulo: `Hito de Obra: ${task.actividad}`,
        tipo: 'Proyectos',
        fecha: task.fechaInicio,
        horaInicio: '08:00',
        horaFin: '17:00',
        duracionMinutos: 540,
        responsable: task.responsable,
        proyectoId: task.proyectoId,
        proyectoNombre: task.proyectoNombre || `Proyecto ${task.proyectoId}`,
        ubicacion: 'Frente de Obra',
        estado: task.estado,
        descripcion: `Avance físico: ${task.avance}%. Hito programado en cronograma general.`,
        source: 'schedule',
        raw: task,
      });
    });

    // Filtrar y ordenar cronológicamente
    return unified
      .filter((item) => {
        const matchesDate = !fecha || item.fecha === fecha;
        const matchesType = tipo === 'ALL' || item.tipo === tipo;
        const matchesResponsable =
          responsable === 'ALL' ||
          (item.responsable && item.responsable.toLowerCase().includes(responsable.toLowerCase()));
        return matchesDate && matchesType && matchesResponsable;
      })
      .sort((a, b) => {
        if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
        return (a.horaInicio || '').localeCompare(b.horaInicio || '');
      });
  },

  getInterviews() {
    return storageService.get(KEYS.INTERVIEWS, []);
  },

  getInterviewById(id) {
    return this.getInterviews().find((i) => i.id === id);
  },

  saveInterview(interviewData) {
    const list = this.getInterviews();
    const horaFin = this.calculateEndTime(interviewData.horaInicio, interviewData.duracionMinutos || 45);
    const today = new Date().toISOString().split('T')[0];

    // Verificar conflictos de agenda
    const conflictCheck = this.checkInterviewConflict(
      {
        fecha: interviewData.fecha,
        horaInicio: interviewData.horaInicio,
        duracionMinutos: interviewData.duracionMinutos || 45,
        entrevistador: interviewData.entrevistador,
        postulanteId: interviewData.postulanteId,
      },
      interviewData.id || null
    );

    if (conflictCheck.conflict) {
      throw new Error(conflictCheck.message);
    }

    let updated;

    if (!interviewData.id) {
      // Nueva entrevista
      const newId = generateNextId(list, 'INT');
      const newInterview = {
        ...interviewData,
        id: newId,
        horaFin,
        duracionMinutos: Number(interviewData.duracionMinutos) || 45,
        estado: interviewData.estado || 'Programada',
        resultado: null,
        evaluacion: null,
        comentarios: null,
        historial: [
          {
            fecha: `${today} ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`,
            evento: `Entrevista programada para el ${interviewData.fecha} de ${interviewData.horaInicio} a ${horaFin} con ${interviewData.entrevistador}`,
          },
        ],
      };

      updated = [newInterview, ...list];

      // Actualizar estado del postulante a "Entrevista programada"
      if (interviewData.postulanteId) {
        const applicants = this.getApplicants().map((a) => {
          if (a.id === interviewData.postulanteId) {
            return {
              ...a,
              estado: 'Entrevista programada',
              historial: [
                ...(a.historial || []),
                {
                  fecha: today,
                  evento: `Entrevista técnica programada para el ${interviewData.fecha} (${interviewData.horaInicio} a ${horaFin}) con ${interviewData.entrevistador}`,
                },
              ],
            };
          }
          return a;
        });
        storageService.set(KEYS.APPLICANTS, applicants);
      }

      this.addHistoryEntry(
        'Entrevista Programada',
        `Entrevista agendada: ${interviewData.postulanteNombre || 'Candidato'} con ${interviewData.entrevistador} el ${interviewData.fecha}`
      );
    } else {
      // Actualizar entrevista existente
      updated = list.map((i) =>
        i.id === interviewData.id
          ? {
              ...i,
              ...interviewData,
              horaFin,
              duracionMinutos: Number(interviewData.duracionMinutos) || i.duracionMinutos,
            }
          : i
      );
      this.addHistoryEntry(
        'Entrevista Actualizada',
        `Modificación en entrevista: ${interviewData.postulanteNombre || interviewData.id}`
      );
    }

    storageService.set(KEYS.INTERVIEWS, updated);
    return updated;
  },

  rescheduleInterview(id, rescheduleData) {
    const list = this.getInterviews();
    const existing = list.find((i) => i.id === id);
    if (!existing) throw new Error('Entrevista no encontrada');

    const horaFin = this.calculateEndTime(
      rescheduleData.horaInicio || existing.horaInicio,
      rescheduleData.duracionMinutos || existing.duracionMinutos || 45
    );

    // Validación estricta de conflictos antes de guardar la reprogramación
    const conflictCheck = this.checkInterviewConflict(
      {
        fecha: rescheduleData.fecha || existing.fecha,
        horaInicio: rescheduleData.horaInicio || existing.horaInicio,
        duracionMinutos: rescheduleData.duracionMinutos || existing.duracionMinutos || 45,
        entrevistador: rescheduleData.entrevistador || existing.entrevistador,
        postulanteId: existing.postulanteId,
      },
      id
    );

    if (conflictCheck.conflict) {
      throw new Error(conflictCheck.message);
    }

    const today = new Date().toISOString().split('T')[0];
    const timestamp = `${today} ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;

    const updated = list.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          ...rescheduleData,
          horaFin,
          estado: 'Reprogramada',
          historial: [
            ...(i.historial || []),
            {
              fecha: timestamp,
              evento: `Entrevista reprogramada para el ${rescheduleData.fecha} de ${rescheduleData.horaInicio} a ${horaFin}. Motivo/Observación: ${rescheduleData.observaciones || 'Ajuste de agenda'}`,
            },
          ],
        };
      }
      return i;
    });

    storageService.set(KEYS.INTERVIEWS, updated);

    // Actualizar historial del postulante
    if (existing.postulanteId) {
      const applicants = this.getApplicants().map((a) => {
        if (a.id === existing.postulanteId) {
          return {
            ...a,
            estado: 'Entrevista programada',
            historial: [
              ...(a.historial || []),
              {
                fecha: today,
                evento: `Entrevista reprogramada para el ${rescheduleData.fecha} (${rescheduleData.horaInicio} — ${horaFin})`,
              },
            ],
          };
        }
        return a;
      });
      storageService.set(KEYS.APPLICANTS, applicants);
    }

    this.addHistoryEntry(
      'Entrevista Reprogramada',
      `Reprogramación de entrevista para ${existing.postulanteNombre} al ${rescheduleData.fecha} (${rescheduleData.horaInicio})`
    );

    return updated;
  },

  cancelInterview(id, motivo = 'Cancelada por el administrador') {
    const list = this.getInterviews();
    const existing = list.find((i) => i.id === id);
    if (!existing) throw new Error('Entrevista no encontrada');

    const today = new Date().toISOString().split('T')[0];
    const timestamp = `${today} ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;

    const updated = list.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          estado: 'Cancelada',
          observaciones: `${i.observaciones ? i.observaciones + ' | ' : ''}Cancelación: ${motivo}`,
          historial: [
            ...(i.historial || []),
            {
              fecha: timestamp,
              evento: `Entrevista cancelada. Motivo: ${motivo}`,
            },
          ],
        };
      }
      return i;
    });

    storageService.set(KEYS.INTERVIEWS, updated);

    // Actualizar expediente del postulante
    if (existing.postulanteId) {
      const applicants = this.getApplicants().map((a) => {
        if (a.id === existing.postulanteId) {
          return {
            ...a,
            estado: a.estado === 'Entrevista programada' ? 'En revisión' : a.estado,
            historial: [
              ...(a.historial || []),
              {
                fecha: today,
                evento: `Entrevista del ${existing.fecha} cancelada. Horario liberado en agenda.`,
              },
            ],
          };
        }
        return a;
      });
      storageService.set(KEYS.APPLICANTS, applicants);
    }

    this.addHistoryEntry('Entrevista Cancelada', `Cancelación de entrevista: ${existing.postulanteNombre} del ${existing.fecha}`);
    return updated;
  },

  recordInterviewResult(id, { resultado, evaluacion, comentarios, nuevoEstadoPostulante }) {
    const list = this.getInterviews();
    const existing = list.find((i) => i.id === id);
    if (!existing) throw new Error('Entrevista no encontrada');

    const today = new Date().toISOString().split('T')[0];
    const timestamp = `${today} ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;

    const updated = list.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          estado: 'Realizada',
          resultado,
          evaluacion,
          comentarios,
          historial: [
            ...(i.historial || []),
            {
              fecha: timestamp,
              evento: `Entrevista realizada. Dictamen: ${resultado}. Evaluación registrada.`,
            },
          ],
        };
      }
      return i;
    });

    storageService.set(KEYS.INTERVIEWS, updated);

    // Actualizar estado del postulante según la evaluación
    if (existing.postulanteId) {
      const targetState = nuevoEstadoPostulante || (resultado === 'Favorable' ? 'Seleccionado' : resultado === 'Desfavorable' ? 'No seleccionado' : 'Entrevistado');
      const applicants = this.getApplicants().map((a) => {
        if (a.id === existing.postulanteId) {
          return {
            ...a,
            estado: targetState,
            historial: [
              ...(a.historial || []),
              {
                fecha: today,
                evento: `Resultado de entrevista registrado (${resultado}). Estado del candidato: ${targetState}.`,
              },
            ],
          };
        }
        return a;
      });
      storageService.set(KEYS.APPLICANTS, applicants);
    }

    this.addHistoryEntry(
      'Evaluación Registrada',
      `Dictamen de entrevista para ${existing.postulanteNombre}: ${resultado}`
    );

    return updated;
  },

  // ----------------------------------------------------
  // CÁLCULO DE MÉTRICAS INTERCONECTADAS EN TIEMPO REAL
  // ----------------------------------------------------
  calculateMetrics() {
    const projects = this.getProjects();
    const employees = this.getEmployees();
    const materials = this.getMaterials();
    const expenses = this.getExpenses();
    const applicants = this.getApplicants();
    const interviews = this.getInterviews();
    const agendaActivities = this.getAgendaActivities();

    const todayStr = new Date().toISOString().split('T')[0];

    // Métricas de Selección y Reclutamiento
    const totalApplicants = applicants.length;
    const activeApplicants = applicants.filter(
      (a) => !['Seleccionado', 'No seleccionado', 'Retirado'].includes(a.estado)
    ).length;
    const selectedApplicants = applicants.filter((a) => a.estado === 'Seleccionado').length;
    const upcomingInterviews = interviews.filter(
      (i) => (i.estado === 'Programada' || i.estado === 'Reprogramada') && i.fecha >= todayStr
    ).length;
    const todayInterviews = interviews.filter(
      (i) => i.fecha === todayStr && i.estado !== 'Cancelada'
    ).length;

    // Métricas de Agenda Operativa
    const todayAgendaCount = agendaActivities.filter(
      (a) => a.fecha === todayStr && a.estado !== 'Cancelada'
    ).length;
    const totalTodayCommitments = todayInterviews + todayAgendaCount;

    // Presupuestos y Gastos
    const totalBudget = projects.reduce((acc, p) => acc + (Number(p.presupuesto) || 0), 0);
    const totalSpent = expenses.reduce((acc, g) => acc + (Number(g.monto) || 0), 0);
    const availableBudget = totalBudget - totalSpent;
    const budgetUtilization = totalBudget > 0 ? Number(((totalSpent / totalBudget) * 100).toFixed(1)) : 0;

    // Proyectos
    const activeProjects = projects.filter((p) => p.estado === 'En construcción').length;
    const completedProjects = projects.filter((p) => p.estado === 'Finalizado').length;
    const plannedProjects = projects.filter((p) => p.estado === 'Planificación').length;
    const pausedProjects = projects.filter((p) => p.estado === 'Pausado').length;
    const averageProgress =
      projects.length > 0
        ? Math.round(projects.reduce((acc, p) => acc + (Number(p.avance) || 0), 0) / projects.length)
        : 0;

    // Empleados
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => e.estado === 'Activo').length;

    // Distribución de empleados por proyecto
    const employeesByProject = {};
    projects.forEach((p) => {
      employeesByProject[p.id] = {
        proyectoId: p.id,
        proyectoNombre: p.nombre,
        total: 0,
      };
    });
    employees.forEach((e) => {
      if (employeesByProject[e.proyectoId]) {
        employeesByProject[e.proyectoId].total += 1;
      }
    });

    // Materiales y alertas de stock bajo
    const totalMaterials = materials.length;
    const lowStockMaterials = materials.filter((m) => Number(m.stockActual) <= Number(m.stockMinimo));
    const lowStockCount = lowStockMaterials.length;

    // Gastos por categoría
    const expensesByCategory = {
      Materiales: 0,
      'Mano de obra': 0,
      Transporte: 0,
      Herramientas: 0,
      Servicios: 0,
      Otros: 0,
    };
    expenses.forEach((g) => {
      const cat = g.categoria || 'Otros';
      if (expensesByCategory[cat] !== undefined) {
        expensesByCategory[cat] += Number(g.monto) || 0;
      } else {
        expensesByCategory.Otros += Number(g.monto) || 0;
      }
    });

    // Gastos por proyecto
    const expensesByProject = {};
    projects.forEach((p) => {
      expensesByProject[p.id] = {
        proyectoId: p.id,
        proyectoNombre: p.nombre,
        presupuesto: Number(p.presupuesto) || 0,
        gastado: 0,
        disponible: Number(p.presupuesto) || 0,
        porcentaje: 0,
      };
    });
    expenses.forEach((g) => {
      if (expensesByProject[g.proyectoId]) {
        expensesByProject[g.proyectoId].gastado += Number(g.monto) || 0;
      }
    });
    Object.keys(expensesByProject).forEach((id) => {
      const item = expensesByProject[id];
      item.disponible = item.presupuesto - item.gastado;
      item.porcentaje = item.presupuesto > 0 ? Math.min(100, Math.round((item.gastado / item.presupuesto) * 100)) : 0;
    });

    return {
      totalBudget,
      totalSpent,
      availableBudget,
      budgetUtilization,
      budgetUsagePercent: budgetUtilization,
      activeProjects,
      completedProjects,
      finishedProjects: completedProjects,
      plannedProjects,
      pausedProjects,
      averageProgress,
      avgProgress: averageProgress,
      totalEmployees,
      activeEmployees,
      employeesByProject: Object.values(employeesByProject),
      totalMaterials,
      lowStockCount,
      lowStockMaterials,
      expensesByCategory,
      expensesByProject: Object.values(expensesByProject),
      totalApplicants,
      activeApplicants,
      selectedApplicants,
      upcomingInterviews,
      todayInterviews,
      todayAgendaCount,
      totalTodayCommitments,
    };
  },

  // ----------------------------------------------------
  // FORMATEADORES EMPRESARIALES
  // ----------------------------------------------------
  formatCurrency(value) {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  },

  formatNumber(value) {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('es-MX').format(num);
  },

  formatDate(dateStr) {
    if (!dateStr) return 'No especificada';
    try {
      const [year, month, day] = dateStr.split('-');
      if (!year || !month || !day) return dateStr;
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return d.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  },
};

// Auto-inicializar almacenamiento en el primer uso
dataService.init();

export default dataService;
