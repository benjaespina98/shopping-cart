import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import AdminLogs from './AdminLogs';
import { logsAPI } from '../../services/api';

vi.mock('../../services/api', () => ({
  logsAPI: { getAll: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn() } }));

describe('AdminLogs — filtros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logsAPI.getAll.mockResolvedValue({ data: { logs: [], pages: 1, total: 0 } });
  });

  // Regresión: los <select> de acción/entidad son la única forma de filtrar por esos
  // campos (la búsqueda de texto no los incluye) — tienen que coincidir letra por letra
  // con lo que graban los controllers, o el filtro "encuentra" cero resultados siempre.
  // 'PASSWORD_CHANGED' estaba mal escrito (el server graba 'ADMIN_PASSWORD_CHANGED') y
  // faltaba la entidad 'quote' junto con sus acciones.
  it('el filtro de acción usa el nombre real que graba el server para el cambio de contraseña', async () => {
    render(<AdminLogs />);
    await screen.findByText(/registro\(s\) encontrados/);

    const actionSelect = screen.getAllByRole('combobox')[1];
    expect(within(actionSelect).getByRole('option', { name: 'ADMIN_PASSWORD_CHANGED' })).toBeInTheDocument();
    expect(within(actionSelect).queryByRole('option', { name: 'PASSWORD_CHANGED' })).not.toBeInTheDocument();
  });

  it('el filtro de entidad incluye "quote" y sus acciones están en el de acción', async () => {
    render(<AdminLogs />);
    await screen.findByText(/registro\(s\) encontrados/);

    const [entitySelect, actionSelect] = screen.getAllByRole('combobox');
    expect(within(entitySelect).getByRole('option', { name: 'Entidad: quote' })).toBeInTheDocument();
    expect(within(actionSelect).getByRole('option', { name: 'QUOTE_REQUEST_CREATED' })).toBeInTheDocument();
    expect(within(actionSelect).getByRole('option', { name: 'QUOTE_STATUS_UPDATED' })).toBeInTheDocument();
    expect(within(actionSelect).getByRole('option', { name: 'ORDER_DELETED' })).toBeInTheDocument();
  });
});
