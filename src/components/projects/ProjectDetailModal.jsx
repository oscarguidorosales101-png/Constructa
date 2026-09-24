import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import Badge from '../common/Badge.jsx';
import ProgressBar from '../common/ProgressBar.jsx';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import {
  Calendar,
  DollarSign,
  Users,
  Package,
  Clock,
  MapPin,
  TrendingUp,
  Briefcase,
} from 'lucide-react';

export const ProjectDetailModal = ({ isOpen, onClose, project }) => {
  const { employees, expenses, schedule, movements, formatCurrency, formatDate } = useConstructa();
  const [activeTab, setActiveTab] = useState('general');

  if (!project) return null;

  // Empleados asignados a este proyecto
  const assignedEmployees = employees.filter((e) => e.proyectoId === project.id);

  // Gastos asociados a este proyecto
  const projectExpenses = expenses.filter((g) => g.proyectoId === project.id);
  const totalSpent = projectExpenses.reduce((acc, g) => acc + (Number(g.monto) || 0), 0);
  const availableBudget = (Number(project.presupuesto) || 0) - totalSpent;
  const spentPercent = project.presupuesto > 0 ? Math.round((totalSpent / project.presupuesto) * 100) : 0;

  // Cronograma asociado
  const projectSchedule = schedule.filter((a) => a.proyectoId === project.id);

  // Despachos y movimientos de materiales a este proyecto
  const projectMovements = movements.filter((m) => m.proyectoId === project.id);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ficha de Obra — ${project.nombre}`}
      maxWidth="820px"
      footer={<Button variant="secondary" onClick={onClose}>Cerrar Detalle</Button>}
    >
      {/* Header General del Proyecto */}
      <div
        style={{
          background: '#0d131f',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-medium)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 700, letterSpacing: '0.05em' }}>
                {project.codigo || 'OBR-2026'}
              </span>
              <Badge variant={getStatusVariant(project.estado)}>
                {project.estado}
              </Badge>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
              {project.nombre}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Cliente: <strong style={{ color: 'var(--text-primary)' }}>{project.cliente}</strong> • Responsable: <strong style={{ color: 'var(--text-primary)' }}>{project.responsable}</strong>
            </p>
          </div>

          <div style={{ minWidth: '160px', textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Avance Físico
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
              {project.avance}%
            </div>
          </div>
        </div>

        <div style={{ marginTop: '0.85rem' }}>
          <ProgressBar value={project.avance} max={100} showLabel={false} size="md" />
        </div>

        {project.ubicacion && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.85rem' }}>
            <MapPin size={14} style={{ color: 'var(--accent-amber)' }} />
            <span>{project.ubicacion}</span>
          </div>
        )}
      </div>

      {/* Tarjetas Financieras del Proyecto */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#111724', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Presupuesto Asignado
          </span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
            {formatCurrency(project.presupuesto)}
          </div>
        </div>

        <div style={{ background: '#111724', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-amber)', textTransform: 'uppercase', fontWeight: 600 }}>
              Fondos Gastados
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{spentPercent}%</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.25rem' }}>
            {formatCurrency(totalSpent)}
          </div>
        </div>

        <div style={{ background: '#111724', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--accent-green)', textTransform: 'uppercase', fontWeight: 600 }}>
            Saldo Disponible
          </span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>
            {formatCurrency(availableBudget)}
          </div>
        </div>
      </div>

      {/* Navegación por pestañas del detalle */}
      <div className="tab-container">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          Información General
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'empleados' ? 'active' : ''}`}
          onClick={() => setActiveTab('empleados')}
        >
          Personal Asignado ({assignedEmployees.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'cronograma' ? 'active' : ''}`}
          onClick={() => setActiveTab('cronograma')}
        >
          Actividades ({projectSchedule.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'materiales' ? 'active' : ''}`}
          onClick={() => setActiveTab('materiales')}
        >
          Despachos de Material ({projectMovements.length})
        </button>
      </div>

      {/* CONTENIDO PESTAÑAS */}
      {activeTab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Memoria Descriptiva
            </h4>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.6, background: '#111724', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              {project.descripcion || 'Sin descripción técnica adicional registrada para esta obra.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ background: '#111724', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fecha de Inicio de Obra</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {formatDate(project.fechaInicio)}
              </div>
            </div>
            <div style={{ background: '#111724', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fecha Estimada de Entrega</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {formatDate(project.fechaFinEstimada)}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'empleados' && (
        <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Puesto / Especialidad</th>
                <th>Horario Laboral</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {assignedEmployees.length > 0 ? (
                assignedEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 600 }}>{emp.nombre}</td>
                    <td style={{ color: 'var(--accent-amber)' }}>{emp.puesto}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{emp.horario}</td>
                    <td>
                      <Badge variant={emp.estado === 'Activo' ? 'success' : 'neutral'}>
                        {emp.estado}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay trabajadores asignados actualmente a este proyecto.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'cronograma' && (
        <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Actividad</th>
                <th>Fechas</th>
                <th>Estado</th>
                <th style={{ width: '140px' }}>Progreso</th>
              </tr>
            </thead>
            <tbody>
              {projectSchedule.length > 0 ? (
                projectSchedule.map((act) => (
                  <tr key={act.id}>
                    <td style={{ fontWeight: 600 }}>{act.actividad}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {formatDate(act.fechaInicio)} — {formatDate(act.fechaFin)}
                    </td>
                    <td>
                      <Badge
                        variant={
                          act.estado === 'Completado'
                            ? 'success'
                            : act.estado === 'En progreso'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {act.estado}
                      </Badge>
                    </td>
                    <td>
                      <ProgressBar value={act.avance} max={100} size="sm" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay actividades registradas en el cronograma para esta obra.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'materiales' && (
        <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Material</th>
                <th>Cantidad</th>
                <th>Receptor / Motivo</th>
              </tr>
            </thead>
            <tbody>
              {projectMovements.length > 0 ? (
                projectMovements.map((mov) => (
                  <tr key={mov.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mov.fecha}</td>
                    <td style={{ fontWeight: 600 }}>{mov.materialNombre}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>
                      {mov.cantidad} {mov.unidad}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {mov.motivo} ({mov.responsable})
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay despachos de materiales registrados para esta obra.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};

export default ProjectDetailModal;
