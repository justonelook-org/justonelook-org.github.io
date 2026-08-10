const MAX_DAYS = 366;
const EVENT_COLUMNS = Object.freeze({
  homepage_view: "homepage_views",
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

  if (!trafficMeasurementAllowed(env.TRAFFIC_MEASUREMENT_ENABLED, origin, env.TRAFFIC_TEST_ORIGIN)) {
    return new Response(null, { status: 204, headers: cors });
  }
  if (!env.OUTCOME_DB) return json({ error: "Traffic storage is not configured." }, 503, cors);

  let body;
  try { body = await request.json(); }
  catch { return json({ error: "The event could not be read." }, 400, cors); }
  if (!body || typeof body !== "object" || Object.keys(body).length !== 1 || !EVENT_COLUMNS[body.event]) {
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

export async function readTrafficMetrics(database, from, to) {
  const totals = await database.prepare(`
    SELECT
      COALESCE(SUM(homepage_views), 0) AS homepage_views,
      COALESCE(SUM(try_it_clicks), 0) AS try_it_clicks,
      COALESCE(SUM(zero_opens), 0) AS zero_opens,
      COALESCE(SUM(zero_session_starts), 0) AS zero_session_starts
    FROM website_daily_traffic
    WHERE day >= substr(?, 1, 10) AND day < substr(?, 1, 10)
  `).bind(from, to).first();
  const counts = {
    homepage_views: number(totals?.homepage_views),
    try_it_clicks: number(totals?.try_it_clicks),
    zero_opens: number(totals?.zero_opens),
    zero_session_starts: number(totals?.zero_session_starts)
  };
  return {
    range: { from, to },
    counts,
    percentages: {
      views_to_try_it: percent(counts.try_it_clicks, counts.homepage_views),
      try_it_to_zero_open: percent(counts.zero_opens, counts.try_it_clicks),
      zero_open_to_start: percent(counts.zero_session_starts, counts.zero_opens)
    },
    note: "These are anonymous aggregate action counts, not unique people or linked visitor journeys. No analytics cookies or visitor profiles are used."
  };
}

export async function handleTrafficDashboard(request, env) {
  if (!authorized(request, env.ANALYTICS_ACCESS_TOKEN)) return unauthorized();
  if (!env.OUTCOME_DB) return json({ error: "Traffic storage is not configured." }, 503);
  const url = new URL(request.url);
  if (url.pathname === "/private/website-traffic/api") {
    const range = readRange(url.searchParams);
    if (!range.ok) return json({ error: range.error }, 400);
    return json(await readTrafficMetrics(env.OUTCOME_DB, range.from, range.to));
  }
  if (url.pathname === "/private/website-traffic") return html(dashboardHtml());
  return new Response("Not found.", { status: 404, headers: secureHeaders("text/plain; charset=utf-8") });
}

function dashboardHtml() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Website Traffic — Just One Look</title><style>
:root{color-scheme:light dark;font-family:system-ui,sans-serif}body{max-width:58rem;margin:0 auto;padding:2rem 1rem;line-height:1.5}
h1{font-size:1.55rem}.nav{display:flex;gap:1rem;flex-wrap:wrap}.controls{display:flex;gap:1rem;flex-wrap:wrap;align-items:end;margin:2rem 0}.controls label{display:grid;gap:.3rem}
button,input{font:inherit;padding:.45rem}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:1rem}
.card{border:1px solid #8886;border-radius:.5rem;padding:1rem}.value{font-size:2rem;font-variant-numeric:tabular-nums}.detail{color:#666;font-size:.9rem}
@media(prefers-color-scheme:dark){.detail{color:#bbb}}#status{min-height:1.5rem}.note{margin-top:2rem;max-width:48rem}
</style></head><body><main><h1>Website Traffic</h1>
<p>Anonymous aggregate views and actions. This dashboard does not identify or follow visitors.</p>
<nav class="nav" aria-label="Private dashboards"><strong>Website Traffic</strong><a href="/private/looking-zero">Looking Zero Outcomes</a></nav>
<form class="controls" id="range"><label>From<input type="date" name="from" required></label><label>Through<input type="date" name="to" required></label><button>Update</button></form>
<p id="status" role="status"></p><section class="cards" id="cards" aria-live="polite"></section><p class="note" id="note"></p>
<script>
const form=document.querySelector('#range'),cards=document.querySelector('#cards'),status=document.querySelector('#status'),note=document.querySelector('#note');
const today=new Date(),from=new Date(today.getTime()-30*86400000);form.to.value=today.toISOString().slice(0,10);form.from.value=from.toISOString().slice(0,10);
form.addEventListener('submit',e=>{e.preventDefault();load()});
async function load(){status.textContent='Loading…';cards.replaceChildren();const q=new URLSearchParams(new FormData(form));try{const r=await fetch('/private/website-traffic/api?'+q,{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||'Unable to load traffic.');render(d);status.textContent='';}catch(e){status.textContent=e.message}}
function render(d){const c=d.counts,p=d.percentages;const rows=[['Homepage views',c.homepage_views,'Page loads, not unique people'],['Try It clicks',c.try_it_clicks,p.views_to_try_it+'% of homepage views'],['Looking Zero opened',c.zero_opens,p.try_it_to_zero_open+'% of Try It clicks'],['Looking Zero sessions started',c.zero_session_starts,p.zero_open_to_start+'% of Zero opens']];for(const [label,value,detail]of rows){const el=document.createElement('article');el.className='card';const l=document.createElement('div'),v=document.createElement('div'),x=document.createElement('div');l.textContent=label;v.className='value';v.textContent=value;x.className='detail';x.textContent=detail;el.append(l,v,x);cards.append(el)}note.textContent=d.note}
load();
</script></main></body></html>`;
}

function readRange(params) {
  const now = new Date(), defaultFrom = new Date(now.getTime() - 30 * 86_400_000);
  const fromDate = parseDate(params.get("from")) || defaultFrom, toDate = parseDate(params.get("to")) || now;
  if (fromDate >= toDate) return { ok: false, error: "The start date must be before the end date." };
  if (toDate - fromDate > MAX_DAYS * 86_400_000) return { ok: false, error: `Select no more than ${MAX_DAYS} days.` };
  return { ok: true, from: startOfDay(fromDate).toISOString(), to: nextDayStart(toDate).toISOString() };
}
function authorized(request, expected) { const supplied=request.headers.get("Authorization")||""; if(!expected||expected.length<24||!supplied.startsWith("Basic "))return false; try{return atob(supplied.slice(6))===`analytics:${expected}`}catch{return false} }
function unauthorized() { return json({ error: "Private analytics access was not accepted." }, 401, { "WWW-Authenticate": "Basic realm=\"Just One Look analytics\", charset=\"UTF-8\"" }); }
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
