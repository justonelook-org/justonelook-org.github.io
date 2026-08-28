# Just One Look measurement dashboard guide

This guide is for the owner of the unified private measurement dashboard. The page presents website traffic and Looking Zero outcomes as two clearly separated sections without combining their data or interpretations.

## Open the dashboard

Dashboard: <https://look-at-yourself-api.look-at-yourself-worker.workers.dev/private/looking-zero>

Sign in with:

- Username: `analytics`
- Password: the value stored in Cloudflare as `ANALYTICS_ACCESS_TOKEN`

Save the URL as a browser favorite named **Just One Look – Measurement Dashboard**. Store the password in a password manager, preferably in an entry with the same name. Never put the password in a bookmark, repository file, ordinary note, screenshot, or conversation.

The dashboard currently uses an HTTP Basic password check built into the Worker. Because the public guides share this Worker, do not place Cloudflare Access in front of the entire Worker hostname. If stronger access control is added later, protect only `/private/looking-zero*` or move analytics to a separate Worker first.

## Select a date range

The dashboard opens with the most recent 30 days selected.

1. Choose the first included date under **From**.
2. Choose the last included date under **Through**.
3. Select **Update**.

The selected range can be no longer than 366 days. **Through** includes the whole date shown. One selection updates both dashboard sections. Traffic is grouped by UTC day, while Looking Zero outcomes are selected by session start date.

## Website Traffic

The first section shows homepage views, storage-free homepage entrances, Try It clicks, Looking Zero openings, Looking Zero sessions started, and a compact **Roads to Zero** source summary. These are independent aggregate action counts, not a linked visitor funnel. A homepage entrance is a direct or external arrival excluding ordinary reloads and same-site navigation; it is not a visit or unique person. Source counts record only which implemented clean source path was opened and are not linked to later Zero events. The percentage shown on the entrance card compares entrances with Try It clicks only from the entrance measurement’s activation date. See [TRAFFIC-DASHBOARD-GUIDE.md](TRAFFIC-DASHBOARD-GUIDE.md) for the exact definitions and privacy boundaries.

## Looking Zero outcomes

| Figure | Meaning |
| --- | --- |
| Sessions started | Anonymous sessions recorded by the Worker when it accepts a valid first Looking Zero request during the selected period. This can differ slightly from the independent browser-recorded website start count. |
| Complete invitation delivered | Sessions in which Zero gave a complete, actionable inward-looking invitation. The percentage uses sessions started as its denominator. |
| Response after invitation | Sessions in which the visitor sent another message after receiving the complete invitation. The percentage uses complete invitations as its denominator. |
| Possible indication of trying | Sessions whose visitor language weakly, ambiguously, or explicitly indicates an attempt. This includes **Explicitly reported trying**. The percentage uses complete invitations as its denominator. |
| Explicitly reported trying | Sessions in which the visitor directly reported trying the act. This is a subset of **Possible indication of trying**, not an additional category. The percentage uses complete invitations as its denominator. |
| No recorded indication of trying | Sessions containing neither an indicated nor explicit report of trying. Together with **Possible indication of trying**, this divides all started sessions. This count includes sessions that ended before a complete invitation. It is not evidence that the inward look did not occur. |
| Median visitor turn of first indication | The middle visitor-message number on which an attempt indication first appeared, among sessions with a recorded indication. A dash means no indication was recorded in the selected retained records. |

The attempt categories describe only what was reportable from the conversation. They do not determine success. According to the method, a person may perform the act simply upon hearing the invitation without recognizing, evaluating, or reporting it.

## Useful ways to review the dashboard

For ordinary monitoring, look at a recent 30-day range. For a pilot or campaign, select its exact dates. Compare periods only when they are long enough to contain a reasonable number of sessions; percentages from very small samples can change sharply after one session.

The most useful questions are:

- Is Zero delivering a complete invitation reliably?
- Do visitors remain long enough to respond after the invitation?
- How often does visitor language provide some indication of trying?
- Does the pattern change substantially over time?

