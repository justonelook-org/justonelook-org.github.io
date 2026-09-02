import { basicCredentialsAccepted, rateLimitAccepted, requestClientKey } from "./request-security.js";

const MAX_DAYS = 366;
const HOMEPAGE_ENTRANCES_STARTED_DAY = "2026-08-11";
const SOURCE_LABELS = Object.freeze({ x: "X" });
const CAMPAIGN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,62})$/;
const EVENT_COLUMNS = Object.freeze({
  homepage_view: "homepage_views",
  homepage_entrance: "homepage_entrances",
  try_it_click: "try_it_clicks",
  zero_opened: "zero_opens",
  zero_session_started: "zero_session_starts"
});

export function trafficMeasurementAllowed(mode, origin, testOrigin) {
  if (mode === "true") return !testOrigin || origin !== testOrigin;
  return mode === "test" && Boolean(testOrigin) && origin === testOrigin;
}

export async function handleTrafficEvent(request, env) {
  const origin = request.headers.get("Origin") || "";
  const cors = trafficCorsHeaders(origin, env.ALLOWED_ORIGINS);
  if (request.method === "OPTIONS") return originAllowed(origin, env.ALLOWED_ORIGINS)
    ? new Response(null, { status: 204, headers: cors })
    : json({ error: "This request is not allowed." }, 403, cors);
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, cors);
  if (!originAllowed(origin, env.ALLOWED_ORIGINS)) return json({ error: "This request is not allowed." }, 403, cors);
  const clientAllowed = await rateLimitAccepted(env.TRAFFIC_RATE_LIMITER, `traffic:${requestClientKey(request)}`);
  const globalAllowed = await rateLimitAccepted(env.TRAFFIC_GLOBAL_RATE_LIMITER, "traffic:global");
  if (!clientAllowed || !globalAllowed) return json({ error: "Too many traffic events. Please wait before trying again." }, 429, cors);

  if (!trafficMeasurementAllowed(env.TRAFFIC_MEASUREMENT_ENABLED, origin, env.TRAFFIC_TEST_ORIGIN)) {
    return new Response(null, { status: 204, headers: cors });
  }
  if (!env.OUTCOME_DB) return json({ error: "Traffic storage is not configured." }, 503, cors);

  let body;
  try { body = await request.json(); }
  catch { return json({ error: "The event could not be read." }, 400, cors); }
  if (!body || typeof body !== "object") {
    return json({ error: "The event is not recognized." }, 400, cors);
  }

  if (body.event === "zero_source") {
    const keys = Object.keys(body);
    const campaign = body.campaign === undefined ? "" : body.campaign;
    if (!keys.every((key) => ["event", "source", "campaign"].includes(key)) || keys.length < 2 || keys.length > 3
      || typeof body.source !== "string" || !Object.hasOwn(SOURCE_LABELS, body.source)
      || typeof campaign !== "string" || (campaign && !CAMPAIGN_PATTERN.test(campaign))) {
      return json({ error: "The source event is not recognized." }, 400, cors);
    }
    await incrementDailySource(env.OUTCOME_DB, body.source, campaign, new Date());
    return new Response(null, { status: 204, headers: cors });
  }

  if (Object.keys(body).length !== 1 || !EVENT_COLUMNS[body.event]) {
    return json({ error: "The event is not recognized." }, 400, cors);
  }

  await incrementDailyCounter(env.OUTCOME_DB, body.event, new Date());
  return new Response(null, { status: 204, headers: cors });
}

export async function incrementDailyCounter(database, event, now = new Date()) {
  const column = EVENT_COLUMNS[event];
  if (!column) throw new Error("Unknown traffic event.");
  const day = now.toISOString().slice(0, 10);
  await database.prepare(`
    INSERT INTO website_daily_traffic (day, ${column}) VALUES (?, 1)
    ON CONFLICT(day) DO UPDATE SET ${column} = ${column} + 1
  `).bind(day).run();
}

export async function incrementDailySource(database, source, campaign = "", now = new Date()) {
  if (!Object.hasOwn(SOURCE_LABELS, source) || (campaign && !CAMPAIGN_PATTERN.test(campaign))) {
    throw new Error("Unknown Zero source.");
  }
  const day = now.toISOString().slice(0, 10);
  await database.prepare(`
    INSERT INTO zero_source_daily (day, source, campaign, count) VALUES (?, ?, ?, 1)
    ON CONFLICT(day, source, campaign) DO UPDATE SET count = count + 1
  `).bind(day, source, campaign).run();
}

