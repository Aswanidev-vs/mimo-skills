/**
 * Example workflow demonstrating the Agentic Orchestrator
 * Run this to see parallel agent execution in action
 */

export const meta = {
  name: "orchestrator-example",
  description: "Example workflow using the multi-agent orchestrator"
};

const main = async (args) => {
  const { project = '.', task = 'Analyze and improve this codebase' } = args || {};

  phase('Starting Multi-Agent Orchestration');

  // Method 1: Simple parallel execution
  const simpleResult = await workflow('agentic-orchestrator', {
    task,
    agents: ['frontend', 'backend', 'security', 'review']
  });

  log('Simple orchestration result:', JSON.stringify(simpleResult.summary));

  // Method 2: Custom configuration with priorities
  const advancedResult = await workflow('agentic-orchestrator', {
    task: 'Build a secure authentication system',
    agents: {
      backend: { focus: 'auth-implementation', priority: 'high' },
      security: { focus: 'security-audit', priority: 'critical' },
      frontend: { focus: 'login-ui', priority: 'medium' },
      review: { focus: 'code-quality', priority: 'low' }
    },
    options: {
      timeout: 300000,
      maxConcurrent: 4
    }
  });

  // Generate final report
  phase('Generating Final Report');

  const report = {
    timestamp: new Date().toISOString(),
    task,
    simpleExecution: {
      agents: simpleResult.agents,
      duration: simpleResult.duration,
      summary: simpleResult.summary
    },
    advancedExecution: {
      agents: advancedResult.agents,
      duration: advancedResult.duration,
      summary: advancedResult.summary
    },
    state: advancedResult.state
  };

  await writeFile('orchestration-report.json', JSON.stringify(report, null, 2));

  log('\n=== Orchestration Complete ===');
  log(`Simple: ${simpleResult.summary.successful}/${simpleResult.summary.total} agents succeeded`);
  log(`Advanced: ${advancedResult.summary.successful}/${advancedResult.summary.total} agents succeeded`);
  log(`Total time: ${simpleResult.duration + advancedResult.duration}ms`);
  log('Report saved to orchestration-report.json');

  return report;
};

export default main;
