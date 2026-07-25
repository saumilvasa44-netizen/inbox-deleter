// Type augmentation so session.accessToken / session.error are recognized
// throughout the app. This tool has no database — the Gmail access token
// lives only inside the encrypted NextAuth JWT session cookie, never on
// disk, and is discarded the moment the user signs out.
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
