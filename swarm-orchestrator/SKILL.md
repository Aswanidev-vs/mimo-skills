---
name: swarm-orchestrator
description: Sequential/DAG multi-agent pipelines where outputs feed downstream agents, with cascading-error control, weak-link detection, and cost-aware stopping. Use when subtasks are interdependent, hallucination propagation is a risk, or you need automatic stopping heuristics. For independent parallel specialists use agentic-orchestrator; for auto topology use unified-orchestrator.
---

# Swarm Orchestrator (Sequential / DAG Pipelines)

Coordinate interdependent agents in sequential or DAG-structured pipelines with built-in error propagation control, weak-link detection, and cost-aware orchestration. Built on MiMoCode primitives: `actor` and `task`.

## When to use
- Task decomposes into sequential subtasks where output of one feeds the next.
- Cascading hallucination risk (errors compound downstream).
- Need automatic stopping (don't know how many agents to spawn).
- Budget-conscious: minimize agent calls while maximizing quality.
- User says "swarm", "pipeline", "chain", "decompose and delegate".

## When NOT to use
- Agents are independent and parallel → `agentic-orchestrator`.
- Simple task solvable by a single agent with tools.
- Real-time systems (latency prohibitive).

## Decision tree
```
independent domains? ──yes──► agentic-orchestrator
       │no
       ▼
sequential deps? ──yes──► swarm-orchestrator
       │unclear
       ▼
unified-orchestrator (auto-detect)
```

## Core concepts

### Pipeline topology
```
Task → [Decomposer] → Agent1 → [Validator] → Agent2 → [Validator] → Agent3 → [Assembler]
```
Three topologies, auto-selected by task complexity:

| Topology | When | Agent count |
|---|---|---|
| Linear chain | Clear sequential dependency | 3-6 |
| DAG | Some subtasks parallel, others depend | 4-8 |
| Hub-and-spoke | One core task with satellite validations | 3-5 |

### Model tier per subtask
| Subtask type | Tier | Reason |
|---|---|---|
| Critical path (errors cascade) | frontier | downstream depends on it |
| Validation/checking | standard | catches errors, doesn't create them |
| Simple transformation | lite | low risk, high volume |
| Assembly/synthesis | frontier | must integrate correctly |

### Weak-link detection (WORC: Watch, Observe, Review, Correct)
After each agent output, validate before passing downstream:
1. **Confidence check:** hedging/uncertainty/refusal signals ("I'm not sure", "possibly").
2. **Cross-validation:** lightweight validator checks factual consistency.
3. **Coherence check:** output satisfies input contract (schema, constraints).
4. **On weak link:** re-run with stronger model, or split the subtask.

Weak-link indicators: hedging language; validator confidence < 0.7; schema violations; contradiction with earlier stages.

### Stopping heuristics
Stop adding agents when any holds:
1. **Diminishing returns:** next agent improves quality < 10% (validator score).
2. **Convergence:** two consecutive agents produce substantively similar output.
3. **Budget cap:** estimated remaining cost exceeds value of improvement.
4. **Complexity ceiling:** decomposition depth > 5 levels.
5. **Time cap:** pipeline exceeds task-appropriate threshold.
6. **Sufficiency:** all constraints satisfied, all subtasks complete.

### Cascading hallucination guardrails
- **Fact grounding:** each agent cites sources; validator checks citations exist.
- **Constraint propagation:** pass explicit constraints downstream; validator checks adherence.
- **Error budget:** max N% error rate per stage; if exceeded, halt and escalate.
- **Human-in-the-loop gates:** for high-stakes decisions (financial/medical/legal), insert approval before critical stages.

### Termination conditions
Combine signals (OR logic) like AutoGen's termination conditions:
- Marker token (e.g., `DONE` / `TERMINATE`) mentioned in output.
- Max messages / max agent calls reached.
- Max tokens or time exceeded.
- Validator confidence below threshold → halt + escalate.
- Reset state between runs.

## Workflow
### Step 1: Decompose
Analyze request → subtasks with dependencies → pick topology.
Example: "Research competitor X, analyze pricing, write comparison report"
- T1: Research competitor X (gather)
- T2: Analyze pricing (transform, depends on T1)
- T3: Write report (synthesize, depends on T1+T2)
- Topology: linear chain.

### Step 2: Assign
Per subtask: model tier, agent count (1 or N), validation level (none/lightweight/thorough).

### Step 3: Execute
For each stage:
1. Spawn agent with subtask + predecessor output (via `actor spawn`, bound to a `task`).
2. Run weak-link detection on output.
3. If weak link → re-run with stronger model or split subtask (max 2 retries).
4. Pass validated output to next stage.
5. Check stopping heuristics.

### Step 4: Assemble and validate
Combine stage outputs; cross-reference claims against sources; check internal consistency; verify all constraints; report confidence.

## Primitives mapping
- **Spawn stage agent:** `actor spawn` (subagent_type general/explore), `task_id` bound.
- **Track stages:** `task` create/start/done per stage.
- **Pass output:** shared contract file or direct `send` of validated output.
- **Synchronize:** `wait` on actor_id; `status` to poll.
- **Cancel:** `actor cancel` on stuck stage.

## Guardrails (per stage output)
1. **Confidence check:** no hedging/refusal.
2. **Constraint check:** satisfies input requirements.
3. **Cross-validation:** lightweight validator confirms factual accuracy.
4. **Schema check:** output format correct.
Recovery: re-run → split subtask → upgrade model → escalate to human.

## Handoff schema (between stages)
```json
{
  "stage": "T2",
  "input_from": "T1",
  "output": "...",
  "evidence": ["file:line"],
  "confidence": 0.85,
  "weak_link": false,
  "retries": 0
}
```

## Output format
```json
{
  "pipeline": {
    "topology": "linear | dag | hub-spoke",
    "stages": [
      { "id": "T1", "subtask": "...", "model_tier": "frontier", "agent_count": 1,
        "validation": "thorough", "output_confidence": 0.85, "weak_link_detected": false, "retries": 0 }
    ],
    "total_agents": 3, "total_retries": 0,
    "stopping_reason": "convergence | budget | ceiling | completion"
  },
  "cost_estimate": { "total_tokens": 0, "estimated_cost_usd": 0.0 },
  "quality": { "final_confidence": 0.0, "fact_grounding": "all claims cited", "consistency_check": "passed" }
}
```

## Anti-patterns
1. **Swarm everything:** 5 agents when 1 with good tools suffices.
2. **Skip validation:** every unchecked stage is a hallucination multiplier.
3. **Same model everywhere:** frontier for critical path, lite for simple transforms.
4. **No stopping rule:** infinite decomposition = infinite cost.
5. **Bystander effect:** agents converging to consensus when wrong — use independent validation, not peer review.

## References
- `references/orchestration-patterns.md` — topology selection guide.
- `references/validation-strategies.md` — weak-link detection and hallucination guardrails.
file_path">
C:\Users\LENOVO\.local\share\mimocode\skills\swarm-orchestrator\SKILL.md