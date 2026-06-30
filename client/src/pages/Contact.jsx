import { useEffect, useRef, useState } from 'react';
import { FiMail, FiPhone, FiInstagram, FiFacebook, FiClock, FiSend } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { settingsAPI } from '../services/api';
import { Button } from '../design-system/Button';
import { Card } from '../design-system/Card';
import { Input } from '../design-system/Input';
import { useReveal } from '../hooks/useReveal';

const defaultContactSettings = {
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '5493534224607',
  phoneNumberDisplay: '3534224607',
  phoneNumberLink: 'tel:+543534224607',
  contactEmail: 'benjaespina98@gmail.com',
  businessHours: [
    { day: 'Lunes a Viernes', hours: '9:00 - 18:00' },
    { day: 'Sabados', hours: '9:00 - 13:00' },
    { day: 'Domingos', hours: 'Cerrado' },
  ],
};

const CHANNELS = [
  { Icon: FaWhatsapp, label: 'WhatsApp', key: 'whatsapp', getValue: (s) => s.phoneNumberDisplay, getHref: (s) => `https://wa.me/${s.whatsappNumber}` },
  { Icon: FiPhone,    label: 'Teléfono', key: 'phone',    getValue: (s) => s.phoneNumberDisplay, getHref: (s) => s.phoneNumberLink },
  { Icon: FiMail,     label: 'Email',    key: 'email',    getValue: (s) => s.contactEmail,        getHref: (s) => `mailto:${s.contactEmail}` },
];

export default function Contact() {
  const reveal = useReveal();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sendingChannel, setSendingChannel] = useState('');
  const [contactSettings, setContactSettings] = useState(defaultContactSettings);
  const sentTimeoutRef = useRef(null);

  const WHATSAPP_NUMBER = contactSettings.whatsappNumber;
  const CONTACT_EMAIL = contactSettings.contactEmail;

  useEffect(() => {
    settingsAPI.getPublic()
      .then(({ data }) => {
        setContactSettings({
          whatsappNumber: data?.whatsappNumber || defaultContactSettings.whatsappNumber,
          phoneNumberDisplay: data?.phoneNumberDisplay || defaultContactSettings.phoneNumberDisplay,
          phoneNumberLink: data?.phoneNumberLink || defaultContactSettings.phoneNumberLink,
          contactEmail: data?.contactEmail || defaultContactSettings.contactEmail,
          businessHours: Array.isArray(data?.businessHours) && data.businessHours.length > 0
            ? data.businessHours
            : defaultContactSettings.businessHours,
        });
      })
      .catch(() => {
        // Keep fallback defaults if settings are unavailable.
      });

    return () => {
      if (sentTimeoutRef.current) clearTimeout(sentTimeoutRef.current);
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
    if (popup && !popup.closed) popup.location.href = whatsappUrl;
    else window.location.href = whatsappUrl;
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
    <section style={{ background: 'var(--bg-page)', padding: '52px 20px 72px', fontFamily: 'var(--font-body)' }}>
      <div ref={reveal.ref} className={reveal.className}>
      <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto var(--space-8)' }}>
        <div className="ps-eyebrow" style={{ marginBottom: 'var(--space-3)' }}>Hablemos</div>
        <h1 style={{ fontSize: 'clamp(22px, 5.5vw, 38px)', lineHeight: 1.1, letterSpacing: '-0.02em',
                     marginBottom: 'var(--space-3)', fontFamily: 'var(--font-display)', color: 'var(--text-strong)' }}>
          ¿Tenés una consulta?
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-body)', lineHeight: 1.6 }}>
          Elegí el canal que prefieras. Te respondemos directamente, sin intermediarios.
        </p>
      </div>

      <div className="ps-quote-grid" style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Left — contact info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Card padding="lg">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 'var(--space-4)' }}>
              Información de contacto
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {CHANNELS.map(({ Icon, label, key, getValue, getHref }) => (
                <a key={key} href={getHref(contactSettings)} target={key !== 'phone' ? '_blank' : undefined} rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)', textDecoration: 'none',
                    transition: 'background var(--duration-fast) var(--ease-out)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-sunken)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <span style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--teal-50)', color: 'var(--brand-primary)',
                  }}>
                    <Icon size={20} />
                  </span>
                  <span>
                    <span style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                    <span style={{ display: 'block', fontSize: 15, color: 'var(--text-strong)', fontWeight: 700 }}>{getValue(contactSettings)}</span>
                  </span>
                </a>
              ))}
            </div>
          </Card>

          <Card padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
              <FiClock size={16} style={{ color: 'var(--brand-accent-press)' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-strong)' }}>
                Horarios de atención
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {contactSettings.businessHours.map(({ day, hours }) => (
                <div key={`${day}-${hours}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>{day}</span>
                  <span style={{ color: hours.toLowerCase() === 'cerrado' ? 'var(--text-faint)' : 'var(--brand-primary)', fontWeight: 700 }}>{hours}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="lg">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 'var(--space-1)' }}>
              Seguinos en redes
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
              Mirá nuestras últimas obras terminadas y en construcción.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <a href="https://www.instagram.com/playaysol.piscinas/" target="_blank" rel="noreferrer"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                         padding: '12px', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, fontSize: 14,
                         textDecoration: 'none', background: 'linear-gradient(135deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)' }}>
                <FiInstagram size={18} /> Instagram
              </a>
              <a href="https://www.facebook.com/playaysol.piscinas" target="_blank" rel="noreferrer"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                         padding: '12px', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, fontSize: 14,
                         textDecoration: 'none', background: '#1877F2' }}>
                <FiFacebook size={18} /> Facebook
              </a>
            </div>
          </Card>
        </div>

        {/* Right — form */}
        <Card padding="lg">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 'var(--space-1)' }}>
            Envianos tu consulta
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 'var(--space-5)' }}>
            Armamos el mensaje automáticamente con tus datos.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
            <Input label="Nombre" placeholder="Tu nombre completo" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email (opcional)" type="email" placeholder="tu@email.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="contact-message" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text-strong)' }}>
                Mensaje
              </label>
              <textarea
                id="contact-message"
                rows={4}
                placeholder="¿En qué te podemos ayudar?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                style={{
                  padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-default)',
                  fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-strong)', resize: 'vertical',
                  background: 'var(--surface-card)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <Button variant="primary" size="lg" fullWidth onClick={handleWhatsApp} iconLeft={<FaWhatsapp size={17} />}>
              {sendingChannel === 'whatsapp' ? '¡Listo! Abriendo WhatsApp...' : 'Enviar por WhatsApp'}
            </Button>
            <Button variant="outline" size="lg" fullWidth onClick={handleEmail} iconLeft={<FiSend size={16} />}>
              {sendingChannel === 'email' ? '¡Listo! Abriendo email...' : 'Enviar por email'}
            </Button>
          </div>
        </Card>
      </div>
      </div>
    </section>
  );
}
