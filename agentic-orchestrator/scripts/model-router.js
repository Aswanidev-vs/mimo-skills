/**
 * Model Router - Assigns different models to different agents
 * Uses free models from OpenRouter, NVIDIA, plus MiMo v2.5 and MiniMax M3
 */

const MODEL_TIERS = {
  frontier: {
    models: [
      'mimo-v2.5',
      'minimax-m3',
      'nvidia/nemotron-3-ultra-550b-a55b:free',
      'nousresearch/hermes-3-llama-3.1-405b:free'
    ],
    costPerToken: 0,
    capabilities: ['complex-reasoning', 'code-generation', 'analysis']
  },
  standard: {
    models: [
      'qwen/qwen3-coder:free',
      'google/gemma-4-31b-it:free',
      'qwen/qwen3.5-122b-a10b',
      'meta-llama/llama-3.3-70b-instruct:free'
    ],
    costPerToken: 0,
    capabilities: ['code-generation', 'analysis', 'fast-response']
  },
  lite: {
    models: [
      'liquid/lfm-2.5-1.2b-instruct:free',
      'nvidia/nemotron-nano-9b-v2:free',
      'nvidia/nemotron-3-nano-30b-a3b:free'
    ],
    costPerToken: 0,
    capabilities: ['simple-tasks', 'formatting', 'validation']
  }
};

const AGENT_MODEL_CONFIG = {
  frontend: {
    primary: 'standard',
    fallback: 'lite',
    reasoning: 'standard',
    description: 'Fast iteration for UI components'
  },
  backend: {
    primary: 'frontier',
    fallback: 'standard',
    reasoning: 'frontier',
    description: 'Complex business logic and APIs'
  },
  security: {
    primary: 'frontier',
    fallback: 'frontier',
    reasoning: 'frontier',
    description: 'Deepest reasoning for vulnerability analysis'
  },
  review: {
    primary: 'standard',
    fallback: 'standard',
    reasoning: 'frontier',
    description: 'Good analysis balance'
  },
  connector: {
    primary: 'lite',
    fallback: 'lite',
    reasoning: 'standard',
    description: 'Fast mechanical state operations'
  },
  evaluator: {
    primary: 'frontier',
    fallback: 'standard',
    reasoning: 'frontier',
    description: 'Metrics need strong reasoning'
  }
};

export class ModelRouter {
  constructor(config = {}) {
    this.config = { ...AGENT_MODEL_CONFIG, ...config.customAgents };
    this.tiers = { ...MODEL_TIERS, ...config.customTiers };
    this.usageLog = [];
    this.costTracker = { total: 0, byAgent: {} };
    this.rotationIndex = {};
  }

  /**
   * Get model for agent based on task complexity (rotates through pool)
   */
  getModel(agentId, taskComplexity = 'standard') {
    const agentConfig = this.config[agentId];
    if (!agentConfig) {
      return this.tiers.standard.models[0];
    }

    let tier;
    switch (taskComplexity) {
      case 'complex':
      case 'critical':
        tier = agentConfig.reasoning;
        break;
      case 'simple':
        tier = this.tiers[agentConfig.fallback] ? agentConfig.fallback : 'lite';
        break;
      default:
        tier = agentConfig.primary;
    }

    const models = this.tiers[tier].models;

    // Rotate through available models for equal distribution
    if (!this.rotationIndex[agentId]) {
      this.rotationIndex[agentId] = {};
    }
    if (!this.rotationIndex[agentId][tier]) {
      this.rotationIndex[agentId][tier] = 0;
    }

    const index = this.rotationIndex[agentId][tier] % models.length;
    this.rotationIndex[agentId][tier]++;

    return models[index];
  }

  /**
   * Get model with fallback
   */
  getModelWithFallback(agentId, taskComplexity = 'standard') {
    const primary = this.getModel(agentId, taskComplexity);
    const agentConfig = this.config[agentId];
    const fallback = this.tiers[agentConfig.fallback].models[0];

    return { primary, fallback };
  }

  /**
   * Get all models in a tier
   */
  getModelsInTier(tier) {
    return this.tiers[tier]?.models || [];
  }

  /**
   * Estimate cost for task
   */
  estimateCost(agentId, taskComplexity, estimatedTokens = 10000) {
    const tier = this.config[agentId]?.primary || 'standard';
    const costPerToken = this.tiers[tier].costPerToken;
    return estimatedTokens * costPerToken;
  }

  /**
   * Log model usage
   */
  logUsage(agentId, model, tokens, duration) {
    const cost = this.tiers[this.config[agentId]?.primary]?.costPerToken * tokens || 0;

    this.usageLog.push({
      agentId,
      model,
      tokens,
      duration,
      cost,
      timestamp: Date.now()
    });

    this.costTracker.total += cost;
    this.costTracker.byAgent[agentId] = (this.costTracker.byAgent[agentId] || 0) + cost;
  }

  /**
   * Get usage statistics
   */
  getStats() {
    return {
      totalCalls: this.usageLog.length,
      totalCost: this.costTracker.total,
      costByAgent: this.costTracker.byAgent,
      usageByAgent: this.usageLog.reduce((acc, log) => {
        acc[log.agentId] = (acc[log.agentId] || 0) + 1;
        return acc;
      }, {}),
      modelsUsed: [...new Set(this.usageLog.map(l => l.model))]
    };
  }

  /**
   * Optimize model selection based on task
   */
  optimizeSelection(agentId, task) {
    const taskLower = task.toLowerCase();

    // Detect complexity signals
    const isComplex = /security|audit|vulnerability|architecture|design pattern|encrypt|auth/.test(taskLower);
    const isSimple = /format|validate|check|list|sort|display/.test(taskLower);

    const complexity = isComplex ? 'complex' : isSimple ? 'simple' : 'standard';
    return this.getModel(agentId, complexity);
  }
}
