---
name: unified-orchestrator
description: Hybrid multi-agent orchestration that auto-detects task topology and combines parallel execution with sequential pipelines, applying cascading validation throughout. Use when a task spans both independent parallel work and dependent chains, when topology is unclear, or when the user says "orchestrate", "coordinate agents", "multi-agent", "build with agents", or "swarm". Canonical orchestrator; prefer this when unsure.
---

# Unified Orchestrator (Auto-Topology)

Auto-detects task topology, routes subtasks to parallel or sequential execution, and applies cascading validation throughout. Canonical orchestrator — prefer this when unsure which to use. Built on MiMoCode primitives: `actor` and `task`.

## When to use
- Task has both independent parallel work and dependent chains.
- Topology is unclear.
- Complex task too large for a single agent.
- User says "orchestrate", "coordinate agents", "multi-agent", "build with agents", "swarm".

## When NOT to use
- Clearly independent domains only → `agentic-orchestrator` (simpler).
- Clearly sequential only → `swarm-orchestrator` (simpler).
- Single agent with tools suffices.

## Decision tree
```
clearly independent? ──yes──► agentic-orchestrator
       │no
       ▼
clearly sequential? ──yes──► swarm-orchestrator
       │no / unclear
       ▼
unified-orchestrator (this)
```

## Workflow

### Step 1: Analyze the task
Decompose into subtasks and build a dependency graph.
Example: "Research competitors, build comparison dashboard, write executive summary"
- T1: Research competitors (no deps)
- T2: Gather pricing data (no deps)
- T3: Build comparison dashboard (depends: T1, T2)
- T4: Write executive summary (depends: T1, T2, T3)

### Step 2: Topology detection
| Pattern | Signal | Action |
|---|---|---|
| All independent | No edges | Full parallel |
| All dependent | Linear chain of edges | Full sequential |
| Mixed | Some parallel branches feeding sequential stages | Phased: parallel → sequential |
| Fan-out | One task produces outputs for many consumers | Hub-and-spoke |
| Fan-in | Many tasks produce inputs for one consumer | Parallel → single sequential |

### Step 3: Assign models and validation level
| Subtask role | Tier | Validation | Rationale |
|---|---|---|---|
| Data gathering | standard | lightweight | volume; downstream validates |
| Core analysis | frontier | thorough | errors cascade |
| Creative generation | frontier | lightweight | don't over-validate creativity |
| Validation/checking | standard | none | checker needs no checking |
| Assembly/synthesis | frontier | thorough | must integrate correctly |

### Step 4: Execute
- **Parallel clusters:** spawn all agents simultaneously (`actor spawn`), wait for all, validate each.
- **Sequential chains:** execute in order with validation gates.
- **Mixed:** run parallel clusters first, feed results into sequential chains.

### Step 5: Validate and assemble
- Weak-link detection after every stage.
- On weak link: re-run, split, or upgrade model.
- Assemble final output; run final consistency check.

## Primitives mapping
- **Spawn:** `actor spawn` (subagent_type general/explore), bound to `task_id`.
- **Track:** `task` create/start/done per subtask.
- **Pass output:** shared contract file or `actor send`.
- **Synchronize:** `wait` on actor_ids; `status` to poll; `cancel` if stuck.

## Weak-link detection
After every agent output:
1. **Confidence check:** hedging, uncertainty, refusal signals.
2. **Constraint check:** output satisfies input requirements.
3. **Cross-validation:** lightweight validator confirms factual accuracy.
4. **Schema check:** output format correct.
Recovery: re-run → split subtask → upgrade model → escalate to human.

## Stopping heuristics
Stop adding agents when:
1. Diminishing returns (< 10% improvement).
2. Convergence (two consecutive agents similar output).
3. Budget cap (remaining cost > improvement value).
4. Complexity ceiling (pipeline depth > 5 stages).
5. Sufficiency (all constraints satisfied, all subtasks complete).

## Termination conditions
Combine signals (OR logic):
- Marker token (`DONE`/`TERMINATE`) in output.
- Max messages / agent calls reached.
- Max tokens or time exceeded.
- Validator confidence below threshold → halt + escalate.
- Reset state between runs.

## Guardrails (per stage output)
1. Confidence check (no hedging/refusal).
2. Constraint check (satisfies input requirements).
3. Cross-validation (factual accuracy).
4. Schema check (format correct).
Recovery: re-run → split → upgrade model → escalate.

## Handoff schema (between stages)
```json
{
  "stage": "T3",
  "inputs": ["T1", "T2"],
  "output": "...",
  "evidence": ["file:line"],
  "confidence": 0.9,
  "weak_link": false,
  "retries": 0
}
```

## Model-capability note
Some models don't support parallel tool calls (e.g., o3-mini/o3/o4-mini family). Disable that flag for those. Always define fallback tiers.

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
    "total_agents": 6, "total_retries": 1, "weak_links_detected": 1,
    "stopping_reason": "completion"
  },
  "quality": {
    "final_confidence": 0.91,
    "stage_scores": { "T1": 0.88, "T2": 0.85, "T3": 0.92, "T4": 0.90 }
  },
  "cost": { "total_tokens": 0, "estimated_usd": 0.0 }
}
```

## Anti-patterns
1. Force everything parallel — independent ≠ unrelated; check logical dependencies.
2. Force everything sequential — independent subtasks waste time in chains.
3. Skip validation between phases — parallel outputs may conflict at merge points.
4. Same model tier for all — gathering data doesn't need frontier; critical analysis does.
5. Ignore the merge point — when parallel branches feed one stage, validate cross-branch consistency.

## References
- `references/task-graph-analysis.md` — decomposition and topology detection.
- `references/validation-strategies.md` — weak-link detection and hallucination guardrails.
- `references/orchestration-patterns.md` — topology details and model selection.
file_path">
C:\Users\LENOVO\.local\share\mimocode\skills\unified-orchestrator\SKILL.md