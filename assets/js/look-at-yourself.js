(() => {
  "use strict";

  const main = document.querySelector(".guide");
  const entry = document.querySelector("#entry");
  const entryForm = document.querySelector("#access-form");
  const entryError = document.querySelector("#entry-error");
  const accessCodeInput = document.querySelector("#access-code");
  const guardianNote = document.querySelector("#guardian-note");
  const guardianApproval = document.querySelector("#guardian-approval");
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
  const publicAccess = main.dataset.publicAccess === "true";
  const apiEndpoint = isLocal ? `${window.location.origin}${main.dataset.localEndpoint}` : main.dataset.apiEndpoint;
  const opening = main.dataset.opening;
  const welcome = main.dataset.welcome || "";
  const maxResponses = Number.parseInt(main.dataset.maxResponses || "5", 10);
  const messages = [];
  let sessionId = crypto.randomUUID();
  let accessCode = "";
  let assistantCount = 0;
  let sessionComplete = false;
  let adultConfirmed = false;

  entryForm?.addEventListener("change", () => {
    const permission = new FormData(entryForm).get("permission");
    guardianNote.hidden = permission !== "guardian";
    if (permission !== "guardian") guardianApproval.checked = false;
  });

  entryForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const permission = new FormData(entryForm).get("permission");
    if (permission === "guardian" && !guardianApproval.checked) {
      entryError.textContent = "A parent or guardian must approve before continuing.";
      guardianApproval.focus();
      return;
    }
    accessCode = accessCodeInput.value.trim();
    if (!accessCode) {
      entryError.textContent = "Enter the pilot access code.";
      accessCodeInput.focus();
      return;
    }
    entryError.textContent = "";
    entry.hidden = true;
    guidePanel.hidden = false;
    messageInput.focus();
  });

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
    if (publicAccess && !adultConfirmed) {
      ageDialog.showModal();
      adultConfirmation.focus();
      return;
    }
    if (conversationStarters) conversationStarters.hidden = true;
    appendMessage("user", message);
    messageInput.value = "";
    guidePanel.dataset.state = "responding";
    setBusy(true);

    try {
      if (apiEndpoint.includes("YOUR-SUBDOMAIN")) throw new Error("The pilot has not yet been connected to its private service.");
      const headers = { "Content-Type": "application/json" };
      if (!publicAccess) headers.Authorization = `Bearer ${accessCode}`;
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ sessionId, turnCount: assistantCount + 1, messages })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) throw new Error("The pilot access code was not accepted. Select Restart and try again.");
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

  restartButton.addEventListener("click", () => {
    messages.length = 0;
    sessionId = crypto.randomUUID();
    assistantCount = 0;
    sessionComplete = false;
    accessCode = "";
    if (accessCodeInput) accessCodeInput.value = "";
    if (guardianApproval) guardianApproval.checked = false;
    if (guardianNote) guardianNote.hidden = true;
    entryForm?.reset();
    conversation.replaceChildren(createQuietOpening());
    if (conversationStarters) conversationStarters.hidden = false;
    status.textContent = "";
    guidePanel.hidden = !publicAccess;
    guidePanel.dataset.state = "quiet";
    if (entry) entry.hidden = publicAccess;
    if (publicAccess) messageInput.focus();
    else accessCodeInput.focus();
  });

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
    if (role === "assistant") conversation.replaceChildren(createGuideResponse(cleanText));
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
    const tokenPattern = /(\[Continue to the Just One Look website\]\(https:\/\/(?:www\.)?justonelook\.org\/?\)|\*\*[^*\n]+\*\*|\n)/gi;
    let position = 0;
    for (const match of text.matchAll(tokenPattern)) {
      parent.append(document.createTextNode(text.slice(position, match.index)));
      const token = match[0];
      if (token === "\n") {
        parent.append(document.createElement("br"));
      } else if (token.startsWith("**")) {
        const strong = document.createElement("strong");
        strong.textContent = token.slice(2, -2);
        parent.append(strong);
      } else {
        const link = document.createElement("a");
        link.href = "/";
        link.textContent = "Continue to the Just One Look website";
        parent.append(link);
      }
      position = match.index + token.length;
    }
    parent.append(document.createTextNode(text.slice(position)));
  }
  function createParagraph(className, text) {
    const paragraph = document.createElement("p");
    paragraph.className = className;
    paragraph.textContent = text;
    return paragraph;
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
