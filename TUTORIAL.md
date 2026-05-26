# Build a Subscription Tracker with Claude Code — No Coding Experience Needed

This tutorial walks you through building the Subscription Tracker app from scratch using **Claude Code inside VS Code**. You don't need to know how to code. You just need to know what you want to build and how to describe it — Claude does the rest.

By the end you'll have a working web app that:
- Tracks all your subscriptions in one place
- Colour-codes renewals so you never miss one
- Calculates your total monthly spend
- Exports to Google Calendar

---

## What You'll Need

| Tool | What it is | Cost |
|---|---|---|
| [VS Code](https://code.visualstudio.com) | A free text editor that Claude Code runs inside | Free |
| [Claude Code extension](https://marketplace.visualstudio.com/items?itemName=Anthropic.claude-code) | The Claude AI assistant built into VS Code | Free to install (needs an Anthropic account) |
| A browser | Chrome, Safari, Firefox — anything | Free |

That's it. No terminal commands, no package installs, no experience required.

---

## Part 1 — Getting Set Up

### Step 1: Install VS Code

1. Go to [code.visualstudio.com](https://code.visualstudio.com)
2. Click the big **Download** button for your operating system (Mac or Windows)
3. Open the downloaded file and follow the installer
4. Launch VS Code — you'll see a welcome screen

### Step 2: Install the Claude Code Extension

1. In VS Code, click the **Extensions** icon in the left sidebar (it looks like four squares)
2. In the search box type **Claude Code**
3. Click the result from Anthropic and hit **Install**
4. Once installed, a Claude icon will appear in the left sidebar
5. Click it and sign in with your Anthropic account (create one free at [claude.ai](https://claude.ai) if you don't have one)

### Step 3: Create a Project Folder

1. On your computer, create a new folder somewhere easy to find — e.g. your Desktop — called `Subscription Tracker`
2. In VS Code, go to **File → Open Folder** and select that folder
3. VS Code will now show your (empty) folder in the sidebar on the left

---

## Part 2 — Your First Conversation with Claude

Click the **Claude** icon in the VS Code sidebar to open the chat panel. This is where you'll describe what you want to build. Claude will write all the code and create the files for you.

Think of it like briefing a developer — you describe what you want, they build it, and you give feedback until it's right.

### Your first message

Type this into the Claude chat panel and hit Enter:

> I want to build a simple subscription tracker as a single HTML file that I can open in a browser. It should let me add subscriptions with a company name, price, renewal date, and billing frequency (monthly, annual, or quarterly). Show each subscription as a card that is colour coded based on how soon it renews — red if it's within 3 days, yellow within 7 days, green otherwise. Store everything in the browser's local storage so it saves automatically. Use Tailwind CSS for styling so it looks clean and modern.

Claude will respond and create an `index.html` file in your project folder. You'll see it appear in the left sidebar.

**To open and view it:** right-click `index.html` in the sidebar → **Reveal in Finder** (Mac) or **Reveal in File Explorer** (Windows) → double-click the file. It will open in your browser.

You now have a working app. 🎉

---

## Part 3 — Building It Up Feature by Feature

You don't need to think of everything upfront. The best way to work with Claude is to add one feature at a time. Here's the sequence used to build this app — copy and paste each message when you're ready for that feature.

---

### Feature 1: Stat Cards at the Top

> Add a stats bar at the top of the page that shows four numbers: total monthly cost across all subscriptions, the number of days until the next annual renewal, the monthly equivalent cost of annual subscriptions, and the total cost of monthly-only subscriptions.

---

### Feature 2: Edit and Delete

> Add edit and delete buttons to each subscription card. Edit should open the same form pre-filled with the subscription's details. Delete should ask for confirmation before removing it.

---

### Feature 3: Payment Method and Notes

> Add two optional fields to the add/edit form: Payment Method (a dropdown with Credit Card, Debit Card, PayPal, Bank Transfer, Other) and Notes (a text area for things like account details or cancellation steps). Show the notes on the card if they exist.

---

### Feature 4: Renewal Notifications

> Add a notification banner at the top of the page that appears when any subscription is renewing within the next 3 days. It should list which subscriptions are renewing and whether that's today, tomorrow, or in X days.

---

### Feature 5: CSV Import and Export

> Add Import CSV and Export CSV buttons. Export should download all subscriptions as a CSV file. Import should let the user upload a CSV file and add those subscriptions to the existing list.

---

### Feature 6: Google Calendar Export

> Add an Export to Google Calendar button that generates an .ics calendar file with a recurring event for each subscription on its renewal date. Monthly subscriptions should repeat monthly, annual ones yearly, and quarterly ones every 3 months.

---

### Feature 7: Fix the Expired Logic

This is an important one. After a monthly subscription's renewal date passes, it would show as grey and "Expired" — but monthly subscriptions keep going until you cancel them. Fix it with this message:

> Right now when a subscription's renewal date passes it turns grey and shows "Expired". Monthly subscriptions are ongoing until cancelled, so they should never show as expired. Instead, roll the renewal date forward by one month each time until it reaches a future date, and show that as the next renewal. Do the same for quarterly (3 months) and annual (1 year) subscriptions.

---

## Part 4 — How to Give Good Feedback

If something doesn't look right, just describe what's wrong in plain English. You don't need to say anything technical.

**Examples of good feedback:**

- *"The cards are too close together, can you add more space between them?"*
- *"The total cost is including subscriptions I've deleted, something seems wrong"*
- *"Can the renewal date on the card show the month name instead of numbers?"*
- *"On mobile the stat cards overlap, can you fix the layout?"*

Claude can see the code it wrote and will find and fix the problem. If the first fix doesn't work, just say *"That didn't quite fix it — the issue is..."* and describe what you're still seeing.

---

## Part 5 — Saving Your Work with Git (Optional but Recommended)

Git is a tool that saves snapshots of your project so you can go back if something breaks. Claude can do this for you too.

Once you're happy with a version of the app, type:

> Commit the current changes with a message describing what we just built, then push it to GitHub.

Claude will handle the commit and push. If you haven't set up a GitHub repository yet, ask:

> How do I connect this project to a new GitHub repository?

Claude will walk you through it step by step.

---

## Tips for Working with Claude

| Tip | Why it helps |
|---|---|
| **One feature at a time** | Smaller requests get more accurate results than one giant list |
| **Describe what you see, not what to fix** | "The button is missing" is better than "add the button back to line 42" |
| **Say what you want it to feel like** | "Friendly and simple" or "professional and minimal" gives Claude useful direction |
| **Ask it to explain anything** | Type "can you explain what you just did?" and Claude will break it down in plain English |
| **If it breaks, say so** | "That change broke the delete button" — Claude will undo or fix it |

---

## What You've Built

Here's a summary of everything the finished app can do:

- ✅ Add, edit, and delete subscriptions
- ✅ Track monthly, annual, and quarterly billing
- ✅ Colour-coded cards (green / yellow / red) by renewal urgency
- ✅ Never shows monthly subs as "expired" — always shows the next billing date
- ✅ Stat cards for total spend and upcoming annual renewals
- ✅ Renewal notification banner for the next 3 days
- ✅ Notes and payment method per subscription
- ✅ Import and export CSV
- ✅ Export to Google Calendar
- ✅ Everything saved automatically in your browser — no account or server needed

All of this is a single file: `index.html`. You can email it to someone, put it on a USB drive, or host it for free on GitHub Pages — and it works anywhere.

---

## Going Further

Some ideas for what to add next — just describe them to Claude:

- *"Add a search bar so I can filter subscriptions by name"*
- *"Add a category field (e.g. Entertainment, Productivity, Health) and let me filter by category"*
- *"Add a dark mode toggle"*
- *"Show a chart of my monthly spend over time"*
- *"Add a cancel reminder — a checkbox I can tick when I've cancelled a subscription"*

The process is always the same: describe what you want, review what Claude builds, give feedback, repeat.

---

*Built with [Claude Code](https://claude.ai/code) · Single-file · No backend · No frameworks*
