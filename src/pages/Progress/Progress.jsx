import React, { useState, useMemo } from 'react';
import { useConstructa } from '../../context/ConstructaContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { matchSearch } from '../../utils/searchUtils';
import { 
  Activity, 
  TrendingUp, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Sliders, 
  Sparkles, 
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

export default function Progress() {
  const { data, updateProjectProgress, metrics } = useConstructa();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  // Progress edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProgressValue, setNewProgressValue] = useState(0);

  const filteredProjects = useMemo(() => {
    return data.projects.filter(prj => {
      const matchesSearch = matchSearch(searchTerm, [
        prj.nombre,
        prj.codigo,
        prj.id,
        prj.cliente,
        prj.responsable,
        prj.estado,
        prj.ubicacion,
      ]);
      
      const matchesStatus = selectedStatus === 'ALL' || prj.estado === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [data.projects, searchTerm, selectedStatus]);

  const handleOpenEdit = (project) => {
    setSelectedProject(project);
    setNewProgressValue(project.avance || 0);
    setEditModalOpen(true);
  };

  const handleSaveProgress = (e) => {
    e.preventDefault();
    if (selectedProject) {
      updateProjectProgress(selectedProject.id, Number(newProgressValue));
      setEditModalOpen(false);
      setSelectedProject(null);
    }
  };

  return (
    <div className="constructa-page">
      {/* Header */}
      <div className="constructa-page-header">
        <div>
          <h1 className="constructa-page-title">Avance Físico de Obra</h1>
          <p className="constructa-page-subtitle">
            Monitoreo porcentual de ejecución en obra, cumplimiento de fases constructivas y certificación de entregables (0% a 100%).
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Avance Promedio Global</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-gold)', marginTop: '4px' }}>
            {metrics.avgProgress}%
          </div>
          <div style={{ marginTop: '8px' }}>
            <ProgressBar value={metrics.avgProgress} showLabel={false} height={6} />
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Proyectos en Construcción</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-cyan)', marginTop: '4px' }}>
            {metrics.activeProjects}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Frentes de trabajo en marcha
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Obras 100% Entregadas</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
            {metrics.finishedProjects}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald)', marginTop: '4px' }}>
            Fases culminadas y auditadas
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Fases en Planificación</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-amber)', marginTop: '4px' }}>
            {data.projects.filter(p => p.estado === 'Planificación').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Próximos arranques
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="constructa-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
          <SearchInput
            placeholder="Buscar por obra, código, cliente o responsable..."
            value={searchTerm}
            onChange={setSearchTerm}
          />

          <select
            className="constructa-input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">Todos los Estados de Obra</option>
            <option value="En construcción">En construcción</option>
            <option value="Planificación">Planificación</option>
            <option value="Pausado">Pausado</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </div>
      </div>

      {/* Projects Progress Cards */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          isSearch={Boolean(searchTerm || selectedStatus !== 'ALL')}
          title="No encontramos resultados para tu búsqueda"
          message="No se encontraron proyectos para evaluar el avance con los filtros aplicados."
          actionText="Limpiar búsqueda y filtros"
          onAction={() => {
            setSearchTerm('');
            setSelectedStatus('ALL');
          }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredProjects.map(prj => {
            const isCompleted = prj.avance === 100;
            const tasks = data.schedule.filter(t => t.proyectoId === prj.id);
            const completedTasks = tasks.filter(t => t.estado === 'Completada').length;

            return (
              <div key={prj.id} className="constructa-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-gold)', fontWeight: 600 }}>{prj.codigo}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                      {prj.nombre}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {prj.ubicacion}
                    </div>
                  </div>
                  <Badge variant={isCompleted ? 'success' : prj.estado === 'En construcción' ? 'primary' : 'warning'}>
                    {prj.estado}
                  </Badge>
                </div>

                {/* Progress Bar & Big Percentage */}
                <div style={{
                  background: 'var(--color-bg-page)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      Certificación Física
                    </span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: isCompleted ? 'var(--color-emerald)' : 'var(--color-gold)' }}>
                      {prj.avance}%
                    </div>
                  </div>

                  <ProgressBar 
                    value={prj.avance} 
                    showLabel={false} 
                    height={10} 
                    variant={isCompleted ? 'success' : 'primary'} 
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    <span>0% (Cimentación)</span>
                    <span>50% (Estructura)</span>
                    <span>100% (Entrega)</span>
                  </div>
                </div>

                {/* Schedule stats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} style={{ color: 'var(--color-cyan)' }} />
                    <span>Entrega: <strong>{prj.fechaFin}</strong></span>
                  </div>
                  <div>
                    <span>Hitos cumplidos: <strong>{completedTasks} de {tasks.length}</strong></span>
                  </div>
                </div>

                {/* Direct Adjust Button */}
                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                  <Button
                    variant="secondary"
                    icon={<Sliders size={15} />}
                    onClick={() => handleOpenEdit(prj)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Actualizar Porcentaje de Avance
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Progress Modal */}
      {selectedProject && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Actualizar Avance — ${selectedProject.nombre}`}
          maxWidth="480px"
        >
          <form onSubmit={handleSaveProgress}>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                Ajusta el avance físico reportado en libro de obra. Si el avance alcanza el 100%, el proyecto se marcará como <strong>Finalizado</strong> automáticamente.
              </p>

              <div style={{
                background: 'var(--color-bg-page)',
                padding: '20px',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: Number(newProgressValue) === 100 ? 'var(--color-emerald)' : 'var(--color-gold)' }}>
                  {newProgressValue}%
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  {Number(newProgressValue) === 100 
                    ? 'Obra terminada con entrega de llaves' 
                    : Number(newProgressValue) >= 50 
                    ? 'Fase avanzada / Obra gris e instalaciones' 
                    : 'Fase inicial / Excavación y cimientos'}
                </div>
              </div>

              <div className="constructa-form-group">
                <label className="constructa-label">Selecciona o desliza el porcentaje:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  className="constructa-input"
                  value={newProgressValue}
                  onChange={(e) => setNewProgressValue(Number(e.target.value))}
                  style={{ padding: '8px 0', cursor: 'pointer' }}
                />
              </div>

              {/* Quick increment buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '10px' }}>
                {[25, 50, 75, 100].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setNewProgressValue(val)}
                    style={{
                      background: newProgressValue === val ? 'var(--color-gold)' : 'rgba(255,255,255,0.05)',
                      color: newProgressValue === val ? '#000' : 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Confirmar y Actualizar
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
