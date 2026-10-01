import React, { useState, useMemo } from 'react';
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
  Image as ImageIcon
} from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import Button from '../../components/common/Button.jsx';
import ToastContainer from '../../components/common/ToastContainer.jsx';

export const ClientPortal = ({ onNavigate }) => {
  const {
    currentUser,
    logout,
    projects,
    clientRequests,
    clientMeetings,
    clientMessages,
    saveClientRequest,
    updateClientRequest,
    saveClientMeeting,
    sendClientMessage,
    updateClientProfile,
    formatCurrency,
    formatDate,
    showAlert,
    requestConfirm
  } = useConstructa();

  const navigate = onNavigate || ((view) => { window.location.hash = view; });

  // Pestaña activa
  const [activeTab, setActiveTab] = useState('inicio');

  // Filtro de solicitudes
  const [requestFilter, setRequestFilter] = useState('Todas');

  // Modales
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);

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

  // Formulario de Nuevo Mensaje de Soporte
  const [newMessageText, setNewMessageText] = useState('');
  const [messageProject, setMessageProject] = useState('');

  // Formulario de subida de documento
  const [uploadDocForm, setUploadDocForm] = useState({
    nombre: '',
    tipo: 'Planos preliminares',
    tamano: '2.4 MB',
    proyectoId: '',
  });

  // Datos filtrados para el cliente autenticado
  const clientEmail = currentUser?.email || 'cliente@constructa.com';

  const myRequests = useMemo(() => {
    return (clientRequests || []).filter(
      (r) => r.clienteEmail?.toLowerCase() === clientEmail.toLowerCase()
    );
  }, [clientRequests, clientEmail]);

  const filteredRequests = useMemo(() => {
    if (requestFilter === 'Todas') return myRequests;
    return myRequests.filter((r) => r.estado === requestFilter);
  }, [myRequests, requestFilter]);

  const myMeetings = useMemo(() => {
    return (clientMeetings || []).filter(
      (m) => m.clienteEmail?.toLowerCase() === clientEmail.toLowerCase()
    );
  }, [clientMeetings, clientEmail]);

  const myMessages = useMemo(() => {
    return (clientMessages || []).filter(
      (m) => m.clienteEmail?.toLowerCase() === clientEmail.toLowerCase()
    );
  }, [clientMessages, clientEmail]);

  // Proyectos vinculados al cliente (por ID o por relación)
  const myProjects = useMemo(() => {
    const directLinked = (currentUser?.proyectosAsociados || []);
    return (projects || []).filter(
      (p) => directLinked.includes(p.id) || p.id === 'PRJ-001'
    );
  }, [projects, currentUser]);

  const primaryProject = myProjects[0] || null;

  // Próxima reunión
  const nextMeeting = useMemo(() => {
    return myMeetings.find((m) => m.estado === 'Confirmada') || myMeetings[0] || null;
  }, [myMeetings]);

  // Manejador de Cierre de Sesión con confirmación
  const handleLogout = () => {
    requestConfirm({
      title: 'Cerrar sesión del Portal',
      message: '¿Está seguro de que desea salir del Portal de Clientes?',
      confirmText: 'Cerrar sesión',
      cancelText: 'Cancelar',
      isDestructive: true,
      onConfirm: () => {
        logout();
        navigate('login');
      },
    });
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
      responsable: 'Administración y Coordinación Comercial',
      rolResponsable: 'Administrador',
    });

    if (res.ok) {
      setIsMeetingModalOpen(false);
      setActiveTab('reuniones');
    }
  };

  // Enviar Mensaje a Soporte
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    sendClientMessage({
      clienteId: currentUser?.id || 'CLI-001',
      clienteNombre: currentUser?.nombre || 'Cliente',
      clienteEmail: clientEmail,
      proyectoId: messageProject || primaryProject?.id || 'General',
      asunto: messageProject ? `Consulta sobre ${primaryProject?.nombre || 'obra'}` : 'Consulta de asesoría general',
      mensaje: newMessageText.trim(),
      emisor: 'cliente',
    });

    setNewMessageText('');
  };

  // Subir Documento Simulado
  const handleUploadDoc = (e) => {
    e.preventDefault();
    if (!uploadDocForm.nombre.trim()) {
      showAlert('Indique el nombre o descripción del documento.', 'error');
      return;
    }

    showAlert(`Documento "${uploadDocForm.nombre}" cargado exitosamente. Se ha notificado al equipo técnico.`, 'exito');
    setIsUploadDocModalOpen(false);
    setUploadDocForm({
      nombre: '',
      tipo: 'Planos preliminares',
      tamano: '2.4 MB',
      proyectoId: '',
    });
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
          <div className="client-brand" onClick={() => setActiveTab('inicio')}>
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
                <span className="hide-mobile">Salir</span>
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
            {myMessages.length > 0 && (
              <span className="client-nav-badge">{myMessages.length}</span>
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
                  Desde este portal puede dar seguimiento puntual al avance físico de su obra, revisar propuestas comerciales, agendar reuniones técnicas con la constructora y consultar documentación autorizada.
                </p>
              </div>
              <div className="client-hero-cta">
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  onClick={() => setIsNewRequestModalOpen(true)}
                >
                  Solicitar Cotización de Obra
                </Button>
                <Button
                  variant="outline"
                  icon={<Calendar size={16} />}
                  onClick={() => setIsMeetingModalOpen(true)}
                >
                  Agendar Reunión
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
                  {primaryProject ? `${primaryProject.nombre} (${primaryProject.progreso || 45}%)` : 'Sin proyectos activos'}
                </span>
              </div>

              <div className="client-stat-card">
                <div className="client-stat-header">
                  <span className="client-stat-label">Solicitudes Registradas</span>
                  <div className="client-stat-icon emerald">
                    <FileText size={18} />
                  </div>
                </div>
                <span className="client-stat-value">{myRequests.length}</span>
                <span className="client-stat-sub">
                  {myRequests.filter((r) => r.estado !== 'Aprobada').length} en proceso de revisión
                </span>
              </div>

              <div className="client-stat-card">
                <div className="client-stat-header">
                  <span className="client-stat-label">Próxima Actividad</span>
                  <div className="client-stat-icon blue">
                    <Calendar size={18} />
                  </div>
                </div>
                <span className="client-stat-value" style={{ fontSize: '1.2rem', whiteSpace: 'nowrap' }}>
                  {nextMeeting ? `${nextMeeting.fecha} ${nextMeeting.hora}` : 'Sin reuniones'}
                </span>
                <span className="client-stat-sub">
                  {nextMeeting ? `${nextMeeting.motivo} (${nextMeeting.modalidad})` : 'Puede agendar cuando guste'}
                </span>
              </div>

              <div className="client-stat-card">
                <div className="client-stat-header">
                  <span className="client-stat-label">Documentos Autorizados</span>
                  <div className="client-stat-icon purple">
                    <FolderOpen size={18} />
                  </div>
                </div>
                <span className="client-stat-value">6</span>
                <span className="client-stat-sub">Contratos, planos y reportes</span>
              </div>
            </div>

            {/* Proyecto Activo en Detalle */}
            {primaryProject && (
              <div className="client-project-hero">
                <div className="client-project-header">
                  <div className="client-project-title-group">
                    <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Proyecto Principal Asociado
                    </span>
                    <h2>{primaryProject.nombre}</h2>
                    <div className="client-project-meta">
                      <span className="client-project-meta-item">
                        <MapPin size={14} color="#f59e0b" /> {primaryProject.ubicacion || 'San Pedro Garza García, N.L.'}
                      </span>
                      <span className="client-project-meta-item">
                        <Briefcase size={14} color="#f59e0b" /> Responsable: {primaryProject.director || 'Ing. Carlos Mendoza (Gerente)'}
                      </span>
                      <span className="client-project-meta-item">
                        <Clock size={14} color="#f59e0b" /> Entrega prevista: {primaryProject.fechaFin || '15 Dic 2026'}
                      </span>
                    </div>
                  </div>

                  <div>
                    {renderStatusBadge(primaryProject.estado || 'En Construcción')}
                  </div>
                </div>

                {/* Barra de Progreso */}
                <div className="client-progress-container">
                  <div className="client-progress-bar-bg">
                    <div
                      className="client-progress-bar-fill"
                      style={{ width: `${primaryProject.progreso || 45}%` }}
                    />
                  </div>
                  <div className="client-progress-labels">
                    <span>Avance Físico Certificado</span>
                    <strong style={{ color: '#ffffff' }}>{primaryProject.progreso || 45}% completado</strong>
                  </div>
                </div>

                {/* Hitos del Proyecto */}
                <div className="client-milestones-track">
                  <div className="client-milestone-step">
                    <div className="client-milestone-indicator completed">✓</div>
                    <div className="client-milestone-info">
                      <span className="client-milestone-name">Cimentación y Muros</span>
                      <span className="client-milestone-status">Completado 100%</span>
                    </div>
                  </div>

                  <div className="client-milestone-step">
                    <div className="client-milestone-indicator current">2</div>
                    <div className="client-milestone-info">
                      <span className="client-milestone-name">Estructura Metálica</span>
                      <span className="client-milestone-status">En proceso (65%)</span>
                    </div>
                  </div>

                  <div className="client-milestone-step">
                    <div className="client-milestone-indicator">3</div>
                    <div className="client-milestone-info">
                      <span className="client-milestone-name">Instalaciones MEP</span>
                      <span className="client-milestone-status">Programado</span>
                    </div>
                  </div>

                  <div className="client-milestone-step">
                    <div className="client-milestone-indicator">4</div>
                    <div className="client-milestone-info">
                      <span className="client-milestone-name">Acabados & Fachada</span>
                      <span className="client-milestone-status">Programado</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Listado de Últimas Solicitudes */}
            <div className="client-card-panel">
              <div className="client-card-panel-header">
                <div className="client-card-panel-title">
                  <FileText size={18} color="#f59e0b" />
                  <span>Mis Solicitudes Recientes</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('mis-solicitudes')}
                >
                  Ver Todas &rarr;
                </Button>
              </div>

              {myRequests.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No tiene solicitudes registradas actualmente.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="client-table">
                    <thead>
                      <tr>
                        <th>Código / Título</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Estado Actual</th>
                        <th>Responsable Asignado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRequests.slice(0, 3).map((req) => (
                        <tr key={req.id}>
                          <td>
                            <strong style={{ color: '#ffffff', display: 'block' }}>{req.titulo}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{req.id}</span>
                          </td>
                          <td>{req.tipoProyecto}</td>
                          <td>{req.fecha}</td>
                          <td>{renderStatusBadge(req.estado)}</td>
                          <td>{req.responsable || 'En asignación'}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => setSelectedRequestDetail(req)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Eye size={13} /> Consultar
                            </button>
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

        {/* ===================== TAB 2: MIS SOLICITUDES ===================== */}
        {activeTab === 'mis-solicitudes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Mis Solicitudes y Cotizaciones
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                  Gestione sus peticiones de obra, anteproyectos y cotizaciones formales con trazabilidad completa.
                </p>
              </div>

              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => setIsNewRequestModalOpen(true)}
              >
                Nueva Solicitud de Construcción
              </Button>
            </div>

            {/* Filtros de Estado */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
              {['Todas', 'Recibida', 'En revisión', 'En evaluación', 'Propuesta preparada', 'Aprobada'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setRequestFilter(f)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    background: requestFilter === f ? '#f59e0b' : 'rgba(255, 255, 255, 0.05)',
                    color: requestFilter === f ? '#000' : '#cbd5e1',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Panel de Solicitudes */}
            <div className="client-card-panel">
              {filteredRequests.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                  <FileText size={36} color="#f59e0b" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    No hay solicitudes con el filtro seleccionado
                  </p>
                  <p style={{ fontSize: '0.84rem', margin: '6px 0 1.25rem' }}>
                    Puede iniciar una nueva solicitud de construcción o cotización cuando lo desee.
                  </p>
                  <Button variant="primary" size="sm" onClick={() => setIsNewRequestModalOpen(true)}>
                    Crear Solicitud
                  </Button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="client-table">
                    <thead>
                      <tr>
                        <th>Folio / Proyecto</th>
                        <th>Tipo & Área</th>
                        <th>Ubicación</th>
                        <th>Fecha de Ingreso</th>
                        <th>Estado Actual</th>
                        <th>Responsable Asignado</th>
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
                            <div>{req.tipoProyecto}</div>
                            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{req.areaM2 ? `${req.areaM2} m²` : 'Por definir'}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                              <MapPin size={13} color="#94a3b8" /> {req.ubicacion}
                            </div>
                          </td>
                          <td>{req.fecha}</td>
                          <td>{renderStatusBadge(req.estado)}</td>
                          <td>
                            <span style={{ fontSize: '0.82rem', color: req.responsable ? '#ffffff' : '#94a3b8' }}>
                              {req.responsable || 'Pendiente de asignación'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => setSelectedRequestDetail(req)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Eye size={13} /> Ver Detalle
                            </button>
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
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Proyectos Asociados y Seguimiento de Obra
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                Consulte el estado físico, responsables, hitos constructivos y fotografías autorizadas de sus obras activas.
              </p>
            </div>

            {myProjects.length === 0 ? (
              <div className="client-card-panel" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <Building size={36} color="#f59e0b" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <h3 style={{ color: '#ffffff', margin: '0 0 0.5rem' }}>Aún no cuenta con un contrato de obra activo</h3>
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
                      <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, fontFamily: 'monospace' }}>
                        CÓDIGO: {proj.id}
                      </span>
                      <h3 style={{ fontSize: '1.4rem', color: '#ffffff', margin: '2px 0 6px' }}>
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

                    <div>
                      {renderStatusBadge(proj.estado)}
                    </div>
                  </div>

                  {/* Barra de Avance */}
                  <div className="client-progress-container">
                    <div className="client-progress-bar-bg">
                      <div
                        className="client-progress-bar-fill"
                        style={{ width: `${proj.progreso || 50}%` }}
                      />
                    </div>
                    <div className="client-progress-labels">
                      <span>Certificación de avance físico</span>
                      <strong style={{ color: '#ffffff' }}>{proj.progreso || 50}%</strong>
                    </div>
                  </div>

                  {/* Hitos */}
                  <div className="client-milestones-track">
                    <div className="client-milestone-step">
                      <div className="client-milestone-indicator completed">✓</div>
                      <div className="client-milestone-info">
                        <span className="client-milestone-name">Fase 1: Preliminares y Terracerías</span>
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
                        <span className="client-milestone-status">En ejecución activa</span>
                      </div>
                    </div>

                    <div className="client-milestone-step">
                      <div className="client-milestone-indicator">4</div>
                      <div className="client-milestone-info">
                        <span className="client-milestone-name">Fase 4: Acabados y Equipamiento</span>
                        <span className="client-milestone-status">Próxima fase</span>
                      </div>
                    </div>
                  </div>

                  {/* Galería de Fotografías de Avance Autorizadas */}
                  <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ImageIcon size={16} color="#f59e0b" /> Registro Fotográfico Autorizado de Obra
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#000' }}>
                        <img
                          src="https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80"
                          alt="Avance de obra"
                          style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                        />
                        <div style={{ padding: '6px 10px', fontSize: '0.72rem', color: '#94a3b8' }}>
                          Colado de losa Nivel 4
                        </div>
                      </div>

                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#000' }}>
                        <img
                          src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80"
                          alt="Avance estructural"
                          style={{ width: '100%', height: '120px', objectFit: 'cover' }}
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
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Reuniones y Coordinación Técnica
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                  Sesiones de trabajo con el Administrador y la Gerencia de Construcción (Virtuales o en Obra).
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
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <Calendar size={36} color="#f59e0b" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <p style={{ color: '#ffffff', fontWeight: 700, margin: 0 }}>No tiene reuniones agendadas</p>
                  <p style={{ fontSize: '0.84rem', margin: '6px 0 1.25rem' }}>
                    Puede programar una sesión con el equipo técnico para resolver dudas o revisar avances.
                  </p>
                  <Button variant="primary" size="sm" onClick={() => setIsMeetingModalOpen(true)}>
                    Agendar Reunión
                  </Button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="client-table">
                    <thead>
                      <tr>
                        <th>Folio / Motivo</th>
                        <th>Proyecto</th>
                        <th>Modalidad</th>
                        <th>Fecha y Hora</th>
                        <th>Responsable Asignado</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myMeetings.map((m) => (
                        <tr key={m.id}>
                          <td>
                            <strong style={{ color: '#ffffff', display: 'block' }}>{m.motivo}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{m.id}</span>
                          </td>
                          <td>{m.proyectoRelacionado || 'Consulta inicial'}</td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                              {m.modalidad === 'Virtual' ? <Video size={13} color="#60a5fa" /> : <MapPin size={13} color="#f59e0b" />}
                              {m.modalidad}
                            </span>
                          </td>
                          <td>
                            <strong>{m.fecha}</strong> a las {m.hora} hrs
                          </td>
                          <td>
                            <span style={{ color: '#ffffff' }}>{m.responsable || 'Administración'}</span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>
                              {m.rolResponsable || 'Gerente de Construcción'}
                            </span>
                          </td>
                          <td>{renderStatusBadge(m.estado)}</td>
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
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Expediente Digital del Proyecto
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                  Consulte la documentación autorizada por CONSTRUCTA y comparta planos o escrituras técnicas.
                </p>
              </div>

              <Button
                variant="primary"
                icon={<Upload size={16} />}
                onClick={() => setIsUploadDocModalOpen(true)}
              >
                Compartir Nuevo Documento
              </Button>
            </div>

            {/* Subsección 1: Documentos compartidos por la Constructora */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                      <p>Contrato marco firmado y legalizado con póliza de fianza de vicios ocultos.</p>
                    </div>
                  </div>
                  <div className="doc-card-bottom">
                    <span>PDF • 4.8 MB</span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => showAlert('Descargando copia legal autorizada...', 'info')}
                    >
                      <Download size={13} /> Descargar
                    </button>
                  </div>
                </div>

                <div className="doc-card">
                  <div className="doc-card-top">
                    <div className="doc-icon-box">
                      <Layers size={22} />
                    </div>
                    <div className="doc-details">
                      <h4>Planos Arquitectónicos Autorizados (Aprobados)</h4>
                      <p>Juego de planos con sello de peritaje y licencia de construcción municipal.</p>
                    </div>
                  </div>
                  <div className="doc-card-bottom">
                    <span>PDF/DWG • 18.2 MB</span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => showAlert('Descargando juego de planos ejecutivos...', 'info')}
                    >
                      <Download size={13} /> Descargar
                    </button>
                  </div>
                </div>

                <div className="doc-card">
                  <div className="doc-card-top">
                    <div className="doc-icon-box">
                      <DollarSign size={22} />
                    </div>
                    <div className="doc-details">
                      <h4>Catálogo de Conceptos y Presupuesto Base</h4>
                      <p>Desglose por partidas autorizado con precios unitarios de contrato.</p>
                    </div>
                  </div>
                  <div className="doc-card-bottom">
                    <span>XLSX/PDF • 2.1 MB</span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => showAlert('Descargando catálogo contractual...', 'info')}
                    >
                      <Download size={13} /> Descargar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Subsección 2: Documentos enviados por el Cliente */}
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Upload size={18} color="#f59e0b" /> Documentos y Archivos Aportados por el Cliente
              </h3>
              <div className="doc-grid">
                <div className="doc-card">
                  <div className="doc-card-top">
                    <div className="doc-icon-box" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' }}>
                      <FileText size={22} />
                    </div>
                    <div className="doc-details">
                      <h4>Escritura del Predio y Predial al Corriente</h4>
                      <p>Copia de acreditación legal de propiedad para trámite de licencia.</p>
                    </div>
                  </div>
                  <div className="doc-card-bottom">
                    <span>PDF • 3.2 MB (Enviado)</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Validado</span>
                  </div>
                </div>

                <div className="doc-card">
                  <div className="doc-card-top">
                    <div className="doc-icon-box" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' }}>
                      <FileText size={22} />
                    </div>
                    <div className="doc-details">
                      <h4>Mecánica de Suelos Preliminar</h4>
                      <p>Estudio geotécnico de resistividad y capacidad de carga del terreno.</p>
                    </div>
                  </div>
                  <div className="doc-card-bottom">
                    <span>PDF • 6.4 MB (Enviado)</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>En análisis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 6: FINANZAS & PAGOS ===================== */}
        {activeTab === 'pagos' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Control Financiero y Calendario de Pagos de Obra
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                Transparencia sobre el presupuesto contratado, anticipos amortizados y próximos hitos financieros.
              </p>
            </div>

            {/* Resumen Financiero */}
            <div className="client-financial-summary">
              <div className="client-fin-card total">
                <div className="client-fin-card-label">Presupuesto Contratado</div>
                <div className="client-fin-card-amount">
                  {formatCurrency(primaryProject?.presupuestoTotal || 18500000)}
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Monto total bajo contrato formal</span>
              </div>

              <div className="client-fin-card paid">
                <div className="client-fin-card-label">Pagos Realizados y Certificados</div>
                <div className="client-fin-card-amount" style={{ color: '#10b981' }}>
                  {formatCurrency(8325000)}
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>45% del contrato liquidado</span>
              </div>

              <div className="client-fin-card balance">
                <div className="client-fin-card-label">Saldo por Amortizar</div>
                <div className="client-fin-card-amount" style={{ color: '#f59e0b' }}>
                  {formatCurrency(10175000)}
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Sujeto al cumplimiento de hitos</span>
              </div>
            </div>

            {/* Calendario de Hitos de Pago */}
            <div className="client-card-panel">
              <div className="client-card-panel-header">
                <div className="client-card-panel-title">
                  <DollarSign size={18} color="#f59e0b" />
                  <span>Calendario de Pagos Contractuales</span>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="client-table">
                  <thead>
                    <tr>
                      <th>Hito Contractual</th>
                      <th>Porcentaje</th>
                      <th>Monto Estimado</th>
                      <th>Fecha Programada</th>
                      <th>Estado</th>
                      <th>Comprobante</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Anticipo y Firma de Contrato</strong>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Inicio de obra y acopio de materiales</span>
                      </td>
                      <td>20%</td>
                      <td>{formatCurrency(3700000)}</td>
                      <td>15 Ene 2026</td>
                      <td><span className="status-pill aprobada">Pagado</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => showAlert('Descargando factura CFDI timbrada...', 'info')}
                        >
                          <Download size={13} /> Recibo CFDI
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <strong>Hito 1: Conclusión de Cimentación</strong>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Zapatas, muros de contención y losa de desplante</span>
                      </td>
                      <td>25%</td>
                      <td>{formatCurrency(4625000)}</td>
                      <td>10 Abr 2026</td>
                      <td><span className="status-pill aprobada">Pagado</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => showAlert('Descargando factura CFDI timbrada...', 'info')}
                        >
                          <Download size={13} /> Recibo CFDI
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <strong>Hito 2: Estructura y Albañilería</strong>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Montaje de acero, losas y muros perimetrales</span>
                      </td>
                      <td>25%</td>
                      <td>{formatCurrency(4625000)}</td>
                      <td>15 Ago 2026</td>
                      <td><span className="status-pill en-revision">Próximo Vencimiento</span></td>
                      <td>
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Pendiente de emisión</span>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <strong>Hito 3: Instalaciones y Acabados</strong>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>MEP, carpintería, cancelería y pintura</span>
                      </td>
                      <td>20%</td>
                      <td>{formatCurrency(3700000)}</td>
                      <td>15 Oct 2026</td>
                      <td><span className="status-pill">Programado</span></td>
                      <td>
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Programado</span>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <strong>Entrega Final y Acta Finiquito</strong>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Recepción de obra y entrega de pólizas de garantía</span>
                      </td>
                      <td>10%</td>
                      <td>{formatCurrency(1850000)}</td>
                      <td>15 Dic 2026</td>
                      <td><span className="status-pill">Programado</span></td>
                      <td>
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Programado</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '10px', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <strong>Nota de Transparencia Administrativa:</strong> Los pagos y facturación son coordinados exclusivamente por la Dirección y Administración de CONSTRUCTA conforme a los avances físicos avalados por la supervisión de obra.
            </div>
          </div>
        )}

        {/* ===================== TAB 7: MESA DE AYUDA (SOPORTE) ===================== */}
        {activeTab === 'mensajes' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Mesa de Ayuda y Soporte del Proyecto
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                Canal directo de comunicación oficial con la Administración y la Gerencia de Construcción.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
              {/* Formulario de Nuevo Mensaje */}
              <div className="client-card-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} color="#f59e0b" /> Redactar Consulta al Equipo
                </h3>

                <form onSubmit={handleSendMessage}>
                  <div className="client-form-group" style={{ marginBottom: '1rem' }}>
                    <label>Proyecto Relacionado</label>
                    <select
                      className="client-select"
                      value={messageProject}
                      onChange={(e) => setMessageProject(e.target.value)}
                    >
                      <option value="">General / Asesoría Comercial</option>
                      {myProjects.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre} ({p.id})</option>
                      ))}
                    </select>
                  </div>

                  <div className="client-form-group" style={{ marginBottom: '1.25rem' }}>
                    <label>Mensaje o Requerimiento</label>
                    <textarea
                      className="client-textarea"
                      rows={5}
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      placeholder="Describa su duda sobre el avance, solicitud de reunión técnica o consulta de planos..."
                    />
                  </div>

                  <Button type="submit" variant="primary" icon={<Send size={15} />}>
                    Enviar Mensaje Oficial
                  </Button>
                </form>
              </div>

              {/* Historial de Mensajes */}
              <div className="client-card-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} color="#f59e0b" /> Historial de Comunicaciones
                </h3>

                {myMessages.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '0.84rem' }}>
                    No tiene mensajes previos en el buzón.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
                    {myMessages.map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          background: msg.emisor === 'cliente' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '0.85rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '0.82rem', color: msg.emisor === 'cliente' ? '#f59e0b' : '#38bdf8' }}>
                            {msg.emisor === 'cliente' ? 'Usted (Cliente)' : 'CONSTRUCTA (Equipo de Soporte)'}
                          </strong>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{msg.fecha}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#e2e8f0', margin: 0, lineHeight: 1.4 }}>
                          {msg.mensaje}
                        </p>
                      </div>
                    ))}
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
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Perfil del Cliente
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                Datos de contacto oficiales registrados para emisión de cotizaciones y avisos de obra.
              </p>
            </div>

            <div className="client-card-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
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
                  <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: 0 }}>
                    {currentUser?.nombre || 'Lic. Roberto Garza'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.76rem', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> {currentUser?.estadoVerificacion || 'Cuenta Verificada'}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                      ID: {currentUser?.id || 'CLI-001'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Correo Electrónico (No modificable)
                  </label>
                  <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
                    {currentUser?.email || 'cliente@constructa.com'}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Rol en Plataforma
                  </label>
                  <div style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 700 }}>
                    Cliente Externo
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Teléfono Registrado
                  </label>
                  <div style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                    {currentUser?.telefono || '+52 81 8320 0000'}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Ciudad de Residencia
                  </label>
                  <div style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                    {currentUser?.ciudad || 'Monterrey, N.L.'}
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Button
                  variant="outline"
                  onClick={() => showAlert('Para actualizar datos fiscales o correo, favor de coordinar con Administración de CONSTRUCTA.', 'info')}
                >
                  Solicitar Actualización de Datos Fiscales
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          4. MODAL: NUEVA SOLICITUD DE CONSTRUCCIÓN / COTIZACIÓN
          ========================================================================= */}
      {isNewRequestModalOpen && (
        <div className="client-modal-overlay" onClick={() => setIsNewRequestModalOpen(false)}>
          <div className="client-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="client-modal-header">
              <h3>Solicitar Proyecto de Construcción / Cotización</h3>
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
                  <label>Título o Nombre de la Solicitud *</label>
                  <input
                    type="text"
                    className="client-input"
                    value={newRequestForm.titulo}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, titulo: e.target.value })}
                    placeholder="Ej. Construcción de Residencia Familiar / Nave Comercial"
                    required
                  />
                </div>

                <div className="client-form-row">
                  <div className="client-form-group">
                    <label>Tipo de Proyecto</label>
                    <select
                      className="client-select"
                      value={newRequestForm.tipoProyecto}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, tipoProyecto: e.target.value })}
                    >
                      <option value="Vivienda">Vivienda Residencial</option>
                      <option value="Edificio">Edificio Multifamiliar / Departamentos</option>
                      <option value="Local comercial">Local Comercial</option>
                      <option value="Tienda">Tienda / Retail</option>
                      <option value="Remodelación">Remodelación / Adecuación</option>
                      <option value="Infraestructura">Infraestructura</option>
                      <option value="Obra civil">Obra Civil / Nave Industrial</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="client-form-group">
                    <label>Área Aproximada Estimada (m²)</label>
                    <input
                      type="number"
                      className="client-input"
                      value={newRequestForm.areaM2}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, areaM2: e.target.value })}
                      placeholder="Ej. 450"
                    />
                  </div>
                </div>

                <div className="client-form-row">
                  <div className="client-form-group">
                    <label>Ubicación / Predio *</label>
                    <input
                      type="text"
                      className="client-input"
                      value={newRequestForm.ubicacion}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, ubicacion: e.target.value })}
                      placeholder="Ej. Carretera Nacional Km 250, Monterrey"
                      required
                    />
                  </div>

                  <div className="client-form-group">
                    <label>Presupuesto Estimado (Opcional)</label>
                    <input
                      type="text"
                      className="client-input"
                      value={newRequestForm.presupuestoEstimado}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, presupuestoEstimado: e.target.value })}
                      placeholder="Ej. $6,500,000 MXN"
                    />
                  </div>
                </div>

                <div className="client-form-row">
                  <div className="client-form-group">
                    <label>¿Cuenta con Terreno Propio?</label>
                    <select
                      className="client-select"
                      value={newRequestForm.poseeTerreno}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, poseeTerreno: e.target.value })}
                    >
                      <option value="Sí, escriturado">Sí, escriturado a mi nombre</option>
                      <option value="En proceso de compra">En proceso de adquisición</option>
                      <option value="No, requiero asesoría de predio">No, requiero asesoría de ubicación</option>
                    </select>
                  </div>

                  <div className="client-form-group">
                    <label>¿Dispone de Planos Arquitectónicos?</label>
                    <select
                      className="client-select"
                      value={newRequestForm.poseePlanos}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, poseePlanos: e.target.value })}
                    >
                      <option value="No, requiere anteproyecto">No, requiere anteproyecto completo</option>
                      <option value="Sí, planos preliminares">Sí, planos preliminares listos</option>
                      <option value="Sí, proyecto ejecutivo completo">Sí, proyecto ejecutivo validado</option>
                    </select>
                  </div>
                </div>

                <div className="client-form-group">
                  <label>Descripción de Necesidades Principales *</label>
                  <textarea
                    className="client-textarea"
                    rows={4}
                    value={newRequestForm.descripcion}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, descripcion: e.target.value })}
                    placeholder="Detalle el número de niveles, acabados deseados, requerimientos especiales o fechas tentativas de inicio..."
                    required
                  />
                </div>

                {/* Subida simulada de archivos */}
                <div className="client-dropzone" onClick={() => showAlert('Puede adjuntar archivos técnicos en formato PDF, DWG, PNG o ZIP.', 'info')}>
                  <Upload size={24} color="#f59e0b" style={{ margin: '0 auto 6px' }} />
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#ffffff', fontWeight: 600 }}>
                    Arrastre planos preliminares o fotografías del terreno
                  </p>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Formatos autorizados: PDF, DWG, PNG, JPG (Máx. 25MB)
                  </span>
                </div>
              </div>

              <div className="client-modal-footer">
                <Button type="button" variant="outline" onClick={() => setIsNewRequestModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" icon={<ArrowRight size={15} />}>
                  Enviar Solicitud a la Constructora
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. MODAL: DETALLE Y LÍNEA DE TIEMPO DE SOLICITUD
          ========================================================================= */}
      {selectedRequestDetail && (
        <div className="client-modal-overlay" onClick={() => setSelectedRequestDetail(null)}>
          <div className="client-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="client-modal-header">
              <div>
                <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontFamily: 'monospace' }}>
                  {selectedRequestDetail.id}
                </span>
                <h3 style={{ margin: '2px 0 0' }}>{selectedRequestDetail.titulo}</h3>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Estado de la Solicitud</span>
                  <div style={{ marginTop: '3px' }}>{renderStatusBadge(selectedRequestDetail.estado)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Responsable</span>
                  <div style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 600 }}>
                    {selectedRequestDetail.responsable || 'Administración CONSTRUCTA'}
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.86rem', color: '#ffffff', marginBottom: '4px' }}>Descripción del Proyecto</h4>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                  {selectedRequestDetail.descripcion}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div><strong>Tipo:</strong> {selectedRequestDetail.tipoProyecto}</div>
                <div><strong>Área:</strong> {selectedRequestDetail.areaM2 ? `${selectedRequestDetail.areaM2} m²` : 'N/A'}</div>
                <div><strong>Ubicación:</strong> {selectedRequestDetail.ubicacion}</div>
                <div><strong>Plazo Deseado:</strong> {selectedRequestDetail.plazoDeseado || '6 a 12 meses'}</div>
              </div>

              {/* Trazabilidad / Historial de la Solicitud */}
              <div style={{ marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.86rem', color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} color="#f59e0b" /> Historial de Trazabilidad
                </h4>
                <div className="client-timeline">
                  {(selectedRequestDetail.historial || [
                    { fecha: selectedRequestDetail.fecha, estado: 'Solicitud Recibida', detalle: 'El cliente registró la solicitud en el portal.' },
                    { fecha: 'En proceso', estado: 'En revisión técnica', detalle: 'La Administración asignó la viabilidad a la Gerencia de Construcción.' }
                  ]).map((h, i) => (
                    <div key={i} className="client-timeline-item">
                      <div className="client-timeline-date">{h.fecha}</div>
                      <div className="client-timeline-title">{h.estado}</div>
                      <div className="client-timeline-desc">{h.detalle}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="client-modal-footer">
              <Button variant="primary" onClick={() => setSelectedRequestDetail(null)}>
                Cerrar Detalle
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODAL: SOLICITAR REUNIÓN
          ========================================================================= */}
      {isMeetingModalOpen && (
        <div className="client-modal-overlay" onClick={() => setIsMeetingModalOpen(false)}>
          <div className="client-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="client-modal-header">
              <h3>Solicitar Reunión con CONSTRUCTA</h3>
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
                    <option value="Visita técnica al predio / terreno">Visita técnica al predio / terreno</option>
                    <option value="Seguimiento de avance de obra">Seguimiento de avance de obra</option>
                    <option value="Revisión contractual">Revisión contractual y finanzas</option>
                  </select>
                </div>

                <div className="client-form-group">
                  <label>Proyecto Relacionado</label>
                  <select
                    className="client-select"
                    value={newMeetingForm.proyectoRelacionado}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, proyectoRelacionado: e.target.value })}
                  >
                    <option value="">Nueva Solicitud / Sin Proyecto Aún</option>
                    {myProjects.map((p) => (
                      <option key={p.id} value={p.nombre}>{p.nombre} ({p.id})</option>
                    ))}
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
                      <option value="En Terreno">En Terreno / Predio de Obra</option>
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
                  <label>Notas o Temas Específicos a Tratar</label>
                  <textarea
                    className="client-textarea"
                    rows={3}
                    value={newMeetingForm.descripcion}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, descripcion: e.target.value })}
                    placeholder="Especifique quiénes asistirán o qué documentación le gustaría revisar..."
                  />
                </div>
              </div>

              <div className="client-modal-footer">
                <Button type="button" variant="outline" onClick={() => setIsMeetingModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" icon={<Calendar size={15} />}>
                  Confirmar Solicitud de Reunión
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. MODAL: SUBIR DOCUMENTO AL EXPEDIENTE
          ========================================================================= */}
      {isUploadDocModalOpen && (
        <div className="client-modal-overlay" onClick={() => setIsUploadDocModalOpen(false)}>
          <div className="client-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="client-modal-header">
              <h3>Compartir Documento con CONSTRUCTA</h3>
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
                    placeholder="Ej. Levantamiento Topográfico Predio Las Lomas"
                    required
                  />
                </div>

                <div className="client-form-group">
                  <label>Tipo de Documentación</label>
                  <select
                    className="client-select"
                    value={uploadDocForm.tipo}
                    onChange={(e) => setUploadDocForm({ ...uploadDocForm, tipo: e.target.value })}
                  >
                    <option value="Planos preliminares">Planos Arquitectónicos / Bocetos</option>
                    <option value="Escrituras o predial">Escritura o Documento de Propiedad</option>
                    <option value="Estudio de suelo">Estudio de Suelo / Geotecnia</option>
                    <option value="Fotografías de terreno">Fotografías del Terreno</option>
                    <option value="Referencias">Referencias de Acabados</option>
                    <option value="Otro">Otro archivo técnico</option>
                  </select>
                </div>

                <div className="client-dropzone" onClick={() => showAlert('Archivo seleccionado para validación.', 'info')}>
                  <Upload size={24} color="#f59e0b" style={{ margin: '0 auto 6px' }} />
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#ffffff', fontWeight: 600 }}>
                    Seleccione el archivo de su equipo
                  </p>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Formatos: PDF, DWG, DXF, PNG, JPG, ZIP (Máx. 25 MB)
                  </span>
                </div>
              </div>

              <div className="client-modal-footer">
                <Button type="button" variant="outline" onClick={() => setIsUploadDocModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" icon={<Upload size={15} />}>
                  Cargar y Enviar a Revisión
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

export default ClientPortal;
