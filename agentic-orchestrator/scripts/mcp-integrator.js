/**
 * MCP Tool Integrator - Gives agents access to tools, skills, and plugins
 */

export class MCPToolIntegrator {
  constructor() {
    this.tools = new Map();
    this.skills = new Map();
    this.plugins = new Map();
    this.agentPermissions = new Map();
  }

  /**
   * Register available tools
   */
  registerTool(tool) {
    this.tools.set(tool.name, {
      name: tool.name,
      description: tool.description,
      schema: tool.schema,
      handler: tool.handler,
      permissions: tool.permissions || ['read', 'write']
    });
  }

  /**
   * Register available skills
   */
  registerSkill(skill) {
    this.skills.set(skill.name, {
      name: skill.name,
      description: skill.description,
      commands: skill.commands || [],
      subagents: skill.subagents || []
    });
  }

  /**
   * Register available plugins
   */
  registerPlugin(plugin) {
    this.plugins.set(plugin.name, {
      name: plugin.name,
      description: plugin.description,
      capabilities: plugin.capabilities || [],
      hooks: plugin.hooks || []
    });
  }

  /**
   * Set agent permissions
   */
  setAgentPermissions(agentId, permissions) {
    this.agentPermissions.set(agentId, {
      tools: permissions.tools || [],
      skills: permissions.skills || [],
      plugins: permissions.plugins || [],
      mcpServers: permissions.mcpServers || []
    });
  }

  /**
   * Get available tools for agent
   */
  getToolsForAgent(agentId) {
    const perms = this.agentPermissions.get(agentId);
    if (!perms) return [];

    return Array.from(this.tools.values()).filter(tool =>
      perms.tools.includes(tool.name) || perms.tools.includes('*')
    );
  }

  /**
   * Get available skills for agent
   */
  getSkillsForAgent(agentId) {
    const perms = this.agentPermissions.get(agentId);
    if (!perms) return [];

    return Array.from(this.skills.values()).filter(skill =>
      perms.skills.includes(skill.name) || perms.skills.includes('*')
    );
  }

  /**
   * Get tool context for agent prompt
   */
  getToolContextForAgent(agentId) {
    const tools = this.getToolsForAgent(agentId);
    const skills = this.getSkillsForAgent(agentId);
    const perms = this.agentPermissions.get(agentId);

    return {
      availableTools: tools.map(t => ({
        name: t.name,
        description: t.description,
        usage: `Use the ${t.name} tool to ${t.description}`
      })),
      availableSkills: skills.map(s => ({
        name: s.name,
        description: s.description,
        usage: `Use skill ${s.name} for ${s.description}`
      })),
      mcpServers: perms?.mcpServers || [],
      instructions: this.generateToolInstructions(agentId)
    };
  }

  /**
   * Generate tool usage instructions for agent
   */
  generateToolInstructions(agentId) {
    const tools = this.getToolsForAgent(agentId);
    const skills = this.getSkillsForAgent(agentId);

    const instructions = [];

    if (tools.length > 0) {
      instructions.push('## Available Tools');
      tools.forEach(tool => {
        instructions.push(`- ${tool.name}: ${tool.description}`);
      });
    }

    if (skills.length > 0) {
      instructions.push('\n## Available Skills');
      skills.forEach(skill => {
        instructions.push(`- ${skill.name}: ${skill.description}`);
      });
    }

    return instructions.join('\n');
  }

  /**
   * Execute tool on behalf of agent
   */
  async executeTool(agentId, toolName, params) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    const perms = this.agentPermissions.get(agentId);
    if (!perms?.tools.includes(toolName) && !perms?.tools.includes('*')) {
      throw new Error(`Agent ${agentId} does not have permission to use ${toolName}`);
    }

    try {
      const result = await tool.handler(params);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Load skill into agent context
   */
  async loadSkill(agentId, skillName) {
    const skill = this.skills.get(skillName);
    if (!skill) {
      throw new Error(`Skill not found: ${skillName}`);
    }

    const perms = this.agentPermissions.get(agentId);
    if (!perms?.skills.includes(skillName) && !perms?.skills.includes('*')) {
      throw new Error(`Agent ${agentId} does not have permission to use skill ${skillName}`);
    }

    return skill;
  }

  /**
   * Get MCP server connections for agent
   */
  getMCPServersForAgent(agentId) {
    const perms = this.agentPermissions.get(agentId);
    return perms?.mcpServers || [];
  }

  /**
   * Generate comprehensive context for agent
   */
  generateAgentContext(agentId, additionalContext = {}) {
    const toolContext = this.getToolContextForAgent(agentId);
    const mcpServers = this.getMCPServersForAgent(agentId);

    return {
      ...toolContext,
      mcpServers,
      ...additionalContext,
      permissions: this.agentPermissions.get(agentId)
    };
  }
}

/**
 * Default tool configurations for each agent type
 */
export const DEFAULT_AGENT_PERMISSIONS = {
  frontend: {
    tools: ['read', 'write', 'edit', 'glob', 'grep', 'bash'],
    skills: ['frontend-design'],
    plugins: [],
    mcpServers: []
  },
  backend: {
    tools: ['read', 'write', 'edit', 'glob', 'grep', 'bash', 'webfetch'],
    skills: [],
    plugins: [],
    mcpServers: []
  },
  security: {
    tools: ['read', 'glob', 'grep', 'bash', 'webfetch'],
    skills: [],
    plugins: [],
    mcpServers: []
  },
  review: {
    tools: ['read', 'glob', 'grep'],
    skills: [],
    plugins: [],
    mcpServers: []
  },
  connector: {
    tools: ['read', 'write', 'glob'],
    skills: [],
    plugins: [],
    mcpServers: []
  },
  evaluator: {
    tools: ['read', 'glob', 'grep', 'bash'],
    skills: [],
    plugins: [],
    mcpServers: []
  }
};