Do not use the dashboard to decide whether a particular person looked, whether the method worked for them, or whether sessions without reports were failures.

## Privacy and retention

The measurement system does not retain conversation text. It stores an HMAC-hashed session identifier, timestamps, message counts, delivery and response milestones, the highest conservative attempt-report category, and a closed operational status code. It does not store names, accounts, IP addresses for analytics, user agents, device fingerprints, or cross-session profiles.

The classifier temporarily receives the active Looking Zero conversation through the dedicated OpenAI outcome-measurement project with storage disabled. It cannot alter the reply shown to the visitor. Self-Directed Attention Zero is not measured by this system.

Individual anonymous session rows are converted to daily aggregates after 90 days and then deleted. Aggregate totals remain available. When a selected range includes archived data, the median card is marked **retained session records only**, because daily aggregates cannot preserve a median.

## Current production configuration

Outcome measurement is controlled by `OUTCOME_MEASUREMENT_ENABLED` in `wrangler.jsonc`:

- `"true"`: measure allowed production origins.
- `"test"`: measure only the exact `OUTCOME_TEST_ORIGIN`.
- `"false"`: do not collect outcome measurements.

The production configuration is currently `"true"`. In this mode, the exact `OUTCOME_TEST_ORIGIN` is excluded so JOL team testing does not enter the production dashboard. Changing the repository file has no effect until the Worker is deployed.

Required Cloudflare resources and secrets:

- D1 binding: `OUTCOME_DB`
- OpenAI classifier key: `OPENAI_OUTCOME_API_KEY`
- Anonymous session HMAC secret: `OUTCOME_SESSION_SECRET`
- Dashboard password: `ANALYTICS_ACCESS_TOKEN`

Never place their values in this repository. Rotate a secret in Cloudflare if it may have been exposed. If the OpenAI key is replaced, create it in the **Looking Zero Outcome Measurement** project with **List models: Read** and **Responses: Write**, then rotate `OPENAI_OUTCOME_API_KEY` in Cloudflare.

## Costs and monitoring

Classifier usage is billed to the separate OpenAI project **Looking Zero Outcome Measurement**, where its budget and spending limits should remain enabled. Cloudflare usage and D1 operations appear in the Cloudflare account. Review both providers periodically, especially after traffic changes.

The classifier is invoked only at selected conversational points, not indiscriminately for every message. A measurement failure must not interrupt the public guide. Unexpectedly flat dashboard data can therefore mean either low traffic or a measurement problem and should be investigated before drawing conclusions.

## Troubleshooting

If the dashboard asks for credentials repeatedly, confirm the username is `analytics` and use the current `ANALYTICS_ACCESS_TOKEN` value from the password manager. If the password is lost, rotate that Cloudflare secret and deploy.

If the dashboard loads but new sessions never appear:

1. Confirm `OUTCOME_MEASUREMENT_ENABLED` is `"true"` in the deployed Worker configuration.
2. Confirm all four bindings and secrets listed above exist in the same Worker.
3. Check that the dedicated OpenAI project has available budget and that its key has the required permissions.
4. Run the Worker tests before deploying any correction.
5. Use controlled test mode for diagnosis rather than generating fake production traffic.

If the public guide fails, first treat that as a guide-service incident rather than an analytics interpretation issue. Measurement is designed to fail independently, so changing outcome criteria should not be the first response.

## Change discipline

Small wording and classification refinements are expected, but changes can make periods less comparable. Before changing a metric definition:

1. Write down the reason and the intended interpretation.
2. Update the classifier version and evaluation cases.
3. Run the complete test suite.
4. Evaluate controlled examples in `"test"` mode.
5. Deploy only after reviewing privacy and dashboard wording.
6. Record the activation date so later comparisons account for the change.

The technical implementation, setup steps, and measurement definitions are documented in [README.md](README.md). The draft public-facing privacy language is in [PRIVACY-DISCLOSURE-DRAFT.md](PRIVACY-DISCLOSURE-DRAFT.md).

The short access note that can be shared internally is [TEAM-TESTING.md](TEAM-TESTING.md).
