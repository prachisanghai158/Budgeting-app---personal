# 💰 P&S Budget — PWA Setup Guide

## Step 1: Get a free Firebase database (5 minutes)

1. Go to **https://console.firebase.google.com**
2. Click **"Create a project"** → name it anything (e.g. `ps-budget`)
3. Disable Google Analytics if asked → **Create project**
4. In the left sidebar, click **Build → Realtime Database**
5. Click **"Create Database"**
6. Choose your region (e.g. `asia-southeast1` for India)
7. Select **"Start in test mode"** → Enable
8. Copy the database URL — it looks like:
   `https://ps-budget-xxxxx-default-rtdb.asia-southeast1.firebasedatabase.app`

**Both phones will use this same URL to sync data.**

---

## Step 2: Host on GitHub Pages (5 minutes)

1. Go to **https://github.com** and sign in
2. Click **"New repository"**
3. Name it `ps-budget` → make it **Public** → Create
4. Click **"uploading an existing file"**
5. Upload all these files:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `icon-192.png`
   - `icon-512.png`
6. Click **Commit changes**
7. Go to **Settings → Pages**
8. Under "Source", select **main branch** → Save
9. Your app will be live at:
   `https://YOUR-USERNAME.github.io/ps-budget`

---

## Step 3: Add to home screen

### iPhone (Safari)
1. Open your GitHub Pages URL in **Safari**
2. Tap the **Share button** (box with arrow)
3. Scroll down → tap **"Add to Home Screen"**
4. Tap **Add**

### Android (Chrome)
1. Open your GitHub Pages URL in **Chrome**
2. Tap the **three dots menu**
3. Tap **"Add to Home screen"** (or "Install app")
4. Tap **Add**

---

## Step 4: First launch

On each phone:
1. Open the app from your home screen
2. You'll see a setup screen asking for your Firebase URL
3. Paste in the URL from Step 1
4. Tap **Save & Start**

That's it — both phones now share the same data in real time! ☁️

---

## Tips

- Tap **🔄 Refresh** anytime to pull latest data from the other phone
- Go to **Settings → Cloud Sync** to change the Firebase URL if needed
- Use **Settings → Backup & Export** to download a JSON backup anytime
- The app works offline — your entries save locally and sync when you reconnect
