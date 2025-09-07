/**
 * Workflow Templates Test Suite
 */

import { WorkflowTemplateManager } from './workflow-templates';

describe('WorkflowTemplateManager', () => {
  let templateManager: WorkflowTemplateManager;

  beforeEach(() => {
    templateManager = new WorkflowTemplateManager();
  });

  describe('Template Loading', () => {
    it('should load default templates on initialization', () => {
      const templates = templateManager.getAllTemplates();
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should load cold email template', () => {
      const template = templateManager.getTemplate('cold-email-campaign');
      expect(template).toBeDefined();
      expect(template?.name).toBe('Cold Email Campaign');
      expect(template?.category).toBe('marketing');
    });

    it('should load order processing template', () => {
      const template = templateManager.getTemplate('order-processing');
      expect(template).toBeDefined();
      expect(template?.name).toBe('Order Processing Automation');
      expect(template?.category).toBe('order');
    });

    it('should load deadline monitoring template', () => {
      const template = templateManager.getTemplate('deadline-monitoring');
      expect(template).toBeDefined();
      expect(template?.name).toBe('Deadline Monitoring');
      expect(template?.category).toBe('production');
    });

    it('should load shipping notification template', () => {
      const template = templateManager.getTemplate('shipping-notification');
      expect(template).toBeDefined();
      expect(template?.name).toBe('Shipping Notification');
      expect(template?.category).toBe('logistics');
    });
  });

  describe('Template Retrieval', () => {
    it('should return undefined for non-existent template', () => {
      const template = templateManager.getTemplate('non-existent');
      expect(template).toBeUndefined();
    });

    it('should get all templates', () => {
      const templates = templateManager.getAllTemplates();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBe(4);
    });

    it('should filter templates by category', () => {
      const marketingTemplates = templateManager.getTemplatesByCategory('marketing');
      expect(marketingTemplates.length).toBe(1);
      expect(marketingTemplates[0].category).toBe('marketing');

      const orderTemplates = templateManager.getTemplatesByCategory('order');
      expect(orderTemplates.length).toBe(1);
      expect(orderTemplates[0].category).toBe('order');
    });

    it('should return empty array for invalid category', () => {
      const templates = templateManager.getTemplatesByCategory('invalid');
      expect(templates).toEqual([]);
    });
  });

  describe('Template Structure Validation', () => {
    it('should have valid workflow structure for cold email template', () => {
      const template = templateManager.getTemplate('cold-email-campaign');
      expect(template?.workflow).toBeDefined();
      expect(template?.workflow.nodes).toBeDefined();
      expect(template?.workflow.nodes.length).toBeGreaterThan(0);
      expect(template?.workflow.connections).toBeDefined();
    });

    it('should have required node properties', () => {
      const template = templateManager.getTemplate('order-processing');
      const nodes = template?.workflow.nodes || [];
      
      nodes.forEach(node => {
        expect(node.id).toBeDefined();
        expect(node.name).toBeDefined();
        expect(node.type).toBeDefined();
        expect(node.position).toBeDefined();
        expect(Array.isArray(node.position)).toBe(true);
        expect(node.position.length).toBe(2);
      });
    });

    it('should have valid connections structure', () => {
      const template = templateManager.getTemplate('deadline-monitoring');
      const connections = template?.workflow.connections || {};
      
      Object.keys(connections).forEach(nodeId => {
        expect(connections[nodeId].main).toBeDefined();
        expect(Array.isArray(connections[nodeId].main)).toBe(true);
      });
    });
  });

  describe('Template Export', () => {
    it('should export template as JSON string', () => {
      const exported = templateManager.exportTemplate('cold-email-campaign');
      expect(typeof exported).toBe('string');
      
      const parsed = JSON.parse(exported);
      expect(parsed.id).toBe('cold-email-workflow');
      expect(parsed.nodes).toBeDefined();
    });

    it('should throw error when exporting non-existent template', () => {
      expect(() => {
        templateManager.exportTemplate('non-existent');
      }).toThrow('Template non-existent not found');
    });
  });

  describe('Workflow Node Validation', () => {
    it('should have trigger nodes in all templates', () => {
      const templates = templateManager.getAllTemplates();
      
      templates.forEach(template => {
        const hasTrigger = template.workflow.nodes.some(node => 
          node.type.includes('Trigger') || node.type.includes('webhook')
        );
        expect(hasTrigger).toBe(true);
      });
    });

    it('should have proper node connections', () => {
      const template = templateManager.getTemplate('order-processing');
      const connections = template?.workflow.connections || {};
      const nodeIds = template?.workflow.nodes.map(n => n.id) || [];
      
      // Check that all connection references valid nodes
      Object.values(connections).forEach(connection => {
        if (connection.main && connection.main[0]) {
          connection.main[0].forEach((conn: any) => {
            expect(nodeIds).toContain(conn.node);
          });
        }
      });
    });
  });
});