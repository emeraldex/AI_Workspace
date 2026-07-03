# Forge AI Workspace — Phase 7: UI Design System

---

## 1. Objectives

Define the complete visual language — color tokens, typography scale, spacing system, component patterns, dark mode strategy, animation principles, and accessibility standards — that every frontend component is built on. This is the single source of truth for all UI decisions.

---

## 2. Design Decisions

| Decision | Rationale |
|---|---|
| shadcn/ui as component foundation | Unstyled, accessible, copy-owned components — no black-box library lock-in |
| CSS custom properties for tokens | Runtime theme switching without JS; works with Tailwind and shadcn natively |
| Dark mode as default | Developer/technical audience strongly prefers dark; light mode fully supported |
| HSL color format | Easier to reason about lightness/saturation adjustments across themes |
| Tailwind for utility styling | Consistent spacing, sizing, and responsive design without custom CSS sprawl |
| Radix UI primitives (via shadcn) | Accessible, unstyled, keyboard-navigable primitives for all interactive components |

---

## 3. Color System

All colors defined as CSS custom properties in HSL. Tailwind config references these variables.

### 3.1 Semantic Color Tokens

```css
/* apps/frontend/src/index.css */

@layer base {
  :root {
    /* Background */
    --background:         0 0% 100%;
    --background-subtle:  0 0% 97%;

    /* Foreground / Text */
    --foreground:         224 71% 4%;
    --foreground-muted:   215 16% 47%;

    /* Surface (cards, panels) */
    --surface:            0 0% 100%;
    --surface-raised:     0 0% 98%;
    --surface-overlay:    0 0% 96%;

    /* Border */
    --border:             214 32% 91%;
    --border-strong:      214 32% 80%;

    /* Brand / Primary */
    --primary:            221 83% 53%;
    --primary-foreground: 210 40% 98%;
    --primary-hover:      221 83% 47%;

    /* Secondary */
    --secondary:          210 40% 96%;
    --secondary-foreground: 222 47% 11%;

    /* Accent */
    --accent:             262 83% 58%;
    --accent-foreground:  210 40% 98%;

    /* Semantic states */
    --success:            142 71% 45%;
    --success-foreground: 0 0% 100%;
    --warning:            38 92% 50%;
    --warning-foreground: 0 0% 100%;
    --destructive:        0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --info:               199 89% 48%;
    --info-foreground:    0 0% 100%;

    /* Input */
    --input:              214 32% 91%;
    --ring:               221 83% 53%;

    /* Radius */
    --radius:             0.5rem;
  }

  .dark {
    /* Background */
    --background:         224 71% 4%;
    --background-subtle:  223 47% 7%;

    /* Foreground / Text */
    --foreground:         213 31% 91%;
    --foreground-muted:   215 16% 57%;

    /* Surface */
    --surface:            222 47% 7%;
    --surface-raised:     223 47% 11%;
    --surface-overlay:    222 47% 14%;

    /* Border */
    --border:             216 34% 17%;
    --border-strong:      216 34% 25%;

    /* Brand / Primary */
    --primary:            217 91% 60%;
    --primary-foreground: 222 47% 4%;
    --primary-hover:      217 91% 66%;

    /* Secondary */
    --secondary:          222 47% 11%;
    --secondary-foreground: 210 40% 98%;

    /* Accent */
    --accent:             262 83% 68%;
    --accent-foreground:  222 47% 4%;

    /* Semantic states */
    --success:            142 71% 45%;
    --success-foreground: 0 0% 100%;
    --warning:            38 92% 50%;
    --warning-foreground: 0 0% 100%;
    --destructive:        0 63% 55%;
    --destructive-foreground: 0 0% 100%;
    --info:               199 89% 48%;
    --info-foreground:    0 0% 100%;

    /* Input */
    --input:              216 34% 17%;
    --ring:               217 91% 60%;
  }
}
```

### 3.2 Priority & Status Colors

