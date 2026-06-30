import { useEffect, useState, useRef } from 'react';
import { FiSave, FiPlus, FiTrash2, FiUsers, FiClock, FiMail, FiUserMinus, FiDownload, FiLink, FiDroplet, FiImage, FiUpload, FiCheckCircle, FiX, FiEye, FiEyeOff, FiCheck, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-toastify';
import QRCode from 'qrcode';
import { settingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const defaultSettings = {
  theme: 'default',
  contactEmail: 'piscinas@playaysol.com.ar',
  whatsappNumber: '5493534224605',
  phoneNumberDisplay: '3534224605',
  phoneNumberLink: 'tel:+543534224605',
  secondaryContactLabel: 'Ventas y presupuestos',
  secondaryContactWhatsapp: '5493535668994',
  contactPhotoUrl: '',
  aboutPhotoUrl: '',
  businessHours: [
    { day: 'Lunes a Viernes', hours: '9:00 - 18:00' },
    { day: 'Sábados', hours: '9:00 - 13:00' },
    { day: 'Domingos', hours: 'Cerrado' },
  ],
};

const THEMES = [
  {
    value: 'default',
    label: 'Default',
    hint: 'Arena cálida · bordes medios · sensación acogedora.',
    bgPage: '#FBF9F5',
    bgCard: '#FFFFFF',
    radius: 14,
    pilRadius: 999,
    shadow: '0 4px 12px rgba(18,43,51,0.13)',
  },
  {
    value: 'elegante',
    label: 'Elegante',
    hint: 'Fondo blanco puro · líneas rectas · aire premium/corporativo.',
    bgPage: '#FFFFFF',
    bgCard: '#FAFBFC',
    radius: 7,
    pilRadius: 4,
    shadow: '0 1px 5px rgba(18,43,51,0.07)',
  },
  {
    value: 'moderno',
    label: 'Moderno',
    hint: 'Fondo azul-agua suave · formas muy redondeadas · sensación fresca.',
    bgPage: '#EEF5F7',
    bgCard: '#FFFFFF',
    radius: 20,
    pilRadius: 999,
    shadow: '0 8px 22px rgba(18,43,51,0.14)',
  },
];

// Miniatura fiel del sitio con diferencias de tema claramente visibles
function ThemePreviewCard({ t }) {
  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #E0E5E7', width: '100%' }}>
      {/* Mini header */}
      <div style={{ background: '#244B5A', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 44, height: 7, borderRadius: 3, background: 'rgba(255,198,41,0.9)' }} />
        <div style={{ flex: 1 }} />
        <div style={{ width: 26, height: 7, borderRadius: t.pilRadius > 10 ? 99 : 3, background: '#FFC629' }} />
      </div>
      {/* Mini hero */}
      <div style={{ background: '#1C3D49', padding: '10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ height: 7, width: '70%', borderRadius: 2, background: 'rgba(255,255,255,0.85)' }} />
        <div style={{ height: 5, width: '90%', borderRadius: 2, background: 'rgba(255,255,255,0.35)' }} />
        <div style={{ height: 5, width: '75%', borderRadius: 2, background: 'rgba(255,255,255,0.35)', marginBottom: 3 }} />
        <div style={{ display: 'inline-block', alignSelf: 'flex-start', background: '#FFC629', color: '#122B33',
                      fontSize: 7, fontWeight: 700, padding: '3px 9px', borderRadius: t.pilRadius > 10 ? 99 : 3 }}>
          Solicitar presupuesto
        </div>
      </div>
      {/* Mini página */}
      <div style={{ background: t.bgPage, padding: '10px 10px 12px' }}>
        <div style={{ height: 5, width: '45%', borderRadius: 2, background: '#946A0B', marginBottom: 6 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ background: t.bgCard, borderRadius: t.radius, boxShadow: t.shadow,
                                  border: '1px solid #E0E5E7', padding: '7px 8px' }}>
              <div style={{ height: 5, width: '60%', borderRadius: 2, background: '#244B5A', marginBottom: 3 }} />
              <div style={{ height: 3, width: '85%', borderRadius: 2, background: '#C7CFD2', marginBottom: 2 }} />
              <div style={{ height: 3, width: '65%', borderRadius: 2, background: '#C7CFD2', marginBottom: 6 }} />
              <div style={{ height: 3, width: 36, borderRadius: t.pilRadius > 10 ? 99 : 2,
                            background: 'rgba(36,75,90,0.2)', border: '1px solid #244B5A' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(defaultSettings);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedPopup, setSavedPopup] = useState(false);
  const [uploadingContactPhoto, setUploadingContactPhoto] = useState(false);
  const [uploadingAboutPhoto, setUploadingAboutPhoto] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [siteUrl, setSiteUrl] = useState(typeof window !== 'undefined' ? window.location.origin : '');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const contactPhotoInputRef = useRef();
  const aboutPhotoInputRef = useRef();

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, usersRes] = await Promise.all([
        settingsAPI.getAdmin(),
        settingsAPI.getUsers(),
      ]);

      const data = settingsRes.data || {};

      setSettings({
        theme: THEMES.some((t) => t.value === data.theme) ? data.theme : defaultSettings.theme,
        contactEmail: data.contactEmail || defaultSettings.contactEmail,
        whatsappNumber: data.whatsappNumber || defaultSettings.whatsappNumber,
        phoneNumberDisplay: data.phoneNumberDisplay || defaultSettings.phoneNumberDisplay,
        phoneNumberLink: data.phoneNumberLink || defaultSettings.phoneNumberLink,
        secondaryContactLabel: data.secondaryContactLabel ?? defaultSettings.secondaryContactLabel,
        secondaryContactWhatsapp: data.secondaryContactWhatsapp ?? defaultSettings.secondaryContactWhatsapp,
        contactPhotoUrl: data.contactPhotoUrl || '',
        aboutPhotoUrl: data.aboutPhotoUrl || '',
        businessHours: Array.isArray(data.businessHours) && data.businessHours.length > 0
          ? data.businessHours
          : defaultSettings.businessHours,
      });
      setUsers(usersRes.data || []);
    } catch {
      toast.error('No se pudo cargar la configuración');
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
      color: { dark: '#244B5A', light: '#FFFFFF' },
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
      setSettings((prev) => ({ ...prev, ...data.settings }));
      setSavedPopup(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleContactPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingContactPhoto(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await settingsAPI.uploadContactPhoto(fd);
      setSettings((prev) => ({ ...prev, contactPhotoUrl: data.settings.contactPhotoUrl }));
      toast.success('Foto de contacto actualizada');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo subir la foto');
    } finally {
      setUploadingContactPhoto(false);
      if (contactPhotoInputRef.current) contactPhotoInputRef.current.value = '';
    }
  };

  const handleAboutPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAboutPhoto(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await settingsAPI.uploadAboutPhoto(fd);
      setSettings((prev) => ({ ...prev, aboutPhotoUrl: data.settings.aboutPhotoUrl }));
      toast.success('Foto de Nosotros actualizada');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo subir la foto');
    } finally {
      setUploadingAboutPhoto(false);
      if (aboutPhotoInputRef.current) aboutPhotoInputRef.current.value = '';
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
        <div className="flex items-start justify-between gap-4 mb-1">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <FiDroplet size={16} />
            Personalización
          </h2>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-primary-700 hover:text-primary-700 transition-colors flex-shrink-0"
          >
            <FiExternalLink size={12} /> Ver sitio
          </a>
        </div>
        <p className="text-slate-500 text-sm mb-4">
          Elegí el estilo del sitio público. Los colores de marca y la tipografía no cambian. Guardá para aplicar el cambio.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {THEMES.map((t) => {
            const active = settings.theme === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, theme: t.value }))}
                className={`text-left p-3 rounded-xl border-2 transition-all ${active ? 'border-primary-700 bg-primary-50/40 shadow-sm' : 'border-slate-200 hover:border-primary-300 hover:shadow-sm'}`}
              >
                <div className="mb-3">
                  <ThemePreviewCard t={t} />
                </div>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  {t.label}
                  {active && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-primary-700 text-white">
                      <FiCheck size={10} /> Activo
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-1">{t.hint}</p>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Hacé click en <strong>"Guardar configuración"</strong> al final para aplicar el cambio en el sitio, luego abrí <strong>"Ver sitio"</strong> arriba para comprobarlo.
        </p>
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
            <label className="label">Numero de WhatsApp principal (internacional)</label>
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
          <div>
            <label className="label">Etiqueta del contacto secundario (opcional)</label>
            <input
              className="input"
              value={settings.secondaryContactLabel}
              onChange={(e) => setSettings((prev) => ({ ...prev, secondaryContactLabel: e.target.value }))}
              placeholder="Ej: Ventas y presupuestos"
            />
          </div>
          <div>
            <label className="label">WhatsApp del contacto secundario (opcional)</label>
            <input
              className="input"
              value={settings.secondaryContactWhatsapp}
              onChange={(e) => setSettings((prev) => ({ ...prev, secondaryContactWhatsapp: e.target.value }))}
              placeholder="549... (dejar vacío para no mostrarlo)"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
          <FiImage size={16} />
          Fotos del sitio
        </h2>
        <p className="text-slate-500 text-sm mb-4">
          Se actualizan al instante, no hace falta tocar "Guardar configuración".
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="flex items-start gap-4">
            <label className="flex-shrink-0 cursor-pointer">
              <div className="w-32 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary-700 flex flex-col items-center justify-center text-slate-400 hover:text-primary-700 transition-colors overflow-hidden">
                {settings.contactPhotoUrl
                  ? <img src={settings.contactPhotoUrl} alt="" className="w-full h-full object-cover" />
                  : <><FiImage size={20} /><span className="text-xs mt-1">Elegir foto</span></>}
              </div>
              <input type="file" accept="image/*" className="hidden" ref={contactPhotoInputRef} onChange={handleContactPhotoChange} />
            </label>
            <div className="flex flex-col gap-2 min-w-0">
              <p className="text-sm font-semibold text-slate-700">Foto de Contacto</p>
              <p className="text-xs text-slate-400">Hoy no se muestra ninguna en <strong>/contacto</strong> — subí una si querés activarla.</p>
              <button
                type="button"
                onClick={() => contactPhotoInputRef.current?.click()}
                disabled={uploadingContactPhoto}
                className="btn-secondary inline-flex items-center gap-2 self-start disabled:opacity-50 text-xs"
              >
                <FiUpload size={13} /> {uploadingContactPhoto ? 'Subiendo...' : settings.contactPhotoUrl ? 'Cambiar' : 'Subir'}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <label className="flex-shrink-0 cursor-pointer">
              <div className="w-32 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary-700 flex flex-col items-center justify-center text-slate-400 hover:text-primary-700 transition-colors overflow-hidden">
                {settings.aboutPhotoUrl
                  ? <img src={settings.aboutPhotoUrl} alt="" className="w-full h-full object-cover" />
                  : <><FiImage size={20} /><span className="text-xs mt-1">Elegir foto</span></>}
              </div>
              <input type="file" accept="image/*" className="hidden" ref={aboutPhotoInputRef} onChange={handleAboutPhotoChange} />
            </label>
            <div className="flex flex-col gap-2 min-w-0">
              <p className="text-sm font-semibold text-slate-700">Foto de Nosotros</p>
              <p className="text-xs text-slate-400">Aparece grande en <strong>/nosotros</strong> (ej. una foto familiar o del equipo).</p>
              <button
                type="button"
                onClick={() => aboutPhotoInputRef.current?.click()}
                disabled={uploadingAboutPhoto}
                className="btn-secondary inline-flex items-center gap-2 self-start disabled:opacity-50 text-xs"
              >
                <FiUpload size={13} /> {uploadingAboutPhoto ? 'Subiendo...' : settings.aboutPhotoUrl ? 'Cambiar' : 'Subir'}
              </button>
            </div>
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
                     style={{ background: '#244B5A' }}>
                  {item.name?.[0]?.toUpperCase() ?? 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500 truncate">{item.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                      style={{ background: '#F1F7F9', color: '#244B5A' }}>
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

        <form onSubmit={handleCreateUser} className="border-t border-slate-100 pt-4 grid sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="label">Nombre</label>
            <input
              className="input"
              required
              value={newUser.name}
              onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre y apellido"
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
              placeholder="nombre@playaysol.com.ar"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newUser.password}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={creatingUser}
              className="btn-primary inline-flex items-center gap-2 shrink-0 disabled:opacity-50"
              style={{ marginBottom: 1 }}
            >
              <FiPlus size={16} />
              {creatingUser ? 'Creando...' : 'Agregar'}
            </button>
          </div>
        </form>
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
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>

      {/* Popup de confirmación al guardar */}
      {savedPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(18,43,51,0.45)' }}
             onClick={() => setSavedPopup(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#DCF3E8' }}>
              <FiCheckCircle size={28} style={{ color: '#2E9E6B' }} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">¡Listo!</h3>
            <p className="text-sm text-slate-500 mb-5">Los cambios ya se aplicaron al sitio público.</p>
            <button onClick={() => setSavedPopup(false)} className="btn-primary w-full inline-flex items-center justify-center gap-2">
              <FiX size={15} /> Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
