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
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: 'linear-gradient(160deg, #122B33 0%, #193A45 60%, #244B5A 100%)' }}>

      {/* Background decoration */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320,
                      borderRadius: '50%', background: 'rgba(255,197,38,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240,
                      borderRadius: '50%', background: 'rgba(125,211,252,0.06)' }} />
      </div>

      <div className="w-full max-w-sm relative">

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4"
               style={{ background: '#fff', borderRadius: 12, padding: '14px 22px' }}>
            <img src="/brand/logo-stacked.png" alt="Playa y Sol" style={{ height: 64, width: 'auto', display: 'block' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'Mulish, sans-serif' }}>
            Panel de administración
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7 shadow-2xl"
             style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.1)' }}>

          <div className="flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-5"
               style={{ background: 'rgba(255,197,38,0.15)', border: '1px solid rgba(255,197,38,0.3)' }}>
            <FiLock size={20} style={{ color: '#FFC629' }} />
          </div>

          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 17,
                       color: '#fff', textAlign: 'center', marginBottom: 20 }}>
            Ingresá a tu cuenta
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, fontFamily: 'Poppins, sans-serif',
                              color: 'rgba(255,255,255,0.65)', marginBottom: 6, letterSpacing: '0.03em' }}>
                EMAIL
              </label>
              <div style={{ position: 'relative' }}>
                <FiMail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                                           color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  placeholder="admin@ejemplo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  style={{ width: '100%', paddingLeft: 38, paddingRight: 14, height: 42,
                           background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                           borderRadius: 10, color: '#fff', fontSize: 14, fontFamily: 'Mulish, sans-serif',
                           outline: 'none', boxSizing: 'border-box',
                           transition: 'border-color 140ms ease, background 140ms ease' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(255,197,38,0.6)'; e.target.style.background = 'rgba(255,255,255,0.10)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.07)'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, fontFamily: 'Poppins, sans-serif',
                              color: 'rgba(255,255,255,0.65)', marginBottom: 6, letterSpacing: '0.03em' }}>
                CONTRASEÑA
              </label>
              <div style={{ position: 'relative' }}>
                <FiLock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                                           color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ width: '100%', paddingLeft: 38, paddingRight: 40, height: 42,
                           background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                           borderRadius: 10, color: '#fff', fontSize: 14, fontFamily: 'Mulish, sans-serif',
                           outline: 'none', boxSizing: 'border-box',
                           transition: 'border-color 140ms ease, background 140ms ease' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(255,197,38,0.6)'; e.target.style.background = 'rgba(255,255,255,0.10)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.07)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                           background: 'none', border: 'none', cursor: 'pointer',
                           color: 'rgba(255,255,255,0.4)', padding: 2 }}
                >
                  {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: 6, height: 44, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                       background: loading ? 'rgba(33,76,90,0.5)' : '#244B5A',
                       color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14,
                       transition: 'background 140ms ease, transform 120ms ease',
                       opacity: loading ? 0.7 : 1 }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#193A45'; }}
              onMouseLeave={e => { if (!loading) e.target.style.background = '#244B5A'; }}
            >
              {loading ? 'Ingresando...' : 'Ingresar al panel'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12,
                    color: 'rgba(255,255,255,0.3)', fontFamily: 'Mulish, sans-serif' }}>
          © {new Date().getFullYear()} Playa y Sol Piscinas
        </p>
      </div>
    </div>
  );
}
