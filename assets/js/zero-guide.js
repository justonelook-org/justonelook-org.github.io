(() => {
  "use strict";

  const main = document.querySelector(".guide");
  const guidePanel = document.querySelector("#guide-panel");
  const messageForm = document.querySelector("#message-form");
  const messageInput = document.querySelector("#message");
  const sendButton = document.querySelector("#send");
  const conversation = document.querySelector("#conversation");
  const conversationStarters = document.querySelector("#conversation-starters");
  const status = document.querySelector("#guide-status");
  const restartButton = document.querySelector("#restart");
  const privacyButton = document.querySelector("#open-privacy");
  const privacyDialog = document.querySelector("#privacy-dialog");
  const ageDialog = document.querySelector("#age-dialog");
  const ageForm = document.querySelector("#age-form");
  const adultConfirmation = document.querySelector("#adult-confirmation");

  const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const apiEndpoint = isLocal ? `${window.location.origin}${main.dataset.localEndpoint}` : main.dataset.apiEndpoint;
  const opening = main.dataset.opening;
  const welcome = main.dataset.welcome || "";
  const maxResponses = Number.parseInt(main.dataset.maxResponses || "5", 10);
  const messages = [];
  let sessionId = crypto.randomUUID();
  let assistantCount = 0;
  let sessionComplete = false;
  let adultConfirmed = false;
  let trafficStartReported = false;


  ageForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!adultConfirmation.checked) return;
    adultConfirmed = true;
    ageDialog.close();
    messageForm.requestSubmit();
  });

  conversationStarters?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-starter]");
    if (!button || sendButton.disabled) return;
    messageInput.value = button.dataset.starter;
    messageForm.requestSubmit();
  });

  messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = messageInput.value.trim();
    if (!message || sessionComplete) return;
    if (!adultConfirmed) {
      ageDialog.showModal();
      adultConfirmation.focus();
      return;
    }
    if (conversationStarters) conversationStarters.hidden = true;
    if (!trafficStartReported) {
      trafficStartReported = true;
      window.jolAnonymousTraffic?.("zero_session_started");
    }
    appendMessage("user", message);
    messageInput.value = "";
    guidePanel.dataset.state = "responding";
    setBusy(true);

    try {
      if (apiEndpoint.includes("YOUR-SUBDOMAIN")) throw new Error("The guide has not yet been connected to the Zero service.");
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, turnCount: assistantCount + 1, messages })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 429) throw new Error("Please leave a little space before trying again.");
        throw new Error(body.error || "The guide is temporarily unavailable. Please try again shortly.");
      }
      appendMessage("assistant", body.message);
      assistantCount += 1;
      guidePanel.dataset.state = "quiet";
      if (assistantCount >= maxResponses) {
        sessionComplete = true;
        status.textContent = "That is enough for now. Let the instruction rest. You can return later if needed.";
      } else {
        status.textContent = "";
      }
    } catch (error) {
      guidePanel.dataset.state = "quiet";
      status.textContent = error.message || "The guide is temporarily unavailable. Please try again shortly.";
    } finally {
      setBusy(false);
    }
  });

  restartButton.addEventListener("click", restartGuide);

  function restartGuide() {
    messages.length = 0;
    sessionId = crypto.randomUUID();
    assistantCount = 0;
    sessionComplete = false;
    trafficStartReported = false;
    conversation.replaceChildren(createQuietOpening());
    if (conversationStarters) conversationStarters.hidden = false;
    status.textContent = "";
    guidePanel.dataset.state = "quiet";
    messageInput.focus();
  }

  privacyButton.addEventListener("click", () => privacyDialog.showModal());
  messageInput.addEventListener("input", () => {
    if (!sendButton.disabled) guidePanel.dataset.state = messageInput.value.trim() ? "listening" : "quiet";
  });
  messageInput.addEventListener("blur", () => {
    if (!sendButton.disabled) guidePanel.dataset.state = "quiet";
  });

  function appendMessage(role, text) {
    const cleanText = String(text || "").trim();
    if (!cleanText) return;
    messages.push({ role, content: cleanText });
    if (messages.length > 24) messages.splice(0, messages.length - 24);
    if (role === "assistant") {
      conversation.replaceChildren(createGuideResponse(cleanText));
      conversation.classList.toggle("conversation--completion", cleanText.includes("[Just One Look website]("));
    }
  }

  function createGuideResponse(text) {
    const response = document.createElement("div");
    response.className = "from-guide";
    for (const block of text.split(/\n{2,}/).filter(Boolean)) {
      const paragraph = document.createElement("p");
      appendSafeMarkdown(paragraph, block);
      response.append(paragraph);
    }
    return response;
  }

  function appendSafeMarkdown(parent, text) {
    const approvedLinks = new Map([
      ["[Just One Look website](https://justonelook.org/)", { href: "/", label: "Just One Look website" }],
      ["[Look At Yourself guide](https://justonelook.org/try-it/)", { href: "/try-it/", label: "Look At Yourself guide" }]
    ]);
    const tokenPattern = /(\*\*|\[Just One Look website\]\(https:\/\/justonelook\.org\/\)|\[Look At Yourself guide\]\(https:\/\/justonelook\.org\/try-it\/\)|\n)/g;
    let position = 0;
    let activeParent = parent;
    let strong = null;
    for (const match of text.matchAll(tokenPattern)) {
      activeParent.append(document.createTextNode(text.slice(position, match.index)));
      const token = match[0];
      if (token === "\n") {
        activeParent.append(document.createElement("br"));
      } else if (token === "**") {
        if (strong) {
          strong = null;
          activeParent = parent;
        } else {
          strong = document.createElement("strong");
          parent.append(strong);
          activeParent = strong;
        }
      } else if (approvedLinks.has(token)) {
        const approvedLink = approvedLinks.get(token);
        const link = document.createElement("a");
        link.href = approvedLink.href;
        link.textContent = approvedLink.label;
        activeParent.append(link);
      }
      position = match.index + token.length;
    }
    activeParent.append(document.createTextNode(text.slice(position)));
  }
  function createQuietOpening() {
    const paragraph = document.createElement("p");
    paragraph.className = "quiet-opening";
    for (const text of [welcome, opening].filter(Boolean)) {
      const line = document.createElement("span");
      line.textContent = text;
      paragraph.append(line);
    }
    return paragraph;
  }
  function setBusy(busy) {
    sendButton.disabled = busy || sessionComplete;
    messageInput.disabled = busy || sessionComplete;
    if (busy) status.textContent = "Zero is responding…";
    if (!busy && !sessionComplete) messageInput.focus();
  }

})();
