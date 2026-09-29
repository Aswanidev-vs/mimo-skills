# Validation Strategies

## Validation levels

| Level | What it checks | When to use | Cost |
|---|---|---|---|
| **None** | Nothing | Validator agents, trivial transforms | 0 |
| **Lightweight** | Schema, format, basic coherence | Data gathering, simple transforms | Low |
| **Thorough** | Facts, constraints, cross-references, logic | Core analysis, final assembly | Medium |
| **Adversarial** | Actively tries to find flaws | High-stakes outputs, final validation | High |

## Weak-link detection

### Confidence signals

| Signal | Severity | Action |
|---|---|---|
| Hedging ("I think", "probably") | Low | Log, continue |
| Explicit uncertainty ("I'm not sure") | Medium | Re-run with stronger model |
| Contradiction with input constraints | High | Halt stage, re-decompose |
| Refusal to answer | Critical | Replace agent, simplify subtask |
| Schema violation | High | Re-run with explicit format instructions |
| Circular reasoning | Critical | Break subtask into smaller pieces |

### Cross-validation pattern

After each agent output, run a lightweight validator:

```
Validator input:
- Original subtask description
- Input context (what this agent received)
- Agent output

Validator checks:
1. Are all claims supported by provided context?
2. Are there contradictions with known facts?
3. Does output satisfy input constraints?
4. Rate confidence 0-1

If confidence < 0.7 → trigger weak-link recovery
```

### Weak-link recovery (escalating)

1. **Re-run** same subtask with temperature=0 and explicit constraints
2. **Split** subtask into smaller pieces
3. **Upgrade** model tier for this subtask only
4. **Escalate** to human if recovery fails twice

## Cascading hallucination prevention

### Fact grounding

Every agent output must:
- Cite sources for factual claims (URL, document, or "from input context")
- Mark confidence level per claim (high/medium/low)
- Separate facts from inferences explicitly

### Constraint propagation

Pass constraints through the pipeline:

```json
{
  "constraints": {
    "must_include": ["feature comparison", "pricing table"],
    "must_not_include": ["unverified claims"],
    "format": "markdown with tables",
    "max_length": 3000
  }
}
```

Each stage validates against constraints before passing downstream.

### Error budget

| Stage position | Error budget | Rationale |
|---|---|---|
| Input gathering | 5% | Errors cascade to all downstream |
| Transformation | 10% | Some caught by later validation |
| Synthesis | 15% | Final validator catches most |
| Final validation | 2% | Last line of defense |

## Cross-branch consistency (merge points)

When parallel branches feed into one stage:

1. **Schema compatibility**: Do outputs from different branches use compatible formats?
2. **Semantic consistency**: Do parallel outputs contradict each other?
3. **Completeness**: Do parallel outputs collectively cover all required inputs?
4. **Conflict resolution**: If contradictions found, which source takes precedence?

## Quality scoring

### Per-stage score

```
score = (validator_confidence × 0.4) + (constraint_adherence × 0.3) + (source_coverage × 0.3)
```

### Pipeline score

```
pipeline_score = geometric_mean(stage_scores) × (1 - penalty)
penalty = (retries × 0.05) + (weak_links × 0.1)
```

Geometric mean ensures a single bad stage drags down the whole pipeline.

## The Bystander Effect

When agents see each other's outputs, they converge toward consensus even when wrong.

**Mitigation:**
- Validators run independently — don't share validator opinions
- Each agent gets only raw input, not other agents' interpretations
- Include one adversarial validator tasked with finding flaws
- Final assembly uses blind integration (assembles without "voting")
