# Vaibhavam Quotation — Setup Guide

## Email: Web3Forms (recommended)

Follow **`WEB3FORMS-SETUP.md`** — takes about 5 minutes, no Gmail App Password needed.

---

## Google Sheet (CRM)

Leads are sent automatically as form data. If columns show N/A, update your Apps Script with `Code.gs` from this folder and redeploy the web app.

---

## WhatsApp PDF (optional)

Add to Vercel environment variables:

| Key | Service |
|-----|---------|
| `ULTRAMSG_TOKEN` + `ULTRAMSG_INSTANCE` | [ultramsg.com](https://ultramsg.com) |
| `CALLMEBOT_API_KEY` | [callmebot.com](https://www.callmebot.com/blog/free-api-whatsapp-messages/) |

Without these, WhatsApp backup buttons still open after the quote is completed.

---

## Gmail (optional, not used by default)

See `GMAIL-SETUP.md` only if you switch back to Gmail SMTP on Vercel.
