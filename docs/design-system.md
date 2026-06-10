# Design System

## Typography System
- **Display & Headings:** Arial / Helvetica / Sans-Serif (`--font-serif`). Used for h1-h6, card titles, and dialog headers.
- **Body & UI:** Arial / Helvetica / Sans-Serif (`--font-sans`). Used for all body text, buttons, labels, and standard UI controls.

## Font Hierarchy
- **H1:** 3xl-4xl, tight line-height, Sans-Serif, medium-semibold.
- **H2:** 2xl-3xl, tight line-height, Sans-Serif, medium-semibold.
- **H3:** xl-2xl, snug line-height, Sans-Serif, medium-semibold.
- **Body Base:** text-base, normal line-height, Sans-Serif, medium.
- **Label / Micro:** 0.75rem (text-xs), uppercase tracking-widest, Semibold, Sans-Serif.

## Color System
- **Primary:** `oklch(0.62 0.17 240)` (#1d8ae2)
- **Background (Light/Dark):** `oklch(0.985 0.002 247)` / `oklch(0.12 0.02 250)`
- **Semantic:** 
  - Destructive: `oklch(0.577 0.245 27.325)`
  - Success: `oklch(0.70 0.17 160)`
  - Warning: `oklch(0.78 0.18 75)`
- **Card/Popover:** Absolute white `oklch(1 0 0)` or deep dark `oklch(0.16 0.02 250)`

## Spacing Scale
- **Base Unit:** 4px (0.25rem). 
- **Fluid Patterns:** Use `.p-fluid` (p-4 sm:p-6 md:p-8) and `.gap-fluid` (gap-4 sm:gap-6 md:gap-8) for responsive padding/gaps.

## Border Radius Scale
- **Standard Base:** `--radius` = `0.625rem` (10px).
- **sm:** `calc(var(--radius) - 4px)` (6px)
- **md:** `calc(var(--radius) - 2px)` (8px)
- **lg:** `var(--radius)` (10px)
- **xl:** `calc(var(--radius) + 4px)` (14px)

## Shadow System
- **Premium Default:** `0 2px 4px oklch(0 0 0 / 0.02), 0 4px 8px oklch(0 0 0 / 0.02), 0 8px 16px oklch(0 0 0 / 0.02)`
- **Premium Large:** `0 10px 20px oklch(0 0 0 / 0.04), 0 20px 40px oklch(0 0 0 / 0.04), 0 30px 60px oklch(0 0 0 / 0.04)`

## Glassmorphism Rules
- **glass-1:** `blur(8px) saturate(150%)`, bg alpha `0.4`
- **glass-2:** `blur(16px) saturate(180%)`, bg alpha `0.6`
- **glass-3:** `blur(24px) saturate(200%)`, bg alpha `0.8`

## Animation System
- **Hover Lift:** `.hover-lift` (translateY -3px, shadow-premium-lg).
- **Premium Transition:** `all 0.3s cubic-bezier(0.23, 1, 0.32, 1)`.

---
STRICT RULES:
1. NEVER use generic colors outside OKLCH variables.
2. NEVER mix Serif and Sans-Serif roles.
3. ALL interactive elements MUST implement tactile feedback (`.hover-lift` or basic scale transition).
4. DO NOT manually override standard border radii.
