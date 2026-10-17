import { readFile, writeFile } from "node:fs/promises";
import worker from "../src/index.js";

const settings = await readSettings(new URL("../.dev.vars", import.meta.url));
const scenarios = JSON.parse(await readFile(new URL("../evals/unified-zero.json", import.meta.url), "utf8"));
const apiKey = process.env.OPENAI_UNIFIED_API_KEY || process.env.OPENAI_API_KEY || settings.OPENAI_UNIFIED_API_KEY || settings.OPENAI_API_KEY;
if (!apiKey) throw new Error("A local OPENAI_UNIFIED_API_KEY or OPENAI_API_KEY is required in the environment or .dev.vars.");

const env = {
  ALLOWED_ORIGINS: "http://localhost:8000",
  OPENAI_UNIFIED_API_KEY: apiKey,
  UNIFIED_ZERO_ENABLED: "true",
  UNIFIED_MODEL: readFlag("model"),
  UNIFIED_REASONING_EFFORT: readFlag("effort"),
  OUTCOME_MEASUREMENT_ENABLED: "false",
  SESSION_RATE_LIMITER: { limit: async () => ({ success: true }) },
  PILOT_RATE_LIMITER: { limit: async () => ({ success: true }) }
};

const selectedId = readFlag("scenario");
const selected = selectedId ? scenarios.filter(({ id }) => id === selectedId) : scenarios;
if (!selected.length) throw new Error(`Unknown scenario: ${selectedId}`);

const results = [];
for (const scenario of selected) {
  const response = await worker.fetch(new Request("http://local-zero.test/api/unified-zero", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": "http://localhost:8000" },
    body: JSON.stringify({
      sessionId: crypto.randomUUID(),
      turnCount: scenario.messages.filter(({ role }) => role === "assistant").length + 1,
      messages: scenario.messages
    })
  }), env);
  const body = await response.json();
  results.push({
    id: scenario.id,
    expected_focus: scenario.expected_focus,
    status: response.status,
    should: scenario.should,
    should_not: scenario.should_not,
    reply: body.message || null,
    error: body.error || null
  });
  process.stderr.write(`${scenario.id}: ${response.status}\n`);
}

const report = JSON.stringify({
  generated_at: new Date().toISOString(),
  model: env.UNIFIED_MODEL || "gpt-5.6-sol",
  reasoning_effort: env.UNIFIED_REASONING_EFFORT || "medium",
  results
}, null, 2) + "\n";

const outputPath = readFlag("out");
if (outputPath) await writeFile(outputPath, report, "utf8");
else process.stdout.write(report);

async function readSettings(url) {
  let text;
  try {
    text = await readFile(url, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }
  return Object.fromEntries(text
    .split(/\r?\n/)
    .filter((line) => line && !line.trimStart().startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    }));
}

function readFlag(name) {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) || undefined;
}
