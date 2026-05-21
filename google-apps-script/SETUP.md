# Vaibhavam Quotation — Setup

## Email (FormSubmit — no password needed)

Emails are sent via **[FormSubmit.co](https://formsubmit.co)** from the browser.

- **Admin inbox:** `Vaibhavambyvarun@gmail.com` (set in `quote.html` as `ADMIN_EMAIL`)
- **Customer:** receives a copy at the email they enter on the quote form
- **No** Gmail password, API key, or Vercel env vars required for email

### First-time only (client must do once)

The first time FormSubmit is used with an email address, that inbox gets an **activation link** from FormSubmit. The client must click **Activate Form** in that email. After that, all quotation emails work automatically.

---

## Google Sheet (CRM)

Leads are logged via your Google Apps Script URL in `quote.html`.  
If columns show N/A, update Apps Script with `Code.gs` from this folder and redeploy the web app.

---

## WhatsApp (optional)

WhatsApp backup buttons open after each quote. For automatic WhatsApp PDF, add UltraMsg or CallMeBot keys on Vercel (see previous docs) — optional.

---

## Change admin email

Edit in `quote.html`:

```javascript
const ADMIN_EMAIL = 'Vaibhavambyvarun@gmail.com';
```

Then redeploy the site.
