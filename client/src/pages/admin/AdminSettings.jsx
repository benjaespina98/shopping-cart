import { useEffect, useState } from 'react';
import { FiSave, FiPlus, FiTrash2, FiUsers, FiClock, FiMail, FiPhone, FiUserMinus, FiDownload, FiLink } from 'react-icons/fi';
import { toast } from 'react-toastify';
import QRCode from 'qrcode';
import { settingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const defaultSettings = {
  contactEmail: 'benjaespina98@gmail.com',
  whatsappNumber: '5493534224605',
  phoneNumberDisplay: '3534224605',
  phoneNumberLink: 'tel:+543534224605',
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
  const [siteUrl, setSiteUrl] = useState(typeof window !== 'undefined' ? window.location.origin : '');
  const [qrDataUrl, setQrDataUrl] = useState('');

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

  useEffect(() => {
    if (!siteUrl) return;
    QRCode.toDataURL(siteUrl, {
      width: 280,
      margin: 1,
      color: { dark: '#214C5A', light: '#FFFFFF' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [siteUrl]);

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'playa-y-sol-qr.png';
    link.click();
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        businessHours: settings.businessHours.filter((row) => row.day.trim() && row.hours.trim()),
      };
      const { data } = await settingsAPI.updateAdmin(payload);
      setSettings(data.settings);
      toast.success('Configuración guardada');
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
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Configuración</h1>
        <p className="text-slate-500 text-sm mb-8">Ajustes generales del negocio y administradores.</p>
        <div className="card p-6 animate-pulse h-48" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Configuración</h1>
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
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                     style={{ background: '#214C5A' }}>
                  {item.name?.[0]?.toUpperCase() ?? 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500 truncate">{item.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                      style={{ background: '#F1F7F9', color: '#214C5A' }}>
                  {item.role || 'admin'}
                </span>
                {item._id !== user?._id && (
                  <button
                    onClick={() => handleDeleteUser(item._id)}
                    title="Eliminar usuario"
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <FiUserMinus size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
          <FiLink size={16} />
          Código QR del sitio
        </h2>
        <p className="text-slate-500 text-sm mb-4">
          Generá un QR que redirige directamente a tu web. Ideal para tarjetas, carteles o el local.
        </p>
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shrink-0">
            {qrDataUrl
              ? <img src={qrDataUrl} alt="Código QR del sitio" width={160} height={160} />
              : <div className="w-[160px] h-[160px] flex items-center justify-center text-slate-300 text-xs">Generando...</div>}
          </div>
          <div className="flex-1 flex flex-col gap-3 w-full">
            <div>
              <label className="label">URL de destino</label>
              <input
                className="input"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://playaysol.com.ar"
              />
              <p className="text-xs text-slate-400 mt-1">
                Por defecto apunta al dominio desde el que estás accediendo al panel. Cambialo si tu dominio público es distinto.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadQr}
              disabled={!qrDataUrl}
              className="btn-secondary inline-flex items-center gap-2 self-start disabled:opacity-50"
            >
              <FiDownload size={15} /> Descargar QR (PNG)
            </button>
          </div>
        </div>
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
