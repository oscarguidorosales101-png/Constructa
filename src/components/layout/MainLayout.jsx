import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import ConfirmModal from '../common/ConfirmModal.jsx';
import ToastContainer from '../common/ToastContainer.jsx';
import { useConstructa } from '../../context/ConstructaContext.jsx';

export const MainLayout = ({ currentRoute, onNavigate, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeView, setActiveView, confirmModal, closeConfirm } = useConstructa();

  const route = currentRoute || activeView;
  const navigate = onNavigate || setActiveView;

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`mobile-sidebar-backdrop ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />

      {/* Main Sidebar */}
      <Sidebar
        currentRoute={route}
        onNavigate={navigate}
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
      />

      {/* Content Wrapper */}
      <div className="main-layout">
        <Header
          currentRoute={route}
          onToggleMobileMenu={toggleMobileMenu}
          onNavigate={navigate}
        />

        <main className="content-area">{children}</main>
      </div>

      {/* Global Modals & Notifications */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isDestructive={confirmModal.isDestructive}
        confirmVariant={confirmModal.confirmVariant}
        onConfirm={confirmModal.onConfirm}
        onClose={closeConfirm}
      />

      <ToastContainer />
    </div>
  );
};

export default MainLayout;
