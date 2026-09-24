import React from 'react';
import {
  LayoutDashboard,
  HardHat,
  Users,
  Package,
  Truck,
  DollarSign,
  Receipt,
  CalendarDays,
  TrendingUp,
  BarChart3,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';

export const Sidebar = ({ currentRoute, onNavigate, isOpen, onClose }) => {
  const { currentUser, metrics, requestConfirm, logout } = useConstructa();

  const handleLogoutClick = () => {
    requestConfirm({
      title: 'Cerrar sesión',
      message: '¿Deseas cerrar tu sesión actual en CONSTRUCTA?',
      confirmText: 'Cerrar sesión',
      cancelText: 'Cancelar',
      isDestructive: true,
      onConfirm: () => {
        logout();
        onNavigate('login');
      },
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'proyectos',
      label: 'Proyectos',
      icon: HardHat,
      badge: metrics?.activeProjects ? `${metrics.activeProjects} activos` : null,
    },
    {
      id: 'empleados',
      label: 'Empleados',
      icon: Users,
      badge: metrics?.totalEmployees ? `${metrics.totalEmployees}` : null,
    },
    {
      id: 'materiales',
      label: 'Materiales',
      icon: Package,
      warningBadge: metrics?.lowStockCount > 0 ? metrics.lowStockCount : null,
    },
    { id: 'proveedores', label: 'Proveedores', icon: Truck },
    { id: 'presupuestos', label: 'Presupuestos', icon: DollarSign },
    { id: 'gastos', label: 'Gastos', icon: Receipt },
    { id: 'cronograma', label: 'Cronograma', icon: CalendarDays },
    { id: 'avance', label: 'Avance', icon: TrendingUp },
    { id: 'reportes', label: 'Reportes y Estadísticas', icon: BarChart3 },
  ];

  const handleItemClick = (id) => {
    onNavigate(id);
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="logo-icon">
          <HardHat size={24} />
        </div>
        <div className="logo-text-group">
          <span className="logo-brand">CONSTRUCTA</span>
          <span className="logo-sub">Gestión de Obra</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Módulos de Gestión</div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>

              {item.warningBadge && (
                <span
                  className="nav-badge"
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title={`${item.warningBadge} materiales con stock bajo`}
                >
                  <AlertTriangle size={12} />
                  {item.warningBadge}
                </span>
              )}

              {item.badge && !item.warningBadge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="user-avatar">
            {currentUser?.nombre ? currentUser.nombre.charAt(0) : 'A'}
          </div>
          <div className="user-info">
            <div className="user-name">{currentUser?.nombre || 'Administrador'}</div>
            <div className="user-role">{currentUser?.cargo || 'Director de Obra'}</div>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={handleLogoutClick}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
