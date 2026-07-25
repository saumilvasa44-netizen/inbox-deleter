import { NextResponse } from "next/server";
import { requireAccessToken } from "@/lib/session-guard";
import { getGmailClient } from "@/lib/gmail-client";
import { deleteBatch } from "@/lib/mailbox-actions";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Permanently deletes one page (up to 500) of every message in the mailbox —
// inbox, sent, drafts, spam, trash, all of it. No undo. The client calls
// this repeatedly until processed comes back 0.
export async function POST() {
  const auth = await requireAccessToken();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: 401 });

  try {
    const gmail = getGmailClient(auth.accessToken);
    const result = await deleteBatch(gmail, undefined);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
