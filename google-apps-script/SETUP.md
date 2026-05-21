# Fix Email & Google Sheet Setup

## Error: `535 Username and Password not accepted`

This means Gmail **rejected** the password in Vercel. Your **normal Gmail password will NOT work**.

### Option A — Fix Gmail (App Password)

1. Open https://myaccount.google.com/security  
2. Turn **ON** → **2-Step Verification** (required)  
3. Search **App passwords** (or: Security → App passwords)  
4. Create app: name `Vaibhavam Website` → **Create**  
5. Copy the **16-character password** (example: `abcd efgh ijkl mnop`)  
6. Vercel → **Settings** → **Environment Variables** → edit:
   - `GMAIL_USER` = `Vaibhavambyvarun@gmail.com` (exact account)
   - `GMAIL_APP_PASSWORD` = paste the 16 characters (spaces are OK)
7. **Deployments** → ⋯ on latest → **Redeploy** (mandatory)

**Common mistakes**
- Using normal Gmail password ❌  
- 2-Step Verification OFF ❌  
- Added env vars but did not **Redeploy** ❌  
- App password from a different Google account ❌  

---

### Option B — Web3Forms (easier, recommended if Gmail fails)

1. Go to https://web3forms.com → **Create Access Key** (free)  
2. Verify your email when asked  
3. Vercel → **Environment Variables** → add:
   - `WEB3FORMS_ACCESS_KEY` = your access key from Web3Forms  
4. **Redeploy**  
5. You can **remove** `GMAIL_APP_PASSWORD` if you want (Web3Forms will send emails)

Web3Forms sends the PDF to your inbox and CCs the customer.

---

## Google Sheet (CRM)

Data is sent automatically. If you still see N/A, open Apps Script and paste the latest `Code.gs` from this folder, then redeploy the web app.

---

## Test

Complete a quote at https://vaibhavam-photography.vercel.app/quote.html  

Success message: *"Quotation PDF sent to your email and the Vaibhavam team."*
