(() => {
  "use strict";

  const endpoint = "https://look-at-yourself-api.look-at-yourself-worker.workers.dev/api/traffic";
  const sourceLabels = Object.freeze({ x: "X", youtube: "YouTube", bluesky: "Bluesky" });
  const campaignPattern = /^[a-z0-9](?:[a-z0-9-]{0,62})$/;
  const parts = location.pathname.split("/").filter(Boolean);

  if (parts[0] !== "try-it") return;

  const source = parts[1] || "";
  const campaign = parts[2] || "";
  const isValidSourcePath =
    Object.hasOwn(sourceLabels, source) &&
    parts.length <= 3 &&
    (!campaign || campaignPattern.test(campaign));

  if (!isValidSourcePath) return;

  const body = { event: "zero_source", source };
  if (campaign) body.campaign = campaign;

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "omit",
    referrerPolicy: "no-referrer",
    keepalive: true
  }).catch(() => {});

  location.replace("/try-it/");
})();
