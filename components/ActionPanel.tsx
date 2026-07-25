"use client";

import { useState } from "react";

type ActionKey = "trash-all" | "trash-except-starred" | "trash-primary";

const ACTIONS: Record<
  ActionKey,
  { title: string; description: string; endpoint: string; countScope: "all" | "primary"; verb: string; permanent: boolean }
> = {
  "trash-all": {
    title: "1. Move everything to Trash",
    description:
      "Moves every message not already in Trash into Trash — inbox, sent, drafts, spam, all of it. Recoverable for about 30 days before Gmail auto-purges it.",
    endpoint: "/api/actions/trash-all",
    countScope: "all",
    verb: "moved to Trash",
    permanent: false,
  },
  "trash-except-starred": {
    title: "2. Move everything to Trash, except starred",
    description:
      "Moves every message not already in Trash into Trash, skipping anything you've starred. Recoverable for about 30 days before Gmail auto-purges it.",
    endpoint: "/api/actions/trash-except-starred",
    countScope: "all",
    verb: "moved to Trash",
    permanent: false,
  },
  "trash-primary": {
    title: "3. Move Primary inbox emails to Trash",
    description:
      "Moves only messages in Gmail's Primary category tab into Trash. Promotions, Social, Updates, Forums, Spam, and already-trashed messages are left untouched. Recoverable for about 30 days.",
    endpoint: "/api/actions/trash-primary",
    countScope: "primary",
    verb: "moved to Trash",
    permanent: false,
  },
};

export default function ActionPanel({ userEmail, disabled = false }: { userEmail: string; disabled?: boolean }) {
  const [modalAction, setModalAction] = useState<ActionKey | null>(null);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const [runningAction, setRunningAction] = useState<ActionKey | null>(null);
  const [processedTotal, setProcessedTotal] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openModal(key: ActionKey) {
    setModalAction(key);
    setConfirmText("");
    setEstimate(null);
    setLoadingEstimate(true);
    try {
      const res = await fetch(`/api/actions/count?scope=${ACTIONS[key].countScope}`);
      const data = await res.json();
      setEstimate(typeof data.estimate === "number" ? data.estimate : null);
    } catch {
      setEstimate(null);
    } finally {
      setLoadingEstimate(false);
    }
  }

  function closeModal() {
    setModalAction(null);
    setConfirmText("");
  }

  async function runAction(key: ActionKey) {
    closeModal();
    setRunningAction(key);
    setProcessedTotal(0);
    setDone(false);
    setError(null);

    let total = 0;
    try {
      while (true) {
        const res = await fetch(ACTIONS[key].endpoint, { method: "POST" });
        if (res.status === 401) {
          const body = await res.json().catch(() => ({}));
          setError(
            body.error === "reauth_required"
              ? "Your session couldn't be refreshed — sign out and sign in again, then retry."
              : "Not signed in — sign in again."
          );
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error ?? "Something went wrong.");
          return;
        }
        const data = await res.json();
        total += data.processed ?? 0;
        setProcessedTotal(total);
        if (!data.hasMore || (data.processed ?? 0) === 0) break;
      }
      setDone(true);
    } finally {
      setRunningAction(null);
    }
  }

  const isRunning = runningAction !== null;

  return (
    <div className="space-y-4">
      {(Object.keys(ACTIONS) as ActionKey[]).map((key) => {
        const action = ACTIONS[key];
        return (
          <div key={key} className="bg-panel border border-border rounded-xl p-5 space-y-3">
            <div className="font-medium">{action.title}</div>
            <p className="text-sm text-muted">{action.description}</p>
            <button
              onClick={() => openModal(key)}
              disabled={isRunning || disabled}
              className="text-sm px-4 py-2 rounded-lg bg-accent hover:bg-red-700 transition disabled:opacity-40"
            >
              Run
            </button>
          </div>
        );
      })}

      {isRunning && (
        <div className="bg-panel2 border border-border rounded-xl p-4 text-sm">
          Running {ACTIONS[runningAction].title.replace(/^\d+\.\s*/, "")}... {processedTotal} message(s){" "}
          {ACTIONS[runningAction].verb} so far.
        </div>
      )}

      {done && !error && (
        <div className="bg-good/10 border border-good/30 text-good text-sm rounded-lg px-4 py-3">
          Done — {processedTotal} message(s) affected.
        </div>
      )}

      {error && (
        <div className="bg-bad/10 border border-bad/30 text-bad text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {modalAction && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-panel border border-border rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="font-semibold text-lg">{ACTIONS[modalAction].title}</div>
            <p className="text-sm text-muted">{ACTIONS[modalAction].description}</p>

            <div className="text-sm">
              {loadingEstimate ? (
                <span className="text-muted">Estimating affected messages...</span>
              ) : estimate !== null ? (
                <span>
                  Roughly <span className="font-semibold">{estimate}</span> message(s) will be affected.
                </span>
              ) : (
                <span className="text-muted">Couldn&apos;t get an estimate — you can still proceed.</span>
              )}
            </div>

            {ACTIONS[modalAction].permanent && (
              <div className="bg-bad/10 border border-bad/30 text-bad text-xs rounded-lg px-3 py-2">
                This is permanent. There is no undo, not even by Google.
              </div>
            )}

            <label className="block text-sm space-y-1.5">
              <span className="text-muted">
                Type <span className="font-mono text-white">{userEmail}</span> to confirm:
              </span>
              <input
                autoFocus
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full bg-panel2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder={userEmail}
              />
            </label>

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={closeModal}
                className="text-sm px-4 py-2 rounded-lg bg-panel2 border border-border hover:text-white text-muted transition"
              >
                Cancel
              </button>
              <button
                onClick={() => runAction(modalAction)}
                disabled={confirmText.trim().toLowerCase() !== userEmail.trim().toLowerCase()}
                className="text-sm px-4 py-2 rounded-lg bg-accent hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
