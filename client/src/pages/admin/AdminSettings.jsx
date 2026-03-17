import { useEffect, useState } from 'react';
import { FiSave, FiPlus, FiTrash2, FiUsers, FiClock, FiMail, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { settingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const defaultSettings = {
  contactEmail: 'benjaespina98@gmail.com',
  whatsappNumber: '5493534224607',
  phoneNumberDisplay: '3534224607',
  phoneNumberLink: 'tel:+543534224607',
  businessHours: [
    { day: 'Lunes a Viernes', hours: '9:00 - 18:00' },
    { day: 'Sabados', hours: '9:00 - 13:00' },
    { day: 'Domingos', hours: 'Cerrado' },
  ],
};

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(defaultSettings);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, usersRes] = await Promise.all([
        settingsAPI.getAdmin(),
        settingsAPI.getUsers(),
      ]);

      const data = settingsRes.data || {};

      setSettings({
        contactEmail: data.contactEmail || defaultSettings.contactEmail,
        whatsappNumber: data.whatsappNumber || defaultSettings.whatsappNumber,
        phoneNumberDisplay: data.phoneNumberDisplay || defaultSettings.phoneNumberDisplay,
        phoneNumberLink: data.phoneNumberLink || defaultSettings.phoneNumberLink,
        businessHours: Array.isArray(data.businessHours) && data.businessHours.length > 0
          ? data.businessHours
          : defaultSettings.businessHours,
      });
      setUsers(usersRes.data || []);
    } catch {
      toast.error('No se pudo cargar la configuracion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        businessHours: settings.businessHours.filter((row) => row.day.trim() && row.hours.trim()),
      };
      const { data } = await settingsAPI.updateAdmin(payload);
      setSettings(data.settings);
      toast.success('Configuracion guardada');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo guardar la configuracion');
    } finally {
      setSaving(false);
    }
  };

  const addHourRow = () => {
    setSettings((prev) => ({
      ...prev,
      businessHours: [...prev.businessHours, { day: '', hours: '' }],
    }));
  };

  const removeHourRow = (index) => {
    setSettings((prev) => ({
      ...prev,
      businessHours: prev.businessHours.filter((_, i) => i !== index),
    }));
  };

  const updateHourRow = (index, field, value) => {
    setSettings((prev) => ({
      ...prev,
      businessHours: prev.businessHours.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      await settingsAPI.createUser(newUser);
      setNewUser({ name: '', email: '', password: '' });
      toast.success('Usuario creado correctamente');
      const { data } = await settingsAPI.getUsers();
      setUsers(data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo crear el usuario');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Eliminar este usuario administrador?')) return;

    try {
      await settingsAPI.deleteUser(id);
      setUsers((prev) => prev.filter((item) => item._id !== id));
      toast.success('Usuario eliminado');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo eliminar el usuario');
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Configuracion</h1>
        <p className="text-slate-500 text-sm mb-8">Ajustes generales del negocio y administradores.</p>
        <div className="card p-6 animate-pulse h-48" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Configuracion</h1>
        <p className="text-slate-500 text-sm">Edita datos de contacto, horarios y usuarios administradores.</p>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FiMail size={16} />
          Datos de contacto
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Email de contacto</label>
            <input
              className="input"
              value={settings.contactEmail}
              onChange={(e) => setSettings((prev) => ({ ...prev, contactEmail: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Numero de WhatsApp (internacional)</label>
            <input
              className="input"
              value={settings.whatsappNumber}
              onChange={(e) => setSettings((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
              placeholder="549..."
            />
          </div>
          <div>
            <label className="label">Telefono visible</label>
            <input
              className="input"
              value={settings.phoneNumberDisplay}
              onChange={(e) => setSettings((prev) => ({ ...prev, phoneNumberDisplay: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Link de telefono</label>
            <input
              className="input"
              value={settings.phoneNumberLink}
              onChange={(e) => setSettings((prev) => ({ ...prev, phoneNumberLink: e.target.value }))}
              placeholder="tel:+54..."
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FiClock size={16} />
          Horarios
        </h2>
        <div className="space-y-3">
          {settings.businessHours.map((row, index) => (
            <div key={`${index}-${row.day}`} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
              <input
                className="input"
                value={row.day}
                placeholder="Dia"
                onChange={(e) => updateHourRow(index, 'day', e.target.value)}
              />
              <input
                className="input"
                value={row.hours}
                placeholder="Horario"
                onChange={(e) => updateHourRow(index, 'hours', e.target.value)}
              />
              <button
                type="button"
                className="btn-ghost text-red-500 hover:bg-red-50"
                onClick={() => removeHourRow(index)}
                aria-label="Eliminar horario"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addHourRow} className="btn-secondary inline-flex items-center gap-2">
            <FiPlus size={16} />
            Agregar horario
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <FiUsers size={16} />
            Usuarios administradores
          </h2>
          <span className="text-xs text-slate-500">{users.length} usuario(s)</span>
        </div>

        <div className="space-y-2 mb-5">
          {users.map((item) => (
            <div key={item._id} className="border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                <p className="text-xs text-slate-500 truncate">{item.email}</p>
              </div>
              <button
                type="button"
                className="btn-ghost text-red-500 hover:bg-red-50"
                disabled={item._id === user?._id}
                onClick={() => handleDeleteUser(item._id)}
                title={item._id === user?._id ? 'No podes eliminar tu usuario en sesion' : 'Eliminar usuario'}
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleCreateUser} className="grid sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="label">Nombre</label>
            <input
              className="input"
              required
              value={newUser.name}
              onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Contrasena temporal</label>
            <input
              className="input"
              type="password"
              minLength={6}
              required
              value={newUser.password}
              onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" disabled={creatingUser} className="btn-primary inline-flex items-center gap-2">
              <FiPlus size={16} />
              {creatingUser ? 'Creando...' : 'Crear usuario admin'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="btn-primary inline-flex items-center gap-2"
        >
          <FiSave size={16} />
          {saving ? 'Guardando...' : 'Guardar configuracion'}
        </button>
      </div>
    </div>
  );
}
