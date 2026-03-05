import { useEffect, useRef, useState } from 'react';
import { FiMail, FiPhone, FiMessageCircle, FiInstagram, FiFacebook } from 'react-icons/fi';
import { toast } from 'react-toastify';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5493534224607';
const PHONE_DISPLAY = '3534224607';
const PHONE_LINK = 'tel:+543534224607';
const CONTACT_EMAIL = 'benjaespina98@gmail.com';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sendingChannel, setSendingChannel] = useState('');
  const sentTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (sentTimeoutRef.current) {
        clearTimeout(sentTimeoutRef.current);
      }
    };
  }, []);

  const resetFormWithFeedback = (channel) => {
    setSendingChannel(channel);
    if (sentTimeoutRef.current) clearTimeout(sentTimeoutRef.current);
    sentTimeoutRef.current = setTimeout(() => setSendingChannel(''), 3500);
    setForm({ name: '', email: '', message: '' });
  };

  const getTextMessage = () =>
    `Hola! Soy ${form.name}${form.email ? ` (${form.email})` : ''}.\n\n${form.message}`;

  const validateForm = () => {
    if (!form.name.trim() || !form.message.trim()) {
      toast.error('Completá nombre y mensaje para continuar.');
      return false;
    }
    return true;
  };

  const handleWhatsApp = () => {
    if (!validateForm()) return;

    const text = getTextMessage();
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    const popup = window.open('', '_blank', 'noopener,noreferrer');

    if (popup && !popup.closed) {
      popup.location.href = whatsappUrl;
    } else {
      window.location.href = whatsappUrl;
    }

    resetFormWithFeedback('whatsapp');
  };

  const handleEmail = () => {
    if (!validateForm()) return;

    const subject = `Consulta desde web - ${form.name}`;
    const body = getTextMessage();
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    resetFormWithFeedback('email');
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <span className="section-eyebrow">Contacto</span>
        <h1 className="section-title mb-3">Contactanos</h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          ¿Tenés alguna consulta? Escribinos y te respondemos a la brevedad.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Contact info */}
        <div className="space-y-6">
          <div className="card p-6 space-y-5">
            <h2 className="font-semibold text-slate-800 text-lg">Información de contacto</h2>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 group"
            >
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <FiMessageCircle size={20} className="text-green-500 group-hover:text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">WhatsApp</p>
                <p className="text-sm font-semibold text-slate-700 group-hover:text-green-600 transition-colors">
                  {PHONE_DISPLAY}
                </p>
              </div>
            </a>

            <a href={PHONE_LINK} className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center group-hover:bg-brand transition-colors">
                <FiPhone size={19} className="text-brand group-hover:text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Teléfono</p>
                <p className="text-sm font-semibold text-slate-700 group-hover:text-brand transition-colors">
                  {PHONE_DISPLAY}
                </p>
              </div>
            </a>

            <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center group-hover:bg-brand transition-colors">
                <FiMail size={19} className="text-brand group-hover:text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Email</p>
                <p className="text-sm font-semibold text-slate-700 group-hover:text-brand transition-colors">
                  {CONTACT_EMAIL}
                </p>
              </div>
            </a>
          </div>

          {/* Horario */}
          <div className="card p-6">
            <h2 className="font-semibold text-slate-800 text-lg mb-4">Horarios de atención</h2>
            <div className="space-y-2 text-sm">
              {[
                ['Lunes a Viernes', '9:00 – 18:00'],
                ['Sábados', '9:00 – 13:00'],
                ['Domingos', 'Cerrado'],
              ].map(([day, hours]) => (
                <div key={day} className="flex justify-between text-slate-600">
                  <span className="font-medium">{day}</span>
                  <span className={hours === 'Cerrado' ? 'text-slate-400' : 'text-brand font-semibold'}>{hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="card p-6">
            <h2 className="font-semibold text-slate-800 text-lg mb-4">Redes sociales</h2>
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-brand hover:text-brand transition-colors text-sm font-medium text-slate-600">
                <FiInstagram size={16} /> Instagram
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-brand hover:text-brand transition-colors text-sm font-medium text-slate-600">
                <FiFacebook size={16} /> Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card p-6 sm:p-8 border-slate-200">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-800 text-lg">Envianos tu consulta</h2>
            <p className="text-sm text-slate-500 mt-1">
              Elegí el canal que prefieras. Preparamos el mensaje automáticamente con tus datos.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors active:scale-95"
            >
              <FiMessageCircle size={16} />
              {sendingChannel === 'whatsapp' ? '¡Listo! Abriendo WhatsApp...' : 'Enviar por WhatsApp'}
            </button>
            <button
              type="button"
              onClick={handleEmail}
              className="w-full flex items-center justify-center gap-2 bg-brand text-white font-semibold py-3 rounded-xl hover:bg-brand-dark transition-colors active:scale-95"
            >
              <FiMail size={16} />
              {sendingChannel === 'email' ? '¡Listo! Abriendo email...' : 'Enviar por Email'}
            </button>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="label">Nombre *</label>
              <input
                className="input"
                placeholder="Tu nombre completo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Email (opcional)</label>
              <input
                type="email"
                className="input"
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Mensaje *</label>
              <textarea
                className="input resize-none"
                rows={5}
                placeholder="¿En qué te podemos ayudar?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}
