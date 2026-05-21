const nodemailer = require('nodemailer');

const ADMIN_EMAIL_DEFAULT = 'Vaibhavambyvarun@gmail.com';
const ADMIN_PHONE_DEFAULT = '918639972913';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function normalizePhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) digits = '91' + digits;
  return digits;
}

function buildEmailBody(data) {
  return [
    `Dear ${data.name || 'Client'},`,
    '',
    'Thank you for using the Vaibhavam Wedding Photography quotation builder.',
    '',
    'Your personalized quotation PDF is attached to this email.',
    '',
    `Quotation ID: ${data.quoteId || 'N/A'}`,
    `Wedding Date: ${data.date || 'N/A'}`,
    `Venue: ${data.venue || 'N/A'}`,
    `Estimated Total: Rs. ${data.budget || '0'}`,
    '',
    'This quotation is valid for 15 days. Final pricing may vary after discussion.',
    '',
    'Warm regards,',
    'Vaibhavam Wedding Photography',
    'Phone: 8639972913',
    'Email: Vaibhavambyvarun@gmail.com',
  ].join('\n');
}

async function uploadPdfTemp(pdfBuffer, fileName) {
  try {
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', blob, fileName);
    const res = await fetch('https://0x0.st', { method: 'POST', body: formData });
    if (!res.ok) return '';
    const url = (await res.text()).trim();
    return url.startsWith('http') ? url : '';
  } catch (e) {
    console.error('PDF upload failed:', e);
    return '';
  }
}

async function sendViaUltraMsg(instanceId, token, toPhone, pdfBase64, fileName, caption) {
  try {
    const url = `https://api.ultramsg.com/${instanceId}/messages/document`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        to: toPhone,
        document: `data:application/pdf;base64,${pdfBase64}`,
        filename: fileName,
        caption,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error('UltraMsg error:', e);
    return false;
  }
}

async function sendViaCallMeBot(phone, text, apiKey) {
  try {
    const url =
      'https://api.callmebot.com/whatsapp.php?phone=' +
      encodeURIComponent(phone) +
      '&text=' +
      encodeURIComponent(text) +
      '&apikey=' +
      encodeURIComponent(apiKey);
    const res = await fetch(url);
    return res.ok;
  } catch (e) {
    console.error('CallMeBot error:', e);
    return false;
  }
}

async function sendEmails(transporter, fromEmail, adminEmail, data, pdfBuffer, fileName) {
  const sent = { client: false, admin: false };
  const body = buildEmailBody(data);
  const attachment = {
    filename: fileName,
    content: pdfBuffer,
    contentType: 'application/pdf',
  };
  const clientEmail = (data.email || '').trim();

  if (clientEmail && clientEmail.includes('@')) {
    try {
      await transporter.sendMail({
        from: `"Vaibhavam Wedding Photography" <${fromEmail}>`,
        to: clientEmail,
        subject: `Your Vaibhavam Wedding Photography Quotation — ${data.quoteId || ''}`,
        text: body,
        attachments: [attachment],
      });
      sent.client = true;
    } catch (e) {
      console.error('Client email failed:', e);
    }
  }

  try {
    await transporter.sendMail({
      from: `"Vaibhavam Wedding Photography" <${fromEmail}>`,
      to: adminEmail,
      subject: `New Quotation Lead — ${data.name || 'Client'} | ${data.quoteId || ''}`,
      text: body + '\n\n---\nSent automatically from the Vaibhavam quote builder.',
      attachments: [attachment],
    });
    sent.admin = true;
  } catch (e) {
    console.error('Admin email failed:', e);
  }

  return sent;
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const data = req.body || {};
    const pdfBase64 = data.pdfBase64;
    const fileName = data.pdfFileName || `Vaibhavam_Quotation_${data.quoteId || 'quote'}.pdf`;

    if (!pdfBase64) {
      return res.status(400).json({ success: false, error: 'Missing PDF data' });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || ADMIN_EMAIL_DEFAULT;
    const adminPhone = normalizePhone(process.env.ADMIN_PHONE || ADMIN_PHONE_DEFAULT);

    if (!gmailUser || !gmailPass) {
      return res.status(500).json({
        success: false,
        error: 'Gmail not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD in Vercel project settings.',
        delivery: { email: { client: false, admin: false }, whatsapp: { client: false, admin: false } },
      });
    }

    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });

    const delivery = {
      email: await sendEmails(transporter, gmailUser, adminEmail, data, pdfBuffer, fileName),
      whatsapp: { client: false, admin: false },
    };

    const pdfUrl = await uploadPdfTemp(pdfBuffer, fileName);
    const caption = [
      '*Vaibhavam Wedding Photography*',
      'Your wedding quotation PDF is ready.',
      '',
      `Client: ${data.name || ''}`,
      `ID: ${data.quoteId || ''}`,
      `Total: Rs. ${data.budget || '0'}`,
      pdfUrl ? `\n📄 Download PDF:\n${pdfUrl}` : '\n📄 PDF sent to your email.',
    ].join('\n');

    const ultraToken = process.env.ULTRAMSG_TOKEN;
    const ultraInstance = process.env.ULTRAMSG_INSTANCE;
    const callmeKey = process.env.CALLMEBOT_API_KEY;
    const clientPhone = normalizePhone(data.phone || '');

    if (ultraToken && ultraInstance) {
      if (clientPhone) {
        delivery.whatsapp.client = await sendViaUltraMsg(
          ultraInstance, ultraToken, clientPhone, pdfBase64, fileName, caption
        );
      }
      delivery.whatsapp.admin = await sendViaUltraMsg(
        ultraInstance, ultraToken, adminPhone, pdfBase64, fileName,
        `New lead: ${data.name || ''}\n${caption}`
      );
    } else if (callmeKey && pdfUrl) {
      const linkMsg = caption;
      if (clientPhone) delivery.whatsapp.client = await sendViaCallMeBot(clientPhone, linkMsg, callmeKey);
      delivery.whatsapp.admin = await sendViaCallMeBot(
        adminPhone, `New quotation from ${data.name || 'client'}\n${linkMsg}`, callmeKey
      );
    }

    const emailOk = delivery.email.client && delivery.email.admin;
    const waOk = delivery.whatsapp.client && delivery.whatsapp.admin;

    return res.status(200).json({
      success: emailOk,
      message: emailOk ? 'Quotation delivered' : 'Email delivery incomplete',
      delivery,
      driveUrl: pdfUrl || null,
    });
  } catch (err) {
    console.error('send-quotation error:', err);
    return res.status(500).json({
      success: false,
      error: String(err.message || err),
      delivery: { email: { client: false, admin: false }, whatsapp: { client: false, admin: false } },
    });
  }
};
