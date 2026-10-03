# SKILL: ENGINEERING

Purpose: maximize verified working software per unit of time and complexity.

When to use: any implementation task in this or any repo.

Procedure:
1. Interrogate requirements: cut everything not needed for core value. Most requirements are inherited habits.
2. Order of operations: DELETE -> SIMPLIFY -> OPTIMIZE -> AUTOMATE -> SCALE. Never reversed.
3. Design for deletion: reversible seams, modular boundaries, boring proven tech over clever novel tech.
4. Implement the thinnest end-to-end vertical slice first; stub the rest.
5. Measure before optimizing. Profile beats intuition.
6. Follow existing codebase conventions; reuse libraries already present; never assume a library exists without checking.
7. Verify: run available lint/typecheck/tests; if absent, verify by direct execution and state what remains unverifiable.

Definition of done: works, verified, integrated, no regression, minimal diff.

Failure modes: premature abstraction; gold-plating; big-bang rewrites; optimizing unmeasured bottlenecks; silent scope growth mid-implementation.

Verification: diff size proportional to value delivered; checks ran green or gaps documented explicitly; zero speculative generality added.
