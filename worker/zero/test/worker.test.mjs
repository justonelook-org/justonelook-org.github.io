import assert from "node:assert/strict";
import test from "node:test";
import worker, { outcomeMeasurementAllowed } from "../src/index.js";

const allowedOrigin = "http://localhost:8000";
const baseEnv = {
  ALLOWED_ORIGINS: allowedOrigin,
  OPENAI_API_KEY: "test-openai-key",
  OPENAI_SDA_API_KEY: "test-sda-key",
  PILOT_ACCESS_CODE: "test-pilot-code",
  OUTCOME_MEASUREMENT_ENABLED: "false",
  SESSION_RATE_LIMITER: { limit: async () => ({ success: true }) },
  PILOT_RATE_LIMITER: { limit: async () => ({ success: true }) }
};

test("keeps outcome measurement disabled unless explicitly enabled", async () => {
  const originalFetch = globalThis.fetch;
  let databaseTouched = false;
  globalThis.fetch = async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: "Notice that you are here." }] }]
  }), { status: 200, headers: { "Content-Type": "application/json" } });
  const env = {
    ...baseEnv,
    OUTCOME_DB: { prepare() { databaseTouched = true; throw new Error("Measurement should be disabled."); } },
    OUTCOME_SESSION_SECRET: "test-session-secret",
    OPENAI_OUTCOME_API_KEY: "test-outcome-key"
  };
  try {
    const response = await worker.fetch(request(validBody()), env);
    assert.equal(response.status, 200);
    assert.equal(databaseTouched, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("limits test measurement to the exact configured test origin", () => {
  assert.equal(outcomeMeasurementAllowed("false", "https://website-test-zero.pages.dev", "https://website-test-zero.pages.dev"), false);
  assert.equal(outcomeMeasurementAllowed("test", "https://justonelook.org", "https://website-test-zero.pages.dev"), false);
  assert.equal(outcomeMeasurementAllowed("test", "https://website-test-zero.pages.dev", "https://website-test-zero.pages.dev"), true);
  assert.equal(outcomeMeasurementAllowed("test", "https://website-test-zero.pages.dev.evil.example", "https://website-test-zero.pages.dev"), false);
  assert.equal(outcomeMeasurementAllowed("true", "https://justonelook.org", "https://website-test-zero.pages.dev"), true);
  assert.equal(outcomeMeasurementAllowed("true", "https://website-test-zero.pages.dev", "https://website-test-zero.pages.dev"), false);
  assert.equal(outcomeMeasurementAllowed("true", "https://website-test-zero.pages.dev.evil.example", "https://website-test-zero.pages.dev"), true);
});

test("excludes the team test origin from production measurement", async () => {
  const originalFetch = globalThis.fetch;
  let databaseTouched = false;
  globalThis.fetch = async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: "Notice that you are here." }] }]
  }), { status: 200, headers: { "Content-Type": "application/json" } });
  const teamOrigin = "https://website-test-zero.pages.dev";
  const env = {
    ...baseEnv,
    ALLOWED_ORIGINS: `${allowedOrigin},${teamOrigin}`,
    OUTCOME_MEASUREMENT_ENABLED: "true",
    OUTCOME_TEST_ORIGIN: teamOrigin,
    OUTCOME_DB: { prepare() { databaseTouched = true; throw new Error("Team testing must not be measured."); } },
    OUTCOME_SESSION_SECRET: "test-session-secret",
    OPENAI_OUTCOME_API_KEY: "test-outcome-key"
  };
  try {
    const response = await worker.fetch(request(validBody(), { origin: teamOrigin }), env);
    assert.equal(response.status, 200);
    assert.equal(databaseTouched, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("does not expose the test-only measurement diagnostic to production origins", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: "Notice that you are here." }] }]
  }), { status: 200, headers: { "Content-Type": "application/json" } });
  try {
    const response = await worker.fetch(request(validBody(), { origin: allowedOrigin }), {
      ...baseEnv,
      OUTCOME_MEASUREMENT_ENABLED: "test",
      OUTCOME_TEST_ORIGIN: "https://website-test-zero.pages.dev"
    });
    assert.equal(response.headers.get("X-Outcome-Measurement"), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

function request(body, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "Origin": options.origin || allowedOrigin
  };
  if (!options.omitAuthorization) headers.Authorization = `Bearer ${options.accessCode || "test-pilot-code"}`;
  return new Request(`https://pilot-api.example${options.path || "/api/look-at-yourself"}`, {
    method: options.method || "POST",
    headers,
    body: options.method === "OPTIONS" ? undefined : JSON.stringify(body)
  });
}

function validBody() {
  return {
    sessionId: "12345678-1234-1234-1234-123456789abc",
    turnCount: 1,
    messages: [{ role: "user", content: "Hello" }]
  };
}

test("answers an allowed preflight without contacting OpenAI", async () => {
  const response = await worker.fetch(request(undefined, { method: "OPTIONS" }), baseEnv);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), allowedOrigin);
});

