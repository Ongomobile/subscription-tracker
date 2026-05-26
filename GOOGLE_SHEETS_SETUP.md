# Google Sheets + Email Reminder Setup

This guide connects your Subscription Tracker to Google Sheets so your data is saved in the cloud and you get automatic email reminders before renewals.

**Time required:** about 10–15 minutes, done once.

---

## What you'll end up with

- All your subscriptions stored in a Google Sheet (visible, editable, backed up)
- Automatic email reminders sent to you X days before each renewal
- Data synced across any device or browser

---

## Step 1 — Create a Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and sign in
2. Click **Blank** to create a new spreadsheet
3. Name it **Subscription Tracker** (click "Untitled spreadsheet" at the top)
4. Leave it open — you'll come back to it in a moment

---

## Step 2 — Open Apps Script

1. In your Google Sheet, click the menu: **Extensions → Apps Script**
2. A new tab will open with a code editor
3. Delete everything you see in the editor (select all, then delete)
4. Open the file `Code.gs` from this project
5. Copy the entire contents and paste it into the Apps Script editor
6. Click **Save** (the floppy disk icon, or Cmd/Ctrl + S)

---

## Step 3 — Deploy as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
3. Fill in the settings:
   - **Description:** Subscription Tracker
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. If prompted, click **Authorize access** and sign in with your Google account
   - You may see a warning "Google hasn't verified this app" — click **Advanced → Go to Subscription Tracker (unsafe)**
   - This is your own script, so it's safe
6. After deploying, you'll see a **Web app URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
7. **Copy this URL** — you'll need it in the next step

---

## Step 4 — Connect the App

1. Open your `index.html` file in a browser
2. Click the **⚙️ Settings** button
3. Paste the Apps Script URL into the **Apps Script URL** field
4. Enter your email address in the **Notification Email** field
5. Set **Days before renewal** (e.g. 7 for one week's notice)
6. Click **Save Settings**

The app will immediately sync with Google Sheets. You'll see "☁️ Synced with Google Sheets" appear below the title.

---

## Step 5 — Set up the daily email trigger

The email reminder runs automatically on a schedule. You need to set that schedule once.

1. Go back to the Apps Script editor
2. In the left sidebar, click the **clock icon** (Triggers)
3. Click **+ Add Trigger** (bottom right)
4. Fill in the trigger settings:
   - **Choose which function to run:** `sendRenewalEmails`
   - **Choose which deployment should run:** Head
   - **Select event source:** Time-driven
   - **Select type of time based trigger:** Day timer
   - **Select time of day:** Pick a time (e.g. 8am–9am)
5. Click **Save**

That's it! The script will now check your subscriptions every day at that time and send you an email whenever a renewal is coming up.

---

## How it all works together

```
Your browser app
      │
      │  reads/writes via HTTPS
      ▼
Google Apps Script (your Code.gs)
      │
      │  reads/writes
      ▼
Google Sheet (your data)

Daily trigger at 8am
      │
      │  checks renewals → sends Gmail
      ▼
Your inbox 📧
```

---

## Troubleshooting

**"Sync failed — data saved locally" appears**
- Double-check the Apps Script URL in Settings — make sure it ends in `/exec`
- Make sure the deployment is set to "Who has access: Anyone"
- Try redeploying: in Apps Script → Deploy → Manage deployments → edit → save new version

**Not receiving emails**
- Check your Google Sheet has a "Settings" tab with your email in it
- In Apps Script, go to Triggers and confirm the `sendRenewalEmails` trigger exists
- Run `sendRenewalEmails` manually (select the function in the editor → click Run) and check the Logs for output

**"Google hasn't verified this app" warning during auth**
- This is normal for personal scripts. Click Advanced → Go to [app name] (unsafe). Your script only has access to your own Google account.

**Changes not syncing**
- After editing the `Code.gs` file, you must create a new deployment (Deploy → New deployment) and update the URL in Settings — editing the code does not update existing deployments automatically.

---

## Updating the script later

If you change `Code.gs`:
1. Go to Apps Script → **Deploy → New deployment**
2. Copy the new URL
3. Open the app → ⚙️ Settings → paste the new URL → Save

---

## Privacy note

Your subscription data is stored only in your own Google Sheet, in your own Google account. The Apps Script runs under your account and only sends email to the address you configure. Nothing is sent to any third-party server.
