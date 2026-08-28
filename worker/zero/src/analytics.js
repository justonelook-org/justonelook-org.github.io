import { basicCredentialsAccepted, rateLimitAccepted, requestClientKey } from "./request-security.js";

const DEFAULT_DAYS = 30;
const MAX_DAYS = 366;

export async function handleAnalyticsRequest(request, env) {
  if (!await rateLimitAccepted(env.PRIVATE_RATE_LIMITER, `private:${requestClientKey(request)}`)) return tooManyRequests();
  if (!await basicCredentialsAccepted(request, env.ANALYTICS_ACCESS_TOKEN)) return unauthorized();
  if (!env.OUTCOME_DB) return json({ error: "Outcome storage is not configured." }, 503);

  const url = new URL(request.url);
  if (url.pathname === "/private/looking-zero/api") {
    const range = readRange(url.searchParams);
    if (!range.ok) return json({ error: range.error }, 400);
    return json(await readMetrics(env.OUTCOME_DB, range.from, range.to));
  }
  if (url.pathname === "/private/looking-zero") return html(dashboardHtml());
  return new Response("Not found.", { status: 404, headers: secureHeaders("text/plain; charset=utf-8") });
}

export async function readMetrics(database, from, to) {
  const live = await database.prepare(`
    SELECT
      COUNT(*) AS sessions,
      SUM(CASE WHEN invitation_delivered = 1 THEN 1 ELSE 0 END) AS invitations,
      SUM(CASE WHEN post_invitation_response = 1 THEN 1 ELSE 0 END) AS post_responses,
      SUM(CASE WHEN highest_attempt_signal IN ('attempt_indicated','attempt_explicitly_reported') THEN 1 ELSE 0 END) AS indicated,
      SUM(CASE WHEN highest_attempt_signal = 'attempt_explicitly_reported' THEN 1 ELSE 0 END) AS explicit,
      SUM(CASE WHEN highest_attempt_signal = 'none' THEN 1 ELSE 0 END) AS no_report
    FROM looking_sessions
    WHERE started_at >= ? AND started_at < ?
  `).bind(from, to).first();

  const archived = await database.prepare(`
    SELECT
      COALESCE(SUM(sessions), 0) AS sessions,
      COALESCE(SUM(invitations), 0) AS invitations,
      COALESCE(SUM(post_invitation_responses), 0) AS post_responses,
      COALESCE(SUM(attempts_indicated), 0) AS indicated,
      COALESCE(SUM(attempts_explicitly_reported), 0) AS explicit,
      COALESCE(SUM(no_attempt_report), 0) AS no_report
    FROM looking_daily_aggregates
    WHERE day >= substr(?, 1, 10) AND day < substr(?, 1, 10)
  `).bind(from, to).first();

  const medianRows = await database.prepare(`
    SELECT messages_before_attempt AS value
    FROM looking_sessions
    WHERE started_at >= ? AND started_at < ? AND messages_before_attempt IS NOT NULL
    ORDER BY messages_before_attempt
  `).bind(from, to).all();

  const totals = {};
  for (const key of ["sessions", "invitations", "post_responses", "indicated", "explicit", "no_report"]) {
    totals[key] = number(live?.[key]) + number(archived?.[key]);
  }
  const values = (medianRows?.results || []).map(({ value }) => number(value));
  const medianMessages = median(values);

  return {
    range: { from, to },
    counts: totals,
    percentages: {
      invitations_of_started: percent(totals.invitations, totals.sessions),
      post_responses_of_invitations: percent(totals.post_responses, totals.invitations),
      indicated_of_invitations: percent(totals.indicated, totals.invitations),
      explicit_of_invitations: percent(totals.explicit, totals.invitations)
    },
    median_messages_before_attempt_report: medianMessages,
    median_coverage: archived?.sessions ? "retained session records only" : "full selected range",
    note: "Possible indications and sessions with no recorded indication divide all started sessions. Explicit reports are included within possible indications. These figures describe conversational evidence only. Not reporting an attempt does not mean the inward look did not occur."
  };
}

