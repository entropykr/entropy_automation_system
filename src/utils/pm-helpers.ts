/**
 * PM Helper Functions
 * Utility functions to support PM command operations
 */

import { logger } from './logger';

export interface AgentInfo {
  id: string;
  name: string;
  specialization: string;
  status: 'idle' | 'busy';
  currentTask?: string;
}

export interface ProjectStatus {
  phase: string;
  progress: number;
  completedTasks: string[];
  currentTasks: string[];
  blockers: string[];
  nextMilestone: string;
}

export class PMHelpers {
  private static agents: AgentInfo[] = [
    {
      id: 'n8n-automation-lead',
      name: 'n8n Automation Lead',
      specialization: 'n8n workflow development and management',
      status: 'idle',
    },
    {
      id: 'google-workspace-architect',
      name: 'Google Workspace Architect',
      specialization: 'Google Sheets database and Drive structure',
      status: 'idle',
    },
    {
      id: 'api-integration-specialist',
      name: 'API Integration Specialist',
      specialization: 'External API connections and authentication',
      status: 'idle',
    },
    {
      id: 'workflow-developer',
      name: 'Workflow Developer',
      specialization: 'n8n workflow creation and testing',
      status: 'idle',
    },
    {
      id: 'trade-pm-agent',
      name: 'Trade PM Agent',
      specialization: 'Project management and coordination',
      status: 'idle',
    },
  ];

  static getAgentInfo(agentId?: string): AgentInfo | AgentInfo[] {
    if (agentId) {
      const agent = this.agents.find(a => a.id === agentId);
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }
      return agent;
    }
    return this.agents;
  }

  static assignTask(agentId: string, taskDescription: string): string {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    agent.status = 'busy';
    agent.currentTask = taskDescription;

    logger.info(`Task assigned to ${agent.name}: ${taskDescription}`);
    return `✅ Task assigned to **${agent.name}**\n📋 Task: ${taskDescription}\n⏰ Status: In Progress`;
  }

  static handoffTask(fromAgentId: string, toAgentId: string, taskDescription: string): string {
    const fromAgent = this.agents.find(a => a.id === fromAgentId);
    const toAgent = this.agents.find(a => a.id === toAgentId);

    if (!fromAgent || !toAgent) {
      throw new Error('One or both agents not found');
    }

    fromAgent.status = 'idle';
    fromAgent.currentTask = undefined;
    
    toAgent.status = 'busy';
    toAgent.currentTask = taskDescription;

    return `🔄 Task handed off\n📤 From: **${fromAgent.name}**\n📥 To: **${toAgent.name}**\n📋 Task: ${taskDescription}`;
  }

  static getAgentStatus(): string {
    const statusReport = this.agents.map(agent => {
      const statusIcon = agent.status === 'busy' ? '🔴' : '🟢';
      const taskInfo = agent.currentTask ? `\n   📋 Current: ${agent.currentTask}` : '';
      return `${statusIcon} **${agent.name}** (${agent.status})${taskInfo}`;
    }).join('\n\n');

    return `## 🤖 Agent Status Report\n\n${statusReport}`;
  }

  static getWorkloadDistribution(): string {
    const busyAgents = this.agents.filter(a => a.status === 'busy').length;
    const idleAgents = this.agents.filter(a => a.status === 'idle').length;
    
    const workloadData = this.agents.map(agent => {
      const workloadIcon = agent.status === 'busy' ? '█████████░' : '░░░░░░░░░░';
      const percentage = agent.status === 'busy' ? '90%' : '0%';
      return `**${agent.name}**: ${workloadIcon} ${percentage}`;
    }).join('\n');

    return `## 📊 Workload Distribution\n\n**Summary**: ${busyAgents} busy, ${idleAgents} idle\n\n${workloadData}`;
  }

  static generateGitBranchName(featureName: string): string {
    return `feature/${featureName.toLowerCase().replace(/\s+/g, '-')}`;
  }

  static getProjectStatus(): ProjectStatus {
    return {
      phase: 'Week 1: Foundation Setup',
      progress: 75,
      completedTasks: [
        'TypeScript project setup',
        'Workflow templates created',
        'Core modules implemented',
        'Testing framework configured'
      ],
      currentTasks: [
        'PM command system implementation',
        'Integration testing',
        'Documentation updates'
      ],
      blockers: [
        'API keys configuration pending'
      ],
      nextMilestone: 'Complete PM system and move to Week 2'
    };
  }

  static generateMilestoneReport(): string {
    const status = this.getProjectStatus();
    const progressBar = '█'.repeat(Math.floor(status.progress / 10)) + '░'.repeat(10 - Math.floor(status.progress / 10));
    
    return `## 🎯 Milestone Status Report

**Current Phase**: ${status.phase}
**Progress**: ${progressBar} ${status.progress}%

### ✅ Completed Tasks
${status.completedTasks.map(task => `- ${task}`).join('\n')}

### 🔄 Current Tasks  
${status.currentTasks.map(task => `- ${task}`).join('\n')}

### ⚠️ Blockers
${status.blockers.map(blocker => `- ${blocker}`).join('\n')}

**Next Milestone**: ${status.nextMilestone}`;
  }

  static generateDailyReport(): string {
    const status = this.getProjectStatus();
    const agentSummary = this.agents.reduce((acc, agent) => {
      acc[agent.status]++;
      return acc;
    }, { busy: 0, idle: 0 } as Record<string, number>);

    return `## 📈 Daily Progress Report
**Date**: ${new Date().toLocaleDateString()}

### Project Progress
- **Phase**: ${status.phase}
- **Completion**: ${status.progress}%
- **Active Tasks**: ${status.currentTasks.length}
- **Blockers**: ${status.blockers.length}

### Team Status
- **Active Agents**: ${agentSummary.busy}
- **Available Agents**: ${agentSummary.idle}

### Next Actions
1. ${status.nextMilestone}
2. Resolve pending blockers
3. Continue with current tasks`;
  }

  static validateAgentId(agentId: string): boolean {
    return this.agents.some(agent => agent.id === agentId);
  }

  static getAvailableCommands(): string {
    return `## 🎮 Available PM Commands

### 👥 Agent Management
- \`/pm:assign <agent> <task>\` - 특정 에이전트에게 작업 할당
- \`/pm:agents:status\` - 모든 에이전트 작업 현황 보기
- \`/pm:agents:workload\` - 에이전트별 업무량 분산 확인
- \`/pm:handoff <from-agent> <to-agent> <task>\` - 작업 인수인계

### 🔀 Git 자동화
- \`/pm:git:branch:create <feature-name>\` - 기능별 브랜치 생성
- \`/pm:git:pr:create <agent> <task>\` - PR 자동 생성
- \`/pm:git:merge:milestone\` - 마일스톤 완료 시 브랜치 병합
- \`/pm:git:release:tag <week-number>\` - 주차별 릴리즈 태깅

### 📊 프로젝트 진행 관리
- \`/pm:milestone:check\` - 현재 마일스톤 달성도
- \`/pm:blockers:list\` - 진행 중인 블로커 목록
- \`/pm:timeline:adjust\` - 일정 조정 제안

### 📋 리포팅
- \`/pm:report:daily\` - 일일 진행 보고서
- \`/pm:report:stakeholder\` - 이해관계자 보고서
- \`/pm:metrics:team\` - 팀 성과 지표`;
  }
}