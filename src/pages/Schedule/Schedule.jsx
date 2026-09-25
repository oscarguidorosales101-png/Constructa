import React, { useState, useMemo } from 'react';
import { useConstructa } from '../../context/ConstructaContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import ScheduleModal from '../../components/schedule/ScheduleModal';
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PlayCircle, 
  Building2, 
  User, 
  Edit, 
  Trash2, 
  BarChart3,
  CalendarRange
} from 'lucide-react';

export default function Schedule() {
  const { data, saveScheduleTask, deleteScheduleTask, requestConfirm } = useConstructa();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const filteredTasks = useMemo(() => {
    return data.schedule.filter(task => {
      const matchesSearch = 
        task.actividad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.responsable && task.responsable.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesProject = selectedProject === 'ALL' || task.proyectoId === selectedProject;
      const matchesStatus = selectedStatus === 'ALL' || task.estado === selectedStatus;

      return matchesSearch && matchesProject && matchesStatus;
    }).sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
  }, [data.schedule, searchTerm, selectedProject, selectedStatus]);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDelete = (task) => {
    requestConfirm({
      title: 'Eliminar Actividad',
      message: `¿Estás seguro de retirar la actividad "${task.actividad}" del cronograma de obra?`,
      confirmText: 'Eliminar',
      confirmVariant: 'danger',
      onConfirm: () => deleteScheduleTask(task.id)
    });
  };

  const handleQuickStatusChange = (task, newStatus) => {
    saveScheduleTask({
      ...task,
      estado: newStatus,
      avance: newStatus === 'Completada' ? 100 : task.avance
    });
  };

  const getProjectName = (projectId) => {
    const prj = data.projects.find(p => p.id === projectId);
    return prj ? prj.nombre : 'Proyecto general';
  };

  // Status statistics
  const statusCounts = useMemo(() => {
    return {
      completadas: data.schedule.filter(t => t.estado === 'Completada').length,
      enProgreso: data.schedule.filter(t => t.estado === 'En progreso').length,
      pendientes: data.schedule.filter(t => t.estado === 'Pendiente').length,
      retrasadas: data.schedule.filter(t => t.estado === 'Retrasada').length
    };
  }, [data.schedule]);

  return (
    <div className="constructa-page">
      {/* Header */}
      <div className="constructa-page-header">
        <div>
          <h1 className="constructa-page-title">Cronograma y Planificación de Obra</h1>
          <p className="constructa-page-subtitle">
            Hitos de construcción, programación de fases operativas, plazos de entrega y estado de avance de actividades ({data.schedule.length} tareas programadas).
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenCreate}>
          Nueva Actividad
        </Button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Actividades Totales</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {data.schedule.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', marginTop: '4px' }}>
            Fases cronometradas
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>En Ejecución Activa</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-cyan)', marginTop: '4px' }}>
            {statusCounts.enProgreso}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Frentes en progreso
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Hitos Completados</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
            {statusCounts.completadas}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald)', marginTop: '4px' }}>
            Fases aprobadas
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Con Retraso / Alerta</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: statusCounts.retrasadas > 0 ? 'var(--color-rose)' : 'var(--color-text-muted)', marginTop: '4px' }}>
            {statusCounts.retrasadas}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-rose)', marginTop: '4px' }}>
            {statusCounts.retrasadas > 0 ? 'Requiere reasignación' : 'Cronograma al día'}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="constructa-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
          <SearchInput
            placeholder="Buscar por actividad o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="constructa-input"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="ALL">Todos los Proyectos</option>
            {data.projects.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          <select
            className="constructa-input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">Todos los Estados</option>
            <option value="En progreso">En progreso</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Completada">Completada</option>
            <option value="Retrasada">Retrasada</option>
          </select>
        </div>
      </div>

      {/* Schedule Items Timeline List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="Sin actividades en cronograma"
          description="No se encontraron fases ni actividades que coincidan con los criterios seleccionados."
          actionText="Limpiar filtros"
          onAction={() => {
            setSearchTerm('');
            setSelectedProject('ALL');
            setSelectedStatus('ALL');
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredTasks.map(task => {
            const isCompleted = task.estado === 'Completada';
            const isDelayed = task.estado === 'Retrasada';
            const isInProgress = task.estado === 'En progreso';

            return (
              <div 
                key={task.id} 
                className="constructa-card" 
                style={{ 
                  padding: '20px',
                  borderLeft: isCompleted 
                    ? '4px solid var(--color-emerald)' 
                    : isDelayed 
                    ? '4px solid var(--color-rose)' 
                    : isInProgress 
                    ? '4px solid var(--color-gold)' 
                    : '4px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={13} /> {getProjectName(task.proyectoId)}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {task.actividad}
                    </h3>
                    {task.responsable && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <User size={13} style={{ color: 'var(--color-text-muted)' }} />
                        <span>Responsable: <strong>{task.responsable}</strong></span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Quick status selector */}
                    <select
                      value={task.estado}
                      onChange={(e) => handleQuickStatusChange(task, e.target.value)}
                      className="constructa-input"
                      style={{ padding: '4px 10px', fontSize: '0.8rem', width: 'auto' }}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En progreso">En progreso</option>
                      <option value="Completada">Completada</option>
                      <option value="Retrasada">Retrasada</option>
                    </select>

                    <Badge variant={isCompleted ? 'success' : isDelayed ? 'danger' : isInProgress ? 'primary' : 'neutral'}>
                      {task.estado}
                    </Badge>
                  </div>
                </div>

                {/* Timeline Gantt Bar & Dates */}
                <div style={{
                  background: 'var(--color-bg-page)',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)' }}>
                      <Calendar size={14} style={{ color: 'var(--color-cyan)' }} />
                      <span>Inicio: <strong>{task.fechaInicio}</strong></span>
                      <span style={{ color: 'var(--color-border)' }}>•</span>
                      <span>Fin estimado: <strong>{task.fechaFin}</strong></span>
                    </div>
                    <div style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
                      Avance de fase: {task.avance}%
                    </div>
                  </div>

                  <ProgressBar 
                    value={task.avance} 
                    showLabel={false} 
                    height={8}
                    variant={isCompleted ? 'success' : isDelayed ? 'danger' : 'primary'}
                  />
                </div>

                {/* Bottom Controls */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '6px' }}>
                  <Button size="sm" variant="secondary" icon={<Edit size={14} />} onClick={() => handleOpenEdit(task)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => handleDelete(task)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={saveScheduleTask}
        task={editingTask}
        projects={data.projects}
      />
    </div>
  );
}
