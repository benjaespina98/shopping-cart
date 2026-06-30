import { FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function AdminProfile() {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

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
    </div>
  );
}
