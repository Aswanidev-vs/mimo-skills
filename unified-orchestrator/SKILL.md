---
name: unified-orchestrator
description: Hybrid multi-agent orchestration that auto-detects task topology and combines parallel execution with sequential pipelines. Use when building complex applications requiring coordinated multi-domain expertise AND sequential dependencies, when tasks span both independent parallel work and dependent chains, when you need automatic topology detection and agent count decisions, when the user says "orchestrate", "coordinate agents", "multi-agent", "build with agents", or "swarm". Also triggers on complex tasks too large for a single agent but where the right split between parallel and sequential is unclear.
---

# Unified Orchestrator

Auto-detects task topology, routes subtasks to parallel or sequential execution, and applies cascading validation throughout.

## Architecture

```
                         ┌─────────────────────┐
                         │   TASK ANALYZER      │
                         │  (decompose + graph) │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
             ┌──────────┐   ┌──────────┐   ┌──────────┐
             │ PARALLEL │   │ SEQUENTIAL│   │   HUB    │
             │  CLUSTER │   │  CHAIN   │   │  + SPOKE │
             └────┬─────┘   └────┬─────┘   └────┬─────┘
                  │              │              │
                  └──────────────┼──────────────┘
                                 ▼
                         ┌──────────────┐
                         │  VALIDATOR   │
                         │ (weak-link + │
                         │  consistency)│
                         └──────┬───────┘
                                ▼
                         ┌──────────────┐
                         │  ASSEMBLER   │
                         └──────────────┘
```

## Workflow

### Step 1: Analyze the task

Decompose the user's request into subtasks and build a dependency graph:

```
Input: "Research competitors, build a comparison dashboard, write executive summary"

Decomposition:
  T1: Research competitors        (no deps)
  T2: Gather pricing data          (no deps)
  T3: Build comparison dashboard   (depends: T1, T2)
  T4: Write executive summary      (depends: T1, T2, T3)

Dependency graph:
  T1 ──┐
       ├──→ T3 ──→ T4
  T2 ──┘
```

**Decision rules:**
- If subtask has **no dependencies** → parallel cluster
- If subtask **depends on another** → sequential chain
- If subtask **validates another** → hub-and-spoke

### Step 2: Assign models and validate level

| Subtask role | Model tier | Validation | Rationale |
|---|---|---|---|
| **Data gathering** | standard | lightweight | Volume task, downstream validates |
| **Core analysis** | frontier | thorough | Errors cascade |
| **Creative generation** | frontier | lightweight | Creativity shouldn't be over-validated |
| **Validation/checking** | standard | none | Checker doesn't need checking |
| **Assembly/synthesis** | frontier | thorough | Must integrate correctly |

### Step 3: Execute

**Parallel clusters** — spawn all agents simultaneously:

```
Cluster A (independent):
  Agent(T1, tier=standard) ──→ output1
  Agent(T2, tier=standard) ──→ output2
  [wait for all, validate each]
```

**Sequential chains** — execute in order with validation gates:

```
Chain B (dependent):
  Agent(T3, input=output1+output2, tier=frontier) ──→ validate ──→ output3
  Agent(T4, input=output1+output2+output3, tier=frontier) ──→ validate ──→ output4
```

**Mixed** — run parallel clusters first, feed results into sequential chains:

```
Phase 1: Parallel [T1, T2]
Phase 2: Sequential T3(T1,T2) → T4(T1,T2,T3)
```

### Step 4: Validate and assemble

- Run weak-link detection after every stage
- If weak link detected: re-run, split, or upgrade model
- Assemble final output from all stage outputs
- Run final consistency check

## Topology detection heuristics

Auto-detect from dependency graph:

| Pattern | Signal | Action |
|---|---|---|
| **All independent** | No edges in graph | Full parallel |
| **All dependent** | Linear chain of edges | Full sequential |
| **Mixed** | Some parallel branches feeding sequential stages | Phased: parallel → sequential |
| **Fan-out** | One task produces outputs for many consumers | Hub-and-spoke |
| **Fan-in** | Many tasks produce inputs for one consumer | Parallel → single sequential |

## Stopping heuristics

Stop adding agents when:

1. **Diminishing returns**: Next agent improves quality by < 10%
2. **Convergence**: Two consecutive agents produce similar output
3. **Budget cap**: Remaining cost exceeds improvement value
4. **Complexity ceiling**: Pipeline depth > 5 stages
5. **Sufficiency**: All constraints satisfied, all subtasks complete

## Weak-link detection

After every agent output, run:

1. **Confidence check**: Hedging, uncertainty, refusal signals
2. **Constraint check**: Output satisfies input requirements
3. **Cross-validation**: Lightweight validator confirms factual accuracy
4. **Schema check**: Output format correct

Recovery: re-run → split subtask → upgrade model → escalate to human

## Output format

```json
{
  "task_analysis": {
    "subtask_count": 4,
    "topology": "mixed",
    "phases": [
      { "phase": 1, "type": "parallel", "subtasks": ["T1", "T2"] },
      { "phase": 2, "type": "sequential", "subtasks": ["T3", "T4"] }
    ]
  },
  "execution": {
    "total_agents": 6,
    "total_retries": 1,
    "weak_links_detected": 1,
    "stopping_reason": "completion"
  },
  "quality": {
    "final_confidence": 0.91,
    "stage_scores": { "T1": 0.88, "T2": 0.85, "T3": 0.92, "T4": 0.90 }
  },
  "cost": {
    "total_tokens": 72000,
    "estimated_usd": 0.18
  }
}
```

## Anti-patterns

1. **Force everything parallel** — independent ≠ unrelated; check logical dependencies
2. **Force everything sequential** — independent subtasks waste time in chains
3. **Skip validation between phases** — parallel outputs may conflict at merge points
4. **Use same model tier for all** — gathering data doesn't need frontier; critical analysis does
5. **Ignore the merge point** — when parallel branches feed into one stage, validate cross-branch consistency

## References

- [Task graph analysis](references/task-graph-analysis.md) — How to decompose and detect topology
- [Validation strategies](references/validation-strategies.md) — Weak-link detection and hallucination guardrails
- [Orchestration patterns](references/orchestration-patterns.md) — Topology details and model selection
