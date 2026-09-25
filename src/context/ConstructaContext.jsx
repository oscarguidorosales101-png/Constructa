import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import constructaService from '../services/constructaService.js';

const ConstructaContext = createContext(null);

export const ConstructaProvider = ({ children }) => {
  // Estado de sesión
  const [session, setSession] = useState(() => constructaService.getSession());
  const [currentUser, setCurrentUser] = useState(() => {
    const s = constructaService.getSession();
    return s ? s.usuario : null;
  });

  // Estado de navegación activa
  const [activeView, setActiveView] = useState(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const s = constructaService.getSession();
    if (!s) return hash === '401' || hash === '403' || hash === '404' ? hash : 'login';
    return hash || 'dashboard';
  });

  // Intención de navegación (parámetros entre módulos como abrir modal o activar pestaña)
  const [navigationIntent, setNavigationIntent] = useState(null);

  const navigateTo = useCallback((view, intent = null) => {
    setNavigationIntent(intent);
    setActiveView(view);
  }, []);

  const clearNavigationIntent = useCallback(() => {
    setNavigationIntent(null);
  }, []);

  // Estado de datos principales
  const [projects, setProjects] = useState(() => constructaService.getProjects());
  const [employees, setEmployees] = useState(() => constructaService.getEmployees());
  const [materials, setMaterials] = useState(() => constructaService.getMaterials());
  const [suppliers, setSuppliers] = useState(() => constructaService.getSuppliers());
  const [expenses, setExpenses] = useState(() => constructaService.getExpenses());
  const [schedule, setSchedule] = useState(() => constructaService.getSchedule());
  const [movements, setMovements] = useState(() => constructaService.getInventoryMovements());
  const [history, setHistory] = useState(() => constructaService.getHistory());

  // Métricas dinámicas calculadas
  const [metrics, setMetrics] = useState(() => constructaService.calculateMetrics());

  // Sistema de Alertas / Notificaciones tipo Toast
  const [toasts, setToasts] = useState([]);

  // Modal de confirmación centralizado
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

  // Recalcular métricas automáticamente cuando cambian los datos
  const refreshMetrics = useCallback(() => {
    setMetrics(constructaService.calculateMetrics());
    setHistory(constructaService.getHistory());
    setMovements(constructaService.getInventoryMovements());
  }, []);

  // Función para agregar alertas
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

  // Función para solicitar confirmación
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

  // MÉTODOS DE AUTENTICACIÓN
  const login = (identifier, password) => {
    const res = constructaService.login(identifier, password);
    if (res.ok) {
      setSession(constructaService.getSession());
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
    constructaService.logout();
    setSession(null);
    setCurrentUser(null);
    setActiveView('login');
    window.location.hash = 'login';
    showAlert('Sesión cerrada correctamente.', 'info');
  };

  // MÉTODOS DE PROYECTOS
  const saveProject = (projectData) => {
    const updated = constructaService.saveProject(projectData);
    setProjects(updated);
    refreshMetrics();
    showAlert(
      projectData.id ? 'Proyecto actualizado correctamente.' : 'Proyecto registrado exitosamente.',
      'exito'
    );
    return true;
  };

  const deleteProject = (id) => {
    const updated = constructaService.deleteProject(id);
    setProjects(updated);
    refreshMetrics();
    showAlert('Proyecto eliminado correctamente.', 'info');
    return true;
  };

  const updateProjectProgress = (id, progress) => {
    const updated = constructaService.updateProjectProgress(id, progress);
    setProjects(updated);
    refreshMetrics();
    showAlert('Avance del proyecto actualizado correctamente.', 'exito');
    return true;
  };

  // MÉTODOS DE EMPLEADOS
  const saveEmployee = (employeeData) => {
    const updated = constructaService.saveEmployee(employeeData);
    setEmployees(updated);
    refreshMetrics();
    showAlert(
      employeeData.id ? 'Ficha de colaborador actualizada.' : 'Colaborador registrado exitosamente.',
      'exito'
    );
    return true;
  };

  const deleteEmployee = (id) => {
    const updated = constructaService.deleteEmployee(id);
    setEmployees(updated);
    refreshMetrics();
    showAlert('Registro de personal retirado.', 'info');
    return true;
  };

  // MÉTODOS DE MATERIALES
  const saveMaterial = (materialData) => {
    const updated = constructaService.saveMaterial(materialData);
    setMaterials(updated);
    refreshMetrics();
    showAlert(
      materialData.id ? 'Material actualizado en inventario.' : 'Material agregado al catálogo.',
      'exito'
    );
    return true;
  };

  const deleteMaterial = (id) => {
    const updated = constructaService.deleteMaterial(id);
    setMaterials(updated);
    refreshMetrics();
    showAlert('Material retirado del catálogo.', 'info');
    return true;
  };

  const registerStockMovement = (movementData) => {
    const res = constructaService.registerStockMovement(movementData);
    if (res.ok) {
      setMaterials(res.materials);
      setMovements(res.movements);
      refreshMetrics();
      showAlert('Movimiento de almacén registrado correctamente.', 'exito');
      return true;
    } else {
      showAlert(res.error, 'error');
      return false;
    }
  };

  // MÉTODOS DE PROVEEDORES
  const saveSupplier = (supplierData) => {
    const updated = constructaService.saveSupplier(supplierData);
    setSuppliers(updated);
    refreshMetrics();
    showAlert(
      supplierData.id ? 'Proveedor actualizado con éxito.' : 'Proveedor registrado exitosamente.',
      'exito'
    );
    return true;
  };

  const deleteSupplier = (id) => {
    const updated = constructaService.deleteSupplier(id);
    setSuppliers(updated);
    refreshMetrics();
    showAlert('Proveedor eliminado del registro.', 'info');
    return true;
  };

  // MÉTODOS DE GASTOS
  const saveExpense = (expenseData) => {
    const updated = constructaService.saveExpense(expenseData);
    setExpenses(updated);
    refreshMetrics();
    showAlert(
      expenseData.id ? 'Gasto modificado exitosamente.' : 'Gasto registrado correctamente.',
      'exito'
    );
    return true;
  };

  const deleteExpense = (id) => {
    const updated = constructaService.deleteExpense(id);
    setExpenses(updated);
    refreshMetrics();
    showAlert('Gasto eliminado del historial.', 'info');
    return true;
  };

  // MÉTODOS DE CRONOGRAMA
  const saveActivity = (activityData) => {
    const updated = constructaService.saveActivity(activityData);
    setSchedule(updated);
    refreshMetrics();
    showAlert(
      activityData.id ? 'Actividad de cronograma actualizada.' : 'Actividad programada exitosamente.',
      'exito'
    );
    return true;
  };

  const deleteActivity = (id) => {
    const updated = constructaService.deleteActivity(id);
    setSchedule(updated);
    refreshMetrics();
    showAlert('Actividad retirada del cronograma.', 'info');
    return true;
  };

  // Restablecer datos de fábrica / demo
  const resetDemoData = () => {
    constructaService.resetAllData();
    setProjects(constructaService.getProjects());
    setEmployees(constructaService.getEmployees());
    setMaterials(constructaService.getMaterials());
    setSuppliers(constructaService.getSuppliers());
    setExpenses(constructaService.getExpenses());
    setSchedule(constructaService.getSchedule());
    setMovements(constructaService.getInventoryMovements());
    setHistory(constructaService.getHistory());
    refreshMetrics();
    showAlert('Los datos del sistema han sido restaurados a sus valores predeterminados.', 'info');
  };

  // Unified data object
  const data = {
    projects,
    employees,
    materials,
    suppliers,
    expenses,
    schedule,
    movements,
    inventoryMovements: movements,
    history
  };

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
        formatCurrency: constructaService.formatCurrency,
        formatNumber: constructaService.formatNumber,
        formatDate: constructaService.formatDate,
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
