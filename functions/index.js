// =============================================================================
// Subscription Tracker — Cloud Functions
// =============================================================================
//
// Scheduled function that runs daily, finds subscriptions renewing in
// NOTIFY_DAYS days (or today), and emails a digest to each user via Resend.
//
// Deploy:   firebase deploy --only functions
// Logs:     firebase functions:log
// Schedule: see TIMEZONE and the `schedule` option below
// =============================================================================

const { onSchedule }    = require('firebase-functions/v2/scheduler');
const { setGlobalOptions } = require('firebase-functions/v2');
const { defineSecret }  = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore }  = require('firebase-admin/firestore');
const { getAuth }       = require('firebase-admin/auth');

initializeApp();
setGlobalOptions({ region: 'us-central1' });

// ---- Configuration ----------------------------------------------------------

// Change to your local timezone (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
const TIMEZONE = 'America/Los_Angeles';

// Send a reminder when next renewal is exactly N days away.
// e.g. [7, 1] sends one week before, then again the day before.
const NOTIFY_DAYS = [7, 1];

// Resend's test sender — works for any "from" address but only delivers to
// the email that owns your Resend account. For production / multi-user, verify
// a domain at resend.com/domains and replace this with your verified address.
const FROM_ADDRESS = 'Subscription Tracker <onboarding@resend.dev>';

// Resend API key — set with: firebase functions:secrets:set RESEND_API_KEY
const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

// ---- Scheduled function -----------------------------------------------------

exports.sendRenewalReminders = onSchedule(
  {
    schedule: 'every day 08:00',
    timeZone: TIMEZONE,
    secrets:  [RESEND_API_KEY],
  },
  async () => {
    const db   = getFirestore();
    const auth = getAuth();

    // Pull every subscription across every user with one collection-group query
    const snapshot = await db.collectionGroup('subscriptions').get();

    // Group them by their parent userId
    const byUser = new Map();
    snapshot.forEach((docSnap) => {
      const userId = docSnap.ref.parent.parent.id;
      const list   = byUser.get(userId) || [];
      list.push({ id: docSnap.id, ...docSnap.data() });
      byUser.set(userId, list);
    });

    let emailsSent = 0;
    for (const [userId, subs] of byUser) {
      const due = subs.filter((sub) => NOTIFY_DAYS.includes(daysUntilNextRenewal(sub)));
      if (due.length === 0) continue;

      let user;
      try {
        user = await auth.getUser(userId);
      } catch (err) {
        console.warn(`Could not look up user ${userId}: ${err.message}`);
        continue;
      }
      if (!user.email) {
        console.warn(`User ${userId} has no email — skipping`);
        continue;
      }

      try {
        await sendReminderEmail(user.email, user.displayName || 'there', due);
        emailsSent++;
        console.log(`Sent reminder to ${user.email} for ${due.length} subscription(s)`);
      } catch (err) {
        console.error(`Failed to email ${user.email}: ${err.message}`);
      }
    }

    console.log(`Done. Sent ${emailsSent} reminder email(s).`);
  }
);

// ---- Helpers ----------------------------------------------------------------

// Mirrors the client-side rolling renewal logic — past dates roll forward by
// the billing interval until they land in the future. Returns whole days away.
function daysUntilNextRenewal(sub) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse YYYY-MM-DD as local midnight to avoid UTC drift
  const [y, m, d] = String(sub.renewalDate).split('-').map(Number);
  const next = new Date(y, m - 1, d);

  const freq = sub.frequency || 'Monthly';
  while (next < today) {
    if (freq === 'Monthly')        next.setMonth(next.getMonth() + 1);
    else if (freq === 'Quarterly') next.setMonth(next.getMonth() + 3);
    else                           next.setFullYear(next.getFullYear() + 1);
  }
  return Math.ceil((next - today) / 86_400_000);
}

async function sendReminderEmail(to, name, subs) {
  const lines = subs
    .map((sub) => {
      const days = daysUntilNextRenewal(sub);
      const when = days === 0 ? 'TODAY' : days === 1 ? 'tomorrow' : `in ${days} days`;
      const price = Number(sub.price).toFixed(2);
      const freq  = sub.frequency || 'Monthly';
      return `• ${sub.company}  ($${price} / ${freq})  —  renews ${when}`;
    })
    .join('\n');

  const count   = subs.length;
  const subject = `🔔 ${count} subscription${count === 1 ? '' : 's'} renewing soon`;
  const body =
    `Hi ${name},\n\n` +
    `Here's a heads-up on your upcoming subscription renewals:\n\n` +
    `${lines}\n\n` +
    `Open your Subscription Tracker to review or cancel before the charge hits.\n\n` +
    `— Your Subscription Tracker`;

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY.value()}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    FROM_ADDRESS,
      to,
      subject,
      text:    body,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend API ${res.status}: ${errText}`);
  }
}
