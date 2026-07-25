import { NextRequest, NextResponse } from "next/server";
import { requireAccessToken } from "@/lib/session-guard";
import { getGmailClient } from "@/lib/gmail-client";

export const dynamic = "force-dynamic";

// Cheap estimate shown before the confirmation modal, so the user knows
// roughly how many messages an action is about to affect. Uses Gmail's
// resultSizeEstimate (an estimate, not an exact count — Gmail doesn't
// expose exact counts cheaply) via a maxResults:1 list call.
export async function GET(req: NextRequest) {
  const auth = await requireAccessToken();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: 401 });

  const scope = req.nextUrl.searchParams.get("scope") === "primary" ? "primary" : "all";
  const gmail = getGmailClient(auth.accessToken);

  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: 1,
      includeSpamTrash: true,
      q: scope === "primary" ? "category:primary" : undefined,
    });
    return NextResponse.json({ estimate: res.data.resultSizeEstimate ?? 0 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
