'use strict';

document.querySelectorAll('[data-copy]').forEach((button) => {
  const link = document.getElementById(button.dataset.copy);
  const status = button.closest('[data-copy-group]').querySelector('[role="status"]');
  button.hidden = false;

  button.addEventListener('click', async () => {
    status.textContent = '';
    try {
      await navigator.clipboard.writeText(link.href);
      status.textContent = 'Link copied.';
    } catch {
      // Keep the visible URL selected for manual copying if clipboard access fails.
      // Reveal the scheme so keyboard copying also preserves the complete HTTPS URL.
      link.textContent = link.href;
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(link);
      selection.removeAllRanges();
      selection.addRange(range);
      link.focus({ preventScroll: true });
      link.scrollIntoView({ block: 'nearest' });
      status.textContent = 'Link selected. Copy it with Ctrl+C (Command+C on Mac), or touch and hold the link to copy it.';
    }
  });
});
