# GitHub Secrets Configuration

## How to Add Secrets to GitHub

1. Go to your GitHub repository: https://github.com/YOUR-USERNAME/YOUR-REPO
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each secret below

---

## Secrets to Add

### 1. DATABASE_URL
**Name:** `DATABASE_URL`
**Value:**
```
postgresql://neondb_owner:npg_XhQD5GOJ2eUK@ep-broad-mountain-abn7sjzt-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

---

### 2. RESEND_API_KEY
**Name:** `RESEND_API_KEY`
**Value:**
```
re_SBAUUAjD_HRDJDWM2mirGPjk5oJMys3na
```

---

### 3. EMAIL_FROM
**Name:** `EMAIL_FROM`
**Value:**
```
ISBN Scout <noreply@isbnscout.com>
```

---

### 4. EMAIL_REPLY_TO
**Name:** `EMAIL_REPLY_TO`
**Value:**
```
support@isbnscout.com
```

---

### 5. APP_URL
**Name:** `APP_URL`
**Value:**
```
https://isbnscout.com
```

---

## Visual Guide

For each secret:
1. Click "New repository secret" (green button)
2. Enter the **Name** exactly as shown (case-sensitive!)
3. Copy the **Value** and paste it
4. Click "Add secret"
5. Repeat for all 5 secrets

You should see all 5 secrets listed when done!
