export const localUnifiedPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>Unified Zero — Team Test</title>
  <link rel="stylesheet" href="/assets/css/zero-guide.css?v=20261018-1">
  <style>
    .prototype-note { margin: 0; color: var(--muted); font-size: .72rem; line-height: 1.25; }
  </style>
</head>
<body>
  <main class="guide" data-api-endpoint="https://look-at-yourself-api.look-at-yourself-worker.workers.dev/api/unified-zero" data-local-endpoint="/api/unified-zero" data-opening="Choose one of the questions below, or write in your own words—in any language." data-max-responses="12">
    <section id="guide-panel" class="guide-panel" aria-labelledby="guide-title">
      <h1 id="guide-title" class="guide-welcome-title"><span class="heading-line keep-together">Hi! I’m Zero.</span><span class="heading-line keep-together">Let’s explore what you can do with attention.</span></h1>

      <div class="zero-wrap" aria-hidden="true">
        <img class="zero" src="/assets/brand/jol-logo.jpg" alt="" width="675" height="932">
        <span class="zero-eyelid zero-eyelid--left"></span>
        <span class="zero-eyelid zero-eyelid--right"></span>
      </div>

      <div id="conversation" class="conversation" aria-live="polite" aria-atomic="false">
        <p class="quiet-opening"><span>Choose one of the questions below, or write in your own words—in any language.</span></p>
      </div>

      <div id="conversation-starters" class="conversation-starters" aria-label="Suggested ways to begin">
        <button type="button" data-starter="How do I look at myself?">How do I look at myself?</button>
        <button type="button" data-starter="I have looked. Then what?">I have looked. Then what?</button>
      </div>

      <form id="message-form" class="message-form">
        <label class="visually-hidden" for="message">Your message</label>
        <textarea id="message" name="message" rows="2" maxlength="600" required></textarea>
        <button id="send" type="submit">Send</button>
      </form>

      <p id="guide-status" class="form-message" role="status" aria-live="polite"></p>

      <div class="guide-actions">
        <button id="restart" class="text-button" type="button">Restart</button>
        <a href="/">Home</a>
        <a href="/contact.html">Contact</a>
      </div>

      <p class="small-notice">AI guide <span aria-hidden="true">·</span> Messages are sent to OpenAI <span aria-hidden="true">·</span> Don’t share personal information <span aria-hidden="true">·</span> <button id="open-privacy" class="link-button" type="button">Privacy</button></p>
      <p class="prototype-note">Team-test prototype · Anonymous guidance milestones are measured; conversation text is not stored. During local testing, nothing here is measured or saved.</p>
    </section>
  </main>

  <dialog id="age-dialog" aria-labelledby="age-title">
    <div class="dialog-content">
      <h2 id="age-title">Before continuing</h2>
      <form id="age-form">
        <label class="choice"><input id="adult-confirmation" type="checkbox" required> I am 18 or older</label>
        <button type="submit">Continue</button>
      </form>
    </div>
  </dialog>

  <dialog id="privacy-dialog" aria-labelledby="privacy-title">
    <div class="dialog-content">
      <h2 id="privacy-title">About this AI guide</h2>
      <p>This team-test guide uses OpenAI to generate its responses. What you write is sent to OpenAI for processing.</p>
      <p>The Just One Look website does not intentionally save your conversation. OpenAI may retain API data temporarily to operate and protect its service. API messages are not used to train OpenAI’s models by default.</p>
      <p>At selected points, the active conversation is processed temporarily to record anonymous guidance milestones for this unified prototype. Conversation text is not saved in this measurement, and the measurement does not decide whether the inward look occurred, succeeded, or whether attention improved.</p>
      <p>Please do not enter your name, address, contact details, medical information, or other private information.</p>
      <p>This is a private team-test prototype. It is not a person, therapist, medical service, or emergency service.</p>
      <p>For privacy questions, <a href="/contact.html">contact the Just One Look team</a>.</p>
      <form method="dialog"><button type="submit">Close</button></form>
    </div>
  </dialog>

  <script src="/assets/js/zero-guide.js?v=20260829-1" defer></script>
</body>
</html>`;
