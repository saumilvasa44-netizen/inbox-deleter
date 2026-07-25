import { NextResponse } from "next/server";
import { requireAccessToken } from "@/lib/session-guard";
import { getGmailClient } from "@/lib/gmail-client";
import { trashBatch } from "@/lib/mailbox-actions";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Moves one page (up to 500) of messages in the Primary category (Gmail's
// own "Primary" inbox tab — category:primary) into Trash. Promotions,
// Social, Updates, Forums, Spam, and already-trashed messages are left
// untouched. Recoverable for ~30 days. The client calls this repeatedly
// until processed comes back 0.
export async function POST() {
  const auth = await requireAccessToken();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: 401 });

  try {
    const gmail = getGmailClient(auth.accessToken);
    const result = await trashBatch(gmail, "category:primary");
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
