import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ActionPanel from "@/components/ActionPanel";
import SignOutButton from "@/components/SignOutButton";

export default async function CleanPage() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) redirect("/");

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Inbox Deleter</div>
            <div className="text-sm text-muted">Signed in as {session.user?.email}</div>
          </div>
          <SignOutButton />
        </header>

        {session.error === "RefreshAccessTokenError" && (
          <div className="bg-bad/15 text-bad text-sm rounded-lg px-4 py-3">
            Your session couldn&apos;t be refreshed — sign out and sign in again before running an
            action.
          </div>
        )}

        {session.error === "InsufficientScopeError" && (
          <div className="bg-bad/15 text-bad text-sm rounded-lg px-4 py-3 space-y-2">
            <p className="font-medium">Gmail access wasn&apos;t granted during sign-in.</p>
            <p>
              Google shows this as a separate checkbox/toggle on the consent screen (something like
              &quot;Read, compose, send, and permanently delete all your email from Gmail&quot;) — it&apos;s
              easy to miss. Click &quot;Sign out&quot; above, sign in again, and make sure that
              permission is explicitly checked before continuing.
            </p>
          </div>
        )}

        <ActionPanel userEmail={session.user?.email ?? ""} disabled={session.error === "InsufficientScopeError"} />
      </div>
    </main>
  );
}
