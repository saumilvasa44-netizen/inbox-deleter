import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

type AuthResult = { accessToken: string; email: string | null } | { error: "unauthorized" | "reauth_required" };

export async function requireAccessToken(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return { error: "unauthorized" };
  if (session.error === "RefreshAccessTokenError") return { error: "reauth_required" };
  return { accessToken: session.accessToken, email: session.user?.email ?? null };
}
