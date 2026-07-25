import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { google } from "googleapis";

// Full mailbox access — this is the one scope that can permanently delete
// mail (batchDelete), which gmail.readonly / gmail.modify cannot do. This is
// a *restricted* Google scope: fine to use while the OAuth consent screen
// stays in Testing mode with yourself (and whoever else you're deleting for)
// added as test users, same as the rest of this project's setup. See
// README.md for the exact Google Cloud Console steps.
const GMAIL_FULL_SCOPE = "https://mail.google.com/";

// No database anywhere in this app, by design — the access/refresh tokens
// live only inside the encrypted NextAuth JWT session cookie (encrypted
// with NEXTAUTH_SECRET) and are gone the moment the user signs out. There's
// nothing to leak from a stolen DB backup because there is no DB.
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: token.refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();

    return {
      ...token,
      accessToken: credentials.access_token ?? token.accessToken,
      accessTokenExpires: credentials.expiry_date ?? Date.now() + 3600 * 1000,
      refreshToken: credentials.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (err) {
    console.error("Failed to refresh Google access token", err);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          // Forces the consent screen (and a fresh refresh_token) on every
          // sign-in — deliberate here, since this app should never silently
          // reuse a stale grant for something this destructive.
          prompt: "consent",
          scope: `openid email profile ${GMAIL_FULL_SCOPE}`,
        },
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: persist tokens from the OAuth grant.
      if (account) {
        // Google can silently drop the full-mailbox scope even when sign-in
        // otherwise "succeeds" — it renders as a separate, easy-to-miss
        // checkbox on the consent screen for restricted scopes like this
        // one. Check what was actually granted so we can tell the user
        // clearly, instead of every delete action failing later with an
        // opaque "Insufficient Permission" error.
        const grantedScopes = (account.scope ?? "").split(" ");
        const hasFullAccess = grantedScopes.includes(GMAIL_FULL_SCOPE);
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
          refreshToken: account.refresh_token,
          error: hasFullAccess ? undefined : "InsufficientScopeError",
        };
      }
      // Still valid — reuse it.
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }
      // Expired — refresh it so a long-running delete operation doesn't die
      // partway through with a 401 an hour in.
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
};

export { GMAIL_FULL_SCOPE };
