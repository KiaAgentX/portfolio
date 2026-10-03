---
name: rtl-farsi
description: Use this whenever a reply contains Persian/Farsi (or mixed Persian + English/technical) text. It explains how to format the message so right-to-left and left-to-right runs render correctly in the terminal / Markdown view instead of getting visually scrambled. Trigger when the user writes in Persian, asks for Persian output, or the answer mixes Persian prose with English words, file paths, commands, numbers, versions, or URLs.
---

# Writing correct RTL/LTR (Persian + English)

Replies render as GitHub-flavored Markdown in the terminal. The browser applies
the Unicode Bidi Algorithm **per line/paragraph**. A line's base direction is
guessed from its first strong character, so a Persian line that *starts* with an
English token (a path, `code`, a number) is wrongly treated as LTR and the
Persian part jumps around. The opposite also happens: punctuation and numbers at
the end of a Persian line "teleport" to the wrong side.

Goal: every line reads in the correct direction, and embedded opposite-direction
runs (English inside Persian, or Persian inside English) stay put.

## Core rules

1. **One direction intent per line.** Decide each line's base direction by its
   dominant language. If a line contains **any** Persian, it is an **RTL line**.
   Pure English/technical lines are LTR.

2. **Anchor the base direction with an invisible mark at the START of the line:**
   - RTL line → start with **RLM** `U+200F` (the char `‏`).
   - LTR line → start with **LRM** `U+200E` (the char `‎`).
   This forces the paragraph's base direction regardless of the first visible
   character, so "‏zip شد" is laid out RTL even though it starts with "z".

3. **Isolate embedded LTR tokens inside Persian** so they don't reorder the line:
   - Prefer wrapping them in **inline code**: paths, commands, flags, versions,
     identifiers → `` `e:\path\file.js` ``, `` `npm run dist` ``, `` `v1.2.2` ``.
     A code span is a self-contained LTR unit and is the safest fix.
   - For Markdown links, the `[text](url)` syntax already isolates the URL; keep
     the visible `text` in the line's language.
   - If you can't use code/links, bracket the English run with LRM marks:
     `‎English‎`.

4. **Trailing numbers / punctuation on a Persian line.** When an RTL line ends
   with a number, `code`, or ASCII punctuation (`.`, `:`, `!`, `)`), append an
   **RLM** `‏` right after it so it stays on the correct (left) side.

5. **Keep blocks clean.** Put multi-token technical content (commands, paths,
   logs, code) on **their own lines** or in fenced ``` blocks ```, separated from
   Persian prose. Fenced code is always LTR and never mixes with RTL prose.

6. **Lists & tables:** start each Persian bullet / cell with RLM; keep each
   cell's content language-consistent when possible.

## Quick checklist before sending a Persian reply

- [ ] Does any Persian line start with English / a number / `code`? → prepend RLM `‏`.
- [ ] Are paths, commands, versions, URLs wrapped in `` `code` `` or links?
- [ ] Does any RTL line end with a number or punctuation? → append RLM `‏`.
- [ ] Is standalone code/log on its own line or in a fenced block?

## Examples

**Bad** (English-first Persian line, bare path, trailing version):

```
zip شد
فایل رو از release/app.exe نصب کن نسخه 1.2.2
```

**Good** (RLM anchors, isolated tokens):

```
‏zip شد‏
‏فایل رو از `release/app.exe` نصب کن، نسخه `1.2.2`‏
```

**Bad** (Persian sentence with an English word in the middle):

```
این تابع state رو آپدیت می‌کنه.
```

**Good** (isolate the LTR word, anchor the line):

```
‏این تابع `state` رو آپدیت می‌کنه.‏
```

## Notes

- RLM/LRM are zero-width and invisible — they only affect layout, never the
  visible text, copy/paste content, or meaning.
- When in doubt, **wrap the LTR token in backticks**; it fixes the majority of
  cases on its own.
- This applies to chat replies. It does not change project code unless the user
  asks for RTL handling inside an app.
