(() => {
  "use strict";

  const endpoint = "https://look-at-yourself-api.look-at-yourself-worker.workers.dev/api/traffic";
  const parts = location.pathname.split("/").filter(Boolean);


  if (parts.length !== 2 || parts[0] !== "try-it" || parts[1] !== "x") return;

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: "zero_source", source: "x" }),
    credentials: "omit",
    referrerPolicy: "no-referrer",
    keepalive: true
  }).catch(() => {});

  location.replace("/try-it/");
})();
