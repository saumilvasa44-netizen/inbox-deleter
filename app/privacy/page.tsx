export const metadata = { title: "Privacy Policy — Inbox Deleter" };

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted mb-8">Last updated: July 26, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-slate-200">
        <section>
          <h2 className="text-lg font-medium mb-2">What this app does</h2>
          <p>
            Inbox Deleter lets you sign in with Google and, at your direction, bulk-move messages
            in your Gmail mailbox into Trash — either everything, everything except starred
            messages, or just your Primary inbox category. Nothing happens automatically; every
            action is a click you make yourself, gated behind a confirmation step. No message is
            ever permanently deleted by this app — everything it does is recoverable from Trash
            for about 30 days, same as if you'd trashed it by hand in Gmail.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">What we access via Google</h2>
          <p>
            When you sign in, we request the{" "}
            <code className="text-accent">https://www.googleapis.com/auth/gmail.modify</code>{" "}
            scope. This lets the app list your messages and change their labels (specifically,
            adding the Trash label). It does not include permanent, bypass-Trash deletion — Google
            does not permit that under this scope.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">What we store</h2>
          <p>
            Nothing, anywhere, ever. There is no database in this application. Your Google
            access/refresh tokens live only inside an encrypted, httpOnly session cookie in your
            own browser, encrypted with a server-side secret. They are discarded the moment you
            sign out or your session expires. We never write your email content, metadata, or
            tokens to disk, to a database, or to any third-party service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">
            Compliance with Google's Limited Use requirements
          </h2>
          <p>
            This app's use and transfer of information received from Google APIs adheres to the{" "}
            <a
              className="text-accent underline"
              href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. Gmail data is used exclusively to perform
            the Trash actions you explicitly request, is never used for advertising, is never used
            to train generalized AI/ML models, and is never read, shown, or transferred to any
            human other than you.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">What we don't do</h2>
          <p>
            We don't sell your data. We don't share it with third parties. We don't read the
            content of your emails at all — actions operate on message IDs and Gmail label
            metadata only, not message bodies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">Revoking access</h2>
          <p>
            You can revoke this app's access at any time from your{" "}
            <a
              className="text-accent underline"
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Account permissions page
            </a>
            . Since nothing is stored server-side, revoking access (or simply signing out) removes
            everything this app knows about you.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">Contact</h2>
          <p>
            Questions about this policy: <a className="text-accent underline" href="mailto:saumilvasa44@gmail.com">saumilvasa44@gmail.com</a>
          </p>
        </section>
      </div>
    </main>
  );
}
