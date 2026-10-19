export type AnalyticsSession = { id: string; last: number; source: string; entryPath?: string; campaign?: string };
export function nextSession(current: AnalyticsSession | null, now: number, source: string, uuid: () => string, entryPath?: string, campaign = "none"): AnalyticsSession {
  return current && now-current.last < 30*60_000
    ? { ...current, last: Math.max(now,current.last) } : { id: uuid(), last: now, source, entryPath, campaign };
}
export function entrySource(referrer: string, host: string) {
  if (!referrer) return "direct";
  try {
    const name = new URL(referrer).hostname;
    if (name === host) return "internal";
    if (/(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com)$/.test(name)) return "search";
    if (/(^|\.)(facebook\.com|instagram\.com|pinterest\.[a-z.]+|t\.co)$/.test(name)) return "social";
    return "referral";
  } catch { return "unknown"; }
}

export function campaignCode(params:URLSearchParams) {
  const value=params.get("utm_campaign"); if(!value)return params.has("utm_source")||params.has("utm_medium")?"unknown":"none";
  return (process.env.NEXT_PUBLIC_ANALYTICS_CAMPAIGN_CODES??"").split(",").filter(code=>/^[a-z0-9_-]{1,60}$/.test(code)).includes(value)?value:"unknown";
}
