import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  normalizeRole,
  getDefaultRouteForRole,
  hasPermission,
  ROLE_PERMISSIONS
} from '../../utils/permissions';
import dataService from '../../services/dataService';
import userService from '../../services/userService';
import { ConstructaProvider } from '../../context/ConstructaContext';
import PublicContact from '../../components/public/PublicContact';

const renderWithProviders = (ui) => {
  return render(
    <ConstructaProvider>
      {ui}
    </ConstructaProvider>
  );
};

describe('CONSTRUCTA — Auditoría Integral de Autenticación, Roles, Permisos y Contacto', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  // =========================================================================
  // 1. NORMALIZACIÓN DE ROLES
  // =========================================================================
  describe('1. Normalización de Roles y Rutas por Defecto', () => {
    it('normaliza correctamente todas las variaciones ortográficas de roles existentes', () => {
      // Administrador
      expect(normalizeRole('Administrador')).toBe('Administrador');
      expect(normalizeRole('administrador')).toBe('Administrador');
      expect(normalizeRole('ADMIN')).toBe('Administrador');
      expect(normalizeRole('admin')).toBe('Administrador');

      // Gerente de Construcción
      expect(normalizeRole('Gerente de Construcción')).toBe('Gerente de Construcción');
      expect(normalizeRole('gerente_construccion')).toBe('Gerente de Construcción');
      expect(normalizeRole('gerente')).toBe('Gerente de Construcción');

      // Recursos Humanos / Reclutamiento (incluyendo la variante de db.json 'RRHH / Reclutamiento')
      expect(normalizeRole('Recursos Humanos / Reclutamiento')).toBe('Recursos Humanos / Reclutamiento');
      expect(normalizeRole('RRHH / Reclutamiento')).toBe('Recursos Humanos / Reclutamiento');
      expect(normalizeRole('rrhh')).toBe('Recursos Humanos / Reclutamiento');
      expect(normalizeRole('rrhh / reclutamiento')).toBe('Recursos Humanos / Reclutamiento');

      // Entrevistador
      expect(normalizeRole('Entrevistador')).toBe('Entrevistador');
      expect(normalizeRole('Entrevistador Técnico')).toBe('Entrevistador');
      expect(normalizeRole('entrevistador')).toBe('Entrevistador');
      expect(normalizeRole('entrevistador tecnico')).toBe('Entrevistador');

      // Cliente
      expect(normalizeRole('Cliente')).toBe('Cliente');
      expect(normalizeRole('cliente')).toBe('Cliente');
      expect(normalizeRole('CLIENTE')).toBe('Cliente');

      // Proveedor
      expect(normalizeRole('Proveedor')).toBe('Proveedor');
      expect(normalizeRole('proveedor')).toBe('Proveedor');
    });

    it('asigna la ruta de destino coherente por rol evitando 403 por redirección errónea', () => {
      expect(getDefaultRouteForRole('Administrador')).toBe('dashboard');
      expect(getDefaultRouteForRole('Gerente de Construcción')).toBe('proyectos');
      expect(getDefaultRouteForRole('Recursos Humanos / Reclutamiento')).toBe('postulantes');
      expect(getDefaultRouteForRole('RRHH / Reclutamiento')).toBe('postulantes');
      expect(getDefaultRouteForRole('Entrevistador')).toBe('entrevistas');
      expect(getDefaultRouteForRole('Entrevistador Técnico')).toBe('entrevistas');
      expect(getDefaultRouteForRole('Cliente')).toBe('portal-cliente');
      expect(getDefaultRouteForRole('Proveedor')).toBe('proveedores');
    });
  });

  // =========================================================================
  // 2. AISLAMIENTO DE PERMISOS (hasPermission)
  // =========================================================================
  describe('2. Aislamiento Estricto de Permisos (hasPermission)', () => {
    it('ADMINISTRADOR: posee acceso global a todos los módulos', () => {
      const adminUser = { id: 'USR-001', rol: 'Administrador', nombre: 'Admin' };
      expect(hasPermission(adminUser, 'dashboard')).toBe(true);
      expect(hasPermission(adminUser, 'proyectos')).toBe(true);
      expect(hasPermission(adminUser, 'usuarios-roles')).toBe(true);
      expect(hasPermission(adminUser, 'presupuestos')).toBe(true);
      expect(hasPermission(adminUser, 'compras')).toBe(true);
    });

    it('CLIENTE: tiene acceso al Portal Cliente y sus proyectos, pero recibe 403 en Dashboard, Proyectos y Usuarios', () => {
      const clientUser = { id: 'CLI-001', rol: 'Cliente', nombre: 'Roberto Garza' };
      // Módulos permitidos
      expect(hasPermission(clientUser, 'portal-cliente')).toBe(true);
      expect(hasPermission(clientUser, 'mis-proyectos')).toBe(true);
      expect(hasPermission(clientUser, 'solicitudes-clientes')).toBe(true);

      // Módulos restringidos (deben denegar acceso para que PrivateRoutes arroje 403 legítimo)
      expect(hasPermission(clientUser, 'dashboard')).toBe(false);
      expect(hasPermission(clientUser, 'proyectos')).toBe(false);
      expect(hasPermission(clientUser, 'usuarios-roles')).toBe(false);
      expect(hasPermission(clientUser, 'compras')).toBe(false);
    });

    it('GERENTE DE CONSTRUCCIÓN: accede a proyectos y cronograma, pero no a gestión de usuarios ni roles', () => {
      const gerenteUser = { id: 'USR-002', rol: 'Gerente de Construcción' };
      expect(hasPermission(gerenteUser, 'proyectos')).toBe(true);
      expect(hasPermission(gerenteUser, 'cronograma')).toBe(true);
      expect(hasPermission(gerenteUser, 'dashboard')).toBe(true);

      expect(hasPermission(gerenteUser, 'usuarios-roles')).toBe(false);
      expect(hasPermission(gerenteUser, 'roles')).toBe(false);
    });

    it('RRHH / RECLUTAMIENTO: accede a postulantes y entrevistas, pero no a finanzas ni administración de usuarios', () => {
      // Usando el rol literal como aparece en db.json
      const rrhhUser = { id: 'USR-003', rol: 'RRHH / Reclutamiento' };
      expect(hasPermission(rrhhUser, 'postulantes')).toBe(true);
      expect(hasPermission(rrhhUser, 'entrevistas')).toBe(true);
      expect(hasPermission(rrhhUser, 'empleados')).toBe(true);

      expect(hasPermission(rrhhUser, 'presupuestos')).toBe(false);
      expect(hasPermission(rrhhUser, 'usuarios-roles')).toBe(false);
      expect(hasPermission(rrhhUser, 'roles')).toBe(false);
    });

    it('ENTREVISTADOR TÉCNICO: accede a entrevistas y postulantes, pero no a compras ni proveedores', () => {
      const entrevistadorUser = { id: 'USR-004', rol: 'Entrevistador' };
      expect(hasPermission(entrevistadorUser, 'entrevistas')).toBe(true);
      expect(hasPermission(entrevistadorUser, 'postulantes')).toBe(true);

      expect(hasPermission(entrevistadorUser, 'compras')).toBe(false);
      expect(hasPermission(entrevistadorUser, 'proveedores')).toBe(false);
      expect(hasPermission(entrevistadorUser, 'presupuestos')).toBe(false);
    });

    it('USUARIO NO AUTENTICADO: deniega el acceso a todos los módulos protegidos', () => {
      expect(hasPermission(null, 'dashboard')).toBe(false);
      expect(hasPermission(null, 'portal-cliente')).toBe(false);
      expect(hasPermission(undefined, 'proyectos')).toBe(false);
      expect(hasPermission({}, 'usuarios-roles')).toBe(false);
    });
  });

  // =========================================================================
  // 3. AUTENTICACIÓN CON TODAS LAS CUENTAS OFICIALES
  // =========================================================================
  describe('3. Login y Conservación de Rol con Cuentas Existentes', () => {
    it('inicia sesión como ADMINISTRADOR y genera sesión válida con rol y destino correcto', () => {
      const res = dataService.login('admin@constructa.com', 'Admin2026!');
      expect(res.ok).toBe(true);
      expect(res.usuario).toBeDefined();
      expect(res.usuario.rol).toBe('Administrador');
      expect(getDefaultRouteForRole(res.usuario)).toBe('dashboard');
      expect(hasPermission(res.usuario, 'dashboard')).toBe(true);
    });

    it('inicia sesión como CLIENTE y genera sesión válida con destino a portal-cliente sin 403', () => {
      const res = dataService.login('cliente@constructa.com', 'Cliente2026!');
      expect(res.ok).toBe(true);
      expect(res.usuario).toBeDefined();
      expect(res.usuario.rol).toBe('Cliente');
      // La ruta correcta para Cliente es portal-cliente
      const targetRoute = getDefaultRouteForRole(res.usuario);
      expect(targetRoute).toBe('portal-cliente');
      expect(hasPermission(res.usuario, targetRoute)).toBe(true);
      // Confirma que si intentara entrar a dashboard recibiría 403
      expect(hasPermission(res.usuario, 'dashboard')).toBe(false);
    });

    it('inicia sesión como GERENTE DE CONSTRUCCIÓN y normaliza rol y permisos de proyectos', () => {
      const res = dataService.login('gerente@constructa.com', 'Gerente2026!');
      expect(res.ok).toBe(true);
      expect(res.usuario).toBeDefined();
      expect(res.usuario.rol).toBe('Gerente de Construcción');
      const targetRoute = getDefaultRouteForRole(res.usuario);
      expect(targetRoute).toBe('proyectos');
      expect(hasPermission(res.usuario, targetRoute)).toBe(true);
    });

    it('inicia sesión como RRHH / RECLUTAMIENTO resolviendo inconsistencia de rol y permisos', () => {
      const res = dataService.login('rrhh@constructa.com', 'RRHH2026!');
      expect(res.ok).toBe(true);
      expect(res.usuario).toBeDefined();
      const targetRoute = getDefaultRouteForRole(res.usuario);
      expect(targetRoute).toBe('postulantes');
      // No debe recibir 403 en su área de destino
      expect(hasPermission(res.usuario, targetRoute)).toBe(true);
      expect(hasPermission(res.usuario, 'entrevistas')).toBe(true);
    });

    it('inicia sesión como ENTREVISTADOR con ruta inicial de entrevistas', () => {
      const res = dataService.login('entrevistador@constructa.com', 'Entrevista2026!');
      expect(res.ok).toBe(true);
      expect(res.usuario).toBeDefined();
      expect(res.usuario.rol).toBe('Entrevistador');
      const targetRoute = getDefaultRouteForRole(res.usuario);
      expect(targetRoute).toBe('entrevistas');
      expect(hasPermission(res.usuario, targetRoute)).toBe(true);
    });

    it('rechaza credenciales erróneas devolviendo error explícito sin crear sesión', () => {
      const res = dataService.login('admin@constructa.com', 'ClaveEquivocada!');
      expect(res.ok).toBe(false);
      expect(res.usuario).toBeUndefined();
      expect(dataService.getCurrentUser()).toBeNull();
    });
  });

  // =========================================================================
  // 4. CREACIÓN DE NUEVA CUENTA, PERSISTENCIA, LOGOUT Y LOGIN
  // =========================================================================
  describe('4. Ciclo Completo de Creación de Nueva Cuenta, Logout y Login', () => {
    it('crea un usuario nuevo, cierra sesión, inicia sesión con la nueva cuenta y comprueba permisos y 403', async () => {
      const uniqueSuffix = Date.now();
      const newUserData = {
        nombre: 'Ing. Sofia Valverde',
        email: `sofia.${uniqueSuffix}@constructa.com`,
        usuario: `sofia.${uniqueSuffix}@constructa.com`,
        clave: 'Sofia2026!',
        password: 'Sofia2026!',
        rol: 'Gerente de Construcción',
        activo: true
      };

      global.fetch = vi.fn().mockImplementation((url, options) => {
        if (url.includes('/api/users') && options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              ok: true,
              user: { ...newUserData, id: `USR-${uniqueSuffix}` }
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      });

      // 1. Crear y persistir usuario nuevo mediante userService
      const saveRes = await userService.saveUser(newUserData);
      expect(saveRes.ok).toBe(true);
      expect(saveRes.user).toBeDefined();
      expect(saveRes.user.rol).toBe('Gerente de Construcción');

      // 2. Simular logout explícito
      dataService.logout();
      expect(dataService.getCurrentUser()).toBeNull();

      // 3. Iniciar sesión con la cuenta recién creada
      const loginRes = dataService.login(newUserData.email, newUserData.password);
      expect(loginRes.ok).toBe(true);
      expect(loginRes.usuario.email).toBe(newUserData.email);
      expect(loginRes.usuario.rol).toBe('Gerente de Construcción');

      // 4. Comprobar ruta de destino de la nueva cuenta
      const targetRoute = getDefaultRouteForRole(loginRes.usuario);
      expect(targetRoute).toBe('proyectos');

      // 5. Comprobar permiso aprobado en su área
      expect(hasPermission(loginRes.usuario, targetRoute)).toBe(true);
      expect(hasPermission(loginRes.usuario, 'cronograma')).toBe(true);

      // 6. Comprobar aislamiento de permisos (403 correcto en módulos restringidos)
      expect(hasPermission(loginRes.usuario, 'usuarios-roles')).toBe(false);
      expect(hasPermission(loginRes.usuario, 'roles')).toBe(false);
    });
  });

  // =========================================================================
  // 5. AUDITORÍA DEL FORMULARIO DE CONTACTO Y SEGURIDAD
  // =========================================================================
  describe('5. Formulario de Contacto — Validación y Envío Seguro', () => {
    it('valida campos obligatorios y formato de correo electrónico', () => {
      renderWithProviders(<PublicContact />);

      const submitBtn = screen.getByRole('button', { name: /Enviar Mensaje/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Ingresa tu nombre o razón social/i)).toBeInTheDocument();
      expect(screen.getByText(/El correo electrónico es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/Por favor escribe el mensaje o requerimiento/i)).toBeInTheDocument();
    });

    it('envía los datos al endpoint /api/contact del servidor sin exponer credenciales en frontend', async () => {
      let capturedBody = null;
      global.fetch = vi.fn().mockImplementation((url, options) => {
        if (url === '/api/contact' && options?.method === 'POST') {
          capturedBody = JSON.parse(options.body);
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              ok: true,
              requestId: 'SOL-TEST-001',
              message: 'Solicitud registrada'
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      renderWithProviders(<PublicContact />);

      const nameInput = screen.getByPlaceholderText(/Rodrigo Salazar/i);
      const emailInput = screen.getByPlaceholderText(/rodrigo\.salazar@empresa\.com/i);
      const msgInput = screen.getByPlaceholderText(/Detalles del proyecto/i);
      const submitBtn = screen.getByRole('button', { name: /Enviar Mensaje/i });

      fireEvent.change(nameInput, { target: { value: 'Arq. Mariana Soto' } });
      fireEvent.change(emailInput, { target: { value: 'mariana.soto@constructora.cr' } });
      fireEvent.change(msgInput, { target: { value: 'Solicito cotización técnica para proyecto en Escazú de 800m2.' } });

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Mensaje enviado correctamente/i)).toBeInTheDocument();
      });

      expect(capturedBody).toBeDefined();
      expect(capturedBody.nombre).toBe('Arq. Mariana Soto');
      expect(capturedBody.email).toBe('mariana.soto@constructora.cr');
      expect(capturedBody.mensaje).toContain('Escazú');
    });

    it('protege contra bots y spam mediante campo trampa honeypot', async () => {
      global.fetch = vi.fn().mockImplementation((url) => {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      renderWithProviders(<PublicContact />);

      const nameInput = screen.getByPlaceholderText(/Rodrigo Salazar/i);
      const emailInput = screen.getByPlaceholderText(/rodrigo\.salazar@empresa\.com/i);
      const msgInput = screen.getByPlaceholderText(/Detalles del proyecto/i);
      const submitBtn = screen.getByRole('button', { name: /Enviar Mensaje/i });

      fireEvent.change(nameInput, { target: { value: 'Spam Bot' } });
      fireEvent.change(emailInput, { target: { value: 'bot@spam.com' } });
      fireEvent.change(msgInput, { target: { value: 'Mensaje de spam automático' } });

      // Llenar el campo trampa honeypot
      const honeypotInput = document.querySelector('input[name="website"]');
      if (honeypotInput) {
        fireEvent.change(honeypotInput, { target: { value: 'http://spam-link.com' } });
      }

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Mensaje enviado correctamente/i)).toBeInTheDocument();
      });

      // No debe llamar al backend /api/contact cuando el honeypot está lleno
      const contactCalls = global.fetch.mock.calls.filter(([url]) => url === '/api/contact');
      expect(contactCalls.length).toBe(0);
    });
  });
});
