import React, { useState, useMemo } from 'react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import UserModal from './UserModal.jsx';
import RoleModal from './RoleModal.jsx';
import { matchSearch } from '../../utils/searchUtils.js';
import {
  Users,
  Shield,
  UserPlus,
  ShieldPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Building,
  KeyRound,
  FileCheck,
  Check
} from 'lucide-react';

export const UsersRoles = () => {
  const {
    users = [],
    roles = [],
    saveUser,
    toggleUserStatus,
    deleteUser,
    saveRole,
    deleteRole,
    requestConfirm,
    showAlert
  } = useConstructa();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'roles'
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modales
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Filtrado de usuarios
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = matchSearch(searchTerm, [
        user.nombre,
        user.apellidos,
        user.email,
        user.usuario,
        user.identificacion,
        user.tipoIdentificacionDescripcion,
        user.rol,
        user.cargo
      ]);

      const matchesRole = roleFilter === 'ALL' || user.rol === roleFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && user.activo !== false) ||
        (statusFilter === 'INACTIVE' && user.activo === false);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Filtrado de roles
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      return matchSearch(searchTerm, [
        role.nombre,
        role.codigo,
        role.descripcion,
        ...(role.permisos || [])
      ]);
    });
  }, [roles, searchTerm]);

  // Manejadores para Usuarios
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setUserModalOpen(true);
  };

  const handleToggleStatus = (u) => {
    if (u.id === 'USR-001') {
      showAlert('El Administrador Principal no puede ser desactivado.', 'error');
      return;
    }
    toggleUserStatus(u.id);
  };

  const handleDeleteUser = (u) => {
    if (u.id === 'USR-001') {
      showAlert('El Administrador Principal no puede ser eliminado.', 'error');
      return;
    }

    requestConfirm({
      title: 'Eliminar Usuario',
      message: `¿Deseas eliminar permanentemente al usuario "${u.nombre}" (${u.email})? Esta acción se sincronizará con db.json.`,
      confirmText: 'Eliminar Usuario',
      confirmVariant: 'danger',
      isDestructive: true,
      onConfirm: () => deleteUser(u.id)
    });
  };

  // Manejadores para Roles
  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setRoleModalOpen(true);
  };

  const handleOpenEditRole = (r) => {
    setEditingRole(r);
    setRoleModalOpen(true);
  };

  const handleDeleteRole = (r) => {
    if (r.esSistema) {
      showAlert('Los roles base del sistema no pueden ser eliminados.', 'error');
      return;
    }

    requestConfirm({
      title: 'Eliminar Rol Personalizado',
      message: `¿Deseas eliminar el rol "${r.nombre}"? Los usuarios asignados a este rol deberán ser reasignados.`,
      confirmText: 'Eliminar Rol',
      confirmVariant: 'danger',
      isDestructive: true,
      onConfirm: () => deleteRole(r.id)
    });
  };

  const activeUsersCount = users.filter((u) => u.activo !== false).length;

  return (
    <div className="constructa-page">
      {/* Header */}
      <div className="constructa-page-header">
        <div>
          <h1 className="constructa-page-title">Gestión de Usuarios y Roles</h1>
          <p className="constructa-page-subtitle">
            Administración centralizada de identidades, perfiles tributarios con Hacienda Costa Rica, roles y permisos de acceso.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {activeTab === 'users' ? (
            <Button variant="primary" icon={<UserPlus size={16} />} onClick={handleOpenCreateUser}>
              Nuevo Usuario
            </Button>
          ) : (
            <Button variant="primary" icon={<ShieldPlus size={16} />} onClick={handleOpenCreateRole}>
              Nuevo Rol
            </Button>
          )}
        </div>
      </div>

      {/* Métricas Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Usuarios Totales</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {users.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', marginTop: '4px' }}>
            {activeUsersCount} activos en plataforma
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Roles Configurados</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
            {roles.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {roles.filter((r) => r.esSistema).length} base · {roles.filter((r) => !r.esSistema).length} personalizados
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Integración Tributaria</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Hacienda CR <FileCheck size={20} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Validación de Cédulas Físicas / Jurídicas
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => {
            setActiveTab('users');
            setSearchTerm('');
          }}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'users' ? '2px solid var(--color-gold)' : '2px solid transparent',
            color: activeTab === 'users' ? 'var(--color-gold)' : 'var(--color-text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem'
          }}
        >
          <Users size={18} />
          <span>Usuarios del Sistema ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('roles');
            setSearchTerm('');
          }}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'roles' ? '2px solid var(--color-gold)' : '2px solid transparent',
            color: activeTab === 'roles' ? 'var(--color-gold)' : 'var(--color-text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem'
          }}
        >
          <Shield size={18} />
          <span>Roles y Permisos ({roles.length})</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
            placeholder={activeTab === 'users' ? 'Buscar usuario por nombre, email, identificación...' : 'Buscar rol por nombre o permiso...'}
          />
        </div>

        {activeTab === 'users' && (
          <>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '180px' }}
            >
              <option value="ALL">Todos los Roles</option>
              {roles.map((r) => (
                <option key={r.id || r.nombre} value={r.nombre}>
                  {r.nombre}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="ALL">Todos los Estados</option>
              <option value="ACTIVE">Solo Activos</option>
              <option value="INACTIVE">Solo Inactivos</option>
            </select>
          </>
        )}
      </div>

      {/* ======================= TAB 1: USUARIOS ======================= */}
      {activeTab === 'users' && (
        <>
          {filteredUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No se encontraron usuarios"
              description="Ajusta los términos de búsqueda o registra un nuevo usuario corporativo en la plataforma."
              action={
                <Button variant="primary" icon={<UserPlus size={16} />} onClick={handleOpenCreateUser}>
                  Crear Usuario
                </Button>
              }
            />
          ) : (
            <div className="constructa-table-container">
              <table className="constructa-table">
                <thead>
                  <tr>
                    <th>Usuario / Nombre</th>
                    <th>Identificación (Hacienda CR)</th>
                    <th>Contacto</th>
                    <th>Rol Asignado</th>
                    <th>Cargo</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isSuperAdmin = u.id === 'USR-001';
                    const isActive = u.activo !== false;

                    return (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: 'var(--color-gold)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.85rem'
                              }}
                            >
                              {u.avatar || u.nombre.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                {u.nombre} {u.apellidos || ''}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div>
                            <div style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--color-gold)' }}>
                              {u.identificacion || 'No especificada'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                              {u.tipoIdentificacionDescripcion || (u.tipoIdentificacion === '02' ? 'Cédula Jurídica' : 'Cédula Física')}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{u.telefono || 'Sin teléfono'}</div>
                        </td>

                        <td>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: u.rol.includes('Admin')
                                ? 'rgba(245, 158, 11, 0.15)'
                                : u.rol.includes('Gerente')
                                ? 'rgba(56, 189, 248, 0.15)'
                                : u.rol.includes('RRHH')
                                ? 'rgba(168, 85, 247, 0.15)'
                                : u.rol === 'Cliente'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(255, 255, 255, 0.08)',
                              color: u.rol.includes('Admin')
                                ? 'var(--color-gold)'
                                : u.rol.includes('Gerente')
                                ? '#38bdf8'
                                : u.rol.includes('RRHH')
                                ? '#c084fc'
                                : u.rol === 'Cliente'
                                ? '#10b981'
                                : 'var(--color-text-primary)'
                            }}
                          >
                            {u.rol}
                          </span>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                            {u.cargo || u.rol}
                          </div>
                        </td>

                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: isActive ? '#10b981' : '#f87171'
                            }}
                          >
                            {isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                            {isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditUser(u)}
                              title="Editar usuario"
                            >
                              <Edit2 size={14} />
                            </Button>

                            {!isSuperAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(u)}
                                title={isActive ? 'Desactivar usuario' : 'Activar usuario'}
                                style={{ color: isActive ? 'var(--color-amber)' : 'var(--color-emerald)' }}
                              >
                                {isActive ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                              </Button>
                            )}

                            {!isSuperAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(u)}
                                title="Eliminar usuario"
                                style={{ color: 'var(--color-danger)' }}
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ======================= TAB 2: ROLES ======================= */}
      {activeTab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredRoles.map((r) => {
            const usersWithRole = users.filter((u) => u.rol === r.nombre).length;

            return (
              <div key={r.id || r.codigo} className="constructa-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                        {r.nombre}
                      </h3>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--color-gold)' }}>
                        {r.codigo}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: r.esSistema ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        color: r.esSistema ? 'var(--color-gold)' : '#38bdf8'
                      }}
                    >
                      {r.esSistema ? 'Sistema' : 'Personalizado'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                    {r.descripcion || 'Sin descripción detallada.'}
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                      Módulos autorizados ({r.permisos ? r.permisos.length : 0}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(r.permisos || []).slice(0, 5).map((p) => (
                        <span
                          key={p}
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'var(--color-bg-card-hover)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-muted)'
                          }}
                        >
                          {p}
                        </span>
                      ))}
                      {(r.permisos || []).length > 5 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)', alignSelf: 'center' }}>
                          +{(r.permisos || []).length - 5} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <strong>{usersWithRole}</strong> {usersWithRole === 1 ? 'usuario asignado' : 'usuarios asignados'}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditRole(r)} title="Editar permisos del rol">
                      <Edit2 size={14} /> Permisos
                    </Button>

                    {!r.esSistema && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(r)}
                        title="Eliminar rol"
                        style={{ color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Usuario */}
      {userModalOpen && (
        <UserModal
          isOpen={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          onSave={saveUser}
          user={editingUser}
          roles={roles}
        />
      )}

      {/* Modal de Rol */}
      {roleModalOpen && (
        <RoleModal
          isOpen={roleModalOpen}
          onClose={() => setRoleModalOpen(false)}
          onSave={saveRole}
          role={editingRole}
        />
      )}
    </div>
  );
};

export default UsersRoles;
