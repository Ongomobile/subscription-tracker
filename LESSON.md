# Build a Subscription Tracker with Claude Code
### A Beginner's Lesson in AI-Assisted Coding

---

## Welcome

In this lesson you will build a fully working **Subscription Tracker** web app — entirely by having a conversation with an AI coding tool called **Claude Code**. You do not need to know how to write code. You need to be able to describe what you want, read what Claude produces, and ask follow-up questions when something isn't right.

By the end you will have a working app that:
- Tracks all your subscriptions (Netflix, Spotify, cloud tools, etc.)
- Colour-codes renewals so you never get surprised by a charge
- Shows your total monthly spend broken down by type
- Exports your renewals to Google Calendar
- Stores everything locally in your browser — no server needed

The finished app lives in this repository. Use it as a reference if you get stuck.

---

## What is Claude Code?

**Claude Code** is a command-line tool made by Anthropic that lets you have a conversation with an AI (Claude) directly inside your Terminal. Instead of switching between a chat window and your code editor, Claude Code can read your files, write new ones, run commands, and explain everything it does — all without you leaving the terminal.

Think of it as a very knowledgeable coding partner who:
- Never gets tired or frustrated
- Always explains what it's doing if you ask
- Can be wrong sometimes — so you stay in the loop and review its work

---

## Before You Start

You will need:

