import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyUnifiedConversation,
  measureUnifiedConversation,
  normalizeUnifiedClassification,
  recordUnifiedMeasurementError,
  recordUnifiedSessionStart,
  shouldClassifyUnifiedConversation
} from "../src/unified-measurement.js";

test("normalizes unified milestones conservatively", () => {
  assert.deepEqual(normalizeUnifiedClassification({
    post_inward_invitation_response: true,
    attempt_signal: "attempt_explicitly_reported",
    post_attention_guidance_response: true
  }), {
    inward_invitation_delivered: false,
    post_inward_invitation_response: false,
    attempt_signal: "none",
    formal_guidance_delivered: false,
    daily_life_guidance_delivered: false,
    post_attention_guidance_response: false,
    natural_completion: false
  });
  const valid = normalizeUnifiedClassification({
    inward_invitation_delivered: true,
    post_inward_invitation_response: true,
    attempt_signal: "attempt_indicated",
    formal_guidance_delivered: true,
    post_attention_guidance_response: true
  });
  assert.equal(valid.attempt_signal, "attempt_indicated");
  assert.equal(valid.post_attention_guidance_response, true);
});

test("uses one storage-disabled structured unified classifier", async () => {
  let body;
  const result = await classifyUnifiedConversation({
    apiKey: "test-key", model: "gpt-5.6-luna", messages: [{ role: "user", content: "What next?" }],
    fetchImpl: async (_url, options) => {
      body = JSON.parse(options.body);
      return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify({
        inward_invitation_delivered: true, post_inward_invitation_response: true,
        attempt_signal: "attempt_explicitly_reported", formal_guidance_delivered: false,
        daily_life_guidance_delivered: false, post_attention_guidance_response: false,
        natural_completion: false
      }) }] }] }), { status: 200 });
    }
  });
  assert.equal(result.attempt_signal, "attempt_explicitly_reported");
  assert.equal(body.store, false);
  assert.equal(body.text.format.strict, true);
  assert.match(body.instructions, /Never classify whether the inward look succeeded/i);
  assert.match(body.instructions, /untrusted data/i);
});

test("stores only anonymous unified metadata and advances milestones monotonically", async () => {
  const calls = [];
  const database = { prepare(sql) { const call = { sql, values: [] }; calls.push(call); return {
    bind(...values) { call.values = values; return this; }, async run() { return { success: true }; },
    async first() { return {
      inward_invitation_delivered: 1, post_inward_invitation_response: 0,
      highest_attempt_signal: "none", formal_guidance_delivered: 0,
      daily_life_guidance_delivered: 0, post_attention_guidance_response: 0,
      natural_completion: 0
    }; }
  }; } };
  await recordUnifiedSessionStart(database, "e".repeat(64), "2026-10-17T10:00:00.000Z", 1);
  await measureUnifiedConversation({
    database, apiKey: "test-key", sessionHash: "e".repeat(64), turnCount: 3,
    messages: [{ role: "user", content: "I've looked. Then what?" }, { role: "assistant", content: "I can guide a simple attention exercise." }],
    fetchImpl: async () => new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify({
      inward_invitation_delivered: true, post_inward_invitation_response: true,
      attempt_signal: "attempt_explicitly_reported", formal_guidance_delivered: false,
      daily_life_guidance_delivered: false, post_attention_guidance_response: false,
      natural_completion: false
    }) }] }] }), { status: 200 })
  });
  assert.match(calls.at(-1).sql, /UPDATE unified_sessions/);
  assert.ok(calls.every(({ values }) => !values.includes("I've looked. Then what?")));
  assert.ok(calls.at(-1).values.includes("attempt_explicitly_reported"));
});

test("selects unified classification points without classifying every turn", () => {
  const delivered = { inward_invitation_delivered: 1, formal_guidance_delivered: 0, daily_life_guidance_delivered: 0 };
  assert.equal(shouldClassifyUnifiedConversation(delivered, [{ role: "user", content: "What next?" }]), true);
  assert.equal(shouldClassifyUnifiedConversation(delivered, [{ role: "user", content: "I understand." }]), false);
  assert.equal(shouldClassifyUnifiedConversation({ ...delivered, formal_guidance_delivered: 1 }, [{ role: "user", content: "Thanks, goodbye." }]), true);
});

test("stores only a closed unified measurement error code", async () => {
  let values;
  const database = { prepare() { return { bind(...bound) { values = bound; return this; }, async run() {} }; } };
  const code = await recordUnifiedMeasurementError(database, "f".repeat(64), new SyntaxError("private content"));
  assert.equal(code, "classifier_invalid_json");
  assert.deepEqual(values, ["classifier_invalid_json", "f".repeat(64)]);
});
