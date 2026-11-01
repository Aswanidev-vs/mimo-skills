# mimo-skills

A collection of MiMoCode skills, copied from a working 0.1.15 install.

Two kinds live here, and the distinction matters when something misbehaves:

- **Built-in** — ships with MiMoCode. Updated or removed by upstream version bumps.
  A skill vanishing after an upgrade is usually upstream, not you.
- **User-created** — installed into your own directories. Yours to edit; not
  touched by MiMoCode updates.

Folders are named after each skill's declared `name:` in its frontmatter, which
is what the loader matches on — not the source directory name.

## At a glance

| Skill | Source | Files |
|---|---|---|
| `optimize-code` | user — `~/.local/share/mimocode/skills/` | 1 |
| `structured-output` | user — `~/.local/share/mimocode/skills/` | 1 |
| `design-blueprint` | user — `~/.local/share/mimocode/skills/` | 8 |
| `product-design` | **built-in** — `builtin_skills/0.1.15/skills/` | 28 |
| `frontend-design` | user — `~/.agents/skills/` | 1 |
| `frontend-design-v2` | local — this repo, not yet installed | 14 |
| `agentic-orchestrator` | user — `~/.local/share/mimocode/skills/` | 14 |
| `swarm-orchestrator` | user — `~/.local/share/mimocode/skills/` | 3 |
| `unified-orchestrator` | user — `~/.local/share/mimocode/skills/` | 4 |
| `mimo-caveman` | user — `~/.mimocode/skills/` | 1 |
| `evolve` | user — rebuilt here, see its own README | 8 |

9 user-created, 1 built-in, 1 local-uninstalled (`frontend-design-v2`).

## Built-in

### product-design
Product design exploration, UX research, flow auditing or critique, visual
ideation, cloning a live product surface, implementing a selected visual target,
design QA, and sharing a prototype.

The largest skill here (28 files) — it ships a full `workflows/` tree with
per-task sub-skills (`audit`, `ideate`, `design-qa`, `url-to-code`,
`image-to-code`, `get-context`, `share`, `user-context`). Its SKILL.md step 1
routes through `workflows/index/SKILL.md`, which is the authoritative
plugin-level scope and sequencing policy — read it first.

> Note: earlier versions (0.1.13) shipped this skill with its `workflows/` tree
> missing, which broke that router. Fixed upstream by 0.1.15 — the tree is
> intact in this copy.

## User-created

### optimize-code
Quality framework for AI-generated output: constraint anchoring, context
enrichment, incremental generation, verification loops. Carries a strong
anti-overengineering section — scope discipline, surgical diffs, deleting dead
code, and an explicit "don't build for hypothetical futures" rule.

### structured-output
Companion to `optimize-code`. Provides fixed templates for code, research,
bug-fix, documentation, and feature work, with explicit "Included / Excluded"
scope sections so unrequested work is visibly omitted rather than silently
added.

### design-blueprint
The spec-before-pixels skill. Produces a `DESIGN.md` (nine-section protocol)
plus structural outline and a Decision Trace before any visual artifact is
built. Targets the "AI slop median" — gradient heroes, rounded-16px card grids,
emoji-bullet feature lists. Self-embodied designer identities, an anti-slop
check, and a critique mode for artifacts that already exist.

Pairs with `frontend-design`: blueprint first, then implementation.

### frontend-design
Builds the actual frontend — components, pages, landing pages, posters,
applications. Takes a `DESIGN.md` from `design-blueprint` as its source of
truth. Produces production-grade, deliberately non-generic UI.

### frontend-design-v2
The expanded rewrite of `frontend-design`, built here first and **not yet
installed anywhere** — copy the folder to `~/.local/share/mimocode/skills/` (or
`~/.agents/skills/`) to use it. Still v1's premise (commit to a bold aesthetic,
execute it precisely) with the gaps closed around it.

What v2 adds over the single-file original:

- **Signal reading** — a Step 0 that extracts artifact type, domain, tone words,
  named references, framework constraints, and existing state from the prompt,
  so every later instruction adapts to the specific context instead of running
  a fixed script.
- **Routing table** — new build vs. restyle vs. component vs. screenshot port vs.
  one-off fix, with an explicit handoff to `design-blueprint` for spec-only work.
- **A Direction Card** committed in the reply before any styling: aesthetic,
  metaphor, type voice, color logic, and the one signature mechanic — plus an
  anti-convergence rule, since v1's "never converge on Space Grotesk" was advice
  with no mechanism.
- **Foundations before pixels** — tokens (OKLCH ramp, fluid type scale, spacing,
  radius, motion) established as real code before components are styled.
- **States as a build layer** — v1 said nothing about hover/focus/loading/empty/
  error. These are now a mandatory pass with a state matrix.
- **A real-browser verification loop** — screenshots at 1440/768/375, a
  fix-and-re-render cycle, and an honesty rule: if no browser was available, say
  what could not be verified.
- **Eleven craft references** — anti-slop with a fix per attractor, typography
  (pairing catalog, tracking/leading tables, font loading), color (OKLCH, dark
  mode re-tuning, contrast), motion (easing, stagger, reduced-motion), layout
  (grid, density, overflow), effects (grain, borders, depth without shadow),
  framework patterns, existing-UI audit, screenshot-to-code extraction, a
  quality-gate checklist, and **`reference-sites.md`** (see below).
