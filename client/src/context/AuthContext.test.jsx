import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { authAPI } from '../services/api';

vi.mock('../services/api', () => ({
  authAPI: { login: vi.fn(), logout: vi.fn(), me: vi.fn() },
}));

let latest;
function Consumidor() {
  latest = useAuth();
  const { user, loading } = latest;
  if (loading) return <span data-testid="estado">cargando</span>;
  return <span data-testid="estado">{user ? `logueado:${user.email}` : 'anonimo'}</span>;
}

const renderEn = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    </MemoryRouter>
  );

const adminUser = { _id: '1', name: 'Admin', email: 'admin@playaysol.com.ar', role: 'admin' };

describe('AuthContext (sesión por cookie httpOnly)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('en el sitio público no consulta la sesión: arranca anónimo sin llamar a /auth/me', async () => {
    renderEn('/tienda');

    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('anonimo'));
    expect(authAPI.me).not.toHaveBeenCalled();
  });

  it('en el panel pregunta al server quién es (no lee ningún storage)', async () => {
    authAPI.me.mockResolvedValue({ data: adminUser });
    const getItem = vi.spyOn(Storage.prototype, 'getItem');

    renderEn('/admin/dashboard');

    expect(screen.getByTestId('estado')).toHaveTextContent('cargando');
    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent(`logueado:${adminUser.email}`));
    expect(authAPI.me).toHaveBeenCalledTimes(1);
    expect(getItem).not.toHaveBeenCalled();
    getItem.mockRestore();
  });

  it('si el server responde 401 (sin cookie o vencida), queda deslogueado', async () => {
    authAPI.me.mockRejectedValue({ response: { status: 401 } });

    renderEn('/admin/dashboard');

    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('anonimo'));
    expect(authAPI.me).toHaveBeenCalledTimes(1);
  });

  it('borra los restos de la sesión vieja en localStorage al cargar', async () => {
    localStorage.setItem('admin_token', 'token-viejo');
    localStorage.setItem('admin_user', JSON.stringify(adminUser));
    authAPI.me.mockResolvedValue({ data: adminUser });

    renderEn('/admin/dashboard');

    await waitFor(() => expect(localStorage.getItem('admin_token')).toBeNull());
    expect(localStorage.getItem('admin_user')).toBeNull();
  });

  it('login no guarda el token en ningún storage y deja al usuario logueado', async () => {
    authAPI.me.mockRejectedValue({ response: { status: 401 } });
    authAPI.login.mockResolvedValue({ data: { ...adminUser, token: 'no-deberia-venir' } });
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    renderEn('/admin/login');
    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('anonimo'));

    await act(async () => {
      await latest.login('admin@playaysol.com.ar', 'clave-larga-123');
    });

    expect(screen.getByTestId('estado')).toHaveTextContent(`logueado:${adminUser.email}`);
    expect(setItem).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
    setItem.mockRestore();
  });

  it('logout llama al endpoint y deja al usuario deslogueado', async () => {
    authAPI.me.mockResolvedValue({ data: adminUser });
    authAPI.logout.mockResolvedValue({ data: {} });

    renderEn('/admin/dashboard');
    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('logueado'));

    await act(async () => {
      await latest.logout();
    });

    expect(authAPI.logout).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('estado')).toHaveTextContent('anonimo');
  });

  it('logout cierra la sesión local aunque el server no responda', async () => {
    authAPI.me.mockResolvedValue({ data: adminUser });
    authAPI.logout.mockRejectedValue(new Error('red caída'));

    renderEn('/admin/dashboard');
    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('logueado'));

    await act(async () => {
      await latest.logout();
    });

    expect(screen.getByTestId('estado')).toHaveTextContent('anonimo');
  });
});
