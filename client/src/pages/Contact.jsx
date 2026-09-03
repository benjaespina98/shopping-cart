import { useEffect, useRef, useState } from 'react';
import { FiMail, FiPhone, FiInstagram, FiFacebook, FiClock, FiSend, FiUser, FiMapPin, FiNavigation } from 'react-icons/fi';
import { FaWhatsapp, FaTiktok } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { quotesAPI } from '../services/api';
import { Button } from '../design-system/Button';
import { Card } from '../design-system/Card';
import { Input } from '../design-system/Input';
import { Photo } from '../design-system/Photo';
import { useReveal } from '../hooks/useReveal';
import { useSettings } from '../context/SettingsContext';
import { isValidEmail, isValidPhone } from '../utils/validation';

// Datos del local, antes en la página /ubicacion. Esa página repetía dirección,
// horarios y teléfono que ya estaban acá, con un diseño distinto al del resto del
// sitio; se unificó todo en Contacto y /ubicacion ahora redirige acá.
const LOCATION = {
  address: 'Corrientes 1210, Villa María, Córdoba',
  mapsUrl: 'https://www.google.com/maps/place/Playa+y+Sol+S.A.S./@-32.41136540202374,-63.24136445912394,17z',
  embedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d210.51818044720216!2d-63.24136445912394!3d-32.41136540202374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95cc42e708785177%3A0x7029a4a01828b49f!2sPlaya%20y%20Sol%20S.A.S.!5e0!3m2!1ses-419!2sar!4v1771459205088!5m2!1ses-419!2sar',
};

export default function Contact() {
  const reveal = useReveal();
  const mapReveal = useReveal();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [sendingChannel, setSendingChannel] = useState('');
  const { settings: contactSettings } = useSettings();
  const sentTimeoutRef = useRef(null);

  const WHATSAPP_NUMBER = contactSettings.whatsappNumber;
  const CONTACT_EMAIL = contactSettings.contactEmail;

  useEffect(() => () => {
    if (sentTimeoutRef.current) clearTimeout(sentTimeoutRef.current);
  }, []);

  const resetFormWithFeedback = (channel) => {
    setSendingChannel(channel);
    if (sentTimeoutRef.current) clearTimeout(sentTimeoutRef.current);
    sentTimeoutRef.current = setTimeout(() => setSendingChannel(''), 3500);
    setForm({ name: '', phone: '', email: '', message: '' });
    setFieldErrors({});
  };

  const getTextMessage = () =>
    `Hola! Soy ${form.name} (${form.phone}${form.email ? `, ${form.email}` : ''}).\n\n${form.message}`;

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setFieldErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  // Antes solo chequeaba que los campos no estuvieran vacíos: un email "asdf" o un
  // teléfono de un solo dígito pasaban igual, y el negocio se quedaba con un contacto al
  // que no podía responder. Ahora valida el mismo formato que /presupuesto.
  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Ingresá tu nombre.';
    if (!isValidPhone(form.phone)) errs.phone = 'Ingresá un teléfono válido.';
    if (!isValidEmail(form.email)) errs.email = 'Ingresá un email válido.';
    if (!form.message.trim()) errs.message = 'Contanos brevemente tu consulta.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Revisá los campos marcados.');
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
                value={form.name} onChange={setField('name')} error={fieldErrors.name} />
              <Input label="Teléfono" placeholder="600 123 456" required
                leading={<FiPhone size={16} />}
                value={form.phone} onChange={setField('phone')} error={fieldErrors.phone} />
            </div>
            <Input label="Email" type="email" placeholder="tu@email.com" required
              leading={<FiMail size={16} />}
              value={form.email} onChange={setField('email')} error={fieldErrors.email} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="contact-message" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text-strong)' }}>
                Mensaje
              </label>
              <textarea
                id="contact-message"
                rows={4}
                placeholder="¿En qué te podemos ayudar?"
                value={form.message}
                onChange={setField('message')}
                style={{
                  padding: '11px 14px', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${fieldErrors.message ? 'var(--red-500)' : 'var(--border-default)'}`,
                  fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-strong)', resize: 'vertical',
                  background: 'var(--surface-card)',
                }}
              />
              {fieldErrors.message && (
                <span style={{ fontSize: '0.875rem', color: 'var(--red-500)', fontFamily: 'var(--font-body)' }}>{fieldErrors.message}</span>
              )}
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

      {/* DÓNDE ESTAMOS — showroom. Venía de la página /ubicacion, que repetía
          dirección, horarios y teléfono con un diseño fuera del design system. */}
      <div ref={mapReveal.ref} className={mapReveal.className}
           style={{ maxWidth: 1000, margin: 'var(--space-9) auto 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div className="ps-eyebrow" style={{ marginBottom: 'var(--space-2)' }}>Showroom</div>
          <h2 style={{ fontSize: 'clamp(20px, 4.5vw, 30px)', fontFamily: 'var(--font-display)',
                       color: 'var(--text-strong)', marginBottom: 'var(--space-2)' }}>
            Visitanos en persona
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-body)', lineHeight: 1.6 }}>
            Te esperamos en nuestro local con atención personalizada.
          </p>
        </div>

        <Card padding="none" style={{ overflow: 'hidden' }}>
          <iframe
            title="Ubicación del local de Playa & Sol Piscinas"
            src={LOCATION.embedUrl}
            width="100%"
            height="360"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 'var(--space-4)', flexWrap: 'wrap', padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
              <span style={{
                width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--teal-50)', color: 'var(--brand-primary)',
              }}>
                <FiMapPin size={20} />
              </span>
              <span>
                <span style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Dirección</span>
                <span style={{ display: 'block', fontSize: 15, color: 'var(--text-strong)', fontWeight: 700 }}>
                  {LOCATION.address}
                </span>
              </span>
            </div>
            <a href={LOCATION.mapsUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <Button variant="primary" iconLeft={<FiNavigation size={16} />}>Cómo llegar</Button>
            </a>
          </div>
        </Card>
      </div>
      </div>
    </section>
  );
}
