import { createHash } from "node:crypto";
import { loadGmailRefreshToken } from "@/lib/gmail-token";

const gmail = "https://gmail.googleapis.com/gmail/v1/users/me";

function required(name: string) { const value = process.env[name]; if (!value) throw new Error(`missing_env_${name}`); return value; }

export async function gmailAccessToken() {
  const refreshToken = await loadGmailRefreshToken("kontakt@hochzeitstandesamt.ch");
  if (!refreshToken) throw new Error("gmail_not_authorized");
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: required("GOOGLE_CLIENT_ID"), client_secret: required("GOOGLE_CLIENT_SECRET"), refresh_token: refreshToken, grant_type: "refresh_token" }) });
  if (!response.ok) throw new Error("gmail_token_refresh_failed");
  return String((await response.json()).access_token);
}

async function call(path: string, init: RequestInit = {}) { const token = await gmailAccessToken(); const response = await fetch(`${gmail}${path}`, { ...init, headers: { authorization: `Bearer ${token}`, ...(init.headers ?? {}) } }); if (!response.ok) throw new Error(`gmail_api_${response.status}`); return response.json(); }

export async function findDraft(query: string) { const result = await call(`/drafts?maxResults=50&q=${encodeURIComponent(query)}`); return result.drafts ?? []; }

function b64(value: Uint8Array) { return Buffer.from(value).toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", ""); }

export async function updateDraft(draftId: string, to: string, subject: string, body: string, filename: string, bytes: Uint8Array) {
  const boundary = `=_hochzeit_${createHash("sha256").update(filename).digest("hex").slice(0, 12)}`;
  const raw = [`From: kontakt@hochzeitstandesamt.ch`, `To: ${to}`, `Subject: ${subject}`, `MIME-Version: 1.0`, `Content-Type: multipart/mixed; boundary="${boundary}"`, ``, `--${boundary}`, `Content-Type: text/plain; charset="UTF-8"`, `Content-Transfer-Encoding: 8bit`, ``, body, ``, `--${boundary}`, `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; name="${filename}"`, `Content-Disposition: attachment; filename="${filename}"`, `Content-Transfer-Encoding: base64`, ``, b64(bytes), `--${boundary}--`, ``].join("\r\n");
  return call(`/drafts/${encodeURIComponent(draftId)}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: draftId, message: { raw: b64(new TextEncoder().encode(raw)) } }) });
}