- **A 3D protocol** (`references/3d.md`) — for "build me a 3D website": the
  if-3D-is-right honesty gate, stack selection (R3F / raw Three.js / Spline
  `<spline-viewer>` / `<model-viewer>` / CSS 3D), the poster-first loading
  pipeline, hard performance budgets (draw calls, texture memory, DPR clamps),
  scroll-driven scene choreography, the accessibility floor, and the pre-ship
  checks. The routing table has a dedicated 3D route into it.
- **`assets/design-tokens.css`** — a runnable starter token layer to edit down.

Overlaps `design-blueprint` by design: it reads an existing `DESIGN.md` as source
of truth instead of regenerating one.

### The reference-site catalog

`references/reference-sites.md` is v2's dynamic engine. It teardowns eleven
sites — Linear, Attio, Apple, Porsche, Aesop, Resend, Raycast, Spline,
TinyFloor, Mobbin, Awwwards — as **sources of extractable technique, keyed to
prompt signals**:

- A routing table maps the prompt's words ("dev tool", "luxury", "playful",
  "gallery", "3D") to one or two site sections to draw from.
- Per site: identity, signature traits, borrow-when signals, concrete
  extractable techniques (the CSS/JS mechanics), and the trap that fires when
  surface details are cloned instead of mechanisms extracted.
- Rule built into the file: one primary DNA source per design, at most one
  secondary texture; rebuild every borrow in the Direction Card's own type,
  color, and scale. Same DNA, different organism.

Several techniques were also taken from a measured teardown of
[gsap.com/pricing](https://gsap.com/pricing/), used as worked examples rather
than as a thing to clone: the explicit
`max(floor, min(A·vw + B, ceiling))` fluid ramp (no `clamp()`), per-section
`--theme-color` scoping so hover colors fall out of the cascade, the oversized
radial button wipe, the grain overlay at `opacity: .2`, and the grid-breaking
"sticky context" overflow (a rotated avatar escaping its card). The arithmetic
in `references/layout.md` and `references/typography.md` resolves to GSAP's own
375px–1920px design range.

### agentic-orchestrator
Parallel multi-agent fan-out with specialized domain agents (frontend, backend,
review, security, integration, evaluation) over shared state. Use when work
splits into independent parts.

### swarm-orchestrator
Sequential pipeline where each agent's output feeds the next. Built around
cascading error control, weak-link detection, and cost-aware model selection —
for when a hallucination in one step would propagate downstream.

### unified-orchestrator
Hybrid of the two. Detects task topology and routes independent work to a
parallel cluster and dependent work through sequential chains, with model-tier
routing by role and escalation on weak links. The most capable of the three;
start here when you're unsure which fits.

### mimo-caveman
Token compression — cuts output ~65% while keeping technical accuracy. Three
intensity levels: `lite`, `full` (default), `ultra`. Load when you want terse
responses.

### evolve
Self-extension: create tools, intercept behavior with hooks, persist knowledge,
or add TUI panels.

Unlike the rest here, this one is **not a straight copy**  it's a rebuild.
MiMoCode's original `evolve` skill was removed in
[PR #2459](https://github.com/XiaomiMiMo/MiMo-Code/pull/2459), which disabled
auto-loading of standalone tool and hook directories. Those directories were
auto-imported and executed, so any file landing in one a prompt-injection
artifact, a malicious file drop, a cloned repo  became silently running code.
The skill was pulled because it told the agent to write into those paths.

This version targets the plugin API that replaced the mechanism, so the
capability works without the exposure. It also ships an `example-plugin/` with a
working tool and guard hook. **Read `evolve/README.md` before sharing it** —
the security context is the whole reason it exists.

## Notes on the orchestrators

The three orchestrators overlap by design. Rough division:

- Independent work → `agentic-orchestrator`
- Dependent chain → `swarm-orchestrator`
- Mixed / unsure → `unified-orchestrator`

## Installing

Copy any skill folder into a skills directory:

- **Per-project:** `<project>/.mimocode/skills/<name>/`
- **Per-user, all folders:** `~/.mimocode/skills/<name>/`

Both load on the next turn. `~/.codex/skills/` also works and is visible in the
skills picker.

`frontend-design-v2` follows the same layout as `design-blueprint` and
`product-design` — entry `SKILL.md` plus `references/` and `assets/` — so it can
be copied into any of those directories unchanged once it's ready to go global.

Two directory-name quirks worth knowing, since they don't match the skill names:

- `frontend-design` came from a directory named `frontend-designn` (typo in the
  source path; the frontmatter name is correct)
- `mimo-caveman` came from a directory named `caveman`

Both are renamed to match their declared `name:` here, which is what the loader
matches on.

## Before you share this folder

This package was scanned for credentials, emails, IPs, absolute paths, and
personal project names — all clean. Two things to know anyway:

**`agentic-orchestrator` originally shipped a live `.env`.** It contained four
real API keys (OpenRouter, NVIDIA, PlanTokenRouter, MiMo) in plaintext, inherited
from the source install. It has been removed here; `.env.example` with
placeholders remains, so the skill still documents what to configure. **The
source copy at `~/.local/share/mimocode/skills/agentic-orchestrator/` still has
it** — if you copy skills again, exclude `.env` or delete it first. Those keys
should also be treated as exposed and rotated, since they were readable on disk
without version control.

**`evolve` is a deliberate divergence from upstream**, not a verbatim copy. It
documents two directory paths that no longer load. Anyone diffing it against the
original will see those changes on purpose.

## Provenance

Copied from a MiMoCode **0.1.15** Windows install, with `evolve` rebuilt locally.
File counts verified against source after copying. `product-design` is
MiMoCode/Xiaomi MiMo material — check its license before redistributing. The
rest are community/user skills.
