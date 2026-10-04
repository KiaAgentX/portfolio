# Kia Portfolio v1.0.0 â€” Official Desktop Release

First tagged release of the portfolio platform.

## Highlights

- **60 production projects** with **live previews (60/60)** and an in-site source viewer
- **Desktop app included** â€” `Kia-Portfolio-1.0.0-win-x64.exe` (portable, no install, full site bundled for offline use)
- **VALUATION.md** â€” independent triangulated valuation: fair value **~$758,565** (site claims $466,500 â€” deliberately conservative)
- Motion layer (GSAP + ScrollTrigger + Lenis), 5-sound procedural audio engine, PWA install, `Ctrl+K` command palette
- Performance pass: critical CSS inlining, deferred motion stack, zero third-party media payload
- **55 automated DOM checks green** Â· secret scan before every publish

## Install (Windows)

Download the `.exe` asset and run it â€” no installer, no admin rights needed.

## Links

- Full changelog: https://github.com/KiaAgentX/portfolio/blob/main/CHANGELOG.md
- Valuation: https://github.com/KiaAgentX/portfolio/blob/main/VALUATION.md
- Live site: https://kiaagentx.github.io/portfolio/
- Skills repo: https://github.com/KiaAgentX/skills

## Desktop install (split download)

The exe is split into 9 parts (20 MB each) so every piece survives unstable connections.

1. Download `Kia-Portfolio-1.0.0-win-x64.exe.001` … `.009` **plus** `reassemble.bat` into one folder.
2. Run `reassemble.bat` (double-click) — it rebuilds the exe and prints the expected SHA-256.
3. Run `Kia-Portfolio-1.0.0-win-x64.exe` — portable, offline, no admin rights.

Checksums: `SHA256.txt` · Details: `DESKTOP-README.txt`