test("rejects an unapproved website origin", async () => {
  const response = await worker.fetch(request(validBody(), { origin: "https://example.com" }), baseEnv);
  assert.equal(response.status, 403);
});

test("allows the public SDA guide without exposing an invitation code", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: "Have you already performed the inward look?" }] }]
  }), { status: 200, headers: { "Content-Type": "application/json" } });

  try {
    const response = await worker.fetch(request(validBody(), { path: "/api/self-directed-attention", omitAuthorization: true }), baseEnv);
    assert.equal(response.status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("allows the public Looking guide without exposing an invitation code", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: "Look directly at that simple feeling of being you." }] }]
  }), { status: 200, headers: { "Content-Type": "application/json" } });

  try {
    const response = await worker.fetch(request(validBody(), { omitAuthorization: true }), baseEnv);
    assert.equal(response.status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects excessive message length before contacting OpenAI", async () => {
  const body = validBody();
  body.messages[0].content = "x".repeat(601);
  const response = await worker.fetch(request(body), baseEnv);
  assert.equal(response.status, 400);
});

test("gives the Looking guide room for twelve responses", async () => {
  const body = validBody();
  body.turnCount = 12;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: "Look directly at that simple feeling of being you." }] }]
  }), { status: 200, headers: { "Content-Type": "application/json" } });

  try {
    const response = await worker.fetch(request(body), baseEnv);
    assert.equal(response.status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ends the Looking guide after twelve responses", async () => {
  const body = validBody();
  body.turnCount = 13;
  const response = await worker.fetch(request(body), baseEnv);
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /session has ended/i);
});

test("gives the SDA guide room for twelve responses", async () => {
  const body = validBody();
  body.turnCount = 12;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    output: [{ content: [{ type: "output_text", text: "Return attention to the breath and restart at 1." }] }]
  }), { status: 200, headers: { "Content-Type": "application/json" } });

  try {
    const response = await worker.fetch(request(body, { path: "/api/self-directed-attention", omitAuthorization: true }), baseEnv);
    assert.equal(response.status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ends the SDA guide after twelve responses", async () => {
  const body = validBody();
  body.turnCount = 13;
  const response = await worker.fetch(request(body, { path: "/api/self-directed-attention", omitAuthorization: true }), baseEnv);
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /session has ended/i);
});

test("returns a calm rate-limit response", async () => {
  const env = {
    ...baseEnv,
    SESSION_RATE_LIMITER: { limit: async () => ({ success: false }) }
  };
  const response = await worker.fetch(request(validBody()), env);
  assert.equal(response.status, 429);
  assert.match((await response.json()).error, /leave a little space/i);
});

