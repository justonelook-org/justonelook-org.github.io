import assert from "node:assert/strict";
import test from "node:test";
import { classifySdaConversation, measureSdaConversation, normalizeSdaClassification, recordSdaMeasurementError, recordSdaSessionStart } from "../src/sda-measurement.js";

test("normalizes SDA classifications conservatively", () => {
  assert.deepEqual(normalizeSdaClassification({ post_guidance_response: true }), {
    redirected_to_looking: false, formal_guidance_delivered: false,
    daily_life_guidance_delivered: false, post_guidance_response: false, natural_completion: false
  });
  assert.equal(normalizeSdaClassification({ formal_guidance_delivered: true, post_guidance_response: true }).post_guidance_response, true);
});

test("uses a separate storage-disabled structured SDA classifier", async () => {
  let body;
  const result = await classifySdaConversation({
    apiKey: "test-key", model: "gpt-5.6-luna", messages: [{ role: "user", content: "Guide me." }],
    fetchImpl: async (_url, options) => {
      body = JSON.parse(options.body);
      return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify({ redirected_to_looking: false, formal_guidance_delivered: true, daily_life_guidance_delivered: false, post_guidance_response: false, natural_completion: false }) }] }] }), { status: 200 });
    }
  });
  assert.equal(result.formal_guidance_delivered, true);
  assert.equal(body.store, false);
  assert.equal(body.text.format.strict, true);
  assert.match(body.instructions, /not whether the exercise worked/i);
  assert.match(body.instructions, /untrusted data/i);
});

test("stores only anonymous SDA metadata and advances milestones monotonically", async () => {
  const calls = [];
  const database = { prepare(sql) { const call = { sql, values: [] }; calls.push(call); return {
    bind(...values) { call.values = values; return this; }, async run() { return { success: true }; },
    async first() { return { redirected_to_looking: 0, formal_guidance_delivered: 0, daily_life_guidance_delivered: 0, post_guidance_response: 0, natural_completion: 0, first_guidance_turn: null }; }
  }; } };
  await recordSdaSessionStart(database, "c".repeat(64), "2026-10-15T10:00:00.000Z", 1);
  await measureSdaConversation({ database, apiKey: "test-key", sessionHash: "c".repeat(64), turnCount: 1,
    messages: [{ role: "user", content: "Guide me." }, { role: "assistant", content: "Rest attention on the breath and return when distracted." }],
    fetchImpl: async () => new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: JSON.stringify({ redirected_to_looking: false, formal_guidance_delivered: true, daily_life_guidance_delivered: false, post_guidance_response: false, natural_completion: false }) }] }] }), { status: 200 })
  });
  assert.match(calls.at(-1).sql, /UPDATE sda_sessions/);
  assert.ok(calls.every(({ values }) => !values.includes("Guide me.")));
  assert.ok(calls.at(-1).values.includes(1));
});

test("stores only a closed SDA measurement error code", async () => {
  let values;
  const database = { prepare() { return { bind(...bound) { values = bound; return this; }, async run() {} }; } };
  const code = await recordSdaMeasurementError(database, "d".repeat(64), new SyntaxError("private content"));
  assert.equal(code, "classifier_invalid_json");
  assert.deepEqual(values, ["classifier_invalid_json", "d".repeat(64)]);
});
