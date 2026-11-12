---
name: Executive Intelligence
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#684000'
  on-tertiary: '#ffffff'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system establishes a high-density, analytical aesthetic tailored for enterprise leaders, executive teams, and cross-functional operators. The interface conveys intellectual rigor, institutional credibility, and immediate clarity. It transforms complex conversational graphs, transcripts, and cross-meeting action items into clean, decisive knowledge artifacts.

The aesthetic merges **Corporate / Modern** precision with architectural **Minimalism**:
- **Clarity over decorative flourish**: Visual structures step backward, allowing multi-speaker dialogue hierarchies, key decision nodes, and evidence trails to command attention.
- **Cognitive comfort**: Controlled contrast ratios prevent visual fatigue during prolonged executive reviews and deep analytical sessions.
- **Confidence and structure**: The aesthetic communicates executive-grade reliability through structural 1px gridlines, razor-sharp typographic alignment, restrained elevation steps, and semantic telemetry states.

## Colors
The palette balances an airy slate environment with deep navy contrast and focused semantic accents.

### Palette Architecture
- **Primary (`#4f46e5`, secondary brand step `#6366f1`)**: Represents machine intelligence, graph connections, primary calls to action, and interactive node highlights.
- **Secondary (`#0d9488`, accent step `#10b981`)**: Signals validated outcomes, signed-off action items, consensus agreements, and verified transcript evidence.
- **Tertiary (`#f59e0b`)**: Highlights pending ownership, unresolved decisions, ambiguous sentiment, and awaiting approvals.
- **Destructive / Alert (`#e11d48`)**: Denotes agenda blockers, speaker pushback, executive conflicts, and SLA breaches.
- **Neutrals & Surfaces**:
  - `canvas-bg`: `#f8fafc` (Slate 50)
  - `canvas-subtle`: `#f1f5f9` (Slate 100)
  - `surface-card`: `#ffffff` (Pure White)
  - `border-subtle`: `#e2e8f0` (Slate 200)
  - `border-strong`: `#cbd5e1` (Slate 300)
  - `text-primary`: `#0f172a` (Slate 900)
  - `text-secondary`: `#475569` (Slate 600)
  - `text-muted`: `#94a3b8` (Slate 400)

### Application Rules
- Pure white cards must sit directly on slate canvas backgrounds to define analytical sections without high contrast starkness.
- Use 1px borders in `#e2e8f0` as the primary boundary mechanism; avoid heavy dark borders.
- Keep semantic colors (emerald, amber, crimson) isolated to pill badges, status dots, metric indicators, and graph node borders to maintain an executive demeanor.

## Typography
The system employs `Inter` universally across headlines, body copy, and UI controls for maximum systematic alignment and legibility in dense enterprise spaces. `JetBrains Mono` is reserved exclusively for meeting timestamps, latency counters, audio confidence percentages, and transcript speaker IDs.

### Typographic Hierarchy
- **Executive Titles (`display-lg`, `headline-lg`)**: Compact line heights with slight negative tracking create authoritative, editorial header sections.
- **Meeting Content & Transcripts (`body-lg`, `body-md`)**: Optimized for rapid scanning with balanced line heights to prevent eyestrain during long conversational reads.
- **Telemetry & Metadata (`label-sm`, `mono-data`)**: `label-sm` utilizes uppercase tracking for pill badges and categorical taxonomy; `mono-data` ensures tabular alignment across timecodes and quantitative metrics.

## Layout & Spacing
The layout leverages a disciplined **Fluid Grid** anchored by standard 8pt spacing units, structured for high-density information display while retaining executive breathing room.

### Form Factors & Breakpoints
- **Mobile (`< 768px`)**: Single-column vertical stack. Canvas margin collapses to `1rem` (`margin-mobile`), gutter shrinks to `0.75rem` (`gutter-mobile`). Graph nodes pivot from radial spatial layouts to sequential node lists.
- **Tablet (`768px - 1024px`)**: Dual-pane layout. Left pane contains meeting metadata, summary synthesis, and speaker stats (4 columns); right pane renders sequential transcripts and action graphs (8 columns).
- **Desktop (`> 1024px`)**: 12-column dynamic work canvas. Persistent compact navigation sidebar, central executive intelligence console (7 columns), and dedicated conversational graph/evidence inspection drawer (5 columns).

### Spacing Rules
- Keep component internals tight (`space-xs` to `space-sm` for badge insets and metric rows) while separating major analytical cards with `space-md` to `space-lg`.
- Transcripts use steady vertical rhythms with `space-sm` between conversational dialogue blocks and `space-md` between distinct topic shifts.