```typescript
// shared/lib/constants.ts

export const PRIORITY_COLORS = {
  LOW:    'text-slate-400  bg-slate-400/10  border-slate-400/20',
  MEDIUM: 'text-blue-400   bg-blue-400/10   border-blue-400/20',
  HIGH:   'text-orange-400 bg-orange-400/10 border-orange-400/20',
  URGENT: 'text-red-400    bg-red-400/10    border-red-400/20',
} as const

export const STATUS_COLORS = {
  TODO:        'text-slate-400  bg-slate-400/10',
  IN_PROGRESS: 'text-blue-400   bg-blue-400/10',
  IN_REVIEW:   'text-purple-400 bg-purple-400/10',
  DONE:        'text-green-400  bg-green-400/10',
  CANCELLED:   'text-slate-500  bg-slate-500/10  line-through',
} as const
```

---

## 4. Typography Scale

```typescript
// tailwind.config.ts — typography extension

fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
}

fontSize: {
  xs:    ['0.75rem',  { lineHeight: '1rem' }],
  sm:    ['0.875rem', { lineHeight: '1.25rem' }],
  base:  ['1rem',     { lineHeight: '1.5rem' }],
  lg:    ['1.125rem', { lineHeight: '1.75rem' }],
  xl:    ['1.25rem',  { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem',   { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
}
```

**Usage rules:**
- Page titles: `text-2xl font-semibold`
- Section headings: `text-lg font-medium`
- Body text: `text-sm` (default throughout app)
- Captions / metadata: `text-xs text-muted-foreground`
- Code / monospace: `font-mono text-sm`

---

## 5. Spacing & Layout System

Tailwind's default 4px base scale is used throughout. Key layout values:

| Token | Value | Usage |
|---|---|---|
| Sidebar width | `w-60` (240px) | Fixed sidebar |
| Sidebar collapsed | `w-14` (56px) | Icon-only mode |
| Header height | `h-14` (56px) | Top navigation bar |
| Page padding | `px-6 py-6` | Content area padding |
| Card padding | `p-4` | Standard card inner padding |
| Section gap | `gap-4` / `gap-6` | Between major sections |
| Form field gap | `gap-3` | Between form inputs |
| Border radius | `rounded-lg` (8px) | Cards, modals, inputs |
| Border radius sm | `rounded-md` (6px) | Buttons, badges |

---

## 6. Component Patterns

### 6.1 Layout Shell

```
┌─────────────────────────────────────────────────────┐
│  Header (h-14) — Logo, Search, Notifications, User  │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│   Sidebar    │         Page Content                 │
│   (w-60)     │         (flex-1, overflow-y-auto)    │
│              │                                      │
│  Nav items   │                                      │
│  with icons  │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

### 6.2 Core Component Specifications

**Button variants:**
```
default     — primary filled, used for primary actions
secondary   — subtle background, secondary actions
outline     — border only, tertiary actions
ghost       — no background, icon buttons and nav items
destructive — red, destructive actions only
```

**Badge variants:**
```
default     — primary color
secondary   — muted
outline     — border only
success     — green
warning     — orange
destructive — red
```

**Card anatomy:**
```tsx
<Card>                          // surface background, border, rounded-lg, shadow-sm
  <CardHeader>                  // p-4 pb-2
    <CardTitle />               // text-sm font-medium
    <CardDescription />         // text-xs text-muted-foreground
  </CardHeader>
  <CardContent>                 // p-4 pt-0
    {children}
  </CardContent>
</Card>
```

**Form field pattern:**
```tsx
<FormField>
  <Label />                     // text-sm font-medium mb-1.5
  <Input />                     // h-9, text-sm, border, rounded-md
  <FormMessage />               // text-xs text-destructive mt-1
