# Subscription Tracker

A single-file web app to track recurring subscriptions, see upcoming renewals, and never get surprised by a charge. Built as a teaching project for absolute beginners using Claude Code.

The repo contains **two versions of the same app**, intended to be taught as a two-part lesson:

## Two versions, two lessons

### Lesson 1 — `index.html` (Google Sheets backend)

- **What it teaches:** how far you can get with no real backend — just an HTML file, localStorage, and a free Google Apps Script that talks to a Google Sheet.
- **Auth model:** none — security is "obscure the URL".
- **Where data lives:** browser localStorage + your private Google Sheet.
- **Email reminders:** ✅ via a daily Apps Script trigger that emails you before renewals.
- **Setup guide:** [`GOOGLE_SHEETS_SETUP.md`](GOOGLE_SHEETS_SETUP.md)
- **Beginner tutorial:** [`LOCAL_STORAGE_TUTORIAL.md`](LOCAL_STORAGE_TUTORIAL.md)

This is the right entry point for someone who has never built a web app. It works end-to-end with zero accounts beyond a Google account.

### Lesson 2 — `firebase.html` (Firebase backend)

- **What it teaches:** what changes when you bring in real authentication and a real cloud database. The contrast with Lesson 1 is the lesson.
- **Auth model:** Google Sign-In via Firebase Auth.
- **Where data lives:** Cloud Firestore, scoped to your user ID, enforced by server-side security rules.
- **Sync model:** real-time — changes on one device appear on all others within ~1 second, no refresh.
- **Setup guide:** [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md)

This is what a "real" personal app looks like. Server-enforced access control, real-time sync, no URL-sharing or PIN hacks.

### Lesson 3 — Cloud Functions email reminders (optional, builds on Lesson 2)

- **What it teaches:** scheduled serverless functions, secrets management, third-party API integration. The "back-end automation" pattern every real app eventually needs.
- **What it does:** runs daily, scans every user's subscriptions, emails a digest of anything renewing in 7 days or 1 day via Resend.
- **Stack:** Cloud Functions for Firebase + Resend API.
- **Setup guide:** [`EMAIL_REMINDERS_SETUP.md`](EMAIL_REMINDERS_SETUP.md)
- **Source:** [`functions/index.js`](functions/index.js)

Requires the Firebase Blaze (pay-as-you-go) plan, but realistically costs $0 — the free tier covers ~2 million function invocations per month and this uses about 30.

## Why both?

Most tutorials skip the "why" of authentication and databases. By building Lesson 1 first, students *feel* the limits — "wait, anyone with this URL can see my data" — and then Lesson 2 is the answer to a problem they actually experienced. Concepts like security rules, auth state, and real-time listeners land harder when they fix something the student already knows is broken.

## Quick start

Pick a version, follow its setup guide, then open the corresponding `.html` file in any browser. No build step, no npm, no terminal commands.
