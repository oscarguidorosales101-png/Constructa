import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import dataService from '../services/dataService.js';
import clientService from '../services/clientService.js';
import supplierService from '../services/supplierService.js';
import employeeService from '../services/employeeService.js';
import projectService from '../services/projectService.js';
import settingsService from '../services/settingsService.js';
import accessibilityService from '../services/accessibilityService.js';
import aiService from '../services/aiService.js';
import userService from '../services/userService.js';
import roleService from '../services/roleService.js';
import haciendaService from '../services/haciendaService.js';

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
  const [clients, setClients] = useState(() => dataService.getClients());
  const [clientRequests, setClientRequests] = useState(() => dataService.getClientRequests());
  const [clientMeetings, setClientMeetings] = useState(() => dataService.getClientMeetings());
  const [clientMessages, setClientMessages] = useState(() => dataService.getClientMessages());
  const [conversations, setConversations] = useState(() => dataService.getClientConversations());
  const [users, setUsers] = useState(() => (typeof dataService?.getUsers === 'function' ? dataService.getUsers() : []));
  const [roles, setRoles] = useState(() => (typeof dataService?.getRoles === 'function' ? dataService.getRoles() : []));

  // 4. Métricas Interconectadas Dinámicas
  const [metrics, setMetrics] = useState(() => dataService.calculateMetrics());

  // 4.1 Preferencias Globales de Accesibilidad & Apariencia
  const [settings, setSettings] = useState(() => settingsService.getSettings());
  const [accessibilityModalOpen, setAccessibilityModalOpen] = useState(false);
  const [aiAssistantModalOpen, setAiAssistantModalOpen] = useState(false);

  useEffect(() => {
    // Sincronizar configuraciones persistentes al montar con guarda de seguridad
    if (settingsService && typeof settingsService.init === 'function') {
      settingsService.init()
        .then((initialSettings) => {
          if (initialSettings) setSettings(initialSettings);
        })
        .catch((err) => {
          console.warn('[ConstructaContext] Error al inicializar settings:', err);
        });
    }

    // Sincronizar entidades con backend simulado db.json
    if (dataService && typeof dataService.syncFromDb === 'function') {
      dataService.syncFromDb()
        .then((liveDb) => {
          if (liveDb) {
            if (Array.isArray(liveDb.projects)) setProjects(liveDb.projects);
            if (Array.isArray(liveDb.employees)) setEmployees(liveDb.employees);
            if (Array.isArray(liveDb.materials)) setMaterials(liveDb.materials);
            if (Array.isArray(liveDb.suppliers)) setSuppliers(liveDb.suppliers);
            if (Array.isArray(liveDb.expenses)) setExpenses(liveDb.expenses);
            if (Array.isArray(liveDb.clients)) setClients(liveDb.clients);
            if (Array.isArray(liveDb.requests)) setClientRequests(liveDb.requests);
            if (Array.isArray(liveDb.clientMeetings)) setClientMeetings(liveDb.clientMeetings);
            if (Array.isArray(liveDb.clientConversations)) setConversations(liveDb.clientConversations);
            if (Array.isArray(liveDb.users)) setUsers(liveDb.users);
            if (Array.isArray(liveDb.roles)) setRoles(liveDb.roles);
            setMetrics(dataService.calculateMetrics());
          }
        })
        .catch(() => {});
    }
  }, []);


  const updateSettings = useCallback(async (newSettings) => {
    try {
      const res = await settingsService.saveSettings(newSettings);
      const updated = (res && res.settings) ? res.settings : (res || newSettings);
      setSettings((prev) => ({ ...prev, ...updated }));
      return updated;
    } catch (err) {
      console.error('[ConstructaContext] Error al guardar settings:', err);
      return newSettings;
    }
  }, []);

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
    setClients(dataService.getClients());
    setClientRequests(dataService.getClientRequests());
    setClientMeetings(dataService.getClientMeetings());
    setClientMessages(dataService.getClientMessages());
    setConversations(dataService.getClientConversations());
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
      const targetView = res.usuario.rol === 'Cliente' ? 'portal-cliente' : 'dashboard';
      setActiveView(targetView);
      if (window.location.hash.replace('#', '') !== targetView) {
        window.location.hash = targetView;
      }
      showAlert(`Bienvenido al sistema, ${res.usuario.nombre}`, 'exito');
      return { ok: true, usuario: res.usuario };
    } else {
      if (res.requiereVerificacion) {
        return { ok: false, requiereVerificacion: true, email: res.email, mensaje: res.mensaje };
      }
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
  const saveProject = async (projectData) => {
    try {
      const res = await projectService.saveProject(projectData);
      if (res && res.ok) {
        setProjects(res.projects);
        refreshMetrics();
        showAlert(
          projectData.id ? 'Proyecto actualizado correctamente.' : 'Proyecto registrado exitosamente.',
          'exito'
        );
        return { ok: true, project: res.project, projects: res.projects };
      } else {
        const errMsg = res?.error || 'No se pudo guardar la información. Verifica la conexión con el sistema.';
        showAlert(errMsg, 'error');
        return { ok: false, error: errMsg };
      }
    } catch (err) {
      const errMsg = 'No se pudo guardar la información. Verifica la conexión con el sistema.';
      showAlert(errMsg, 'error');
      return { ok: false, error: errMsg };
    }
  };

  const deleteProject = async (id) => {
    try {
      const res = await projectService.deleteProject(id);
      if (res && res.ok) {
        setProjects(res.projects);
        refreshMetrics();
        showAlert('Proyecto eliminado correctamente.', 'info');
        return true;
      }
      showAlert('No se pudo eliminar el proyecto. Verifica la conexión con el sistema.', 'error');
      return false;
    } catch (err) {
      showAlert('No se pudo eliminar el proyecto. Verifica la conexión con el sistema.', 'error');
      return false;
    }
  };

  const updateProjectProgress = (id, progress) => {
    const updated = dataService.updateProjectProgress(id, progress);
    setProjects(updated);
    refreshMetrics();
    showAlert('Avance del proyecto actualizado correctamente.', 'exito');
    return true;
  };

  // EMPLEADOS (Persistencia real mediante employeeService y db.json)
  const saveEmployee = async (employeeData) => {
    try {
      const res = await employeeService.saveEmployee(employeeData);
      if (res && res.ok) {
        setEmployees(res.employees);
        refreshMetrics();
        showAlert(
          employeeData.id ? 'Ficha de colaborador actualizada.' : 'Colaborador registrado exitosamente.',
          'exito'
        );
        return { ok: true, employee: res.employee, employees: res.employees };
      } else {
        const errMsg = res?.error || 'No se pudo guardar la información. Verifica la conexión con el sistema.';
        showAlert(errMsg, 'error');
        return { ok: false, error: errMsg };
      }
    } catch (err) {
      const errMsg = 'No se pudo guardar la información. Verifica la conexión con el sistema.';
      showAlert(errMsg, 'error');
      return { ok: false, error: errMsg };
    }
  };

  const deleteEmployee = async (id) => {
    try {
      const res = await employeeService.deleteEmployee(id);
      if (res && res.ok) {
        setEmployees(res.employees);
        refreshMetrics();
        showAlert('Registro de personal retirado.', 'info');
        return true;
      }
      showAlert('No se pudo retirar el colaborador. Verifica la conexión con el sistema.', 'error');
      return false;
    } catch (err) {
      showAlert('No se pudo retirar el colaborador. Verifica la conexión con el sistema.', 'error');
      return false;
    }
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

  // PROVEEDORES (Persistencia real mediante supplierService y db.json)
  const saveSupplier = async (supplierData) => {
    try {
      const res = await supplierService.saveSupplier(supplierData);
      if (res && res.ok) {
        setSuppliers(res.suppliers);
        refreshMetrics();
        showAlert(
          supplierData.id ? 'Proveedor actualizado con éxito.' : 'Proveedor registrado exitosamente.',
          'exito'
        );
        return { ok: true, supplier: res.supplier, suppliers: res.suppliers };
      } else {
        const errMsg = res?.error || 'No se pudo guardar la información. Verifica la conexión con el sistema.';
        showAlert(errMsg, 'error');
        return { ok: false, error: errMsg };
      }
    } catch (err) {
      const errMsg = 'No se pudo guardar la información. Verifica la conexión con el sistema.';
      showAlert(errMsg, 'error');
      return { ok: false, error: errMsg };
    }
  };

  const deleteSupplier = async (id) => {
    try {
      const res = await supplierService.deleteSupplier(id);
      if (res && res.ok) {
        setSuppliers(res.suppliers);
        refreshMetrics();
        showAlert('Proveedor eliminado del registro.', 'info');
        return true;
      }
      showAlert('No se pudo eliminar el proveedor. Verifica la conexión con el sistema.', 'error');
      return false;
    } catch (err) {
      showAlert('No se pudo eliminar el proveedor. Verifica la conexión con el sistema.', 'error');
      return false;
    }
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

  // ----------------------------------------------------
  // GESTIÓN DE CLIENTES Y FLUJO COMERCIAL/OPERATIVO
  // ----------------------------------------------------
  const registerClient = async (clientData) => {
    const res = await clientService.registerClient(clientData);
    if (res && res.ok) {
      setClients(dataService.getClients());
      refreshMetrics();
      showAlert('Registro exitoso. Se ha generado su código de verificación preliminar.', 'exito');
      return res;
    } else {
      const err = (res && res.error) || 'Error al registrar cliente.';
      showAlert(err, 'error');
      return res || { ok: false, error: err };
    }
  };

  const verifyClientAccount = (email, code) => {
    const res = dataService.verifyClientAccount(email, code);
    if (res.ok) {
      setClients(dataService.getClients());
      refreshMetrics();
      showAlert('¡Cuenta verificada exitosamente! Ya puede acceder al Portal del Cliente.', 'exito');
      return res;
    } else {
      showAlert(res.error || 'Código de verificación incorrecto.', 'error');
      return res;
    }
  };

  const updateClientProfile = (clientData) => {
    const updated = dataService.updateClient(clientData.id, clientData);
    if (updated) {
      setClients(dataService.getClients());
      if (currentUser && currentUser.id === clientData.id) {
        setCurrentUser(updated);
        setSession((prev) => (prev ? { ...prev, usuario: updated } : prev));
      }
      refreshMetrics();
      showAlert('Perfil de cliente actualizado con éxito.', 'exito');
      return updated;
    }
    return null;
  };

  const saveClientRequest = (reqData) => {
    const res = dataService.saveClientRequest(reqData);
    if (res && (res.ok || res.id)) {
      setClientRequests(dataService.getClientRequests());
      refreshMetrics();
      showAlert('Solicitud enviada a la Constructora con éxito. Nuestro equipo la revisará.', 'exito');
      return { ok: true, data: res.data || res, id: res.id };
    } else {
      showAlert(res?.error || 'Error al registrar la solicitud.', 'error');
      return { ok: false, error: res?.error };
    }
  };

  const updateClientRequest = (id, updates) => {
    const updated = dataService.updateClientRequest(id, updates);
    if (updated) {
      setClientRequests(dataService.getClientRequests());
      refreshMetrics();
      showAlert('Solicitud de cliente actualizada.', 'exito');
      return updated;
    }
    return null;
  };

  const linkProjectToClient = (clientId, projectId) => {
    const updated = dataService.linkProjectToClient(clientId, projectId);
    if (updated) {
      setClients(dataService.getClients());
      refreshMetrics();
    }
    return updated;
  };

  const saveClientMeeting = (meetingData) => {
    const res = dataService.saveClientMeeting(meetingData);
    if (res && (res.ok || res.id)) {
      setClientMeetings(dataService.getClientMeetings());
      refreshMetrics();
      showAlert('Solicitud de reunión agendada. Se notificará a la coordinación.', 'exito');
      return { ok: true, data: res.data || res, id: res.id };
    } else {
      showAlert(res?.error || 'Error al registrar la reunión.', 'error');
      return { ok: false, error: res?.error };
    }
  };


  const updateClientMeeting = (id, updates) => {
    const updated = dataService.updateClientMeeting(id, updates);
    if (updated) {
      setClientMeetings(dataService.getClientMeetings());
      refreshMetrics();
      showAlert('Reunión actualizada.', 'exito');
      return updated;
    }
    return null;
  };

  const sendClientMessage = (msgData) => {
    const res = dataService.sendClientMessage(msgData);
    if (res.ok) {
      setClientMessages(dataService.getClientMessages());
      refreshMetrics();
      showAlert('Mensaje enviado a soporte del proyecto.', 'exito');
      return res;
    } else {
      showAlert(res.error || 'Error al enviar el mensaje.', 'error');
      return res;
    }
  };

  // ----------------------------------------------------
  // GESTIÓN DE USUARIOS (PERSISTENCIA REAL EN DB.JSON)
  // ----------------------------------------------------
  const saveUser = async (userData) => {
    try {
      const saved = await userService.saveUser(userData);
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === saved.id);
        return exists ? prev.map((u) => (u.id === saved.id ? saved : u)) : [...prev, saved];
      });
      showAlert(
        userData.id ? 'Usuario corporativo modificado correctamente.' : 'Usuario registrado y persistido en db.json.',
        'exito'
      );
      return { ok: true, user: saved };
    } catch (err) {
      const msg = err.message || 'No se pudo guardar el usuario. Verifica la conexión con el sistema.';
      showAlert(msg, 'error');
      return { ok: false, error: msg };
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const updated = await userService.toggleUserStatus(userId);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showAlert(
        updated.activo ? 'Usuario activado en el sistema.' : 'Usuario desactivado temporalmente.',
        'info'
      );
      return { ok: true, user: updated };
    } catch (err) {
      showAlert(err.message || 'Error al cambiar estado del usuario.', 'error');
      return { ok: false, error: err.message };
    }
  };

  const deleteUser = async (userId) => {
    try {
      await userService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showAlert('Usuario eliminado del sistema.', 'info');
      return { ok: true };
    } catch (err) {
      showAlert(err.message || 'Error al eliminar usuario.', 'error');
      return { ok: false, error: err.message };
    }
  };

  // ----------------------------------------------------
  // GESTIÓN DE ROLES Y PERMISOS (PERSISTENCIA EN DB.JSON)
  // ----------------------------------------------------
  const saveRole = async (roleData) => {
    try {
      const saved = await roleService.saveRole(roleData);
      setRoles((prev) => {
        const exists = prev.some((r) => r.id === saved.id);
        return exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [...prev, saved];
      });
      showAlert(
        roleData.id ? 'Rol modificado y persistido en db.json.' : 'Nuevo rol creado exitosamente.',
        'exito'
      );
      return { ok: true, role: saved };
    } catch (err) {
      const msg = err.message || 'No se pudo guardar el rol.';
      showAlert(msg, 'error');
      return { ok: false, error: msg };
    }
  };

  const deleteRole = async (roleId) => {
    try {
      await roleService.deleteRole(roleId);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      showAlert('Rol eliminado del catálogo.', 'info');
      return { ok: true };
    } catch (err) {
      showAlert(err.message || 'Error al eliminar rol.', 'error');
      return { ok: false, error: err.message };
    }
  };

  // ----------------------------------------------------
  // INTEGRACIÓN HACIENDA DE COSTA RICA
  // ----------------------------------------------------
  const consultarHacienda = async (identificacion) => {
    return haciendaService.consultarIdentificacion(identificacion);
  };

  // ----------------------------------------------------
  // GESTIÓN DE CONVERSACIONES Y MESA DE AYUDA PERSISTENTE
  // ----------------------------------------------------
  const createConversation = (data) => {
    const newConv = dataService.createClientConversation(data);
    setConversations(dataService.getClientConversations());
    refreshMetrics();
    showAlert(`Conversación "${newConv.asunto}" iniciada correctamente.`, 'exito');
    return newConv;
  };

  const sendMessageToConversation = (convId, messageData) => {
    const res = dataService.sendConversationMessage(convId, messageData);
    if (res) {
      setConversations(dataService.getClientConversations());
      refreshMetrics();
      showAlert('Mensaje enviado con éxito.', 'exito');
      return res;
    }
    showAlert('Error al enviar el mensaje a la conversación.', 'error');
    return null;
  };

  const updateConversation = (convId, updates) => {
    const updated = dataService.updateConversation(convId, updates);
    if (updated) {
      setConversations(dataService.getClientConversations());
      refreshMetrics();
      showAlert('Conversación actualizada.', 'info');
    }
    return updated;
  };

  const markConversationRead = (convId) => {
    const userRole = currentUser?.rol || 'Cliente';
    const updated = dataService.markConversationAsRead(convId, userRole);
    if (updated) {
      setConversations(dataService.getClientConversations());
    }
    return updated;
  };

  const unreadMessagesCount = useMemo(() => {
    const userRole = currentUser?.rol || 'Cliente';
    const clientEmail = currentUser?.email || null;
    return dataService.getUnreadMessagesCount(userRole, clientEmail);
  }, [conversations, currentUser]);

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
    setClients(dataService.getClients());
    setClientRequests(dataService.getClientRequests());
    setClientMeetings(dataService.getClientMeetings());
    setClientMessages(dataService.getClientMessages());
    setConversations(dataService.getClientConversations());
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
    clients,
    clientRequests,
    clientMeetings,
    clientMessages,
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
    clients,
    clientRequests,
    clientMeetings,
    clientMessages,
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
        // CLIENTES
        // USUARIOS Y ROLES (ADMINISTRACIÓN)
        users,
        setUsers,
        saveUser,
        toggleUserStatus,
        deleteUser,
        roles,
        setRoles,
        saveRole,
        deleteRole,
        consultarHacienda,
        haciendaService,
        // CLIENTES
        clients,
        clientRequests,
        clientMeetings,
        clientMessages,
        conversations,
        createConversation,
        sendMessageToConversation,
        markConversationRead,
        updateConversation,
        unreadMessagesCount,
        registerClient,
        verifyClientAccount,
        updateClientProfile,
        linkProjectToClient,
        saveClientRequest,
        updateClientRequest,
        saveClientMeeting,
        updateClientMeeting,
        sendClientMessage,
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
        // PREFERENCIAS GLOBALES & ACCESIBILIDAD
        settings,
        updateSettings,
        theme: settings.theme,
        isAccessibilityModalOpen: accessibilityModalOpen,
        openAccessibilityModal: () => setAccessibilityModalOpen(true),
        closeAccessibilityModal: () => setAccessibilityModalOpen(false),
        isAIAssistantModalOpen: aiAssistantModalOpen,
        openAIAssistantModal: () => setAiAssistantModalOpen(true),
        closeAIAssistantModal: () => setAiAssistantModalOpen(false),
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
