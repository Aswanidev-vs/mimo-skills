/**
 * Agentic Orchestrator v2 - Full implementation with:
 * - Model routing per agent
 * - Bidirectional communication bus
 * - MCP tool integration
 * - Independent subagent spawning
 */

import { AgentCommunicationBus } from './communication.js';
import { ModelRouter, DEFAULT_AGENT_PERMISSIONS } from './model-router.js';
import { MCPToolIntegrator } from './mcp-integrator.js';
import { SubagentSpawner } from './subagent-spawner.js';
import { API_CONFIG, getModelEndpoint, validateApiKeys } from './api-config.js';

export const meta = {
  name: "agentic-orchestrator",
  description: "Multi-agent orchestration with parallel agents, model routing, communication, and independent subagents"
};

// Shared state manager
class SharedStateManager {
  constructor() {
    this.state = {
      frontend: { components: [], styles: [], status: 'idle', errors: [] },
      backend: { apis: [], schemas: [], status: 'idle', errors: [] },
      security: { vulnerabilities: [], recommendations: [], status: 'idle', errors: [] },
      review: { issues: [], suggestions: [], status: 'idle', errors: [] },
      connector: { contracts: [], conflicts: [], status: 'idle', errors: [] },
      evaluation: { metrics: {}, scores: {}, status: 'idle', errors: [] }
    };
    this.history = [];
  }

  update(agent, data) {
    this.state[agent] = { ...this.state[agent], ...data, status: 'active' };
    this.history.push({ agent, data, timestamp: Date.now() });
  }

  complete(agent, result) {
    this.state[agent] = { ...this.state[agent], ...result, status: 'completed' };
    this.history.push({ agent, result, timestamp: Date.now(), type: 'completion' });
  }

  fail(agent, error) {
    this.state[agent].status = 'failed';
    this.state[agent].errors.push(error);
    this.history.push({ agent, error, timestamp: Date.now(), type: 'failure' });
  }

  read(agent) {
    return this.state[agent];
  }

  readAll() {
    return { ...this.state };
  }
}

// Agent definitions with capabilities and tool access
const agentDefinitions = {
  frontend: {
    name: 'Frontend Agent',
    capabilities: ['ui', 'components', 'styling', 'responsive', 'a11y'],
    subagents: ['component-builder', 'style-specialist', 'a11y-auditor'],
    canSpawnSubagents: true,
    canAccessMCP: true,
    prompt: `You are a Frontend Specialist Agent with independent capabilities.

## Your Capabilities
- Spawn your own subagents for specialized tasks
- Access MCP tools and skills
- Communicate with other agents via the communication bus

## When to Spawn Subagents
- component-builder: For creating new UI components
- style-specialist: For CSS/styling system design
- a11y-auditor: For accessibility validation

## Communication Protocol
You can request information from other agents:
- backend: Ask about API contracts and data formats
- security: Request security requirements for UI
- review: Ask for code review of your components

Always write your outputs to the shared state under 'frontend' key.
React to state changes from other agents to coordinate your work.`
  },

  backend: {
    name: 'Backend Agent',
    capabilities: ['api', 'database', 'auth', 'business-logic', 'performance'],
    subagents: ['api-designer', 'db-architect', 'auth-specialist'],
    canSpawnSubagents: true,
    canAccessMCP: true,
    prompt: `You are a Backend Specialist Agent with independent capabilities.

## Your Capabilities
- Spawn your own subagents for specialized tasks
- Access MCP tools and skills
- Communicate with other agents via the communication bus

## When to Spawn Subagents
- api-designer: For API endpoint design and OpenAPI specs
- db-architect: For database schema design
- auth-specialist: For security implementation

## Communication Protocol
You can request information from other agents:
- frontend: Ask about UI requirements and data needs
- security: Request security requirements for APIs
- review: Ask for code review of your implementations

Always write your outputs to the shared state under 'backend' key.
React to state changes from other agents to coordinate your work.`
  },

  security: {
    name: 'Security Agent',
    capabilities: ['vulnerabilities', 'owasp', 'compliance', 'auditing'],
    subagents: ['pen-tester', 'compliance-checker', 'dependency-auditor'],
    canSpawnSubagents: true,
    canAccessMCP: true,
    prompt: `You are a Security Specialist Agent with independent capabilities.

## Your Capabilities
- Spawn your own subagents for specialized tasks
- Access MCP tools and skills
- Communicate with other agents via the communication bus

## When to Spawn Subagents
- pen-tester: For vulnerability testing
- compliance-checker: For regulatory compliance
- dependency-auditor: For dependency security

## Communication Protocol
You can broadcast security requirements to all agents:
- frontend: Provide input validation requirements
- backend: Provide API security requirements
- review: Flag security issues in code

Always write your outputs to the shared state under 'security' key.
Proactively scan other agents' outputs for security issues.`
  },

  review: {
    name: 'Review Agent',
    capabilities: ['code-quality', 'patterns', 'documentation', 'testing'],
    subagents: ['style-reviewer', 'pattern-checker', 'doc-auditor'],
    canSpawnSubagents: true,
    canAccessMCP: true,
    prompt: `You are a Code Review Specialist Agent with independent capabilities.

## Your Capabilities
- Spawn your own subagents for specialized tasks
- Access MCP tools and skills
- Communicate with other agents via the communication bus

## When to Spawn Subagents
- style-reviewer: For code style analysis
- pattern-checker: For design pattern validation
- doc-auditor: For documentation review

## Communication Protocol
You can request code from other agents for review:
- frontend: Review component code
- backend: Review API implementations
- security: Review security implementations

Always write your outputs to the shared state under 'review' key.
Provide feedback to other agents on code quality.`
  },

  connector: {
    name: 'Connector Agent',
    capabilities: ['integration', 'contracts', 'state-sync', 'conflicts'],
    subagents: ['state-manager', 'contract-validator'],
    canSpawnSubagents: true,
    canAccessMCP: true,
    prompt: `You are a Connector Agent with independent capabilities.

## Your Capabilities
- Spawn your own subagents for specialized tasks
- Access MCP tools and skills
- Monitor and coordinate all other agents

## When to Spawn Subagents
- state-manager: For shared state operations
- contract-validator: For API contract validation

## Your Role
- Monitor state changes from all agents
- Detect and resolve conflicts between agents
- Validate interface contracts between frontend and backend
- Coordinate cross-agent dependencies

Always write your outputs to the shared state under 'connector' key.
Act as the central coordination point for all agents.`
  },

  evaluator: {
    name: 'Evaluator Agent',
    capabilities: ['metrics', 'benchmarks', 'quality-scores', 'reports'],
    subagents: ['metrics-collector', 'benchmark-runner'],
    canSpawnSubagents: true,
    canAccessMCP: true,
    prompt: `You are an Evaluator Agent with independent capabilities.

## Your Capabilities
- Spawn your own subagents for specialized tasks
- Access MCP tools and skills
- Analyze outputs from all other agents

## When to Spawn Subagents
- metrics-collector: For gathering metrics
- benchmark-runner: For performance testing

## Your Role
- Collect outputs from all agents
- Calculate quality scores
- Generate comprehensive reports
- Provide actionable recommendations

Always write your outputs to the shared state under 'evaluation' key.
Provide final assessment of the overall project quality.`
  }
};