1. **A computer** running macOS, Windows, or Linux
2. **Node.js** installed — download it free from [nodejs.org](https://nodejs.org)
3. **Claude Code** installed — once Node.js is ready, open Terminal and run:
   ```
   npm install -g @anthropic-ai/claude-code
   ```
4. **An Anthropic account** — sign up at [claude.ai](https://claude.ai) and connect it by running:
   ```
   claude
   ```
   and following the login prompt.

> **Tip:** A "terminal" is just a text window where you type commands. On Mac it is called Terminal (search for it in Spotlight). On Windows, use Command Prompt or PowerShell.

---

## How This Lesson Works

Each section below gives you:
- **What we're building** — a plain-English description of the feature
- **The prompt** — the exact text to paste into Claude Code
- **What to expect** — what Claude will do and what you should see

You will type each prompt inside a Claude Code session. To start a session, open your Terminal, navigate to a folder where you want your project to live, and type:

```
claude
```

---

## Part 1 — Create Your Project Folder

In Terminal, create a new folder and open Claude Code inside it:

```
mkdir subscription-tracker
cd subscription-tracker
claude
```

You are now inside a Claude Code session. Everything you type will be sent to Claude.

---

## Part 2 — Build the Basic App

### What we're building
A single HTML file with a header, a list of subscriptions stored in the browser, and an Add button that opens a form. Each subscription card will be colour-coded by how soon it renews.

### Your prompt

Paste this into Claude Code:

```
Create a single file called index.html for a Subscription Tracker web app.
Use Tailwind CSS loaded from a CDN (no build step needed).

The app should:
- Show a header with the title "Subscription Tracker" and the total monthly cost
- Let the user add, edit, and delete subscriptions
- Each subscription has: company name, price, renewal date, billing frequency
  (Monthly / Annual / Quarterly), and payment method
- Save everything to localStorage so data survives page refreshes
- Show each subscription as a card sorted by renewal date
- Colour-code cards: red if renewing within 3 days, yellow within 7 days,
  green otherwise
- Show a notification banner at the top listing any subscriptions renewing
  within 3 days
- Normalise Annual and Quarterly prices to a monthly equivalent for the
  total cost display
```

### What to expect
Claude will write the entire `index.html` file. It will explain what it created. Open the file in your browser (just double-click it) — you should see the header, an empty subscriptions list, and an Add Subscription button.

> **Try it:** Click "Add Subscription", fill in a few fake entries, and watch the colour-coding change as you set renewal dates close to today.

---

## Part 3 — Add CSV Import and Export

### What we're building
Buttons to export your subscriptions as a spreadsheet file (CSV) and import them back again. This makes it easy to back up your data or move it to another device.

### Your prompt

```
Add two buttons to the app:

1. "Export CSV" — downloads all subscriptions as a .csv file with columns:
   Company, Price, Renewal Date, Frequency, Payment Method
2. "Import CSV" — lets the user pick a .csv file and adds the rows to the
   existing subscriptions list (skip the header row)

Both buttons should sit alongside the existing Add Subscription button.
```

### What to expect
Two new buttons appear. Try exporting — a file called `subscriptions.csv` will download. Open it in Excel or Google Sheets. Then delete your subscriptions in the app and re-import the file to restore them.

---

## Part 4 — Add Google Calendar Export

### What we're building
A button that downloads an `.ics` file — a standard calendar format that Google Calendar, Apple Calendar, and Outlook all understand. Each subscription becomes a recurring calendar event on its renewal date.

### Your prompt

```
Add an "Export to Google Calendar" button. When clicked it should:
- Generate an .ics (iCalendar) file containing one recurring event per
  subscription
- Each event's title should be the company name and price
- Use a recurring rule matching the subscription frequency:
  Monthly → repeat monthly for 2 years
  Annual  → repeat yearly for 5 years
  Quarterly → repeat every 3 months for 4 years
- Each event should have a stable unique ID based on the subscription so
  that re-importing the file updates existing calendar events instead of
  creating duplicates
- After download, show an alert explaining how to import the file into
  Google Calendar
```

### What to expect
A red "📅 Export to Google Calendar" button appears. Clicking it downloads a file called `subscription-renewals.ics`. You can import this into Google Calendar via **Settings → Import & Export → Import**.

---

## Part 5 — Add a Notes Field

### What we're building
A free-text notes box on each subscription — useful for things like login URLs, cancellation instructions, or reminders to yourself ("cancel before renewal!").

### Your prompt

```
Add a "Notes" textarea field to the Add/Edit subscription form.
- Save notes to localStorage as part of each subscription
- Display notes on the subscription card below the other details,
  only when notes are not empty
- Include notes in the CSV export and import
- Include notes in the iCal event description
```

### What to expect
A Notes text box appears in the form. Any notes you type are saved and shown on the card. Try editing an existing subscription and adding a note — it should appear immediately on the card.

---

## Part 6 — Add Summary Stats

### What we're building
Extra stat cards in the header so you can see at a glance: how many days until your next annual renewal, how much you're paying monthly from annual plans, and your total monthly-only spend.

### Your prompt

```
Add three more stat cards to the header next to "Total Monthly Cost":

1. "Next Annual Renewal" — shows how many days until the next Annual
   subscription renews (e.g. "95 days", "Tomorrow", "Today!")
2. "Annual Subs / Month" — the total of all Annual subscription prices
   divided by 12 (the prorated monthly cost of your annual commitments)
3. "Monthly Subs Total" — the sum of all Monthly-frequency subscriptions
   at face value

All four cards should be the same size and sit in a responsive row that
wraps on small screens. Use different accent colours for each card.
```

### What to expect
Four colour-coded stat cards appear in the header. As you add, edit, or delete subscriptions all four update instantly.

---

## Understanding What You Built

Here is a plain-English tour of how the app works under the hood.

### localStorage
Your browser has a small built-in storage area called **localStorage**. It works like a notepad that survives page refreshes. The app reads subscriptions from it when the page loads and writes back every time you make a change. Nothing is sent to any server — all your data stays on your computer.

### The subscription object
Each subscription is stored as a JavaScript object — think of it like a row in a spreadsheet:
```
{
  id:            "abc-123",           ← unique identifier
  company:       "Netflix",
  price:         15.99,
  renewalDate:   "2026-06-01",
  frequency:     "Monthly",
  paymentMethod: "Credit Card",
  notes:         "Shared with family"
}
```

### Colour coding
Every time the page renders, the app calculates `today's date − renewal date` in days. If the result is ≤ 3 the card gets a red border, ≤ 7 gets yellow, anything else gets green. This logic runs live in the browser with no server needed.

### The iCal format
An `.ics` file is just a plain text file that follows a standard format calendar apps all understand. Each event block starts with `BEGIN:VEVENT` and ends with `END:VEVENT`. The `UID` field is the key to avoiding duplicates — if you export the same subscription twice with the same `UID`, your calendar app recognises it as the same event and updates rather than duplicating.

---

## Asking Claude for Help

If something doesn't look right, just describe the problem in plain English. You do not need to understand the code. For example:

- *"The price shows too many decimal places — it should always show exactly 2"*
- *"The modal form is hard to read on my phone, can you make it scroll?"*
- *"When I import a CSV nothing happens — can you add an error message?"*

Claude can also explain any part of the code:

- *"Can you explain in simple terms how the localStorage saving works?"*
- *"What does the reduce function do in the total cost calculation?"*

There are no wrong questions. The more specific you are about what you see versus what you expected, the better Claude's answer will be.

---

## Challenge: Add a Category Feature

Now it is your turn to extend the app. This challenge asks you to add **subscription categories** so you can see where your money is actually going.

### What to build

Add a **Category** dropdown to the subscription form with these options:
- Entertainment
- Productivity
- Business
- Health & Fitness
- Utilities
- Education
- Other

Then add a **Category Breakdown** section below the subscriptions list that shows each category and the total monthly spend within it — only listing categories that have at least one subscription.

### Hints

You do not need to write any code yourself. Describe the feature to Claude Code the same way you did in the steps above. A good starting prompt might be:

```
Add a Category field to the subscription form with a dropdown containing:
Entertainment, Productivity, Business, Health & Fitness, Utilities,
Education, Other.

Save the category with each subscription. Show it on the subscription card.

Below the subscriptions list, add a "Spend by Category" section that lists
each category that has at least one subscription and the total monthly cost
for that category. Update it whenever subscriptions change.
```

### How to know if you succeeded

- The form has a Category dropdown
- Each subscription card shows its category
- The breakdown section appears below the list and sums correctly
- Adding, editing, or deleting a subscription updates the breakdown immediately
- Categories with no subscriptions do not appear in the breakdown

### Stretch goal

Once the basic challenge is working, try asking Claude to:
- Add a small coloured tag/badge for each category on the subscription card
- Let the user filter the subscription list to show only one category at a time

---

## What's Next?

You have built a real, working web app using only natural language prompts. Here are some directions you could take it further:

- **Ask Claude** to add a dark mode toggle
- **Ask Claude** to add a search bar to filter subscriptions by name
- **Ask Claude** to add a "Cancelled" status so you can archive subs without deleting them
- **Learn HTML and CSS** basics — now that you have working code in front of you, reading it and understanding it is much easier
- **Explore Claude Code further** — type `/help` inside a Claude Code session to see all available commands

The finished version of this app (including the challenge solution) lives in this repository. Compare your work, ask Claude to explain any differences, and keep building.

---

*Built with [Claude Code](https://claude.ai/code) by Anthropic*
