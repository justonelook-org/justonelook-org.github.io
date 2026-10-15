import assert from "node:assert/strict";
import test from "node:test";
import { handleAnalyticsRequest, readMetrics, readSdaMetrics } from "../src/analytics.js";

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
  assert.match(html, /Website Traffic/i);
  assert.match(html, /Homepage entrances/i);
  assert.match(html, /Roads to Zero/i);
  assert.match(html, /Anonymous aggregate arrivals through the clean public source links/i);
  assert.match(html, /Anonymous aggregate measurement of website activity and both Zero guides/i);
  assert.match(html, /Looking Zero sessions started/i);
  assert.match(html, /independent action counts, not a linked visitor funnel/i);
  assert.match(html, /may differ slightly from Outcome Measurement sessions/i);
  assert.match(html, /Looking Zero — Outcome Measurement/i);
  assert.match(html, /do not determine whether the inward look succeeded/i);
  assert.match(html, /\/private\/website-traffic\/api/);
  assert.match(html, /\/private\/looking-zero\/api/);
  assert.match(html, /Complete invitation delivered/);
  assert.match(html, /No recorded indication of trying/);
  assert.match(html, /includes explicit reports/i);
  assert.match(html, /Median visitor turn of first indication/i);
  assert.match(html, /Self-Directed Attention Zero — Usage/i);
  assert.match(html, /do not determine whether attention skills improved/i);
  assert.ok(html.includes("/private/self-directed-attention/api"));
  assert.match(html, /Formal exercise guidance delivered/);
  assert.match(html, /Daily-life guidance delivered/);
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
