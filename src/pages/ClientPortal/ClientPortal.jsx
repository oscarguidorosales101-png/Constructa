import React, { useState, useMemo, useEffect } from 'react';
import {
  HardHat,
  Home,
  FileText,
  Briefcase,
  Calendar,
  FolderOpen,
  DollarSign,
  MessageSquare,
  User,
  LogOut,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Upload,
  Send,
  Video,
  MapPin,
  Building,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  Layers,
  ArrowRight,
  Paperclip,
  Check,
  CheckCheck,
  Image as ImageIcon
} from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import Button from '../../components/common/Button.jsx';
import ToastContainer from '../../components/common/ToastContainer.jsx';
import PDFPreviewModal from '../../components/common/PDFPreviewModal.jsx';
import {
  buildProjectDossierPDF,
  buildQuotationRequestPDF,
  buildFinancialStatementPDF,
} from '../../utils/pdfGenerator.js';
import SearchInput from '../../components/common/SearchInput.jsx';

export const ClientPortal = ({ onNavigate }) => {
  const {
    currentUser,
    logout,
    projects,
    clientRequests,
    clientMeetings,
    conversations,
    createConversation,
    sendMessageToConversation,
    markConversationRead,
    unreadMessagesCount,
    saveClientRequest,
    updateClientRequest,
    saveClientMeeting,
    updateClientProfile,
    formatCurrency,
    formatDate,
    showAlert,
    requestConfirm,
    navigateTo,
    setActiveView
  } = useConstructa();

  const navigate = onNavigate || navigateTo || setActiveView || ((view) => { window.location.hash = view; });

  // Pestaña activa
  const [activeTab, setActiveTab] = useState('inicio');

  // Filtro y búsqueda de solicitudes
  const [requestFilter, setRequestFilter] = useState('Todas');
  const [requestSearchTerm, setRequestSearchTerm] = useState('');

  // Modales
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [isNewConvModalOpen, setIsNewConvModalOpen] = useState(false);

  // Estado del Modal de Previsualización PDF
  const [pdfModalState, setPdfModalState] = useState({
    isOpen: false,
    pdfResult: null,
  });

  // Formulario de Nueva Solicitud de Construcción / Cotización
  const [newRequestForm, setNewRequestForm] = useState({
    titulo: '',
    tipoProyecto: 'Vivienda',
    tipoInmueble: 'Residencial Unifamiliar',
    ubicacion: '',
    areaM2: '',
    presupuestoEstimado: '',
    plazoDeseado: '6 a 12 meses',
    estadoActual: 'Idea preliminar / Planeación',
    poseeTerreno: 'Sí, escriturado',
    poseePlanos: 'No, requiere anteproyecto',
    descripcion: '',
    archivosAdjuntos: [],
  });

  // Formulario de Solicitud de Reunión
  const [newMeetingForm, setNewMeetingForm] = useState({
    motivo: 'Evaluación técnica inicial y viabilidad',
    proyectoRelacionado: '',
    modalidad: 'Virtual',
    fechaDeseada: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    horaDeseada: '10:00',
    descripcion: '',
  });

  // Formulario de subida de documento con archivo real
  const [uploadDocForm, setUploadDocForm] = useState({
    nombre: '',
    tipo: 'Planos preliminares',
    tamano: '2.4 MB',
    proyectoId: '',
    archivoSeleccionado: null,
  });

  // Mensajería y Mesa de Ayuda
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [chatMessageText, setChatMessageText] = useState('');
  const [chatAttachment, setChatAttachment] = useState(null);

  // Formulario para Nueva Conversación
  const [newConvForm, setNewConvForm] = useState({
    asunto: '',
    proyectoId: '',
    mensajeInicial: '',
  });

  // Documentos compartidos por el cliente en el expediente
  const [clientSharedDocs, setClientSharedDocs] = useState([
    {
      id: 'DOC-CLI-01',
      nombre: 'Escritura del Predio y Predial al Corriente.pdf',
      tipo: 'Escrituras o predial',
      tamano: '3.2 MB',
      fecha: '2026-03-24',
      estado: 'Validado',
    },
    {
      id: 'DOC-CLI-02',
      nombre: 'Mecánica de Suelos Preliminar - Las Lomas.pdf',
      tipo: 'Estudio de suelo',
      tamano: '6.4 MB',
      fecha: '2026-03-26',
      estado: 'En análisis',
    },
  ]);

  // Datos filtrados para el cliente autenticado
  const clientEmail = currentUser?.email || 'cliente@constructa.com';

  const myRequests = useMemo(() => {
    return (clientRequests || []).filter(
      (r) => r.clienteEmail?.toLowerCase() === clientEmail.toLowerCase()
    );
  }, [clientRequests, clientEmail]);

  const filteredRequests = useMemo(() => {
    let list = myRequests;
    if (requestFilter !== 'Todas') {
      list = list.filter((r) => r.estado === requestFilter);
    }
    if (requestSearchTerm.trim()) {
      const q = requestSearchTerm.toLowerCase();
      list = list.filter((r) =>
        (r.titulo || '').toLowerCase().includes(q) ||
        (r.numero || '').toLowerCase().includes(q) ||
        (r.id || '').toLowerCase().includes(q) ||
        (r.tipo || '').toLowerCase().includes(q) ||
        (r.ubicacion || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [myRequests, requestFilter, requestSearchTerm]);

  const myMeetings = useMemo(() => {
    return (clientMeetings || []).filter(
      (m) => m.clienteEmail?.toLowerCase() === clientEmail.toLowerCase()
    );
  }, [clientMeetings, clientEmail]);

  // Proyectos vinculados estrictamente al cliente autenticado
  const myProjects = useMemo(() => {
    const directLinked = (currentUser?.proyectosAsociados || []);
    return (projects || []).filter((p) => {
      // Vinculado explícitamente en el perfil del cliente
      if (directLinked.includes(p.id)) return true;
      // Vinculado por clienteId o clientId
      const currentId = currentUser?.id;
      const currentCliId = currentUser?.clienteId;
      if (currentId && (p.clienteId === currentId || p.clientId === currentId || p.cliente === currentUser.nombre)) return true;
      if (currentCliId && (p.clienteId === currentCliId || p.clientId === currentCliId)) return true;
      // Vinculado por correo del cliente
      if (clientEmail && (p.clienteEmail?.toLowerCase() === clientEmail.toLowerCase() || p.clientEmail?.toLowerCase() === clientEmail.toLowerCase())) return true;
      return false;
    });
  }, [projects, currentUser, clientEmail]);

  const primaryProject = myProjects[0] || null;

  // Conversaciones privadas y exclusivas del cliente autenticado (Aislamiento Total)
  const myConversations = useMemo(() => {
    if (!currentUser && !clientEmail) return [];
    return (conversations || []).filter((c) => {
      const matchEmail = clientEmail && c.clienteEmail?.toLowerCase() === clientEmail.toLowerCase();
      const matchId = currentUser?.id && c.clienteId === currentUser.id;
      return Boolean(matchEmail || matchId);
    });
  }, [conversations, clientEmail, currentUser]);

  // Establecer conversación activa inicial
  useEffect(() => {
    if (!activeConversationId && myConversations.length > 0) {
      setActiveConversationId(myConversations[0].id);
    }
  }, [myConversations, activeConversationId]);

  const activeConversation = useMemo(() => {
    return myConversations.find((c) => c.id === activeConversationId) || myConversations[0] || null;
  }, [myConversations, activeConversationId]);

  // Marcar como leída al seleccionar conversación
  useEffect(() => {
    if (activeConversation && activeConversation.noLeidosCliente > 0) {
      markConversationRead(activeConversation.id);
    }
  }, [activeConversation, markConversationRead]);

  // Próxima reunión
  const nextMeeting = useMemo(() => {
    return myMeetings.find((m) => m.estado === 'Confirmada') || myMeetings[0] || null;
  }, [myMeetings]);

  // Manejador de Cierre de Sesión con Confirmación Centrada en Modal Obsidiana
  const handleLogout = () => {
    requestConfirm({
      title: '¿Cerrar sesión?',
      message: '¿Estás seguro de que deseas cerrar tu sesión en el Portal de CONSTRUCTA?',
      confirmText: 'Cerrar sesión',
      cancelText: 'Cancelar',
      isDestructive: true,
      onConfirm: () => {
        logout();
        navigate('login');
      },
    });
  };

  // Abrir Modal de Vista Previa de PDF (Generar -> Previsualizar -> Confirmar -> Descargar)
  const handleOpenPDFPreview = (generatorFn, arg1, arg2) => {
    try {
      const result = generatorFn(arg1, arg2);
      setPdfModalState({
        isOpen: true,
        pdfResult: result,
      });
    } catch (err) {
      showAlert('Error al procesar el documento PDF.', 'error');
    }
  };

  // Guardar Nueva Solicitud
  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!newRequestForm.titulo.trim() || !newRequestForm.ubicacion.trim()) {
      showAlert('Por favor ingrese el título y la ubicación del proyecto.', 'error');
      return;
    }

    const res = saveClientRequest({
      ...newRequestForm,
      clienteId: currentUser?.id || 'CLI-001',
      clienteNombre: currentUser?.nombre || 'Cliente',
      clienteEmail: clientEmail,
      clienteTelefono: currentUser?.telefono || '',
    });

    if (res.ok) {
      setIsNewRequestModalOpen(false);
      setNewRequestForm({
        titulo: '',
        tipoProyecto: 'Vivienda',
        tipoInmueble: 'Residencial Unifamiliar',
        ubicacion: '',
        areaM2: '',
        presupuestoEstimado: '',
        plazoDeseado: '6 a 12 meses',
        estadoActual: 'Idea preliminar / Planeación',
        poseeTerreno: 'Sí, escriturado',
        poseePlanos: 'No, requiere anteproyecto',
        descripcion: '',
        archivosAdjuntos: [],
      });
      setActiveTab('mis-solicitudes');
      showAlert('Solicitud registrada con éxito. Nuestro equipo la revisará a la brevedad.', 'exito');
    }
  };

  // Solicitar Reunión
  const handleCreateMeeting = (e) => {
    e.preventDefault();
    if (!newMeetingForm.motivo.trim()) {
      showAlert('Por favor indique el motivo de la reunión.', 'error');
      return;
    }

    const res = saveClientMeeting({
      ...newMeetingForm,
      clienteId: currentUser?.id || 'CLI-001',
      clienteNombre: currentUser?.nombre || 'Cliente',
      clienteEmail: clientEmail,
      responsable: 'Ing. Carlos Mendoza Rivas',
      responsableRol: 'Gerente de Construcción',
    });

    if (res.ok) {
      setIsMeetingModalOpen(false);
      setActiveTab('reuniones');
      showAlert('Reunión agendada. Se ha notificado al responsable técnico.', 'exito');
    }
  };

  // Enlace directo desde el proyecto a la Mesa de Ayuda
  const handleContactSupportForProject = (project) => {
    const existing = myConversations.find((c) => c.proyectoId === project.id);
    if (existing) {
      setActiveConversationId(existing.id);
      markConversationRead(existing.id);
    } else {
      const created = createConversation({
        clienteId: currentUser?.id || 'CLI-001',
        clienteNombre: currentUser?.nombre || 'Lic. Roberto Garza Sada',
        clienteEmail,
        proyectoId: project.id,
        proyectoNombre: project.nombre,
        asunto: `Seguimiento de obra: ${project.nombre}`,
        responsable: project.director || 'Ing. Carlos Mendoza Rivas',
        responsableRol: 'Gerente de Construcción',
        primerMensaje: `Hola, solicito información y seguimiento sobre los avances recientes en la obra ${project.nombre}.`,
        remitenteTipo: 'cliente',
        remitenteNombre: currentUser?.nombre || 'Lic. Roberto Garza Sada',
        remitenteRol: 'Cliente',
      });
      setActiveConversationId(created.id);
    }
    setActiveTab('mensajes');
    showAlert(`Conectado a la Mesa de Ayuda para ${project.nombre}.`, 'info');
  };

  // Enviar Mensaje dentro de la Conversación Activa
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatMessageText.trim() && !chatAttachment) return;
    if (!activeConversation) {
      showAlert('Selecciona o inicia una conversación antes de enviar.', 'error');
      return;
    }

    sendMessageToConversation(activeConversation.id, {
      remitente: currentUser?.nombre || 'Lic. Roberto Garza Sada',
      remitenteRol: 'Cliente',
      remitenteTipo: 'cliente',
      contenido: chatMessageText.trim() || 'Se adjunta archivo para revisión.',
      archivoAdjunto: chatAttachment,
    });

    setChatMessageText('');
    setChatAttachment(null);
  };

  // Crear Nueva Conversación desde el Modal
  const handleCreateNewConversation = (e) => {
    e.preventDefault();
    if (!newConvForm.asunto.trim() || !newConvForm.mensajeInicial.trim()) {
      showAlert('Ingresa el asunto y tu mensaje inicial.', 'error');
      return;
    }

    const selectedProj = myProjects.find((p) => p.id === newConvForm.proyectoId);

    const created = createConversation({
      clienteId: currentUser?.id || 'CLI-001',
      clienteNombre: currentUser?.nombre || 'Lic. Roberto Garza Sada',
      clienteEmail,
      proyectoId: selectedProj?.id || null,
      proyectoNombre: selectedProj?.nombre || 'Consulta General / Nueva Solicitud',
      asunto: newConvForm.asunto.trim(),
      responsable: selectedProj ? 'Ing. Carlos Mendoza Rivas' : 'Ing. Fernando Mendoza',
      responsableRol: selectedProj ? 'Gerente de Construcción' : 'Administrador',
      primerMensaje: newConvForm.mensajeInicial.trim(),
      remitenteTipo: 'cliente',
      remitenteNombre: currentUser?.nombre || 'Lic. Roberto Garza Sada',
      remitenteRol: 'Cliente',
    });

    setIsNewConvModalOpen(false);
    setActiveConversationId(created.id);
    setNewConvForm({ asunto: '', proyectoId: '', mensajeInicial: '' });
    setActiveTab('mensajes');
  };

  // Selección de archivo real para subir
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadDocForm((prev) => ({
        ...prev,
        nombre: prev.nombre || file.name,
        tamano: `${sizeMB} MB`,
        archivoSeleccionado: {
          name: file.name,
          size: `${sizeMB} MB`,
          type: file.type || 'Documento',
        },
      }));
    }
  };

  // Guardar documento subido
  const handleUploadDoc = (e) => {
    e.preventDefault();
    if (!uploadDocForm.nombre.trim()) {
      showAlert('Indique el nombre o descripción del documento.', 'error');
      return;
    }

    const newDoc = {
      id: `DOC-CLI-${Date.now().toString().slice(-4)}`,
      nombre: uploadDocForm.nombre,
      tipo: uploadDocForm.tipo,
      tamano: uploadDocForm.tamano,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'En análisis',
    };

    setClientSharedDocs((prev) => [newDoc, ...prev]);
    showAlert(`Documento "${uploadDocForm.nombre}" cargado y vinculado al expediente oficial.`, 'exito');
    setIsUploadDocModalOpen(false);
    setUploadDocForm({
      nombre: '',
      tipo: 'Planos preliminares',
      tamano: '2.4 MB',
      proyectoId: '',
      archivoSeleccionado: null,
    });
  };

  // Adjuntar archivo rápido en chat
  const handleSimulateChatAttachment = (name, size, type) => {
    setChatAttachment({
      nombre: name,
      tamano: size,
      tipo: type,
    });
    showAlert(`Archivo "${name}" preparado para adjuntar al mensaje.`, 'info');
  };

  // Renderizar estado en pill
  const renderStatusBadge = (estado) => {
    const slug = (estado || '').toLowerCase().replace(/\s+/g, '-');
    return <span className={`status-pill ${slug}`}>{estado}</span>;
  };

  return (
    <div className="client-portal-wrapper">
      {/* =========================================================================
          1. HEADER CORPORATIVO DEL CLIENTE
          ========================================================================= */}
      <header className="client-header">
        <div className="client-header-container">
          <div className="client-brand" onClick={() => setActiveTab('inicio')} style={{ cursor: 'pointer' }}>
            <div className="client-brand-logo">
              <HardHat size={22} />
            </div>
            <div className="client-brand-text">
              <span className="client-brand-title">CONSTRUCTA</span>
              <span className="client-brand-subtitle">Portal del Cliente</span>
            </div>
          </div>

          <div className="client-header-user">
            <div className="client-user-info">
              <span className="client-user-name">{currentUser?.nombre || 'Lic. Roberto Garza'}</span>
              <span className="client-user-status">
                <ShieldCheck size={13} /> {currentUser?.estadoVerificacion || 'Cuenta Verificada'}
              </span>
            </div>

            <div className="client-header-actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => navigate('inicio')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                title="Ir al Sitio Público"
              >
                <ExternalLink size={14} />
                <span className="hide-mobile">Sitio Público</span>
              </button>

              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleLogout}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                title="Cerrar Sesión"
              >
                <LogOut size={14} />
                <span className="hide-mobile">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. BARRA DE NAVEGACIÓN MODULAR DEL CLIENTE
          ========================================================================= */}
      <nav className="client-nav-bar">
        <div className="client-nav-container">
          <button
            type="button"
            className={`client-nav-btn ${activeTab === 'inicio' ? 'active' : ''}`}
            onClick={() => setActiveTab('inicio')}
          >
            <Home size={16} /> Inicio
          </button>

          <button
            type="button"
            className={`client-nav-btn ${activeTab === 'mis-solicitudes' ? 'active' : ''}`}
            onClick={() => setActiveTab('mis-solicitudes')}
          >
            <FileText size={16} /> Mis Solicitudes
            {myRequests.length > 0 && (
              <span className="client-nav-badge">{myRequests.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`client-nav-btn ${activeTab === 'mis-proyectos' ? 'active' : ''}`}
            onClick={() => setActiveTab('mis-proyectos')}
          >
            <Building size={16} /> Mis Proyectos
            {myProjects.length > 0 && (
              <span className="client-nav-badge">{myProjects.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`client-nav-btn ${activeTab === 'reuniones' ? 'active' : ''}`}
            onClick={() => setActiveTab('reuniones')}
          >
            <Calendar size={16} /> Reuniones
            {myMeetings.length > 0 && (
              <span className="client-nav-badge">{myMeetings.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`client-nav-btn ${activeTab === 'documentos' ? 'active' : ''}`}
            onClick={() => setActiveTab('documentos')}
          >
            <FolderOpen size={16} /> Documentos
          </button>

          <button
            type="button"
            className={`client-nav-btn ${activeTab === 'pagos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pagos')}
          >
            <DollarSign size={16} /> Finanzas & Pagos
          </button>

          <button
            type="button"
            className={`client-nav-btn ${activeTab === 'mensajes' ? 'active' : ''}`}
            onClick={() => setActiveTab('mensajes')}
          >
            <MessageSquare size={16} /> Mesa de Ayuda
            {unreadMessagesCount > 0 && (
              <span className="client-nav-badge gold" style={{ background: '#f59e0b', color: '#000', fontWeight: 800 }}>
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`client-nav-btn ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            <User size={16} /> Mi Perfil
          </button>
        </div>
      </nav>

      {/* =========================================================================
          3. CONTENIDO PRINCIPAL SEGÚN PESTAÑA ACTIVA
          ========================================================================= */}
      <main className="client-main-content">
        {/* ===================== TAB 1: INICIO (DASHBOARD) ===================== */}
        {activeTab === 'inicio' && (
          <div>
            {/* Banner de Bienvenida */}
            <div className="client-hero-banner">
              <div className="client-hero-text">
                <h1>Bienvenido a su Espacio Privado, {currentUser?.nombre || 'Estimado Cliente'}</h1>
                <p>
                  Supervise en tiempo real el avance técnico de sus obras, consulte propuestas presupuestales, descargue expedientes en PDF certificados y comuníquese directamente con la Gerencia de Construcción.
                </p>
              </div>
              <div className="client-hero-cta">
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  onClick={() => setIsNewRequestModalOpen(true)}
                >
                  Solicitar Proyecto
                </Button>
                <Button
                  variant="outline"
                  icon={<MessageSquare size={16} />}
                  onClick={() => setActiveTab('mensajes')}
                >
                  Mesa de Ayuda
                </Button>
              </div>
            </div>

            {/* Métricas Rápidas del Cliente */}
            <div className="client-stats-grid">
              <div className="client-stat-card">
                <div className="client-stat-header">
                  <span className="client-stat-label">Proyectos en Ejecución</span>
                  <div className="client-stat-icon gold">
                    <Building size={18} />
                  </div>
                </div>
                <span className="client-stat-value">{myProjects.length}</span>
                <span className="client-stat-sub">
                  {primaryProject ? `${primaryProject.nombre} (${primaryProject.progreso || 68}%)` : 'Sin proyectos'}
                </span>
              </div>

              <div className="client-stat-card">
                <div className="client-stat-header">
                  <span className="client-stat-label">Solicitudes de Obra</span>
                  <div className="client-stat-icon emerald">
                    <FileText size={18} />
                  </div>
                </div>
                <span className="client-stat-value">{myRequests.length}</span>
                <span className="client-stat-sub">
                  {myRequests.filter((r) => r.estado !== 'Aprobada').length} en proceso de análisis
                </span>
              </div>

              <div className="client-stat-card">
                <div className="client-stat-header">
                  <span className="client-stat-label">Próxima Reunión</span>
                  <div className="client-stat-icon blue">
                    <Calendar size={18} />
                  </div>
                </div>
                <span className="client-stat-value" style={{ fontSize: '1.15rem', whiteSpace: 'nowrap' }}>
                  {nextMeeting ? `${nextMeeting.fecha} ${nextMeeting.hora}` : 'Sin programar'}
                </span>
                <span className="client-stat-sub">
                  {nextMeeting ? `${nextMeeting.motivo}` : 'Puede agendar cuando guste'}
                </span>
              </div>

              <div className="client-stat-card">
                <div className="client-stat-header">
                  <span className="client-stat-label">Mensajes y Consultas</span>
                  <div className="client-stat-icon purple">
                    <MessageSquare size={18} />
                  </div>
                </div>
                <span className="client-stat-value">{myConversations.length}</span>
                <span className="client-stat-sub">
                  {unreadMessagesCount > 0 ? `${unreadMessagesCount} mensajes nuevos` : 'Bandeja al día'}
                </span>
              </div>
            </div>

            {/* Proyecto Activo en Detalle */}
            {primaryProject && (
              <div className="client-project-hero">
                <div className="client-project-header">
                  <div className="client-project-title-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Proyecto Principal Asignado
                      </span>
                      <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                        Render 3D Conceptual
                      </span>
                    </div>
                    <h2>{primaryProject.nombre}</h2>
                    <div className="client-project-meta">
                      <span className="client-project-meta-item">
                        <MapPin size={14} color="#f59e0b" /> {primaryProject.ubicacion || 'Av. Las Palmas #450, Distrito Metropolitano'}
                      </span>
                      <span className="client-project-meta-item">
                        <Briefcase size={14} color="#f59e0b" /> Responsable: {primaryProject.director || 'Ing. Carlos Mendoza (Gerente de Construcción)'}
                      </span>
                      <span className="client-project-meta-item">
                        <Clock size={14} color="#f59e0b" /> Entrega: {primaryProject.fechaFin || '30 Nov 2026'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    {renderStatusBadge(primaryProject.estado || 'En Construcción')}
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<MessageSquare size={14} />}
                      onClick={() => handleContactSupportForProject(primaryProject)}
                    >
                      Contactar soporte de obra
                    </Button>
                  </div>
                </div>

                {/* Render Arquitectónico Banner */}
                <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', margin: '1rem 0', maxHeight: '240px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <img
                    src={primaryProject.imagen || '/imgs/proyectos/torre_altavista.jpg'}
                    alt={primaryProject.nombre}
                    style={{ width: '100%', height: '240px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/imgs/proyectos/torre_altavista.jpg';
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '10px', left: '12px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.74rem', color: '#cbd5e1' }}>
                    Visualización Conceptual Arquitectónica • CONSTRUCTA
                  </div>
                </div>

                {/* Barra de Progreso */}
                <div className="client-progress-container">
                  <div className="client-progress-bar-bg">
                    <div
                      className="client-progress-bar-fill"
                      style={{ width: `${primaryProject.avance || primaryProject.progreso || 68}%` }}
                    />
                  </div>
                  <div className="client-progress-labels">
                    <span>Avance Físico Certificado por Supervisión Técnica</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{primaryProject.avance || primaryProject.progreso || 68}% completado</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: MIS SOLICITUDES ===================== */}
        {activeTab === 'mis-solicitudes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Mis Solicitudes y Cotizaciones de Construcción
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                  Consulte el estado de análisis técnico, presupuestos preliminares y exporte expedientes en PDF.
                </p>
              </div>

              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => setIsNewRequestModalOpen(true)}
              >
                Nueva Solicitud de Obra
              </Button>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, minWidth: '240px', maxWidth: '380px' }}>
                <SearchInput
                  placeholder="Buscar solicitud por título, folio o tipo..."
                  value={requestSearchTerm}
                  onChange={setRequestSearchTerm}
                  onClear={() => setRequestSearchTerm('')}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['Todas', 'Recibida', 'En revisión', 'En evaluación', 'Aprobada'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setRequestFilter(f)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      background: requestFilter === f ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.04)',
                      color: requestFilter === f ? '#000000' : '#cbd5e1',
                      fontWeight: requestFilter === f ? 700 : 500,
                      fontSize: '0.8rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="client-card-panel">
              {filteredRequests.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <FileText size={36} color="#f59e0b" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', margin: '0 0 4px 0', fontWeight: 600 }}>
                    No se encontraron solicitudes con este filtro.
                  </p>
                  <span style={{ fontSize: '0.8rem' }}>Haga clic en "Nueva Solicitud de Obra" para registrar una consulta técnica.</span>
                </div>
              ) : (
                <div className="client-table-responsive">
                  <table className="client-table">
                    <thead>
                      <tr>
                        <th>Folio / Proyecto</th>
                        <th>Tipo / Área</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Responsable Asignado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((req) => (
                        <tr key={req.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{req.titulo}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                              {req.numero || req.id}
                            </div>
                          </td>
                          <td>
                            <div style={{ color: 'var(--text-secondary)' }}>{req.tipo || 'Cotización'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {req.areaAproximada ? `${req.areaAproximada} m²` : 'A definir'}
                            </div>
                          </td>
                          <td>{req.fechaCreacion || req.fecha}</td>
                          <td>{renderStatusBadge(req.estado)}</td>
                          <td>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                              {req.asignadoA || 'Ing. Fernando Mendoza (Admin)'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => setSelectedRequestDetail(req)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Eye size={13} /> Ver
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => handleOpenPDFPreview(buildQuotationRequestPDF, req, currentUser)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                                title="Exportar Propuesta en PDF"
                              >
                                <Download size={13} /> PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: MIS PROYECTOS ===================== */}
        {activeTab === 'mis-proyectos' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Proyectos Asociados y Seguimiento de Obra
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                Consulte el estado físico, responsables, hitos constructivos y visualización conceptual arquitectónica.
              </p>
            </div>

            {myProjects.length === 0 ? (
              <div className="client-card-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Building size={36} color="#f59e0b" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>Aún no cuenta con un contrato de obra activo</h3>
                <p style={{ fontSize: '0.86rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                  Sus solicitudes de cotización pasarán por revisión técnica y presupuestal. Una vez formalizado el contrato correspondiente, la obra aparecerá en este módulo.
                </p>
                <Button variant="primary" onClick={() => setIsNewRequestModalOpen(true)}>
                  Solicitar Proyecto de Construcción
                </Button>
              </div>
            ) : (
              myProjects.map((proj) => (
                <div key={proj.id} className="client-project-hero" style={{ marginBottom: '2rem' }}>
                  <div className="client-project-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, fontFamily: 'monospace' }}>
                          CÓDIGO: {proj.id}
                        </span>
                        <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                          Render Conceptual Arquitectónico
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: '2px 0 6px' }}>
                        {proj.nombre}
                      </h3>
                      <div className="client-project-meta">
                        <span className="client-project-meta-item">
                          <MapPin size={14} color="#f59e0b" /> {proj.ubicacion}
                        </span>
                        <span className="client-project-meta-item">
                          <User size={14} color="#f59e0b" /> Director: {proj.director || 'Ing. Carlos Mendoza (Gerente de Construcción)'}
                        </span>
                        <span className="client-project-meta-item">
                          <Calendar size={14} color="#f59e0b" /> Plazo: {proj.fechaInicio} — {proj.fechaFin}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      {renderStatusBadge(proj.estado)}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<MessageSquare size={13} />}
                          onClick={() => handleContactSupportForProject(proj)}
                        >
                          Contactar soporte
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Download size={13} />}
                          onClick={() => handleOpenPDFPreview(buildProjectDossierPDF, proj, currentUser)}
                        >
                          Exportar PDF
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Banner Render Arquitectónico */}
                  <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', margin: '1.25rem 0', maxHeight: '280px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <img
                      src={proj.imagen || '/imgs/proyectos/torre_altavista.jpg'}
                      alt={proj.nombre}
                      style={{ width: '100%', height: '280px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/imgs/proyectos/torre_altavista.jpg';
                      }}
                    />
                    <div style={{ position: 'absolute', bottom: '12px', left: '14px', background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(6px)', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.12)', fontSize: '0.76rem', color: '#cbd5e1' }}>
                      Visualización Conceptual Arquitectónica (Render 3D Oficial)
                    </div>
                  </div>

                  {/* Barra de Avance */}
                  <div className="client-progress-container">
                    <div className="client-progress-bar-bg">
                      <div
                        className="client-progress-bar-fill"
                        style={{ width: `${proj.avance || proj.progreso || 68}%` }}
                      />
                    </div>
                    <div className="client-progress-labels">
                      <span>Certificación de avance físico de obra</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{proj.avance || proj.progreso || 68}% completado</strong>
                    </div>
                  </div>

                  {/* Hitos */}
                  <div className="client-milestones-track">
                    <div className="client-milestone-step">
                      <div className="client-milestone-indicator completed">✓</div>
                      <div className="client-milestone-info">
                        <span className="client-milestone-name">Fase 1: Preliminares y Muros</span>
                        <span className="client-milestone-status">Concluido al 100%</span>
                      </div>
                    </div>

                    <div className="client-milestone-step">
                      <div className="client-milestone-indicator completed">✓</div>
                      <div className="client-milestone-info">
                        <span className="client-milestone-name">Fase 2: Cimentación Profunda</span>
                        <span className="client-milestone-status">Concluido al 100%</span>
                      </div>
                    </div>

                    <div className="client-milestone-step">
                      <div className="client-milestone-indicator current">3</div>
                      <div className="client-milestone-info">
                        <span className="client-milestone-name">Fase 3: Estructura Principal</span>
                        <span className="client-milestone-status">En ejecución (65%)</span>
                      </div>
                    </div>

                    <div className="client-milestone-step">
                      <div className="client-milestone-indicator">4</div>
                      <div className="client-milestone-info">
                        <span className="client-milestone-name">Fase 4: Acabados y Fachada</span>
                        <span className="client-milestone-status">Próxima fase</span>
                      </div>
                    </div>
                  </div>

                  {/* Galería de Fotografías de Avance Autorizadas */}
                  <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))' }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ImageIcon size={16} color="#f59e0b" /> Registro Fotográfico Autorizado de Supervisión
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#000' }}>
                        <img
                          src="/imgs/proyectos/torre_altavista.jpg"
                          alt="Avance de obra"
                          style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'; }}
                        />
                        <div style={{ padding: '6px 10px', fontSize: '0.72rem', color: '#94a3b8' }}>
                          Colado de losa Nivel 14
                        </div>
                      </div>

                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#000' }}>
                        <img
                          src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80"
                          alt="Avance estructural"
                          style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                          onError={(e) => { e.target.onerror = null; e.target.src = '/imgs/proyectos/torre_altavista.jpg'; }}
                        />
                        <div style={{ padding: '6px 10px', fontSize: '0.72rem', color: '#94a3b8' }}>
                          Armado estructural y supervisión
                        </div>
                      </div>

                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#000' }}>
                        <img
                          src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80"
                          alt="Instalaciones"
                          style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                          onError={(e) => { e.target.onerror = null; e.target.src = '/imgs/proyectos/torre_altavista.jpg'; }}
                        />
                        <div style={{ padding: '6px 10px', fontSize: '0.72rem', color: '#94a3b8' }}>
                          Trazo de ductería hidráulica
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ===================== TAB 4: REUNIONES ===================== */}
        {activeTab === 'reuniones' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Reuniones y Coordinación Técnica
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                  Sesiones oficiales con la Gerencia de Construcción y Dirección General (Virtuales o en Obra).
                </p>
              </div>

              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => setIsMeetingModalOpen(true)}
              >
                Solicitar Nueva Reunión
              </Button>
            </div>

            <div className="client-card-panel">
              {myMeetings.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Calendar size={36} color="#f59e0b" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', margin: '0 0 4px 0', fontWeight: 600 }}>
                    No tiene reuniones programadas actualmente.
                  </p>
                  <span style={{ fontSize: '0.8rem' }}>Puede agendar una cita técnica con la Gerencia en cualquier momento.</span>
                </div>
              ) : (
                <div className="client-table-responsive">
                  <table className="client-table">
                    <thead>
                      <tr>
                        <th>Motivo de la Sesión</th>
                        <th>Fecha y Hora</th>
                        <th>Modalidad / Lugar</th>
                        <th>Responsable Asignado</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myMeetings.map((reu) => (
                        <tr key={reu.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{reu.motivo}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {reu.proyectoNombre || 'Proyecto General'}
                            </div>
                          </td>
                          <td>
                            <div style={{ color: 'var(--text-primary)' }}>{reu.fecha}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)' }}>{reu.hora} ({reu.duracionMinutos || 45} min)</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {reu.modalidad === 'Virtual' ? <Video size={14} color="#38bdf8" /> : <MapPin size={14} color="#f59e0b" />}
                              <span>{reu.modalidad}</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{reu.lugar}</div>
                          </td>
                          <td>
                            <div style={{ color: 'var(--text-primary)' }}>{reu.responsable}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{reu.responsableRol || 'Gerente'}</div>
                          </td>
                          <td>{renderStatusBadge(reu.estado)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 5: DOCUMENTOS ===================== */}
        {activeTab === 'documentos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Expediente Digital del Proyecto
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                  Descargue contratos y expedientes certificados en PDF y comparta archivos técnicos.
                </p>
              </div>

              <Button
                variant="primary"
                icon={<Upload size={16} />}
                onClick={() => setIsUploadDocModalOpen(true)}
              >
                Compartir Archivo
              </Button>
            </div>

            {/* Documentos Oficiales Emitidos */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} color="#10b981" /> Documentos Oficiales Emitidos por CONSTRUCTA
              </h3>
              <div className="doc-grid">
                <div className="doc-card">
                  <div className="doc-card-top">
                    <div className="doc-icon-box">
                      <FileText size={22} />
                    </div>
                    <div className="doc-details">
                      <h4>Contrato de Obra a Precio Alzado</h4>
                      <p>Contrato marco firmado y legalizado con póliza de fianza y especificaciones técnicas.</p>
                    </div>
                  </div>
                  <div className="doc-card-bottom">
                    <span>PDF Oficial • 4.8 MB</span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenPDFPreview(buildProjectDossierPDF, primaryProject, currentUser)}
                    >
                      <Download size={13} /> Ver y Descargar PDF
                    </button>
                  </div>
                </div>

                <div className="doc-card">
                  <div className="doc-card-top">
                    <div className="doc-icon-box">
                      <Layers size={22} />
                    </div>
                    <div className="doc-details">
                      <h4>Dossier Ejecutivo del Proyecto</h4>
                      <p>Resumen técnico certificado con desglose de avance físico y firmas directivas.</p>
                    </div>
                  </div>
                  <div className="doc-card-bottom">
                    <span>PDF Oficial • 2.6 MB</span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenPDFPreview(buildProjectDossierPDF, primaryProject, currentUser)}
                    >
                      <Download size={13} /> Ver y Descargar PDF
                    </button>
                  </div>
                </div>

                <div className="doc-card">
                  <div className="doc-card-top">
                    <div className="doc-icon-box">
                      <DollarSign size={22} />
                    </div>
                    <div className="doc-details">
                      <h4>Cotización y Catálogo de Conceptos</h4>
                      <p>Desglose por partidas, costos unitarios e impuestos conforme a solicitud.</p>
                    </div>
                  </div>
                  <div className="doc-card-bottom">
                    <span>PDF Oficial • 1.9 MB</span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenPDFPreview(buildQuotationRequestPDF, myRequests[0] || { titulo: 'Contrato de Obra', presupuestoEstimado: primaryProject?.presupuesto || 18500000 }, currentUser)}
                    >
                      <Download size={13} /> Ver y Descargar PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentos aportados por el cliente */}
            <div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Upload size={18} color="#f59e0b" /> Documentos y Archivos Aportados por el Cliente
              </h3>
              <div className="doc-grid">
                {clientSharedDocs.map((doc) => (
                  <div key={doc.id} className="doc-card">
                    <div className="doc-card-top">
                      <div className="doc-icon-box" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' }}>
                        <FileText size={22} />
                      </div>
                      <div className="doc-details">
                        <h4>{doc.nombre}</h4>
                        <p>Tipo: {doc.tipo} • Fecha: {doc.fecha}</p>
                      </div>
                    </div>
                    <div className="doc-card-bottom">
                      <span>{doc.tamano}</span>
                      <span style={{ color: doc.estado === 'Validado' ? '#10b981' : '#f59e0b', fontWeight: 600, fontSize: '0.8rem' }}>
                        {doc.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 6: FINANZAS & PAGOS ===================== */}
        {activeTab === 'pagos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Control Financiero y Calendario de Pagos de Obra
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                  Transparencia sobre el presupuesto contratado, anticipos amortizados y próximos hitos financieros.
                </p>
              </div>

              <Button
                variant="primary"
                icon={<Download size={16} />}
                onClick={() => handleOpenPDFPreview(buildFinancialStatementPDF, primaryProject, currentUser)}
              >
                Exportar Estado Financiero (PDF)
              </Button>
            </div>

            {/* Resumen Financiero */}
            <div className="client-financial-summary">
              <div className="client-fin-card total">
                <div className="client-fin-card-label">Presupuesto Contratado</div>
                <div className="client-fin-card-amount">
                  {formatCurrency(primaryProject?.presupuesto || 18500000)}
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Monto total bajo contrato formal</span>
              </div>

              <div className="client-fin-card paid">
                <div className="client-fin-card-label">Pagos Realizados y Certificados</div>
                <div className="client-fin-card-amount" style={{ color: '#10b981' }}>
                  {formatCurrency((primaryProject?.presupuesto || 18500000) * 0.45)}
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>45% del contrato liquidado</span>
              </div>

              <div className="client-fin-card balance">
                <div className="client-fin-card-label">Saldo por Amortizar</div>
                <div className="client-fin-card-amount" style={{ color: '#f59e0b' }}>
                  {formatCurrency((primaryProject?.presupuesto || 18500000) * 0.55)}
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Sujeto al cumplimiento de hitos</span>
              </div>
            </div>

            {/* Calendario de Hitos de Pago */}
            <div className="client-card-panel" style={{ marginTop: '1.5rem' }}>
              <div className="client-card-panel-header">
                <div className="client-card-panel-title">
                  <DollarSign size={18} color="#f59e0b" />
                  <span>Calendario de Hitos y Estimaciones de Obra</span>
                </div>
              </div>

              <div className="client-table-responsive">
                <table className="client-table">
                  <thead>
                    <tr>
                      <th>Folio Estimación</th>
                      <th>Concepto / Alcance</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Comprobante</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>EST-01 / Anticipo</td>
                      <td>Anticipo contractual para arranque de terracerías</td>
                      <td>{formatCurrency((primaryProject?.presupuesto || 18500000) * 0.2)}</td>
                      <td><span className="status-pill finalizado">Liquidado</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenPDFPreview(buildFinancialStatementPDF, primaryProject, currentUser)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Download size={13} /> Recibo PDF
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>EST-02 / Hito Cimentación</td>
                      <td>Conclusión de zapatas y losa de cimentación</td>
                      <td>{formatCurrency((primaryProject?.presupuesto || 18500000) * 0.15)}</td>
                      <td><span className="status-pill finalizado">Liquidado</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenPDFPreview(buildFinancialStatementPDF, primaryProject, currentUser)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Download size={13} /> Recibo PDF
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>EST-03 / Hito Nivel 7</td>
                      <td>Armado estructural de columnas hasta Nivel 7</td>
                      <td>{formatCurrency((primaryProject?.presupuesto || 18500000) * 0.1)}</td>
                      <td><span className="status-pill finalizado">Liquidado</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenPDFPreview(buildFinancialStatementPDF, primaryProject, currentUser)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Download size={13} /> Recibo PDF
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>EST-04 / Hito Nivel 14</td>
                      <td>Colado de losa y estructura hasta Nivel 14</td>
                      <td>{formatCurrency((primaryProject?.presupuesto || 18500000) * 0.25)}</td>
                      <td><span className="status-pill en-construcción">En revisión</span></td>
                      <td>
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Pendiente certificación</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 7: MESA DE AYUDA Y SOPORTE ===================== */}
        {activeTab === 'mensajes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Mesa de Ayuda y Soporte del Proyecto
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                  Canal oficial bidireccional y persistente con la Administración y la Gerencia de Construcción.
                </p>
              </div>

              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => setIsNewConvModalOpen(true)}
              >
                Nueva Consulta
              </Button>
            </div>

            {/* Layout de Mensajería Dividido */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '1.25rem', minHeight: '520px' }}>
              {/* Columna Izquierda: Lista de Conversaciones */}
              <div className="client-card-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                  Mis Conversaciones ({myConversations.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
                  {myConversations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      No tienes conversaciones activas. Inicia una con el botón "+ Nueva Consulta".
                    </div>
                  ) : (
                    myConversations.map((conv) => {
                      const isSelected = activeConversation?.id === conv.id;
                      const lastMsg = conv.mensajes?.[conv.mensajes.length - 1];
                      return (
                        <div
                          key={conv.id}
                          onClick={() => {
                            setActiveConversationId(conv.id);
                            markConversationRead(conv.id);
                          }}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-surface-muted, rgba(255, 255, 255, 0.02))',
                            border: isSelected ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '0.84rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.3 }}>
                              {conv.asunto}
                            </strong>
                            {conv.noLeidosCliente > 0 && (
                              <span
                                style={{
                                  background: '#f59e0b',
                                  color: '#000',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  padding: '1px 6px',
                                  borderRadius: '10px',
                                  marginLeft: '6px',
                                }}
                              >
                                {conv.noLeidosCliente}
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', fontWeight: 600, marginBottom: '4px' }}>
                            {conv.proyectoNombre}
                          </div>

                          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lastMsg ? `${lastMsg.remitente}: ${lastMsg.contenido}` : 'Sin mensajes'}
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            <span>{conv.responsableRol || 'Administración'}</span>
                            <span>{conv.ultimaActualizacion?.split(' ')[0]}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Columna Derecha: Hilo de Conversación Activa */}
              <div className="client-card-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {activeConversation ? (
                  <>
                    {/* Encabezado del Hilo */}
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))', background: 'var(--bg-surface-elevated, #0f172a)', borderRadius: '10px 10px 0 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', fontWeight: 700, textTransform: 'uppercase' }}>
                            Proyecto Relacionado: {activeConversation.proyectoNombre}
                          </div>
                          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: '2px 0 4px 0', fontWeight: 700 }}>
                            {activeConversation.asunto}
                          </h3>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span><strong>Responsable:</strong> {activeConversation.responsable}</span>
                            <span style={{ padding: '1px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.7rem' }}>
                              {activeConversation.responsableRol}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className={`status-pill ${activeConversation.estado?.toLowerCase()}`}>
                            {activeConversation.estado}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Área de Mensajes */}
                    <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '320px', maxHeight: '420px', background: 'rgba(11, 17, 32, 0.6)' }}>
                      {(activeConversation.mensajes || []).map((msg) => {
                        const isClient = msg.remitenteTipo === 'cliente' || msg.remitenteRol === 'Cliente';
                        return (
                          <div
                            key={msg.id}
                            style={{
                              alignSelf: isClient ? 'flex-end' : 'flex-start',
                              maxWidth: '75%',
                              background: isClient ? 'rgba(245, 158, 11, 0.12)' : 'rgba(30, 41, 59, 0.9)',
                              border: isClient ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: isClient ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                              padding: '10px 14px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '0.78rem', color: isClient ? '#f59e0b' : '#38bdf8' }}>
                                {msg.remitente} {isClient ? '(Usted)' : `(${msg.remitenteRol || 'CONSTRUCTA'})`}
                              </strong>
                              <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                {msg.fecha} • {msg.hora}
                              </span>
                            </div>

                            <p style={{ fontSize: '0.84rem', color: '#f1f5f9', margin: '0 0 6px 0', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                              {msg.contenido}
                            </p>

                            {/* Archivo adjunto si existe */}
                            {msg.archivoAdjunto && (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  background: 'rgba(0, 0, 0, 0.25)',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.74rem',
                                  color: '#cbd5e1',
                                  marginBottom: '4px',
                                }}
                              >
                                <Paperclip size={13} color="#f59e0b" />
                                <span>{msg.archivoAdjunto.nombre} ({msg.archivoAdjunto.tamano})</span>
                              </div>
                            )}

                            {/* Estado del mensaje */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '3px', fontSize: '0.68rem', color: '#94a3b8' }}>
                              {isClient && (
                                <>
                                  {msg.estado === 'Leído' ? (
                                    <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                      <CheckCheck size={12} /> Leído
                                    </span>
                                  ) : (
                                    <span style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                      <Check size={12} /> Enviado
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Barra de Entrada de Mensaje */}
                    <div style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: '#0f172a', borderRadius: '0 0 10px 10px' }}>
                      {chatAttachment && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            fontSize: '0.76rem',
                            marginBottom: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b' }}>
                            <Paperclip size={14} />
                            <span>Adjunto: {chatAttachment.nombre} ({chatAttachment.tamano}) • Listo para enviar</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setChatAttachment(null)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            &times;
                          </button>
                        </div>
                      )}

                      <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <textarea
                            className="client-textarea"
                            rows={2}
                            value={chatMessageText}
                            onChange={(e) => setChatMessageText(e.target.value)}
                            placeholder="Escribe tu consulta o requerimiento técnico..."
                            style={{ width: '100%', resize: 'none', paddingRight: '40px' }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendChatMessage(e);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSimulateChatAttachment('Croquis_Detalle_Terraza.pdf', '1.8 MB', 'PDF')}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '12px',
                              background: 'none',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                            }}
                            title="Adjuntar archivo o plano"
                          >
                            <Paperclip size={18} />
                          </button>
                        </div>

                        <Button type="submit" variant="primary" icon={<Send size={15} />}>
                          Enviar
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    <MessageSquare size={36} color="#f59e0b" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                    <p>Selecciona una conversación para ver los mensajes.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 8: MI PERFIL ===================== */}
        {activeTab === 'perfil' && (
          <div style={{ maxWidth: '680px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Perfil del Cliente
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                Datos de contacto oficiales registrados para emisión de cotizaciones y avisos de obra.
              </p>
            </div>

            <div className="client-card-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                  }}
                >
                  {(currentUser?.nombre || 'C').charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>
                    {currentUser?.nombre || 'Lic. Roberto Garza'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.76rem', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> {currentUser?.estadoVerificacion || 'Cuenta Verificada'}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      ID: {currentUser?.id || 'CLI-001'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Correo Electrónico (No modificable)
                  </label>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {currentUser?.email || 'cliente@constructa.com'}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Rol en Plataforma
                  </label>
                  <div style={{ fontSize: '0.9rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
                    Cliente Externo
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Teléfono Registrado
                  </label>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {currentUser?.telefono || '+52 55 4920 1832'}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Empresa / Razón Social
                  </label>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {currentUser?.empresa || 'Inversiones Inmobiliarias del Valle S.A.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL: NUEVA SOLICITUD DE PROYECTO
          ========================================================================= */}
      {isNewRequestModalOpen && (
        <div className="client-modal-overlay" onClick={() => setIsNewRequestModalOpen(false)}>
          <div className="client-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="client-modal-header">
              <h3>Solicitar Cotización de Proyecto</h3>
              <button
                type="button"
                onClick={() => setIsNewRequestModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateRequest}>
              <div className="client-modal-body">
                <div className="client-form-group">
                  <label>Título o Nombre del Proyecto *</label>
                  <input
                    type="text"
                    className="client-input"
                    value={newRequestForm.titulo}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, titulo: e.target.value })}
                    placeholder="Ej. Residencia Familiar en Bosques de las Lomas"
                    required
                  />
                </div>

                <div className="client-form-row">
                  <div className="client-form-group">
                    <label>Tipo de Obra</label>
                    <select
                      className="client-select"
                      value={newRequestForm.tipoProyecto}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, tipoProyecto: e.target.value })}
                    >
                      <option value="Vivienda">Vivienda Residencial</option>
                      <option value="Edificio">Edificación Vertical</option>
                      <option value="Comercial">Complejo Comercial / Oficinas</option>
                      <option value="Industrial">Nave / Parque Industrial</option>
                      <option value="Ampliación">Ampliación / Remodelación</option>
                    </select>
                  </div>

                  <div className="client-form-group">
                    <label>Superficie Estimada (m²)</label>
                    <input
                      type="number"
                      className="client-input"
                      value={newRequestForm.areaM2}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, areaM2: e.target.value })}
                      placeholder="Ej. 450"
                    />
                  </div>
                </div>

                <div className="client-form-group">
                  <label>Ubicación / Predio *</label>
                  <input
                    type="text"
                    className="client-input"
                    value={newRequestForm.ubicacion}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, ubicacion: e.target.value })}
                    placeholder="Ej. Bosques de las Lomas, Lote 12"
                    required
                  />
                </div>

                <div className="client-form-row">
                  <div className="client-form-group">
                    <label>Presupuesto Estimado (USD)</label>
                    <input
                      type="number"
                      className="client-input"
                      value={newRequestForm.presupuestoEstimado}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, presupuestoEstimado: e.target.value })}
                      placeholder="Ej. 1200000"
                    />
                  </div>

                  <div className="client-form-group">
                    <label>Plazo Deseado</label>
                    <select
                      className="client-select"
                      value={newRequestForm.plazoDeseado}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, plazoDeseado: e.target.value })}
                    >
                      <option value="3 a 6 meses">3 a 6 meses</option>
                      <option value="6 a 12 meses">6 a 12 meses</option>
                      <option value="12 a 24 meses">12 a 24 meses</option>
                      <option value="A convenir">A convenir</option>
                    </select>
                  </div>
                </div>

                <div className="client-form-group">
                  <label>Descripción y Requerimientos</label>
                  <textarea
                    className="client-textarea"
                    rows={3}
                    value={newRequestForm.descripcion}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, descripcion: e.target.value })}
                    placeholder="Describa el alcance deseado..."
                  />
                </div>
              </div>

              <div className="client-modal-footer">
                <Button type="button" variant="outline" onClick={() => setIsNewRequestModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" icon={<Plus size={15} />}>
                  Registrar Solicitud
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DETALLE DE SOLICITUD
          ========================================================================= */}
      {selectedRequestDetail && (
        <div className="client-modal-overlay" onClick={() => setSelectedRequestDetail(null)}>
          <div className="client-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="client-modal-header">
              <div>
                <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontFamily: 'monospace' }}>
                  {selectedRequestDetail.numero || selectedRequestDetail.id}
                </span>
                <h3 style={{ margin: '2px 0 0 0' }}>{selectedRequestDetail.titulo}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequestDetail(null)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div className="client-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.84rem', marginBottom: '1rem' }}>
                <div><strong>Tipo:</strong> {selectedRequestDetail.tipo || 'Cotización de Obra'}</div>
                <div><strong>Superficie:</strong> {selectedRequestDetail.areaAproximada ? `${selectedRequestDetail.areaAproximada} m²` : 'N/A'}</div>
                <div><strong>Ubicación:</strong> {selectedRequestDetail.ubicacion}</div>
                <div><strong>Plazo:</strong> {selectedRequestDetail.plazoDeseado || 'A convenir'}</div>
                <div><strong>Presupuesto:</strong> {formatCurrency(selectedRequestDetail.presupuestoEstimado || 850000)}</div>
                <div><strong>Estado:</strong> {renderStatusBadge(selectedRequestDetail.estado)}</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <strong>Descripción:</strong> {selectedRequestDetail.descripcion || 'Sin descripción detallada.'}
              </div>
            </div>

            <div className="client-modal-footer">
              <Button
                variant="outline"
                icon={<MessageSquare size={14} />}
                onClick={() => {
                  setSelectedRequestDetail(null);
                  setActiveTab('mensajes');
                }}
              >
                Consultar en Soporte
              </Button>
              <Button
                variant="primary"
                icon={<Download size={14} />}
                onClick={() => {
                  handleOpenPDFPreview(buildQuotationRequestPDF, selectedRequestDetail, currentUser);
                }}
              >
                Exportar Propuesta PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SOLICITAR REUNIÓN
          ========================================================================= */}
      {isMeetingModalOpen && (
        <div className="client-modal-overlay" onClick={() => setIsMeetingModalOpen(false)}>
          <div className="client-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="client-modal-header">
              <h3>Solicitar Reunión Técnica</h3>
              <button
                type="button"
                onClick={() => setIsMeetingModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateMeeting}>
              <div className="client-modal-body">
                <div className="client-form-group">
                  <label>Motivo de la Reunión *</label>
                  <select
                    className="client-select"
                    value={newMeetingForm.motivo}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, motivo: e.target.value })}
                  >
                    <option value="Evaluación técnica inicial y viabilidad">Evaluación técnica inicial y viabilidad</option>
                    <option value="Revisión de presupuesto y cotización">Revisión de presupuesto y cotización</option>
                    <option value="Revisión de planos preliminares">Revisión de planos preliminares</option>
                    <option value="Visita técnica al predio de obra">Visita técnica al predio de obra</option>
                    <option value="Seguimiento de avance de obra">Seguimiento de avance de obra</option>
                  </select>
                </div>

                <div className="client-form-row">
                  <div className="client-form-group">
                    <label>Modalidad</label>
                    <select
                      className="client-select"
                      value={newMeetingForm.modalidad}
                      onChange={(e) => setNewMeetingForm({ ...newMeetingForm, modalidad: e.target.value })}
                    >
                      <option value="Virtual">Virtual (Videollamada Corporativa)</option>
                      <option value="Presencial">Presencial (Oficinas CONSTRUCTA)</option>
                      <option value="En Obra">En Obra / Predio</option>
                    </select>
                  </div>

                  <div className="client-form-group">
                    <label>Fecha Deseada</label>
                    <input
                      type="date"
                      className="client-input"
                      value={newMeetingForm.fechaDeseada}
                      onChange={(e) => setNewMeetingForm({ ...newMeetingForm, fechaDeseada: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="client-form-group">
                  <label>Hora Propuesta</label>
                  <input
                    type="time"
                    className="client-input"
                    value={newMeetingForm.horaDeseada}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, horaDeseada: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="client-modal-footer">
                <Button type="button" variant="outline" onClick={() => setIsMeetingModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" icon={<Calendar size={15} />}>
                  Confirmar Reunión
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SUBIR DOCUMENTO CON PREVIEW REAL
          ========================================================================= */}
      {isUploadDocModalOpen && (
        <div className="client-modal-overlay" onClick={() => setIsUploadDocModalOpen(false)}>
          <div className="client-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="client-modal-header">
              <h3>Compartir Archivo con CONSTRUCTA</h3>
              <button
                type="button"
                onClick={() => setIsUploadDocModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUploadDoc}>
              <div className="client-modal-body">
                <div className="client-form-group">
                  <label>Nombre del Documento *</label>
                  <input
                    type="text"
                    className="client-input"
                    value={uploadDocForm.nombre}
                    onChange={(e) => setUploadDocForm({ ...uploadDocForm, nombre: e.target.value })}
                    placeholder="Ej. Planos Arquitectónicos Terraza.pdf"
                    required
                  />
                </div>

                <div className="client-form-group">
                  <label>Tipo de Documento</label>
                  <select
                    className="client-select"
                    value={uploadDocForm.tipo}
                    onChange={(e) => setUploadDocForm({ ...uploadDocForm, tipo: e.target.value })}
                  >
                    <option value="Planos preliminares">Planos Arquitectónicos / Bocetos</option>
                    <option value="Escrituras o predial">Escritura o Documento de Propiedad</option>
                    <option value="Estudio de suelo">Estudio de Suelo / Geotecnia</option>
                    <option value="Fotografías de terreno">Fotografías del Predio</option>
                    <option value="Otro">Otro archivo técnico</option>
                  </select>
                </div>

                {/* Input de archivo real */}
                <div className="client-form-group">
                  <label>Seleccionar Archivo Local</label>
                  <input
                    type="file"
                    className="client-input"
                    onChange={handleFileChange}
                    accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg,.zip"
                  />
                </div>

                {/* Caja de preview del archivo seleccionado */}
                {uploadDocForm.archivoSeleccionado && (
                  <div
                    style={{
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <Paperclip size={20} color="#f59e0b" />
                    <div>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.84rem', display: 'block' }}>
                        {uploadDocForm.archivoSeleccionado.name}
                      </strong>
                      <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>
                        {uploadDocForm.archivoSeleccionado.size} • Listo para enviar
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="client-modal-footer">
                <Button type="button" variant="outline" onClick={() => setIsUploadDocModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" icon={<Upload size={15} />}>
                  Cargar y Vincular al Expediente
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: NUEVA CONVERSACIÓN EN MESA DE AYUDA
          ========================================================================= */}
      {isNewConvModalOpen && (
        <div className="client-modal-overlay" onClick={() => setIsNewConvModalOpen(false)}>
          <div className="client-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="client-modal-header">
              <h3>Iniciar Nueva Consulta en Mesa de Ayuda</h3>
              <button
                type="button"
                onClick={() => setIsNewConvModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewConversation}>
              <div className="client-modal-body">
                <div className="client-form-group">
                  <label>Asunto o Tema de la Consulta *</label>
                  <input
                    type="text"
                    className="client-input"
                    value={newConvForm.asunto}
                    onChange={(e) => setNewConvForm({ ...newConvForm, asunto: e.target.value })}
                    placeholder="Ej. Consulta sobre fecha de colado de losa"
                    required
                  />
                </div>

                <div className="client-form-group">
                  <label>Proyecto Relacionado</label>
                  <select
                    className="client-select"
                    value={newConvForm.proyectoId}
                    onChange={(e) => setNewConvForm({ ...newConvForm, proyectoId: e.target.value })}
                  >
                    <option value="">Consulta General / Sin Proyecto Específico</option>
                    {myProjects.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div className="client-form-group">
                  <label>Mensaje Inicial *</label>
                  <textarea
                    className="client-textarea"
                    rows={4}
                    value={newConvForm.mensajeInicial}
                    onChange={(e) => setNewConvForm({ ...newConvForm, mensajeInicial: e.target.value })}
                    placeholder="Describa su duda técnica o administrativa..."
                    required
                  />
                </div>
              </div>

              <div className="client-modal-footer">
                <Button type="button" variant="outline" onClick={() => setIsNewConvModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" icon={<Send size={15} />}>
                  Iniciar Conversación
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VISTA PREVIA Y DESCARGA REAL DE DOCUMENTOS PDF
          ========================================================================= */}
      <PDFPreviewModal
        isOpen={pdfModalState.isOpen}
        onClose={() => setPdfModalState({ isOpen: false, pdfResult: null })}
        pdfResult={pdfModalState.pdfResult}
        onDownloaded={(filename) => {
          showAlert(`Documento ${filename} descargado correctamente.`, 'exito');
        }}
      />

      <ToastContainer />
    </div>
  );
};

export default ClientPortal;
