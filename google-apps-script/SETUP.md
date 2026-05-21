# Quotation Email & WhatsApp Setup

## Vercel (recommended — site is on Vercel)

1. Open [Vercel Dashboard](https://vercel.com) → **vaibhavam-photography** → **Settings** → **Environment Variables**
2. Add these for **Production**:

| Name | Value |
|------|--------|
| `GMAIL_USER` | `Vaibhavambyvarun@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail **App Password** (16 characters, no spaces) |
| `ADMIN_EMAIL` | `Vaibhavambyvarun@gmail.com` |
| `ADMIN_PHONE` | `918639972913` |

### Create Gmail App Password

1. Google Account → **Security** → turn on **2-Step Verification**
2. **App passwords** → Create → name it `Vaibhavam Website` → copy the 16-character password
3. Paste that as `GMAIL_APP_PASSWORD` in Vercel (not your normal Gmail password)

3. **Redeploy** the project after saving env vars (Deployments → **Redeploy** — required, or env vars will not work).

**Troubleshooting Gmail:** Use an **App Password** (16 letters), not your normal Gmail password. Remove spaces when pasting. Variable names must be exact: `GMAIL_USER`, `GMAIL_APP_PASSWORD`.

**Alternative (easier):** Add `WEB3FORMS_ACCESS_KEY` from [web3forms.com](https://web3forms.com) (free) — sends PDF email without Gmail setup.

### Optional WhatsApp (PDF file or link)

| Name | Purpose |
|------|---------|
| `ULTRAMSG_TOKEN` + `ULTRAMSG_INSTANCE` | Sends real PDF on WhatsApp ([ultramsg.com](https://ultramsg.com)) |
| `CALLMEBOT_API_KEY` | Sends WhatsApp message with PDF download link ([callmebot.com](https://www.callmebot.com/blog/free-api-whatsapp-messages/)) |

Without these, email still works; WhatsApp opens via the website backup buttons.

---

## Google Apps Script (CRM sheet + backup email)

1. Open your CRM Google Sheet → **Extensions → Apps Script**
2. Paste `Code.gs` from this folder → **Save**
3. Run once and authorize **Gmail**, **Drive**, and **Sheets**
4. **Deploy → New deployment → Web app** → Execute as **Me**, access **Anyone**
5. Copy the URL into `quote.html` as `GOOGLE_SHEETS_WEBAPP_URL` if it changed

Optional Script properties: `SHEET_ID`, `ULTRAMSG_TOKEN`, `ULTRAMSG_INSTANCE`, `CALLMEBOT_API_KEY`

---

## Test

1. Complete a quote on https://vaibhavam-photography.vercel.app/quote.html
2. You should see: **“Quotation PDF sent to your email and the Vaibhavam team…”**
3. Check inbox (and spam) for both customer and admin emails with PDF attached
