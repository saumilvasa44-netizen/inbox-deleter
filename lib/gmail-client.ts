import { google } from "googleapis";

// Builds a Gmail client from a raw access token pulled off the current
// session — no stored credentials, nothing read from disk. The token is
// already fresh by the time it reaches here because lib/auth.ts's jwt
// callback refreshes it before every getServerSession() call if expired.
export function getGmailClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth: oauth2Client });
}
