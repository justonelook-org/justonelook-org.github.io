# Privacy implementation notes

The relevant disclosures were implemented in `legal.html` on August 10, 2026, and extended for anonymous source attribution on August 28, 2026. Retain these notes as a review checklist when measurement behavior changes.

The current disclosure states that:

- Just One Look does not save conversation text in the measurement database.
- Active Looking Zero conversation context is temporarily processed by OpenAI both to generate Zero's response and, at selected points, to derive a conservative anonymous outcome indication.
- The retained record contains an anonymous session hash, timestamps, message counts, whether a complete invitation and a later response occurred, and the highest attempt-report indication.
- It contains no name, contact information, account, retained IP address for analytics, device fingerprint, persistent visitor profile, or cross-session tracking identifier.
- Individual anonymous outcome records are aggregated and deleted after 90 days; aggregate totals may be retained longer.
- `attempt_indicated` and `attempt_explicitly_reported` describe only evidence that the visitor tried. They do not determine success or independently verify that an internal act occurred. Absence of a report does not mean the inward look did not occur.
- Clean source paths retain only daily aggregate counts for an approved source slug and optional campaign slug. They do not retain referrers or link the source opening to later website actions, conversations, or outcomes.
- Self-Directed Attention measurement, when activated, uses a separate keyed session hash and retains only delivery milestones, message counts, and classifier status. It does not classify whether the exercise worked or whether attention skills improved.
- Unified Zero measurement, when separately activated, uses a `unified:`-scoped keyed session hash and a separate table. It combines only conservative reports of trying with guidance-delivery milestones, does not alter the historical Looking or SDA records, and does not classify success or improvement.

Recheck both the AI-guide dialog and the “Look At Yourself AI guide” and retention sections of `legal.html` before activating a new measurement category or materially changing retention, authentication, or data flow.
