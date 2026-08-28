# Privacy disclosure implementation notes

**Implemented in `legal.html` on August 10, 2026, and extended for anonymous source attribution on August 28, 2026. Retain these notes for future reviews.**

The existing AI-guide dialog and the “Look At Yourself AI guide” and retention sections of `legal.html` will need an accurate update before activation.

The disclosure should state plainly that:

- Just One Look still does not save conversation text.
- Active conversation context is temporarily processed by OpenAI both to generate Zero's response and, at selected points, to derive a conservative anonymous outcome indication.
- The retained record contains an anonymous session hash, timestamps, message counts, whether a complete invitation and a later response occurred, and the highest attempt-report indication.
- It contains no name, contact information, account, IP address for analytics, device fingerprint, persistent visitor profile, or cross-session tracking identifier.
- Individual anonymous session records are aggregated and deleted after 90 days; aggregate totals may be retained longer.
- `attempt indicated` and `attempt explicitly reported` describe only evidence that the visitor tried. They do not determine success or independently verify that an internal act occurred. Absence of a report does not mean the inward look did not occur.
- Clean source paths retain only daily aggregate counts for an approved source slug and optional campaign slug. They do not retain referrers or link the arrival to later website actions, conversations, or outcomes.

Suggested principle, subject to final legal and privacy review:

> We process limited anonymous technical information and conversational indications of whether a visitor tried the instruction, to understand whether Looking Zero is functioning as intended. We do not use this information to identify visitors, and we do not save conversation text.
