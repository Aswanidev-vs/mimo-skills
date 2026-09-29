/**
 * API Configuration - Stores API keys and endpoints
 * Load from environment variables or .env file
 */

const API_CONFIG = {
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    models: {
      frontier: [
        'nvidia/nemotron-3-ultra-550b-a55b:free',
        'nousresearch/hermes-3-llama-3.1-405b:free',
        'openai/gpt-oss-120b:free'
      ],
      standard: [
        'qwen/qwen3-coder:free',
        'google/gemma-4-31b-it:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'qwen/qwen3-next-80b-a3b-instruct:free'
      ],
      lite: [
        'liquid/lfm-2.5-1.2b-instruct:free',
        'nvidia/nemotron-nano-9b-v2:free',
        'nvidia/nemotron-3-nano-30b-a3b:free'
      ]
    }
  },
  nvidia: {
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    apiKey: process.env.NVIDIA_API_KEY || '',
    models: {
      frontier: [
        'nvidia/nemotron-3-ultra-550b-a55b',
        'deepseek/deepseek-v4-flash',
        'deepseek/deepseek-v4-pro'
      ],
      standard: [
        'qwen/qwen3.5-122b-a10b',
        'google/gemma-4-31b-it',
        'mistralai/mistral-medium-3.5-128b'
      ],
      lite: [
        'nvidia/nemotron-nano-9b-v2',
        'nvidia/nemotron-3-nano-30b-a3b'
      ]
    }
  },
  planTokenRouter: {
    baseUrl: process.env.PLAN_TOKENROUTER_URL || '',
    apiKey: process.env.PLAN_TOKENROUTER_API_KEY || '',
    models: {
      frontier: ['minimax-m3'],
      standard: ['minimax-m2.7'],
      lite: []
    }
  },
  mimo: {
    baseUrl: process.env.MIMO_API_URL || '',
    apiKey: process.env.MIMO_API_KEY || '',
    models: {
      frontier: ['mimo-v2.5'],
      standard: [],
      lite: []
    }
  }
};

/**
 * Get API config for a specific provider
 */
export function getProviderConfig(provider) {
  return API_CONFIG[provider] || null;
}

/**
 * Get model endpoint details
 */
export function getModelEndpoint(modelId) {
  // Determine provider from model ID
  if (modelId.startsWith('mimo')) {
    return { provider: 'mimo', ...API_CONFIG.mimo };
  }
  if (modelId.startsWith('minimax')) {
    return { provider: 'planTokenRouter', ...API_CONFIG.planTokenRouter };
  }
  if (modelId.startsWith('nvidia/') || modelId.startsWith('deepseek/') || modelId.startsWith('qwen/qwen3.5') || modelId.startsWith('google/gemma-4-31b') || modelId.startsWith('mistralai/')) {
    return { provider: 'nvidia', ...API_CONFIG.nvidia };
  }
  // Default to OpenRouter for free models
  return { provider: 'openrouter', ...API_CONFIG.openrouter };
}

/**
 * Check if API keys are configured
 */
export function validateApiKeys() {
  const missing = [];
  if (!API_CONFIG.openrouter.apiKey) missing.push('OPENROUTER_API_KEY');
  if (!API_CONFIG.nvidia.apiKey) missing.push('NVIDIA_API_KEY');
  if (!API_CONFIG.planTokenRouter.apiKey) missing.push('PLAN_TOKENROUTER_API_KEY');
  if (!API_CONFIG.mimo.apiKey) missing.push('MIMO_API_KEY');
  return { valid: missing.length === 0, missing };
}

export default API_CONFIG;