</FormField>
```

### 6.3 Sidebar Navigation Items

```
Active state:   bg-primary/10 text-primary font-medium rounded-md
Hover state:    bg-surface-overlay rounded-md
Default state:  text-foreground-muted
Icon size:      h-4 w-4
Item height:    h-9
Item padding:   px-3
```

### 6.4 Data States

Every data-fetching component must handle all four states:

| State | Treatment |
|---|---|
| Loading | Skeleton with matching layout shape |
| Empty | Illustrated empty state with CTA |
| Error | Error card with retry action |
| Success | Content rendered |

---

## 7. Dark Mode Strategy

- Default theme: `dark`
- Toggle: stored in `UserSettings.theme` (LIGHT / DARK / SYSTEM)
- Implementation: `class` strategy on `<html>` element
- On load: read from user settings → apply class before first paint (no flash)

```typescript
// app/providers.tsx — theme application
const applyTheme = (theme: Theme) => {
  const root = document.documentElement
  const isDark =
    theme === 'DARK' ||
    (theme === 'SYSTEM' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.classList.toggle('dark', isDark)
}
```

---

## 8. Animation & Motion

Minimal, purposeful motion only. No decorative animations.

| Interaction | Animation |
|---|---|
| Modal open/close | `fade + scale` 150ms ease-out |
| Sidebar collapse | `width` transition 200ms ease-in-out |
| Toast appear | `slide-in-from-right` 200ms |
| Skeleton pulse | `pulse` 2s infinite |
| Page transition | none (instant) |
| Dropdown open | `fade + slide-down` 100ms |
| Button press | `scale-95` 100ms |

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; }
}
```

---

## 9. Iconography

Library: **Lucide React** — consistent stroke-based icon set.

```typescript
// Standard icon sizes
sm:   className="h-3.5 w-3.5"   // inline text icons
base: className="h-4 w-4"       // default (nav, buttons)
lg:   className="h-5 w-5"       // feature headers
xl:   className="h-6 w-6"       // empty states, illustrations
```

All icons paired with visible labels or `aria-label` — never icon-only without accessible text.

---

## 10. Tailwind Configuration

```typescript
// apps/frontend/tailwind.config.ts

import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        surface:     'hsl(var(--surface))',
        border:      'hsl(var(--border))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--surface-overlay))',
          foreground: 'hsl(var(--foreground-muted))',
        },
        input: 'hsl(var(--input))',
        ring:  'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config
```

---

## 11. Accessibility Standards

| Requirement | Implementation |
|---|---|
| Color contrast | All text meets WCAG AA (4.5:1 normal, 3:1 large) |
| Focus indicators | `ring-2 ring-ring ring-offset-2` on all focusable elements |
| Keyboard navigation | All interactive elements reachable via Tab; logical focus order |
| Screen reader labels | `aria-label` on icon buttons; `aria-describedby` on form fields |
| Modal focus trap | Radix Dialog handles focus trap and restoration natively |
| Live regions | Toast notifications use `role="status"` or `role="alert"` |
| Skip link | `Skip to main content` link as first focusable element |

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| Theme flash on load | Theme class applied in `<head>` script before React hydration |
| shadcn component customization drift | All customizations documented; shadcn components owned in `shared/ui/` |
| Inconsistent spacing across features | Tailwind design tokens enforced; no arbitrary pixel values |
| Accessibility regressions | axe-core integrated into Playwright E2E suite |

---

## 13. Deliverables

- [x] Full CSS custom property token system (light + dark)
- [x] Priority and status color constants
- [x] Typography scale and usage rules
- [x] Spacing and layout system
- [x] Core component specifications
- [x] Dark mode strategy and implementation
- [x] Animation principles with reduced-motion support
- [x] Iconography standards
- [x] Complete Tailwind configuration
- [x] Accessibility standards

---

## 14. Updated Project Backlog

| Status | Item |
|---|---|
| ✅ Complete | Phase 1 — PRD |
| ✅ Complete | Phase 2 — Functional Requirements |
| ✅ Complete | Phase 3 — Non-functional Requirements |
| ✅ Complete | Phase 4 — System Architecture |
| ✅ Complete | Phase 5 — Database Design |
| ✅ Complete | Phase 6 — Folder Structure |
| ✅ Complete | Phase 7 — UI Design System |
| ⏳ Pending | Phase 8 — API Design |
| ⏳ Pending | Phase 9 — Authentication |
| ⏳ Pending | Phase 10 — Backend Development |
| ⏳ Pending | Phase 11 — Frontend Development |
| ⏳ Pending | Phase 12 — AI Integration |
| ⏳ Pending | Phase 13 — Testing |
| ⏳ Pending | Phase 14 — DevOps |
| ⏳ Pending | Phase 15 — Deployment |
| ⏳ Pending | Phase 16 — Optimization |
| ⏳ Pending | Phase 17 — Documentation |