// Orchestrator class
class Orchestrator {
  constructor(options = {}) {
    this.state = new SharedStateManager();
    this.bus = new AgentCommunicationBus();
    this.modelRouter = new ModelRouter(options.modelConfig || {});
    this.toolIntegrator = new MCPToolIntegrator();
    this.subagentSpawner = new SubagentSpawner(this.bus, this.modelRouter, this.toolIntegrator);
    this.agents = new Map();
    this.results = [];
    this.timeout = options.timeout || 600000;
    this.maxConcurrent = options.maxConcurrent || 6;

    this.setupDefaultPermissions();
    this.setupCommunicationChannels();
  }

  setupDefaultPermissions() {
    for (const [agentId, perms] of Object.entries(DEFAULT_AGENT_PERMISSIONS)) {
      this.toolIntegrator.setAgentPermissions(agentId, perms);
    }
  }

  setupCommunicationChannels() {
    // Create channels for agent communication
    this.bus.createChannel('general');
    this.bus.createChannel('security-alerts');
    this.bus.createChannel('state-updates');
    this.bus.createChannel('requests');
  }

  async orchestrate(task, agentNames = []) {
    const startTime = Date.now();
    phase('Initializing orchestration');

    // Select agents
    const selectedAgents = agentNames.length > 0
      ? agentNames.filter(name => agentDefinitions[name])
      : Object.keys(agentDefinitions);

    log(`Activating ${selectedAgents.length} agents: ${selectedAgents.join(', ')}`);

    // Get model assignments
    const modelAssignments = {};
    for (const name of selectedAgents) {
      modelAssignments[name] = this.modelRouter.optimizeSelection(name, task);
    }
    log('Model assignments:', modelAssignments);

    // Create agent promises with communication context
    const agentPromises = selectedAgents.map(name =>
      this.runAgent(name, task, modelAssignments[name])
    );

    // Run agents in parallel with concurrency limit
    const results = await this.runWithConcurrency(agentPromises, this.maxConcurrent);

    // Connector phase - integrate results
    phase('Integrating agent outputs');
    await this.runAgent('connector', task, this.modelRouter.getModel('connector'));

    // Evaluation phase
    phase('Evaluating results');
    await this.runAgent('evaluator', task, this.modelRouter.getModel('evaluator'));

    const duration = Date.now() - startTime;

    // Generate final report
    const report = this.generateReport(task, selectedAgents, duration, modelAssignments);

    phase('Orchestration complete');
    log(`Completed in ${duration}ms`);

    return report;
  }