export async function archiveExpiredSessions(database, now = new Date(), retentionDays = 90) {
  if (!database) return;
  const cutoff = new Date(now.getTime() - retentionDays * 86_400_000).toISOString().slice(0, 10);
  await database.prepare(`
    INSERT INTO looking_daily_aggregates (day, sessions, invitations, post_invitation_responses, attempts_indicated, attempts_explicitly_reported, no_attempt_report)
    SELECT
      substr(started_at, 1, 10), COUNT(*),
      SUM(CASE WHEN invitation_delivered = 1 THEN 1 ELSE 0 END),
      SUM(CASE WHEN post_invitation_response = 1 THEN 1 ELSE 0 END),
      SUM(CASE WHEN highest_attempt_signal IN ('attempt_indicated','attempt_explicitly_reported') THEN 1 ELSE 0 END),
      SUM(CASE WHEN highest_attempt_signal = 'attempt_explicitly_reported' THEN 1 ELSE 0 END),
      SUM(CASE WHEN highest_attempt_signal = 'none' THEN 1 ELSE 0 END)
    FROM looking_sessions
    WHERE substr(started_at, 1, 10) < ?
    GROUP BY substr(started_at, 1, 10)
    ON CONFLICT(day) DO UPDATE SET
      sessions = excluded.sessions, invitations = excluded.invitations,
      post_invitation_responses = excluded.post_invitation_responses,
      attempts_indicated = excluded.attempts_indicated,
      attempts_explicitly_reported = excluded.attempts_explicitly_reported,
      no_attempt_report = excluded.no_attempt_report
  `).bind(cutoff).run();
  await database.prepare("DELETE FROM looking_sessions WHERE substr(started_at, 1, 10) < ?").bind(cutoff).run();
}

function readRange(params) {
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - DEFAULT_DAYS * 86_400_000);
  const fromDate = parseDate(params.get("from")) || defaultFrom;
  const toDate = parseDate(params.get("to")) || now;
  if (fromDate >= toDate) return { ok: false, error: "The start date must be before the end date." };
  if (toDate - fromDate > MAX_DAYS * 86_400_000) return { ok: false, error: `Select no more than ${MAX_DAYS} days.` };
  return { ok: true, from: startOfDay(fromDate).toISOString(), to: nextDayStart(toDate).toISOString() };
}

function unauthorized() {
  return json({ error: "Private analytics access was not accepted." }, 401, { "WWW-Authenticate": "Basic realm=\"Looking Zero analytics\", charset=\"UTF-8\"" });
}

function tooManyRequests() { return json({ error: "Too many private access attempts. Please wait before trying again." }, 429, { "Retry-After": "60" }); }