test("sends temporary context with storage disabled", async () => {
  const originalFetch = globalThis.fetch;
  let openAIBody;
  globalThis.fetch = async (_url, options) => {
    openAIBody = JSON.parse(options.body);
    return new Response(JSON.stringify({
      output: [{ content: [{ type: "output_text", text: "Notice that you are here." }] }]
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  try {
    const response = await worker.fetch(request(validBody()), baseEnv);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "Notice that you are here." });
    assert.equal(openAIBody.store, false);
    assert.equal(openAIBody.model, "gpt-5.6-sol");
    assert.equal(openAIBody.reasoning.effort, "medium");
    assert.equal(openAIBody.input.length, 1);
    assert.match(openAIBody.instructions, /PILOT-SPECIFIC BOUNDARIES/);
    assert.match(openAIBody.instructions, /teaches Step One only/);
    assert.match(openAIBody.instructions, /bring the Looking session to a natural close/i);
    assert.match(openAIBody.instructions, /surrounding message should fit the conversation rather than repeat fixed completion wording/i);
    assert.match(openAIBody.instructions, /respond naturally to the visitor's words rather than using fixed completion text/i);
    assert.doesNotMatch(openAIBody.instructions, /provide this exact response/i);
    assert.match(openAIBody.instructions, /\[Just One Look website\]\(https:\/\/justonelook\.org\/\)/);
    assert.match(openAIBody.instructions, /link to the Just One Look homepage/);
    assert.match(openAIBody.instructions, /Do not send the visitor directly to another AI guide or a specific resource page/);
    assert.match(openAIBody.instructions, /Do not turn the inward look into a numbered list/);
    assert.match(openAIBody.instructions, /do not need to be suppressed, removed, ignored, or fought/i);
    assert.match(openAIBody.instructions, /turn your attention toward/);
    assert.match(openAIBody.instructions, /ordinary visitor messages/i);
    assert.match(openAIBody.instructions, /do not use fixed, exact, or templated starter replies/i);
    assert.match(openAIBody.instructions, /What should I look at.*asks about the immediate feeling of being “me,”/i);
    assert.match(openAIBody.instructions, /What do you mean by look.*asks about directing attention rather than looking with the eyes/i);
    assert.match(openAIBody.instructions, /Answer the visitor's actual question before returning naturally/i);
    assert.match(openAIBody.instructions, /Nothing needs to be suppressed or removed/i);
    assert.match(openAIBody.instructions, /nothing special has to happen/i);
    assert.match(openAIBody.instructions, /does not need certainty that they succeeded/i);
    assert.match(openAIBody.instructions, /Did you try looking at yourself just now\?/);
    assert.match(openAIBody.instructions, /By looking, I mean turning your attention toward the simple feeling of being you—not thinking about yourself\./);
    assert.match(openAIBody.instructions, /not an automatic questionnaire or confirmation flow/i);
    assert.match(openAIBody.instructions, /Do not routinely ask whether the inward look worked/i);
    assert.match(openAIBody.instructions, /up to about 120 words/i);
    assert.doesNotMatch(openAIBody.instructions, /reply exactly/i);
    assert.doesNotMatch(openAIBody.instructions, /defined first responses/i);
    assert.doesNotMatch(openAIBody.instructions, /exact-response rule/i);
    assert.match(openAIBody.instructions, /Markdown bold sparingly/);
    assert.match(openAIBody.instructions, /not response templates/i);
    assert.match(openAIBody.instructions, /do not repeat a complete sentence or full sequence/i);
    assert.match(openAIBody.instructions, /Do not automatically repeat the complete thoughts\/emotions\/body\/story contrast/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("keeps the SDA guide on its separate route, key, and instructions", async () => {
  const originalFetch = globalThis.fetch;
  let authorization;
  let openAIBody;
  globalThis.fetch = async (_url, options) => {
    authorization = options.headers.Authorization;
    openAIBody = JSON.parse(options.body);
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: "Have you already performed the inward look?" }] }] }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  try {
    const response = await worker.fetch(request(validBody(), { path: "/api/self-directed-attention" }), baseEnv);
    assert.equal(response.status, 200);
    assert.equal(authorization, "Bearer test-sda-key");
    assert.equal(openAIBody.model, "gpt-5.6-sol");
    assert.equal(openAIBody.reasoning.effort, "medium");
    assert.match(openAIBody.instructions, /Self-Directed Attention Exercise/);
    assert.match(openAIBody.instructions, /Step Two only/i);
    assert.match(openAIBody.instructions, /Never blend the two guides/i);
    assert.match(openAIBody.instructions, /ordinary visitor messages/i);
    assert.match(openAIBody.instructions, /do not use fixed or exact starter replies/i);
    assert.match(openAIBody.instructions, /breath should be allowed to occur naturally/i);
    assert.match(openAIBody.instructions, /repeated distraction as part of the exercise/i);
    assert.match(openAIBody.instructions, /bring the conversation to a natural close/i);
    assert.match(openAIBody.instructions, /Do not close while the user still has a genuine question/i);
    assert.match(openAIBody.instructions, /close naturally in response to their words rather than using fixed completion text/i);
    assert.match(openAIBody.instructions, /Always call it "the formal exercise," not "SDA/i);
    assert.match(openAIBody.instructions, /does not mean continuously controlling, monitoring, or supervising attention/i);
    assert.match(openAIBody.instructions, /Do not turn self-directed attention in daily life into another formal technique/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("lets returning SDA visitors skip repeating the Step One confirmation", async () => {
  const originalFetch = globalThis.fetch;
  let openAIBody;
  globalThis.fetch = async (_url, options) => {
    openAIBody = JSON.parse(options.body);
    return new Response(JSON.stringify({ output: [{ content: [{ type: "output_text", text: "Let’s continue with your question." }] }] }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  try {
    const body = validBody();
    body.stepOneConfirmed = true;
    const response = await worker.fetch(request(body, { path: "/api/self-directed-attention", omitAuthorization: true }), baseEnv);
    assert.equal(response.status, 200);
    assert.match(openAIBody.instructions, /previously confirmed on this device/i);
    assert.match(openAIBody.instructions, /Do not ask them to confirm Step One again/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
