# Automatic Quotation Email & WhatsApp Setup

When a customer completes the quote on your website, the branded PDF is sent automatically to **their email**, **your admin email**, **their WhatsApp**, and **your admin WhatsApp**.

## 1. Update Google Apps Script

1. Open the Google Sheet linked to your quote form CRM.
2. Go to **Extensions → Apps Script**.
3. Replace the script with the contents of `Code.gs` in this folder (or merge `processQuotationLead` into your existing `doPost`).
4. Run **Run → doPost** once is not needed; instead run any function and authorize **Gmail** and **Drive** when prompted.
5. **Deploy → Manage deployments → Edit** (or New deployment):
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the new Web App URL and paste it into `quote.html` as `GOOGLE_SHEETS_WEBAPP_URL` if it changed.

## 2. Email (works immediately after deploy)

Emails are sent from the Gmail account that owns the script, with the PDF attached to:

- The customer’s email from the form
- Your admin email (`Vaibhavambyvarun@gmail.com` or set `ADMIN_EMAIL` in Script properties)

## 3. WhatsApp PDF (choose one option)

Browsers cannot send WhatsApp files directly. Use one of these in **Script properties**:

### Option A — UltraMsg (recommended, sends real PDF file)

1. Sign up at [ultramsg.com](https://ultramsg.com) and connect your WhatsApp.
2. Add Script properties:
   - `ULTRAMSG_TOKEN` — your API token
   - `ULTRAMSG_INSTANCE` — your instance id (e.g. `instance12345`)
3. Redeploy the web app.

### Option B — CallMeBot (free, sends a message + Google Drive PDF link)

1. Register at [callmebot.com](https://www.callmebot.com/blog/free-api-whatsapp-messages/) and get your API key.
2. Add Script property: `CALLMEBOT_API_KEY`
3. Redeploy. Customers receive a WhatsApp message with a link to download the PDF from Drive.

### Optional Script properties

| Property | Example |
|----------|---------|
| `ADMIN_EMAIL` | `Vaibhavambyvarun@gmail.com` |
| `ADMIN_PHONE` | `918639972913` |

## 4. Test

Complete a test quote on `quote.html`. You should see “Quotation sent” in the modal and receive email + WhatsApp within a minute.
