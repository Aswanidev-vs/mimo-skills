---
name: optimize-code
description: Systematic framework for maximizing AI output quality (code, research, docs). Use when the user asks for quality improvement, reports repeated errors/low-quality output, wants a systematic approach to AI output, or is building a skill/hook for quality control. Skip for trivial single-line edits.
---

# Output Optimization Framework

Goal: lift output from ~60% (default) to ~95%+ by fixing the 5 root causes — ambiguous scope, missing context, no verification, monolithic generation, no feedback loop.

## When to skip
- Single-line or single-token edits with obvious intent.
- Pure Q&A / explanation with no artifact produced.
- User explicitly wants a fast draft.

## Phase 1: Input Quality (before generating)

### Constraint anchoring
State before generating:
1. **What** — exact deliverable (file, function, behavior).
2. **What NOT** — exclusions, anti-patterns, scope boundaries.
3. **Invariants** — things that must always be true.
4. **Acceptance criteria** — how to verify success.

### Context enrichment
Never generate blind. Always:
1. Read target file(s) first.
2. Read neighboring files for conventions.
3. Check package.json / config for dependencies.
4. Search for existing patterns in the codebase.

### Example-driven specification
Instead of "Add validation to the form", write: "Add email validation matching `src/utils/validators.ts:42`, returning `{valid, error?}`, same shape as the phone validator at line 67."

## Phase 2: Generation Quality (during)

### 3-step protocol
1. **Plan before code** — 1-2 sentence approach, files touched, dependencies/risks.
2. **Generate incrementally** — logical chunks (imports → types → functions → exports); verify each chunk before continuing. Never write a 200+ line file in one shot.
3. **Self-verify** — run linter/typechecker; mentally test happy path; for prose, read as the audience.

### Structured templates
- **Code:** READ → PLAN → GENERATE (chunks) → VERIFY (lint/typecheck/test) → REFINE.
- **Research/analysis:** SCOPE → GATHER (docs > papers > blogs) → STRUCTURE (by theme) → SYNTHESIZE (cross-ref, contradictions) → VALIDATE (multi-source).
- **Docs:** AUDIENCE → STRUCTURE (outline first) → DRAFT (section by section) → REVIEW (completeness/accuracy) → POLISH (simplify, dedupe).

### Minimalism (anti-overengineering)
- Every change directly required by the task; drop the rest.
- Smallest diff that meets acceptance criteria; modify existing code before adding files/abstractions.
- Delete dead code (commented blocks, `_var` renames, `// removed`) instead of leaving it.
- Comments explain WHY only; no restating docstrings; no planning/decision docs nobody asked for.
- No compatibility shims for hypothetical futures.
- Inline single-use vars; early returns over reassignment; `obj.a` over destructuring when used once; functional methods over `for` loops when clearer; one function unless reusable; avoid `try/catch` where a result type works; avoid `any`.
- Error handling only for realistic scenarios (system boundaries: user input, network, disk, external APIs, parsing, permissions). Trust internal typed code.

## Phase 3: Output Quality (after generating)

### Verification checklist
- **Completeness:** all requested items; no scope creep; edge cases handled or noted.
- **Correctness:** compiles/typechecks; logic matches intent; no off-by-one; no missing imports/deps.
- **Quality:** follows conventions; no unnecessary complexity; error handling where appropriate; no hardcoded values that should be configurable.
- **Robustness:** handles null/undefined/empty; network failures (if applicable); no resource leaks.
- **Simplicity:** no unrequested abstractions/indirection; realistic error handling only; dead code deleted; comments explain WHY; no unrequested planning docs; single-use vars inlined.

### "Break it" test (code)
Try to break it mentally: empty input, max input, malformed input, dependency failure.

### Verification per task type
- **Code:** run build + lint + typecheck + relevant tests; trace 3-4 edge cases from `ocd/references/edge-cases.md`.
- **Research:** cross-check every claim against ≥2 sources; note contradictions.
- **Docs:** read as the target audience; check completeness against the outline.

## Phase 4: System Learning (meta)

### Persistence procedure (do this, don't just note it)
1. Technique worked → append a 1-3 line entry to project `MEMORY.md` under "Discovered durable knowledge" (or "Rules" if it's a rule).
2. Reusable across projects → create a skill via `skill-creator`.
3. Should apply automatically → add a hook (see `evolve` skill).

### Feedback integration
After each task note: what worked (reinforce), what failed (create guardrail), what was ambiguous (add spec).

## Quick mode (5 bullets)
1. Read before write; match conventions.
2. Anchor constraints + acceptance criteria.
3. Plan in 1-2 sentences; generate in chunks.
4. Lint/typecheck/test; run the "break it" test.
5. Ship the smallest diff; delete dead code.

## Quality multipliers (heuristics, not measurements)
| Technique | Impact | Effort |
|---|---|---|
| Read before write | high | low |
| Plan before code | high | low |
| Incremental generation | high | medium |
| Lint/typecheck after | medium | low |
| Self-verification | medium | low |
| Example-driven specs | high | low |
| Break-it thinking | medium | medium |
| Convention matching | medium | low |
| Scope discipline / surgical diff | high | low |

## Worked example
Task: "Add email validation to the signup form."
- Anchor: deliverable = `validateEmail(s): {valid, error?}` in `src/utils/validators.ts`; exclude phone/password; invariant = never throws; criteria = unit test passes + form shows error.
- Context: read validators.ts, the form component, existing tests.
- Spec: "match `validators.ts:42` phone validator pattern."
- Plan: add function + wire into form + add test.
- Generate: function → wire → test, lint after each.
- Verify: typecheck, run tests, break-it (empty, "a@b", 10k-char string, null).
- Ship smallest diff; no new abstractions.

## Usage
Apply when: code quality improvement requested; repeated errors/low-quality output; systematic approach wanted; building a quality-control skill/hook.
Skip when: trivial edit, pure Q&A, fast draft requested.
file_path">
C:\Users\LENOVO\.local\share\mimocode\skills\optimize-code\SKILL.md