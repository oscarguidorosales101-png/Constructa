import storageService from './storageService.js';
import {
  initialProjects,
  initialSuppliers,
  initialMaterials,
  initialExpenses,
  initialSchedule,
  initialEmployees,
  initialInventoryMovements,
  initialHistory,
} from '../data/initialData.js';

const KEYS = {
  PROJECTS: 'proyectos',
  EMPLOYEES: 'empleados',
  MATERIALS: 'materiales',
  SUPPLIERS: 'proveedores',
  EXPENSES: 'gastos',
  SCHEDULE: 'cronograma',
  MOVEMENTS: 'movimientos_inventario',
  HISTORY: 'historial_movimientos',
  AUTH: 'sesion_usuario',
};

// Usuario administrador para acceso profesional al sistema
export const DEFAULT_ADMIN = {
  id: 'USR-001',
  nombre: 'Ing. Fernando Mendoza',
  cargo: 'Director General de Operaciones',
  email: 'admin@constructa.com',
  usuario: 'admin',
  rol: 'Administrador',
};

export const constructaService = {
  // Inicialización de datos
  initData() {
    if (!storageService.get(KEYS.PROJECTS)) {
      storageService.set(KEYS.PROJECTS, initialProjects);
    }
    if (!storageService.get(KEYS.EMPLOYEES)) {
      storageService.set(KEYS.EMPLOYEES, initialEmployees);
    }
    if (!storageService.get(KEYS.MATERIALS)) {
      storageService.set(KEYS.MATERIALS, initialMaterials);
    }
    if (!storageService.get(KEYS.SUPPLIERS)) {
      storageService.set(KEYS.SUPPLIERS, initialSuppliers);
    }
    if (!storageService.get(KEYS.EXPENSES)) {
      storageService.set(KEYS.EXPENSES, initialExpenses);
    }
    if (!storageService.get(KEYS.SCHEDULE)) {
      storageService.set(KEYS.SCHEDULE, initialSchedule);
    }
    if (!storageService.get(KEYS.MOVEMENTS)) {
      storageService.set(KEYS.MOVEMENTS, initialInventoryMovements);
    }
    if (!storageService.get(KEYS.HISTORY)) {
      storageService.set(KEYS.HISTORY, initialHistory);
    }
  },

  // Reset a valores de demostración
  resetAllData() {
    storageService.set(KEYS.PROJECTS, initialProjects);
    storageService.set(KEYS.EMPLOYEES, initialEmployees);
    storageService.set(KEYS.MATERIALS, initialMaterials);
    storageService.set(KEYS.SUPPLIERS, initialSuppliers);
    storageService.set(KEYS.EXPENSES, initialExpenses);
    storageService.set(KEYS.SCHEDULE, initialSchedule);
    storageService.set(KEYS.MOVEMENTS, initialInventoryMovements);
    storageService.set(KEYS.HISTORY, initialHistory);
  },

  // GESTIÓN DE SESIÓN
  getSession() {
    return storageService.get(KEYS.AUTH, null);
  },

  login(identifier, password) {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Verificación de credenciales empresariales
    if (
      (cleanId === 'admin@constructa.com' || cleanId === 'admin') &&
      cleanPass === 'admin123'
    ) {
      const sessionData = {
        usuario: DEFAULT_ADMIN,
        fechaInicio: new Date().toISOString(),
        activo: true,
      };
      storageService.set(KEYS.AUTH, sessionData);
      return { ok: true, usuario: DEFAULT_ADMIN };
    }

    return {
      ok: false,
      mensaje: 'Las credenciales ingresadas no corresponden a un usuario autorizado.',
    };
  },

  logout() {
    storageService.remove(KEYS.AUTH);
  },

  // HISTORIAL Y AUDITORÍA INTERNA
  getHistory() {
    return storageService.get(KEYS.HISTORY, []);
  },

  addHistoryEntry(tipo, descripcion, proyectoRelacionado = 'General', monto = null) {
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
      proyectoRelacionado,
      monto,
    };

    const updated = [newEntry, ...list].slice(0, 100);
    storageService.set(KEYS.HISTORY, updated);
    return newEntry;
  },

  // PROYECTOS
  getProjects() {
    return storageService.get(KEYS.PROJECTS, []);
  },

  getProjectById(id) {
    const list = this.getProjects();
    return list.find((p) => p.id === id) || null;
  },

  saveProject(project) {
    const list = this.getProjects();
    let updated;
    const isNew = !project.id || !list.some((p) => p.id === project.id);

    if (isNew) {
      const newId = 'PRJ-' + String(list.length + 1).padStart(3, '0');
      const itemToSave = {
        ...project,
        id: newId,
        codigo: project.codigo || 'OBR-' + new Date().getFullYear() + '-' + String(list.length + 1).padStart(2, '0'),
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
              avance: Number(project.avance) || p.avance,
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

    const updated = list.map((p) =>
      p.id === id ? { ...p, avance: clampedProgress } : p
    );
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

  // EMPLEADOS
  getEmployees() {
    return storageService.get(KEYS.EMPLOYEES, []);
  },

  saveEmployee(employee) {
    const list = this.getEmployees();
    let updated;
    const isNew = !employee.id || !list.some((e) => e.id === employee.id);

    if (isNew) {
      const newId = 'EMP-' + String(list.length + 1).padStart(3, '0');
      const itemToSave = {
        ...employee,
        id: newId,
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

  // MATERIALES
  getMaterials() {
    return storageService.get(KEYS.MATERIALS, []);
  },

  saveMaterial(material) {
    const list = this.getMaterials();
    let updated;
    const isNew = !material.id || !list.some((m) => m.id === material.id);

    if (isNew) {
      const newId = 'MAT-' + String(list.length + 1).padStart(3, '0');
      const itemToSave = {
        ...material,
        id: newId,
        stockActual: Number(material.stockActual) || 0,
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
              stockActual: Number(material.stockActual) >= 0 ? Number(material.stockActual) : m.stockActual,
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

  // MOVIMIENTOS DE INVENTARIO (Entradas y Salidas)
  getInventoryMovements() {
    return storageService.get(KEYS.MOVEMENTS, []);
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
      m.id === materialId ? { ...m, stockActual: newStock } : m
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

    storageService.set(KEYS.MOVEMENTS, [newMov, ...movements]);

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

    return { ok: true, material: { ...material, stockActual: newStock }, movimiento: newMov };
  },

  // PROVEEDORES
  getSuppliers() {
    return storageService.get(KEYS.SUPPLIERS, []);
  },

  saveSupplier(supplier) {
    const list = this.getSuppliers();
    let updated;
    const isNew = !supplier.id || !list.some((s) => s.id === supplier.id);

    if (isNew) {
      const newId = 'PRV-' + String(list.length + 1).padStart(3, '0');
      updated = [{ ...supplier, id: newId }, ...list];
      this.addHistoryEntry('Proveedor Registrado', `Alta de proveedor: ${supplier.nombreComercial}`);
    } else {
      updated = list.map((s) => (s.id === supplier.id ? { ...s, ...supplier } : s));
      this.addHistoryEntry('Proveedor Modificado', `Actualización de proveedor: ${supplier.nombreComercial}`);
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
      this.addHistoryEntry('Proveedor Retirado', `Baja de proveedor: ${target.nombreComercial}`);
    }
    return updated;
  },

  // GASTOS
  getExpenses() {
    return storageService.get(KEYS.EXPENSES, []);
  },

  saveExpense(expense) {
    const list = this.getExpenses();
    const projects = this.getProjects();
    const project = projects.find((p) => p.id === expense.proyectoId);
    const projectName = project ? project.nombre : 'Proyecto General';

    let updated;
    const isNew = !expense.id || !list.some((g) => g.id === expense.id);

    if (isNew) {
      const newId = 'GST-' + String(list.length + 1).padStart(3, '0');
      const itemToSave = {
        ...expense,
        id: newId,
        monto: Number(expense.monto) || 0,
        fecha: expense.fecha || new Date().toISOString().split('T')[0],
      };
      updated = [itemToSave, ...list];
      this.addHistoryEntry('Gasto Registrado', `${expense.descripcion} (${expense.categoria})`, projectName, itemToSave.monto);
    } else {
      updated = list.map((g) =>
        g.id === expense.id
          ? {
              ...g,
              ...expense,
              monto: Number(expense.monto) || g.monto,
            }
          : g
      );
      this.addHistoryEntry('Gasto Actualizado', `Modificación de gasto: ${expense.descripcion}`, projectName, expense.monto);
    }

    storageService.set(KEYS.EXPENSES, updated);
    return updated;
  },

  deleteExpense(id) {
    const list = this.getExpenses();
    const target = list.find((g) => g.id === id);
    const projects = this.getProjects();
    const project = target ? projects.find((p) => p.id === target.proyectoId) : null;
    const projectName = project ? project.nombre : 'Proyecto General';

    const updated = list.filter((g) => g.id !== id);
    storageService.set(KEYS.EXPENSES, updated);

    if (target) {
      this.addHistoryEntry('Gasto Cancelado', `Eliminación de gasto por: ${target.descripcion}`, projectName, target.monto);
    }
    return updated;
  },

  // CRONOGRAMA
  getSchedule() {
    return storageService.get(KEYS.SCHEDULE, []);
  },

  saveActivity(activity) {
    const list = this.getSchedule();
    const projects = this.getProjects();
    const project = projects.find((p) => p.id === activity.proyectoId);
    const projectName = project ? project.nombre : 'General';

    let updated;
    const isNew = !activity.id || !list.some((a) => a.id === activity.id);

    if (isNew) {
      const newId = 'ACT-' + String(list.length + 1).padStart(3, '0');
      const itemToSave = {
        ...activity,
        id: newId,
        avance: Number(activity.avance) || 0,
      };
      updated = [itemToSave, ...list];
      this.addHistoryEntry('Actividad Creada', `Nueva tarea en cronograma: ${activity.actividad}`, projectName);
    } else {
      updated = list.map((a) =>
        a.id === activity.id
          ? {
              ...a,
              ...activity,
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

  // CÁLCULOS DINÁMICOS CONECTADOS (KPIs y Estadísticas en tiempo real)
  calculateMetrics() {
    const projects = this.getProjects();
    const employees = this.getEmployees();
    const materials = this.getMaterials();
    const expenses = this.getExpenses();

    // Presupuestos y Gastos
    const totalBudget = projects.reduce((acc, p) => acc + (Number(p.presupuesto) || 0), 0);
    const totalSpent = expenses.reduce((acc, g) => acc + (Number(g.monto) || 0), 0);
    const availableBudget = totalBudget - totalSpent;
    const budgetUtilization = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;

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
      activeProjects,
      completedProjects,
      plannedProjects,
      pausedProjects,
      averageProgress,
      totalEmployees,
      activeEmployees,
      employeesByProject: Object.values(employeesByProject),
      totalMaterials,
      lowStockCount,
      lowStockMaterials,
      expensesByCategory,
      expensesByProject: Object.values(expensesByProject),
    };
  },

  // HELPERS DE FORMATEO EMPRESARIAL
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
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  },
};

// Autoinicializar datos al importar
constructaService.initData();

export default constructaService;
