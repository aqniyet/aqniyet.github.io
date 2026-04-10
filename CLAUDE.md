# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio site for Akniyet Tulakbayev, hosted on GitHub Pages at aqniyet.com. Static single-page site with no build tools, bundlers, or package manager.

## Development

No build step. Open `index.html` in a browser or use any static file server (e.g., `python -m http.server`). All assets are loaded from CDN or local files.

## Architecture

Single-page portfolio with four sections (hero, capabilities, RailClerk case study, contact) in `index.html`. All styling in `css/style.css`, all behavior in `js/main.js`.

### Design Language: Engineered Editorial
Warm paper palette with serif display + monospace body. Reads like a well-typeset technical report. Not brutalist, not generic SaaS landing page. Ruled lists and spec tables instead of card grids.

### CDN Dependencies (loaded in index.html)
- **GSAP 3.12.5 + ScrollTrigger** — scroll-driven reveals, divider animations, counter sequences
- **Google Fonts** — Instrument Serif (400, 400 italic) for display, JetBrains Mono (400/500/700) for body

### CSS Design System
Key custom properties in `:root`:
- Paper: `--c-paper: #F3ECE1` (warm parchment), `--c-paper-light: #FAF6F0`
- Ink: `--c-ink: #1C1917` (warm near-black), `--c-ink-mid: #57534E`, `--c-ink-light: #A8A29E`
- Accent: `--c-rust: #B8450F` (burnt orange, used for section labels, dividers, active states)
- Dark section: `--c-dark: #1C1917` (contact section inverted)
- Two font families: `--ff-display` (Instrument Serif) and `--ff-mono` (JetBrains Mono)
- Borders are `1px solid var(--c-ink-faint)` — thin ruled lines, not thick
- SVG noise grain overlay on `body::after` at 2.5% opacity

### JS Structure (single IIFE in main.js)
Init order:
1. Nav (mobile hamburger toggle)
2. Hero (sequential GSAP timeline: eyebrow, name scramble, portrait fade, subtitle, rule draw, meta)
3. Dividers (rust-colored lines that draw left-to-right on scroll)
4. ScrollTrigger batch reveals (`.reveal` class, `translateY(12px)`)
5. Case study (title scramble, spec rows stagger with `x: -8` slide-in)
6. Contact headline scramble

### Key Layouts
- **Capabilities**: Ruled list with 3-column grid rows (index | name | description), NOT card grid
- **Modules ("What I Built")**: Spec table with 2-column grid rows (name | description), NOT card grid
- **Contact**: Inverted dark section with ruled list of links, NOT card grid
- All list rows use hover indent (`padding-left: 12px` or `16px`) + background tint

### Resume Pages
`resume.html`, `resume_en.html`, `resume_ru.html`, `resume_systems.html` are **self-contained** with inline styles. Keep them independent for print compatibility.

## Key Conventions

- **Instrument Serif** (italic) for display: hero name, case title, contact headline, stat numbers, section numbers, capability indices
- **JetBrains Mono** for everything else: nav, labels, body text, spec names, tags
- Scramble text effect on hero name (page load), case title (scroll), contact headline (scroll) — uses lowercase charset
- Portrait SVG displayed with `sepia + grayscale + multiply blend` to match warm palette, 25% opacity
- Dividers between sections are rust-colored 1px lines animated with `scaleX`
- Hover on list rows: indent + `--c-rust-dim` background tint
- Contact section has warm dark background, cream text, rust accent on hover
- Mobile breakpoint: 768px (portrait hidden, lists go single-column, contact rows stack)
