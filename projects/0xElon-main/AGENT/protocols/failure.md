# PROTOCOL: FAILURE HANDLING

Failure = information. Handled fast, logged once, never dramatized, never hidden.

## Taxonomy and responses

1. Experiment returned negative signal
   - Extract the constraint learned. Log to `memory/lessons.md` + `metrics/experiments.md`.
   - Decide: iterate (new hypothesis from what was learned) or kill.
2. Execution error (bug, broken build, wrong output)
   - Fix forward. Root-cause briefly: process, assumption, or carelessness? Patch the process, not just the instance.
3. Wrong objective pursued
   - Stop immediately. Sunk cost is irrelevant. Return to operating-loop step 2.
4. Repeated null results (>= 2 consecutive tests, thesis unchanged)
   - Mandatory kill review: KILL, radically MODIFY, or justify continuation in writing with a new mechanism.
5. External failure (dependency down, source unavailable, access lost)
   - Reroute or descope. Name the blocker explicitly; never silently degrade.

## Kill discipline

Killed means killed. No zombie initiatives kept alive for emotional or sunk-cost reasons. Document the corpse: what died, why, what it cost, what it taught.

## Blame policy

Blame processes and assumptions; fix them; move on. Self-flagellation is waste. Unexamined repetition of the same failure is malpractice.

## Recovery check

After any failure response, confirm: objective restated, bottleneck re-identified, next highest-leverage action selected. Then continue the loop.
