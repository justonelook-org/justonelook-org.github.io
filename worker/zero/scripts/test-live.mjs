import { readFile } from "node:fs/promises";
import worker from "../src/index.js";

const settingsText = await readFile(new URL("../.dev.vars", import.meta.url), "utf8");
const settings = Object.fromEntries(settingsText
  .split(/\r?\n/)
  .filter((line) => line && !line.trimStart().startsWith("#"))
  .map((line) => {
    const separator = line.indexOf("=");
    return [line.slice(0, separator), line.slice(separator + 1)];
  }));

const env = {
  ALLOWED_ORIGINS: "http://localhost:8000",
  OPENAI_API_KEY: settings.OPENAI_API_KEY,
  OPENAI_SDA_API_KEY: settings.OPENAI_SDA_API_KEY,
  LOOK_MODEL: readFlag("model"),
  LOOK_REASONING_EFFORT: readFlag("effort"),
  SESSION_RATE_LIMITER: { limit: async () => ({ success: true }) },
  PILOT_RATE_LIMITER: { limit: async () => ({ success: true }) }
};

const guide = process.argv[2] === "sda" ? "self-directed-attention" : "look-at-yourself";
const customPrompt = process.argv.slice(3).filter((value) => value !== "--show" && !value.startsWith("--model=") && !value.startsWith("--effort=")).join(" ").trim();
const prompt = customPrompt || (guide === "self-directed-attention"
  ? "Yes, I have performed the inward look. I am new to the exercise."
  : "Hello");

const request = new Request(`http://local-zero.test/api/${guide}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Origin": "http://localhost:8000"
  },
  body: JSON.stringify({
    sessionId: crypto.randomUUID(),
    turnCount: 1,
    messages: [{ role: "user", content: prompt }]
  })
});

const response = await worker.fetch(request, env);
const body = await response.json();

console.log(JSON.stringify({
  status: response.status,
  guide,
  model: env.LOOK_MODEL || (guide === "look-at-yourself" ? "gpt-5.6-sol" : "gpt-5.6-terra"),
  reasoningEffort: env.LOOK_REASONING_EFFORT || (guide === "look-at-yourself" ? "medium" : "none"),
  receivedReply: typeof body.message === "string" && body.message.length > 0,
  replyLength: typeof body.message === "string" ? body.message.length : 0,
  error: body.error || null,
  ...(process.argv.includes("--show") ? { reply: body.message || null } : {})
}, null, 2));

if (!response.ok) process.exitCode = 1;

function readFlag(name) {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) || undefined;
}
