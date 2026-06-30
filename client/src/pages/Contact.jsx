import { useEffect, useRef, useState } from 'react';
import { FiMail, FiPhone, FiInstagram, FiFacebook, FiClock, FiSend, FiUser } from 'react-icons/fi';
import { FaWhatsapp, FaTiktok } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { settingsAPI, quotesAPI } from '../services/api';
import { Button } from '../design-system/Button';
import { Card } from '../design-system/Card';
import { Input } from '../design-system/Input';
import { Photo } from '../design-system/Photo';
import { useReveal } from '../hooks/useReveal';

const defaultContactSettings = {
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '5493534224605',
  phoneNumberDisplay: '3534224605',
  phoneNumberLink: 'tel:+543534224605',
  contactEmail: 'piscinas@playaysol.com.ar',
  secondaryContactLabel: '',
  secondaryContactWhatsapp: '',
  contactPhotoUrl: '',
  businessHours: [
    { day: 'Lunes a Viernes', hours: '9:00 - 18:00' },
    { day: 'Sábados', hours: '9:00 - 13:00' },
    { day: 'Domingos', hours: 'Cerrado' },
  ],
};

export default function Contact() {
  const reveal = useReveal();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
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
          secondaryContactLabel: data?.secondaryContactLabel || '',
          secondaryContactWhatsapp: data?.secondaryContactWhatsapp || '',
          contactPhotoUrl: data?.contactPhotoUrl || '',
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
    setForm({ name: '', phone: '', email: '', message: '' });
  };

  const getTextMessage = () =>
    `Hola! Soy ${form.name} (${form.phone}${form.email ? `, ${form.email}` : ''}).\n\n${form.message}`;

  const validateForm = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Completá nombre, teléfono, email y mensaje para continuar.');
      return false;
    }
    return true;
  };

  // Guarda la consulta en el servidor (queda en el admin y dispara el email de notificación)
  // antes de abrir el canal elegido — así no se pierde el contacto aunque el visitante
  // no termine de enviar el WhatsApp o el mail desde su propio dispositivo.
  const saveInquiry = async () => {
    try {
      await quotesAPI.create({
        projectType: 'Consulta general',
        name: form.name,
        phone: form.phone,
        email: form.email,
        message: form.message,
        source: 'contact',
      });
    } catch {
      // No bloqueamos el envío por WhatsApp/email si el guardado falla.
    }
  };

  const handleWhatsApp = async () => {
    if (!validateForm()) return;
    await saveInquiry();
    const text = getTextMessage();
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    const popup = window.open('', '_blank', 'noopener,noreferrer');
    if (popup && !popup.closed) popup.location.href = whatsappUrl;
    else window.location.href = whatsappUrl;
    resetFormWithFeedback('whatsapp');
  };

  const handleEmail = async () => {
    if (!validateForm()) return;
    await saveInquiry();
    const subject = `Consulta desde web - ${form.name}`;
    const body = getTextMessage();
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    resetFormWithFeedback('email');
  };

  const channels = [
    { Icon: FaWhatsapp, label: 'WhatsApp', href: `https://wa.me/${WHATSAPP_NUMBER}`, value: contactSettings.phoneNumberDisplay },
    { Icon: FiMail,     label: 'Email',    href: `mailto:${CONTACT_EMAIL}`,          value: CONTACT_EMAIL },
  ];
  if (contactSettings.secondaryContactWhatsapp) {
    channels.push({
      Icon: FaWhatsapp,
      label: contactSettings.secondaryContactLabel || 'Otro contacto',
      href: `https://wa.me/${contactSettings.secondaryContactWhatsapp}`,
      value: contactSettings.secondaryContactWhatsapp.replace(/^549/, ''),
    });
  }

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
          Escribinos por WhatsApp o email. Te respondemos directamente, sin intermediarios.
        </p>
      </div>

      <div className="ps-quote-grid" style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Left — contact info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {contactSettings.contactPhotoUrl && (
            <Photo src={contactSettings.contactPhotoUrl} label="Nuestro local" height={180} />
          )}

          <Card padding="lg">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 'var(--space-4)' }}>
              Información de contacto
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {channels.map(({ Icon, label, href, value }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer"
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
                    <span style={{ display: 'block', fontSize: 15, color: 'var(--text-strong)', fontWeight: 700 }}>{value}</span>
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
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <a href="https://www.instagram.com/playaysol.piscinas/" target="_blank" rel="noreferrer"
                style={{ flex: '1 1 100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                         padding: '12px', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, fontSize: 14,
                         textDecoration: 'none', background: 'linear-gradient(135deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)' }}>
                <FiInstagram size={18} /> Instagram
              </a>
              <a href="https://www.facebook.com/playaysol.piscinas" target="_blank" rel="noreferrer"
                style={{ flex: '1 1 100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                         padding: '12px', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, fontSize: 14,
                         textDecoration: 'none', background: '#1877F2' }}>
                <FiFacebook size={18} /> Facebook
              </a>
              <a href="https://www.tiktok.com/@playaysolpiscinas" target="_blank" rel="noreferrer"
                style={{ flex: '1 1 100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                         padding: '12px', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, fontSize: 14,
                         textDecoration: 'none', background: '#000000' }}>
                <FaTiktok size={16} /> TikTok
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
            <div className="ps-form-row">
              <Input label="Nombre" placeholder="Tu nombre completo" required
                leading={<FiUser size={16} />}
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Teléfono" placeholder="600 123 456" required
                leading={<FiPhone size={16} />}
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <Input label="Email" type="email" placeholder="tu@email.com" required
              leading={<FiMail size={16} />}
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