## Elevation & Depth
Elevation in this system is restrained and functional. Flat surfaces are defined primarily through 1px structure borders (`#e2e8f0`) over low-contrast canvas tiers, supplemented by surgical, desaturated drop shadows.

### Elevation Levels
- **Level 0 (Flat Ground)**: Primary canvas (`#f8fafc`).
- **Level 1 (Surface Cards & Panels)**: White background (`#ffffff`), 1px outline in `#e2e8f0`, shadow: `0 1px 2px 0 rgba(15, 23, 42, 0.04)`. Used for meeting summary cards, action lists, and graph canvas frames.
- **Level 2 (Interactive Floating Elements & Dropdowns)**: White background, 1px outline in `#cbd5e1`, shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`. Used for popovers, graph node details, speaker filters, and hover tooltips.
- **Level 3 (Modals & Executive Drawers)**: Pure white background, shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`. Accompanied by a subtle backdrop wash of `rgba(15, 23, 42, 0.35)` with `backdrop-filter: blur(4px)`.

## Shapes
A disciplined, soft radius profile (`roundedness: 1`) provides enterprise-grade structure:

- **Base Radius (`0.25rem` / `4px`)**: Applied to internal controls, small badges, input fields, code blocks, and micro-metrics.
- **Container Radius (`rounded-lg` / `0.5rem` / `8px`)**: Applied to analytical cards, panels, summary modules, and dropdown menus.
- **Structural Modules (`rounded-xl` / `0.75rem` / `12px`)**: Applied to modal overlays and root intelligence dashboards.
- **Pill Exception (`rounded-full` / `9999px`)**: Reserved exclusively for status indicators, metric labels, pill badges, and interactive graph topic nodes.

## Components

### Buttons
- **Primary**: Solid Indigo (`#4f46e5`) background with crisp white text (`#ffffff`), `0.25rem` radius, subtle hover shift to `#4338ca`. Includes a delicate `0 1px 2px rgba(0, 0, 0, 0.05)` baseline shadow.
- **Secondary**: Crisp white surface card with 1px border `#e2e8f0`, navy text (`#0f172a`), hover background `#f8fafc`.
- **Ghost**: Transparent background, text `#475569`, hover background `#f1f5f9` with text `#0f172a`.
- **Destructive**: Rose background (`#fff1f2`), 1px border `#fecdd3`, text `#e11d48`, hover background `#ffe4e6`.

### Badges & Pill Status Dots
- Constructed using `rounded-full`, horizontal padding `0.625rem`, vertical padding `0.25rem`, using `label-sm` font settings.
- **Verified / Consensus**: Soft emerald background (`#f0fdf4`), border `#bbf7d0`, text `#15803d`. Accompanied by a 6px circular dot (`#0d9488`).
- **Pending Action**: Soft amber background (`#fffbeb`), border `#fde68a`, text `#b45309`. Accompanied by a 6px pulsing dot (`#f59e0b`).
- **Conflict / Blocker**: Soft rose background (`#fff1f2`), border `#fecdd3`, text `#be123c`. Accompanied by an alert dot (`#e11d48`).
- **Entity / AI Topic Pill**: Soft indigo background (`#eef2ff`), border `#e0e7ff`, text `#4338ca`.

### Cards & Analytical Panels
- Background `#ffffff`, border 1px solid `#e2e8f0`, radius `0.5rem`, padding `1.25rem`.
- Divided internally by 1px horizontal hairpins in `#f1f5f9`.
- Header spaces isolate executive metric labels from operational contextual actions.

### Interactive Graph Nodes
- Compact pill-shaped or rounded-rect containers with white base backgrounds and semantic left-border accents (3px solid `#4f46e5` for topic hubs, `#0d9488` for outcomes).
- Displays primary node label in `body-sm` (medium weight), flanked by a speaker micro-avatar or node frequency badge.
- Interactive hover transitions add `border-color: #6366f1` and raise the node to Level 2 elevation.

### Tab Systems
- **Executive Switcher Style**: Enclosed pill container in `#f1f5f9` with 4px padding. Active tab sits as a white surface card (`#ffffff`) with subtle `shadow-sm`, text `#0f172a`, and font weight `500`. Inactive tabs render as `#475569` text with transparent backgrounds.

### Form Inputs & Filters
- Clean white backgrounds, 1px border `#cbd5e1`, 6px corner radius, standard body sizing (`body-md`).
- Focus state applies a crisp 1px `#4f46e5` ring with `0 0 0 3px rgba(79, 70, 229, 0.12)` halo.

### Checkboxes & Action Trackers
- Precision squares (`16px x 16px`) with 3px border radius. Unchecked state uses `#cbd5e1` borders. Checked state snaps to `#4f46e5` fill with a crisp white check vector.