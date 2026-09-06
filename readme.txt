================================================================================
TOKEN-LINT - AI Token Waste & LLM Cost Optimizer (v1.0.0)
================================================================================

The static code analyzer that hunts down AI token leaks and cuts LLM bills.

[QUICK LINKS]
- Web: https://github.com/
- License: MIT Open Source
- Supported: Gemini 3.8 Flash, OpenAI GPT-4o, Anthropic Claude 3.7

================================================================================
1. OVERVIEW & PURPOSE
================================================================================
Over 80% of apps with LLM integrations waste 30-50% of their prompt token budget:
- Passing raw JSON.stringify() with empty fields, nulls, and internal IDs.
- Calling LLMs inside for / .map() loops without batching.
- Forgetting prompt caching headers on system prompts > 350 characters.
- Omitting max_tokens, risking infinite generation loops.

token-lint audits your source code for these patterns and calculates your exact
projected dollar savings per 10,000 API requests.

================================================================================
2. QUICKSTART COMMANDS
================================================================================
# Scan current directory
$ npx token-lint

# Scan specific folder
$ npx token-lint ./src

# Strict mode for CI (fails if token waste is found)
$ npx token-lint --strict

# Output machine-readable JSON
$ npx token-lint --json

================================================================================
3. MONITORED RULES
================================================================================
[HIGH] unbatched-llm-loop        LLM API calls inside iterative for/map loops
[MED]  missing-prompt-caching    System prompts >350 chars missing cache headers
[MED]  unpruned-json-payload     Raw JSON.stringify() in prompts without pruning
[LOW]  unbounded-max-tokens      Completions lacking an explicit max_tokens limit

================================================================================
4. FINANCIAL MODEL (PER 10,000 CALLS)
================================================================================
- Gemini 3.8 Flash: ~$0.75 per 1M input tokens
- GPT-4o-mini:      ~$0.15 per 1M input tokens
- Claude 3.7 Sonnet: ~$3.00 per 1M input tokens

License: MIT (c) 2026. Keep your token bills lean.
