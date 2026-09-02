import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { authAPI } from './services/api';

vi.mock('./services/api', () => ({
  authAPI: { login: vi.fn(), me: vi.fn() },
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
  });

  // Regresión: no había ningún test que confirmara que /admin/* está realmente protegido
  // del lado del cliente (más allá de que el backend también lo exija).
  it('sin sesión, redirige de una ruta admin al login en vez de mostrar el panel', async () => {
    renderApp('/admin/dashboard');

    expect(await screen.findByText('Ingresá a tu cuenta')).toBeInTheDocument();
  });

  it('con sesión guardada, deja pasar a una ruta admin sin redirigir al login', async () => {
    localStorage.setItem('admin_token', 'token-valido');
    localStorage.setItem(
      'admin_user',
      JSON.stringify({ _id: '1', name: 'Admin', email: 'admin@playaysol.com.ar', role: 'admin' })
    );
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
});
