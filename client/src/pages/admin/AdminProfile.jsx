import { useState } from 'react';
import { FiUser, FiLock, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';

export default function AdminProfile() {
  const { user } = useAuth();
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    if (pwForm.next.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
      toast.success('Contraseña actualizada correctamente');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  const PwInput = ({ field, placeholder }) => (
    <div style={{ position: 'relative' }}>
      <input
        type={showPw[field] ? 'text' : 'password'}
        placeholder={placeholder}
        value={pwForm[field]}
        onChange={e => setPwForm(prev => ({ ...prev, [field]: e.target.value }))}
        className="input"
        style={{ paddingRight: 40 }}
        required
      />
      <button
        type="button"
        onClick={() => setShowPw(prev => ({ ...prev, [field]: !prev[field] }))}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                 background: 'none', border: 'none', cursor: 'pointer', color: '#9AA5AA', padding: 2 }}
      >
        {showPw[field] ? <FiEyeOff size={15} /> : <FiEye size={15} />}
      </button>
    </div>
  );

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Mi perfil</h1>
        <p className="text-slate-500 text-sm">Información de la cuenta administradora.</p>
      </div>

      {/* Profile card */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
             style={{ background: '#244B5A', border: '3px solid #BCD6DD' }}>
          {initials}
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-lg">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize"
                style={{ background: '#F1F7F9', color: '#244B5A', border: '1px solid #BCD6DD' }}>
            <FiUser size={10} /> {user?.role || 'admin'}
          </span>
        </div>
      </div>

      {/* Change password */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FiLock size={16} style={{ color: '#244B5A' }} />
          Cambiar contraseña
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="label">Contraseña actual</label>
            <PwInput field="current" placeholder="Tu contraseña actual" />
          </div>
          <div>
            <label className="label">Nueva contraseña</label>
            <PwInput field="next" placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label className="label">Confirmar nueva contraseña</label>
            <PwInput field="confirm" placeholder="Repetí la nueva contraseña" />
          </div>
          <div className="pt-1">
            <button
              type="submit"
              disabled={saving || !pwForm.current || !pwForm.next || !pwForm.confirm}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: 14, padding: '10px 20px' }}
            >
              {saving ? 'Guardando...' : <><FiCheck size={15} /> Actualizar contraseña</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
