"use client";

import { signIn } from "next-auth/react";

export default function SignInCard() {
  return (
    <div className="bg-panel border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-4">
      <div className="text-2xl font-semibold">Inbox Deleter</div>
      <p className="text-sm text-muted">
        Signs in with Google, then lets you permanently delete or trash an entire mailbox. This
        requests full Gmail account access — only sign in with an account you intend to act on.
      </p>
      <button
        onClick={() => signIn("google", { callbackUrl: "/clean" })}
        className="w-full bg-accent hover:bg-red-700 transition text-white text-sm font-medium px-4 py-2.5 rounded-lg"
      >
        Continue with Google
      </button>
      <p className="text-xs text-muted">
        Nothing is stored. Your access token lives only in this browser session and is discarded
        on sign out.
      </p>
    </div>
  );
}
