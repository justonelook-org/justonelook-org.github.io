import assert from "node:assert/strict";
import test from "node:test";
import { archiveExpiredSessions, handleAnalyticsRequest, readMetrics, readSdaMetrics, readUnifiedMetrics } from "../src/analytics.js";

test("private analytics fails closed without a configured secret", async () => {
  const response = await handleAnalyticsRequest(new Request("https://example.test/private/looking-zero"), { PRIVATE_RATE_LIMITER: allowRateLimit });
  assert.equal(response.status, 401);
  assert.match(response.headers.get("WWW-Authenticate"), /Basic/);
});

test("private analytics accepts only the configured Basic credentials", async () => {
  const token = "a-private-analytics-token-longer-than-24";
  const headers = { Authorization: `Basic ${btoa(`analytics:${token}`)}` };
  const response = await handleAnalyticsRequest(new Request("https://example.test/private/looking-zero", { headers }), { ANALYTICS_ACCESS_TOKEN: token, OUTCOME_DB: {}, PRIVATE_RATE_LIMITER: allowRateLimit });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("Content-Security-Policy"), /frame-ancestors 'none'/);
  const html = await response.text();
  assert.match(html, /Zero at a glance/i);
  assert.match(html, /Combined inward-looking delivery and conversational reports/i);
  assert.match(html, /Guide sessions started/i);
  assert.match(html, /best available count of complete opportunities to try the look/i);
  assert.match(html, /renderOverview\(od,ud\)/);
  assert.match(html, /a\.sessions\+b\.sessions/);
  assert.match(html, /Website Traffic/i);
  assert.match(html, /Homepage entrances/i);
  assert.match(html, /Roads to Zero/i);
  assert.match(html, /Anonymous aggregate arrivals through the clean public source links/i);
  assert.match(html, /Anonymous aggregate measurement of website activity and Zero guidance/i);
  assert.match(html, /Zero sessions started/i);
  assert.match(html, /independent action counts, not a linked visitor funnel/i);
  assert.match(html, /may differ slightly from Worker-recorded guide sessions/i);
  assert.match(html, /Show historical measurements/i);
  assert.match(html, /<details class="historical">/i);
  assert.doesNotMatch(html, /<details class="historical" open/i);
  assert.match(html, /Former Looking Zero/i);
  assert.match(html, /do not determine whether the inward look succeeded/i);
  assert.match(html, /\/private\/website-traffic\/api/);
  assert.match(html, /\/private\/looking-zero\/api/);
  assert.match(html, /Complete invitation delivered/);
  assert.match(html, /No recorded indication of trying/);
  assert.match(html, /includes explicit reports/i);
  assert.match(html, /Median visitor turn of first indication/i);
  assert.match(html, /Former Self-Directed Attention Zero/i);
  assert.match(html, /do not determine whether attention skills improved/i);
  assert.ok(html.includes("/private/self-directed-attention/api"));
  assert.match(html, /Formal exercise guidance delivered/);
  assert.match(html, /Daily-life guidance delivered/);
  assert.match(html, /Unified Zero — Guidance and Reports/i);
  assert.match(html, /public unified guide since 20 Oct 2026/i);
  assert.match(html, /Earlier team-test records are excluded/i);
  assert.ok(html.includes("/private/unified-zero/api"));
  assert.match(html, /Complete inward-looking invitation delivered/);
  assert.match(html, /Formal attention-exercise guidance delivered/);
  assert.match(html, /Median visitor turn of first attention guidance/i);
  assert.match(html, /form\.from\.value='2026-08-10'/);
  assert.match(html, /name="from" value="2026-08-10"/);
  assert.match(html, /window\.addEventListener\('pageshow',setDefaultRange\)/);
});

test("combines retained and archived SDA delivery milestones without treating them as success", async () => {
  let query = 0;
  const database = { prepare() { query += 1; return {
    bind() { return this; },
    async first() { return query === 1
      ? { sessions: 8, redirected: 2, formal: 3, daily_life: 2, guidance: 4, post_responses: 3, completions: 1 }
      : { sessions: 2, redirected: 0, formal: 1, daily_life: 0, guidance: 1, post_responses: 1, completions: 1 }; },
    async all() { return { results: [{ value: 2 }, { value: 3 }, { value: 4 }] }; }
  }; } };
  const metrics = await readSdaMetrics(database, "2026-08-10T00:00:00.000Z", "2026-09-01T00:00:00.000Z");
  assert.deepEqual(metrics.counts, { sessions: 10, redirected: 2, formal: 4, daily_life: 2, guidance: 5, post_responses: 4, completions: 2 });
  assert.equal(metrics.percentages.guidance_of_started, 50);
  assert.equal(metrics.percentages.post_responses_of_guidance, 80);
  assert.equal(metrics.median_turn_of_first_guidance, 3);
  assert.match(metrics.note, /not whether attention skills improved/i);
});

