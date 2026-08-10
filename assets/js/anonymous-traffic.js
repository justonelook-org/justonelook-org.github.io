(() => {
  "use strict";

  const endpoint = "https://look-at-yourself-api.look-at-yourself-worker.workers.dev/api/traffic";
  const allowedEvents = new Set(["homepage_view", "try_it_click", "zero_opened", "zero_session_started"]);
  const oncePerPageEvents = new Set(["homepage_view", "try_it_click", "zero_opened"]);
  const reportedThisPage = new Set();

  function report(event) {
    if (!allowedEvents.has(event) || (oncePerPageEvents.has(event) && reportedThisPage.has(event))) return;
    if (oncePerPageEvents.has(event)) reportedThisPage.add(event);
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
      credentials: "omit",
      referrerPolicy: "no-referrer",
      keepalive: true
    }).catch(() => {});
  }

  document.querySelectorAll("[data-anonymous-traffic-event]").forEach((element) => {
    const event = element.dataset.anonymousTrafficEvent;
    if (element.matches("a,button")) element.addEventListener("click", () => report(event));
    else report(event);
  });

  window.jolAnonymousTraffic = report;
})();
