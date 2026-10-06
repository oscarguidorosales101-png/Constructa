import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClientRegister from '../../pages/Auth/ClientRegister.jsx';
import haciendaService from '../../services/haciendaService.js';

const mockRegisterClient = vi.fn();
const mockVerifyClientAccount = vi.fn();
const mockShowAlert = vi.fn();

vi.mock('../../context/ConstructaContext.jsx', () => ({
  useConstructa: () => ({
    registerClient: mockRegisterClient,
    verifyClientAccount: mockVerifyClientAccount,
    showAlert: mockShowAlert,
  }),
}));

vi.mock('../../services/haciendaService.js', () => ({
  default: {
    consultar: vi.fn(),
  },
}));

describe('Componente ClientRegister con Hacienda CR', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Renderiza formulario de registro de cliente con consulta a Hacienda', () => {
    render(<ClientRegister onNavigate={vi.fn()} />);

    expect(screen.getByText('Registro de Cuenta Cliente')).toBeInTheDocument();
    expect(screen.getByLabelText(/Identificación \/ Cédula/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Consultar Hacienda/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre Completo o Razón Social/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
  });

  it('2. Consulta Hacienda y autocompleta nombre del cliente', async () => {
    haciendaService.consultar.mockResolvedValue({
      ok: true,
      data: {
        identificacion: '109870654',
        nombre: 'ROBERTO SOLIS CHAVES',
        tipoIdentificacion: 'Física',
      },
    });

    render(<ClientRegister onNavigate={vi.fn()} />);

    const idInput = screen.getByLabelText(/Identificación \/ Cédula/i);
    fireEvent.change(idInput, { target: { value: '109870654' } });

    const btnHacienda = screen.getByRole('button', { name: /Consultar Hacienda/i });
    fireEvent.click(btnHacienda);

    await waitFor(() => {
      expect(haciendaService.consultar).toHaveBeenCalledWith('109870654');
      const nameInput = screen.getByLabelText(/Nombre Completo o Razón Social/i);
      expect(nameInput.value).toBe('ROBERTO SOLIS CHAVES');
      expect(screen.getByText(/Verificado en Hacienda/i)).toBeInTheDocument();
    });
  });

  it('3. Realiza registro exitoso y pasa al paso de verificación', async () => {
    mockRegisterClient.mockResolvedValue({
      ok: true,
      cliente: {
        id: 'CLI-006',
        nombre: 'Roberto Solís Chaves',
        email: 'roberto@solis.cr',
        codigoVerificacion: '749201'
      }
    });

    render(<ClientRegister onNavigate={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Nombre Completo o Razón Social/i), {
      target: { value: 'Roberto Solís Chaves' }
    });
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
      target: { value: 'roberto@solis.cr' }
    });
    fireEvent.change(screen.getByLabelText(/Teléfono \/ WhatsApp/i), {
      target: { value: '8888-9999' }
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), {
      target: { value: 'PasswordSeguro2026!' }
    });
    fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), {
      target: { value: 'PasswordSeguro2026!' }
    });

    // Checkbox términos
    const termsCheck = screen.getByRole('checkbox');
    fireEvent.click(termsCheck);

    const submitBtn = screen.getByRole('button', { name: /Crear Cuenta y Continuar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockRegisterClient).toHaveBeenCalled();
      expect(screen.getByText(/Verificación de Cuenta/i)).toBeInTheDocument();
      expect(screen.getByText(/749201/i)).toBeInTheDocument();
    });
  });

  it('4. Muestra error si el correo ya existe en el sistema', async () => {
    mockRegisterClient.mockResolvedValue({
      ok: false,
      error: 'Este correo ya está registrado.',
      code: 'DUPLICATE_EMAIL'
    });

    render(<ClientRegister onNavigate={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Nombre Completo o Razón Social/i), {
      target: { value: 'Roberto Solís' }
    });
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
      target: { value: 'cliente@constructa.com' }
    });
    fireEvent.change(screen.getByLabelText(/Teléfono \/ WhatsApp/i), {
      target: { value: '8888-9999' }
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), {
      target: { value: 'PasswordSeguro2026!' }
    });
    fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), {
      target: { value: 'PasswordSeguro2026!' }
    });

    fireEvent.click(screen.getByRole('checkbox'));

    const submitBtn = screen.getByRole('button', { name: /Crear Cuenta y Continuar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Este correo ya está registrado/i)).toBeInTheDocument();
    });
  });
});
