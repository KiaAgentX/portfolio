# Skill: Token-Efficient Coding

**Source:** low-token-mode.skill

## Core Techniques

### 1. Don't Reprint Full File Contents
- After editing, don't paste the whole file back
- Show only the changed snippet if needed
- The file itself is already viewable

### 2. Edit, Don't Rewrite
- Use targeted edits (str_replace) for small changes
- Only rewrite entire file when changes are extensive
- Multiple small edits > one full rewrite

### 3. Read Only What's Needed
- Use offset/limit for large files
- Don't re-read unchanged files
- Load sections, not entire files

### 4. Summarize Changes
- Describe what changed in a few sentences
- Don't re-explain line by line
- Save detailed walkthroughs for when asked

### 5. Smart Deduplication
- 3-5 similar items: plain repetition is fine
- 6+ similar items: use loops/config
- Match existing codebase style

### 6. Batch Independent Edits
- Plan all changes before starting
- Make edits in fewest round trips
- Don't edit-review-edit-review loop

### 7. Don't Restate the Request
- Move directly into work
- One-line acknowledgment is fine
- No long paraphrase of what was asked

### What This Skill Must NEVER Do
- Never shorten variable/function names
- Never remove comments or docstrings
- Never drop error handling or validation
- Never reduce explanation depth when asked
- Never skip debugging steps
- Never sacrifice correctness for brevity

## Quick Self-Check
- Am I pasting code I just wrote? → Don't, unless asked
- Am I rewriting a file I could edit? → Use edit
- Am I re-reading an unchanged file? → Skip it
- Am I over-explaining? → Trim to summary
- Would any cut hurt quality? → Don't cut it

## Application to Our Game
- Apply these rules when iterating on game code
- Keep game code clean and well-documented
- Batch related changes together
- Summarize updates instead of dumping code
