# Zero

This directory contains the canonical instruction sets for Zero, the Just One Look AI guide.

The canonical public guide is:

- **Unified Zero** guides the inward look first and, when relevant, continues into the attention exercise and daily-life use of attention.

The former **Look At Yourself** and **Self-Directed Attention Exercise** instruction files remain available for the historical endpoints, compatibility, and rollback. They retain their original separation and must not be rewritten as though they were unified.

The shared backend in `worker/zero/` reads these files when it is checked, tested, or deployed. Any corresponding GPTs in ChatGPT should also be kept in sync with these canonical versions.

Zero's canonical public webpage is `/try-it/`. The separate `/self-directed-attention/` page is temporarily retained for compatibility. The published social source-entry routes under `/try-it/` all continue to the unified guide.
