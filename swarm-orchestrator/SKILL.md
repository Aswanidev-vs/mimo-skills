---
name: swarm-orchestrator
description: Sequential multi-agent orchestration with cascading error control, weak-link detection, and cost-aware agent selection. Use when building agent pipelines where outputs feed into subsequent agents, when task decomposition requires interdependent subtasks, when hallucination propagation across agent chains is a risk, when you need stopping heuristics for agent count, or when the user says "agent swarm", "multi-agent pipeline", "chain of agents", or "decompose and delegate". Do NOT use for parallel independent specialists (use agentic-orchestrator instead).
---

# Swarm Orchestrator

Coordinate interdependent agents in sequential or DAG-structured pipelines with built-in error propagation control, weak-link detection, and cost-aware orchestration.

## When to use this skill

- Task requires **decomposition into sequential subtasks** where output of one agent feeds input of the next
- **Cascading hallucination risk** — errors in early agents compound downstream
- Need **automatic stopping** — don't know how many agents to spawn
- **Budget-conscious** — need to minimize agent calls while maximizing quality
- User requests "swarm", "pipeline", "chain", "decompose and delegate"

## When NOT to use

- Agents are **independent and parallel** (use `agentic-orchestrator`)
- Simple task solvable by a **single agent with tools**
- Real-time systems (latency prohibitive)

## Core concepts

### Pipeline topology

```
Task → [Decomposer] → Agent1 → [Validator] → Agent2 → [Validator] → Agent3 → [Assembler]
                                  ↑                                       ↑
                            weak-link check                         weak-link check
```

Three topologies, auto-selected by task complexity:

| Topology | When | Agent count |
|---|---|---|
| **Linear chain** | Subtasks have clear sequential dependency | 3-6 |
| **DAG** | Some subtasks can run in parallel, others depend on predecessors | 4-8 |
| **Hub-and-spoke** | One core task with satellite validations | 3-5 |

### Agent selection matrix

Choose model tier per subtask based on complexity and error sensitivity:

| Subtask type | Model tier | Reasoning |
|---|---|---|
| **Critical path** (errors cascade) | frontier | Must be right; downstream depends on it |
| **Validation/checking** | standard | Needs to catch errors, not create them |
| **Simple transformation** | lite | Low risk, high volume |
| **Assembly/synthesis** | frontier | Must integrate correctly |

### Weak-link detection (WORC pattern)

After each agent produces output, validate before passing downstream:

1. **Confidence check**: Does the agent's output include hedging, uncertainty markers, or refusal signals?
2. **Cross-validation**: Run a lightweight validator agent to check factual consistency
3. **Coherence check**: Does the output satisfy the input contract (schema, constraints)?
4. **If weak link detected**: Re-run with a stronger model, or split the subtask further

```
Weak link indicators:
- Output contains "I'm not sure", "possibly", "might be wrong"
- Validator confidence < 0.7
- Output schema violations
- Contradicts known facts from earlier pipeline stages
```

### Stopping heuristics

Stop adding agents when any of these conditions hold:

1. **Diminishing returns**: Adding an agent improves output quality by < 10% (measured by validator score)
2. **Convergence**: Two consecutive agents produce substantively similar output
3. **Budget cap**: Estimated remaining cost exceeds value of improvement
4. **Complexity ceiling**: Task decomposition depth exceeds 5 levels (error compounding becomes unmanageable)
5. **Time cap**: Pipeline duration exceeds task-appropriate threshold

### Cascading hallucination guardrails

Insert validation checkpoints between pipeline stages:

- **Fact grounding**: Each agent must cite sources; validator checks citations exist
- **Constraint propagation**: Pass explicit constraints downstream; validator checks adherence
- **Error budget**: Allow max N% error rate per stage; if exceeded, halt and escalate
- **Human-in-the-loop gates**: For high-stakes decisions (financial, medical, legal), insert approval before critical stages

## Workflow

### Step 1: Decompose the task

Analyze the user's request and decompose into subtasks:

```
Input: "Research competitor X, analyze their pricing, write a comparison report"
Decomposition:
  T1: Research competitor X (gather data)
  T2: Analyze pricing (transform data)
  T3: Write report (synthesize)
Dependencies: T2 depends on T1, T3 depends on T1 + T2
Topology: Linear chain
```

### Step 2: Assign agents and models

For each subtask, select:
- **Model tier**: frontier / standard / lite (based on error sensitivity)
- **Agent count**: 1 (for simple) or N (for complex subtasks needing internal decomposition)
- **Validation level**: none / lightweight / thorough

### Step 3: Execute pipeline

Run agents sequentially (linear) or with dependency resolution (DAG):

```
For each stage:
  1. Spawn agent with subtask + input from predecessor
  2. Run weak-link detection on output
  3. If weak link → re-run with stronger model or split subtask
  4. Pass validated output to next stage
  5. Check stopping heuristics
```

### Step 4: Assemble and validate

Combine all stage outputs into final deliverable. Run a final quality pass:
- Cross-reference all claims against sources
- Check internal consistency
- Verify all constraints satisfied
- Report confidence level

## Output format

```json
{
  "pipeline": {
    "topology": "linear | dag | hub-spoke",
    "stages": [
      {
        "id": "T1",
        "subtask": "Research competitor X",
        "model_tier": "frontier",
        "agent_count": 1,
        "validation": "thorough",
        "output_confidence": 0.85,
        "weak_link_detected": false,
        "retries": 0
      }
    ],
    "total_agents": 3,
    "total_retries": 0,
    "stopping_reason": "convergence | budget | ceiling | completion"
  },
  "cost_estimate": {
    "total_tokens": 45000,
    "estimated_cost_usd": 0.12
  },
  "quality": {
    "final_confidence": 0.88,
    "fact_grounding": "all claims cited",
    "consistency_check": "passed"
  }
}
```

## Anti-patterns

1. **Swarm everything**: Don't use 5 agents when 1 with good tools suffices
2. **Skip validation**: Every unchecked stage is a hallucination multiplier
3. **Same model everywhere**: Use frontier for critical path, lite for simple transforms
4. **No stopping rule**: Infinite decomposition = infinite cost
5. **Ignore the Bystander Effect**: When agents see each other's outputs, they converge toward consensus even when wrong — use independent validation, not peer review

## References

- [Orchestration patterns](references/orchestration-patterns.md) — Detailed topology selection guide
- [Validation strategies](references/validation-strategies.md) — Weak-link detection and hallucination guardrails
