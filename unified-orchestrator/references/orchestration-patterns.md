# Orchestration Patterns

## Parallel execution

### When subtasks are independent

```
  ┌→ Agent(T1) ──→ output1 ─┐
  │                           │
Input ─┼→ Agent(T2) ──→ output2 ─┼──→ merge
  │                           │
  └→ Agent(T3) ──→ output3 ─┘
```

**Spawn all simultaneously, wait for all, validate each, merge.**

**Best for:**
- Data gathering from multiple sources
- Independent analysis tasks
- Parallel code generation (frontend + backend + tests)
- Multi-source research

**Validation:** Lightweight per-agent, thorough at merge point

### Model assignment

| Role | Tier | Reasoning |
|---|---|---|
| Data gathering | standard | Volume task, downstream validates |
| Independent analysis | frontier | Each branch may inform final decisions |
| Code generation | standard | Tests will catch errors |

## Sequential execution

### When subtasks have dependencies

```
Input → Agent(T1) → validate → Agent(T2) → validate → Agent(T3) → output
```

**Execute in order, validate between each stage.**

**Best for:**
- Research → analysis → synthesis chains
- Parse → transform → load pipelines
- Design → implement → test sequences

**Validation:** Thorough at every gate

### Model assignment

| Stage | Tier | Reasoning |
|---|---|---|
| Input gathering | standard | Foundation must be solid |
| Core analysis | frontier | Errors cascade downstream |
| Final synthesis | frontier | Must integrate correctly |

## Mixed (phased) execution

### Parallel branches feeding sequential stages

```
Phase 1 (parallel):     T1 ──┐
                             ├──→ Phase 2 (sequential): T3 → T4
                      T2 ──┘
```

**Best for:**
- Multi-source research → single analysis → single report
- Multi-component design → integration → testing

**Critical point:** Validate cross-branch consistency at merge

### Merge validation checklist

1. Are outputs from parallel branches compatible?
2. Do they contradict each other?
3. Do they collectively cover all requirements?
4. If conflicts exist, which takes precedence?

## Hub-and-spoke

### One core task with validators

```
              ┌→ Validator1 ──┐
Core output →─┼→ Validator2 ──┼─→综合报告
              └→ Validator3 ──┘
```

**Best for:**
- Security review, performance review, style review in parallel
- Fact-checking, tone-checking, format-checking

**Validation:** Validators are independent; conflicts escalated to human

## Fan-out / fan-in

### Fan-out: One task produces for many consumers

```
T1 → T2
T1 → T3
T1 → T4
```

Run T1 first, then T2/T3/T4 in parallel.

### Fan-in: Many tasks produce for one consumer

```
T1 ──┐
T2 ──┼→ T4
T3 ──┘
```

Run T1/T2/T3 in parallel, then T4 sequentially.

## Choosing the right pattern

| Task characteristic | Pattern |
|---|---|
| "Do X, Y, Z independently" | Parallel |
| "Do X, then Y, then Z" | Sequential |
| "Do X and Y, then use both for Z" | Mixed |
| "Do X, then validate from multiple angles" | Hub-and-spoke |
| "Gather from sources A, B, C, then analyze" | Fan-in |
| "Generate from spec: frontend, backend, tests" | Fan-out |

## Agent count guidelines

| Task complexity | Agents | Pattern |
|---|---|---|
| Simple (1 domain, clear steps) | 1-2 | Sequential or single agent |
| Medium (multi-domain, some deps) | 3-5 | Mixed |
| Complex (cross-domain, many deps) | 5-8 | Mixed with validation |
| Very complex (research/analysis) | 8-12 | Phased with sub-pipelines |

**Hard ceiling: 12 agents.** Beyond this, decompose into sub-pipelines with human checkpoints.
