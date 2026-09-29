/**
 * Subagent Spawner - Allows agents to independently spawn their own subagents
 */

export class SubagentSpawner {
  constructor(communicationBus, modelRouter, toolIntegrator) {
    this.bus = communicationBus;
    this.modelRouter = modelRouter;
    this.toolIntegrator = toolIntegrator;
    this.activeAgents = new Map();
    this.agentHierarchy = new Map();
    this.spawnHistory = [];
  }

  /**
   * Spawn a subagent from a parent agent
   */
  async spawnSubagent(parentAgentId, subagentConfig) {
    const {
      type,
      task,
      context = {},
      timeout = 600000,
      independent = false
    } = subagentConfig;

    const subagentId = `${parentAgentId}_${type}_${Date.now()}`;
    const model = this.modelRouter.getModel(parentAgentId, context.complexity || 'standard');

    // Get tool context for subagent
    const toolContext = this.toolIntegrator.generateAgentContext(parentAgentId, {
      parentAgent: parentAgentId,
      subagentType: type
    });

    // Register in hierarchy
    if (!this.agentHierarchy.has(parentAgentId)) {
      this.agentHierarchy.set(parentAgentId, new Set());
    }
    this.agentHierarchy.get(parentAgentId).add(subagentId);

    // Track active agent
    this.activeAgents.set(subagentId, {
      id: subagentId,
      parent: parentAgentId,
      type,
      model,
      status: 'spawning',
      startedAt: Date.now(),
      independent
    });

    // Create communication channel for this subagent
    const channel = `subagent:${subagentId}`;
    this.bus.createChannel(channel);

    // Subscribe parent to subagent updates
    this.bus.subscribe(parentAgentId, channel, (message) => {
      this.handleSubagentMessage(parentAgentId, subagentId, message);
    });

    log(`Spawning subagent ${subagentId} (model: ${model})`);

    try {
      // Spawn the actual agent
      const result = await agent({
        prompt: this.buildSubagentPrompt(type, task, context, toolContext),
        subagent_type: 'general',
        description: `Subagent: ${type} for ${parentAgentId}`,
        timeout_ms: timeout
      });

      // Update status
      this.activeAgents.get(subagentId).status = 'completed';
      this.activeAgents.get(subagentId).result = result;
      this.activeAgents.get(subagentId).completedAt = Date.now();

      // Publish completion
      this.bus.publish(channel, {
        sender: subagentId,
        type: 'completion',
        payload: { status: 'completed', result }
      });

      // Log spawn
      this.spawnHistory.push({
        subagentId,
        parentAgentId,
        type,
        model,
        status: 'completed',
        duration: Date.now() - this.activeAgents.get(subagentId).startedAt
      });

      return { subagentId, result };

    } catch (error) {
      this.activeAgents.get(subagentId).status = 'failed';
      this.activeAgents.get(subagentId).error = error.message;

      this.bus.publish(channel, {
        sender: subagentId,
        type: 'error',
        payload: { status: 'failed', error: error.message }
      });

      this.spawnHistory.push({
        subagentId,
        parentAgentId,
        type,
        model,
        status: 'failed',
        error: error.message
      });

      return { subagentId, error: error.message };
    }
  }

  /**
   * Spawn multiple subagents in parallel
   */
  async spawnParallel(parentAgentId, subagentConfigs) {
    const promises = subagentConfigs.map(config =>
      this.spawnSubagent(parentAgentId, config)
    );
    return Promise.all(promises);
  }

  /**
   * Build prompt for subagent
   */
  buildSubagentPrompt(type, task, context, toolContext) {
    const subagentPrompts = {
      'component-builder': `You are a UI Component Builder. Create reusable, well-structured UI components.`,
      'style-specialist': `You are a Style Specialist. Design and implement consistent styling systems.`,
      'a11y-auditor': `You are an Accessibility Auditor. Validate and improve accessibility compliance.`,
      'api-designer': `You are an API Designer. Design clean, RESTful API interfaces.`,
      'db-architect': `You are a Database Architect. Design efficient database schemas.`,
      'auth-specialist': `You are an Authentication Specialist. Implement secure auth systems.`,
      'pen-tester': `You are a Penetration Tester. Identify security vulnerabilities.`,
      'compliance-checker': `You are a Compliance Checker. Validate regulatory compliance.`,
      'dependency-auditor': `You are a Dependency Auditor. Analyze dependency security.`,
      'style-reviewer': `You are a Style Reviewer. Analyze code style and conventions.`,
      'pattern-checker': `You are a Pattern Checker. Validate design pattern usage.`,
      'doc-auditor': `You are a Documentation Auditor. Review documentation completeness.`,
      'state-manager': `You are a State Manager. Synchronize shared state between agents.`,
      'contract-validator': `You are a Contract Validator. Validate interface contracts.`,
      'metrics-collector': `You are a Metrics Collector. Gather and analyze quality metrics.`,
      'benchmark-runner': `You are a Benchmark Runner. Execute performance benchmarks.`
    };

    const basePrompt = subagentPrompts[type] || `You are a specialized ${type} agent.`;

    return `${basePrompt}

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Available Tools: ${toolContext.availableTools.map(t => t.name).join(', ')}
Available Skills: ${toolContext.availableSkills.map(s => s.name).join(', ')}

Instructions:
1. Complete the assigned task thoroughly
2. Write results to shared state when possible
3. Report any issues or blockers immediately
4. Follow security best practices
5. Document your decisions and rationale`;
  }

  /**
   * Handle messages from subagents
   */
  handleSubagentMessage(parentId, subagentId, message) {
    const agent = this.activeAgents.get(subagentId);
    if (!agent) return;

    switch (message.type) {
      case 'completion':
        log(`Subagent ${subagentId} completed for ${parentId}`);
        break;
      case 'error':
        log(`Subagent ${subagentId} failed: ${message.payload.error}`);
        break;
      case 'progress':
        log(`Subagent ${subagentId} progress: ${message.payload.percent}%`);
        break;
    }
  }

  /**
   * Get status of all subagents for an agent
   */
  getSubagentStatus(agentId) {
    const subagents = this.agentHierarchy.get(agentId) || new Set();
    return Array.from(subagents).map(id => this.activeAgents.get(id)).filter(Boolean);
  }

  /**
   * Get status of a specific subagent
   */
  getSubagentInfo(subagentId) {
    return this.activeAgents.get(subagentId);
  }

  /**
   * Cancel a running subagent
   */
  async cancelSubagent(subagentId) {
    const agent = this.activeAgents.get(subagentId);
    if (!agent) return false;

    agent.status = 'cancelled';
    agent.cancelledAt = Date.now();

    const channel = `subagent:${subagentId}`;
    this.bus.publish(channel, {
      sender: subagentId,
      type: 'cancelled',
      payload: { status: 'cancelled' }
    });

    return true;
  }

  /**
   * Get spawn history for debugging
   */
  getSpawnHistory(filter = {}) {
    let history = [...this.spawnHistory];

    if (filter.parentAgentId) {
      history = history.filter(h => h.parentAgentId === filter.parentAgentId);
    }
    if (filter.status) {
      history = history.filter(h => h.status === filter.status);
    }

    return history;
  }
}
