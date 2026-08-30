import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n";

const adminSessionCookie = "admin_session";

async function adminSessionToken(username: string, password: string) {
  const input = new TextEncoder().encode(`${username}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const secret = process.env.ADMIN_PASSWORD;
    const username = process.env.ADMIN_USERNAME ?? "admin";
    const authorization = request.headers.get("authorization") ?? "";
    const expected = secret
      ? `Basic ${btoa(`${username}:${secret}`)}`
      : "";
    const session = request.cookies.get(adminSessionCookie)?.value ?? "";
    const expectedSession = secret ? await adminSessionToken(username, secret) : "";
    if (!secret) {
      return new NextResponse("Admin access is not configured", { status: 503 });
    }
    if (authorization !== expected && session !== expectedSession) {
      const host = request.headers.get("host") ?? request.headers.get("x-forwarded-host") ?? request.nextUrl.host;
      const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
      const loginUrl = new URL("/admin/login", `${protocol}://${host}`);
      loginUrl.search = `?next=${encodeURIComponent(`${pathname}${request.nextUrl.search}`)}`;
      return NextResponse.redirect(loginUrl);
    }
  }
  if (pathname.startsWith("/admin")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];

  if (locale === defaultLocale && segments.length === 1) {
    return NextResponse.redirect(new URL("/", request.url), 308);
  }

  if (!isLocale(locale) || segments.length === 1) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const localizedSection = segments[1];
  const localizedRouteSupported =
    localizedSection === "search" ||
    localizedSection === "standesamt-finden" ||
    localizedSection === "zivilstandsamt" ||
    (localizedSection === "ratgeber" && segments.length === 2);
  if (!localizedRouteSupported) {
    url.pathname = localizedSection === "ratgeber" ? `/${locale}/ratgeber` : `/${locale}`;
    url.search = "";
    return NextResponse.redirect(url, 308);
  }
  url.pathname = `/${segments.slice(1).join("/")}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-locale", locale);
  const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"]
};
