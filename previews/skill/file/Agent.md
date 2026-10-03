My hermes-agent CLI's /model picker only offers a small curated list of
OpenRouter models, and almost no free ones. I want access to every free
model that hermes can actually use, including OpenRouter's Free Models
Router (openrouter/free).

Here's how it works, so you don't have to rediscover it:

- The picker is NOT limited by my API key. It's a curated allowlist.
  hermes overlays a manifest (cached at ~/.hermes/cache/model_catalog.json)
  onto OpenRouter's live /api/v1/models, and drops any model that doesn't
  advertise tool-calling support.
- hermes supports a per-provider override:
  model_catalog.providers.openrouter.url in ~/.hermes/config.yaml.
  A local file:// URL works there — no hosting needed.
- IMPORTANT: the /model picker does NOT read that manifest directly. It
  reads a SEPARATE disk cache at ~/.hermes/provider_models_cache.json
  (1-hour TTL). If you don't clear it, my picker will keep showing the old
  list even after a restart, and you will wrongly think the fix worked.

Please:
1. Back up ~/.hermes/config.yaml first.
2. Query https://openrouter.ai/api/v1/models and find every model that is
   free (prompt and completion pricing both "0") AND lists "tools" in
   supported_parameters.
3. Write a schema-version-1 catalog manifest to
   ~/.hermes/model-catalog.local.json containing everything already in my
   cached manifest (same order, nothing dropped) plus those free models
   appended.
4. Point model_catalog.providers.openrouter.url at that file via file://.
5. Clear the stale picker cache with
   hermes_cli.models.clear_provider_models_cache(), then verify by calling
   hermes_cli.model_switch.list_authenticated_providers(max_models=200)
   from the hermes venv and reporting the OpenRouter model count and free
   count. Verify with THAT function specifically — do not verify with
   fetch_openrouter_models(force_refresh=True), because force_refresh
   bypasses the very cache the picker reads and will give a false pass.
6. Fail loudly if it didn't take. After clearing the cache, assert that the
   OpenRouter model count went UP and that 'openrouter/free' is in the list.
   If it did NOT, do not tell me it worked — the manifest almost certainly
   failed schema validation, and hermes silently falls back to the remote
   catalog instead of erroring. Check that "version" is the integer 1 (not
   the string "1"), that "providers" is an object, and that every model
   entry is an object with a non-empty string "id".

Do NOT disable the tool-calling filter. hermes requires tool calling, and a
model without it fails the instant I select it. Tell me how many free models
were genuinely unusable and excluded for that reason.

Finally: tell me to restart hermes (or run /model --refresh) to see the
change, and report the before/after model counts.

