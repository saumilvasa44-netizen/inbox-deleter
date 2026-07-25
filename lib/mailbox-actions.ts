import { gmail_v1 } from "googleapis";

// Kept deliberately simple and stateless — no database, no stored cursor.
// Each call lists up to PAGE_SIZE matching messages fresh (not resuming
// from a page token) and acts on exactly what it finds. The API route
// caller loops, calling again and again, until a response comes back with
// processed: 0 — meaning nothing left matches the query. This is safe
// because deleting/trashing changes what the *next* "list everything" call
// returns, so there's no way to skip something by re-querying from scratch
// each time.
const PAGE_SIZE = 500; // Gmail's own max ids per batchDelete/batchModify call

export type BatchResult = { processed: number; hasMore: boolean };

async function listBatchIds(gmail: gmail_v1.Gmail, query: string | undefined): Promise<string[]> {
  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults: PAGE_SIZE,
    includeSpamTrash: true,
    q: query,
  });
  return (res.data.messages ?? []).map((m) => m.id).filter((id): id is string => Boolean(id));
}

// Permanently deletes up to one page of messages matching `query` (undefined
// = everything, inbox/sent/spam/trash/all of it). No undo.
export async function deleteBatch(gmail: gmail_v1.Gmail, query?: string): Promise<BatchResult> {
  const ids = await listBatchIds(gmail, query);
  if (ids.length === 0) return { processed: 0, hasMore: false };
  await gmail.users.messages.batchDelete({ userId: "me", requestBody: { ids } });
  return { processed: ids.length, hasMore: true };
}

// Moves everything not already in Trash into Trash (30-day recoverable
// window before Gmail auto-purges it). The "-in:trash" exclusion is load-
// bearing: without it, already-trashed messages would keep getting
// re-listed forever (adding the TRASH label to an already-trashed message
// is a harmless no-op, so the pool of matching ids would never shrink and
// the caller's loop would never terminate).
export async function trashBatch(gmail: gmail_v1.Gmail): Promise<BatchResult> {
  const ids = await listBatchIds(gmail, "-in:trash");
  if (ids.length === 0) return { processed: 0, hasMore: false };
  await gmail.users.messages.batchModify({
    userId: "me",
    requestBody: { ids, addLabelIds: ["TRASH"] },
  });
  return { processed: ids.length, hasMore: true };
}
