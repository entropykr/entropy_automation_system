/**
 * Entropy Automation System
 * Main entry point for the B2B trade automation platform
 */

import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { WorkflowEngine } from './core/workflow-engine';
import { GoogleWorkspaceService } from './services/google-workspace.service';
import { N8nConnector } from './modules/n8n/connector';

// Load environment variables
dotenv.config();

class EntropyAutomationSystem {
  private workflowEngine: WorkflowEngine;
  private googleService: GoogleWorkspaceService;
  private n8nConnector: N8nConnector;

  constructor() {
    this.workflowEngine = new WorkflowEngine();
    this.googleService = new GoogleWorkspaceService();
    this.n8nConnector = new N8nConnector();
  }

  async initialize(): Promise<void> {
    try {
      logger.info('🚀 Initializing Entropy Automation System...');

      // Initialize services
      await this.googleService.initialize();
      await this.n8nConnector.connect();
      await this.workflowEngine.start();

      logger.info('✅ System initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize system:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down system...');
    await this.workflowEngine.stop();
    await this.n8nConnector.disconnect();
    logger.info('System shutdown complete');
  }
}

// Main execution
async function main(): Promise<void> {
  const system = new EntropyAutomationSystem();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await system.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await system.shutdown();
    process.exit(0);
  });

  // Start the system
  await system.initialize();
}

// Run if this is the main module
if (require.main === module) {
  main().catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
}

export { EntropyAutomationSystem };