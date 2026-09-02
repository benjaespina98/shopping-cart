import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authAPI } from '../services/api';

vi.mock('../services/api', () => ({
  authAPI: { login: vi.fn(), me: vi.fn() },
}));

function Consumidor() {
  const { user, loading } = useAuth();
  if (loading) return <span data-testid="estado">cargando</span>;
  return <span data-testid="estado">{user ? `logueado:${user.email}` : 'anonimo'}</span>;
}

const renderConProvider = () => render(<AuthProvider><Consumidor /></AuthProvider>);

const cachedUser = { _id: '1', name: 'Admin', email: 'admin@playaysol.com.ar', role: 'admin' };

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sin sesión guardada, arranca deslogueado sin llamar a /auth/me', async () => {
    renderConProvider();

    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('anonimo'));
    expect(authAPI.me).not.toHaveBeenCalled();
  });

  // Regresión: antes se confiaba ciegamente en localStorage sin revalidar contra el
  // servidor. Un token revocado o expirado seguía mostrando sesión iniciada en la UI.
  it('si el token guardado ya no es válido, revalida contra /auth/me y desloguea', async () => {
    localStorage.setItem('admin_token', 'token-viejo');
    localStorage.setItem('admin_user', JSON.stringify(cachedUser));
    authAPI.me.mockRejectedValue({ response: { status: 401 } });

    renderConProvider();

    // Muestra el usuario cacheado primero (evita el parpadeo a "anonimo" mientras responde el server)...
    expect(screen.getByTestId('estado')).toHaveTextContent(`logueado:${cachedUser.email}`);

    // ...pero termina deslogueado apenas /auth/me confirma que el token ya no sirve.
    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('anonimo'));
    expect(authAPI.me).toHaveBeenCalledTimes(1);
  });

  it('si el token sigue siendo válido, mantiene la sesión con los datos frescos del servidor', async () => {
    localStorage.setItem('admin_token', 'token-valido');
    localStorage.setItem('admin_user', JSON.stringify(cachedUser));
    const freshUser = { ...cachedUser, name: 'Admin Renombrado' };
    authAPI.me.mockResolvedValue({ data: freshUser });

    renderConProvider();

    await waitFor(() => expect(authAPI.me).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('estado')).toHaveTextContent(`logueado:${freshUser.email}`);
    expect(JSON.parse(localStorage.getItem('admin_user'))).toEqual(freshUser);
  });

  it('si el storage tiene datos corruptos, arranca deslogueado sin explotar', async () => {
    localStorage.setItem('admin_token', 'token');
    localStorage.setItem('admin_user', '{esto no es json');

    renderConProvider();

    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('anonimo'));
    expect(authAPI.me).not.toHaveBeenCalled();
    expect(localStorage.getItem('admin_token')).toBeNull();
  });
});
