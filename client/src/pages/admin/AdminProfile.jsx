import { useAuth } from '../../context/AuthContext';

export default function AdminProfile() {
  const { user } = useAuth();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Mi perfil</h1>
      <p className="text-slate-500 text-sm mb-8">Información de la cuenta administradora.</p>

      {/* Info card */}
      <div className="card p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white text-xl font-bold">
          {user?.name?.[0]?.toUpperCase() ?? 'A'}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="inline-block mt-1 text-xs font-medium bg-brand/10 text-brand px-2 py-0.5 rounded-full capitalize">
            {user?.role}
          </span>
        </div>
      </div>
    </div>
  );
}
