import { NextResponse } from "next/server";
import { storeGmailRefreshToken } from "@/lib/gmail-token";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error) return NextResponse.json({ message: `Google-Autorisierung abgebrochen: ${error}` }, { status: 400 });
  if (!code) return NextResponse.json({ message: "Authorization Code fehlt." }, { status: 400 });
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return NextResponse.json({ message: "Google OAuth ist nicht konfiguriert." }, { status: 500 });
  const redirectUri = `${url.origin}/api/gmail/callback`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }) });
  if (!tokenResponse.ok) return NextResponse.json({ message: "Google-Token-Austausch fehlgeschlagen." }, { status: 502 });
  const token = await tokenResponse.json() as { refresh_token?: string };
  if (!token.refresh_token) return NextResponse.json({ message: "Kein Refresh-Token erhalten. Erneute Zustimmung mit prompt=consent erforderlich." }, { status: 502 });
  await storeGmailRefreshToken("kontakt@hochzeitstandesamt.ch", token.refresh_token);
  return NextResponse.json({ message: "Gmail-Autorisierung erfolgreich gespeichert." });
}
