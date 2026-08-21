import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const adminSessionCookie = "admin_session";

function matches(value: string, expected: string) {
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const username = String(form.get("username") ?? "");
  const password = String(form.get("password") ?? "");
  const expectedUsername = process.env.ADMIN_USERNAME ?? "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const requestedNext = String(form.get("next") ?? "");
  const next = requestedNext.startsWith("/admin/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/admin/leads";
  const host = request.headers.get("host") ?? request.headers.get("x-forwarded-host") ?? new URL(request.url).host;
  const protocol = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  const origin = `${protocol}://${host}`;

  if (!expectedPassword) {
    return new NextResponse("Admin access is not configured", { status: 503 });
  }

  if (!matches(username, expectedUsername) || !matches(password, expectedPassword)) {
    const loginUrl = new URL("/admin/login", origin);
    loginUrl.searchParams.set("error", "invalid_credentials");
    loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl, 303);
  }

  const token = createHash("sha256").update(`${expectedUsername}:${expectedPassword}`).digest("hex");
  const response = NextResponse.redirect(new URL(next, origin), 303);
  response.cookies.set(adminSessionCookie, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: protocol === "https",
    path: "/admin",
    maxAge: 60 * 60 * 8
  });
  return response;
}
