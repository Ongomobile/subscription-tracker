// =============================================
// Subscription Tracker — Google Apps Script
// =============================================
//
// SETUP:
//  1. In Google Sheets: Extensions → Apps Script → paste this file
//  2. Deploy → New deployment → Web app
//       Execute as: Me
//       Who has access: Anyone
//  3. Copy the web app URL and paste it into the Settings panel in the app
//  4. Add a daily trigger: Triggers → Add trigger → sendRenewalEmails
//       Event source: Time-driven → Day timer → choose a time (e.g. 8am)
//
// =============================================

const SUBSCRIPTIONS_SHEET = 'Subscriptions';
const SETTINGS_SHEET      = 'Settings';

// ---- HTTP handlers ----

function doGet(e) {
  const action = (e.parameter && e.parameter.action) || '';
  if (action === 'getSubscriptions') return respond(getSubscriptions());
  if (action === 'getSettings')      return respond(getSettings());
  return respond({ error: 'Unknown action: ' + action });
}

function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (_) {
    return respond({ error: 'Invalid JSON in request body' });
  }

  const action = payload.action || '';
  if (action === 'saveSubscriptions') {
    saveSubscriptions(payload.subscriptions || []);
    return respond({ success: true });
  }
  if (action === 'saveSettings') {
    saveSettings(payload.settings || {});
    return respond({ success: true });
  }
  return respond({ error: 'Unknown action: ' + action });
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Subscriptions ----

function getSubscriptions() {
  const sheet  = getOrCreateSheet(SUBSCRIPTIONS_SHEET);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return { subscriptions: [] };

  const headers       = values[0];
  const subscriptions = values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
  return { subscriptions };
}

function saveSubscriptions(subscriptions) {
  const sheet   = getOrCreateSheet(SUBSCRIPTIONS_SHEET);
  const headers = ['id', 'company', 'price', 'renewalDate', 'frequency', 'paymentMethod', 'notes'];
  sheet.clearContents();
  if (!subscriptions.length) return;
  const rows = subscriptions.map(sub => headers.map(h => sub[h] !== undefined ? sub[h] : ''));
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

// ---- Settings ----

function getSettings() {
  const sheet  = getOrCreateSheet(SETTINGS_SHEET);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return { email: '', notifyDaysBefore: 7 };
  return {
    email:            String(values[1][0] || ''),
    notifyDaysBefore: Number(values[1][1]) || 7,
  };
}

function saveSettings(settings) {
  const sheet = getOrCreateSheet(SETTINGS_SHEET);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 2).setValues([['email', 'notifyDaysBefore']]);
  sheet.getRange(2, 1, 1, 2).setValues([[
    settings.email            || '',
    settings.notifyDaysBefore || 7,
  ]]);
}

// ---- Email reminders ----
// Attach this to a daily time-based trigger in the Apps Script dashboard.

function sendRenewalEmails() {
  const settings = getSettings();
  if (!settings.email) {
    Logger.log('No notification email configured — skipping.');
    return;
  }

  const { subscriptions } = getSubscriptions();
  const daysBefore        = Number(settings.notifyDaysBefore) || 7;

  // Notify on the configured day AND again on the day itself
  const due = subscriptions.filter(sub => {
    const d = daysUntilNextRenewal(sub);
    return d === daysBefore || d === 0;
  });

  if (!due.length) {
    Logger.log('No renewals due today — no email sent.');
    return;
  }

  const lines = due.map(sub => {
    const d    = daysUntilNextRenewal(sub);
    const when = d === 0 ? 'TODAY' : d === 1 ? 'tomorrow' : 'in ' + d + ' days';
    return '• ' + sub.company + '  ($' + Number(sub.price).toFixed(2) +
           ' / ' + (sub.frequency || 'Monthly') + ')  —  renews ' + when;
  }).join('\n');

  const count   = due.length;
  const subject = '🔔 ' + count + ' subscription' + (count > 1 ? 's' : '') + ' renewing soon';
  const body    =
    'Hi,\n\n' +
    'Here are your upcoming subscription renewals:\n\n' +
    lines + '\n\n' +
    'Open your Subscription Tracker to review, update, or cancel before the charge hits.\n\n' +
    '— Your Subscription Tracker';

  GmailApp.sendEmail(settings.email, subject, body);
  Logger.log('Reminder sent to ' + settings.email + ' for: ' + due.map(s => s.company).join(', '));
}

// ---- Helpers ----

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

// Mirrors the same rolling logic used in the front-end
function daysUntilNextRenewal(sub) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(sub.renewalDate);
  next.setHours(0, 0, 0, 0);
  const freq = sub.frequency || 'Monthly';
  if (next < today) {
    if (freq === 'Monthly') {
      while (next < today) next.setMonth(next.getMonth() + 1);
    } else if (freq === 'Quarterly') {
      while (next < today) next.setMonth(next.getMonth() + 3);
    } else {
      while (next < today) next.setFullYear(next.getFullYear() + 1);
    }
  }
  return Math.ceil((next - today) / 864e5);
}
