import { useState } from 'react';
import { FiMail, FiPhone, FiMessageCircle, FiInstagram, FiFacebook, FiSend } from 'react-icons/fi';

const WHATSAPP_NUMBER = '5491112345678'; // Change in .env and here

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleWhatsApp = (e) => {
    e.preventDefault();
    const text = `Hola! Soy ${form.name}${form.email ? ` (${form.email})` : ''}.\n\n${form.message}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Contactanos</h1>
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
                  +54 9 11 1234-5678
                </p>
              </div>
            </a>

            <a href="tel:+5491112345678" className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center group-hover:bg-brand transition-colors">
                <FiPhone size={19} className="text-brand group-hover:text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Teléfono</p>
                <p className="text-sm font-semibold text-slate-700 group-hover:text-brand transition-colors">
                  +54 9 11 1234-5678
                </p>
              </div>
            </a>

            <a href="mailto:info@mitienda.com" className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center group-hover:bg-brand transition-colors">
                <FiMail size={19} className="text-brand group-hover:text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Email</p>
                <p className="text-sm font-semibold text-slate-700 group-hover:text-brand transition-colors">
                  info@mitienda.com
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
        <div className="card p-6 sm:p-8">
          <h2 className="font-semibold text-slate-800 text-lg mb-6">Envianos tu consulta</h2>
          <form onSubmit={handleWhatsApp} className="space-y-4">
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
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors active:scale-95"
            >
              <FiSend size={16} />
              {sent ? '¡Mensaje enviado!' : 'Enviar por WhatsApp'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
