# AOS design system (code ↔ Figma)

This document mirrors what lives in code so a Figma library can use the same names and scales. Source of truth for colors is CSS variables in [`app/globals.css`](../app/globals.css); typography uses Tailwind utilities plus base heading styles in that file.

## Color tokens (light mode)

Colors are **HSL triplets** (no `hsl()` wrapper) consumed as `hsl(var(--token) / <alpha>)` via Tailwind. In Figma, create styles with the same semantic names; approximate hex below is for **light** `:root` only (`.dark` inverts for dark mode).

| Token | CSS variable | HSL components | Notes |
| --- | --- | --- | --- |
| background | `--background` | 0 0% 100% | Page canvas |
| foreground | `--foreground` | 222.2 84% 4.9% | Body text |
| card | `--card` | 0 0% 100% | Raised surfaces |
| card-foreground | `--card-foreground` | 222.2 84% 4.9% | Text on cards |
| primary | `--primary` | 222.2 47.4% 11.2% | Brand / key actions |
| primary-foreground | `--primary-foreground` | 210 40% 98% | Text on primary |
| secondary | `--secondary` | 220 14% 96% | Subtle fills |
| secondary-foreground | `--secondary-foreground` | 222.2 47.4% 11.2% | Text on secondary |
| muted | `--muted` | 220 14% 96% | Muted backgrounds |
| muted-foreground | `--muted-foreground` | 220 9% 46% | Captions, meta |
| accent | `--accent` | 220 14% 96% | Hover / selection |
| accent-foreground | `--accent-foreground` | 222.2 47.4% 11.2% | Text on accent |
| destructive | `--destructive` | 0 84.2% 60.2% | Errors, blocked |
| destructive-foreground | `--destructive-foreground` | 210 40% 98% | Text on destructive |
| border | `--border` | 220 13% 91% | Dividers, inputs |
| input | `--input` | 220 13% 91% | Input borders |
| ring | `--ring` | 222.2 84% 4.9% | Focus ring |

**StatusBadge** adds semantic greens/ambers on top of `outline` / `destructive` badge variants for roster and compliance (see [`components/ui/status-badge.tsx`](../components/ui/status-badge.tsx)).

## Typography

- **Font:** Inter via `next/font` → `--font-sans`, applied through Tailwind `font-sans`.
- **Base:** `body` uses `text-sm` / `leading-normal` in globals.
- **Semantic map (Tailwind):**

| Scale | Typical use |
| --- | --- |
| `text-xs` | Eyebrow labels, table meta, captions |
| `text-sm` | Body, descriptions, table cells |
| `text-base` | Card titles, emphasized body |
| `text-lg` | Section titles (style guide, secondary headings) |
| `text-xl` | Subpage titles |
| `text-2xl` / `text-3xl` | Page titles (`h1` in dashboards) |

Base element styles: `h1`–`h4` and `p` are set in `@layer base` in `globals.css` for unstyled headings; app pages still use explicit Tailwind classes for consistency.

## Spacing

Tailwind’s default **4px** scale: `gap-1` = 4px, `gap-4` = 16px, `p-6` = 24px, etc. App shells and dashboards standardize on **`gap-4`** between major vertical blocks and **`py-6` / `py-10`** for main padding inside the shell.

## Radius

`--radius: 0.5rem` (8px). Mapped to `rounded-md`, `rounded-lg` via shadcn theme extensions.

## Reusable components (Figma ↔ code)

| Name | Location | Role |
| --- | --- | --- |
| AppShell | `components/shell/app-shell.tsx` | Sidebar + mobile sheet + top bar |
| ShellNav | `components/nav/shell-nav.tsx` | Active-state sidebar links |
| Card, Button, Input, … | `components/ui/*` | shadcn primitives |
| StatusBadge | `components/ui/status-badge.tsx` | Booking / payment / compliance tones |
| ComplianceStatusBadge | same file | Binary compliance (e.g. non-compliant) |

**Page patterns:** section eyebrow + `h1` + description; `Card` > `CardHeader` / optional `Separator` / `CardContent`; data-dense views use `Table` inside `Card`.

## Internal QA

- Live component gallery: route **`/style-guide`** — source `app/(marketing)/style-guide/page.tsx` (marketing route, `noindex`).
