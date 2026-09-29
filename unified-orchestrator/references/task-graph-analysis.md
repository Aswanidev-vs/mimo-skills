# Task Graph Analysis

## Decomposition process

### Step 1: Identify atomic subtasks

Break the user's request into the smallest meaningful units:

```
"Build a secure user dashboard with real-time data"
→ T1: Design UI components
→ T2: Build data API
→ T3: Implement auth
→ T4: Connect frontend to API
→ T5: Add real-time updates
→ T6: Security audit
```

**Rules:**
- Each subtask should be completable by one agent in one pass
- If a subtask feels too big, split it further
- If a subtask is trivial (< 1 tool call), merge it with a neighbor

### Step 2: Identify dependencies

For each pair of subtasks (A, B), ask:

| Question | Dependency? |
|---|---|
| Does B need A's output as input? | Yes → A → B |
| Does B need to know A's design decisions? | Yes → A → B |
| Can A and B run with zero knowledge of each other? | No dependency |
| Do A and B produce conflicting changes to the same file? | Yes → sequential (conflict) |

**Common dependency patterns:**

```
Data dependencies:    T1 produces data → T2 consumes data
Design dependencies:  T1 decides schema → T2 implements against schema
File dependencies:    T1 writes file → T2 reads/writes same file
Validation:           T1 produces output → T2 checks it
```

### Step 3: Build the graph

Represent as adjacency list:

```json
{
  "T1": { "deps": [], "produces": ["design_spec"] },
  "T2": { "deps": [], "produces": ["api_endpoints"] },
  "T3": { "deps": [], "produces": ["auth_module"] },
  "T4": { "deps": ["T1", "T2"], "produces": ["connected_ui"] },
  "T5": { "deps": ["T2", "T4"], "produces": ["realtime_ui"] },
  "T6": { "deps": ["T3", "T5"], "produces": ["audit_report"] }
}
```

### Step 4: Detect topology

Traverse the graph to identify execution phases:

```
Phase 1 (parallel): T1, T2, T3  — all have no dependencies
Phase 2 (sequential): T4(depends T1,T2) → T5(depends T2,T4)
Phase 3 (sequential): T6(depends T3,T5)
```

**Algorithm:**
1. Find all nodes with zero dependencies → parallel cluster
2. Remove those nodes, repeat until empty
3. Each iteration is a phase
4. Within a phase, nodes are parallel
5. Between phases, execution is sequential

### Step 5: Assign execution strategy

| Phase type | Strategy | Validation |
|---|---|---|
| Parallel cluster | Spawn all simultaneously, wait for all | Per-agent lightweight validation |
| Sequential chain | Execute in order, validate between stages | Thorough validation at each gate |
| Merge point (parallel → sequential) | Validate cross-branch consistency before proceeding | Thorough consistency check |

## Handling ambiguity

When dependencies are unclear:

1. **Default to parallel** — if you can't prove dependency, assume independence
2. **Validate at merge** — if parallel branches conflict, you'll catch it at the next stage
3. **Over-decompose** — more small subtasks with validation > fewer large unvalidated ones

## File conflict detection

When multiple agents write to the same file:

| Scenario | Resolution |
|---|---|
| Different files | No conflict, parallel OK |
| Same file, different sections | Parallel OK with merge |
| Same file, same section | Must be sequential |
| One reads, one writes | Sequential (read after write) |

For file conflicts, force sequential execution of conflicting subtasks even if no data dependency exists.

## Scaling guidelines

| Total subtasks | Recommended approach |
|---|---|
| 1-2 | Single agent, no orchestration |
| 3-4 | Light orchestration, auto-detect |
| 5-8 | Full orchestration with validation |
| 9-12 | Split into sub-pipelines, validate at boundaries |
| 13+ | Decompose further; 12+ agent pipelines are fragile |
