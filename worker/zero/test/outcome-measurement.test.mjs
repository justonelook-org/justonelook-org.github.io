import assert from "node:assert/strict";
import test from "node:test";
import { classifyConversation, hashSessionId, measureConversation, normalizeClassification, recordMeasurementError, recordSessionStart, shouldClassifyConversation } from "../src/outcome-measurement.js";

test("normalizes uncertain and invalid classifier results conservatively", () => {
  assert.deepEqual(normalizeClassification({ invitation_delivered: false, post_invitation_response: true, attempt_signal: "attempt_explicitly_reported" }), { invitation_delivered: false, post_invitation_response: false, attempt_signal: "none" });
  assert.deepEqual(normalizeClassification({ invitation_delivered: true, post_invitation_response: true, attempt_signal: "invented" }), { invitation_delivered: true, post_invitation_response: true, attempt_signal: "none" });
  assert.deepEqual(normalizeClassification({ invitation_delivered: true, post_invitation_response: true, attempt_signal: "attempt_indicated" }), { invitation_delivered: true, post_invitation_response: true, attempt_signal: "attempt_indicated" });
});

test("classifies until the invitation is found, then only on outcome-relevant visitor turns", () => {
  assert.equal(shouldClassifyConversation({ invitation_delivered: 0 }, [{ role: "user", content: "Can you guide me?" }]), true);
  assert.equal(shouldClassifyConversation({ invitation_delivered: 1 }, [{ role: "user", content: "Why is this called Step One?" }]), false);
  assert.equal(shouldClassifyConversation({ invitation_delivered: 1 }, [{ role: "user", content: "I tried, but nothing happened." }]), true);
  assert.equal(shouldClassifyConversation({ invitation_delivered: 1 }, [{ role: "user", content: "There is a simple sense of being me." }]), true);
});

test("hashes a browser session deterministically without retaining the UUID", async () => {
  const session = "12345678-1234-1234-1234-123456789abc";
  const first = await hashSessionId(session, "a-long-private-test-secret");
  const second = await hashSessionId(session, "a-long-private-test-secret");
  assert.equal(first, second);
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.doesNotMatch(first, /12345678/);
});

test("uses a separate economical structured-output request with storage disabled", async () => {
  let requestBody;
  const classification = await classifyConversation({
    apiKey: "outcome-test-key",
    model: "gpt-5.6-luna",
    messages: [{ role: "user", content: "I tried, but I am not sure." }],
    fetchImpl: async (_url, options) => {
      requestBody = JSON.parse(options.body);
      return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify({ invitation_delivered: true, post_invitation_response: true, attempt_signal: "attempt_explicitly_reported", evidence_basis: "explicit_attempt_report" }) }] }] }), { status: 200 });
    }
  });
  assert.equal(classification.attempt_signal, "attempt_explicitly_reported");
  assert.equal(requestBody.model, "gpt-5.6-luna");
  assert.equal(requestBody.store, false);
  assert.equal(requestBody.reasoning.effort, "none");
  assert.equal(requestBody.text.format.type, "json_schema");
  assert.equal(requestBody.text.format.strict, true);
  assert.match(requestBody.instructions, /When uncertain, choose the lower attempt signal/);
  assert.match(requestBody.instructions, /untrusted data/);
  assert.match(requestBody.instructions, /Absence of an attempt report does not mean the inward look did not occur/);
});

test("stores only anonymous metadata and advances outcomes monotonically", async () => {
  const calls = [];
  const database = {
    prepare(sql) {
      const entry = { sql, values: [] };
      calls.push(entry);
      return {
        bind(...values) { entry.values = values; return this; },
        async run() { return { success: true }; },
        async first() { return { invitation_delivered: 1, post_invitation_response: 1, highest_attempt_signal: "attempt_indicated" }; }
      };
    }
  };
  await recordSessionStart(database, "a".repeat(64), "2026-08-09T12:00:00.000Z", 2);
  const result = await measureConversation({
    database,
    apiKey: "outcome-test-key",
    sessionHash: "a".repeat(64),
    messages: [{ role: "assistant", content: "Turn your attention toward the feeling of being you." }, { role: "user", content: "I did that just now." }],
    turnCount: 2,
    now: new Date("2026-08-09T12:01:00.000Z"),
    fetchImpl: async () => new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify({ invitation_delivered: true, post_invitation_response: true, attempt_signal: "attempt_explicitly_reported", evidence_basis: "explicit_attempt_report" }) }] }] }), { status: 200 })
  });
  assert.equal(result.attemptSignal, "attempt_explicitly_reported");
  assert.equal(calls.length, 3);
  assert.equal(calls[0].values[0], "a".repeat(64));
  assert.ok(calls.every(({ values }) => values.every((value) => value !== undefined)));
  assert.ok(calls.every(({ values }) => !values.includes("I did that just now.")));
  assert.match(calls[2].sql, /UPDATE looking_sessions/);
  assert.ok(calls[2].values.includes("attempt_explicitly_reported"));
});

test("stores only a closed operational error code", async () => {
  let values;
  const database = { prepare() { return { bind(...bound) { values = bound; return this; }, async run() { return { success: true }; } }; } };
  const code = await recordMeasurementError(database, "b".repeat(64), new Error("Outcome classifier returned 401 invalid_api_key."));
  assert.equal(code, "classifier_http_401_invalid_api_key");
  assert.deepEqual(values, ["classifier_http_401_invalid_api_key", "b".repeat(64)]);
});
