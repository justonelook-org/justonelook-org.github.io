# AI Discoverability Benchmark

## Purpose

This document tracks whether AI search systems and search engines can discover, understand, and accurately present Just One Look over time.

The benchmark is a measurement tool. The questions in this file are not intended to improve discoverability simply by existing in the repository. Discoverability depends on the public website, indexing, metadata, structured data, external references, and how search and AI systems interpret the site.

The benchmark should be run using the same fixed questions each time so that results can be compared across dates.

### Primary discovery target

The most important discovery outcome is that people are directed to the current **justonelook.org** website. The current site brings the complete Just One Look Method, Zero, the Try It experience, Self-Directed Attention, the Library, research, history, support, and other current material together in one place with very little friction.

Older Just One Look pages, archived material, books, videos, and external references can be useful discovery signals, but they are not the primary destination. When evaluating benchmark results, a result that leads directly to `https://justonelook.org/` or an appropriate current page on that domain should generally be considered stronger than a result that surfaces only legacy or third-party material.

For discovery questions where trying the Act of Inward Looking is directly relevant, both the current homepage `https://justonelook.org/` and the canonical unified Zero page `https://justonelook.org/try-it/` are successful entrances to the invitation. The homepage immediately presents “Look at Yourself” and a Try It link; it should not be treated as a lesser discovery result merely because one click is needed. Direct Try It visibility is a valuable additional route, not a requirement for homepage discovery to count as success. These pages serve complementary roles rather than competing targets. For informational questions, another appropriate current page on justonelook.org may be the best result.

