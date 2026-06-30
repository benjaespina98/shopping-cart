import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (transporter !== undefined) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 465,
    secure: Number(SMTP_PORT) !== 587,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Una fila de la tabla de datos del email (label a la izquierda, valor a la derecha).
const row = (label, value, { link } = {}) => {
  if (!value) return '';
  const safeValue = escapeHtml(value);
  const valueHtml = link ? `<a href="${link}" style="color:#193A45;text-decoration:none;font-weight:600;">${safeValue}</a>` : safeValue;
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #EEF1F2;color:#6E797E;font-size:13px;font-family:Arial,Helvetica,sans-serif;width:120px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #EEF1F2;color:#122B33;font-size:14px;font-weight:600;font-family:Arial,Helvetica,sans-serif;vertical-align:top;">${valueHtml}</td>
    </tr>`;
};

function buildEmailHtml(quote) {
  const isContact = quote.source === 'contact';
  const originLabel = isContact ? 'Formulario de contacto' : 'Formulario de presupuesto';
  const originPath = isContact ? '/contacto' : '/presupuesto';
  const siteUrl = (process.env.CLIENT_URL || '').split(',')[0]?.trim().replace(/\/+$/, '') || '';

  return `
  <div style="background:#F7F8F9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E0E5E7;">
      <tr>
        <td style="background:#244B5A;padding:28px 32px;">
          <p style="margin:0;color:#FFC629;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Playa y Sol Piscinas</p>
          <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;font-weight:700;">${isContact ? 'Nueva consulta' : 'Nueva solicitud de presupuesto'}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px;">
          <span style="display:inline-block;background:#FFF4D2;color:#946A0B;font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px;margin-bottom:18px;">
            ${escapeHtml(quote.projectType)}
          </span>
          <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="margin-top:6px;">
            ${row('Nombre', quote.name)}
            ${row('Teléfono', quote.phone, { link: `tel:${quote.phone}` })}
            ${row('Email', quote.email, { link: `mailto:${quote.email}` })}
            ${row('Localidad', quote.location)}
          </table>
          ${quote.message ? `
          <div style="margin-top:18px;">
            <p style="margin:0 0 6px;color:#6E797E;font-size:13px;">Mensaje</p>
            <p style="margin:0;background:#F7F8F9;border-radius:10px;padding:14px;color:#353E45;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(quote.message)}</p>
          </div>` : ''}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 32px 28px;border-top:1px solid #EEF1F2;">
          <p style="margin:0;color:#9AA5AA;font-size:12px;">
            Recibido desde ${originLabel}${siteUrl ? ` (<a href="${siteUrl}${originPath}" style="color:#9AA5AA;">${originPath}</a>)` : ` (${originPath})`}.
            Gestioná esta y el resto de las consultas desde el panel admin.
          </p>
        </td>
      </tr>
    </table>
  </div>`;
}

function buildEmailText(quote) {
  return [
    `Origen: ${quote.source === 'contact' ? 'Formulario de contacto (/contacto)' : 'Formulario de presupuesto (/presupuesto)'}`,
    `Tipo: ${quote.projectType}`,
    `Nombre: ${quote.name}`,
    `Teléfono: ${quote.phone}`,
    `Email: ${quote.email}`,
    `Localidad: ${quote.location || '-'}`,
    quote.message ? `Mensaje: ${quote.message}` : null,
  ].filter(Boolean).join('\n');
}

// Envía la notificación de una nueva solicitud de presupuesto o consulta.
// Si el SMTP no está configurado todavía, no rompe el flujo: la solicitud
// ya quedó guardada en la base y se puede ver desde el admin.
export async function sendQuoteNotification(quote) {
  const to = (process.env.QUOTE_NOTIFY_EMAIL || '').trim();
  const t = getTransporter();
  if (!t || !to) {
    console.warn('[mailer] SMTP_HOST/SMTP_USER/SMTP_PASS o QUOTE_NOTIFY_EMAIL no configurados — la solicitud se guardó pero no se envió email.');
    return false;
  }

  const storeName = process.env.STORE_NAME || 'Playa y Sol Piscinas';

  await t.sendMail({
    from: `"${storeName}" <${process.env.SMTP_USER}>`,
    to,
    replyTo: quote.email || undefined,
    subject: `${quote.source === 'contact' ? 'Nueva consulta' : 'Nueva solicitud de presupuesto'} — ${quote.projectType}`,
    text: buildEmailText(quote),
    html: buildEmailHtml(quote),
  });

  return true;
}
