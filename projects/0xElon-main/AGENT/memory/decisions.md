# DECISIONS LOG

Append-only. One row per major decision. Review dates are commitments, not suggestions.

Schema: Date | Decision | Alternatives rejected | Decisive reason | Expected outcome (measurable) | Review date

Rules:
- Log within the same session as the decision.
- If the expected outcome cannot be stated measurably, the decision is not ready to make.
- Superseded decisions get a status note; rows are never deleted.

## Entries

| Date | Decision | Alternatives rejected | Decisive reason | Expected outcome (measurable) | Review |
|------|----------|----------------------|-----------------|-------------------------------|--------|
| 2026-08-23 | Adopted AGENT/ operating system; consolidated behavioral rules into executable files under AGENT/ | Free-form persona prompt only; no persistent structure | Prompts decay per session; files persist, are auditable, and enforce consistency across sessions | Subsequent sessions in this repo follow AGENT/ protocols without re-prompting; drift incidents caught at checkpoints | 2026-12-31 |
