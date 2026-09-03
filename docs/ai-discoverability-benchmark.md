# AI Discoverability Benchmark

## Purpose

This document tracks whether AI search systems and search engines can discover, understand, and accurately present Just One Look over time.

The benchmark is a measurement tool. The questions in this file are not intended to improve discoverability simply by existing in the repository. Discoverability depends on the public website, indexing, metadata, structured data, external references, and how search and AI systems interpret the site.

The benchmark should be run using the same fixed questions each time so that results can be compared across dates.

## Evaluation principles

For each query, record:

- System tested
- Date
- Whether Just One Look appeared: Yes / No
- Expected relevance: High / Medium / Low
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

## Systems to test

Where available, run the benchmark on:

- ChatGPT Search
- Google Search / Google AI search features
- Bing / Copilot search
- Perplexity

If a system is unavailable during a run, record that rather than substituting a different system silently.

## Result format

For each system, use a table with one row per question:

| Query | Expected relevance | Just One Look found? | Page surfaced | Try It surfaced? | Accurate? | Proportionate? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |

After each run, add a short summary containing:

- Strongest discovery improvements
- Regressions or new inaccuracies
- Queries where Just One Look appeared for the first time
- Queries where Just One Look disappeared
- Changes in which Just One Look pages were surfaced
- Whether Zero / `https://justonelook.org/try-it/` became more or less discoverable
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

#### Baseline summary

**Measured result:** Just One Look is already discoverable when a user searches for some of its exact named concepts, especially the Just One Look Method and Self-Directed Attention Exercise. However, the search visibility is concentrated in older Just One Look pages and archives. The new canonical `https://justonelook.org/try-it/` page did not surface in any benchmark query during this run.

The largest discoverability gap is not basic crawlability but semantic discovery. Queries that closely describe the central act without naming Just One Look — such as directing attention toward oneself, directly experiencing the sense of self, or asking for an AI guide that can show someone how to look at themselves — did not surface Just One Look or Zero.

The broad mental-health category behaved mostly as expected: authoritative health and psychology sources dominated general questions. This is appropriate for low-relevance queries. More notable are the medium/high-overlap questions about background fear, attention and psychological suffering, where Just One Look still did not appear.

The John Sherman query has a clear ambiguity problem: without a Just One Look qualifier, search strongly favors the nineteenth-century American politician of the same name.

**Zero / Try It baseline:** 0 benchmark queries surfaced `https://justonelook.org/try-it/` in this run.

#### Recommendations after the baseline

Recommendations are deliberately separated from the measured results.

1. Do not change the central visible experience of Zero or the homepage in response to this baseline.
2. Complete Google Search Console and Bing Webmaster / IndexNow setup when domain verification is available.
3. Allow time for the recently improved metadata on the homepage and `/try-it/` to be recrawled.
4. Re-run this benchmark after indexing has had time to update before making broader content changes.
5. If the conceptual and AI-guide queries remain invisible after recrawling, consider small machine-readable or supporting-content improvements around the phrases "Act of Inward Looking," "felt sense of self," and Zero's role as a free AI guide, without changing the central instruction or making medical-treatment claims.
