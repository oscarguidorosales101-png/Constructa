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
  const [applicants, setApplicants] = useState(() => dataService.getApplicants());
  const [interviews, setInterviews] = useState(() => dataService.getInterviews());
  const [agendaActivities, setAgendaActivities] = useState(() => dataService.getAgendaActivities());
  const [materialRequests, setMaterialRequests] = useState(() => dataService.getMaterialRequests());
  const [purchaseOrders, setPurchaseOrders] = useState(() => dataService.getPurchaseOrders());
  const [supplierInvoices, setSupplierInvoices] = useState(() => dataService.getSupplierInvoices());
  const [supplierCommunications, setSupplierCommunications] = useState(() => dataService.getSupplierCommunications());

  // 4. Métricas Interconectadas Dinámicas
  const [metrics, setMetrics] = useState(() => dataService.calculateMetrics());

  // Recalcular métricas automáticamente ante cualquier cambio de estado
  const refreshMetrics = useCallback(() => {
    setMetrics(dataService.calculateMetrics());
    setHistory(dataService.getHistory());
    setMovements(dataService.getInventoryMovements());
    setApplicants(dataService.getApplicants());
    setInterviews(dataService.getInterviews());
    setAgendaActivities(dataService.getAgendaActivities());
    setEmployees(dataService.getEmployees());
    setMaterialRequests(dataService.getMaterialRequests());
    setPurchaseOrders(dataService.getPurchaseOrders());
    setSupplierInvoices(dataService.getSupplierInvoices());
    setSupplierCommunications(dataService.getSupplierCommunications());
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

  // ----------------------------------------------------
  // GESTIÓN DE ABASTECIMIENTO, COMPRAS Y PAGOS
  // ----------------------------------------------------

  // SOLICITUDES DE MATERIALES
  const saveMaterialRequest = (requestData) => {
    const updated = dataService.saveMaterialRequest(requestData);
    setMaterialRequests(updated);
    refreshMetrics();
    showAlert(
      requestData.id ? 'Solicitud de material actualizada.' : 'Solicitud de material enviada a aprobación.',
      'exito'
    );
    return true;
  };

  const deleteMaterialRequest = (id) => {
    const updated = dataService.deleteMaterialRequest(id);
    setMaterialRequests(updated);
    refreshMetrics();
    showAlert('Solicitud de material cancelada.', 'info');
    return true;
  };

  const updateMaterialRequestStatus = (id, nuevoEstado, ordenCompraId = null) => {
    const updated = dataService.updateMaterialRequestStatus(id, nuevoEstado, ordenCompraId);
    setMaterialRequests(updated);
    refreshMetrics();
    showAlert(`Solicitud de material marcada como "${nuevoEstado}".`, 'exito');
    return true;
  };

  // ÓRDENES DE COMPRA
  const savePurchaseOrder = (orderData) => {
    const updated = dataService.savePurchaseOrder(orderData);
    setPurchaseOrders(updated);
    setMaterialRequests(dataService.getMaterialRequests());
    refreshMetrics();
    showAlert(
      orderData.id ? 'Orden de compra actualizada con éxito.' : 'Orden de compra emitida y registrada.',
      'exito'
    );
    return true;
  };

  const deletePurchaseOrder = (id) => {
    const updated = dataService.deletePurchaseOrder(id);
    setPurchaseOrders(updated);
    refreshMetrics();
    showAlert('Orden de compra retirada del sistema.', 'info');
    return true;
  };

  const updatePurchaseOrderStatus = (id, nuevoEstado, comentario = '', usuario) => {
    const user = usuario || currentUser?.nombre || 'Administración';
    const updated = dataService.updatePurchaseOrderStatus(id, nuevoEstado, comentario, user);
    setPurchaseOrders(updated);
    refreshMetrics();
    showAlert(`Orden de compra actualizada a "${nuevoEstado}".`, 'exito');
    return true;
  };

  const confirmPurchaseOrder = (id, confirmData) => {
    const user = currentUser?.nombre || 'Administración';
    const updated = dataService.confirmPurchaseOrder(id, confirmData, user);
    setPurchaseOrders(updated);
    refreshMetrics();
    showAlert('Respuesta y confirmación del proveedor registradas en la orden.', 'exito');
    return true;
  };

  const updatePurchaseOrderDeliveryDate = (id, nuevaFecha, motivo = '') => {
    const user = currentUser?.nombre || 'Logística';
    const updated = dataService.updatePurchaseOrderDeliveryDate(id, nuevaFecha, motivo, user);
    setPurchaseOrders(updated);
    refreshMetrics();
    showAlert(`Fecha prometida de entrega actualizada al ${nuevaFecha}.`, 'exito');
    return true;
  };

  // RECEPCIÓN DE MATERIALES E INVENTARIO
  const registerOrderReception = (receptionData) => {
    const res = dataService.registerOrderReception(receptionData);
    if (res.ok) {
      setPurchaseOrders(res.orders);
      setMaterials(res.materials);
      setMovements(res.movements);
      refreshMetrics();
      if (res.isPartial) {
        showAlert('Recepción parcial registrada. El inventario fue actualizado con la cantidad recibida.', 'advertencia');
      } else {
        showAlert('Recepción completa de materiales registrada. Inventario y Kardex actualizados.', 'exito');
      }
      return { ok: true, isPartial: res.isPartial, order: res.order };
    } else {
      showAlert(res.mensaje || 'Error al registrar recepción de materiales', 'error');
      return { ok: false, error: res.mensaje };
    }
  };

  // FACTURAS DE PROVEEDORES Y VALIDACIÓN DE TRES ELEMENTOS
  const saveSupplierInvoice = (invoiceData) => {
    const updated = dataService.saveSupplierInvoice(invoiceData);
    setSupplierInvoices(updated);
    setPurchaseOrders(dataService.getPurchaseOrders());
    refreshMetrics();
    showAlert(
      invoiceData.id ? 'Factura de proveedor modificada.' : 'Factura de proveedor registrada en el sistema.',
      'exito'
    );
    return true;
  };

  const deleteSupplierInvoice = (id) => {
    const updated = dataService.deleteSupplierInvoice(id);
    setSupplierInvoices(updated);
    refreshMetrics();
    showAlert('Factura retirada del registro contable.', 'info');
    return true;
  };

  const validateThreeWayMatch = (invoiceId) => {
    return dataService.validateThreeWayMatch(invoiceId);
  };

  const scheduleInvoicePayment = (paymentData) => {
    const user = currentUser?.nombre || 'Administración';
    const res = dataService.scheduleInvoicePayment({
      ...paymentData,
      programadoPor: user,
    });
    if (res.ok) {
      setSupplierInvoices(res.invoices);
      refreshMetrics();
      showAlert('Factura autorizada y programada para pago administrativo.', 'exito');
      return { ok: true };
    } else {
      showAlert(res.mensaje || 'Discrepancia detectada en validación de 3 elementos', 'error');
      return { ok: false, blocked: res.blocked, discrepancies: res.discrepancies, mensaje: res.mensaje };
    }
  };

  const processInvoicePayment = (paymentData) => {
    const user = currentUser?.nombre || 'Dirección de Finanzas';
    const res = dataService.processInvoicePayment({
      ...paymentData,
      procesadoPor: user,
    });
    if (res.ok) {
      setSupplierInvoices(res.invoices);
      refreshMetrics();
      showAlert(`¡Pago procesado administrativamente! Folio generado: ${res.comprobante}`, 'exito');
      return { ok: true, comprobante: res.comprobante };
    } else {
      showAlert(res.mensaje || 'Error al procesar el pago', 'error');
      return { ok: false };
    }
  };

  // COMUNICACIONES CON PROVEEDORES
  const saveSupplierCommunication = (commData) => {
    const user = currentUser?.nombre || 'Personal CONSTRUCTA';
    const updated = dataService.saveSupplierCommunication({
      ...commData,
      registradoPor: commData.registradoPor || user,
    });
    setSupplierCommunications(updated);
    refreshMetrics();
    showAlert('Bitácora de contacto con el proveedor registrada.', 'exito');
    return true;
  };

  const getSupplierFinancialSummary = (supplierId) => {
    return dataService.getSupplierFinancialSummary(supplierId);
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

  // ----------------------------------------------------
  // GESTIÓN DE POSTULANTES Y SELECCIÓN
  // ----------------------------------------------------
  const saveApplicant = (applicantData) => {
    const updated = dataService.saveApplicant(applicantData);
    setApplicants(updated);
    refreshMetrics();
    showAlert(
      applicantData.id ? 'Expediente del postulante actualizado.' : 'Candidatura registrada exitosamente en selección.',
      'exito'
    );
    return true;
  };

  const deleteApplicant = (id) => {
    const updated = dataService.deleteApplicant(id);
    setApplicants(updated);
    setInterviews(dataService.getInterviews());
    refreshMetrics();
    showAlert('Candidatura retirada del sistema.', 'info');
    return true;
  };

  const convertApplicantToEmployee = (applicantId, employeeData) => {
    try {
      const result = dataService.convertApplicantToEmployee(applicantId, employeeData);
      setApplicants(result.applicants);
      setEmployees(result.employees);
      refreshMetrics();
      showAlert(
        `¡Postulante contratado! ${result.employee.nombre} ha sido incorporado a la nómina de personal.`,
        'exito'
      );
      return { success: true, employee: result.employee };
    } catch (err) {
      showAlert(err.message || 'Error al convertir postulante en empleado', 'error');
      return { success: false, error: err.message };
    }
  };

  // ----------------------------------------------------
  // GESTIÓN DE ENTREVISTAS Y CONFLICTOS DE AGENDA
  // ----------------------------------------------------
  const checkInterviewConflict = (interviewData, excludeId = null) => {
    return dataService.checkInterviewConflict(interviewData, excludeId);
  };

  const saveInterview = (interviewData) => {
    try {
      const updated = dataService.saveInterview(interviewData);
      setInterviews(updated);
      setApplicants(dataService.getApplicants());
      refreshMetrics();
      showAlert(
        interviewData.id ? 'Entrevista actualizada exitosamente.' : 'Entrevista agendada exitosamente sin conflictos.',
        'exito'
      );
      return { success: true };
    } catch (err) {
      showAlert(err.message || 'Conflicto al agendar entrevista', 'error');
      return { success: false, error: err.message };
    }
  };

  const rescheduleInterview = (id, rescheduleData) => {
    try {
      const updated = dataService.rescheduleInterview(id, rescheduleData);
      setInterviews(updated);
      setApplicants(dataService.getApplicants());
      refreshMetrics();
      showAlert('Entrevista reprogramada satisfactoriamente en agenda.', 'exito');
      return { success: true };
    } catch (err) {
      showAlert(err.message || 'Conflicto al reprogramar entrevista', 'error');
      return { success: false, error: err.message };
    }
  };

  const cancelInterview = (id, motivo) => {
    const updated = dataService.cancelInterview(id, motivo);
    setInterviews(updated);
    setApplicants(dataService.getApplicants());
    refreshMetrics();
    showAlert('Entrevista cancelada y horario liberado en agenda.', 'advertencia');
    return true;
  };

  const recordInterviewResult = (id, resultData) => {
    const updated = dataService.recordInterviewResult(id, resultData);
    setInterviews(updated);
    setApplicants(dataService.getApplicants());
    refreshMetrics();
    showAlert('Resultado y evaluación de entrevista registrados.', 'exito');
    return true;
  };

  // ----------------------------------------------------
  // GESTIÓN DE AGENDA CENTRAL Y REUNIONES DE OBRA
  // ----------------------------------------------------
  const saveAgendaActivity = (activityData) => {
    try {
      const updated = dataService.saveAgendaActivity(activityData);
      setAgendaActivities(updated);
      refreshMetrics();
      showAlert(
        activityData.id ? 'Actividad de agenda actualizada.' : 'Actividad agendada exitosamente sin conflictos.',
        'exito'
      );
      return { success: true };
    } catch (err) {
      showAlert(err.message || 'Conflicto al agendar actividad', 'error');
      return { success: false, error: err.message };
    }
  };

  const deleteAgendaActivity = (id) => {
    const updated = dataService.deleteAgendaActivity(id);
    setAgendaActivities(updated);
    refreshMetrics();
    showAlert('Actividad retirada de la agenda y horario liberado.', 'info');
    return true;
  };

  // Restablecer datos a la semilla inicial de db.json y compras
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
    setApplicants(dataService.getApplicants());
    setInterviews(dataService.getInterviews());
    setAgendaActivities(dataService.getAgendaActivities());
    setMaterialRequests(dataService.getMaterialRequests());
    setPurchaseOrders(dataService.getPurchaseOrders());
    setSupplierInvoices(dataService.getSupplierInvoices());
    setSupplierCommunications(dataService.getSupplierCommunications());
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
    history,
    applicants,
    interviews,
    agendaActivities,
    materialRequests,
    purchaseOrders,
    supplierInvoices,
    supplierCommunications,
  }), [
    projects,
    employees,
    materials,
    suppliers,
    expenses,
    schedule,
    movements,
    history,
    applicants,
    interviews,
    agendaActivities,
    materialRequests,
    purchaseOrders,
    supplierInvoices,
    supplierCommunications,
  ]);

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
        materialRequests,
        saveMaterialRequest,
        deleteMaterialRequest,
        updateMaterialRequestStatus,
        purchaseOrders,
        savePurchaseOrder,
        deletePurchaseOrder,
        updatePurchaseOrderStatus,
        confirmPurchaseOrder,
        updatePurchaseOrderDeliveryDate,
        registerOrderReception,
        supplierInvoices,
        saveSupplierInvoice,
        deleteSupplierInvoice,
        validateThreeWayMatch,
        scheduleInvoicePayment,
        processInvoicePayment,
        supplierCommunications,
        saveSupplierCommunication,
        getSupplierFinancialSummary,
        calculateScheduledPaymentDate: dataService.calculateScheduledPaymentDate,
        expenses,
        saveExpense,
        deleteExpense,
        schedule,
        saveActivity,
        saveScheduleTask: saveActivity,
        deleteActivity,
        deleteScheduleTask: deleteActivity,
        applicants,
        saveApplicant,
        deleteApplicant,
        convertApplicantToEmployee,
        interviews,
        saveInterview,
        rescheduleInterview,
        cancelInterview,
        recordInterviewResult,
        checkInterviewConflict,
        calculateEndTime: dataService.calculateEndTime,
        agendaActivities,
        saveAgendaActivity,
        deleteAgendaActivity,
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
