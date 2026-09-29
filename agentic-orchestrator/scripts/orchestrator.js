/**
 * Agentic Orchestrator - Main coordination engine
 * Manages parallel agent execution with shared state
 */

export const meta = {
  name: "agentic-orchestrator",
  description: "Multi-agent orchestration with specialized parallel agents"
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
    this.listeners = new Map();
  }

  update(agent, data) {
    this.state[agent] = { ...this.state[agent], ...data, status: 'active' };
    this.notifyListeners(agent, data);
  }

  complete(agent, result) {
    this.state[agent] = { ...this.state[agent], ...result, status: 'completed' };
    this.notifyListeners(agent, { status: 'completed' });
  }

  fail(agent, error) {
    this.state[agent].status = 'failed';
    this.state[agent].errors.push(error);
  }

  read(agent) {
    return this.state[agent];
  }

  readAll() {
    return { ...this.state };
  }

  onUpdate(agent, callback) {
    if (!this.listeners.has(agent)) {
      this.listeners.set(agent, []);
    }
    this.listeners.get(agent).push(callback);
  }

  notifyListeners(agent, data) {
    const callbacks = this.listeners.get(agent) || [];
    callbacks.forEach(cb => cb(data));
  }
}

// Agent definitions with capabilities
const agentDefinitions = {
  frontend: {
    name: 'Frontend Agent',
    capabilities: ['ui', 'components', 'styling', 'responsive', 'a11y'],
    subagents: ['component-builder', 'style-specialist', 'a11y-auditor'],
    prompt: `You are a Frontend Specialist Agent. Your responsibilities:
- Design and implement UI components (React/Vue/Angular)
- Create responsive layouts and styling systems
- Ensure accessibility (WCAG compliance)
- Optimize bundle size and performance
- Implement state management patterns

When spawning subagents:
- component-builder: For creating new UI components
- style-specialist: For CSS/styling system design
- a11y-auditor: For accessibility validation

Always write your outputs to the shared state under 'frontend' key.`
  },

  backend: {
    name: 'Backend Agent',
    capabilities: ['api', 'database', 'auth', 'business-logic', 'performance'],
    subagents: ['api-designer', 'db-architect', 'auth-specialist'],
    prompt: `You are a Backend Specialist Agent. Your responsibilities:
- Design and implement RESTful/GraphQL APIs
- Create database schemas and optimize queries
- Implement authentication/authorization
- Write business logic and services
- Optimize performance and caching

When spawning subagents:
- api-designer: For API endpoint design and OpenAPI specs
- db-architect: For database schema design
- auth-specialist: For security implementation

Always write your outputs to the shared state under 'backend' key.`
  },

  security: {
    name: 'Security Agent',
    capabilities: ['vulnerabilities', 'owasp', 'compliance', 'auditing'],
    subagents: ['pen-tester', 'compliance-checker', 'dependency-auditor'],
    prompt: `You are a Security Specialist Agent. Your responsibilities:
- Analyze code for vulnerabilities (OWASP Top 10)
- Review authentication and authorization flows
- Audit dependencies for known CVEs
- Validate input sanitization
- Check for security best practices

When spawning subagents:
- pen-tester: For vulnerability testing
- compliance-checker: For regulatory compliance
- dependency-auditor: For dependency security

Always write your outputs to the shared state under 'security' key.`
  },

  review: {
    name: 'Review Agent',
    capabilities: ['code-quality', 'patterns', 'documentation', 'testing'],
    subagents: ['style-reviewer', 'pattern-checker', 'doc-auditor'],
    prompt: `You are a Code Review Specialist Agent. Your responsibilities:
- Analyze code quality and maintainability
- Check design pattern adherence
- Review documentation completeness
- Validate test coverage
- Suggest refactoring opportunities

When spawning subagents:
- style-reviewer: For code style analysis
- pattern-checker: For design pattern validation
- doc-auditor: For documentation review

Always write your outputs to the shared state under 'review' key.`
  },

  connector: {
    name: 'Connector Agent',
    capabilities: ['integration', 'contracts', 'state-sync', 'conflicts'],
    subagents: ['state-manager', 'contract-validator'],
    prompt: `You are a Connector Agent. Your responsibilities:
- Synchronize state between agents
- Validate interface contracts
- Detect and resolve conflicts
- Manage cross-agent dependencies
- Coordinate integration testing

When spawning subagents:
- state-manager: For shared state operations
- contract-validator: For API contract validation

Always write your outputs to the shared state under 'connector' key.`
  },

  evaluator: {
    name: 'Evaluator Agent',
    capabilities: ['metrics', 'benchmarks', 'quality-scores', 'reports'],
    subagents: ['metrics-collector', 'benchmark-runner'],
    prompt: `You are an Evaluator Agent. Your responsibilities:
- Collect quality metrics from all agents
- Run performance benchmarks
- Calculate quality scores
- Generate comprehensive reports
- Provide actionable recommendations

When spawning subagents:
- metrics-collector: For gathering metrics
- benchmark-runner: For performance testing

Always write your outputs to the shared state under 'evaluation' key.`
  }
};

// Orchestrator class
class Orchestrator {
  constructor(options = {}) {
    this.state = new SharedStateManager();
    this.agents = new Map();
    this.results = [];
    this.timeout = options.timeout || 600000;
    this.maxConcurrent = options.maxConcurrent || 6;
  }

  async orchestrate(task, agentNames = []) {
    const startTime = Date.now();
    phase('Initializing orchestration');

    // Select agents
    const selectedAgents = agentNames.length > 0
      ? agentNames.filter(name => agentDefinitions[name])
      : Object.keys(agentDefinitions);

    log(`Activating ${selectedAgents.length} agents: ${selectedAgents.join(', ')}`);

    // Create agent promises
    const agentPromises = selectedAgents.map(name => this.runAgent(name, task));

    // Run agents in parallel with concurrency limit
    const results = await this.runWithConcurrency(agentPromises, this.maxConcurrent);

    // Connector phase - integrate results
    phase('Integrating agent outputs');
    await this.runAgent('connector', task);

    // Evaluation phase
    phase('Evaluating results');
    await this.runAgent('evaluator', task);

    const duration = Date.now() - startTime;

    // Generate final report
    const report = this.generateReport(task, selectedAgents, duration);

    phase('Orchestration complete');
    log(`Completed in ${duration}ms`);

    return report;
  }

  async runAgent(name, task) {
    const definition = agentDefinitions[name];
    if (!definition) {
      throw new Error(`Unknown agent: ${name}`);
    }

    log(`Starting ${definition.name}...`);

    try {
      // Spawn the agent
      const result = await agent({
        prompt: `${definition.prompt}\n\nTask: ${task}\n\nShared State: ${JSON.stringify(this.state.readAll(), null, 2)}`,
        subagent_type: 'general',
        description: definition.name
      });

      // Update shared state with results
      this.state.complete(name, { result });
      this.results.push({ agent: name, status: 'success', result });

      log(`${definition.name} completed`);
      return result;

    } catch (error) {
      this.state.fail(name, error.message);
      this.results.push({ agent: name, status: 'failed', error: error.message });
      log(`${definition.name} failed: ${error.message}`);
      return null;
    }
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

  generateReport(task, agents, duration) {
    const state = this.state.readAll();

    return {
      task,
      timestamp: new Date().toISOString(),
      duration,
      agents,
      state,
      results: this.results,
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

  const orchestrator = new Orchestrator(options);
  return orchestrator.orchestrate(task, agents);
};

export default main;
