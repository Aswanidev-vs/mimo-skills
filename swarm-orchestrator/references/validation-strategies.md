# Validation Strategies

## Weak-link detection

### Confidence signals

Monitor agent outputs for these red flags:

| Signal | Severity | Action |
|---|---|---|
| Hedging language ("I think", "probably") | Low | Log, continue |
| Explicit uncertainty ("I'm not sure") | Medium | Re-run with stronger model |
| Contradiction with input constraints | High | Halt stage, re-decompose |
| Refusal to answer | Critical | Replace agent, simplify subtask |
| Schema violation (wrong format) | High | Re-run with explicit format instructions |

### Cross-validation pattern

After agent N produces output, run a lightweight validator:

```
Validator prompt: "Given the following task description and agent output, check:
1. Are all claims supported by the provided context?
2. Are there any contradictions with known facts?
3. Does the output satisfy the input constraints?
4. Rate confidence 0-1.

Task: {subtask_description}
Input context: {input_from_predecessor}
Agent output: {agent_output}"
```

If validator confidence < 0.7, trigger weak-link recovery.

### Weak-link recovery

Three recovery strategies, escalating:

1. **Re-run same subtask** with temperature=0 and explicit constraints
2. **Split subtask** into smaller pieces (e.g., "research pricing" → "find pricing page" + "extract price points" + "verify currency")
3. **Upgrade model tier** (standard → frontier) for this subtask only

## Hallucination prevention

### Fact grounding

Every agent output must include:
- **Source citations** for factual claims (URL, document reference, or "from input context")
- **Confidence markers** (high/medium/low per claim)
- **Separation of facts from inference** (mark inferences explicitly)

### Constraint propagation

Pass explicit constraints through the pipeline:

```json
{
  "constraints": {
    "must_include": ["pricing comparison", "feature matrix"],
    "must_not_include": ["unverified claims", "competitor opinions"],
    "format": "markdown with tables",
    "max_length": 2000
  }
}
```

Each stage validates output against constraints before passing downstream.

### Error budget

Set a per-stage error tolerance:

| Stage position | Error budget | Rationale |
|---|---|---|
| Stage 1 (input gathering) | 5% | Errors here cascade to all downstream |
| Stage 2 (transformation) | 10% | Some errors caught by later validation |
| Stage 3 (synthesis) | 15% | Final validator catches most issues |
| Final validation | 2% | Last line of defense |

If error rate exceeds budget, halt pipeline and report to user.

## Cross-agent consistency

### The Bystander Effect problem

When agents see each other's outputs, they converge toward consensus even when wrong. Mitigation:

1. **Independent validation**: Validators should NOT see other validators' opinions
2. **Blind review**: Each agent receives only the raw input, not other agents' interpretations
3. **Adversarial validation**: One agent specifically tasked with finding flaws in another's output

### Consistency checks

After pipeline completes:

1. **Internal consistency**: Do any two claims in the final output contradict each other?
2. **Source consistency**: Are all cited sources real and accessible?
3. **Constraint consistency**: Does the output satisfy all original constraints?
4. **Temporal consistency**: Are time-sensitive claims still valid?

## Quality scoring

### Per-stage quality score

```
quality_score = (validator_confidence * 0.4) + (constraint_adherence * 0.3) + (source_coverage * 0.3)
```

Where:
- `validator_confidence`: 0-1 from cross-validation
- `constraint_adherence`: % of constraints satisfied
- `source_coverage`: % of claims with citations

### Pipeline quality score

```
pipeline_score = geometric_mean(stage_scores) * (1 - penalty)
penalty = (retries * 0.05) + (weak_links * 0.1)
```

Geometric mean ensures a single bad stage drags down the whole pipeline (appropriate for cascading systems).

### Reporting

Always report:
- Which stages had weak links detected
- How many retries occurred
- Final confidence score
- Which claims have weakest sourcing
- Whether stopping heuristics were triggered
