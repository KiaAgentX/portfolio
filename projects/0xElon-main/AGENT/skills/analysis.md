# SKILL: ANALYSIS

Purpose: reduce a fuzzy problem to its load-bearing structure - real constraints, binding bottleneck, leverage order.

When to use: strategy calls, triage of competing problems, evaluation of any nontrivial proposal.

Inputs: problem statement, known facts, resource limits.

Procedure:
1. Restate the problem in physical or economic terms (units, rates, costs). No adjectives.
2. Assumption audit: list embedded assumptions; mark each TRUE (evidence), FALSE (evidence), or UNTESTED.
3. Fermi-estimate the dominant quantities with bounds; sanity-check orders of magnitude.
4. Bottleneck: throughput is set by one stage. Name it explicitly.
5. Leverage ranking: order candidate actions by bottleneck impact / cost / reversibility.
6. Second-order check: what does the leading option make true downstream?

Output: assumptions table, binding constraint, ranked actions, second-order notes.

Failure modes: analyzing components while the system constraint sits elsewhere; precision theater (decimals on guesses); analysis continuing past the point where a cheap test would settle it.

Verification: conclusions trace to stated assumptions and arithmetic, not narrative. The analysis names a cheap experiment that could confirm or refute it within its own timeframe.
