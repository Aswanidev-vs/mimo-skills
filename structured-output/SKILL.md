---
name: structured-output
description: Use when generating any non-trivial output (code, research, documentation, analysis) to enforce consistent structure and quality. Companion to output-optimizer.
---

# Structured Output Templates

## Code Generation Template

When generating code, follow this structure:

```
## Plan
- Goal: [1 sentence]
- Files to touch: [list]
- Dependencies: [list]
- Risks: [list or "none"]

## Implementation
[Code organized as: types → utilities → main logic → exports]

## Verification
- Lint/typecheck: [result]
- Happy path: [manual verification]
- Edge cases: [handled/noted]

## Scope
- Included: [what was built]
- Excluded: [what was NOT built, even if related]
```

## Research Analysis Template

```
## Question
[Exact question being answered]

## Sources
- [Primary source 1] — [credibility]
- [Primary source 2] — [credibility]

## Findings
### [Category 1]
- Finding with evidence
- Finding with evidence

### [Category 2]
- Finding with evidence

## Synthesis
[Cross-referenced analysis, not just source summaries]

## Confidence
- High: [things with multiple confirming sources]
- Medium: [things with single source]
- Low: [things that are inferential]

## Open Questions
- [What couldn't be answered and why]
```

## Bug Fix Template

```
## Root Cause
[What exactly is broken and why]

## Evidence
[How I know this is the cause — logs, code analysis, reproduction steps]

## Fix
[The minimal change that fixes the issue]

## Verification
- [How to test the fix]
- [What could break if this fix is wrong]

## Scope
- Fixes: [specific behavior]
- Does NOT fix: [related issues that remain]
```

## Documentation Template

```
## Audience
[Who reads this, what they know]

## Structure
[Outline before prose]

## Content
[Section-by-section, each with clear purpose]

## Completeness Check
- [ ] All APIs/features documented
- [ ] Examples provided
- [ ] Edge cases noted
- [ ] Prerequisites stated
```

## Feature Implementation Template

```
## Requirements
- Must: [non-negotiable behaviors]
- Should: [desired behaviors]
- Won't: [explicitly excluded]

## Design
- Approach: [1-2 sentences]
- Data flow: [how data moves]
- State changes: [what changes and when]

## Implementation
[Code with inline structure markers]

## Testing
- Happy path: [test scenario]
- Error path: [test scenario]
- Edge cases: [test scenarios]

## Rollback
[How to undo if something goes wrong]
```

## Usage

This skill activates automatically when:
- Generating code files
- Writing research/analysis
- Creating documentation
- Fixing bugs
- Implementing features

The template structure enforces completeness without adding verbosity. Each section can be skipped if not applicable, but must be consciously skipped (not forgotten).
