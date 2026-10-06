import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Login } from '../../pages/Login/Login.jsx';

// Mock del contexto
const mockLogin = vi.fn();
const mockShowAlert = vi.fn();

vi.mock('../../context/ConstructaContext.jsx', () => ({
  useConstructa: () => ({
    login: mockLogin,
    showAlert: mockShowAlert,
  }),
}));

describe('Componente Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('1. Renderiza correctamente los campos de usuario y contraseña', () => {
    render(<Login onLoginSuccess={vi.fn()} />);

    expect(screen.getByLabelText(/Usuario o Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña de Acceso/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ingresar al Sistema/i })).toBeInTheDocument();
  });

  it('2. Valida campos vacíos antes de enviar el formulario', () => {
    render(<Login onLoginSuccess={vi.fn()} />);

    const idInput = screen.getByLabelText(/Usuario o Correo Electrónico/i);
    const passInput = screen.getByLabelText(/Contraseña de Acceso/i);

    fireEvent.change(idInput, { target: { value: '' } });
    fireEvent.change(passInput, { target: { value: '' } });

    const submitBtn = screen.getByRole('button', { name: /Ingresar al Sistema/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Ingresa tu usuario o correo electrónico corporativo/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('3. Inicia sesión exitosamente y ejecuta onLoginSuccess con usuario válido', async () => {
    const onLoginSuccess = vi.fn();
    mockLogin.mockReturnValue({
      ok: true,
      usuario: { id: 'USR-001', nombre: 'Ing. Fernando Mendoza', rol: 'Administrador General' }
    });

    render(<Login onLoginSuccess={onLoginSuccess} />);

    const idInput = screen.getByLabelText(/Usuario o Correo Electrónico/i);
    const passInput = screen.getByLabelText(/Contraseña de Acceso/i);

    fireEvent.change(idInput, { target: { value: 'admin@constructa.com' } });
    fireEvent.change(passInput, { target: { value: 'admin' } });

    const submitBtn = screen.getByRole('button', { name: /Ingresar al Sistema/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@constructa.com', 'admin');
      expect(onLoginSuccess).toHaveBeenCalled();
    });
  });

  it('4. Maneja rechazo de autenticación para cuenta desactivada o credencial errónea', async () => {
    mockLogin.mockReturnValue({
      ok: false,
      mensaje: 'Esta cuenta ha sido desactivada por la administración de CONSTRUCTA.'
    });

    render(<Login onLoginSuccess={vi.fn()} />);

    const idInput = screen.getByLabelText(/Usuario o Correo Electrónico/i);
    const passInput = screen.getByLabelText(/Contraseña de Acceso/i);

    fireEvent.change(idInput, { target: { value: 'inactivo@constructa.com' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });

    const submitBtn = screen.getByRole('button', { name: /Ingresar al Sistema/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('inactivo@constructa.com', 'password123');
    });
  });
});
