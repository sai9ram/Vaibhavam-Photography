/**
 * Optional server endpoint (WhatsApp only). Email is handled via FormSubmit in quote.html.
 */
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  return res.status(200).json({
    success: true,
    message: 'Email is sent via FormSubmit from the quote page. This API is not required for email.',
    delivery: { email: { client: true, admin: true }, whatsapp: { client: false, admin: false } },
  });
};
