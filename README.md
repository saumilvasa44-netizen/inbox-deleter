# Inbox Deleter

A separate, standalone app whose only job is to bulk-move a Gmail mailbox
into Trash. Deliberately kept apart from the expense-dashboard project so it
can request its own scope rather than another button bolted onto something
that also handles your financial data.

**There is no database.** Sign in with Google, your access/refresh tokens
live only inside an encrypted, httpOnly session cookie (encrypted with
`NEXTAUTH_SECRET`) for the duration of your browser session, and are
discarded the moment you sign out. Nothing is written to disk.

**No permanent/bypass-Trash delete anywhere in this app.** Earlier versions
requested the restricted `https://mail.google.com/` scope and could
permanently delete mail with no undo. That scope requires Google's CASA
security assessment (real cost, weeks, annual renewal) to verify for public
sign-in. This app now only requests `gmail.modify`, a "sensitive" (not
"restricted") scope — everything it does is a move into Trash, recoverable
for ~30 days, and it qualifies for Google's standard, free verification. If
you want to permanently empty Trash, do it inside Gmail itself.

## What it does

After signing in, you get three actions, each gated behind a confirmation
modal that shows an estimated message count and requires you to type your
email address back exactly before anything happens:

1. **Move everything to Trash** — moves every message not already in Trash
   into Trash (inbox, sent, drafts, spam, all of it). Recoverable for ~30
   days before Gmail auto-purges it.
2. **Move everything to Trash, except starred** — same as above, but skips
   anything you've starred.
3. **Move Primary inbox emails to Trash** — moves only messages in Gmail's
   "Primary" category tab, leaving Promotions/Social/Updates/Forums/Spam and
   already-trashed messages untouched.

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
   (plus your production callback URL once deployed, e.g.
   `https://inbox-deleter.vercel.app/api/auth/callback/google`)
2. **OAuth consent screen → Data Access** → **Add or remove scopes** →
   manually add:
   ```
   https://www.googleapis.com/auth/gmail.modify
   ```
   This is a *sensitive* (not restricted) scope. While the consent screen is
   in **Testing** mode, only test users can sign in. To let anyone sign in
   with just their email, submit the app for Google's standard verification
   (Publishing status → Prepare for verification) — needs a privacy policy
   page, a homepage link, and a short demo video. No CASA assessment, no
   cost, typically a matter of days.
3. **OAuth consent screen → Audience/Test users** → while still in Testing
   mode, make sure every mailbox you intend to act on (including your own)
   is listed as a test user — otherwise you'll hit an "Access blocked"
   screen when you try to sign in with it.
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
- Be careful which Google account you're signed into when you click
  "Continue with Google" — the app acts on whatever mailbox you authorize,
  not necessarily the one you meant to.
- The typed-confirmation step checks against the email address of the
  account you're actually signed in as, not a value you can freely edit —
  it must match exactly.
- If you want to try something first, note the estimated count shown in the
  confirmation modal before confirming. Everything here is recoverable from
  Trash for ~30 days regardless, but Trash isn't a substitute for caution.
