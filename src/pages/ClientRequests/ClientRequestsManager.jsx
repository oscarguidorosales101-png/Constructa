import React, { useState, useMemo } from 'react';
import {
  Inbox,
  User,
  HardHat,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  Eye,
  Edit3,
  MapPin,
  DollarSign,
  FileText,
  UserCheck,
  Send,
  PlusCircle,
  Briefcase,
  MessageSquare,
  Check,
  CheckCheck,
  FolderOpen
} from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import Button from '../../components/common/Button.jsx';
import ToastContainer from '../../components/common/ToastContainer.jsx';

export const ClientRequestsManager = ({ onNavigate }) => {
  const {
    currentUser,
    clientRequests,
    clientMeetings,
    conversations,
    updateClientRequest,
    updateClientMeeting,
    sendMessageToConversation,
    markConversationRead,
    updateConversation,
    unreadMessagesCount,
    saveProject,
    linkProjectToClient,
    showAlert,
    requestConfirm
  } = useConstructa();

  // Rol del usuario actual: Administrador o Gerente de Construcción
  const isGerente = currentUser?.rol === 'Gerente de Construcción';
  const isAdmin = currentUser?.rol === 'Administrador';
  const isRRHH = currentUser?.rol === 'RRHH / Reclutamiento';

  // Pestaña principal: 'solicitudes' | 'mensajeria'
  const [activeMainTab, setActiveMainTab] = useState('solicitudes');

  // Filtros de Solicitudes
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewScope, setViewScope] = useState(isGerente ? 'tecnicas' : 'todas'); // 'todas' | 'tecnicas' | 'asignadas'

  // Estados de Mesa de Ayuda / Mensajería
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [convFilter, setConvFilter] = useState('todas'); // 'todas' | 'no-leidas' | 'asignadas'
  const [convSearchTerm, setConvSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Modal de Detalle y Gestión
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [managementNotes, setManagementNotes] = useState('');
  const [assignedResponsible, setAssignedResponsible] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [technicalViability, setTechnicalViability] = useState('En estudio');

  // Modal de Conversión a Proyecto Definitivo
  const [isConvertToProjectModalOpen, setIsConvertToProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    nombre: '',
    ubicacion: '',
    presupuestoTotal: 15000000,
    director: 'Ing. Carlos Mendoza (Gerente de Construcción)',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0],
  });

  // Conversaciones filtradas para Mesa de Ayuda (Aislamiento por Rol)
  const allConversations = useMemo(() => {
    const list = conversations || [];
    if (isGerente) {
      // El Gerente sólo accede a conversaciones técnicas u operativas que le correspondan
      return list.filter((c) =>
        c.responsableRol === 'Gerente de Construcción' ||
        c.responsable?.toLowerCase().includes('carlos mendoza') ||
        c.responsable?.toLowerCase().includes('gerente') ||
        (c.proyectoId && ['PRJ-001', 'PRJ-002'].includes(c.proyectoId))
      );
    }
    return list;
  }, [conversations, isGerente]);

  // Lista de Solicitudes Filtradas
  const filteredRequests = useMemo(() => {
    let list = clientRequests || [];

    // Filtro por rol / alcance
    if (viewScope === 'tecnicas') {
      // Solicitudes técnicas o asignadas a Gerencia
      list = list.filter((r) =>
        r.responsable?.includes('Carlos Mendoza') ||
        r.responsable?.includes('Gerente') ||
        ['En evaluación', 'Reunión técnica', 'Asignada a Gerencia'].includes(r.estado) ||
        r.tipoProyecto === 'Edificio' ||
        r.tipoProyecto === 'Infraestructura' ||
        r.tipoProyecto === 'Obra civil'
      );
    } else if (viewScope === 'asignadas' && currentUser?.nombre) {
      list = list.filter((r) => r.responsable?.toLowerCase().includes(currentUser.nombre.toLowerCase().split(' ')[0]));
    }

    // Filtro por estado
    if (statusFilter !== 'Todas') {
      list = list.filter((r) => r.estado === statusFilter);
    }

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.titulo?.toLowerCase().includes(q) ||
          r.clienteNombre?.toLowerCase().includes(q) ||
          r.ubicacion?.toLowerCase().includes(q) ||
          r.id?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [clientRequests, viewScope, statusFilter, searchTerm, currentUser]);

  // Conversaciones filtradas para Mesa de Ayuda
  const adminUnreadCount = typeof unreadMessagesCount === 'number' ? unreadMessagesCount : 0;

  const filteredConversations = useMemo(() => {
    let list = allConversations;

    if (convFilter === 'no-leidas') {
      list = list.filter((c) => (c.noLeidosAdmin || 0) > 0);
    } else if (convFilter === 'asignadas') {
      const myName = currentUser?.nombre?.toLowerCase() || '';
      list = list.filter((c) =>
        c.responsable?.toLowerCase().includes(myName.split(' ')[0]) ||
        (isGerente && (c.responsable?.includes('Gerente') || c.responsable?.includes('Carlos Mendoza')))
      );
    }

    if (convSearchTerm.trim()) {
      const q = convSearchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.asunto?.toLowerCase().includes(q) ||
          c.clienteNombre?.toLowerCase().includes(q) ||
          c.proyectoNombre?.toLowerCase().includes(q) ||
          c.id?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allConversations, convFilter, convSearchTerm, currentUser, isGerente]);

  // Conversación activa
  const activeConversation = useMemo(() => {
    if (selectedConvId) {
      const found = allConversations.find((c) => c.id === selectedConvId);
      if (found) return found;
    }
    return filteredConversations[0] || allConversations[0] || null;
  }, [allConversations, selectedConvId, filteredConversations]);

  const handleSelectConv = (conv) => {
    setSelectedConvId(conv.id);
    markConversationRead(conv.id);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversation) return;

    setIsSendingReply(true);
    try {
      sendMessageToConversation(activeConversation.id, {
        remitente: currentUser?.nombre || (isAdmin ? 'Ing. Fernando Mendoza' : 'Ing. Carlos Mendoza Rivas'),
        remitenteRol: currentUser?.rol || 'Administrador',
        remitenteId: currentUser?.id || 'admin-01',
        contenido: replyText.trim(),
      });
      setReplyText('');
      markConversationRead(activeConversation.id);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleReassignResponsible = (convId, newResp) => {
    updateConversation(convId, { responsable: newResp });
  };

  // Abrir Modal de Gestión
  const handleOpenManageModal = (req) => {
    setSelectedRequest(req);
    setNewStatus(req.estado);
    setAssignedResponsible(req.responsable || (isAdmin ? 'Ing. Fernando Mendoza (Administrador)' : 'Ing. Carlos Mendoza Rivas (Gerente de Construcción)'));
    setManagementNotes('');
    setTechnicalViability(req.viabilidadTecnica || 'En estudio');
  };

  // Guardar Cambios en la Solicitud
  const handleSaveManagement = (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const fechaHoy = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
    const nuevoHistorial = [
      ...(selectedRequest.historial || []),
      {
        fecha: fechaHoy,
        estado: newStatus,
        detalle: managementNotes.trim()
          ? `${currentUser?.rol}: ${managementNotes.trim()}`
          : `${currentUser?.rol} actualizó el estado a ${newStatus} y asignó a ${assignedResponsible}.`,
      },
    ];

    updateClientRequest(selectedRequest.id, {
      estado: newStatus,
      responsable: assignedResponsible,
      viabilidadTecnica: technicalViability,
      historial: nuevoHistorial,
      ultimaActualizacion: fechaHoy,
    });

    showAlert(`Solicitud ${selectedRequest.id} actualizada con éxito.`, 'exito');
    setSelectedRequest(null);
  };

  // Iniciar Conversión a Proyecto
  const handleStartConvertToProject = (req) => {
    setProjectForm({
      nombre: req.titulo,
      ubicacion: req.ubicacion,
      presupuestoTotal: req.presupuestoEstimado ? parseInt(req.presupuestoEstimado.replace(/\D/g, '')) || 12000000 : 12000000,
      director: req.responsable?.includes('Carlos') ? 'Ing. Carlos Mendoza (Gerente de Construcción)' : 'Ing. Fernando Mendoza',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: new Date(Date.now() + 86400000 * 300).toISOString().split('T')[0],
    });
    setIsConvertToProjectModalOpen(true);
  };

  // Confirmar Creación de Proyecto Definitivo
  const handleConfirmConvertToProject = (e) => {
    e.preventDefault();
    const newId = `PRJ-${String(Date.now()).slice(-3)}`;
    const targetClientId = selectedRequest?.clienteId || selectedRequest?.clientId || 'CLI-001';

    saveProject({
      id: newId,
      nombre: projectForm.nombre,
      ubicacion: projectForm.ubicacion,
      presupuestoTotal: projectForm.presupuestoTotal,
      director: projectForm.director,
      fechaInicio: projectForm.fechaInicio,
      fechaFin: projectForm.fechaFin,
      progreso: 5,
      estado: 'En Construcción',
      clienteId: targetClientId,
      clientId: targetClientId,
      clienteNombre: selectedRequest?.clienteNombre || selectedRequest?.clientName || 'Cliente Registrado',
      solicitudOrigenId: selectedRequest?.id,
    });

    if (linkProjectToClient) {
      linkProjectToClient(targetClientId, newId);
    }

    // Actualizar la solicitud a "Aprobada" con contrato
    updateClientRequest(selectedRequest.id, {
      estado: 'Aprobada',
      proyectoGeneradoId: newId,
      historial: [
        ...(selectedRequest.historial || []),
        {
          fecha: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
          estado: 'Contrato Formalizado',
          detalle: `Se formalizó el contrato y se creó el proyecto oficial ${newId} en ejecución.`,
        },
      ],
    });

    showAlert(`¡Proyecto ${newId} generado con éxito a partir de la solicitud comercial!`, 'exito');
    setIsConvertToProjectModalOpen(false);
    setSelectedRequest(null);
  };

  if (isRRHH) {
    return (
      <div className="module-container" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.03)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h2 style={{ color: '#ffffff', marginBottom: '0.75rem', fontSize: '1.25rem' }}>Acceso Restringido</h2>
          <p style={{ lineHeight: 1.6, fontSize: '0.9rem', color: '#cbd5e1' }}>
            El módulo de Solicitudes Comerciales y Mensajería con Clientes es exclusivo de Administración y Gerencia de Construcción. Recursos Humanos gestiona de forma aislada la selección de postulantes y citas laborales.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container" style={{ padding: '1.5rem 2rem' }}>
      {/* Cabecera del Módulo */}
      <div className="module-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '6px', borderRadius: '8px' }}>
              <Inbox size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Bandeja de Solicitudes y Cotizaciones de Clientes
              </h1>
              <p style={{ fontSize: '0.86rem', color: '#94a3b8', margin: '2px 0 0' }}>
                {isGerente
                  ? 'Revisión de viabilidad técnica, análisis de terreno, anteproyectos y presupuestos de obra.'
                  : 'Recepción, clasificación administrativa, asignación de responsables y formalización de contratos.'}
              </p>
            </div>
          </div>
        </div>

        {/* Badge de Rol */}
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.82rem', color: '#f59e0b', fontWeight: 700 }}>
          Vista: {currentUser?.rol || 'Administrador'}
        </div>
      </div>

      {/* Selector de Pestaña Principal: Solicitudes de Obra vs Mesa de Ayuda */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn ${activeMainTab === 'solicitudes' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveMainTab('solicitudes')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 700 }}
        >
          <Inbox size={16} />
          Solicitudes y Cotizaciones de Clientes
          <span style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '1px 7px', borderRadius: '12px', fontSize: '0.74rem' }}>
            {clientRequests.length}
          </span>
        </button>

        <button
          type="button"
          className={`btn ${activeMainTab === 'mensajeria' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => {
            setActiveMainTab('mensajeria');
            if (activeConversation) {
              markConversationRead(activeConversation.id);
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 700 }}
        >
          <MessageSquare size={16} />
          Mesa de Ayuda y Mensajería Clientes
          {adminUnreadCount > 0 ? (
            <span style={{ background: '#f59e0b', color: '#000', padding: '1px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>
              Mensajes · {adminUnreadCount}
            </span>
          ) : (
            <span style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '1px 7px', borderRadius: '12px', fontSize: '0.74rem' }}>
              {allConversations.length}
            </span>
          )}
        </button>
      </div>

      {/* =========================================================================
          VISTA 1: SOLICITUDES Y COTIZACIONES
          ========================================================================= */}
      {activeMainTab === 'solicitudes' && (
        <>
          {/* Barra de Filtros y Búsqueda */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-sm ${viewScope === 'todas' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewScope('todas')}
              >
                Todas las Solicitudes ({clientRequests.length})
              </button>

              <button
                type="button"
                className={`btn btn-sm ${viewScope === 'tecnicas' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewScope('tecnicas')}
              >
                <HardHat size={14} style={{ marginRight: '4px' }} />
                Evaluación Técnica / Gerencia
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {/* Selector de Estado */}
              <select
                className="client-select"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Todas">Todos los estados</option>
                <option value="Recibida">Recibida</option>
                <option value="En revisión">En revisión</option>
                <option value="En evaluación">En evaluación técnica</option>
                <option value="Propuesta preparada">Propuesta preparada</option>
                <option value="Aprobada">Aprobada / Contrato</option>
              </select>

              {/* Buscador */}
              <div style={{ position: 'relative', width: '220px' }}>
                <input
                  type="text"
                  className="client-input"
                  style={{ padding: '0.4rem 0.75rem 0.4rem 2rem', fontSize: '0.82rem', width: '100%' }}
                  placeholder="Buscar cliente u obra..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>
          </div>

          {/* Tabla de Gestión */}
          <div className="client-card-panel">
            {filteredRequests.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <Inbox size={36} color="#f59e0b" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p style={{ color: '#ffffff', fontWeight: 700, margin: 0 }}>No hay solicitudes en este filtro</p>
                <p style={{ fontSize: '0.84rem', margin: '4px 0 0' }}>
                  Cuando los clientes registrados envíen requerimientos de construcción aparecerán aquí para su gestión.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="client-table">
                  <thead>
                    <tr>
                      <th>Folio / Solicitud</th>
                      <th>Cliente Solicitante</th>
                      <th>Tipo & Predio</th>
                      <th>Fecha</th>
                      <th>Responsable Actual</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <strong style={{ color: '#ffffff', display: 'block' }}>{req.titulo}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontFamily: 'monospace' }}>{req.id}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>{req.clienteNombre}</div>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{req.clienteEmail}</span>
                        </td>
                        <td>
                          <div>{req.tipoProyecto}</div>
                          <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={11} /> {req.ubicacion}
                          </span>
                        </td>
                        <td>{req.fecha}</td>
                        <td>
                          <span style={{ fontSize: '0.82rem', color: req.responsable ? '#ffffff' : '#f59e0b', fontWeight: 600 }}>
                            {req.responsable || 'Sin asignar'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${req.estado?.toLowerCase().replace(/\s+/g, '-')}`}>
                            {req.estado}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenManageModal(req)}
                            icon={<Edit3 size={13} />}
                          >
                            Gestionar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* =========================================================================
          VISTA 2: MESA DE AYUDA Y MENSAJERÍA CLIENTES ↔ ADMIN / GERENCIA
          ========================================================================= */}
      {activeMainTab === 'mensajeria' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '1.25rem', minHeight: '620px' }}>
          {/* Columna Izquierda: Lista de Conversaciones con Clientes */}
          <div className="client-card-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            {/* Filtros de Mensajería */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-xs ${convFilter === 'todas' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setConvFilter('todas')}
                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
              >
                Todas ({allConversations.length})
              </button>
              <button
                type="button"
                className={`btn btn-xs ${convFilter === 'no-leidas' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setConvFilter('no-leidas')}
                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
              >
                No leídas ({allConversations.filter(c => (c.noLeidosAdmin || 0) > 0).length})
              </button>
              <button
                type="button"
                className={`btn btn-xs ${convFilter === 'asignadas' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setConvFilter('asignadas')}
                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
              >
                Mis Asignadas
              </button>
            </div>

            {/* Buscador de conversaciones */}
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <input
                type="text"
                className="client-input"
                style={{ padding: '0.4rem 0.6rem 0.4rem 1.8rem', fontSize: '0.8rem', width: '100%' }}
                placeholder="Buscar cliente, proyecto, asunto..."
                value={convSearchTerm}
                onChange={(e) => setConvSearchTerm(e.target.value)}
              />
              <Search size={13} style={{ position: 'absolute', left: '0.55rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>

            {/* Lista Scrollable */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, maxHeight: '540px' }}>
              {filteredConversations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', fontSize: '0.84rem' }}>
                  <MessageSquare size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>No hay conversaciones en este filtro</p>
                  <p style={{ fontSize: '0.75rem', margin: '4px 0 0' }}>Los mensajes de los clientes aparecerán aquí automáticamente.</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeConversation?.id === conv.id;
                  const lastMsg = conv.mensajes?.[conv.mensajes.length - 1];
                  const hasUnread = (conv.noLeidosAdmin || 0) > 0;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConv(conv)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected ? '1px solid rgba(245, 158, 11, 0.4)' : hasUnread ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>
                            {conv.clienteNombre}
                          </span>
                        </div>
                        {hasUnread && (
                          <span
                            style={{
                              background: '#f59e0b',
                              color: '#000',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: '10px',
                            }}
                          >
                            Mensajes · {conv.noLeidosAdmin}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isSelected ? '#f59e0b' : '#cbd5e1', marginBottom: '2px' }}>
                        {conv.asunto}
                      </div>

                      <div style={{ fontSize: '0.72rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <Building size={11} /> {conv.proyectoNombre}
                      </div>

                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lastMsg ? `${lastMsg.remitente}: ${lastMsg.contenido}` : 'Sin mensajes'}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.7rem', color: '#64748b' }}>
                        <span>Resp: {conv.responsable?.split(' ')[0] || 'Admin'}</span>
                        <span>{lastMsg ? `${lastMsg.fecha} ${lastMsg.hora}` : ''}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Columna Derecha: Hilo de Conversación Activa */}
          <div className="client-card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
            {activeConversation ? (
              <>
                {/* Header de la Conversación */}
                <div style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff', fontWeight: 800 }}>
                          {activeConversation.asunto}
                        </h3>
                        <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                          Proyecto Relacionado: {activeConversation.proyectoNombre}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span><strong>Cliente:</strong> {activeConversation.clienteNombre}</span>
                        <span>•</span>
                        <span>{activeConversation.clienteEmail}</span>
                      </div>
                    </div>

                    {/* Selector de Responsable Asignado (Admin / Gerente de Construcción) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 600 }}>Responsable Asignado:</span>
                      <select
                        className="client-select"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', minWidth: '220px' }}
                        value={activeConversation.responsable || ''}
                        onChange={(e) => handleReassignResponsible(activeConversation.id, e.target.value)}
                      >
                        <option value="Ing. Fernando Mendoza (Administrador)">Ing. Fernando Mendoza (Administrador)</option>
                        <option value="Ing. Carlos Mendoza Rivas (Gerente de Construcción)">Ing. Carlos Mendoza Rivas (Gerente de Construcción)</option>
                        <option value="Atención Técnica y Comercial CONSTRUCTA">Atención Técnica y Comercial</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Feed de Mensajes con Persistencia Real */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '6px', marginBottom: '1rem', maxHeight: '420px' }}>
                  {activeConversation.mensajes?.map((msg, index) => {
                    const isFromClient = msg.remitenteTipo === 'cliente';

                    return (
                      <div
                        key={msg.id || index}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isFromClient ? 'flex-start' : 'flex-end',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '75%',
                            padding: '10px 14px',
                            borderRadius: isFromClient ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                            background: isFromClient ? '#1e293b' : 'rgba(245, 158, 11, 0.12)',
                            border: isFromClient ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(245, 158, 11, 0.3)',
                            color: '#ffffff',
                          }}
                        >
                          {/* Encabezado del Mensaje */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '0.72rem', color: isFromClient ? '#94a3b8' : '#f59e0b', fontWeight: 700 }}>
                            <span>{msg.remitente}</span>
                            <span style={{ opacity: 0.7 }}>•</span>
                            <span style={{ background: isFromClient ? 'rgba(255, 255, 255, 0.08)' : 'rgba(245, 158, 11, 0.2)', padding: '1px 5px', borderRadius: '4px' }}>
                              {msg.remitenteRol || (isFromClient ? 'Cliente' : 'Equipo CONSTRUCTA')}
                            </span>
                          </div>

                          {/* Contenido del Mensaje */}
                          <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.5, wordBreak: 'break-word', color: '#e2e8f0' }}>
                            {msg.contenido}
                          </p>

                          {/* Footer del Mensaje: Fecha, Hora y Estado */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.68rem', color: '#94a3b8' }}>
                            <span>{msg.fecha} {msg.hora}</span>
                            {!isFromClient && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: msg.estado === 'Leído' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                                {msg.estado === 'Leído' ? <CheckCheck size={12} /> : <Check size={12} />}
                                {msg.estado || 'Enviado'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Formulario de Respuesta Oficial */}
                <form onSubmit={handleSendReply} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>
                      Respondiendo como: <strong style={{ color: '#f59e0b' }}>{currentUser?.nombre} ({currentUser?.rol})</strong>
                    </span>
                    <span>Presione Enviar para persistir la respuesta</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                    <textarea
                      className="client-textarea"
                      rows={2}
                      style={{ flex: 1, resize: 'none', fontSize: '0.84rem' }}
                      placeholder={`Escriba una respuesta técnica o administrativa para ${activeConversation.clienteNombre}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          handleSendReply(e);
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={!replyText.trim() || isSendingReply}
                      icon={<Send size={15} />}
                      style={{ height: '56px', padding: '0 1.25rem' }}
                    >
                      {isSendingReply ? 'Enviando...' : 'Enviar'}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94a3b8' }}>
                <Inbox size={42} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p style={{ fontWeight: 700, margin: 0, color: '#ffffff' }}>Seleccione una conversación</p>
                <p style={{ fontSize: '0.82rem', margin: '4px 0 0' }}>Haga clic en la lista lateral para ver el hilo completo y responder.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DE GESTIÓN Y ASIGNACIÓN
          ========================================================================= */}
      {selectedRequest && (
        <div className="client-modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="client-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="client-modal-header">
              <div>
                <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontFamily: 'monospace' }}>
                  GESTIÓN: {selectedRequest.id}
                </span>
                <h3 style={{ margin: '2px 0 0' }}>{selectedRequest.titulo}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveManagement}>
              <div className="client-modal-body">
                {/* Datos del Cliente */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div><strong>Cliente:</strong> {selectedRequest.clienteNombre}</div>
                    <div><strong>Email:</strong> {selectedRequest.clienteEmail}</div>
                    <div><strong>Teléfono:</strong> {selectedRequest.clienteTelefono || 'No proporcionado'}</div>
                    <div><strong>Ubicación:</strong> {selectedRequest.ubicacion}</div>
                    <div><strong>Terreno propio:</strong> {selectedRequest.poseeTerreno || 'Sí'}</div>
                    <div><strong>Planos previos:</strong> {selectedRequest.poseePlanos || 'No'}</div>
                  </div>
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <strong>Descripción del requerimiento:</strong> {selectedRequest.descripcion}
                  </div>
                </div>

                {/* Formulario de Asignación y Estado */}
                <div className="client-form-row">
                  <div className="client-form-group">
                    <label>Asignar Responsable *</label>
                    <select
                      className="client-select"
                      value={assignedResponsible}
                      onChange={(e) => setAssignedResponsible(e.target.value)}
                    >
                      <option value="Ing. Fernando Mendoza (Administrador)">Ing. Fernando Mendoza (Administrador General)</option>
                      <option value="Ing. Carlos Mendoza Rivas (Gerente de Construcción)">Ing. Carlos Mendoza Rivas (Gerente de Construcción)</option>
                      <option value="Coordinación Comercial y Presupuestos">Coordinación Comercial y Presupuestos</option>
                    </select>
                  </div>

                  <div className="client-form-group">
                    <label>Estado del Flujo Comercial/Técnico</label>
                    <select
                      className="client-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="Recibida">1. Recibida (Pendiente de revisión)</option>
                      <option value="En revisión">2. En revisión inicial</option>
                      <option value="Información requerida">3. Información adicional requerida</option>
                      <option value="Asignada">4. Asignada a Gerencia Técnica</option>
                      <option value="En evaluación">5. En evaluación técnica / Visita terreno</option>
                      <option value="Propuesta preparada">6. Propuesta / Cotización preparada</option>
                      <option value="En negociación">7. En negociación comercial</option>
                      <option value="Aprobada">8. Aprobada por Cliente</option>
                      <option value="Rechazada">Rechazada / No viable</option>
                    </select>
                  </div>
                </div>

                {/* Evaluación Técnica del Gerente de Construcción */}
                <div className="client-form-row">
                  <div className="client-form-group">
                    <label>Viabilidad Técnica (Gerencia de Construcción)</label>
                    <select
                      className="client-select"
                      value={technicalViability}
                      onChange={(e) => setTechnicalViability(e.target.value)}
                    >
                      <option value="En estudio">En estudio geotécnico / topográfico</option>
                      <option value="Viable">Totalmente Viable</option>
                      <option value="Condicionada a mecánica de suelo">Condicionada a estudio de suelo</option>
                      <option value="Requiere readecuación">Requiere readecuación de proyecto</option>
                    </select>
                  </div>
                </div>

                {/* Observaciones Internas */}
                <div className="client-form-group">
                  <label>Observaciones de Gestión / Comentarios para Trazabilidad</label>
                  <textarea
                    className="client-textarea"
                    rows={3}
                    value={managementNotes}
                    onChange={(e) => setManagementNotes(e.target.value)}
                    placeholder="Escriba los acuerdos con el cliente, notas de visita técnica o condiciones presupuestales..."
                  />
                </div>
              </div>

              <div className="client-modal-footer" style={{ justifyContent: 'space-between' }}>
                {/* Botón para formalizar contrato y crear proyecto definitivo (Sección 52) */}
                {selectedRequest.estado === 'Propuesta preparada' || selectedRequest.estado === 'Aprobada' ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleStartConvertToProject(selectedRequest)}
                    icon={<Briefcase size={14} />}
                    style={{ borderColor: '#10b981', color: '#10b981' }}
                  >
                    Formalizar Contrato y Crear Proyecto
                  </Button>
                ) : (
                  <div />
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button type="button" variant="outline" onClick={() => setSelectedRequest(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" icon={<CheckCircle2 size={15} />}>
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: FORMALIZACIÓN Y CREACIÓN DE PROYECTO DEFINITIVO (SECCIÓN 52)
          ========================================================================= */}
      {isConvertToProjectModalOpen && (
        <div className="client-modal-overlay" onClick={() => setIsConvertToProjectModalOpen(false)}>
          <div className="client-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="client-modal-header">
              <div>
                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>
                  Formalización Contractual
                </span>
                <h3 style={{ margin: '2px 0 0' }}>Generar Proyecto Oficial en Ejecución</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConvertToProjectModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmConvertToProject}>
              <div className="client-modal-body">
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                  Al formalizar el contrato, la solicitud pasará al catálogo maestro de proyectos activos de CONSTRUCTA. El cliente tendrá acceso directo en su portal a cronogramas y fotografías.
                </p>

                <div className="client-form-group">
                  <label>Nombre del Proyecto Definitivo *</label>
                  <input
                    type="text"
                    className="client-input"
                    value={projectForm.nombre}
                    onChange={(e) => setProjectForm({ ...projectForm, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="client-form-row">
                  <div className="client-form-group">
                    <label>Ubicación de Obra *</label>
                    <input
                      type="text"
                      className="client-input"
                      value={projectForm.ubicacion}
                      onChange={(e) => setProjectForm({ ...projectForm, ubicacion: e.target.value })}
                      required
                    />
                  </div>

                  <div className="client-form-group">
                    <label>Presupuesto Total Contratado (MXN) *</label>
                    <input
                      type="number"
                      className="client-input"
                      value={projectForm.presupuestoTotal}
                      onChange={(e) => setProjectForm({ ...projectForm, presupuestoTotal: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="client-form-group">
                  <label>Director / Supervisor Asignado</label>
                  <select
                    className="client-select"
                    value={projectForm.director}
                    onChange={(e) => setProjectForm({ ...projectForm, director: e.target.value })}
                  >
                    <option value="Ing. Carlos Mendoza (Gerente de Construcción)">Ing. Carlos Mendoza (Gerente de Construcción)</option>
                    <option value="Ing. Fernando Mendoza">Ing. Fernando Mendoza (Administrador)</option>
                  </select>
                </div>

                <div className="client-form-row">
                  <div className="client-form-group">
                    <label>Fecha de Inicio</label>
                    <input
                      type="date"
                      className="client-input"
                      value={projectForm.fechaInicio}
                      onChange={(e) => setProjectForm({ ...projectForm, fechaInicio: e.target.value })}
                      required
                    />
                  </div>

                  <div className="client-form-group">
                    <label>Fecha Estimada de Entrega</label>
                    <input
                      type="date"
                      className="client-input"
                      value={projectForm.fechaFin}
                      onChange={(e) => setProjectForm({ ...projectForm, fechaFin: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="client-modal-footer">
                <Button type="button" variant="outline" onClick={() => setIsConvertToProjectModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" icon={<CheckCircle2 size={15} />}>
                  Confirmar y Crear Proyecto de Obra
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ClientRequestsManager;
