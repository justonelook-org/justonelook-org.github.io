import assert from "node:assert/strict";
import test from "node:test";
import { handleAnalyticsRequest, readMetrics } from "../src/analytics.js";

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
  assert.match(html, /Anonymous aggregate measurement of website activity and Looking Zero outcomes/i);
  assert.match(html, /Looking Zero sessions started from the production website/i);
  assert.match(html, /Looking Zero — Outcome Measurement/i);
  assert.match(html, /do not determine whether the inward look succeeded/i);
  assert.match(html, /\/private\/website-traffic\/api/);
  assert.match(html, /\/private\/looking-zero\/api/);
  assert.match(html, /Complete invitation delivered/);
  assert.match(html, /No attempt report/);
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
  assert.match(metrics.note, /does not mean the inward look did not occur/i);
});
