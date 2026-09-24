import React, { useState, useMemo } from 'react';
import { useConstructa } from '../../context/ConstructaContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import EmployeeModal from '../../components/employees/EmployeeModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  Briefcase, 
  Edit, 
  Trash2, 
  Building2,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';

export default function Employees() {
  const { data, saveEmployee, deleteEmployee, requestConfirm } = useConstructa();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('agenda'); // 'agenda' | 'cards'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // List of unique roles
  const uniqueRoles = useMemo(() => {
    const roles = new Set(data.employees.map(e => e.puesto));
    return Array.from(roles).sort();
  }, [data.employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return data.employees.filter(emp => {
      const matchesSearch = 
        emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.puesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProject = selectedProject === 'ALL' || emp.proyectoId === selectedProject;
      const matchesRole = selectedRole === 'ALL' || emp.puesto === selectedRole;
      const matchesStatus = selectedStatus === 'ALL' || emp.estado === selectedStatus;

      return matchesSearch && matchesProject && matchesRole && matchesStatus;
    });
  }, [data.employees, searchTerm, selectedProject, selectedRole, selectedStatus]);

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setModalOpen(true);
  };

  const handleDelete = (emp) => {
    requestConfirm({
      title: 'Eliminar Empleado',
      message: `¿Deseas dar de baja a ${emp.nombre}? Esta acción actualizará la nómina y la asignación del proyecto.`,
      confirmText: 'Eliminar',
      confirmVariant: 'danger',
      onConfirm: () => deleteEmployee(emp.id)
    });
  };

  const getProjectName = (projectId) => {
    const prj = data.projects.find(p => p.id === projectId);
    return prj ? prj.nombre : 'Sin asignar';
  };

  return (
    <div className="constructa-page">
      {/* Page Header */}
      <div className="constructa-page-header">
        <div>
          <h1 className="constructa-page-title">Personal de Obra</h1>
          <p className="constructa-page-subtitle">
            Gestión de plantilla operativa, especialistas, horarios y asignación por proyecto ({data.employees.length} registrados).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="view-toggle" style={{ display: 'flex', background: 'var(--color-bg-card)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <button
              onClick={() => setViewMode('agenda')}
              className={`btn-icon ${viewMode === 'agenda' ? 'active' : ''}`}
              title="Vista Agenda / Turnos"
              style={{
                background: viewMode === 'agenda' ? 'var(--color-bg-card-hover)' : 'transparent',
                color: viewMode === 'agenda' ? 'var(--color-gold)' : 'var(--color-text-muted)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem'
              }}
            >
              <TableIcon size={16} /> Horarios
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`btn-icon ${viewMode === 'cards' ? 'active' : ''}`}
              title="Vista Tarjetas"
              style={{
                background: viewMode === 'cards' ? 'var(--color-bg-card-hover)' : 'transparent',
                color: viewMode === 'cards' ? 'var(--color-gold)' : 'var(--color-text-muted)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem'
              }}
            >
              <LayoutGrid size={16} /> Fichas
            </button>
          </div>

          <Button variant="primary" icon={<UserPlus size={16} />} onClick={handleOpenCreate}>
            Nuevo Empleado
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Total Plantilla</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {data.employees.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', marginTop: '4px' }}>
            100% registrados
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Activos en Obra</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
            {data.employees.filter(e => e.estado === 'Activo').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Turnos operativos
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>En Descanso / Licencia</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-amber)', marginTop: '4px' }}>
            {data.employees.filter(e => e.estado === 'Descanso' || e.estado === 'Licencia').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Rotación programada
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Especialidades</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-cyan)', marginTop: '4px' }}>
            {uniqueRoles.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Perfiles técnicos
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="constructa-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'center' }}>
          <SearchInput
            placeholder="Buscar por nombre, puesto o DNI..."
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
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="ALL">Todas las Especialidades</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select
            className="constructa-input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">Todos los Estados</option>
            <option value="Activo">Activo</option>
            <option value="Descanso">Descanso</option>
            <option value="Licencia">Licencia</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredEmployees.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="No encontramos personal que coincida con los criterios de búsqueda o filtros seleccionados."
          actionText="Limpiar filtros"
          onAction={() => {
            setSearchTerm('');
            setSelectedProject('ALL');
            setSelectedRole('ALL');
            setSelectedStatus('ALL');
          }}
        />
      ) : viewMode === 'agenda' ? (
        /* Agenda & Schedule Table View */
        <div className="constructa-card" style={{ overflow: 'hidden' }}>
          <div className="constructa-table-container">
            <table className="constructa-table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Especialidad / Puesto</th>
                  <th>Proyecto Asignado</th>
                  <th>Jornada y Días</th>
                  <th>Horario Laboral</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: 'var(--color-gold)'
                        }}>
                          {emp.nombre.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {emp.nombre}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            DNI: {emp.dni}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Briefcase size={14} style={{ color: 'var(--color-gold)' }} />
                        <span>{emp.puesto}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={14} style={{ color: 'var(--color-text-muted)' }} />
                        <span>{getProjectName(emp.proyectoId)}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        <Calendar size={14} style={{ color: 'var(--color-cyan)' }} />
                        <span>{emp.diasLaborales}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        background: 'rgba(255,255,255,0.03)', 
                        padding: '4px 10px', 
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        fontSize: '0.85rem'
                      }}>
                        <Clock size={13} style={{ color: 'var(--color-amber)' }} />
                        <span>{emp.horario}</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={emp.estado === 'Activo' ? 'success' : emp.estado === 'Descanso' ? 'warning' : 'neutral'}>
                        {emp.estado}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="btn-icon"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                          title="Editar información"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          className="btn-icon"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-rose)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                          title="Dar de baja"
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
        </div>
      ) : (
        /* Employee Cards Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredEmployees.map(emp => (
            <div key={emp.id} className="constructa-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--color-gold)'
                  }}>
                    {emp.nombre.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {emp.nombre}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Briefcase size={12} /> {emp.puesto}
                    </div>
                  </div>
                </div>
                <Badge variant={emp.estado === 'Activo' ? 'success' : emp.estado === 'Descanso' ? 'warning' : 'neutral'}>
                  {emp.estado}
                </Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', background: 'var(--color-bg-page)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <span><strong>Proyecto:</strong> {getProjectName(emp.proyectoId)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} style={{ color: 'var(--color-cyan)' }} />
                  <span><strong>Días:</strong> {emp.diasLaborales}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} style={{ color: 'var(--color-amber)' }} />
                  <span><strong>Horario:</strong> {emp.horario}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} style={{ color: 'var(--color-emerald)' }} />
                  <span><strong>Teléfono:</strong> {emp.telefono}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} style={{ color: 'var(--color-purple)' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <strong>Email:</strong> {emp.email}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: 'auto' }}>
                <Button size="sm" variant="secondary" icon={<Edit size={14} />} onClick={() => handleOpenEdit(emp)}>
                  Editar
                </Button>
                <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => handleDelete(emp)}>
                  Baja
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employee Modal Form */}
      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={saveEmployee}
        employee={editingEmployee}
        projects={data.projects}
      />
    </div>
  );
}
