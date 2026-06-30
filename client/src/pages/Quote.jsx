import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiMail, FiMapPin, FiSend, FiCheck, FiClock, FiShield, FiMessageSquare } from 'react-icons/fi';
import { Button } from '../design-system/Button';
import { Card } from '../design-system/Card';
import { Badge } from '../design-system/Badge';
import { Input } from '../design-system/Input';
import { Checkbox } from '../design-system/Checkbox';
import { Photo } from '../design-system/Photo';
import { useReveal } from '../hooks/useReveal';
import { servicesAPI, quotesAPI } from '../services/api';
import { trackEvent } from '../utils/analytics';

const FALLBACK_TYPES = ['Piscina nueva', 'Reforma', 'Cerco / Seguridad'];
const OTHER_TYPE = 'Otra consulta';

const STEPS = [
  { Icon: FiSend,  text: 'Contanos tu proyecto con el formulario' },
  { Icon: FiClock, text: 'Te visitamos en Villa María dentro de 48 horas' },
  { Icon: FiCheck, text: 'Recibís tu presupuesto sin compromiso' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+-]{6,}$/;

export default function Quote() {
  const navigate = useNavigate();
  const reveal = useReveal();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [types, setTypes] = useState(FALLBACK_TYPES);
  const [tipo, setTipo] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', location: '', message: '' });
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(true);

  useEffect(() => {
    servicesAPI.getAll()
      .then(({ data }) => {
        if (data?.length > 0) {
          const fromServices = data.map((s) => s.title);
          setTypes(fromServices);
          setTipo(fromServices[0]);
        } else {
          setTipo(FALLBACK_TYPES[0]);
        }
      })
      .catch(() => setTipo(FALLBACK_TYPES[0]));
  }, []);

  const allTypes = [...types, OTHER_TYPE];

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setFieldErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Ingresá tu nombre.';
    if (!PHONE_RE.test(form.phone.trim())) errs.phone = 'Ingresá un teléfono válido.';
    if (!EMAIL_RE.test(form.email.trim())) errs.email = 'Ingresá un email válido.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setFormError('Revisá los campos marcados.');
      return;
    }
    if (!acceptedPrivacy) {
      setFormError('Tenés que aceptar la política de privacidad.');
      return;
    }
    setFormError('');
    setSending(true);
    try {
      await quotesAPI.create({
        projectType: tipo,
        name: form.name,
        phone: form.phone,
        email: form.email,
        location: form.location,
        message: form.message,
      });
      trackEvent('generate_lead', { project_type: tipo });
      setSent(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'No pudimos enviar tu solicitud. Probá de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section style={{ background: 'var(--bg-page)', padding: '52px 20px 72px', fontFamily: 'var(--font-body)' }}>
      <div ref={reveal.ref} className={reveal.className}>
      <div className="ps-quote-grid" style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Left */}
        <div>
          <div className="ps-eyebrow" style={{ marginBottom: 'var(--space-3)' }}>Presupuesto sin compromiso</div>
          <h1 style={{ fontSize: 'clamp(22px, 5.5vw, 38px)', lineHeight: 1.1, letterSpacing: '-0.02em',
                       marginBottom: 'var(--space-4)', fontFamily: 'var(--font-display)', color: 'var(--text-strong)',
                       overflowWrap: 'break-word' }}>
            Cuéntanos tu proyecto
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
            Completá el formulario y te visitamos en 48 horas. Sin costo y sin compromiso.
          </p>

          <div className="ps-quote-photo" style={{ marginBottom: 'var(--space-6)' }}>
            <Photo label="Visita técnica" height={200} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            {STEPS.map(({ Icon, text }, i) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--teal-50)', color: 'var(--brand-primary)',
                }}>
                  <Icon size={15} />
                </span>
                <span style={{ fontSize: 14, color: 'var(--text-body)', fontWeight: 500 }}>
                  <strong style={{ color: 'var(--text-strong)' }}>{i + 1}.</strong> {text}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge tone="teal" dot>Respuesta en 48h</Badge>
            <Badge tone="sun" variant="solid">Garantía 10 años</Badge>
          </div>
        </div>

        {/* Right — form */}
        <Card padding="lg">
          {sent ? (
            <div style={{ textAlign: 'center', padding: '24px 10px' }}>
              <img src="/brand/logo-icon.png" alt="" style={{ height: 56, width: 'auto', display: 'block', margin: '0 auto 14px' }} />
              <h2 style={{ fontSize: 24, marginBottom: 10, fontFamily: 'var(--font-display)',
                           color: 'var(--text-strong)' }}>¡Gracias!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                Hemos recibido tu solicitud. Te llamamos en menos de 48 horas.
              </p>
              <Button variant="secondary" onClick={() => { setSent(false); navigate('/'); }}>
                Volver al inicio
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-1)' }}>
                  <FiShield size={14} style={{ color: 'var(--brand-accent-press)' }} />
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-strong)' }}>
                    Tus datos de contacto
                  </h2>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Usamos esta información únicamente para coordinar tu visita.</p>
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
                                color: 'var(--text-strong)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  Tipo de proyecto
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {allTypes.map(t => {
                    const active = tipo === t;
                    return (
                      <button type="button" key={t} onClick={() => setTipo(t)} style={{
                        flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '10px 14px', borderRadius: 'var(--radius-pill)',
                        cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                        border: active ? '2px solid var(--brand-primary)' : '2px solid var(--border-default)',
                        background: active ? 'var(--teal-50)' : 'var(--surface-card)',
                        color: active ? 'var(--brand-primary)' : 'var(--text-muted)',
                        transition: 'all var(--duration-fast) var(--ease-out)',
                      }}>
                        {active && <FiCheck size={13} />}
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="ps-form-row">
                <Input label="Nombre" placeholder="Tu nombre" required value={form.name} onChange={setField('name')}
                  leading={<FiUser size={16} />} error={fieldErrors.name} />
                <Input label="Teléfono" placeholder="600 123 456" required value={form.phone} onChange={setField('phone')}
                  leading={<FiPhone size={16} />} error={fieldErrors.phone} />
              </div>
              <Input label="Email" placeholder="hola@ejemplo.com" type="email" required value={form.email} onChange={setField('email')}
                leading={<FiMail size={16} />} error={fieldErrors.email} />
              <Input label="Localidad" placeholder="Corrientes 1210, Villa María…" value={form.location} onChange={setField('location')}
                leading={<FiMapPin size={16} />} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="quote-message" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text-strong)' }}>
                  Contanos tu consulta <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcional)</span>
                </label>
                <div style={{ display: 'flex', gap: 8, padding: '11px 14px', borderRadius: 'var(--radius-md)',
                              border: '2px solid var(--border-default)', background: 'var(--surface-card)' }}>
                  <FiMessageSquare size={16} style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
                  <textarea
                    id="quote-message"
                    rows={3}
                    placeholder="Medidas aproximadas, plazos, algo puntual que quieras contarnos..."
                    value={form.message}
                    onChange={setField('message')}
                    style={{
                      flex: 1, border: 'none', outline: 'none', resize: 'vertical', minHeight: 64,
                      fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-strong)', background: 'transparent',
                    }}
                  />
                </div>
              </div>

              <Checkbox label="Acepto la política de privacidad" checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)} />
              {formError && (
                <p style={{ color: 'var(--red-500)', fontSize: 14, fontFamily: 'var(--font-body)' }}>{formError}</p>
              )}
              <Button type="submit" variant="primary" size="lg" fullWidth disabled={sending}
                iconLeft={!sending && <FiSend size={16} />}>
                {sending ? 'Enviando...' : 'Solicitar presupuesto'}
              </Button>
            </form>
          )}
        </Card>
      </div>
      </div>
    </section>
  );
}
