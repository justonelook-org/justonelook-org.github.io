(() => {
  "use strict";

  const endpoint = "https://look-at-yourself-api.look-at-yourself-worker.workers.dev/api/traffic";
  const sourceLabels = Object.freeze({ x: "X", youtube: "YouTube", bluesky: "Bluesky" });
  const parts = location.pathname.split("/").filter(Boolean);

  if (parts.length !== 2 || parts[0] !== "try-it") return;

  const source = parts[1];
  if (!Object.hasOwn(sourceLabels, source)) return;

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
