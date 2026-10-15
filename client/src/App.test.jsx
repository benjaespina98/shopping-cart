import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { authAPI } from './services/api';

vi.mock('./services/api', () => ({
  authAPI: { login: vi.fn(), logout: vi.fn(), me: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const renderApp = (initialPath) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

describe('App — ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // Regresión: no había ningún test que confirmara que /admin/* está realmente protegido
  // del lado del cliente (más allá de que el backend también lo exija).
  it('sin sesión (el server responde 401), redirige de una ruta admin al login', async () => {
    authAPI.me.mockRejectedValue({ response: { status: 401 } });

    renderApp('/admin/dashboard');

    expect(await screen.findByText('Ingresá a tu cuenta')).toBeInTheDocument();
    expect(authAPI.me).toHaveBeenCalled();
  });

  it('con sesión válida en el server, deja pasar a una ruta admin sin redirigir al login', async () => {
    authAPI.me.mockResolvedValue({
      data: { _id: '1', name: 'Admin', email: 'admin@playaysol.com.ar', role: 'admin' },
    });

    renderApp('/admin/sitio');

    // El sidebar del panel es lo primero que monta ProtectedRoute al dejar pasar — no hace
    // falta esperar a que AdminSite termine de pedir sus datos para confirmar que no fuimos
    // al login.
    expect(await screen.findByText('Proyectos')).toBeInTheDocument();
    expect(screen.queryByText('Ingresá a tu cuenta')).not.toBeInTheDocument();
  });

  it('un token viejo en localStorage no alcanza: la sesión la decide el server', async () => {
    localStorage.setItem('admin_token', 'token-viejo');
    localStorage.setItem('admin_user', JSON.stringify({ _id: '1', email: 'admin@playaysol.com.ar' }));
    authAPI.me.mockRejectedValue({ response: { status: 401 } });

    renderApp('/admin/dashboard');

    expect(await screen.findByText('Ingresá a tu cuenta')).toBeInTheDocument();
  });
});
