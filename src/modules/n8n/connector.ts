/**
 * n8n Connector Module
 * Handles connection and communication with n8n instance
 * Based on n8n official documentation (2025)
 */

import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';

export interface N8nConfig {
  host: string;
  port: number;
  apiKey?: string;
  protocol?: 'http' | 'https';
  webhookPath?: string;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: N8nNode[];
  connections: Record<string, any>;
  settings?: Record<string, any>;
  staticData?: Record<string, any>;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, any>;
  disabled?: boolean;
}

export interface N8nExecutionResponse {
  id: string;
  finished: boolean;
  mode: 'manual' | 'trigger' | 'webhook';
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  data?: any;
}

export class N8nConnector extends EventEmitter {
  private client: AxiosInstance;
  private config: N8nConfig;
  private connected: boolean = false;

  constructor(config?: Partial<N8nConfig>) {
    super();
    
    this.config = {
      host: process.env.N8N_HOST || 'localhost',
      port: parseInt(process.env.N8N_PORT || '5678'),
      apiKey: process.env.N8N_API_KEY,
      protocol: 'http',
      webhookPath: process.env.N8N_WEBHOOK_URL || '/webhook',
      ...config,
    };

    const baseURL = `${this.config.protocol}://${this.config.host}:${this.config.port}/api/v1`;
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'X-N8N-API-KEY': this.config.apiKey }),
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`n8n API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('n8n API Request Error:', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`n8n API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('n8n API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      },
    );
  }

  async connect(): Promise<void> {
    try {
      logger.info('Connecting to n8n instance...');
      
      // Test connection by getting workflows
      const response = await this.client.get('/workflows');
      
      if (response.status === 200) {
        this.connected = true;
        logger.info(`Connected to n8n at ${this.config.host}:${this.config.port}`);
        this.emit('connected');
      }
    } catch (error: any) {
      this.connected = false;
      logger.error('Failed to connect to n8n:', error.message);
      throw new Error(`n8n connection failed: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    logger.info('Disconnected from n8n');
    this.emit('disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Workflow Management Methods

  async getWorkflows(): Promise<N8nWorkflow[]> {
    const response = await this.client.get('/workflows');
    return response.data.data;
  }

  async getWorkflow(id: string): Promise<N8nWorkflow> {
    const response = await this.client.get(`/workflows/${id}`);
    return response.data.data;
  }

  async createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    const response = await this.client.post('/workflows', workflow);
    logger.info(`Created workflow: ${response.data.data.name} (${response.data.data.id})`);
    return response.data.data;
  }

  async updateWorkflow(id: string, workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    const response = await this.client.patch(`/workflows/${id}`, workflow);
    logger.info(`Updated workflow: ${id}`);
    return response.data.data;
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.client.delete(`/workflows/${id}`);
    logger.info(`Deleted workflow: ${id}`);
  }

  async activateWorkflow(id: string): Promise<N8nWorkflow> {
    const response = await this.client.patch(`/workflows/${id}`, { active: true });
    logger.info(`Activated workflow: ${id}`);
    return response.data.data;
  }

  async deactivateWorkflow(id: string): Promise<N8nWorkflow> {
    const response = await this.client.patch(`/workflows/${id}`, { active: false });
    logger.info(`Deactivated workflow: ${id}`);
    return response.data.data;
  }

  // Execution Methods

  async executeWorkflow(
    id: string,
    data?: any,
  ): Promise<N8nExecutionResponse> {
    try {
      const response = await this.client.post(`/workflows/${id}/execute`, {
        workflowData: data,
      });
      logger.info(`Executed workflow: ${id}`);
      return response.data.data;
    } catch (error: any) {
      logger.error(`Failed to execute workflow ${id}:`, error.message);
      throw error;
    }
  }

  async getExecutions(workflowId?: string): Promise<N8nExecutionResponse[]> {
    const params = workflowId ? { workflowId } : {};
    const response = await this.client.get('/executions', { params });
    return response.data.data;
  }

  async getExecution(id: string): Promise<N8nExecutionResponse> {
    const response = await this.client.get(`/executions/${id}`);
    return response.data.data;
  }

  async deleteExecution(id: string): Promise<void> {
    await this.client.delete(`/executions/${id}`);
    logger.info(`Deleted execution: ${id}`);
  }

  // Webhook Methods

  async triggerWebhook(path: string, data: any): Promise<any> {
    const webhookUrl = `${this.config.protocol}://${this.config.host}:${this.config.port}${path}`;
    try {
      const response = await axios.post(webhookUrl, data);
      logger.info(`Triggered webhook: ${path}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to trigger webhook ${path}:`, error.message);
      throw error;
    }
  }

  // Custom Node Support

  async registerCustomNode(nodeDefinition: any): Promise<void> {
    // This would integrate with n8n's custom node system
    // Implementation depends on n8n's custom node API
    logger.info('Registering custom node:', nodeDefinition.name);
    // Placeholder for custom node registration
  }

  // Utility Methods

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/workflows');
      return true;
    } catch (error) {
      return false;
    }
  }

  async getSystemInfo(): Promise<any> {
    try {
      // This endpoint might vary based on n8n version
      const response = await this.client.get('/');
      return response.data;
    } catch (error) {
      logger.warn('Could not retrieve system info');
      return null;
    }
  }
}