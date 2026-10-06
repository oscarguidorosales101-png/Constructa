import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SupplierModal from '../../components/suppliers/SupplierModal.jsx';

const mockShowAlert = vi.fn();
const mockConsultarHacienda = vi.fn();

vi.mock('../../context/ConstructaContext.jsx', () => ({
  useConstructa: () => ({
    showAlert: mockShowAlert,
    consultarHacienda: mockConsultarHacienda,
  }),
}));

describe('Componente SupplierModal con Hacienda CR', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Renderiza formulario de proveedor con consulta a Hacienda', () => {
    const { container } = render(
      <SupplierModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText(/Nuevo Proveedor/i)).toBeInTheDocument();
    expect(container.querySelector('input[name="identificacion"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Consultar Hacienda/i })).toBeInTheDocument();
    expect(container.querySelector('input[name="nombre"]')).toBeInTheDocument();
  });

  it('2. Autocompleta razón social y tipo al consultar Hacienda con éxito', async () => {
    mockConsultarHacienda.mockResolvedValue({
      ok: true,
      identificacion: '3101456789',
      nombre: 'CEMENTOS Y AGREGADOS DEL PACIFICO S.A.',
      tipoDescripcion: 'Cédula Jurídica',
      tipoIdentificacion: '02',
    });

    const { container } = render(
      <SupplierModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const idInput = container.querySelector('input[name="identificacion"]');
    fireEvent.change(idInput, { target: { value: '3101456789', name: 'identificacion' } });

    const btnHacienda = screen.getByRole('button', { name: /Consultar Hacienda/i });
    fireEvent.click(btnHacienda);

    await waitFor(() => {
      expect(mockConsultarHacienda).toHaveBeenCalledWith('3101456789');
      const nameInput = container.querySelector('input[name="nombre"]');
      expect(nameInput.value).toBe('CEMENTOS Y AGREGADOS DEL PACIFICO S.A.');
      expect(screen.getByText(/Verificado en Hacienda/i)).toBeInTheDocument();
    });
  });

  it('3. Guarda proveedor con datos sanitizados de Hacienda', async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    const { container } = render(
      <SupplierModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );

    fireEvent.change(container.querySelector('input[name="identificacion"]'), {
      target: { value: '3101456789', name: 'identificacion' }
    });
    fireEvent.change(container.querySelector('input[name="nombre"]'), {
      target: { value: 'CEMENTOS Y AGREGADOS DEL PACIFICO S.A.', name: 'nombre' }
    });
    fireEvent.change(container.querySelector('input[name="contacto"]'), {
      target: { value: 'Carlos Mendoza', name: 'contacto' }
    });
    fireEvent.change(container.querySelector('input[name="email"]'), {
      target: { value: 'ventas@cementospacifico.cr', name: 'email' }
    });
    fireEvent.change(container.querySelector('input[name="telefono"]'), {
      target: { value: '2661-1234', name: 'telefono' }
    });

    const submitBtn = screen.getByRole('button', { name: /Registrar Proveedor/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          identificacion: '3101456789',
          nombre: 'CEMENTOS Y AGREGADOS DEL PACIFICO S.A.',
          email: 'ventas@cementospacifico.cr'
        })
      );
    });
  });
});
