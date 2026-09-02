import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage, luego revalidarla contra el backend: el token puede
  // haber sido revocado, expirado o pertenecer a un usuario que ya no existe, y localStorage
  // por sí solo no nos entera de eso. Se usa el usuario cacheado como estado inicial (evita el
  // parpadeo a "no logueado" mientras responde el servidor) y se corrige o limpia según /auth/me.
  useEffect(() => {
    const stored = localStorage.getItem('admin_user');
    const token = localStorage.getItem('admin_token');

    if (!stored || !token) {
      setLoading(false);
      return;
    }

    try {
      setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setLoading(false);
      return;
    }

    // El usuario cacheado ya alcanza para que ProtectedRoute deje pasar (no bloqueamos la
    // navegación esperando la red); la revalidación contra /auth/me sigue en segundo plano
    // y se autocorrige si el token resulta inválido.
    setLoading(false);

    authAPI
      .me()
      .then(({ data }) => {
        localStorage.setItem('admin_user', JSON.stringify(data));
        setUser(data);
      })
      .catch(() => {
        // El interceptor de la API ya limpia localStorage y redirige en un 401;
        // acá solo nos aseguramos de que el estado en memoria quede consistente.
        setUser(null);
      });
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('admin_user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
    setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
