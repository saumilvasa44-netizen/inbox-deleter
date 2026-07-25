import { NextResponse } from "next/server";
import { requireAccessToken } from "@/lib/session-guard";
import { getGmailClient } from "@/lib/gmail-client";
import { trashBatch } from "@/lib/mailbox-actions";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Superseded by /api/actions/trash-primary (same logic, kept here as an
// alias since this path can't be removed from the deployed workspace). No
// longer does a permanent delete — this app only requests the `gmail.modify`
// scope now, which can't do that. See lib/mailbox-actions.ts.
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
