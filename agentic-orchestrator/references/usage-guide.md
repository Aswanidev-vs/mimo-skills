# Usage Guide

## Quick Start

### Basic Parallel Analysis
```javascript
// Run all agents in parallel
const result = await workflow('agentic-orchestrator', {
  task: 'Analyze this codebase for quality and security',
  agents: ['frontend', 'backend', 'security', 'review']
});
```

### Selective Agent Execution
```javascript
// Run only specific agents
const result = await workflow('agentic-orchestrator', {
  task: 'Review API security',
  agents: ['backend', 'security']
});
```

## Agent Selection Guide

| Task Type | Recommended Agents |
|-----------|-------------------|
| New Feature | frontend, backend, review |
| Security Audit | security, review |
| Code Review | review, security |
| Performance | backend, evaluator |
| Full Analysis | All agents |

## Configuration Options

```javascript
const result = await workflow('agentic-orchestrator', {
  task: 'Your task here',
  agents: ['frontend', 'backend'],
  options: {
    timeout: 300000,        // 5 minutes
    maxConcurrent: 4,       // Max parallel agents
    retryOnFailure: true    // Auto-retry failed agents
  }
});
```

## Understanding Results

### Result Structure
```javascript
{
  task: "Your task",
  timestamp: "2026-06-21T...",
  duration: 45000,
  agents: ["frontend", "backend", "security"],
  summary: {
    total: 3,
    successful: 2,
    failed: 1
  },
  state: {
    frontend: { status: "completed", components: [...] },
    backend: { status: "completed", apis: [...] },
    security: { status: "failed", errors: [...] }
  }
}
```

### Reading Agent Outputs
```javascript
const frontendOutput = result.state.frontend;
const backendOutput = result.state.backend;
const securityOutput = result.state.security;
```

## Spawning Subagents

Each agent can spawn specialized subagents for deeper analysis:

```javascript
// Inside an agent's execution
const componentResult = await agent.spawn('component-builder', {
  component_name: 'LoginForm',
  framework: 'react',
  props: { onSubmit: 'function' }
});
```

## Error Handling

- Failed agents don't block others
- Check `result.state[agent].errors` for failure details
- Connector agent reports cross-agent conflicts
- Evaluator includes failed agent analysis

## Best Practices

1. **Start broad, then narrow**: Run all agents first, then focus on specific areas
2. **Use priorities**: Mark critical agents for faster execution
3. **Monitor shared state**: Check state updates during execution
4. **Review evaluator output**: Final scores indicate overall quality
5. **Iterate**: Use results to spawn follow-up agents for specific issues
