import { NextResponse, type NextRequest } from "next/server";
import { isLocale } from "@/lib/i18n";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];

  if (!isLocale(locale) || segments.length === 1) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${segments.slice(1).join("/")}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"]
};
