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

async function readRequestBody(req) {
  if (req.body) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === 'string' && req.body.trim()) {
      try {
        return JSON.parse(req.body);
      } catch (e) {
        return {};
      }
    }
  }
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
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

async function sendViaWeb3Forms(data, pdfBuffer, fileName, adminEmail) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) return null;

  const clientEmail = (data.email || '').trim();
  if (!clientEmail || !clientEmail.includes('@')) return null;

  try {
    const form = new FormData();
    form.append('access_key', accessKey);
    form.append('subject', `Vaibhavam Quotation — ${data.name || 'Client'} | ${data.quoteId || ''}`);
    form.append('from_name', 'Vaibhavam Wedding Photography');
    form.append('name', data.name || '');
    form.append('email', clientEmail);
    form.append('cc', adminEmail);
    form.append(
      'message',
      buildEmailBody(data) + `\n\nPhone: ${data.phone || ''}\nVenue: ${data.venue || ''}`
    );
    form.append('attachment', new Blob([pdfBuffer], { type: 'application/pdf' }), fileName);
    const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: form });
    const json = await res.json();
    if (!json.success) return null;
    return { client: true, admin: true };
  } catch (e) {
    console.error('Web3Forms error:', e);
    return null;
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
      console.error('Client email failed:', e.message);
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
    console.error('Admin email failed:', e.message);
    throw new Error('Admin email failed: ' + e.message);
  }

  return sent;
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const data = await readRequestBody(req);
    const pdfBase64 = data.pdfBase64;
    const fileName = data.pdfFileName || `Vaibhavam_Quotation_${data.quoteId || 'quote'}.pdf`;

    if (!pdfBase64) {
      return res.status(400).json({ success: false, error: 'Missing PDF data' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || ADMIN_EMAIL_DEFAULT;
    const adminPhone = normalizePhone(process.env.ADMIN_PHONE || ADMIN_PHONE_DEFAULT);
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    let delivery = { email: { client: false, admin: false }, whatsapp: { client: false, admin: false } };
    let lastError = '';

    const gmailUser = (process.env.GMAIL_USER || '').trim();
    const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s/g, '');

    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: gmailUser, pass: gmailPass },
        });
        await transporter.verify();
        delivery.email = await sendEmails(transporter, gmailUser, adminEmail, data, pdfBuffer, fileName);
      } catch (e) {
        lastError = e.message || String(e);
        console.error('Gmail SMTP error:', lastError);
      }
    } else {
      lastError = 'Gmail not configured (GMAIL_USER / GMAIL_APP_PASSWORD missing on Vercel).';
    }

    if (!delivery.email.client || !delivery.email.admin) {
      const web3 = await sendViaWeb3Forms(data, pdfBuffer, fileName, adminEmail);
      if (web3) {
        delivery.email.client = delivery.email.client || web3.client;
        delivery.email.admin = delivery.email.admin || web3.admin;
        if (web3.admin || web3.client) lastError = '';
      }
    }

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

    if (!emailOk && !lastError) {
      lastError = 'Email could not be sent. Check Gmail App Password on Vercel and redeploy.';
    }

    return res.status(emailOk ? 200 : 500).json({
      success: emailOk,
      error: emailOk ? null : lastError,
      message: emailOk ? 'Quotation delivered' : 'Email delivery failed',
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
