import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const isAdminPath = (pathname) => pathname === '/admin' || pathname.startsWith('/admin/');

// Antes el token y el usuario se guardaban en localStorage (legible por cualquier script de la
// página). Ahora la sesión es una cookie httpOnly que el JavaScript no puede leer, así que el
// cliente ya no guarda nada: pregunta al server (GET /api/auth/me) quién es. Estas claves viejas
// se borran una vez para no dejar un token huérfano en el navegador de quien ya tenía sesión.
const LEGACY_KEYS = ['admin_token', 'admin_user'];

export function AuthProvider({ children }) {
  const { pathname } = useLocation();
  const [user, setUser] = useState(null);
  // `checked`: ya se le preguntó al server por la sesión (haya o no usuario).
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch {
      // localStorage puede no estar disponible (modo privado, bloqueado): no es un error.
    }
  }, []);

  const inAdmin = isAdminPath(pathname);

  // La sesión se consulta recién al entrar al panel: un visitante del sitio público no genera
  // ningún pedido de autenticación (ni el 401 que devolvería).
  useEffect(() => {
    if (!inAdmin || checked) return undefined;

    let cancelled = false;
    Promise.resolve()
      .then(() => authAPI.me())
      .then(({ data }) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [inAdmin, checked]);

  // Mientras se verifica la sesión en una ruta del panel, ProtectedRoute espera en vez de
  // mandar al login.
  const loading = inAdmin && !checked;

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    // El server deja la cookie; el cuerpo trae solo los datos del usuario (sin token).
    setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
    setChecked(true);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Si el server no responde igual se cierra la sesión local: la cookie vence sola.
    }
    setUser(null);
    setChecked(true);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
