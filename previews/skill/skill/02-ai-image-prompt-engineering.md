# Skill: AI Image Prompt Engineering

**Source:** 4PICTURE.md (GPT Image Prompt Library Vol.4)

## Core Techniques

### 1. Modular Prompt Anatomy
Every prompt follows this structure:
```
[Identity clause] → [Scene concept] → [Wardrobe/accessories] → [Lighting spec] → [Camera/lens spec] → [Quality tags] → [Face preservation rule] → [Avoid list]
```

### 2. Photography Vocabulary as Control Tokens
- **f-stops:** f/2 (shallow DOF), f/5.6 (medium), f/8 (deep)
- **Focal lengths:** 35mm (wide), 50mm (standard), 85mm (portrait), 105mm (macro)
- **Composition:** full-body, three-quarter, wide, close-up
- **Lighting:** rim light, key light, fill light, golden hour, overcast

### 3. Negative Prompting Discipline
- Always include `Avoid:` list at the end
- Specify what to prevent: artifacts, distortions, unwanted elements
- Example: `Avoid: blurry, low quality, extra fingers, watermark`

### 4. Thematic Series Design
- Constrain one variable (e.g., sunglasses type) while varying theme
- Create cohesive collections: COLOSSUS, GRAVITY OFF, OLD MASTERS, etc.
- "One strong idea per frame" principle

### 5. Series Naming Convention
- Evocative series names for thematic cohesion
- Consistent visual identity constraints across series
- 70/30 rule for recurring visual elements

## Application to Our Game
- Generate character concept art for NPCs/enemies
- Create environment mood boards for level design
- Generate UI/UX mockups for game menus
- Use photography vocabulary for in-game camera presets