export async function readTrafficMetrics(database, from, to) {
  const totals = await database.prepare(`
    SELECT
      COALESCE(SUM(homepage_views), 0) AS homepage_views,
      COALESCE(SUM(homepage_entrances), 0) AS homepage_entrances,
      COALESCE(SUM(CASE WHEN day >= ? THEN try_it_clicks ELSE 0 END), 0) AS comparable_try_it_clicks,
      COALESCE(SUM(try_it_clicks), 0) AS try_it_clicks,
      COALESCE(SUM(zero_opens), 0) AS zero_opens,
      COALESCE(SUM(zero_session_starts), 0) AS zero_session_starts
    FROM website_daily_traffic
    WHERE day >= substr(?, 1, 10) AND day < substr(?, 1, 10)
  `).bind(HOMEPAGE_ENTRANCES_STARTED_DAY, from, to).first();
  const sourceRows = await database.prepare(`
    SELECT source, campaign, COALESCE(SUM(count), 0) AS count
    FROM zero_source_daily
    WHERE day >= substr(?, 1, 10) AND day < substr(?, 1, 10)
    GROUP BY source, campaign
    ORDER BY source, campaign
  `).bind(from, to).all();
  const counts = {
    homepage_views: number(totals?.homepage_views),
    homepage_entrances: number(totals?.homepage_entrances),
    try_it_clicks: number(totals?.try_it_clicks),
    zero_opens: number(totals?.zero_opens),
    zero_session_starts: number(totals?.zero_session_starts)
  };
  const sourceResults = (sourceRows?.results || []).filter((row) => Object.hasOwn(SOURCE_LABELS, row.source));
  const sourceTotals = new Map();
  for (const row of sourceResults) sourceTotals.set(row.source, (sourceTotals.get(row.source) || 0) + number(row.count));
  const sourceNames = [...new Set([...Object.keys(SOURCE_LABELS), ...sourceTotals.keys()])];
  const sources = sourceNames.map((source) => ({ source, label: SOURCE_LABELS[source] || source, count: sourceTotals.get(source) || 0 }));
  const campaigns = sourceResults
    .filter((row) => row.campaign)
    .map((row) => ({ source: row.source, campaign: row.campaign, count: number(row.count) }));
  return {
    range: { from, to },
    counts,
    percentages: {
      views_to_try_it: percent(counts.try_it_clicks, counts.homepage_views),
      entrances_to_try_it: percent(number(totals?.comparable_try_it_clicks), counts.homepage_entrances),
      try_it_to_zero_open: percent(counts.zero_opens, counts.try_it_clicks),
      zero_open_to_start: percent(counts.zero_session_starts, counts.zero_opens)
    },
    sources,
    campaigns,
    homepage_entrances_started_day: HOMEPAGE_ENTRANCES_STARTED_DAY,
    note: "Homepage entrances are storage-free estimates of direct or external arrivals, not visits or unique people. Source links count only an approved source and optional campaign slug. Only anonymous daily totals are retained; no analytics cookies, visitor identifiers, raw referrers, or linked visitor journeys are used."
  };
}

export async function handleTrafficDashboard(request, env) {
  if (!await rateLimitAccepted(env.PRIVATE_RATE_LIMITER, `private:${requestClientKey(request)}`)) return tooManyRequests();
  if (!await basicCredentialsAccepted(request, env.ANALYTICS_ACCESS_TOKEN)) return unauthorized();
  if (!env.OUTCOME_DB) return json({ error: "Traffic storage is not configured." }, 503);
  const url = new URL(request.url);
  if (url.pathname === "/private/website-traffic/api") {
    const range = readRange(url.searchParams);
    if (!range.ok) return json({ error: range.error }, 400);
    return json(await readTrafficMetrics(env.OUTCOME_DB, range.from, range.to));
  }
  if (url.pathname === "/private/website-traffic") return new Response(null, { status: 302, headers: { ...secureHeaders("text/plain; charset=utf-8"), Location: "/private/looking-zero" } });
  return new Response("Not found.", { status: 404, headers: secureHeaders("text/plain; charset=utf-8") });
}

function readRange(params) {
  const now = new Date(), defaultFrom = new Date(now.getTime() - 30 * 86_400_000);
  const fromDate = parseDate(params.get("from")) || defaultFrom, toDate = parseDate(params.get("to")) || now;
  if (fromDate >= toDate) return { ok: false, error: "The start date must be before the end date." };
  if (toDate - fromDate > MAX_DAYS * 86_400_000) return { ok: false, error: `Select no more than ${MAX_DAYS} days.` };
  return { ok: true, from: startOfDay(fromDate).toISOString(), to: nextDayStart(toDate).toISOString() };
}
function unauthorized() { return json({ error: "Private analytics access was not accepted." }, 401, { "WWW-Authenticate": "Basic realm=\"Just One Look analytics\", charset=\"UTF-8\"" }); }
function tooManyRequests() { return json({ error: "Too many private access attempts. Please wait before trying again." }, 429, { "Retry-After": "60" }); }
function originAllowed(origin, configured="") { return configured.split(",").map(value=>value.trim()).filter(Boolean).includes(origin); }
function trafficCorsHeaders(origin, configured) { const headers={"Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST, OPTIONS","Cache-Control":"no-store","Vary":"Origin"}; if(originAllowed(origin,configured))headers["Access-Control-Allow-Origin"]=origin; return headers; }
function parseDate(value) { if(!value||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;const date=new Date(`${value}T00:00:00.000Z`);return Number.isNaN(date.valueOf())?null:date; }
function startOfDay(date) { return new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())); }
function nextDayStart(date) { const result=startOfDay(date);result.setUTCDate(result.getUTCDate()+1);return result; }
function number(value) { return Number(value)||0; }
function percent(numerator,denominator) { return denominator?Math.round(numerator*1000/denominator)/10:0; }
function secureHeaders(contentType) { return {"Cache-Control":"no-store","Content-Security-Policy":"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'","Content-Type":contentType,"Referrer-Policy":"no-referrer","X-Content-Type-Options":"nosniff","X-Frame-Options":"DENY"}; }
function json(body,status=200,extra={}) { return new Response(JSON.stringify(body),{status,headers:{...secureHeaders("application/json; charset=utf-8"),...extra}}); }
function html(body) { return new Response(body,{status:200,headers:secureHeaders("text/html; charset=utf-8")}); }
