(() => {
  "use strict";

  const endpoint = "https://look-at-yourself-api.look-at-yourself-worker.workers.dev/api/traffic";
  const parts = location.pathname.split("/").filter(Boolean);
  const sources = Object.freeze({ x: "x", bluesky: "bluesky" });
  const source = parts.length === 2 && parts[0] === "try-it" ? sources[parts[1]] : undefined;

  if (!source) return;

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: "zero_source", source }),
    credentials: "omit",
    referrerPolicy: "no-referrer",
    keepalive: true
  }).catch(() => {});

  location.replace("/try-it/");
})();
