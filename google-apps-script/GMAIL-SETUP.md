# Gmail Setup for Vaibhavam Quotation Emails

Your Vercel project already has `GMAIL_USER` and `GMAIL_APP_PASSWORD` set.  
The **535 error** means the password value is wrong — use the steps below to fix it.

---

## Step 1 — Turn on 2-Step Verification

1. Open https://myaccount.google.com/security  
2. Click **2-Step Verification** → turn it **ON**  
3. Complete setup with your phone  

(App Passwords do not exist until 2-Step Verification is on.)

---

## Step 2 — Create an App Password

1. On the same Security page, search **App passwords**  
   - Or open: https://myaccount.google.com/apppasswords  
2. Sign in again if asked  
3. **Select app:** Mail  
4. **Select device:** Windows Computer (or Other)  
5. Click **Generate**  
6. Google shows **16 characters** in a yellow box, e.g. `abcd efgh ijkl mnop`  
7. **Copy all 16 characters** (you will not see this again)

---

## Step 3 — Update Vercel (replace the old password)

1. https://vercel.com → your project **vaibhavam-photography**  
2. **Settings** → **Environment Variables**  
3. Click **GMAIL_APP_PASSWORD** → **Edit**  
4. Paste the **new 16-character App Password** only  
   - Not your normal Gmail password  
   - Spaces are OK (they are removed automatically)  
5. Confirm **GMAIL_USER** is exactly: `Vaibhavambyvarun@gmail.com`  
6. Click **Save**

---

## Step 4 — Redeploy (required)

1. **Deployments** tab  
2. On the latest deployment → **⋯** (three dots) → **Redeploy**  
3. Wait until status is **Ready**

Env changes do **not** apply until you redeploy.

---

## Step 5 — Test

1. Open https://vaibhavam-photography.vercel.app/quote.html  
2. Complete a test quote  
3. You should see: **“Quotation PDF sent to your email and the Vaibhavam team.”**  
4. Check inbox and spam for `Vaibhavambyvarun@gmail.com` and the test customer email  

---

## Still failing?

| Problem | Fix |
|--------|-----|
| No “App passwords” option | Turn on 2-Step Verification first |
| 535 error again | Delete `GMAIL_APP_PASSWORD`, create a **new** App Password, paste, Redeploy |
| Wrong account | App Password must be for the same account as `GMAIL_USER` |
| Google Workspace email | Admin may need to allow App Passwords for your domain |

---

## Your Vercel variables (keep these)

| Key | Value |
|-----|--------|
| `GMAIL_USER` | `Vaibhavambyvarun@gmail.com` |
| `GMAIL_APP_PASSWORD` | 16-character App Password from Step 2 |
| `ADMIN_EMAIL` | `Vaibhavambyvarun@gmail.com` |
| `ADMIN_PHONE` | `918639972913` |
