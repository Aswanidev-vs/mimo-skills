# Orchestration Patterns

## Topology selection guide

### Linear chain

```
A → B → C → D
```

**When to use:**
- Clear sequential dependency (each step needs previous output)
- Example: Research → Analyze → Write → Review
- Example: Parse data → Transform → Validate → Load

**When NOT to use:**
- Steps are independent (use parallel instead)
- More than 6 steps (error compounding too high)

**Error handling:**
- Insert validation between each stage
- If stage 3 fails, you may need to re-run stages 1-2
- Consider checkpointing intermediate results

### DAG (Directed Acyclic Graph)

```
    ┌→ B ─┐
A →─┤     ├→ D → E
    └→ C ─┘
```

**When to use:**
- Some steps can run in parallel after a common predecessor
- Example: Gather requirements → (design frontend | design backend) → integrate
- Example: Extract data → (clean prices | clean names | clean dates) → merge

**When NOT to use:**
- Dependencies are unclear (use linear to be safe)
- Parallel branches produce conflicting outputs that need reconciliation

**Error handling:**
- Each branch validated independently
- Merge point requires cross-branch consistency check
- Failed branch can be re-run without affecting others

### Hub-and-spoke

```
        ┌→ Validator1
Task → Hub
        └→ Validator2
```

**When to use:**
- One core task needs multiple independent validation passes
- Example: Generate code → (security review | performance review | style review)
- Example: Write report → (fact check | tone check | format check)

**When NOT to use:**
- Validators need to see each other's output (use chain instead)
- More than 4 validators (diminishing returns)

**Error handling:**
- Validators run independently
- Conflicts between validators escalated to human
- Core output versioned for rollback

## Agent count guidelines

| Task complexity | Recommended agents | Reasoning |
|---|---|---|
| Simple (single domain, clear steps) | 1-2 | Overhead not justified |
| Medium (multi-domain, some ambiguity) | 3-4 | Sweet spot for most tasks |
| Complex (cross-domain, high stakes) | 5-6 | Maximum before error compounding dominates |
| Very complex (research, analysis) | 7-8 | Only with strong validation at each stage |

**Hard ceiling: 8 agents.** Beyond this, the coordination overhead exceeds the decomposition benefit. If you need more, you're likely decomposing wrong.

## Model tier selection

| Signal | Tier | Example models |
|---|---|---|
| Must be factually correct | frontier | mimo-v2.5, minimax-m3, qwen3.5-122b |
| Creative generation | frontier | mimo-v2.5, minimax-m3 |
| Structural transformation | standard | qwen3-coder, gemma-4-31b |
| Simple formatting/validation | lite | lfm-2.5-1.2b, nemotron-nano-9b |
| High-volume, low-stakes | lite | lfm-2.5-1.2b |
