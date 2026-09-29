---
name: agentic-orchestrator
description: Multi-agent orchestration system with specialized parallel agents for frontend, backend, review, security, integration, and evaluation. Use when building complex applications requiring coordinated multi-domain expertise, when tasks span multiple technical domains simultaneously, or when you need parallel specialist analysis with shared state coordination.
---

# Agentic Orchestrator v2.0.1

Coordinate multiple specialized agents running in parallel with model routing, bidirectional communication, MCP tool access, and independent subagent spawning.

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATOR                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Model      │  │ Communication│  │ MCP Tool     │          │
│  │   Router     │  │     Bus      │  │ Integrator   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         ▼                 ▼                 ▼                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    AGENT LAYER                           │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │   │
│  │  │Frontend │ │ Backend │ │Security │ │ Review  │      │   │
│  │  │ [std]   │ │ [front] │ │ [front] │ │ [std]   │      │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘      │   │
│  │       │           │           │           │             │   │
│  │       ▼           ▼           ▼           ▼             │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │           SUBAGENT SPAWNER                       │   │   │
│  │  │  Each agent spawns specialized subagents         │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              CONNECTOR AGENT                             │   │
│  │         (State Sync & Contract Validation)               │   │
│  └─────────────────────┬───────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              EVALUATOR AGENT                             │   │
│  │         (Metrics & Quality Analysis)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Model Routing
Each agent gets assigned the optimal model from available free and custom models:

| Agent | Tier | Models (rotate equally) |
|-------|------|-------------------------|
| **security** | frontier | `mimo-v2.5`, `minimax-m3`, `nemotron-3-ultra-550b:free` |
| **backend** | frontier | `minimax-m3`, `qwen3-coder:free`, `mimo-v2.5` |
| **frontend** | standard | `qwen3-coder:free`, `gemma-4-31b-it:free` |
| **review** | standard | `gemma-4-31b-it:free`, `llama-3.3-70b:free` |
| **evaluator** | frontier | `minimax-m3`, `mimo-v2.5`, `qwen3.5-122b` |
| **connector** | lite | `lfm-2.5-1.2b:free`, `nemotron-nano-9b:free` |

**API Providers:**
- OpenRouter: Free tier models (qwen, gemma, llama, etc.)
- NVIDIA NIM: Free endpoints (nemotron, deepseek, qwen3.5)
- Plan TokenRouter: MiniMax M3, M2.7
- MiMo: Your custom v2.5 model

### 2. Bidirectional Communication Bus
Agents communicate in real-time:

```javascript
// Broadcast to all agents
bus.publish('general', { sender: 'security', type: 'alert', payload: {...} });

// Direct agent-to-agent message
bus.sendToAgent('frontend', 'backend', { request: 'api-contract' });

// Request-response pattern
const response = await bus.request('frontend', 'backend', { endpoints: [...] });
```

### 3. MCP Tool Integration
Each agent has access to tools and skills:

```javascript
// Frontend agent tools: read, write, edit, glob, grep, bash
// Backend agent tools: read, write, edit, glob, grep, bash, webfetch
// Security agent tools: read, glob, grep, bash, webfetch
// Review agent tools: read, glob, grep
```

### 4. Independent Subagent Spawning
Each agent can spawn specialized subagents:

```
Frontend Agent
├── component-builder (UI components)
├── style-specialist (CSS systems)
└── a11y-auditor (accessibility)

Backend Agent
├── api-designer (REST/GraphQL)
├── db-architect (schemas)
└── auth-specialist (security)

Security Agent
├── pen-tester (vulnerabilities)
├── compliance-checker (OWASP)
└── dependency-auditor (CVEs)
```

## Usage

### Basic Parallel Execution
```javascript
const result = await workflow('agentic-orchestrator', {
  task: 'Build a secure authentication system',
  agents: ['frontend', 'backend', 'security']
});
```

### With Custom Model Configuration
```javascript
const result = await workflow('agentic-orchestrator', {
  task: 'Analyze codebase security',
  agents: ['security', 'review'],
  options: {
    modelConfig: {
      security: { primary: 'frontier', fallback: 'frontier' }
    }
  }
});
```

### With Subagent Spawning
```javascript
const result = await workflow('agentic-orchestrator', {
  task: 'Build complete user dashboard',
  agents: ['frontend', 'backend'],
  options: {
    maxConcurrent: 4,
    timeout: 600000
  }
});
```

## Communication Patterns

### 1. Broadcast Pattern
```javascript
// Security agent alerts all others
bus.publish('security-alerts', {
  sender: 'security',
  type: 'vulnerability-found',
  payload: { severity: 'high', component: 'auth' }
});
```

### 2. Request-Response
```javascript
// Frontend asks backend for API contract
const contract = await bus.request('frontend', 'backend', {
  type: 'api-contract',
  endpoints: ['POST /users', 'GET /users/:id']
});
```

### 3. State Synchronization
```javascript
// Agents read/write to shared state
state.update('frontend', { components: ['LoginForm'] });
const frontendState = state.read('frontend');
```

## Output Format

```json
{
  "task": "Build authentication system",
  "duration": 45000,
  "modelAssignments": {
    "frontend": "qwen/qwen3-coder:free",
    "backend": "minimax-m3",
    "security": "mimo-v2.5"
  },
  "providers": {
    "frontend": "openrouter",
    "backend": "planTokenRouter",
    "security": "mimo"
  },
  "communication": {
    "totalMessages": 24,
    "channels": ["general", "security-alerts", "state-updates"]
  },
  "subagents": {
    "totalSpawned": 8,
    "history": [...]
  },
  "modelUsage": {
    "totalCalls": 6,
    "totalCost": 0,
    "costByAgent": { "frontend": 0, "backend": 0, "security": 0 }
  },
  "summary": {
    "total": 3,
    "successful": 3,
    "failed": 0
  }
}
```

## Error Handling

- Agent failures don't block other agents
- Model fallback on primary model failure
- Communication bus handles message delivery failures
- Subagent timeouts don't affect parent agent
- Evaluator includes failed agent analysis in reports

## Best Practices

1. **Configure API keys**: Copy `.env.example` to `.env` and add your keys
2. **Use appropriate agents**: Not all agents needed for every task
3. **Monitor communication**: Check bus history for coordination issues
4. **Leverage subagents**: Let agents delegate specialized work
5. **Trust the evaluator**: Final scores indicate overall quality
