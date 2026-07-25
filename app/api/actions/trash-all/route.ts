import { NextResponse } from "next/server";
import { requireAccessToken } from "@/lib/session-guard";
import { getGmailClient } from "@/lib/gmail-client";
import { trashBatch } from "@/lib/mailbox-actions";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Moves one page (up to 500) of everything not already in Trash into Trash.
// Recoverable for ~30 days before Gmail auto-purges it. The client calls
// this repeatedly until processed comes back 0.
export async function POST() {
  const auth = await requireAccessToken();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: 401 });

  try {
    const gmail = getGmailClient(auth.accessToken);
    const result = await trashBatch(gmail);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
