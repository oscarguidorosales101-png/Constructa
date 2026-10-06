import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserModal from '../../pages/UsersRoles/UserModal.jsx';

const mockShowAlert = vi.fn();
const mockConsultarHacienda = vi.fn();

vi.mock('../../context/ConstructaContext.jsx', () => ({
  useConstructa: () => ({
    showAlert: mockShowAlert,
    consultarHacienda: mockConsultarHacienda,
  }),
}));

describe('Componente UserModal', () => {
  const mockRoles = [
    { id: 'ROL-001', nombre: 'Administrador General' },
    { id: 'ROL-002', nombre: 'Gerente de Construcción' },
    { id: 'ROL-004', nombre: 'Entrevistador' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Renderiza los campos del modal de creación de usuario', () => {
    render(
      <UserModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        roles={mockRoles}
      />
    );

    expect(screen.getByText('Registrar Nuevo Usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/109990888/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Consultar Hacienda/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre \/ Razón Social/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico Corporativo \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rol Asignado \*/i)).toBeInTheDocument();
  });

  it('2. Ejecuta consulta de Hacienda, muestra estado loading y autocompleta nombre y tipo', async () => {
    mockConsultarHacienda.mockResolvedValue({
      ok: true,
      identificacion: '109990888',
      nombre: 'CARLOS ALBERTO SOLIS MONGE',
      tipoDescripcion: 'Cédula Física',
    });

    render(
      <UserModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        roles={mockRoles}
      />
    );

    const idInput = screen.getByPlaceholderText(/109990888/i);
    fireEvent.change(idInput, { target: { value: '109990888', name: 'identificacion' } });

    const btnHacienda = screen.getByRole('button', { name: /Consultar Hacienda/i });
    fireEvent.click(btnHacienda);

    await waitFor(() => {
      expect(mockConsultarHacienda).toHaveBeenCalledWith('109990888');
      const nameInput = screen.getByLabelText(/Nombre \/ Razón Social/i);
      expect(nameInput.value).toBe('CARLOS ALBERTO');
      expect(screen.getByText(/Identificado en Hacienda/i)).toBeInTheDocument();
    });
  });

  it('3. Valida campos obligatorios al intentar guardar sin llenar datos', () => {
    const onSave = vi.fn();
    render(
      <UserModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
        roles={mockRoles}
      />
    );

    const saveBtn = screen.getByRole('button', { name: /Crear Usuario/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText(/El nombre o razón social es obligatorio/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('4. Guarda el usuario exitosamente con los datos verificados', async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    render(
      <UserModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
        roles={mockRoles}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/109990888/i), {
      target: { value: '109990888', name: 'identificacion' }
    });
    fireEvent.change(screen.getByLabelText(/Nombre \/ Razón Social/i), {
      target: { value: 'Esteban', name: 'nombre' }
    });
    fireEvent.change(screen.getByLabelText(/Apellidos/i), {
      target: { value: 'Vargas Soto', name: 'apellidos' }
    });
    fireEvent.change(screen.getByLabelText(/Correo Electrónico Corporativo \*/i), {
      target: { value: 'esteban.vargas@constructa.com', name: 'email' }
    });
    fireEvent.change(screen.getByLabelText(/Rol Asignado \*/i), {
      target: { value: 'Entrevistador', name: 'rol' }
    });
    fireEvent.change(screen.getByLabelText(/Contraseña de Acceso \*/i), {
      target: { value: 'PasswordSeguro123', name: 'clave' }
    });

    const saveBtn = screen.getByRole('button', { name: /Crear Usuario/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Esteban',
          apellidos: 'Vargas Soto',
          email: 'esteban.vargas@constructa.com',
          rol: 'Entrevistador'
        })
      );
    });
  });
});