  async runAgent(name, task, model) {
    const definition = agentDefinitions[name];
    if (!definition) {
      throw new Error(`Unknown agent: ${name}`);
    }

    // Resolve API endpoint for this model
    const endpoint = getModelEndpoint(model);
    log(`Starting ${definition.name} (model: ${model}, provider: ${endpoint.provider})...`);

    // Subscribe to general channel
    this.bus.subscribe(name, 'general', (message) => {
      log(`${name} received broadcast from ${message.sender}`);
    });

    try {
      // Get tool context for this agent
      const toolContext = this.toolIntegrator.generateAgentContext(name, {
        task,
        state: this.state.readAll(),
        apiEndpoint: endpoint
      });

      // Build comprehensive prompt
      const fullPrompt = this.buildAgentPrompt(name, definition, task, toolContext);

      // Spawn the agent with model-specific configuration
      const result = await agent({
        prompt: fullPrompt,
        subagent_type: 'general',
        description: definition.name,
        timeout_ms: this.timeout,
        model: model,
        apiEndpoint: endpoint
      });

      // Update shared state with results
      this.state.complete(name, { result });
      this.results.push({ agent: name, status: 'success', result, model });

      // Log model usage
      this.modelRouter.logUsage(name, model, result?.tokens || 0, Date.now());

      // Broadcast completion
      this.bus.publish('general', {
        sender: name,
        type: 'completion',
        payload: { status: 'completed' }
      });

      log(`${definition.name} completed`);
      return result;

    } catch (error) {
      this.state.fail(name, error.message);
      this.results.push({ agent: name, status: 'failed', error: error.message, model });

      // Broadcast failure
      this.bus.publish('general', {
        sender: name,
        type: 'error',
        payload: { status: 'failed', error: error.message }
      });

      log(`${definition.name} failed: ${error.message}`);
      return null;
    }
  }

  buildAgentPrompt(name, definition, task, toolContext) {
    const communicationInstructions = `
## Communication Bus
You are connected to a communication bus. Other agents are working on the same task.
You can:
1. Broadcast messages to all agents via the 'general' channel
2. Send direct messages to specific agents
3. React to messages from other agents

Current state of other agents:
${Object.entries(this.state.readAll())
  .filter(([key]) => key !== name)
  .map(([key, val]) => `- ${key}: ${val.status}`)
  .join('\n')}
`;

    const toolInstructions = toolContext.instructions || '';
    const mcpInstructions = toolContext.mcpServers.length > 0
      ? `\n\n## MCP Servers\nConnected to: ${toolContext.mcpServers.join(', ')}`
      : '';

    return `${definition.prompt}

## Task
${task}

${communicationInstructions}

${toolInstructions}

${mcpInstructions}

## Subagent Spawning
You can spawn specialized subagents to handle specific tasks.
Available subagents: ${definition.subagents.join(', ')}
To spawn a subagent, describe the task and the subagent type needed.

## Output
Provide your output in a structured format that can be written to shared state.
Include:
1. Summary of your work
2. Key findings or outputs
3. Any issues or blockers
4. Recommendations for other agents`;
  }

  async runWithConcurrency(promises, maxConcurrent) {
    const results = [];
    const executing = new Set();

    for (const promise of promises) {
      const wrapped = promise.then(result => {
        executing.delete(wrapped);
        return result;
      });
      executing.add(wrapped);
      results.push(wrapped);

      if (executing.size >= maxConcurrent) {
        await Promise.race(executing);
      }
    }

    return Promise.all(results);
  }

  generateReport(task, agents, duration, modelAssignments) {
    const state = this.state.readAll();
    const modelStats = this.modelRouter.getStats();
    const communicationHistory = this.bus.getHistory();
    const spawnHistory = this.subagentSpawner.getSpawnHistory();

    return {
      task,
      timestamp: new Date().toISOString(),
      duration,
      agents,
      modelAssignments,
      state,
      results: this.results,
      communication: {
        totalMessages: communicationHistory.length,
        channels: Array.from(this.bus.channels.keys())
      },
      subagents: {
        totalSpawned: spawnHistory.length,
        history: spawnHistory
      },
      modelUsage: modelStats,
      summary: {
        total: agents.length,
        successful: this.results.filter(r => r.status === 'success').length,
        failed: this.results.filter(r => r.status === 'failed').length
      }
    };
  }
}

// Main workflow function
const main = async (args) => {
  const { task, agents = [], options = {} } = args || {};

  if (!task) {
    log('Error: No task specified');
    return { error: 'Task is required' };
  }

  // Validate API keys on startup
  const apiValidation = validateApiKeys();
  if (!apiValidation.valid) {
    log(`Warning: Missing API keys: ${apiValidation.missing.join(', ')}`);
    log('Some models may not be available. Check .env file.');
  }

  const orchestrator = new Orchestrator(options);
  return orchestrator.orchestrate(task, agents);
};

export default main;
