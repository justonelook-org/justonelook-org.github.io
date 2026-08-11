import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { handleTrafficDashboard, handleTrafficEvent, incrementDailyCounter, readTrafficMetrics, trafficMeasurementAllowed } from "../src/traffic-analytics.js";

const productionOrigin = "https://justonelook.org";
const testOrigin = "https://website-test-zero.pages.dev";

test("production traffic excludes the exact team test origin", () => {
  assert.equal(trafficMeasurementAllowed("false", productionOrigin, testOrigin), false);
  assert.equal(trafficMeasurementAllowed("test", testOrigin, testOrigin), true);
  assert.equal(trafficMeasurementAllowed("test", productionOrigin, testOrigin), false);
  assert.equal(trafficMeasurementAllowed("true", productionOrigin, testOrigin), true);
  assert.equal(trafficMeasurementAllowed("true", testOrigin, testOrigin), false);
  assert.equal(trafficMeasurementAllowed("true", `${testOrigin}.evil.example`, testOrigin), true);
});

test("records only a closed event name into its daily aggregate column", async () => {
  let sql = "", bound = [];
  const database = { prepare(value) { sql=value; return { bind(...values){bound=values;return this}, async run(){return {success:true}} }; } };
  await incrementDailyCounter(database, "try_it_click", new Date("2026-08-10T12:34:56.000Z"));
  assert.match(sql, /try_it_clicks/);
  assert.deepEqual(bound, ["2026-08-10"]);
  await assert.rejects(() => incrementDailyCounter(database, "arbitrary_event"), /Unknown traffic event/);
});

test("traffic endpoint rejects extra properties and arbitrary events", async () => {
  const env = {
    ALLOWED_ORIGINS: productionOrigin,
    TRAFFIC_MEASUREMENT_ENABLED: "true",
    TRAFFIC_TEST_ORIGIN: testOrigin,
    OUTCOME_DB: { prepare(){throw new Error("Invalid events must not touch storage.")} }
  };
  const extra = await handleTrafficEvent(eventRequest({ event: "homepage_view", visitor: "no" }), env);
  const unknown = await handleTrafficEvent(eventRequest({ event: "page_view" }), env);
  assert.equal(extra.status, 400);
  assert.equal(unknown.status, 400);
});

test("team traffic returns quietly without touching production aggregates", async () => {
  let touched = false;
  const env = {
    ALLOWED_ORIGINS: `${productionOrigin},${testOrigin}`,
    TRAFFIC_MEASUREMENT_ENABLED: "true",
    TRAFFIC_TEST_ORIGIN: testOrigin,
    OUTCOME_DB: { prepare(){touched=true;throw new Error("Team traffic must not be stored.")} }
  };
  const response = await handleTrafficEvent(eventRequest({ event: "zero_opened" }, testOrigin), env);
  assert.equal(response.status, 204);
  assert.equal(touched, false);
});

test("reads aggregate traffic totals with explicit denominators", async () => {
  const database = { prepare(){return {bind(){return this},async first(){return {homepage_views:100,homepage_entrances:60,comparable_try_it_clicks:15,try_it_clicks:25,zero_opens:20,zero_session_starts:10}}};} };
  const metrics = await readTrafficMetrics(database, "2026-08-01T00:00:00.000Z", "2026-08-11T00:00:00.000Z");
  assert.deepEqual(metrics.counts, { homepage_views:100, homepage_entrances:60, try_it_clicks:25, zero_opens:20, zero_session_starts:10 });
  assert.deepEqual(metrics.percentages, { views_to_try_it:25, entrances_to_try_it:25, try_it_to_zero_open:80, zero_open_to_start:50 });
  assert.equal(metrics.homepage_entrances_started_day, "2026-08-11");
  assert.match(metrics.note, /not visits or unique people/i);
});

test("private traffic dashboard uses the existing credentials and redirects to the unified page", async () => {
  const token = "a-private-analytics-token-longer-than-24";
  const unauthorized = await handleTrafficDashboard(new Request("https://example.test/private/website-traffic"), {});
  const authorized = await handleTrafficDashboard(new Request("https://example.test/private/website-traffic", { headers:{Authorization:`Basic ${btoa(`analytics:${token}`)}`} }), {ANALYTICS_ACCESS_TOKEN:token,OUTCOME_DB:{}});
  assert.equal(unauthorized.status, 401);
  assert.equal(authorized.status, 302);
  assert.equal(authorized.headers.get("Location"), "/private/looking-zero");
});

test("browser instrumentation contains no visitor storage or fingerprinting", async () => {
  const script = await readFile(new URL("../../../assets/js/anonymous-traffic.js", import.meta.url), "utf8");
  assert.doesNotMatch(script, /localStorage|sessionStorage|document\.cookie|canvas|userAgent|fingerprint/i);
  assert.match(script, /credentials:\s*"omit"/);
  assert.match(script, /referrerPolicy:\s*"no-referrer"/);
});

test("homepage entrance is inferred locally without sending a referrer or identifier", async () => {
  const script = await readFile(new URL("../../../assets/js/anonymous-traffic.js", import.meta.url), "utf8");
  const events = [];
  const document = { referrer:"https://example.org/post", querySelectorAll(){return [{dataset:{anonymousTrafficEvent:"homepage_view"},matches(){return false}}]} };
  const fetch = async (_url, options) => { events.push(JSON.parse(options.body)); };
  const performance = { getEntriesByType(){return [{type:"navigate"}]} };
  runInNewContext(script, { document, fetch, performance, location:{origin:"https://justonelook.org"}, URL, window:{} });
  assert.deepEqual(events, [{event:"homepage_view"},{event:"homepage_entrance"}]);
  assert.equal(Object.keys(events[1]).length, 1);
});

test("homepage entrance excludes reloads and same-site navigation", async () => {
  const script = await readFile(new URL("../../../assets/js/anonymous-traffic.js", import.meta.url), "utf8");
  async function eventsFor(referrer, type) {
    const events=[];
    const document={referrer,querySelectorAll(){return [{dataset:{anonymousTrafficEvent:"homepage_view"},matches(){return false}}]}};
    const fetch=async(_url,options)=>{events.push(JSON.parse(options.body))};
    const performance={getEntriesByType(){return [{type}]}};
    runInNewContext(script,{document,fetch,performance,location:{origin:"https://justonelook.org"},URL,window:{}});
    return events;
  }
  assert.deepEqual(await eventsFor("", "reload"), [{event:"homepage_view"}]);
  assert.deepEqual(await eventsFor("https://justonelook.org/library/", "navigate"), [{event:"homepage_view"}]);
});

function eventRequest(body, origin=productionOrigin) {
  return new Request("https://api.example/api/traffic", {method:"POST",headers:{"Content-Type":"application/json",Origin:origin},body:JSON.stringify(body)});
}
