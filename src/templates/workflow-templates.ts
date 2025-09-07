/**
 * Workflow Templates
 * Pre-configured n8n workflow templates for common automation tasks
 */

import { N8nWorkflow } from '../modules/n8n/connector';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'marketing' | 'order' | 'production' | 'logistics';
  workflow: N8nWorkflow;
}

export class WorkflowTemplateManager {
  private templates: Map<string, WorkflowTemplate> = new Map();

  constructor() {
    this.loadDefaultTemplates();
  }

  private loadDefaultTemplates(): void {
    const templates = [
      this.createColdEmailTemplate(),
      this.createOrderProcessingTemplate(),
      this.createDeadlineMonitoringTemplate(),
      this.createShippingNotificationTemplate(),
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private createColdEmailTemplate(): WorkflowTemplate {
    return {
      id: 'cold-email-campaign',
      name: 'Cold Email Campaign',
      description: 'Automated cold email campaign with AI-generated content',
      category: 'marketing',
      workflow: {
        id: 'cold-email-workflow',
        name: 'Cold Email Campaign Workflow',
        active: false,
        nodes: [
          {
            id: 'schedule-trigger',
            name: 'Daily Schedule',
            type: 'n8n-nodes-base.scheduleTrigger',
            position: [250, 300],
            parameters: {
              rule: {
                interval: [
                  {
                    field: 'hours',
                    hoursInterval: 24,
                  },
                ],
              },
            },
          },
          {
            id: 'get-prospects',
            name: 'Get Prospects from Sheets',
            type: 'n8n-nodes-base.googleSheets',
            position: [450, 300],
            parameters: {
              operation: 'read',
              sheetId: '{{$env.GOOGLE_SHEETS_ID}}',
              range: 'Prospects!A:E',
            },
          },
          {
            id: 'generate-email',
            name: 'Generate Email Content',
            type: 'n8n-nodes-base.function',
            position: [650, 300],
            parameters: {
              functionCode: `
                const items = $input.all();
                const aiService = require('../modules/ai/ai-service');
                
                for (const item of items) {
                  const emailContent = await aiService.generateEmailContent({
                    recipientName: item.json.name,
                    productName: item.json.product_interest,
                    purpose: 'introduction'
                  });
                  
                  item.json.emailContent = emailContent;
                }
                
                return items;
              `,
            },
          },
          {
            id: 'send-email',
            name: 'Send Email',
            type: 'n8n-nodes-base.gmail',
            position: [850, 300],
            parameters: {
              operation: 'send',
              to: '={{$json["email"]}}',
              subject: '={{$json["emailSubject"]}}',
              message: '={{$json["emailContent"]}}',
            },
          },
          {
            id: 'update-status',
            name: 'Update Status in Sheets',
            type: 'n8n-nodes-base.googleSheets',
            position: [1050, 300],
            parameters: {
              operation: 'update',
              sheetId: '{{$env.GOOGLE_SHEETS_ID}}',
              range: 'Prospects!F{{$itemIndex + 2}}',
              values: [['Sent']],
            },
          },
        ],
        connections: {
          'schedule-trigger': {
            main: [
              [
                {
                  node: 'get-prospects',
                  type: 'main',
                  index: 0,
                },
              ],
            ],
          },
          'get-prospects': {
            main: [
              [
                {
                  node: 'generate-email',
                  type: 'main',
                  index: 0,
                },
              ],
            ],
          },
          'generate-email': {
            main: [
              [
                {
                  node: 'send-email',
                  type: 'main',
                  index: 0,
                },
              ],
            ],
          },
          'send-email': {
            main: [
              [
                {
                  node: 'update-status',
                  type: 'main',
                  index: 0,
                },
              ],
            ],
          },
        },
      },
    };
  }

  private createOrderProcessingTemplate(): WorkflowTemplate {
    return {
      id: 'order-processing',
      name: 'Order Processing Automation',
      description: 'Automated order intake, validation, and document generation',
      category: 'order',
      workflow: {
        id: 'order-processing-workflow',
        name: 'Order Processing Workflow',
        active: false,
        nodes: [
          {
            id: 'webhook-trigger',
            name: 'Order Webhook',
            type: 'n8n-nodes-base.webhook',
            position: [250, 300],
            parameters: {
              path: 'order-intake',
              method: 'POST',
            },
          },
          {
            id: 'validate-order',
            name: 'Validate Order Data',
            type: 'n8n-nodes-base.function',
            position: [450, 300],
            parameters: {
              functionCode: `
                const items = $input.all();
                const errors = [];
                
                for (const item of items) {
                  // Validate required fields
                  if (!item.json.clientEmail) errors.push('Client email is required');
                  if (!item.json.productName) errors.push('Product name is required');
                  if (!item.json.quantity || item.json.quantity < 1) errors.push('Valid quantity is required');
                  
                  if (errors.length > 0) {
                    throw new Error('Validation failed: ' + errors.join(', '));
                  }
                  
                  // Generate order ID
                  const date = new Date();
                  const orderId = 'ORD-' + date.toISOString().split('T')[0] + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                  item.json.orderId = orderId;
                }
                
                return items;
              `,
            },
          },
          {
            id: 'create-folder',
            name: 'Create Order Folder',
            type: 'n8n-nodes-base.googleDrive',
            position: [650, 200],
            parameters: {
              operation: 'folder:create',
              name: '={{$json["orderId"]}}_{{$json["clientName"]}}',
              parentId: '{{$env.GOOGLE_DRIVE_FOLDER_ID}}',
            },
          },
          {
            id: 'save-order',
            name: 'Save to Sheets',
            type: 'n8n-nodes-base.googleSheets',
            position: [650, 400],
            parameters: {
              operation: 'append',
              sheetId: '{{$env.GOOGLE_SHEETS_ID}}',
              range: 'Order_Management!A:O',
              values: '={{[$json]}}',
            },
          },
          {
            id: 'generate-documents',
            name: 'Generate Documents',
            type: 'n8n-nodes-base.function',
            position: [850, 300],
            parameters: {
              functionCode: `
                const items = $input.all();
                const aiService = require('../modules/ai/ai-service');
                
                for (const item of items) {
                  const quote = await aiService.generateQuote(item.json);
                  const contract = await aiService.generateContract(item.json);
                  
                  item.json.documents = {
                    quote,
                    contract
                  };
                }
                
                return items;
              `,
            },
          },
          {
            id: 'send-confirmation',
            name: 'Send Confirmation Email',
            type: 'n8n-nodes-base.gmail',
            position: [1050, 300],
            parameters: {
              operation: 'send',
              to: '={{$json["clientEmail"]}}',
              subject: 'Order Confirmation - {{$json["orderId"]}}',
              message: 'Your order has been confirmed. Documents attached.',
            },
          },
        ],
        connections: {
          'webhook-trigger': {
            main: [
              [
                {
                  node: 'validate-order',
                  type: 'main',
                  index: 0,
                },
              ],
            ],
          },
          'validate-order': {
            main: [
              [
                {
                  node: 'create-folder',
                  type: 'main',
                  index: 0,
                },
                {
                  node: 'save-order',
                  type: 'main',
                  index: 0,
                },
              ],
            ],
          },
          'create-folder': {
            main: [
              [
                {
                  node: 'generate-documents',
                  type: 'main',
                  index: 0,
                },
              ],
            ],
          },
          'save-order': {
            main: [
              [
                {
                  node: 'generate-documents',
                  type: 'main',
                  index: 0,
                },
              ],
            ],
          },
          'generate-documents': {
            main: [
              [
                {
                  node: 'send-confirmation',
                  type: 'main',
                  index: 0,
                },
              ],
            ],
          },
        },
      },
    };
  }

  private createDeadlineMonitoringTemplate(): WorkflowTemplate {
    return {
      id: 'deadline-monitoring',
      name: 'Deadline Monitoring',
      description: 'Monitor delivery deadlines and send alerts',
      category: 'production',
      workflow: {
        id: 'deadline-monitoring-workflow',
        name: 'Deadline Monitoring Workflow',
        active: false,
        nodes: [
          {
            id: 'schedule-trigger',
            name: 'Daily Check',
            type: 'n8n-nodes-base.scheduleTrigger',
            position: [250, 300],
            parameters: {
              rule: {
                interval: [
                  {
                    field: 'hours',
                    hoursInterval: 8,
                  },
                ],
              },
            },
          },
          {
            id: 'get-orders',
            name: 'Get Active Orders',
            type: 'n8n-nodes-base.googleSheets',
            position: [450, 300],
            parameters: {
              operation: 'read',
              sheetId: '{{$env.GOOGLE_SHEETS_ID}}',
              range: 'Order_Management!A:O',
              filters: {
                status: ['Processing', 'Pending'],
              },
            },
          },
          {
            id: 'check-deadlines',
            name: 'Check Deadlines',
            type: 'n8n-nodes-base.function',
            position: [650, 300],
            parameters: {
              functionCode: `
                const items = $input.all();
                const urgentOrders = [];
                const today = new Date();
                
                for (const item of items) {
                  const deliveryDate = new Date(item.json.deliveryDate);
                  const daysUntilDelivery = Math.floor((deliveryDate - today) / (1000 * 60 * 60 * 24));
                  
                  if (daysUntilDelivery <= 3) {
                    item.json.urgency = daysUntilDelivery <= 1 ? 'critical' : 'high';
                    item.json.daysRemaining = daysUntilDelivery;
                    urgentOrders.push(item);
                  }
                }
                
                return urgentOrders;
              `,
            },
          },
          {
            id: 'send-alerts',
            name: 'Send Alert Notifications',
            type: 'n8n-nodes-base.function',
            position: [850, 300],
            parameters: {
              functionCode: `
                const items = $input.all();
                const notificationService = require('../services/notification.service');
                
                for (const item of items) {
                  await notificationService.notifyDeadlineAlert({
                    orderId: item.json.orderId,
                    deadline: item.json.deliveryDate,
                    urgency: item.json.urgency,
                    recipients: ['manager@company.com', item.json.clientEmail]
                  });
                }
                
                return items;
              `,
            },
          },
        ],
        connections: {
          'schedule-trigger': {
            main: [
              [
                {
                  node: 'get-orders',
                  type: 'main',
                  index: 0,
                },
              ],
            ],
          },
          'get-orders': {
            main: [
              [
                {
                  node: 'check-deadlines',
                  type: 'main',
                  index: 0,
                },
              ],
            ],
          },
          'check-deadlines': {
            main: [
              [
                {
                  node: 'send-alerts',
                  type: 'main',
                  index: 0,
                },
              ],
            ],
          },
        },
      },
    };
  }

  private createShippingNotificationTemplate(): WorkflowTemplate {
    return {
      id: 'shipping-notification',
      name: 'Shipping Notification',
      description: 'Automated shipping notifications with tracking',
      category: 'logistics',
      workflow: {
        id: 'shipping-notification-workflow',
        name: 'Shipping Notification Workflow',
        active: false,
        nodes: [
          {
            id: 'webhook-trigger',
            name: 'Shipping Update',
            type: 'n8n-nodes-base.webhook',
            position: [250, 300],
            parameters: {
              path: 'shipping-update',
              method: 'POST',
            },
          },
          {
            id: 'update-order',
            name: 'Update Order Status',
            type: 'n8n-nodes-base.googleSheets',
            position: [450, 300],
            parameters: {
              operation: 'update',
              sheetId: '{{$env.GOOGLE_SHEETS_ID}}',
              range: 'Order_Management',
              key: 'orderId',
              values: {
                status: 'Shipped',
                trackingNumber: '={{$json["trackingNumber"]}}',
              },
            },
          },
          {
            id: 'notify-customer',
            name: 'Notify Customer',
            type: 'n8n-nodes-base.gmail',
            position: [650, 300],
            parameters: {
              operation: 'send',
              to: '={{$json["clientEmail"]}}',
              subject: 'Your Order Has Shipped - {{$json["orderId"]}}',
              message: 'Tracking Number: {{$json["trackingNumber"]}}',
            },
          },
        ],
        connections: {
          'webhook-trigger': {
            main: [
              [
                {
                  node: 'update-order',
                  type: 'main',
                  index: 0,
                },
              ],
            ],
          },
          'update-order': {
            main: [
              [
                {
                  node: 'notify-customer',
                  type: 'main',
                  index: 0,
                },
              ],
            ],
          },
        },
      },
    };
  }

  getTemplate(id: string): WorkflowTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: string): WorkflowTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  exportTemplate(id: string): string {
    const template = this.getTemplate(id);
    if (!template) {
      throw new Error(`Template ${id} not found`);
    }
    return JSON.stringify(template.workflow, null, 2);
  }
}