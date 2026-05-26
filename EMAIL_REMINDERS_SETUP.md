# Email Reminders Setup (Cloud Functions)

This adds **automatic email reminders** to the Firebase version of the app. Once a day, a scheduled Cloud Function checks every user's subscriptions and emails them a digest of anything renewing in 7 days or 1 day.

**Time required:** about 15–20 minutes, one-time setup.

**What you'll need to pay:** $0 in practice. The Blaze plan requires a credit card, but the free tier covers ~2 million function invocations per month and this app uses ~30 per month.

---

## Step 1 — Upgrade Firebase to the Blaze plan

Scheduled functions require Blaze (pay-as-you-go). The free tier still applies — you just can't *enable* scheduling on the Spark (free) plan.

1. Firebase Console → ⚙️ → **Usage and billing** → **Modify plan**
2. Select **Blaze (Pay as you go)** → click **Continue**
3. Link a Google Cloud billing account (create one if needed — needs a credit card)

### Set a budget alert immediately (do not skip)

This is your safety net. Even though you'll realistically pay $0, set a budget alert so you're notified before anything could go wrong.

1. In the Blaze upgrade flow, click **Set budget alert**
2. Enter `1` USD as the budget
3. Confirm alert email
4. Click Save

Now if your spend ever exceeds $1 in a month, you'll get an email. (For this app, it won't.)

---

## Step 2 — Sign up for Resend

[Resend](https://resend.com) is the email API. The free tier gives you 3,000 emails/month and 100/day. No credit card required.

1. Go to [resend.com](https://resend.com) → **Sign Up** (use the same Google account you use for the app — see "Test domain limitation" below)
2. After signup, go to **API Keys** → **Create API Key**
3. Name it something like `subscription-tracker`, full access, click **Add**
4. **Copy the key** (`re_...`) — you'll only see it once

### Test domain limitation (important)

The function uses Resend's free test sender, `onboarding@resend.dev`. That sender can only deliver emails to **the email address that owns your Resend account**. Since this is a personal app and you'll be the only recipient, this is fine — just make sure your Resend account uses the same email you sign in to the app with.

If you ever want to send to other email addresses, verify a domain at resend.com/domains and update `FROM_ADDRESS` at the top of [functions/index.js](functions/index.js).

---

## Step 3 — Install the Firebase CLI

If you've never used Firebase from the command line before:

```bash
npm install -g firebase-tools
```

(You need Node.js installed first — download from [nodejs.org](https://nodejs.org) if needed.)

Verify the install:

```bash
firebase --version
```

---

## Step 4 — Connect this project to your Firebase project

From the project root:

```bash
firebase login
firebase use --add
```

`firebase use --add` will list your Firebase projects — pick the one you set up earlier and give it the alias `default`. This writes your project ID into `.firebaserc`.

---

## Step 5 — Install function dependencies

```bash
cd functions
npm install
cd ..
```

This installs `firebase-admin` and `firebase-functions` into `functions/node_modules`.

---

## Step 6 — Set your Resend API key as a secret

Cloud Functions has a built-in secret manager — never hard-code keys in your source.

```bash
firebase functions:secrets:set RESEND_API_KEY
```

It will prompt you to paste the key. Paste the `re_...` value from Step 2 and hit Enter.

---

## Step 7 — Configure your timezone

Open [functions/index.js](functions/index.js) and find this line near the top:

```js
const TIMEZONE = 'America/Los_Angeles';
```

Change it to your local timezone. Some common values:

| Region | Value |
|---|---|
| US East | `America/New_York` |
| US Central | `America/Chicago` |
| US Pacific | `America/Los_Angeles` |
| UK | `Europe/London` |
| Central Europe | `Europe/Paris` |
| India | `Asia/Kolkata` |
| Sydney | `Australia/Sydney` |

[Full list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) — use the `TZ identifier` column.

The function runs at **8 AM** in this timezone. To change the time, edit the `schedule` line just below.

---

## Step 8 — Deploy

```bash
firebase deploy --only functions
```

First deploy takes 2–5 minutes (it provisions Cloud Scheduler, enables APIs, etc.). After that, deploys are ~30 seconds.

You should see output ending in something like:
```
✔  functions[sendRenewalReminders(us-central1)] Successful create operation.
```

---

## Step 9 — Test it without waiting until tomorrow

Don't wait until 8 AM to find out if it works. Trigger it manually from the Google Cloud Console:

1. Open [Cloud Scheduler](https://console.cloud.google.com/cloudscheduler) (sign in with the same Google account)
2. Pick your Firebase project at the top
3. Find the job named `firebase-schedule-sendRenewalReminders-us-central1`
4. Click the **⋮** menu → **Force run**
5. Within ~30 seconds, check your inbox — if any subscription is renewing in 7 or 1 day, you'll get the email

Check the logs to see what happened:

```bash
firebase functions:log
```

You should see lines like:
```
Sent reminder to you@gmail.com for 2 subscription(s)
Done. Sent 1 reminder email(s).
```

If no subscription is currently 7 days or 1 day away, the function will run and log `Sent 0 reminder email(s)`. Either add a test subscription with a renewal date 7 or 1 day from today, or wait until one of yours hits that window.

---

## Troubleshooting

**"Cloud Functions requires Blaze"** — Step 1 not completed.

**Deploy fails with "Permission denied"** — Run `firebase login --reauth`.

**Function deploys but no email arrives** — Check [Cloud Scheduler logs](https://console.cloud.google.com/cloudscheduler) and `firebase functions:log`. Most likely cause: no subscription is currently 7 or 1 day away.

**"Resend API 403: Email address is not allowed"** — You're trying to email an address that isn't the owner of your Resend account. Either sign up for Resend with that address, or verify a domain (see Step 2 "Test domain limitation").

**You want to change to 3 days, or just 1 day, etc.** — Edit `NOTIFY_DAYS` at the top of [functions/index.js](functions/index.js), then redeploy with `firebase deploy --only functions`.

---

## How it all fits together

```
Cloud Scheduler  ──daily at 08:00──▶  Cloud Function (sendRenewalReminders)
                                         │
                                         │  reads collection group
                                         ▼
                                    Cloud Firestore
                                    (every users/{uid}/subscriptions/*)
                                         │
                                         │  for each user with due renewals:
                                         ▼
                                    Firebase Admin Auth
                                    (look up user's email)
                                         │
                                         ▼
                                    Resend API
                                         │
                                         ▼
                                    Your inbox 📧
```

The function code is in [functions/index.js](functions/index.js). The whole thing is about 110 lines.
