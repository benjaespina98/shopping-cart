import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import { AuthProvider } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

vi.mock('../../services/api', () => ({
  authAPI: { login: vi.fn(), logout: vi.fn(), me: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/admin/login']}>
      <AuthProvider>
        <AdminLogin />
      </AuthProvider>
    </MemoryRouter>
  );

// Los placeholders no son etiquetas: desaparecen al escribir y los lectores de pantalla no
// siempre los anuncian. Cada campo tiene que tener un <label> asociado (htmlFor/id).
describe('AdminLogin — etiquetas de los campos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authAPI.me.mockRejectedValue({ response: { status: 401 } });
  });

  it('el email tiene un <label> asociado y conserva el placeholder', () => {
    renderLogin();

    const input = screen.getByLabelText('EMAIL');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'admin@ejemplo.com');
    expect(input.labels).toHaveLength(1);
    expect(input.labels[0]).toHaveAttribute('for', input.id);
    expect(input.id).toBeTruthy();
  });

  it('la contraseña tiene un <label> asociado y conserva el placeholder', () => {
    renderLogin();

    const input = screen.getByLabelText('CONTRASEÑA');
    expect(input).toHaveAttribute('placeholder', '••••••••');
    expect(input.labels).toHaveLength(1);
    expect(input.labels[0]).toHaveAttribute('for', input.id);
  });

  it('el nombre accesible sale de la etiqueta, no del placeholder', () => {
    renderLogin();

    expect(screen.getByRole('textbox', { name: 'EMAIL' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'admin@ejemplo.com' })).not.toBeInTheDocument();
  });

  it('los ids de los campos son distintos entre sí', () => {
    renderLogin();

    expect(screen.getByLabelText('EMAIL').id).not.toBe(screen.getByLabelText('CONTRASEÑA').id);
  });

  it('el botón de mostrar contraseña tiene nombre y no cambia el nombre del campo', async () => {
    const user = userEvent.setup();
    renderLogin();

    const toggle = screen.getByRole('button', { name: 'Mostrar contraseña' });
    await user.click(toggle);

    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('CONTRASEÑA')).toHaveAttribute('type', 'text');
  });

  it('hay un único h1 con el título de la página', () => {
    renderLogin();
    expect(screen.getByRole('heading', { level: 1, name: 'Ingresá a tu cuenta' })).toBeInTheDocument();
  });
});
