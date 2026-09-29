---
name: optimize-code
description: Use when the user wants to maximize output quality, reduce errors, or achieve near-perfect results from AI-generated code/text. Applies to any task where quality matters more than speed.
---

# Output Optimization Framework

## The Quality Gap: 60% → 95%

Most AI output quality issues stem from 5 root causes:

| Root Cause | Symptom | Fix |
|-----------|---------|-----|
| Ambiguous scope | Wrong thing built | Constraint anchoring |
| Missing context | Incomplete/wrong approach | Context enrichment |
| No verification | Errors shipped unchecked | Verification loops |
| Monolithic generation | Hard to catch errors | Incremental building |
| No feedback loop | Same mistakes repeated | Pattern accumulation |

## Phase 1: Input Quality (Before Generation)

### Constraint Anchoring
Before generating anything, establish:
1. **What** — exact deliverable (file, function, behavior)
2. **What NOT** — exclusions, anti-patterns, scope boundaries
3. **Invariants** — things that must always be true
4. **Acceptance criteria** — how to verify success

### Context Enrichment
Never generate code blind. Always:
1. Read the target file(s) first
2. Read neighboring files for conventions
3. Check package.json / config for dependencies
4. Search for existing patterns in the codebase

### Example-Driven Specification
Instead of: "Add validation to the form"
Write: "Add email validation matching the pattern in `src/utils/validators.ts:42`, returning `{valid: boolean, error?: string}`, same as the phone validator at line 67"

## Phase 2: Generation Quality (During)

### The 3-Step Generation Protocol

**Step 1: Plan before code**
- State what you'll do in 1-2 sentences
- List the files you'll touch
- Identify dependencies and risks

**Step 2: Generate incrementally**
- Never write a 200+ line file in one shot
- Write in logical chunks (imports → types → functions → exports)
- After each chunk, verify it's correct before continuing

**Step 3: Self-verify after generation**
- Run the linter/typechecker immediately
- For code: test the happy path mentally
- For text: read it as if you're the audience

### Minimalism Principles (Anti-Overengineering)

Quality does not mean more code. After planning and before generating, run through these to keep output lean:

**Scope discipline**
- Is every change directly required by the task? If not, drop it
- Am I adding a feature/refactor/abstraction nobody asked for? Stop
- Does this error case actually happen in practice, or am I defending against the impossible? If impossible, remove it
- Do I need a new file, or can this live in an existing one? Prefer the latter

**Surgical change**
- What is the smallest diff that satisfies the acceptance criteria?
- Can I modify the existing function instead of splitting it into three?
- Is there dead code (commented-out blocks, `_var` renames, `// removed` notes) to delete instead of leaving behind?

**Code clarity, not ceremony**
- Does this comment explain WHY, not WHAT? If just restating the code, delete it
- Is this a multi-paragraph docstring? Shorten to zero or one sentence
- Am I creating a planning doc, decision record, or analysis file the user didn't ask for? Don't
- Am I adding backwards-compatibility shims for a hypothetical future need? Remove them

**Expression-level simplicity**
- Can I use a ternary or early return instead of reassigning a variable?
- Can I inline a variable used only once?
- Can I use `obj.a` instead of destructuring `const { a } = obj`?
- Can I use a functional method (`map`/`filter`/`flatMap`) instead of a `for` loop?
- Can I keep this in one function instead of splitting into smaller ones?
- Can I avoid `try`/`catch` here? (e.g., return a result type instead)
- Can I avoid `any` by using a more specific type or a type guard?

### Structured Generation Templates

#### For Code Tasks
```
1. READ: Understand existing code and conventions
2. PLAN: State approach, files, dependencies
3. GENERATE: Write code in logical chunks
4. VERIFY: Lint, typecheck, test
5. REFINE: Fix any issues found
```

#### For Research/Analysis Tasks
```
1. SCOPE: Define exact question and boundaries
2. GATHER: Collect primary sources (docs > papers > blogs)
3. STRUCTURE: Organize by theme, not by source
4. SYNTHESIZE: Cross-reference, find contradictions
5. VALIDATE: Check facts against multiple sources
```

#### For Documentation Tasks
```
1. AUDIENCE: Who reads this? What do they know?
2. STRUCTURE: Outline before prose
3. DRAFT: Write section by section
4. REVIEW: Check for completeness and accuracy
5. POLISH: Simplify, remove redundancy
```

## Phase 3: Output Quality (After Generation)

### The Verification Checklist

Before delivering output, run through:

**Completeness**
- [ ] All requested items addressed
- [ ] No scope creep (didn't add unrequested features)
- [ ] Edge cases handled or explicitly noted

**Correctness**
- [ ] Code compiles/typechecks
- [ ] Logic matches intent
- [ ] No off-by-one errors
- [ ] No missing imports or dependencies

**Quality**
- [ ] Follows existing code conventions
- [ ] No unnecessary complexity
- [ ] Error handling where appropriate
- [ ] No hardcoded values that should be configurable

**Robustness**
- [ ] Handles null/undefined/empty inputs
- [ ] Handles network failures (if applicable)
- [ ] No resource leaks

**Simplicity**
- [ ] Every change is directly required by the task — no scope creep
- [ ] No unnecessary abstractions, classes, or indirection added
- [ ] Error handling covers realistic scenarios only — nothing guarding the impossible
- [ ] Dead code deleted (no commented-out blocks, no `_var` renames)
- [ ] Comments explain WHY only — no restating-the-obvious docstrings
- [ ] No planning/decision docs the user didn't ask for
- [ ] Single-use variables inlined, unnecessary destructuring removed

### The "Break It" Test
After generating code, try to break it mentally:
- What happens with empty input?
- What happens with maximum input?
- What happens with malformed input?
- What happens when a dependency fails?

## Phase 4: System Learning (Meta)

### Pattern Accumulation
When a technique works, encode it:
- Add to project memory (MEMORY.md)
- Create a skill if reusable across projects
- Add a hook if it should apply automatically

### Feedback Integration
After each task, note:
- What worked well → reinforce
- What failed → create guardrail
- What was ambiguous → add specification

## Quick Reference: Quality Multipliers

| Technique | Quality Impact | Effort |
|-----------|---------------|--------|
| Read before write | +15% | Low |
| Plan before code | +20% | Low |
| Incremental generation | +15% | Medium |
| Lint/typecheck after | +10% | Low |
| Self-verification | +10% | Low |
| Example-driven specs | +15% | Low |
| Breaking-test thinking | +10% | Medium |
| Convention matching | +5% | Low |

### Anti-Overengineering Multipliers

| Technique | Quality Impact | Effort |
|-----------|---------------|--------|
| Scope discipline (drop unrequested work) | +15% | Low |
| Surgical diff (smallest change possible) | +15% | Low |
| Delete dead code, not rename it | +5% | Low |
| Remove comments that restate code | +5% | Low |
| Inline single-use variables | +5% | Very Low |
| Avoid `try`/`catch` where possible | +5% | Low |
| Keep in one function unless reusable | +10% | Medium |
| Ternaries over reassignment | +5% | Very Low |

**Cumulative: 60% baseline + quality techniques + anti-overengineering ≈ 95%+**

## Usage

Apply this skill when:
- User asks for code quality improvement
- User reports repeated errors or low-quality output
- User wants a systematic approach to AI output
- User is building a skill or hook for quality control
