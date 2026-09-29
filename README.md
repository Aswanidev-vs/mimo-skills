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
| `agentic-orchestrator` | user — `~/.local/share/mimocode/skills/` | 14 |
| `swarm-orchestrator` | user — `~/.local/share/mimocode/skills/` | 3 |
| `unified-orchestrator` | user — `~/.local/share/mimocode/skills/` | 4 |
| `mimo-caveman` | user — `~/.mimocode/skills/` | 1 |

8 user-created, 1 built-in.

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

Two directory-name quirks worth knowing, since they don't match the skill names:

- `frontend-design` came from a directory named `frontend-designn` (typo in the
  source path; the frontmatter name is correct)
- `mimo-caveman` came from a directory named `caveman`

Both are renamed to match their declared `name:` here, which is what the loader
matches on.

## Provenance

Copied from a MiMoCode **0.1.15** Windows install. File counts verified against
source after copying. `product-design` is MiMoCode/Xiaomi MiMo material — check
its license before redistributing. The rest are community/user skills.
