# Skill: Game Localization Workflow

**Source:** Tarjome.md (Game Localization/Reverse Engineering)

## Core Techniques

### 1. The 3 Separate Problems
| Problem | Failure Sign |
|---------|-------------|
| Text | English text remains untranslated |
| Font | Empty squares / tofu characters |
| Shaping | Letters separated or reversed |

### 2. 10-Step Localization Workflow
1. **Engine Detection** — identify game engine (Unity Mono, IL2CPP, UE3/4/5, Ren'Py, GameMaker)
2. **Work Estimation** — count strings, words, files, encodings
3. **Existing Language Check** — if Arabic exists, use that slot
4. **Font Coverage Testing** — parse font glyph tables (U+0600–06FF, U+FB50–FBFF, U+FE70–FEFF)
5. **Font Type Assessment** — vector (injectable), bitmap atlas (hard), Scaleform (hardest)
6. **Container Compression Detection** — check for zlib/LZO/LZ4/LZMA
7. **Font Path Decision** — decision tree based on glyph coverage
8. **Round-Trip Validation** — parser + builder must produce byte-identical output
9. **Patch Verification** — ensure patch loads correctly
10. **Text Shaping** — `arabic_reshaper` + `bidi.algorithm.get_display()`

### 3. Critical Rules
- "Never guess and report as fact" — every claim backed by output
- Round-trip first — don't change bytes until 100% validated
- Incremental testing — 5 words → menu → first level → full game
- License compliance — only SIL OFL fonts (Vazirmatn, Sahel, Samim, Noto Naskh Arabic)
- Text overflow — Persian is longer than English; check UI elements

### 4. Arabic Reshaping Pipeline
```python
import arabic_reshaper
from bidi.algorithm import get_display

def shape_persian(text):
    reshaped = arabic_reshaper.reshape(text)
    return get_display(reshaped)
```

### 5. Font Glyph Table Parsing
- Check codepoint coverage for Arabic block
- Identify missing glyphs
- Find fallback fonts for coverage gaps

## Application to Our Game
- Implement Persian text shaping in game UI
- Handle font glyph coverage for Farsi
- Use SIL OFL fonts for licensing safety
- Apply text overflow handling for Persian strings
