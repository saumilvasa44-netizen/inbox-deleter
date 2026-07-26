export const metadata = { title: "Terms of Service — Inbox Deleter" };

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted mb-8">Last updated: July 26, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-slate-200">
        <section>
          <h2 className="text-lg font-medium mb-2">Use at your own risk</h2>
          <p>
            Inbox Deleter performs bulk actions on your Gmail mailbox at your explicit request.
            Every action requires you to type your own email address to confirm before it runs.
            You are responsible for choosing the correct Google account and the correct action.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">No warranty</h2>
          <p>
            This app is provided as-is, with no warranty of any kind. While every action here
            moves mail to Trash (recoverable for ~30 days) rather than permanently deleting it,
            you should not rely on this app as your only safeguard against unwanted mailbox
            changes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">No liability</h2>
          <p>
            To the fullest extent permitted by law, the developer is not liable for any loss or
            damage arising from use of this app, including messages that are trashed and
            subsequently auto-purged by Gmail after ~30 days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">Changes</h2>
          <p>These terms may be updated from time to time. Continued use of the app after a change constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">Contact</h2>
          <p>
            Questions: <a className="text-accent underline" href="mailto:saumilvasa44@gmail.com">saumilvasa44@gmail.com</a>
          </p>
        </section>
      </div>
    </main>
  );
}