const allowRateLimit = { limit: async () => ({ success: true }) };

test("private analytics rate-limits repeated access attempts", async () => {
  const response = await handleAnalyticsRequest(
    new Request("https://example.test/private/looking-zero", { headers: { "CF-Connecting-IP": "192.0.2.10" } }),
    { PRIVATE_RATE_LIMITER: { limit: async ({ key }) => ({ success: key !== "private:192.0.2.10" }) } }
  );
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "60");
});

test("combines retained sessions and archived daily aggregates with clear denominators", async () => {
  let query = 0;
  const database = {
    prepare() {
      query += 1;
      return {
        bind() { return this; },
        async first() {
          return query === 1
            ? { sessions: 8, invitations: 6, post_responses: 5, indicated: 4, explicit: 2, no_report: 4 }
            : { sessions: 2, invitations: 2, post_responses: 2, indicated: 1, explicit: 0, no_report: 1 };
        },
        async all() { return { results: [{ value: 1 }, { value: 3 }, { value: 4 }] }; }
      };
    }
  };
  const metrics = await readMetrics(database, "2026-07-01T00:00:00.000Z", "2026-08-01T00:00:00.000Z");
  assert.deepEqual(metrics.counts, { sessions: 10, invitations: 8, post_responses: 7, indicated: 5, explicit: 2, no_report: 5 });
  assert.equal(metrics.percentages.invitations_of_started, 80);
  assert.equal(metrics.percentages.explicit_of_invitations, 25);
  assert.equal(metrics.median_messages_before_attempt_report, 3);
  assert.match(metrics.note, /Explicit reports are included within possible indications/i);
  assert.match(metrics.note, /does not mean the inward look did not occur/i);
});

test("combines unified retained and archived milestones with explicit denominators", async () => {
  let query = 0;
  const database = { prepare() { query += 1; return {
    bind() { return this; },
    async first() {
      return query === 1
        ? { sessions: 8, invitations: 6, post_inward_responses: 5, indicated: 3, explicit: 2, no_report: 5, formal: 3, daily_life: 2, guidance: 4, post_attention_responses: 3, completions: 1 }
        : { sessions: 2, invitations: 2, post_inward_responses: 1, indicated: 1, explicit: 0, no_report: 1, formal: 1, daily_life: 0, guidance: 1, post_attention_responses: 1, completions: 1 };
    },
    async all() { return query === 3 ? { results: [{ value: 2 }, { value: 4 }] } : { results: [{ value: 3 }, { value: 5 }] }; }
  }; } };
  const metrics = await readUnifiedMetrics(database, "2026-10-17T00:00:00.000Z", "2026-11-01T00:00:00.000Z");
  assert.deepEqual(metrics.counts, {
    sessions: 10, invitations: 8, post_inward_responses: 6, indicated: 4, explicit: 2,
    no_report: 6, formal: 4, daily_life: 2, guidance: 5, post_attention_responses: 4, completions: 2
  });
  assert.equal(metrics.percentages.invitations_of_started, 80);
  assert.equal(metrics.percentages.post_inward_responses_of_invitations, 75);
  assert.equal(metrics.percentages.post_attention_responses_of_guidance, 80);
  assert.equal(metrics.median_turn_of_first_indication, 3);
  assert.equal(metrics.median_turn_of_first_attention_guidance, 4);
  assert.equal(metrics.range.from, "2026-10-20T00:00:00.000Z");
  assert.equal(metrics.public_measurement_started_day, "2026-10-20");
  assert.match(metrics.note, /overlapping conversational milestones/i);
  assert.match(metrics.note, /Earlier team-test records are excluded/i);
  assert.match(metrics.note, /do not determine whether the inward look succeeded/i);
});

test("archives unified rows into anonymous daily totals before deleting session rows", async () => {
  const calls = [];
  const database = { prepare(sql) { const call = { sql, values: [] }; calls.push(call); return {
    bind(...values) { call.values = values; return this; }, async run() { return { success: true }; }
  }; } };
  await archiveExpiredSessions(database, new Date("2027-01-20T00:00:00.000Z"), 90);
  const insert = calls.find(({ sql }) => /INSERT INTO unified_daily_aggregates/.test(sql));
  const removal = calls.find(({ sql }) => /DELETE FROM unified_sessions/.test(sql));
  assert.ok(insert);
  assert.ok(removal);
  assert.match(insert.sql, /SUM\(inward_invitation_delivered\)/);
  assert.match(insert.sql, /SUM\(formal_guidance_delivered\)/);
  assert.deepEqual(insert.values, ["2026-10-22"]);
  assert.deepEqual(removal.values, ["2026-10-22"]);
});
