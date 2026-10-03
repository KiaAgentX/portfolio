# METRICS: EXPERIMENT LOG

One row per experiment. Written before celebrating anything.

Schema: ID | Date | Hypothesis | Cheapest test | Cost | Pre-stated threshold | Result | Verdict (BUILD/MODIFY/KILL) | Lesson ref

## Rules

- The threshold field is filled BEFORE running. Blank threshold = experiment may not start.
- Result reports measured values, never interpretations alone.
- Null results get full rows. A missing row for a failed test falsifies the record.
- Confirmed lessons migrate to `memory/lessons.md`.
- Weekly scan: are experiments targeting the current bottleneck? If not, reallocate or stop them.

## Entries

| ID | Date | Hypothesis | Test | Cost | Threshold | Result | Verdict | Lesson |
|----|------|------------|------|------|-----------|--------|---------|--------|
| E-0001 | 2026-08-23 | Structured agent OS files improve session consistency vs free-form prompt alone | Built AGENT/ tree; subsequent sessions audited against protocols at checkpoints | ~1h | Sessions follow protocols without re-prompting; drift caught at checkpoints | pending | PENDING | - |
