# Unified Zero Measurement Design

**Status:** Implemented behind the disabled unified endpoint; migration not applied and no production behavior changed
**Working date:** October 17, 2026
**Applies to:** The future public unified Zero guide at `/try-it/`

## Decision

Unified Zero will use a new, separate measurement record. It will not write new sessions into the historical Looking Zero or Self-Directed Attention Zero tables.

This preserves the meaning of every existing figure while allowing one future session to contain both the inward look and work with attention. The dashboard will be extended with a clearly dated **Unified Zero — Guidance and Reports** section. It will not be rebuilt as a linked visitor funnel.

## Continuity at launch

- Existing `looking_sessions`, `looking_daily_aggregates`, `sda_sessions`, and `sda_daily_aggregates` data remain unchanged.
- No historical data is copied, relabeled, combined, or backfilled into unified measurement.
- The existing Looking Zero and SDA Zero dashboard sections remain available as historical sections with their original definitions.
- A launch date is recorded in the repository and displayed with the unified dashboard section.
- Website Traffic and Roads to Zero remain independent aggregate action counts. They are not linked to unified session records.
- The browser-recorded Zero-session-start event remains an independent operational count and may differ slightly from Worker-recorded unified sessions.

When `/try-it/` begins using the unified guide, its Worker sessions enter only the new unified table. If `/self-directed-attention/` remains temporarily available as the separate SDA guide, its sessions continue to enter the existing SDA table until that route is retired or redirected. A redirect itself creates no guide session; a session begins only when a visitor sends a first message to unified Zero.

## Privacy model

Unified measurement keeps the existing privacy boundaries:

- no conversation text is stored;
- no visitor ID, account, cookie, fingerprint, profile, IP address, user agent, raw referrer, or linked journey is stored;
- a browser-generated random session value is HMAC-hashed before storage and scoped as `unified:` so it cannot collide with or be joined to the existing guide tables;
- only closed milestone values, timestamps, message counts, classifier version, and closed operational error codes are retained;
- active conversation text is sent temporarily to a dedicated storage-disabled classifier only at selected measurement points;
- individual session rows are converted after 90 days to anonymous UTC daily totals and deleted;
- team/test origins remain excluded from production measurement;
- measurement failure never interrupts the visitor's guide.

## Observable milestones

The unified classifier may record only conversational evidence. It must never classify whether the inward look succeeded, whether the method worked, or whether attention skills improved.

The proposed session-level fields are:

- `session_hash`
- `started_at`
- `last_activity_at`
- `inward_invitation_delivered`
- `post_inward_invitation_response`
- `highest_attempt_signal`: `none`, `attempt_indicated`, or `attempt_explicitly_reported`
- `attempt_at`
- `first_attempt_turn`
- `formal_guidance_delivered`
- `daily_life_guidance_delivered`
- `post_attention_guidance_response`
- `natural_completion`
- `first_attention_guidance_turn`
- `message_count`
- `classifier_version`
- `classification_status`
- `classification_error_code`

The attempt categories retain the conservative definitions used by Looking Zero. Explicit reports remain a subset of possible indications. Absence of a report remains explicitly described as not being evidence that the inward look did not occur.

Formal and daily-life fields describe guidance delivery only. They do not report exercise completion, benefit, improvement, or success.

## Dashboard section

The new section should show:

1. **Sessions started** — Worker-recorded anonymous unified sessions.
2. **Complete inward-looking invitation delivered** — actionable invitation containing the correct object and movement of attention.
3. **Response after inward-looking invitation** — a later visitor response.
4. **Possible indication of trying** — conservative indication, including explicit reports.
5. **Explicitly reported trying** — subset of possible indications.
6. **Formal attention-exercise guidance delivered** — actionable formal guidance.
7. **Daily-life attention guidance delivered** — actionable ordinary-life guidance.
8. **Response after attention guidance** — a later visitor response after either attention-guidance type.
9. **Natural completion** — clear conversational completion, not merely a brief acknowledgment.
10. **Median visitor turn of first indication** — retained session rows only when archived days are included.
11. **Median visitor turn of first attention guidance** — retained session rows only when archived days are included.

These are overlapping milestones, not stages every visitor must complete. A visitor may receive only the inward-looking guidance, may arrive already experienced, or may ask directly for a particular form of attention guidance.

### Denominators

- invitation delivery: percentage of unified sessions started;
- response after inward invitation: percentage of sessions receiving a complete inward invitation;
- possible and explicit attempt reports: percentage of sessions receiving a complete inward invitation;
- each attention-guidance type: percentage of unified sessions started;
- response after attention guidance: percentage of sessions receiving formal or daily-life attention guidance;
- natural completion: percentage of unified sessions started.

The dashboard text must identify all denominators and must not imply that independent or overlapping counts form a strict person-level funnel.

## Storage design

Add a numbered migration containing:

- `unified_sessions`, using one row per scoped session hash;
- an index on `started_at`;
- `unified_daily_aggregates`, using one row per UTC day and storing only totals required by the dashboard.

Daily aggregates should include sessions, inward invitations, post-invitation responses, possible indications, explicit reports, sessions with no recorded indication, formal guidance, daily-life guidance, any attention guidance, post-guidance responses, and natural completions. Medians are not stored in daily aggregates; the dashboard must label median coverage when archived data is present.

## Classifier and cost

Use one unified structured-output classifier rather than running the existing Looking and SDA classifiers independently on the same conversation. Its schema combines only the approved observable milestones.

Classification should remain selective:

- classify until a complete inward invitation is found;
- after that, classify visitor turns that may contain an attempt report or a request/transition relevant to attention guidance;
- update obvious response-after-delivery milestones deterministically when possible;
- stop classifying after natural completion unless an operational correction is required.

This preserves useful measurement while limiting cost and avoiding unnecessary processing.

## Public-route transition

Measurement activation belongs in the same reviewed release as the public unified guide:

1. Apply the new database migration.
2. Deploy Worker support with unified measurement disabled or test-only.
3. Verify the exact team/test origin writes only controlled test records.
4. Update `/try-it/` to the unified endpoint and update its privacy dialog.
5. Update `what-now.html` to direct visitors into the same unified guide.
6. Keep `/self-directed-attention/` temporarily available or redirect it only after a separate route decision.
7. Enable production unified measurement and record the activation date.
8. Verify dashboard totals, classifier status, retention, and team exclusion.

The implementation remains inert unless the migration is applied and the unified endpoint is explicitly enabled. Worker deployment, database migration, test activation, and public website publication each require explicit approval.

## Required implementation validation

- migration tests and archive tests;
- classifier normalization and monotonic-milestone tests;
- proof that unified sessions cannot write to historical Looking or SDA tables;
- proof that test/team origins cannot enter production totals;
- dashboard aggregation and denominator tests;
- privacy-text and legal-page review;
- desktop and mobile review of the extended dashboard;
- `pnpm test` and `pnpm run check` from `worker/zero/`.
