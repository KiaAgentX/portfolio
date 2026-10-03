# Skill: RTL Text Formatting

**Source:** SKILL.md (RTL/Farsi Formatting Guide)

## Core Techniques

### 1. Unicode Bidirectional Control Characters
- **RLM (U+200F):** Right-to-Left Mark — forces RTL direction
- **LRM (U+200E):** Left-to-Right Mark — forces LTR direction
- Use invisible characters for layout control without visual changes

### 2. Base Direction Anchoring
- Force paragraph direction regardless of first visible character
- Append RLM after numbers/punctuation at end of RTL lines
- Prevents reordering artifacts in mixed-direction text

### 3. Inline Code as LTR Isolation
- Wrap English tokens in backticks to prevent reordering
- `code` blocks act as LTR islands in RTL text
- Essential for technical terms in Persian prose

### 4. Block Separation Principle
- Keep code/technical content on separate lines from RTL prose
- Never mix inline code with RTL text in same line
- Use blank lines between code blocks and Persian text

### 5. Pre-Send Quality Checklist
- [ ] Numbers appear in correct order (not reversed)
- [ ] English words in backticks render LTR
- [ ] Punctuation at line end doesn't break layout
- [ ] Mixed paragraphs have consistent direction
- [ ] Code blocks are properly isolated

## Application to Our Game
- Render Persian UI text correctly in game menus
- Handle bidirectional text in chat systems
- Implement RTL layout for Persian game interface
- Use Unicode control characters for text alignment
