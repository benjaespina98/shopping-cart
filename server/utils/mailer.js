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

// Envía la notificación de una nueva solicitud de presupuesto.
// Si el SMTP no está configurado todavía, no rompe el flujo: la solicitud
// ya quedó guardada en la base y se puede ver desde el admin.
export async function sendQuoteNotification(quote) {
  const to = (process.env.QUOTE_NOTIFY_EMAIL || '').trim();
  const t = getTransporter();
  if (!t || !to) {
    console.warn('[mailer] SMTP_HOST/SMTP_USER/SMTP_PASS o QUOTE_NOTIFY_EMAIL no configurados — la solicitud se guardó pero no se envió email.');
    return false;
  }

  const storeName = process.env.STORE_NAME || 'Playa & Sol Piscinas';

  await t.sendMail({
    from: `"${storeName}" <${process.env.SMTP_USER}>`,
    to,
    replyTo: quote.email || undefined,
    subject: `Nueva solicitud de presupuesto — ${quote.projectType}`,
    text: [
      `Tipo de proyecto: ${quote.projectType}`,
      `Nombre: ${quote.name}`,
      `Teléfono: ${quote.phone}`,
      `Email: ${quote.email}`,
      `Localidad: ${quote.location || '-'}`,
      quote.message ? `Mensaje: ${quote.message}` : null,
    ].filter(Boolean).join('\n'),
  });

  return true;
}
