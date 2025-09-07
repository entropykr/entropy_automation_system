/**
 * PM Helpers Test Suite
 */

import { PMHelpers } from './pm-helpers';

describe('PMHelpers', () => {
  beforeEach(() => {
    // Reset all agents to idle state
    const agents = PMHelpers.getAgentInfo() as any[];
    agents.forEach(agent => {
      agent.status = 'idle';
      agent.currentTask = undefined;
    });
  });

  describe('Agent Management', () => {
    it('should get all agents', () => {
      const agents = PMHelpers.getAgentInfo() as any[];
      expect(Array.isArray(agents)).toBe(true);
      expect(agents.length).toBe(5);
    });

    it('should get specific agent by ID', () => {
      const agent = PMHelpers.getAgentInfo('n8n-automation-lead') as any;
      expect(agent).toBeDefined();
      expect(agent.id).toBe('n8n-automation-lead');
      expect(agent.name).toBe('n8n Automation Lead');
    });

    it('should throw error for invalid agent ID', () => {
      expect(() => {
        PMHelpers.getAgentInfo('invalid-agent');
      }).toThrow('Agent invalid-agent not found');
    });

    it('should assign task to agent', () => {
      const result = PMHelpers.assignTask('n8n-automation-lead', 'Create workflow template');
      
      expect(result).toContain('Task assigned to');
      expect(result).toContain('n8n Automation Lead');
      expect(result).toContain('Create workflow template');
      
      const agent = PMHelpers.getAgentInfo('n8n-automation-lead') as any;
      expect(agent.status).toBe('busy');
      expect(agent.currentTask).toBe('Create workflow template');
    });

    it('should handle task handoff between agents', () => {
      // First assign a task
      PMHelpers.assignTask('n8n-automation-lead', 'Initial task');
      
      // Then handoff
      const result = PMHelpers.handoffTask('n8n-automation-lead', 'workflow-developer', 'Continued task');
      
      expect(result).toContain('Task handed off');
      expect(result).toContain('n8n Automation Lead');
      expect(result).toContain('Workflow Developer');
      
      const fromAgent = PMHelpers.getAgentInfo('n8n-automation-lead') as any;
      const toAgent = PMHelpers.getAgentInfo('workflow-developer') as any;
      
      expect(fromAgent.status).toBe('idle');
      expect(fromAgent.currentTask).toBeUndefined();
      expect(toAgent.status).toBe('busy');
      expect(toAgent.currentTask).toBe('Continued task');
    });

    it('should validate agent IDs', () => {
      expect(PMHelpers.validateAgentId('n8n-automation-lead')).toBe(true);
      expect(PMHelpers.validateAgentId('invalid-agent')).toBe(false);
    });
  });

  describe('Status Reporting', () => {
    it('should generate agent status report', () => {
      PMHelpers.assignTask('n8n-automation-lead', 'Test task');
      
      const status = PMHelpers.getAgentStatus();
      
      expect(status).toContain('Agent Status Report');
      expect(status).toContain('n8n Automation Lead');
      expect(status).toContain('Test task');
      expect(status).toContain('🔴'); // busy indicator
      expect(status).toContain('🟢'); // idle indicator
    });

    it('should generate workload distribution', () => {
      PMHelpers.assignTask('n8n-automation-lead', 'Test task');
      
      const workload = PMHelpers.getWorkloadDistribution();
      
      expect(workload).toContain('Workload Distribution');
      expect(workload).toContain('1 busy, 4 idle');
      expect(workload).toContain('n8n Automation Lead');
      expect(workload).toContain('█████████░'); // busy workload bar
    });

    it('should generate milestone report', () => {
      const report = PMHelpers.generateMilestoneReport();
      
      expect(report).toContain('Milestone Status Report');
      expect(report).toContain('Current Phase');
      expect(report).toContain('Progress');
      expect(report).toContain('Completed Tasks');
      expect(report).toContain('Current Tasks');
      expect(report).toContain('Blockers');
    });

    it('should generate daily report', () => {
      const report = PMHelpers.generateDailyReport();
      
      expect(report).toContain('Daily Progress Report');
      expect(report).toContain('Project Progress');
      expect(report).toContain('Team Status');
      expect(report).toContain('Next Actions');
      expect(report).toContain(new Date().toLocaleDateString());
    });
  });

  describe('Utility Functions', () => {
    it('should generate valid git branch names', () => {
      expect(PMHelpers.generateGitBranchName('New Feature')).toBe('feature/new-feature');
      expect(PMHelpers.generateGitBranchName('API Integration')).toBe('feature/api-integration');
      expect(PMHelpers.generateGitBranchName('Multi Word Feature Name')).toBe('feature/multi-word-feature-name');
    });

    it('should get project status', () => {
      const status = PMHelpers.getProjectStatus();
      
      expect(status).toHaveProperty('phase');
      expect(status).toHaveProperty('progress');
      expect(status).toHaveProperty('completedTasks');
      expect(status).toHaveProperty('currentTasks');
      expect(status).toHaveProperty('blockers');
      expect(status).toHaveProperty('nextMilestone');
      
      expect(Array.isArray(status.completedTasks)).toBe(true);
      expect(Array.isArray(status.currentTasks)).toBe(true);
      expect(Array.isArray(status.blockers)).toBe(true);
      expect(typeof status.progress).toBe('number');
    });

    it('should list available commands', () => {
      const commands = PMHelpers.getAvailableCommands();
      
      expect(commands).toContain('Available PM Commands');
      expect(commands).toContain('Agent Management');
      expect(commands).toContain('Git 자동화');
      expect(commands).toContain('/pm:assign');
      expect(commands).toContain('/pm:agents:status');
      expect(commands).toContain('/pm:git:branch:create');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid agent assignment', () => {
      expect(() => {
        PMHelpers.assignTask('invalid-agent', 'Some task');
      }).toThrow('Agent invalid-agent not found');
    });

    it('should handle invalid handoff agents', () => {
      expect(() => {
        PMHelpers.handoffTask('invalid-from', 'workflow-developer', 'Some task');
      }).toThrow('One or both agents not found');
      
      expect(() => {
        PMHelpers.handoffTask('n8n-automation-lead', 'invalid-to', 'Some task');
      }).toThrow('One or both agents not found');
    });
  });
});