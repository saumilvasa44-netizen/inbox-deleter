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

// Moves up to one page of matching messages into Trash (30-day recoverable
// window before Gmail auto-purges it). `-in:trash` is always appended and is
// load-bearing: without it, already-trashed messages would keep getting
// re-listed forever (adding the TRASH label to an already-trashed message is
// a harmless no-op, so the pool of matching ids would never shrink and the
// caller's loop would never terminate). `extraQuery` narrows which messages
// are targeted (e.g. exclude starred, or restrict to Primary category).
//
// Deliberately uses batchModify (add TRASH label), never batchDelete —
// batchDelete requires the restricted `https://mail.google.com/` scope and
// Google's CASA security assessment to verify for public use. This app
// requests only `gmail.modify`, so permanent/bypass-Trash deletion is not
// offered anywhere in this app; users who want that can empty Trash inside
// Gmail itself.
export async function trashBatch(gmail: gmail_v1.Gmail, extraQuery?: string): Promise<BatchResult> {
  const query = extraQuery ? `-in:trash ${extraQuery}` : "-in:trash";
  const ids = await listBatchIds(gmail, query);
  if (ids.length === 0) return { processed: 0, hasMore: false };
  await gmail.users.messages.batchModify({
    userId: "me",
    requestBody: { ids, addLabelIds: ["TRASH"] },
  });
  return { processed: ids.length, hasMore: true };
}
