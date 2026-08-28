(() => {
  "use strict";

  const endpoint = "https://look-at-yourself-api.look-at-yourself-worker.workers.dev/api/traffic";
  const sourceLabels = Object.freeze({ x: "X", youtube: "YouTube", bluesky: "Bluesky" });
  const campaignPattern = /^[a-z0-9](?:[a-z0-9-]{0,62})$/;
  const parts = location.pathname.split("/").filter(Boolean);
  const source = parts[0] || "";
  const campaign = parts[1] || "";

  if (Object.hasOwn(sourceLabels, source) && parts.length <= 2 && (!campaign || campaignPattern.test(campaign))) {
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
  }

  location.replace("/try-it/");
})();