function dashboardHtml() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Just One Look — Measurement Dashboard</title><style>
:root{color-scheme:light dark;font-family:system-ui,sans-serif}body{max-width:58rem;margin:0 auto;padding:2rem 1rem;line-height:1.5}
h1{font-size:1.65rem}h2{font-size:1.4rem;margin:0}.controls{display:flex;gap:1rem;flex-wrap:wrap;align-items:end;margin:2rem 0}.controls label{display:grid;gap:.3rem}
button,input{font:inherit;padding:.45rem}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:1rem}
.card{border:1px solid #8886;border-radius:.5rem;padding:1rem}.value{font-size:2rem;font-variant-numeric:tabular-nums}.detail{color:#666;font-size:.9rem}
@media(prefers-color-scheme:dark){.detail{color:#bbb}}#status{min-height:1.5rem}.dashboard-section{margin:2.5rem 0}.section-intro{margin:.4rem 0 1.25rem}.note{margin-top:1.5rem;max-width:48rem}.divider{border:0;border-top:1px solid #8886;margin:3rem 0}
</style></head><body><main><h1>Just One Look — Measurement Dashboard</h1>
<p>Anonymous aggregate measurement of website activity and Looking Zero outcomes.</p>
<form class="controls" id="range"><label>From<input type="date" name="from" required></label><label>Through<input type="date" name="to" required></label><button>Update</button></form>
<p id="status" role="status"></p>
<section class="dashboard-section" aria-labelledby="traffic-heading"><h2 id="traffic-heading">Website Traffic</h2>
<p class="section-intro">Anonymous aggregate views and actions. These are independent action counts, not a linked visitor funnel, and they do not identify or follow visitors.</p>
<div class="cards" id="traffic-cards" aria-live="polite"></div><p class="note" id="traffic-note"></p></section>
<hr class="divider">
<section class="dashboard-section" aria-labelledby="outcome-heading"><h2 id="outcome-heading">Looking Zero — Outcome Measurement</h2>
<p class="section-intro">Anonymous milestones and reports of trying. These figures do not determine whether the inward look succeeded.</p>
<div class="cards" id="outcome-cards" aria-live="polite"></div><p class="note" id="outcome-note"></p></section>
<script>
const form=document.querySelector('#range'),status=document.querySelector('#status'),trafficCards=document.querySelector('#traffic-cards'),trafficNote=document.querySelector('#traffic-note'),outcomeCards=document.querySelector('#outcome-cards'),outcomeNote=document.querySelector('#outcome-note');
const today=new Date(),from=new Date(today.getTime()-30*86400000);form.to.value=today.toISOString().slice(0,10);form.from.value=from.toISOString().slice(0,10);
form.addEventListener('submit',e=>{e.preventDefault();load()});
async function load(){status.textContent='Loading…';trafficCards.replaceChildren();outcomeCards.replaceChildren();const q=new URLSearchParams(new FormData(form));try{const [tr,or]=await Promise.all([fetch('/private/website-traffic/api?'+q,{cache:'no-store'}),fetch('/private/looking-zero/api?'+q,{cache:'no-store'})]);const [td,od]=await Promise.all([tr.json(),or.json()]);if(!tr.ok)throw new Error(td.error||'Unable to load website traffic.');if(!or.ok)throw new Error(od.error||'Unable to load Looking Zero outcomes.');renderTraffic(td);renderOutcome(od);status.textContent='';}catch(e){status.textContent=e.message}}
function renderTraffic(d){const c=d.counts,p=d.percentages,started=new Date(d.homepage_entrances_started_day+'T00:00:00Z').toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});renderCards(trafficCards,[['Homepage views',c.homepage_views,'Page loads, not unique people'],['Homepage entrances',c.homepage_entrances,p.entrances_to_try_it+'% produced a Try It click since '+started+'; not unique people'],['Try It clicks',c.try_it_clicks,p.views_to_try_it+'% of homepage views'],['Looking Zero opened',c.zero_opens,p.try_it_to_zero_open+'% of Try It clicks'],['Looking Zero sessions started',c.zero_session_starts,'Browser-recorded first-message events; may differ slightly from Outcome Measurement sessions']]);trafficNote.textContent=d.note}
function renderOutcome(d){const c=d.counts,p=d.percentages;renderCards(outcomeCards,[['Sessions started',c.sessions,'Worker-recorded anonymous sessions'],['Complete invitation delivered',c.invitations,p.invitations_of_started+'% of sessions'],['Response after invitation',c.post_responses,p.post_responses_of_invitations+'% of invitations'],['Possible indication of trying',c.indicated,p.indicated_of_invitations+'% of complete invitations; includes explicit reports'],['Explicitly reported trying',c.explicit,p.explicit_of_invitations+'% of complete invitations; included in possible indications'],['No recorded indication of trying',c.no_report,'Includes sessions ending before the complete invitation; not evidence that the look did not occur'],['Median visitor turn of first indication',d.median_messages_before_attempt_report??'—','Among sessions with a recorded indication; '+d.median_coverage]]);outcomeNote.textContent=d.note}
function renderCards(container,rows){for(const [label,value,detail]of rows){const el=document.createElement('article');el.className='card';const l=document.createElement('div'),v=document.createElement('div'),x=document.createElement('div');l.textContent=label;v.className='value';v.textContent=value;x.className='detail';x.textContent=detail;el.append(l,v,x);container.append(el)}}
load();
</script></main></body></html>`;
}

function parseDate(value) { if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null; const date = new Date(`${value}T00:00:00.000Z`); return Number.isNaN(date.valueOf()) ? null : date; }
function startOfDay(date) { return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())); }
function nextDayStart(date) { const result = startOfDay(date); result.setUTCDate(result.getUTCDate() + 1); return result; }
function number(value) { return Number(value) || 0; }
function percent(numerator, denominator) { return denominator ? Math.round(numerator * 1000 / denominator) / 10 : 0; }
function median(values) { if (!values.length) return null; const middle = Math.floor(values.length / 2); return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2; }
function secureHeaders(contentType) { return { "Cache-Control": "no-store", "Content-Security-Policy": "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'", "Content-Type": contentType, "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY" }; }
function json(body, status = 200, extra = {}) { return new Response(JSON.stringify(body), { status, headers: { ...secureHeaders("application/json; charset=utf-8"), ...extra } }); }
function html(body) { return new Response(body, { status: 200, headers: secureHeaders("text/html; charset=utf-8") }); }
