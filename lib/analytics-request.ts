// Match explicit automation identifiers; device names such as CUBOT are browsers.
export const BOT_UA = /\b(?:Googlebot|bingbot|BingPreview|YandexBot|Baiduspider|DuckDuckBot|Applebot|facebookexternalhit|Twitterbot|LinkedInBot|PetalBot|AhrefsBot|SemrushBot|MJ12bot|GPTBot|ChatGPT-User|ClaudeBot|CCBot|Amazonbot|Bytespider|bot|crawler|spider|HeadlessChrome|headless|lighthouse|pagespeed|healthcheck|uptime|UptimeRobot|curl|wget|python-requests|python-urllib|scrapy|PhantomJS|selenium|playwright|puppeteer)\b/i;

export function isInternalTraffic(request: Request) {
  return (request.headers.get("cookie") ?? "")
    .split(";")
    .some((part) => part.trim() === "hsa_internal=1" || /^admin_session=.+/.test(part.trim()));
}

export function isAdminPath(path: string) {
  return path === "/admin" || path.startsWith("/admin/");
}

export function trustedBrowserRequest(request: Request) {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return false;
  const agent = request.headers.get("user-agent") ?? "";
  if (!agent || BOT_UA.test(agent)) return false;

  const host = request.headers.get("host") ?? "";
  let hostname: string;
  try { hostname = new URL(`http://${host}`).hostname; } catch { return false; }
  if (!["hochzeitstandesamt.ch", "www.hochzeitstandesamt.ch", "standesamthochzeit.ch", "www.standesamthochzeit.ch"].includes(hostname)) return false;

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site") return false;

  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
