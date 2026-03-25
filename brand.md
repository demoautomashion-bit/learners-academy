# Learners Academy: Brand Identity Guide

This document codifies the "Premium Editorial" design system for The Learners Academy. All future UI development must strictly adhere to these standards to maintain a world-class aesthetic.

## 1. Typography Pairings

| Role | Font Family | Usage |
| :--- | :--- | :--- |
| **Headings** | `Cormorant Garamond` | All H1-H6, Card Titles, Dialog Titles |
| **Body** | `Helvetica Neue` | Paragraphs, Inputs, Buttons, Generic Text |
| **Data/Tech**| `Geist Mono` | Access Codes, Timers, IDs (Strictly for data) |

## 2. Structural Hierarchy

| Element | Class / Size | Style Notes |
| :--- | :--- | :--- |
| **Page Title** | `text-4xl` | Primary anchor for every page. |
| **Section Title**| `text-xl` to `text-2xl` | Used in Card Headers / Dialogs. |
| **Editorial Label**| `text-xs` (uppercase) | `tracking-widest`, used for meta-data labels. |
| **Body Text** | `text-base` | Default readability level. |
| **Micro-Copy** | `text-sm` | Muted descriptions or metadata. |

## 3. Visual Language

- **Italic Usage**: Restricted to **direct quotes**, **AI justifications**, or **Editorial Meta**. Never used for functional labels or "no results" states.
- **Spacing**: Use **4xl** (`gap-8`) between major sections. Design must feel "breathable."
- **Contrast**: Use `text-muted-foreground` for non-critical information to keep the view focused.

## 4. Defined Color Palette (OKLCH)

| Identity | OKLCH Value | UI Role |
| :--- | :--- | :--- |
| **Primary Blue** | `oklch(0.62 0.17 240)` | Primary buttons, active icons, brand anchor. |
| **Accent Blue** | `oklch(0.70 0.14 240)` | Hover states, secondary highlights, charts. |
| **Success** | `oklch(0.70 0.17 160)` | Passed assessments, active status. |
| **Warning** | `oklch(0.78 0.18 75)` | Pending items, cautionary notices. |
| **Destructive** | `oklch(0.57 0.24 27)` | Errors, delete actions, sign out. |
| **Background** | `oklch(0.98 0.002 247)` | Premium, slightly cool off-white. |
| **Sidebar** | `oklch(0.25 0.05 240)` | Professional dark-navy deep contrast. |
