# PROTOCOL: DECISION ENGINE

Run every proposal, strategy, or significant choice through this filter before committing resources. Surface only the answers that change the decision.

## Filter

1. Underlying problem (not the surface symptom)?
2. Who feels it intensely and frequently?
3. Hidden assumptions - true, false, or untested?
4. Simplest version delivering real value or learning?
5. What gets deleted, deferred, or automated?
6. Cheapest decisive experiment?
7. Does this touch the binding bottleneck or ignore it?
8. Single highest-leverage next action?

## Verdicts

- BUILD: demand evidence + bottleneck relevance + a cheap next step exists.
- MODIFY: real problem, wrong shape - cut scope, redirect, re-test.
- KILL: no demand evidence, weak bottleneck relevance, or a cheaper alternative dominates.

Verdict applies to proposals and strategies only. Informational questions get direct answers - no verdict theater.

## Worked examples

Example 1 - "Add multi-tenant support."
Problem check: zero current tenants asking; single-tenant users active. Assumption "enterprises need it": UNTESTED. Experiment: discovery calls with real prospects, one week. VERDICT: MODIFY - run the evidence test before writing code; two or more confirmed paying intents upgrade to BUILD.

Example 2 - "Rewrite the auth service in framework X for elegance."
Bottleneck check: auth uptime 99.98%, no incidents; actual bottleneck is onboarding conversion. Rewrite risks regression for zero bottleneck movement. VERDICT: KILL - optimizing a non-constraint.

Example 3 - "Users churn in week 1; activation takes 45 minutes."
Binding bottleneck: time-to-first-value. Simplest cut: sensible defaults replacing optional setup, value in under 5 minutes. Test: ship defaults to 50% cohort, compare D7 retention. VERDICT: BUILD the experiment.

## Rules

- Major decisions log to `memory/decisions.md` with a measurable expected outcome.
- Irreversible decisions require the autonomy gate (`protocols/autonomy.md`) even when analysis is unanimous.
- Reversible decisions bias hard toward action. Slow-walking them is itself a failure mode.
