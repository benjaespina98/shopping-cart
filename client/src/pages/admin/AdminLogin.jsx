import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit login', form);
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1 mb-2">
            <span className="text-3xl font-extrabold text-brand">Playa</span>
            <span className="text-3xl font-extrabold text-neutral-50">y Sol</span>
          </div>
          <p className="text-neutral-300 text-sm">Panel de administración</p>
        </div>

        {/* Card */}
        <div className="bg-neutral-900 rounded-2xl p-8 shadow-2xl border border-neutral-800">
          <div className="flex items-center justify-center w-14 h-14 logo-sun mx-auto mb-6">
            <FiLock size={24} className="text-[#C98F06]" />
          </div>
          <h1 className="text-xl font-bold text-neutral-50 text-center mb-6">Ingresá a tu cuenta</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-200 mb-1.5">Email</label>
              <div className="relative">
                <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  className="w-full bg-neutral-800 border border-neutral-700 text-neutral-50 rounded-xl pl-10 pr-4 py-2.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent placeholder-neutral-400"
                  placeholder="admin@mitienda.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-200 mb-1.5">Contraseña</label>
              <div className="relative">
                <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full bg-neutral-800 border border-neutral-700 text-neutral-50 rounded-xl pl-10 pr-10 py-2.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent placeholder-neutral-400"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-100"
                >
                  {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary mt-2"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
