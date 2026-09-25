import React, { useState, useMemo } from 'react';
import {
  HardHat,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ProjectModal from '../../components/projects/ProjectModal.jsx';
import ProjectDetailModal from '../../components/projects/ProjectDetailModal.jsx';

export const Projects = () => {
  const {
    projects,
    expenses,
    saveProject,
    deleteProject,
    requestConfirm,
    formatCurrency,
    formatDate,
  } = useConstructa();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailProject, setDetailProject] = useState(null);

  // Filtrado y búsqueda conjunta (Prompt Regla #34)
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === 'Todos' || p.estado === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  // Cálculo de gasto ejecutado por proyecto
  const getProjectSpent = (projectId) => {
    if (!expenses) return 0;
    return expenses
      .filter((e) => e.proyectoId === projectId)
      .reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
  };

  const handleOpenCreate = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (project) => {
    requestConfirm({
      title: 'Eliminar Proyecto',
      message: `¿Deseas eliminar permanentemente el proyecto "${project.nombre}"? Esta acción afectará los cálculos presupuestarios asociados.`,
      confirmText: 'Eliminar Proyecto',
      cancelText: 'Cancelar',
      isDestructive: true,
      onConfirm: () => deleteProject(project.id),
    });
  };

  const getStatusVariant = (st) => {
    switch (st) {
      case 'Finalizado':
        return 'success';
      case 'En construcción':
        return 'warning';
      case 'Pausado':
        return 'danger';
      case 'Planificación':
      default:
        return 'info';
    }
  };

  return (
    <div className="projects-page">
      {/* BARRA DE HERRAMIENTAS Y BÚSQUEDA */}
      <div className="filter-toolbar">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por nombre, cliente, código o director..."
        />

        <div className="filter-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '160px' }}
              aria-label="Filtrar por estado"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Planificación">Planificación</option>
              <option value="En construcción">En construcción</option>
              <option value="Pausado">Pausado</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>

          {/* Toggle Vista Cuadrícula / Tabla */}
          <div style={{ display: 'flex', background: '#0e1420', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', padding: '2px' }}>
            <button
              type="button"
              className={`btn-icon ${viewMode === 'cards' ? 'active' : ''}`}
              style={{ background: viewMode === 'cards' ? '#25334d' : 'transparent', color: viewMode === 'cards' ? '#ffffff' : 'var(--text-muted)' }}
              onClick={() => setViewMode('cards')}
              title="Vista Cuadrícula"
              aria-label="Vista de tarjetas"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className={`btn-icon ${viewMode === 'table' ? 'active' : ''}`}
              style={{ background: viewMode === 'table' ? '#25334d' : 'transparent', color: viewMode === 'table' ? '#ffffff' : 'var(--text-muted)' }}
              onClick={() => setViewMode('table')}
              title="Vista Tabla"
              aria-label="Vista de tabla"
            >
              <TableIcon size={16} />
            </button>
          </div>

          <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* ESTADO VACÍO O SIN COINCIDENCIAS */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          isSearch={searchTerm !== '' || statusFilter !== 'Todos'}
          title={
            searchTerm !== '' || statusFilter !== 'Todos'
              ? 'Sin resultados'
              : 'No hay proyectos registrados'
          }
          message={
            searchTerm !== '' || statusFilter !== 'Todos'
              ? 'No encontramos información que coincida con tu búsqueda o los filtros seleccionados.'
              : 'Agrega un proyecto para comenzar a registrar actividades, personal y presupuestos.'
          }
          actionText={
            searchTerm !== '' || statusFilter !== 'Todos'
              ? null
              : 'Crear Primer Proyecto'
          }
          onAction={handleOpenCreate}
        />
      ) : viewMode === 'cards' ? (
        /* VISTA DE TARJETAS EMPRESARIALES (Prompt Requerimiento #16) */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filteredProjects.map((project) => {
            const spent = getProjectSpent(project.id);
            const targetDate = project.fechaFin || project.fechaFinEstimada || project.fechaInicio || 'En curso';

            return (
              <div key={project.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', letterSpacing: '0.04em' }}>
                      {project.codigo || 'OBR-2026'}
                    </span>
                    <Badge variant={getStatusVariant(project.estado)}>
                      {project.estado}
                    </Badge>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem', lineHeight: 1.3 }}>
                    {project.nombre}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {project.cliente}
                  </p>

                  <div style={{ background: '#0e1420', padding: '0.85rem 0.95rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>Presupuesto</span>
                      <strong style={{ color: '#ffffff', fontSize: '0.88rem' }}>
                        {formatCurrency(project.presupuesto)}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>Gastado Ejecutado</span>
                      <strong style={{ color: '#fbbf24', fontSize: '0.88rem' }}>
                        {formatCurrency(spent)}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.35rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} style={{ color: 'var(--accent-amber)' }} /> Plazo:
                      </span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {targetDate}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <ProgressBar
                      value={project.avance}
                      max={100}
                      labelPrefix="Avance de obra"
                      size="md"
                    />
                  </div>
                </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  onClick={() => setDetailProject(project)}
                >
                  Detalles
                </Button>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => handleOpenEdit(project)}
                    title="Editar proyecto"
                    aria-label="Editar proyecto"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    style={{ color: '#f87171' }}
                    onClick={() => handleDeleteClick(project)}
                    title="Eliminar proyecto"
                    aria-label="Eliminar proyecto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
        /* VISTA DE TABLA */
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código / Obra</th>
                <th>Cliente</th>
                <th>Responsable</th>
                <th>Estado</th>
                <th>Presupuesto</th>
                <th style={{ width: '150px' }}>Avance</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>{p.codigo}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.cliente}</td>
                  <td>{p.responsable}</td>
                  <td>
                    <Badge variant={getStatusVariant(p.estado)}>{p.estado}</Badge>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(p.presupuesto)}</td>
                  <td>
                    <ProgressBar value={p.avance} max={100} size="sm" />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => setDetailProject(p)}
                        title="Ver detalle"
                        aria-label="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => handleOpenEdit(p)}
                        title="Editar"
                        aria-label="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        style={{ color: '#f87171' }}
                        onClick={() => handleDeleteClick(p)}
                        title="Eliminar"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear / Editar */}
      <ProjectModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={saveProject}
        project={selectedProject}
      />

      {/* Modal Ficha Completa del Proyecto */}
      <ProjectDetailModal
        isOpen={!!detailProject}
        onClose={() => setDetailProject(null)}
        project={detailProject}
      />
    </div>
  );
};

export default Projects;
