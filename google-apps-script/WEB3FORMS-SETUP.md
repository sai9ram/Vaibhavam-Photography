# Web3Forms Email Setup (5 minutes)

## Step 1 — Get your free access key

1. Go to **https://web3forms.com**
2. Enter **Vaibhavambyvarun@gmail.com** (where you want to receive leads)
3. Click **Create Access Key**
4. Check your inbox and verify your email if asked
5. Copy the **Access Key** (long string like `a1b2c3d4-....`)

---

## Step 2 — Paste key in the website (easiest)

1. Open `quote.html` in your project
2. Find this line near the top of the script section:

```javascript
const WEB3FORMS_ACCESS_KEY = 'PASTE_YOUR_WEB3FORMS_ACCESS_KEY_HERE';
```

3. Replace with your real key:

```javascript
const WEB3FORMS_ACCESS_KEY = 'your-actual-access-key-here';
```

4. Save the file
5. Deploy to Vercel again (`vercel deploy --prod`) or push to GitHub if auto-deploy is on

---

## Step 2 (alternative) — Vercel environment variable

1. Vercel → **vaibhavam-photography** → **Settings** → **Environment Variables**
2. Add:
   - **Key:** `WEB3FORMS_ACCESS_KEY`
   - **Value:** your access key from Step 1
   - **Environment:** Production
3. **Redeploy**

You can remove `GMAIL_USER` and `GMAIL_APP_PASSWORD` from Vercel if you no longer use Gmail.

---

## Step 3 — Test

1. Open https://vaibhavam-photography.vercel.app/quote.html
2. Complete a test quote with your real email
3. You should see: **“Quotation PDF sent to your email and the Vaibhavam team.”**
4. Check **Vaibhavambyvarun@gmail.com** and the customer email (and spam folder)

---

## How it works

- PDF is sent via Web3Forms with the quotation attached
- **Admin** (`Vaibhavambyvarun@gmail.com`) receives the main email
- **Customer** is CC’d on the same email with the PDF
- Google Sheet logging still works separately