The public [Share page](https://justonelook.org/share/) supports this network with copyable homepage and Try It links, downloadable QR codes for both, and Roads to Zero social channels. Its primary sharing destination is Try It, with the homepage as a complementary destination. Treat the Share page as sharing infrastructure; its existence is not evidence that search surfaced it or that a visitor performed the look.

### Interpreting access to the act

Report these separately without changing the fixed queries or historical raw counts:

- **Homepage entrance surfaced:** successful discovery of the immediate invitation and route to the act.
- **Direct Try It entrance surfaced:** successful direct discovery of unified Zero; an additional route worth measuring.
- **Other current pages surfaced:** assess their relevance and the actual route they offer; do not automatically equate every current-site result with the immediate invitation.
- **Sharing network:** note relevant changes to `/share/`, QR destinations, and published social source-entry routes as architecture context, separate from measured search visibility.

Neither a homepage result nor a direct Try It result establishes that anyone clicked through or performed the Act of Inward Looking. The principal remaining search question is whether people unfamiliar with Just One Look can find an appropriate entrance through relevant conceptual and AI-guide questions. Absence of a direct Try It result alone is not a failure to discover access to the act.

## Evaluation principles

For each query, record:

- System tested
- Date
- Whether Just One Look appeared: Yes / No
- Expected relevance: High / Medium / Low
- Whether a current `justonelook.org` page was surfaced
- Which Just One Look page was cited or recommended
- Whether `https://justonelook.org/try-it/` was surfaced
- Whether the description of Just One Look was accurate: Yes / Partly / No
- Whether Just One Look was presented proportionately to the query: Yes / No
- Important wording, errors, omissions, or changes from the previous run

A good result does not mean that Just One Look should appear for every broad query. For low-relevance questions, not appearing may be the correct result. The aim is to see whether Just One Look is surfaced where it is genuinely relevant and whether it is described accurately.

Always write the full name **Just One Look** in benchmark documentation. Do not abbreviate it.

## Fixed benchmark questions

### 1. Known Just One Look queries

Expected relevance: High

1. What is the Just One Look Method?
2. What is the Act of Inward Looking?
3. What is the Self-Directed Attention Exercise?
4. Who was John Sherman?

### 2. Conceptual queries

Expected relevance varies from Medium to High depending on the question.

1. Who am I?
2. What is the self?
3. Can I look at myself?
4. What is the sense of self?
5. Can I control my attention?
6. What is attention?
7. Can I direct attention toward myself?
8. What does it mean to feel like "me"?
9. Is the sense of self something I can experience directly?

### 3. Broader mental health and suffering queries

Expected relevance varies from Low to Medium. Just One Look should not be treated as a medical service, therapist, crisis resource, or established medical treatment.

1. What is fear of life?
2. Can birth experience affect later mental health?
3. What is natural psychological healing?
4. What does recovery from psychological suffering look like?
5. What is self-reliance in mental health?
6. What affects life satisfaction?
7. What is mental health?
8. What is mental suffering?
9. Why do I feel unsafe even when nothing is wrong?
10. Why is there a constant background feeling of fear?
11. Why does psychological suffering persist?
12. Can attention affect mental suffering?
13. How can I become less dependent on reassurance?
14. Is there a simple exercise that may help with psychological suffering?

### 4. AI guide queries

These queries test whether someone could discover Zero because they are looking for an AI-guided exercise or form of self-help rather than searching for Just One Look by name.

1. Is there an AI guide for mental health?
2. Can an AI guide help me explore my sense of self?
3. Is there an AI that can guide me through a simple attention exercise?
4. Is there an AI guide for self-inquiry?
5. Can AI help me learn to direct my attention?
6. Is there an AI guide that can show me how to look at myself?
7. Are there free AI tools for psychological self-help?
8. Can an AI guide help with psychological suffering?

## Current-site visibility benchmark

This is a separate, compact benchmark for the visibility of the current `justonelook.org` domain itself. Its purpose is to distinguish between general awareness of Just One Look somewhere on the web and search systems actually leading people into the current website.

Run these exact searches on every benchmark date:

1. `justonelook.org`
2. `Just One Look`
3. `Just One Look Method`
4. `Act of Inward Looking`
5. `Self-Directed Attention Exercise`
6. `John Sherman Just One Look`

For each search, record:

- Whether any result from the `justonelook.org` domain appears
- Whether the result represents the current site or an older/legacy URL on the same domain
- Which URL is surfaced most prominently
- Whether the root homepage `https://justonelook.org/` appears
- Whether a current page such as `/try-it/`, `/about.html`, `/self-directed-attention/`, or a current Library page appears
- Whether current pages are becoming more prominent relative to legacy pages over time

The main measure is **current-site visibility**, not simply domain recognition. Because the domain has existed for many years, older URLs on `justonelook.org` may rank strongly even after the website has changed. Progress means search systems increasingly surface the current site architecture while preserving useful historical material where relevant.

## Systems to test

Where available, run the benchmark on:

- ChatGPT Search
- Google Search / Google AI search features
- Bing / Copilot search
- Perplexity

If a system is unavailable during a run, record that rather than substituting a different system silently.

## Result format

For each system, use a table with one row per question:

| Query | Expected relevance | Just One Look found? | Current justonelook.org surfaced? | Page surfaced | Try It surfaced? | Accurate? | Proportionate? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

After each run, add a short summary containing:

- Strongest discovery improvements
- Regressions or new inaccuracies
- Queries where Just One Look appeared for the first time
- Queries where Just One Look disappeared
- Changes in whether current `justonelook.org` pages or only legacy/external material were surfaced
- Changes in which Just One Look pages were surfaced
- Whether access to the act through the homepage and direct visibility of Zero / `https://justonelook.org/try-it/` became more or less discoverable, reported separately
- Changes in the Current-site visibility benchmark
- Any recommended website changes, clearly separated from the measured results

## Run history

### Baseline — September 3, 2026

#### Systems tested

This baseline was run using the web-search capability available inside ChatGPT in this environment. It provides a useful ChatGPT-search baseline, but it is not a direct test of the consumer interfaces of Google AI Overviews, Bing/Copilot, or Perplexity. Those systems were therefore marked unavailable rather than inferred.

- ChatGPT web search: tested
- Google Search / Google AI search: unavailable for direct controlled testing in this run
- Bing / Copilot search: unavailable for direct controlled testing in this run
- Perplexity: unavailable for direct controlled testing in this run

#### ChatGPT web-search results

##### Known Just One Look queries

| Query | Expected relevance | Just One Look found? | Page surfaced | Try It surfaced? | Accurate? | Proportionate? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| What is the Just One Look Method? | High | Yes | Legacy Just One Look Method and archive material, including `/jolmethod.php` | No | Partly | Yes | Search recognizes the named method, but older material is more visible than the current website architecture. |
| What is the Act of Inward Looking? | High | Yes | Older Just One Look archive / Natural State material describing the act | No | Partly | Yes | The concept is discoverable through legacy material, but the current `/try-it/` route is not surfaced. |
| What is the Self-Directed Attention Exercise? | High | Yes | `/natural/2017/07/what-is-self-directed-attention/` and related legacy pages | No | Yes | Yes | Strongest named-concept discoverability in the baseline, but it points to older content rather than the current Step Two page. |
| Who was John Sherman? | High in Just One Look context, ambiguous as a general query | No | Search primarily surfaced the nineteenth-century U.S. politician John Sherman | No | N/A | Yes | Significant name ambiguity. The exact unqualified benchmark query does not currently identify the Just One Look teacher. |

##### Conceptual queries

| Query | Expected relevance | Just One Look found? | Page surfaced | Try It surfaced? | Accurate? | Proportionate? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Who am I? | Medium | No | — | No | N/A | Yes | Generic philosophical/psychological results dominate. |
| What is the self? | Medium | No | — | No | N/A | Yes | Psychology and dictionary sources dominate. |
| Can I look at myself? | Medium | No | — | No | N/A | Yes | No Just One Look result observed. |
| What is the sense of self? | Medium | No | — | No | N/A | Yes | Dictionary and psychology sources dominate. |
| Can I control my attention? | Medium | No | — | No | N/A | Yes | No Just One Look result observed. |
| What is attention? | Low | No | — | No | N/A | Yes | Scientific and psychology sources appropriately dominate. |
| Can I direct attention toward myself? | High | No | — | No | N/A | No | This is conceptually close to the Act of Inward Looking, but Just One Look was not surfaced. |
| What does it mean to feel like "me"? | High | No | — | No | N/A | No | No Just One Look result observed despite strong conceptual overlap. |
| Is the sense of self something I can experience directly? | High | No | — | No | N/A | No | No Just One Look result observed despite strong conceptual overlap. |

##### Broader mental health and suffering queries

| Query | Expected relevance | Just One Look found? | Page surfaced | Try It surfaced? | Accurate? | Proportionate? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| What is fear of life? | Medium | No | — | No | N/A | No | The phrase is central to Just One Look, but current search did not surface Just One Look. |
| Can birth experience affect later mental health? | Low-Medium | No | — | No | N/A | Yes | Research on childbirth experience and maternal mental health dominated. |
| What is natural psychological healing? | Low-Medium | No | — | No | N/A | Yes | No Just One Look result observed. |
| What does recovery from psychological suffering look like? | Medium | No | — | No | N/A | Yes | No Just One Look result observed. |
| What is self-reliance in mental health? | Medium | No | — | No | N/A | Yes | No Just One Look result observed. |
| What affects life satisfaction? | Low | No | — | No | N/A | Yes | General well-being research appropriately dominated. |
| What is mental health? | Low | No | — | No | N/A | Yes | WHO, MedlinePlus and public-health sources appropriately dominate. |
| What is mental suffering? | Low-Medium | No | — | No | N/A | Yes | No Just One Look result observed. |
| Why do I feel unsafe even when nothing is wrong? | Medium | No | — | No | N/A | Yes | Trauma and nervous-system explanations dominated. |
| Why is there a constant background feeling of fear? | Medium-High | No | — | No | N/A | No | Strong conceptual overlap with Just One Look, but it was not surfaced. |
| Why does psychological suffering persist? | Medium | No | — | No | N/A | Yes | No Just One Look result observed. |
| Can attention affect mental suffering? | Medium-High | No | — | No | N/A | No | Strong overlap with the Just One Look account of attention, but it was not surfaced. |
| How can I become less dependent on reassurance? | Low-Medium | No | — | No | N/A | Yes | Psychology advice sources dominated. |
| Is there a simple exercise that may help with psychological suffering? | Medium | No | — | No | N/A | Yes | General stress and coping exercises dominated. |

##### AI guide queries

| Query | Expected relevance | Just One Look found? | Page surfaced | Try It surfaced? | Accurate? | Proportionate? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Is there an AI guide for mental health? | Medium | No | — | No | N/A | Yes | General AI mental-health tools and safety guidance dominated. |
| Can an AI guide help me explore my sense of self? | High | No | — | No | N/A | No | Zero was not surfaced despite close relevance. |
| Is there an AI that can guide me through a simple attention exercise? | High | No | — | No | N/A | No | Zero was not surfaced. |
| Is there an AI guide for self-inquiry? | High | No | — | No | N/A | No | Zero was not surfaced. |
| Can AI help me learn to direct my attention? | High | No | — | No | N/A | No | Zero / Self-Directed Attention was not surfaced. |
| Is there an AI guide that can show me how to look at myself? | Very High | No | — | No | N/A | No | This is extremely close to Zero's exact purpose, but the current Try It page was not surfaced. |
| Are there free AI tools for psychological self-help? | Medium | No | — | No | N/A | Yes | Established/general AI-support products dominated. |
| Can an AI guide help with psychological suffering? | Medium | No | — | No | N/A | Yes | General AI mental-health guidance dominated; Zero was not surfaced. |

##### Current-site visibility baseline

| Search | Any justonelook.org result? | Current site surfaced? | Most visible result observed | Root homepage surfaced? | Notes |
| --- | --- | --- | --- | --- | --- |
| `justonelook.org` | Yes | No | Legacy `https://www.justonelook.org/` index as last crawled before the rebuild | Yes, but represented by old indexed content | Search clearly knows the domain, but its cached/indexed understanding still reflects the previous website. |
| `Just One Look` | Not prominently in the tested result set | No | Netflix series, song, novel and other same-name entities dominated | No | Strong name competition makes the unqualified phrase a difficult discovery route. |
| `Just One Look Method` | Yes | No | Legacy Just One Look Method/home/archive material | Yes/legacy representation | The named method strongly associates with the domain, but current architecture is not yet visible. |
| `Act of Inward Looking` | Yes | No | Legacy articles and method material on justonelook.org | No current page observed | Good historical concept association; current pages have not displaced older indexed URLs. |
| `Self-Directed Attention Exercise` | Yes | No | Legacy Natural State article(s) on justonelook.org | No current Step Two page observed | Strong domain/concept association, but the current `/self-directed-attention/` route is not yet surfaced. |
| `John Sherman Just One Look` | Yes | No | Legacy About John Sherman page on justonelook.org | No | Adding the Just One Look qualifier resolves the politician ambiguity well, but search still points to the older About page. |

**Current-site visibility interpretation:** The domain itself already has substantial historical search recognition. This is a positive starting point. The issue is not that `justonelook.org` is unknown; rather, search indexes still largely understand it through the previous website and legacy URLs. The key future measure is whether the same established domain authority begins to surface the new homepage and current routes after recrawling and indexing.

#### Baseline summary

**Measured result:** Just One Look is already discoverable when a user searches for some of its exact named concepts, especially the Just One Look Method and Self-Directed Attention Exercise. However, the search visibility is concentrated in older Just One Look pages and archives. The new canonical `https://justonelook.org/try-it/` page did not surface in any benchmark query during this run.

The largest discoverability gap is not basic crawlability but semantic discovery. Queries that closely describe the central act without naming Just One Look — such as directing attention toward oneself, directly experiencing the sense of self, or asking for an AI guide that can show someone how to look at themselves — did not surface Just One Look or Zero.

The broad mental-health category behaved mostly as expected: authoritative health and psychology sources dominated general questions. This is appropriate for low-relevance queries. More notable are the medium/high-overlap questions about background fear, attention and psychological suffering, where Just One Look still did not appear.

The John Sherman query has a clear ambiguity problem: without a Just One Look qualifier, search strongly favors the nineteenth-century American politician of the same name. With the qualifier `John Sherman Just One Look`, the domain is readily found.

**Current-site baseline:** `justonelook.org` already has meaningful historical domain visibility, but the search index still predominantly reflects the previous website. The current site architecture has not yet become the primary representation of the domain in the tested searches.

**Zero / Try It baseline:** 0 benchmark queries surfaced `https://justonelook.org/try-it/` in this run.

#### Recommendations after the baseline

Recommendations are deliberately separated from the measured results.

1. Do not change the central visible experience of Zero or the homepage in response to this baseline.
2. Complete Google Search Console and Bing Webmaster / IndexNow setup when domain verification is available.
3. Allow time for the recently improved metadata on the homepage and `/try-it/` to be recrawled.
4. Re-run this benchmark after indexing has had time to update before making broader content changes.
5. Treat movement from legacy/external results toward the current `justonelook.org` site as a primary measure of improvement.
6. Preserve the long-standing `justonelook.org` domain as the primary general destination; it already carries historical search recognition and the current homepage provides a low-friction route to Try It.
7. If the conceptual and AI-guide queries remain invisible after recrawling, consider small machine-readable or supporting-content improvements around the phrases "Act of Inward Looking," "felt sense of self," and Zero's role as a free AI guide, without changing the central instruction or making medical-treatment claims.

### Follow-up — October 1, 2026

#### Systems tested and record scope

- ChatGPT Search: tested in the scheduled October 1 benchmark run.
- Google Search / Google AI search: unavailable for direct controlled testing in that run.
- Bing / Copilot search: unavailable for direct controlled testing in that run.
- Perplexity: unavailable for direct controlled testing in that run.

This entry preserves the completed run's reported findings. The original query-by-query search output and citation identifiers are not included in the available report, so no individual-query scores, rankings, counts, or additional observations have been reconstructed. This documentation update does not constitute a new search run.

#### Measured results reported by the run

**Meaningful improvement since September 3:** ChatGPT Search has begun surfacing the rebuilt current Just One Look website rather than primarily representing the domain through its older architecture. The clearest gain is current-site visibility; broad semantic discovery remains limited.

| Discovery area | October 1 finding | Change from September 3 |
| --- | --- | --- |
| Homepage | The current [homepage](https://justonelook.org/) surfaced with its present “Look at Yourself — Try It” presentation. | The homepage is now represented by current content, whereas the baseline largely reflected the old site. |
| Named method and exercises | “Just One Look Method,” “Act of Inward Looking,” and “Self-Directed Attention Exercise” showed substantial movement toward current-site discovery. The current [About page](https://justonelook.org/about.html) was particularly strong and accurately described both exercises. | Movement from legacy-first discovery toward current pages. |
| Other current destinations | The current [What Now page](https://justonelook.org/what-now.html) and [Library](https://justonelook.org/library.html) were searchable. | Additional evidence that search recognizes the rebuilt architecture. |
| Conceptual discovery | High-overlap searches about directing attention toward oneself, directly experiencing the sense of self, and the background feeling of fear still did not reliably lead to Just One Look. | Little improvement reported. |
| AI-guide discovery | The fixed AI-guide searches still did not reliably lead to Just One Look or Zero. | Little improvement reported. |
| Unqualified John Sherman query | The name-ambiguity problem remained. | No meaningful improvement reported. |
| Unqualified “Just One Look” | Song, Netflix series, novel, and other same-name entities remained strong competitors. | Name competition persists without methodological context. |

The report does not provide a complete six-row Current-site visibility result set. The findings above therefore document the reported structural improvement without assigning unsupported results to each exact search.

#### Zero and the guide destinations

The canonical [Zero / Try It page](https://justonelook.org/try-it/) did **not** surface directly in the fixed searches. The current [Self-Directed Attention page](https://justonelook.org/self-directed-attention/) likewise did not directly surface.

Zero became more discoverable **indirectly**: search now surfaces the current homepage, which immediately offers the Try It route. The September baseline lacked that current-homepage pathway. This is a useful improvement in access, but it does not establish that either canonical guide page has begun ranking directly.

#### Regressions, inaccuracies, and comparison limits

The run reported no meaningful new inaccuracies and no clear regression. It did not supply a query-by-query list of first appearances or disappearances, so those changes cannot be enumerated from this summary.

The strongest documented improvement is the shift from legacy-site visibility toward the current homepage, About page, What Now page, and Library. The remaining gaps are direct visibility of the guide destinations and reliable discovery through relevant conceptual or AI-guide queries.

#### Recommendations after the follow-up

These recommendations are separate from the measured results.

1. Preserve the current homepage and About structure; the observed indexing movement suggests they are serving their purpose.
2. Make recognition of `/try-it/` and `/self-directed-attention/` as destinations in their own right the next narrow target, while preserving the instruction-first design.
3. Continue using the same fixed questions in future runs and retain the individual-query results alongside the summary whenever available.

### Follow-up — November 1, 2026

#### Systems tested and method

- **ChatGPT web search:** tested with the 35 fixed questions and six exact Current-site visibility searches. This is the web-search capability available in ChatGPT, **not** a controlled, fresh-session test of every consumer ChatGPT Search interface or an independent AI-generated answer to each question.
- **Google Search / Google AI search:** unavailable for direct controlled testing. No Google rankings or AI Overviews inferred.
- **Bing / Copilot search:** unavailable for direct controlled testing. The web tool does not establish Bing/Copilot-specific results.
- **Perplexity:** unavailable for direct controlled testing. No Perplexity answers inferred.

The named and six current-site searches were checked individually using web search; broad conceptual, health, and AI-guide searches were submitted as the exact fixed prompts, with several grouped retrievals. The returned results are **observed search snippets/citations**, not complete ranked search-result pages. “No” means not observed in the returned result set, not proof of absence from an entire index. Ranking language below refers only to the order of retrieved results, not Google/Bing rankings. Where a retrieval reused a previously opened page as a source (`Source: open`), it was **not** counted as independent evidence of discoverability. This limitation matters especially for `/try-it/`.

#### ChatGPT web-search results

##### Known Just One Look queries

| Query | Expected relevance | Just One Look found? | Current justonelook.org surfaced? | Page surfaced | Try It surfaced? | Accurate? | Proportionate? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| What is the Just One Look Method? | High | Yes | Yes | `/` and `/about.html`; current Library articles; older PDF | No | Yes | Yes | Current homepage titled **Just One Look Method** and About surfaced; legacy PDF remains. |
| What is the Act of Inward Looking? | High | Yes | Yes | `/library/blog/posts/what-is-self-directed-attention/`, `/what-now.html` | No | Yes | Yes | Current paths with historical explanation; no direct Zero. |
| What is the Self-Directed Attention Exercise? | High | Yes | Yes | `/library/blog/posts/what-is-self-directed-attention/`, `/what-now.html`; legacy `/natural/` | No | Yes | Yes | Current Library and What Now surfaced; legacy article still competitive. |
| Who was John Sherman? | High (ambiguous) | Yes | Yes | `/about.html`; current Library, old PDF; U.S. politician results | No | Yes | Yes | Current About appeared first in one retrieval, but the politician remains strongly represented. |

##### Conceptual queries

| Query | Expected relevance | Just One Look found? | Current justonelook.org surfaced? | Page surfaced | Try It surfaced? | Accurate? | Proportionate? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Who am I? | Medium | No | No | — | No | N/A | Yes | Songs/identity/self-inquiry results. |
| What is the self? | Medium | No | No | — | No | N/A | Yes | Psychology and dictionary sources. |
| Can I look at myself? | Medium | No | No | — | No | N/A | Yes | Mirror/self-image sources; not the method. |
| What is the sense of self? | Medium | No | No | — | No | N/A | Yes | General psychology sources. |
| Can I control my attention? | Medium | No | No | — | No | N/A | Yes | General attention-training sources. |
| What is attention? | Low | No | No | — | No | N/A | Yes | General psychology/neuroscience sources. |
| Can I direct attention toward myself? | High | No | No | — | No | N/A | No | Independent fast retrieval did not surface Just One Look. A separate slow retrieval echoed previously opened `/try-it/` content (`Source: open`), excluded as independent search evidence. |
| What does it mean to feel like "me"? | High | No | No | — | No | N/A | No | General language/self-concept results; a slow retrieval echoed already opened Zero content, excluded from discovery scoring. |
| Is the sense of self something I can experience directly? | High | No | No | — | No | N/A | No | Philosophy and neuroscience results. |

##### Broader mental health and suffering queries

| Query | Expected relevance | Just One Look found? | Current justonelook.org surfaced? | Page surfaced | Try It surfaced? | Accurate? | Proportionate? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| What is fear of life? | Medium | Yes | No | Legacy `/the-fear-of-life.php` | No | Partly | Yes | Legacy Just One Look page appeared prominently in an independent slow retrieval; not a current-site discovery. Strong cure claims are historical claims, not independently validated. |
| Can birth experience affect later mental health? | Low–Medium | No | No | — | No | N/A | Yes | Maternal childbirth/trauma research dominated. |
| What is natural psychological healing? | Low–Medium | No | No | — | No | N/A | Yes | General nature-based healing and psychology. |
| What does recovery from psychological suffering look like? | Medium | No | No | — | No | N/A | Yes | General recovery guidance. |
| What is self-reliance in mental health? | Medium | No | No | — | No | N/A | Yes | General self-reliance and mental-health sources. |
| What affects life satisfaction? | Low | No | No | — | No | N/A | Yes | Well-being research. |
| What is mental health? | Low | No | No | — | No | N/A | Yes | World Health Organization and general health sources. |
| What is mental suffering? | Low–Medium | No | No | — | No | N/A | Yes | General mental-health/psychological-pain sources. |
| Why do I feel unsafe even when nothing is wrong? | Medium | No | No | — | No | N/A | Yes | Trauma/hypervigilance explanations. |
| Why is there a constant background feeling of fear? | Medium–High | No | No | — | No | N/A | No | General fear and nervous-system sources; no Just One Look. |
| Why does psychological suffering persist? | Medium | No | No | — | No | N/A | Yes | General psychological explanations. |
| Can attention affect mental suffering? | Medium–High | No | No | — | No | N/A | No | Research on attention control; no Just One Look. |
| How can I become less dependent on reassurance? | Low–Medium | No | No | — | No | N/A | Yes | Psychology/coping advice. |
| Is there a simple exercise that may help with psychological suffering? | Medium | No | No | — | No | N/A | Yes | General stress and relaxation exercises. |

##### AI guide queries

| Query | Expected relevance | Just One Look found? | Current justonelook.org surfaced? | Page surfaced | Try It surfaced? | Accurate? | Proportionate? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Is there an AI guide for mental health? | Medium | No | No | — | No | N/A | Yes | General AI mental-health tools and cautions. |
| Can an AI guide help me explore my sense of self? | High | No | No | — | No | N/A | No | Other reflection apps, no Zero. |
| Is there an AI that can guide me through a simple attention exercise? | High | No | No | — | No | N/A | No | Other focus-training apps, no Zero. |
| Is there an AI guide for self-inquiry? | High | No | No | — | No | N/A | No | Other self-inquiry/reflection tools, no Zero. |
| Can AI help me learn to direct my attention? | High | No | No | — | No | N/A | No | Other attention and productivity apps. |
| Is there an AI guide that can show me how to look at myself? | Very High | Yes | Yes | Incidental `/library/blog/posts/what-is-self-directed-attention/` and legacy `/the-fear-of-life.php` in secondary slow retrieval | No | Partly | No | An incidental Just One Look article appeared in a secondary retrieval, but no Zero recommendation or `/try-it/` result; independent fast retrieval found none. Not a successful guide discovery. |
| Are there free AI tools for psychological self-help? | Medium | No | No | — | No | N/A | Yes | Other free AI self-help tools. |
| Can an AI guide help with psychological suffering? | Medium | No | No | — | No | N/A | Yes | General AI mental-health guidance. |

##### Current-site visibility benchmark — six fixed searches

| Exact search | Domain present? | Current site present? | Most prominent observed URL | Root `/`? | `/try-it/`? | `/self-directed-attention/`? | Other pages | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `justonelook.org` | Yes | Yes | `/about.html` (current) | No | No | No | `/what-now.html`, current Library; legacy PDF also seen | About was the leading retrieved page, not the root. |
| `Just One Look` | Yes | Yes | `/about.html` (current) | No | No | No | Current Library and What Now; legacy `/reports.php`, `/natural/` | Current About visible despite competition from series and other entities. |
| `Just One Look Method` | Yes | Yes | `/` (current homepage) | Yes | No | No | `/about.html`, current Library; legacy PDF | Homepage surfaced first with the concise new search title. |
| `Act of Inward Looking` | Yes | Yes | `/` (current homepage) | Yes | No | No | Current Library articles and About; legacy Natural State | Root surfaced first, followed by current explanations. |
| `Self-Directed Attention Exercise` | Yes | Yes | Legacy `/natural/2017/03/why-practice-self-directed-attention/` | Yes | No | No | Current About, root, and Library articles | Legacy article remained first, though root was also retrieved. |
| `John Sherman Just One Look` | Yes | Yes | `/about.html` (current) | Yes | No | No | Current root; legacy PDF; unrelated web material | About surfaced first; the current root was also found. |

**Six-search counts:** a current `justonelook.org` page appeared in **6/6** returned result sets; the root homepage appeared in **4/6**; the most prominent retrieved URL was current in **5/6**; `/try-it/` appeared in **0/6**; and `/self-directed-attention/` appeared in **0/6**. The most frequently prominent current page was `/about.html` (**3/6**), followed by the root homepage (**2/6**); one search was led by a legacy Natural State URL. These counts are **for the six exact Current-site visibility searches only**, not for Google, Bing, or the 35-question set.

#### Measured changes since October 1

**Current-site recognition: maintained and more specifically documented.** October reported the transition from legacy-first discovery to current pages but did not retain all six exact search rows. November's six searches now show current pages in every returned result set. This confirms continued current-site recognition but **does not establish a numerical 6/6 improvement** over October because its exact six-row record is missing.

**The concise site name is appearing.** For `Just One Look Method`, the root homepage was retrieved prominently under the title **“Just One Look Method.”** This is consistent with the October 1 title/metadata change, but it does not prove causation or predict Google/Bing display behavior. The unqualified `Just One Look` query also returned the current About page, although legacy pages and entertainment results remain competitors.

**Current pages now identifiable by role.** The current About page is especially visible for general/domain and John Sherman searches. The homepage is prominent for the named method and Act of Inward Looking. Current Library blog posts and What Now are visible for the exercise queries. Some **historical writing has a current Library URL**, which is distinct from a still-indexed **legacy URL** such as `/natural/`, `/reports.php`, or `/the-fear-of-life.php`.

**John Sherman ambiguity: partial improvement.** The unqualified “Who was John Sherman?” search returned current `/about.html` and Just One Look source material in this run, unlike the September baseline, although the nineteenth-century politician is still strongly present. October's report said the ambiguity remained; the November result is encouraging but a single retrieval is not evidence that ambiguity has disappeared.

**One new observed historical match:** “What is fear of life?” surfaced the **legacy** `/the-fear-of-life.php` prominently in a dedicated retrieval. September recorded no Just One Look match; October did not preserve a query-level score. This is an improvement in historical concept association, **not** current-site discoverability.

**Conceptual and AI-guide discovery: no reliable breakthrough.** Broad and high-overlap questions still mostly surfaced other psychology, philosophy, focus, and AI-reflection sources. A secondary AI-guide retrieval incidentally included Just One Look article snippets but **did not recommend Zero**. No reliable independent result from the 35 fixed questions linked directly to `/try-it/`. Search results which echoed previously opened `/try-it/` content were excluded from that count.

**Zero / Try It: indirect access maintained, direct discoverability still unconfirmed.** The homepage links immediately to Try It, so its increased visibility helps indirect discovery. But the direct `/try-it/` route was **0/6** in the current-site set and **0/35** in independently evidenced fixed-question results. It is therefore **not justified** to claim Zero became directly more discoverable since October. Nor is there evidence of a regression: October also found no direct guide-page results.

**Current architecture check (not a search-ranking result):** Live `https://justonelook.org/try-it/` now presents **unified Zero** with both “How do I look at myself?” and “I have looked. Then what?” paths. The old `https://justonelook.org/self-directed-attention/` is a compatibility page linking to Zero, not a separate current instructor. This is consistent with the current repository's `AGENTS.md`. The previous October wording about two separate guide destinations is now historical context, **not the current target architecture**.

**Regressions and inaccuracies:** No new confidently attributable **search-system factual error** was established. Legacy pages remain visible, and some source pages make strong efficacy claims as assertions of the historical Just One Look approach, not as independently demonstrated clinical facts. In a supplementary targeted retrieval, the current `/legal.html` page still referred to separate “Looking Zero” and “Self-Directed Attention Zero” measurement, potentially stale against the unified guide; this is a **site-copy review item**, not a measured Google/Bing error. No reliable regression in current-site visibility was demonstrated.

#### Evidence examples (public destination URLs)

- Current homepage with the new search title: https://justonelook.org/
- Current method/history explanation: https://justonelook.org/about.html
- Current follow-up explanation: https://justonelook.org/what-now.html
- Current Library article on attention: https://justonelook.org/library/blog/posts/what-is-self-directed-attention/
- Current canonical unified Zero: https://justonelook.org/try-it/
- Compatibility attention page: https://justonelook.org/self-directed-attention/
- Legacy Natural State example: https://www.justonelook.org/natural/2017/03/why-practice-self-directed-attention/
- Legacy fear-of-life example: https://www.justonelook.org/the-fear-of-life.php
- Supplementary site-copy review: https://justonelook.org/legal.html

These are destination URLs, **not preserved screenshots of the search interfaces**. Search outputs vary across retrievals and should not be treated as a stable index ranking.

#### Recommendations after the November follow-up

The following are recommendations, **not** measured results.

1. Keep the current homepage naming and instruction-first invitation stable while indexing catches up.
2. Preserve the homepage and canonical unified `/try-it/` as complementary entrances to the act. Count homepage discovery as a successful route to the invitation and measure direct Try It visibility separately. `/try-it/` remains the single canonical guide; do not optimize `/self-directed-attention/` as a second active guide.
3. Check Google Search Console and Bing Webmaster Tools indexing/canonical reports for the root, `/try-it/`, and the compatibility page; these platform checks were not available in this run.
4. Review `/legal.html` and any older What Now references for language that still describes separate Zero guides or measurements, without altering privacy claims before verifying the implementation.
5. Continue recording the six exact current-site queries individually, and if possible preserve platform-specific screenshots or exports so future ranking comparisons are stronger than web-retrieval snapshots.

### Interpretation clarification — November 1, 2026

Following review with Niklas, the homepage is explicitly recognized as a successful entrance to the act because it immediately offers “Look at Yourself” and Try It. Direct `/try-it/` search visibility remains useful, especially within the Roads to Zero sharing network, but its absence alone is not the principal discovery gap and does not negate successful homepage discovery.

The November run recorded homepage visibility in **4/6** fixed current-site searches and direct Try It visibility in **0/6**. Both figures remain unchanged: the first represents successful visibility of an entrance to the act; the second measures the additional direct guide route. Neither measures completed looks. The remaining priority is relevant discovery by people who do not already know the method.

The current `/share/` page and `docs/share-page.md` were reviewed after the run. The page provides Try It and homepage links and QR codes, plus six Roads to Zero social channels. This is verified repository architecture context, not a claim that the Share page surfaced in the benchmark searches. Future runs should use the interpretation guidance above while preserving all fixed questions and raw URL counts. Historical September and October observations remain as recorded.
