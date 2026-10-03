---
name: low-token-mode
description: Use this whenever doing a coding, web development, or game development task that involves creating or editing files (writing a script, building a web app, fixing a bug, adding a feature, working across multiple files). This skill cuts wasted token usage during coding sessions WITHOUT reducing code quality, completeness, comments, error handling, or explanation depth — it only removes redundant tool calls and redundant text. Always check this skill before starting any multi-step coding task, iterative debugging session, or any task involving create_file / str_replace / view on code files.
---

# Token-Efficient Coding

This skill makes coding sessions cheaper in tokens by cutting **redundant actions**, never by cutting **quality**. If a rule below would make the code worse, less complete, less safe, or less explained, that rule does not apply — quality always wins over savings.

## The 7 rules

1. **Don't reprint full file contents in chat.** After using `create_file` or `str_replace`, do not paste the whole file's code again in the chat response. The file itself (or artifact) is already viewable by the user. Only show code in chat if the user explicitly asks to see it, or if showing a short snippet is the clearest way to explain one specific change.

2. **Edit, don't rewrite.** When changing an existing file, use `str_replace` on the specific lines that need to change. Do not regenerate the entire file with `create_file` unless the changes are so extensive that a full rewrite is genuinely clearer/safer than multiple edits.

3. **Read only what's needed.** For large files, use `view` with a `view_range` instead of loading the whole file. Don't re-`view` a file that is already visible in the current conversation and hasn't been changed since.

4. **Summarize changes, don't restate them.** After writing or editing code, describe what changed in a few sentences instead of re-explaining or re-printing the code line by line. Save detailed walkthroughs for when the user asks "explain this" or "why did you do X."

5. **Avoid duplication inside the generated code itself — but only once it actually pays off.** For a small number of similar items (roughly 3-5, e.g. a handful of UI cards), plain repeated blocks are often just as short and more readable than a loop/config structure, so don't force abstraction there. Once the count is larger (roughly 6+ similar items — game objects, API routes, list entries, repeated components) or the items are likely to grow/change together, switch to a loop, function, or config-driven structure. Always match the style the codebase already uses. When unsure which is shorter, default to whichever is more readable, not whichever is shorter.

6. **Batch independent file edits.** When a task touches multiple independent files, plan out all the needed changes before starting, then make them in as few round trips as possible, rather than editing one file, re-viewing, editing another, re-viewing, etc.

7. **Don't restate the request at length.** Move directly into doing the work instead of opening with a long paraphrase of what the user asked for. A one-line acknowledgment is fine if natural.

## What this skill must NEVER do

These are hard boundaries — violating any of them to save tokens is a failure of this skill, not a success:

- Never shorten variable/function names, remove comments, or remove docstrings to save tokens.
- Never drop error handling, input validation, edge cases, or tests that the task calls for.
- Never reduce explanation depth when the user explicitly asks for an explanation, walkthrough, or "why."
- Never skip steps in multi-step debugging (e.g., skipping reproduction, root-cause analysis, or verification) just to finish faster.
- Never sacrifice correctness, readability, or completeness for brevity. If in doubt, prioritize quality and accept the extra tokens.

## Quick self-check before responding

- Am I about to paste code I just wrote/edited back into the chat unprompted? → Don't, unless asked.
- Am I about to `create_file` over a file I could `str_replace` instead? → Use `str_replace`.
- Am I about to `view` a file I've already seen unchanged? → Skip it.
- Am I about to explain code in more detail than the user asked for? → Trim to a short summary.
- Would any of the above cuts make the actual code or its correctness worse? → If yes, don't cut it.
