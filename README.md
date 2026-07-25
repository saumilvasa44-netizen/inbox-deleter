# Inbox Deleter

A separate, standalone app whose only job is to permanently delete or empty
a Gmail mailbox. Deliberately kept apart from the expense-dashboard project
— it needs a much more dangerous OAuth scope (full mailbox read/write/delete,
not just read-only), so it gets its own small app rather than another
button bolted onto something that also handles your financial data.

**There is no database.** Sign in with Google, your access/refresh tokens
live only inside an encrypted, httpOnly session cookie (encrypted with
`NEXTAUTH_SECRET`) for the duration of your browser session, and are
discarded the moment you sign out. Nothing is written to disk.

## What it does

After signing in, you get three actions, each gated behind a confirmation
modal that shows an estimated message count and requires you to type your
email address back exactly before anything happens:

1. **Delete everything** — permanently deletes every message (inbox, sent,
   drafts, spam, trash). Bypasses Trash entirely. No undo, not even by
   Google.
2. **Delete everything, but move to Trash** — moves everything not already
   in Trash into Trash. Recoverable for ~30 days before Gmail auto-purges it.
3. **Delete only Primary inbox emails** — permanently deletes only messages
   in Gmail's "Primary" category tab, leaving Promotions/Social/Updates/
   Forums/Spam/Trash untouched. No undo.

Each action runs as a loop of small batches (up to 500 messages per Gmail
API call) until nothing matching is left, with a live running count shown
on screen.

## Setup

This reuses the **same Google Cloud OAuth client** as the expense-dashboard
project (same Client ID/Secret) — you don't need a new Google Cloud project,
just a few additions to the existing one:

1. **Google Cloud Console → APIs & Services → Credentials** → your existing
   OAuth client → **Authorized redirect URIs** → add:
   ```
   http://localhost:3001/api/auth/callback/google
   ```
2. **OAuth consent screen → Data Access** → **Add or remove scopes** →
   manually add:
   ```
   https://mail.google.com/
   ```
   This is a *restricted* Google scope (full account access — required for
   permanent delete; `gmail.readonly`/`gmail.modify` can't do it). It only
   needs to be added to the consent screen's scope list, not verified by
   Google, as long as the app stays in **Testing** mode and only test users
   authorize it.
3. **OAuth consent screen → Audience/Test users** → make sure every mailbox
   you intend to act on (including your own) is listed as a test user —
   otherwise you'll hit an "Access blocked" screen when you try to sign in
   with it.
4. Copy `.env.example` to `.env.local`, fill in `GOOGLE_CLIENT_ID` /
   `GOOGLE_CLIENT_SECRET` (same values as the expense-dashboard project's
   `.env.local`), and generate `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```
5. Install and run (runs on port 3001 so it doesn't collide with the
   expense-dashboard's dev server on 3000):
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:3001

## Safety notes

- Every sign-in forces Google's consent screen again (`prompt=consent`), so
  you always consciously pick which account you're granting access to.
- Because this scope covers full account access, be careful which Google
  account you're signed into when you click "Continue with Google" — the
  app acts on whatever mailbox you authorize, not necessarily the one you
  meant to.
- The typed-confirmation step checks against the email address of the
  account you're actually signed in as, not a value you can freely edit —
  it must match exactly.
- If you want to try something first without deleting anything, note the
  estimated count shown in the confirmation modal before confirming.
