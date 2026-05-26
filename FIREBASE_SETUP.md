# Firebase Setup — Lesson 2

This is the **Firebase version** of the Subscription Tracker. It replaces the Google Sheets backend (Lesson 1) with real authentication and a real cloud database. Data syncs across all your devices in real time, and only the signed-in user can read or write their own data.

**Time required:** about 10 minutes, one-time setup.

---

## What you'll end up with

- Sign in once with Google on any device
- Add a subscription on your phone → it appears on your laptop within a second, no refresh
- Server-enforced security: even if someone has the URL, they see nothing without signing in to *your* Google account
- All free — Firebase's free tier is generous enough for a personal app

---

## Step 1 — Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and sign in with Google
2. Click **Create a project**
3. Name it (e.g. `subscription-tracker`) and continue
4. Disable Google Analytics for this project (not needed) and click **Create project**
5. Wait ~30 seconds, then click **Continue**

---

## Step 2 — Enable Google Sign-In

1. In the Firebase console left menu, click **Build → Authentication**
2. Click **Get started**
3. On the **Sign-in method** tab, click **Google**
4. Toggle **Enable** on
5. Pick a support email (your own)
6. Click **Save**

---

## Step 3 — Create the Firestore database

1. In the left menu, click **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll set proper rules in the next step)
4. Pick a location near you (e.g. `us-central` or `europe-west`) — this can't be changed later
5. Click **Enable**

---

## Step 4 — Set the security rules

This is the most important step. The rules tell the server **only the signed-in user can read or write their own data**.

1. On the Firestore page, click the **Rules** tab
2. Replace whatever's there with this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/subscriptions/{subscriptionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**

That's it — your data is now locked down on the server side. The Firebase server itself checks every request and rejects anything that isn't from a signed-in user accessing *their own* data.

---

## Step 5 — Get your Firebase config

1. Click the gear icon ⚙️ at the top of the left menu → **Project settings**
2. Scroll down to **Your apps**
3. Click the **`</>`** (web) icon to add a web app
4. Give it a nickname (e.g. `Subscription Tracker Web`) — leave Firebase Hosting **unchecked**
5. Click **Register app**
6. You'll see a code block with a `firebaseConfig = { … }` object. Copy that whole object.

---

## Step 6 — Paste the config into `firebase.html`

1. Open `firebase.html` in VS Code
2. Find the block that starts with `const firebaseConfig = {` (around line 200)
3. Replace it with the object you copied from Firebase
4. Save the file

It should look something like this when you're done:

```js
const firebaseConfig = {
  apiKey:            "AIzaSyA...",
  authDomain:        "subscription-tracker-abc.firebaseapp.com",
  projectId:         "subscription-tracker-abc",
  storageBucket:     "subscription-tracker-abc.appspot.com",
  messagingSenderId: "123456789012",
  appId:             "1:123456789012:web:abcdef…",
};
```

> **About publishing this:** The config values are safe to commit to GitHub and deploy publicly. Security comes from the rules in Step 4 — not from hiding the config. This is standard Firebase practice.

---

## Step 7 — Test locally

Firebase Sign-In does **not** work when you open an HTML file directly with `file://` in the browser — Google's auth servers reject local file origins. You need to serve the file through a tiny local web server. The easiest way in VS Code:

1. Open the **Extensions** panel (the squares icon in the left sidebar)
2. Search for **Live Server** (by Ritwick Dey) and install it
3. Right-click `firebase.html` in the VS Code file tree → **Open with Live Server**
4. Your browser opens at something like `http://127.0.0.1:5500/firebase.html`
5. The sign-in screen appears → click **Sign in with Google** → pick your account
6. You're in! Add a subscription to test it.

`localhost` and `127.0.0.1` are already in Firebase's allowed list by default, so this works immediately with no extra config.

> Don't have Live Server? Any local server works: `python3 -m http.server 8000` from the project folder, then visit `http://localhost:8000/firebase.html`.

---

## Step 8 — Authorize your Netlify domain (if deploying)

If you're deploying the app to Netlify (or any other host), Firebase needs to know that domain is allowed to use authentication.

1. Back in the Firebase console → **Authentication → Settings → Authorized domains**
2. Click **Add domain**
3. Enter your Netlify URL (e.g. `your-app.netlify.app`)
4. Click **Add**

Without this, Google Sign-In will fail on Netlify with an "auth/unauthorized-domain" error.

---

## How it all fits together

```
Your browser (firebase.html)
       │
       │  signs in via Google popup
       ▼
   Firebase Auth ── gives you a user ID (uid)
       │
       │  every read/write includes your uid
       ▼
  Cloud Firestore
       │
       │  checks security rules:
       │  "is request.auth.uid == the userId in the path?"
       │  ✅ yes → allows the operation
       │  ❌ no  → rejects with permission denied
       ▼
  users/{your-uid}/subscriptions/{subscriptionId}
```

The key idea: **the server enforces access control**, not the client. Even if someone modified the JavaScript in the browser to try to read another user's data, the Firestore server would reject the request because the rules check the authenticated user ID against the document path.

This is the leap from Lesson 1's "secret URL = auth" model to real authentication.

---

## Troubleshooting

**"Setup Required" message on first load**
You haven't pasted your Firebase config yet — see Step 6.

**"auth/unauthorized-domain" error when signing in**
Add your domain to Firebase → Authentication → Settings → Authorized domains (Step 8).

**"Missing or insufficient permissions" error after signing in**
Your security rules aren't published yet — go back to Step 4 and click Publish.

**Sign-in popup is blocked**
Allow popups for the page in your browser, then try again.

**Data doesn't sync between devices**
Make sure both devices are signed in to the **same Google account**. Different accounts = different data.

---

## What's different from Lesson 1

| | Lesson 1 (Sheets) | Lesson 2 (Firebase) |
|---|---|---|
| Auth | None (Script URL = "secret") | Real Google Sign-In |
| Server enforces access | ❌ | ✅ (Firestore rules) |
| Real-time sync | ❌ (manual refresh) | ✅ (instant) |
| Per-device setup | Script URL + PIN | Just sign in |
| CORS issues | Yes | None |
| Email reminders | ✅ (Apps Script trigger) | Not included (would need Cloud Functions) |
| Data visible as | Spreadsheet | Firebase console |

Both are still in this repo. The Sheets version (`index.html`) is great for learning the limits of "no backend"; the Firebase version (`firebase.html`) shows how a real auth/database setup solves those limits.
