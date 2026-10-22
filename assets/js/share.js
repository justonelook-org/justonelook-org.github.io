'use strict';

document.querySelectorAll('[data-copy]').forEach((button) => {
  const link = document.getElementById(button.dataset.copy);
  const status = button.parentElement.querySelector('[role="status"]');
  button.hidden = false;

  button.addEventListener('click', async () => {
    status.textContent = '';
    try {
      await navigator.clipboard.writeText(link.href);
      status.textContent = 'Link copied.';
    } catch {
      // Keep the visible URL selected for manual copying if clipboard access fails.
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(link);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Select and copy the link above, or press Ctrl+C (Command+C on Mac).';
    }
  });
});
