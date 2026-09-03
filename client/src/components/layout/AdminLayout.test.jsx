import { describe, it, expect, vi } from 'vitest';
import { Suspense, lazy } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { AuthProvider } from '../../context/AuthContext';

vi.mock('../../services/api', () => ({
  authAPI: { login: vi.fn(), me: vi.fn().mockResolvedValue({ data: null }) },
}));

// Nunca resuelve — simula una sección del panel cuyo chunk todavía no terminó de bajar.
const SeccionQueNuncaCarga = lazy(() => new Promise(() => {}));

// Regresión: cada sección del panel (Outlet) es un lazy() en App.jsx. Sin un Suspense
// alrededor del Outlet DENTRO de AdminLayout, el que atrapaba esa suspensión era el que
// envuelve a AdminLayout entero en App.jsx — así que cambiar de sección desmontaba todo
// el layout (sidebar incluida) y tapaba la pantalla con el spinner de carga inicial en
// vez de solo mostrar un loader en el contenido.
describe('AdminLayout — Suspense boundary', () => {
  it('mantiene la sidebar montada aunque la sección todavía esté cargando su chunk', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin/seccion-lenta']}>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="seccion-lenta" element={<SeccionQueNuncaCarga />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // La sidebar (nav + logout) tiene que estar visible ya, sin esperar a que la sección
    // termine de cargar — si el Suspense estuviera mal ubicado, esto no aparecería nunca
    // porque todo AdminLayout quedaría desmontado.
    expect(await screen.findByText('Cerrar sesión')).toBeInTheDocument();
    expect(screen.getByText('Panel admin')).toBeInTheDocument();
  });
});
