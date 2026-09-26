import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import dataService from '../services/dataService.js';

const ConstructaContext = createContext(null);

export const ConstructaProvider = ({ children }) => {
  // 1. Estado de Sesión y Autenticación
  const [session, setSession] = useState(() => dataService.getSession());
  const [currentUser, setCurrentUser] = useState(() => {
    const s = dataService.getSession();
    return s ? s.usuario : null;
  });

  // 2. Estado de Navegación Activa
  const [activeView, setActiveView] = useState(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const s = dataService.getSession();
    if (!s) return hash === '401' || hash === '403' || hash === '404' ? hash : 'login';
    return hash || 'dashboard';
  });

  // Intención de navegación (parámetros entre módulos como abrir modal o activar pestaña)
  const [navigationIntent, setNavigationIntent] = useState(null);

  const navigateTo = useCallback((view, intent = null) => {
    setNavigationIntent(intent);
    setActiveView(view);
    if (window.location.hash.replace('#', '') !== view) {
      window.location.hash = view;
    }
  }, []);

  const clearNavigationIntent = useCallback(() => {
    setNavigationIntent(null);
  }, []);

  // 3. Colecciones de Datos Principales (con persistencia reactiva en localStorage)
  const [projects, setProjects] = useState(() => dataService.getProjects());
  const [employees, setEmployees] = useState(() => dataService.getEmployees());
  const [materials, setMaterials] = useState(() => dataService.getMaterials());
  const [suppliers, setSuppliers] = useState(() => dataService.getSuppliers());
  const [expenses, setExpenses] = useState(() => dataService.getExpenses());
  const [schedule, setSchedule] = useState(() => dataService.getSchedule());
  const [movements, setMovements] = useState(() => dataService.getInventoryMovements());
  const [history, setHistory] = useState(() => dataService.getHistory());

  // 4. Métricas Interconectadas Dinámicas
  const [metrics, setMetrics] = useState(() => dataService.calculateMetrics());

  // Recalcular métricas automáticamente ante cualquier cambio de estado
  const refreshMetrics = useCallback(() => {
    setMetrics(dataService.calculateMetrics());
    setHistory(dataService.getHistory());
    setMovements(dataService.getInventoryMovements());
  }, []);

  // 5. Sistema de Notificaciones Flotantes (Toasts)
  const [toasts, setToasts] = useState([]);

  const showAlert = useCallback((mensaje, tipo = 'exito') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    const newToast = { id, mensaje, message: mensaje, tipo, type: tipo };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((a) => a.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // 6. Modal de Confirmación Centralizado
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: null,
    confirmVariant: 'primary',
    isDestructive: false,
  });

  const requestConfirm = useCallback(({ 
    title, 
    message, 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar', 
    confirmVariant = 'primary',
    variant,
    isDestructive = false, 
    onConfirm 
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      confirmVariant: confirmVariant || variant || (isDestructive ? 'danger' : 'primary'),
      isDestructive: isDestructive || confirmVariant === 'danger' || variant === 'danger',
      onConfirm,
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
  }, []);

  // ----------------------------------------------------
  // MÉTODOS DE AUTENTICACIÓN Y SESIÓN
  // ----------------------------------------------------
  const login = (identifier, password) => {
    const res = dataService.login(identifier, password);
    if (res.ok) {
      setSession(dataService.getSession());
      setCurrentUser(res.usuario);
      setActiveView('dashboard');
      showAlert(`Bienvenido al sistema, ${res.usuario.nombre}`, 'exito');
      return { ok: true };
    } else {
      showAlert(res.mensaje, 'error');
      return { ok: false, mensaje: res.mensaje };
    }
  };

  const logout = () => {
    dataService.logout();
    setSession(null);
    setCurrentUser(null);
    setActiveView('login');
    window.location.hash = 'login';
    showAlert('Sesión cerrada correctamente.', 'info');
  };

  // ----------------------------------------------------
  // OPERACIONES CRUD CON PERSISTENCIA REAL
  // ----------------------------------------------------
  
  // PROYECTOS
  const saveProject = (projectData) => {
    const updated = dataService.saveProject(projectData);
    setProjects(updated);
    refreshMetrics();
    showAlert(
      projectData.id ? 'Proyecto actualizado correctamente.' : 'Proyecto registrado exitosamente.',
      'exito'
    );
    return true;
  };

  const deleteProject = (id) => {
    const updated = dataService.deleteProject(id);
    setProjects(updated);
    refreshMetrics();
    showAlert('Proyecto eliminado correctamente.', 'info');
    return true;
  };

  const updateProjectProgress = (id, progress) => {
    const updated = dataService.updateProjectProgress(id, progress);
    setProjects(updated);
    refreshMetrics();
    showAlert('Avance del proyecto actualizado correctamente.', 'exito');
    return true;
  };

  // EMPLEADOS (62 Colaboradores)
  const saveEmployee = (employeeData) => {
    const updated = dataService.saveEmployee(employeeData);
    setEmployees(updated);
    refreshMetrics();
    showAlert(
      employeeData.id ? 'Ficha de colaborador actualizada.' : 'Colaborador registrado exitosamente.',
      'exito'
    );
    return true;
  };

  const deleteEmployee = (id) => {
    const updated = dataService.deleteEmployee(id);
    setEmployees(updated);
    refreshMetrics();
    showAlert('Registro de personal retirado.', 'info');
    return true;
  };

  // MATERIALES (22 Insumos con Renders 3D)
  const saveMaterial = (materialData) => {
    const updated = dataService.saveMaterial(materialData);
    setMaterials(updated);
    refreshMetrics();
    showAlert(
      materialData.id ? 'Material actualizado en inventario.' : 'Material agregado al catálogo.',
      'exito'
    );
    return true;
  };

  const deleteMaterial = (id) => {
    const updated = dataService.deleteMaterial(id);
    setMaterials(updated);
    refreshMetrics();
    showAlert('Material retirado del catálogo.', 'info');
    return true;
  };

  const registerStockMovement = (movementData) => {
    const res = dataService.registerStockMovement(movementData);
    if (res.ok) {
      setMaterials(res.materials);
      setMovements(res.movements);
      refreshMetrics();
      showAlert('Movimiento de almacén registrado correctamente.', 'exito');
      return true;
    } else {
      showAlert(res.mensaje || res.error, 'error');
      return false;
    }
  };

  // PROVEEDORES
  const saveSupplier = (supplierData) => {
    const updated = dataService.saveSupplier(supplierData);
    setSuppliers(updated);
    refreshMetrics();
    showAlert(
      supplierData.id ? 'Proveedor actualizado con éxito.' : 'Proveedor registrado exitosamente.',
      'exito'
    );
    return true;
  };

  const deleteSupplier = (id) => {
    const updated = dataService.deleteSupplier(id);
    setSuppliers(updated);
    refreshMetrics();
    showAlert('Proveedor eliminado del registro.', 'info');
    return true;
  };

  // GASTOS (Impacta presupuestos, saldos y KPIs)
  const saveExpense = (expenseData) => {
    const updated = dataService.saveExpense(expenseData);
    setExpenses(updated);
    refreshMetrics();
    showAlert(
      expenseData.id ? 'Gasto modificado exitosamente.' : 'Gasto registrado correctamente.',
      'exito'
    );
    return true;
  };

  const deleteExpense = (id) => {
    const updated = dataService.deleteExpense(id);
    setExpenses(updated);
    refreshMetrics();
    showAlert('Gasto eliminado del historial.', 'info');
    return true;
  };

  // CRONOGRAMA
  const saveActivity = (activityData) => {
    const updated = dataService.saveActivity(activityData);
    setSchedule(updated);
    refreshMetrics();
    showAlert(
      activityData.id ? 'Actividad de cronograma actualizada.' : 'Actividad programada exitosamente.',
      'exito'
    );
    return true;
  };

  const deleteActivity = (id) => {
    const updated = dataService.deleteActivity(id);
    setSchedule(updated);
    refreshMetrics();
    showAlert('Actividad retirada del cronograma.', 'info');
    return true;
  };

  // Restablecer datos a la semilla inicial de db.json
  const resetDemoData = () => {
    dataService.resetAllData();
    setProjects(dataService.getProjects());
    setEmployees(dataService.getEmployees());
    setMaterials(dataService.getMaterials());
    setSuppliers(dataService.getSuppliers());
    setExpenses(dataService.getExpenses());
    setSchedule(dataService.getSchedule());
    setMovements(dataService.getInventoryMovements());
    setHistory(dataService.getHistory());
    refreshMetrics();
    showAlert('Los datos del sistema han sido restaurados a sus valores predeterminados.', 'info');
  };

  // Objeto de datos unificado y reactivo memoizado
  const data = useMemo(() => ({
    projects,
    employees,
    materials,
    suppliers,
    expenses,
    schedule,
    movements,
    inventoryMovements: movements,
    history
  }), [projects, employees, materials, suppliers, expenses, schedule, movements, history]);

  return (
    <ConstructaContext.Provider
      value={{
        session,
        currentUser,
        isAuthenticated: !!session && !!currentUser,
        activeView,
        setActiveView,
        navigateTo,
        navigationIntent,
        clearNavigationIntent,
        login,
        logout,
        data,
        projects,
        saveProject,
        deleteProject,
        updateProjectProgress,
        employees,
        saveEmployee,
        deleteEmployee,
        materials,
        saveMaterial,
        deleteMaterial,
        registerStockMovement,
        suppliers,
        saveSupplier,
        deleteSupplier,
        expenses,
        saveExpense,
        deleteExpense,
        schedule,
        saveActivity,
        saveScheduleTask: saveActivity,
        deleteActivity,
        deleteScheduleTask: deleteActivity,
        movements,
        inventoryMovements: movements,
        history,
        metrics,
        refreshMetrics,
        toasts,
        alerts: toasts,
        showAlert,
        showToast: showAlert,
        removeToast,
        removeAlert: removeToast,
        confirmState: confirmModal,
        confirmModal,
        requestConfirm,
        closeConfirm,
        resetDemoData,
        resetAllData: resetDemoData,
        formatCurrency: dataService.formatCurrency,
        formatNumber: dataService.formatNumber,
        formatDate: dataService.formatDate,
      }}
    >
      {children}
    </ConstructaContext.Provider>
  );
};

export const useConstructa = () => {
  const context = useContext(ConstructaContext);
  if (!context) {
    throw new Error('useConstructa debe utilizarse dentro de un ConstructaProvider');
  }
  return context;
};

export default ConstructaContext;
