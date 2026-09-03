import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminSettings from './AdminSettings';
import { AuthProvider } from '../../context/AuthContext';
import { authAPI, settingsAPI } from '../../services/api';

vi.mock('../../services/api', () => ({
  authAPI: { login: vi.fn(), me: vi.fn() },
  settingsAPI: {
    getAdmin: vi.fn(),
    getUsers: vi.fn(),
    changeOwnPassword: vi.fn(),
  },
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('qrcode', () => ({ default: { toDataURL: vi.fn() } }));

import { toast } from 'react-toastify';
import QRCode from 'qrcode';

const renderPage = () =>
  render(
    <AuthProvider>
      <AdminSettings />
    </AuthProvider>
  );

describe('AdminSettings — cambiar mi contraseña', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    settingsAPI.getAdmin.mockResolvedValue({ data: {} });
    settingsAPI.getUsers.mockResolvedValue({ data: [] });
    // El afterEach global corre vi.restoreAllMocks(), que borra el resolvedValue de este
    // mock (creado dentro del factory de vi.mock) después de cada test — hay que
    // re-armarlo acá en vez de una sola vez arriba.
    QRCode.toDataURL.mockResolvedValue('data:image/png;base64,x');
  });

  it('el formulario está oculto hasta hacer click en "Cambiar mi contraseña"', async () => {
    renderPage();
    await screen.findByText('Configuración');

    expect(screen.queryByLabelText('Contraseña actual')).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /cambiar mi contraseña/i }));

    expect(screen.getByLabelText('Contraseña actual')).toBeInTheDocument();
  });

  it('rechaza en el cliente si la confirmación no coincide, sin llamar a la API', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Configuración');
    await user.click(screen.getByRole('button', { name: /cambiar mi contraseña/i }));

    await user.type(screen.getByLabelText('Contraseña actual'), 'ActualPass1');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'NuevaPass1');
    await user.type(screen.getByLabelText('Confirmar nueva'), 'OtraCosa1');
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    expect(toast.error).toHaveBeenCalledWith('La nueva contraseña y su confirmación no coinciden');
    expect(settingsAPI.changeOwnPassword).not.toHaveBeenCalled();
  });

  it('con datos válidos, llama a la API, avisa el éxito y cierra el formulario', async () => {
    const user = userEvent.setup();
    settingsAPI.changeOwnPassword.mockResolvedValue({});
    renderPage();
    await screen.findByText('Configuración');
    await user.click(screen.getByRole('button', { name: /cambiar mi contraseña/i }));

    await user.type(screen.getByLabelText('Contraseña actual'), 'ActualPass1');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'NuevaPass1');
    await user.type(screen.getByLabelText('Confirmar nueva'), 'NuevaPass1');
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => expect(settingsAPI.changeOwnPassword).toHaveBeenCalledWith({
      currentPassword: 'ActualPass1',
      newPassword: 'NuevaPass1',
    }));
    expect(toast.success).toHaveBeenCalledWith('Contraseña actualizada correctamente');
    // El formulario se cierra y limpia después de guardar.
    await waitFor(() => expect(screen.queryByLabelText('Contraseña actual')).not.toBeInTheDocument());
  });

  it('si el server rechaza la contraseña actual, muestra el error y deja el formulario abierto para reintentar', async () => {
    const user = userEvent.setup();
    settingsAPI.changeOwnPassword.mockRejectedValue({ response: { data: { message: 'La contraseña actual es incorrecta' } } });
    renderPage();
    await screen.findByText('Configuración');
    await user.click(screen.getByRole('button', { name: /cambiar mi contraseña/i }));

    await user.type(screen.getByLabelText('Contraseña actual'), 'Mal1234');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'NuevaPass1');
    await user.type(screen.getByLabelText('Confirmar nueva'), 'NuevaPass1');
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('La contraseña actual es incorrecta'));
    // Sigue visible para que el admin pueda corregir y reintentar, no se limpió.
    expect(screen.getByLabelText('Contraseña actual')).toBeInTheDocument();
  });
});
