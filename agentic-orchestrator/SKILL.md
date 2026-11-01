---
name: agentic-orchestrator
description: Parallel specialist orchestration for multi-domain tasks. Use when a task spans multiple independent technical domains (frontend + backend + security + review) that can run concurrently and benefit from specialist agents with shared state. For sequential/dependent pipelines use swarm-orchestrator; for auto topology detection use unified-orchestrator.
---

# Agentic Orchestrator (Parallel Specialists)

Coordinate independent specialist agents running in parallel, sharing state, with model-tier routing and a final evaluation pass. Built on MiMoCode primitives: `actor` (spawn/run/send/wait/status/cancel) and `task` (tracking).

## When to use
- Task spans multiple technical domains that are largely independent (UI, API, security, review).
- You want parallel specialist analysis with a shared contract/state.
- Each domain can be owned by one agent without strong ordering.

## When NOT to use
- Subtasks are strictly sequential (output of A feeds B) → `swarm-orchestrator`.
- You don't know the topology → `unified-orchestrator`.
- Single agent with tools suffices → don't orchestrate.
- Real-time/latency-critical paths.

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

## Primitives mapping
- **Spawn specialists:** `actor` `spawn` with `subagent_type` (explore/general) and a focused prompt. Bind to a task via `task_id`.
- **Track work:** `task` create/start/done per specialist.
- **Communicate:** `actor` `send` for targeted messages; shared state via a single agreed contract document (file) that each agent reads/writes.
- **Synchronize:** `actor` `wait` on each actor_id; `status` to poll.
- **Cancel:** `actor` `cancel` if a specialist is stuck.

## Specialist roster (typical)
| Specialist | Role | Model tier | Tools |
|---|---|---|---|
| frontend | UI components, styles, a11y | standard | read, write, edit, glob, grep, bash |
| backend | API, DB, auth | frontier | read, write, edit, glob, grep, bash, webfetch |
| security | vulnerabilities, OWASP, deps | frontier | read, glob, grep, bash, webfetch |
| review | code review, conventions | standard | read, glob, grep |
| connector | state sync, contract validation | lite | read, write, edit, glob, grep |
| evaluator | final metrics/quality | frontier | read, glob, grep |

Model tiers: frontier = strongest available; standard = mid; lite = cheapest. Pick from configured providers; always define a fallback tier. Note: some models don't support parallel tool calls — disable that flag for those (e.g., o3-mini/o3/o4-mini family).

## Workflow
1. **Decompose** the task into specialist subtasks; create a `task` per specialist; note the shared contract (API schema, file paths, naming).
2. **Spawn** specialists in parallel via `actor spawn` (one message, multiple calls). Pass the contract and their scope; set `task_id`.
3. **Shared state:** specialists read/write an agreed contract file (e.g., `docs/contract.md` or a JSON schema). Connector validates it.
4. **Synchronize:** `wait` on each actor; on timeout, `status` + `send` for progress; `cancel` if unrecoverable.
5. **Evaluate:** evaluator scores completeness/correctness/consistency; report weak links.
6. **Mark tasks done** only when verified.

## Communication patterns
- **Broadcast (contract update):** write to the shared contract file; all specialists re-read on next step.
- **Request-response:** `actor send` to a specific specialist actor_id with a question; result arrives as a completion notification.
- **State sync:** connector agent reads all specialist outputs and reconciles.

## Termination conditions
Stop a specialist run when any holds:
- Specialist reports completion with evidence.
- `wait` times out and `status` shows no progress after a `send`.
- Evaluator score below threshold → escalate, don't silently accept.
- Budget cap exceeded.

## Guardrails (per specialist output)
Each specialist output must pass before merge:
1. **Scope check:** only requested changes; no unrequested features.
2. **Convention check:** matches neighboring code.
3. **Contract check:** conforms to shared schema.
4. **Evidence check:** claims backed by file:line or test output.

On failure: reject with feedback and re-run (max 2 retries); then escalate to user.

## Handoff schema (between specialists)
```json
{
  "from": "backend",
  "to": "frontend",
  "type": "api-contract",
  "payload": { "endpoints": ["POST /users"] },
  "evidence": ["src/api/users.ts:12"],
  "confidence": 0.9
}
```

## Error handling
- One specialist failing doesn't block others; evaluator includes failed-agent analysis.
- Model fallback: on primary failure, retry with fallback tier.
- Communication failures: re-send with backoff; if persistent, escalate.
- Subagent (nested) timeouts don't affect parent.

## Output format
```json
{
  "task": "...",
  "duration_ms": 0,
  "model_assignments": { "frontend": "standard", "backend": "frontier" },
  "communication": { "messages": 0, "channels": [] },
  "specialists": { "total": 0, "successful": 0, "failed": 0 },
  "evaluation": { "score": 0.0, "weak_links": [] },
  "summary": "..."
}
```

## Anti-patterns
1. Spawning 5 specialists when 1 with tools suffices.
2. No shared contract → integration chaos.
3. Same model tier for all → waste or under-power.
4. Skipping evaluation → unchecked output ships.
5. Orphaning tasks (not marking done/blocked).

## Best practices
1. Configure API keys before running; define model tiers in project config.
2. Use only the specialists the task needs.
3. Keep the shared contract minimal and versioned.
4. Trust the evaluator's final score; escalate low scores.
5. Bind every spawned actor to a `task_id` for traceability.
file_path">
C:\Users\LENOVO\.local\share\mimocode\skills\agentic-orchestrator\SKILL.md