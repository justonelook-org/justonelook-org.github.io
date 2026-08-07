import assert from "node:assert/strict";
import test from "node:test";
import worker from "../src/index.js";

const allowedOrigin = "http://localhost:8000";
const baseEnv = {
  ALLOWED_ORIGINS: allowedOrigin,
  OPENAI_API_KEY: "test-openai-key",
  OPENAI_SDA_API_KEY: "test-sda-key",
  PILOT_ACCESS_CODE: "test-pilot-code",
  SESSION_RATE_LIMITER: { limit: async () => ({ success: true }) },
  PILOT_RATE_LIMITER: { limit: async () => ({ success: true }) }
};

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
    assert.match(openAIBody.instructions, /Good work\./);
    assert.doesNotMatch(openAIBody.instructions, /\*\*Good work\.\*\*/);
    assert.match(openAIBody.instructions, /Nothing special had to happen/);
    assert.match(openAIBody.instructions, /returning to the act naturally/);
    assert.match(openAIBody.instructions, /\[Just One Look website\]\(https:\/\/justonelook\.org\/\)/);
    assert.match(openAIBody.instructions, /link to the Just One Look homepage/);
    assert.match(openAIBody.instructions, /Do not send the visitor directly to another AI guide or a specific resource page/);
    assert.match(openAIBody.instructions, /Do not turn the inward look into a numbered list/);
    assert.match(openAIBody.instructions, /Do not tell them to suppress, remove, ignore/);
    assert.match(openAIBody.instructions, /turn your attention toward/);
    assert.match(openAIBody.instructions, /not the stress—just that feeling/);
    assert.match(openAIBody.instructions, /not with your eyes, but with the focus of your attention/);
    assert.match(openAIBody.instructions, /Look at the simple, immediate feeling of being/);
    assert.match(openAIBody.instructions, /Turn your attention toward that feeling now/);
    assert.match(openAIBody.instructions, /Do not answer them with the same explanation/);
    assert.match(openAIBody.instructions, /Zero has four defined opening choices/);
    assert.match(openAIBody.instructions, /four suggested opening questions have defined first responses/i);
    assert.match(openAIBody.instructions, /For “Can you guide me\?” reply exactly/);
    assert.match(openAIBody.instructions, /For “What should I look at\?” reply exactly/);
    assert.match(openAIBody.instructions, /For “What do you mean by ‘look’\?” reply exactly/);
    assert.match(openAIBody.instructions, /For “This sounds strange—explain it” reply exactly/);
    assert.match(openAIBody.instructions, /exact-response rule applies only to the opening choice/);
    assert.match(openAIBody.instructions, /Markdown bold sparingly/);
    assert.match(openAIBody.instructions, /not response templates/i);
    assert.match(openAIBody.instructions, /do not repeat a complete sentence or full sequence/i);
    assert.match(openAIBody.instructions, /do not automatically repeat the entire thoughts\/emotions\/body\/story contrast/i);
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
  } finally {
    globalThis.fetch = originalFetch;
  }
});
