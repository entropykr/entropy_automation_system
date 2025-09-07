/**
 * Canva API Service
 * Handles design automation using Canva API
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../../utils/logger';

export interface CanvaDesignConfig {
  apiKey?: string;
  brandId?: string;
  workspaceId?: string;
}

export interface DesignTemplate {
  id: string;
  name: string;
  type: 'presentation' | 'document' | 'social_media' | 'marketing';
  dimensions: {
    width: number;
    height: number;
    unit: 'px' | 'mm' | 'in';
  };
}

export interface DesignRequest {
  templateId: string;
  data: {
    text?: Record<string, string>;
    images?: Record<string, string>;
    colors?: Record<string, string>;
  };
  format: 'png' | 'jpg' | 'pdf';
}

export class CanvaService {
  private client: AxiosInstance;
  private apiKey: string;
  private brandId: string;
  private initialized: boolean = false;

  constructor(config?: CanvaDesignConfig) {
    this.apiKey = config?.apiKey || process.env.CANVA_API_KEY || '';
    this.brandId = config?.brandId || process.env.CANVA_BRAND_ID || '';
    
    this.client = axios.create({
      baseURL: 'https://api.canva.com/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Canva API Response: ${response.status}`);
        return response;
      },
      (error) => {
        logger.error('Canva API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      },
    );
  }

  async initialize(): Promise<void> {
    if (!this.apiKey) {
      logger.warn('Canva API key not configured. Service will run in mock mode.');
      this.initialized = true;
      return;
    }

    try {
      // Test API connection
      await this.client.get('/user/profile');
      this.initialized = true;
      logger.info('Canva Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Canva Service:', error);
      // Continue in mock mode for development
      this.initialized = true;
    }
  }

  async createDesignFromTemplate(request: DesignRequest): Promise<string> {
    if (!this.initialized) {
      throw new Error('Canva Service not initialized');
    }

    try {
      // Create design from template
      const designResponse = await this.client.post('/designs/create', {
        template_id: request.templateId,
        brand_id: this.brandId,
        modifications: request.data,
      });

      const designId = designResponse.data.design.id;
      logger.info(`Created design: ${designId}`);

      // Export design
      const exportUrl = await this.exportDesign(designId, request.format);
      return exportUrl;
    } catch (error: any) {
      logger.error('Failed to create design:', error.message);
      // Return mock URL for development
      return this.getMockDesignUrl(request);
    }
  }

  async exportDesign(designId: string, format: string): Promise<string> {
    try {
      const response = await this.client.post(`/designs/${designId}/export`, {
        format,
        quality: 'high',
      });

      // Poll for export completion
      const exportId = response.data.export.id;
      return await this.waitForExport(exportId);
    } catch (error) {
      logger.error('Failed to export design:', error);
      throw error;
    }
  }

  private async waitForExport(exportId: string, maxAttempts = 30): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await this.client.get(`/exports/${exportId}`);
      
      if (response.data.status === 'completed') {
        return response.data.download_url;
      }
      
      if (response.data.status === 'failed') {
        throw new Error('Export failed');
      }
      
      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Export timeout');
  }

  async getTemplates(type?: string): Promise<DesignTemplate[]> {
    try {
      const params = type ? { type } : {};
      const response = await this.client.get('/templates', { params });
      
      return response.data.templates.map((t: any) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        dimensions: t.dimensions,
      }));
    } catch (error) {
      logger.error('Failed to get templates:', error);
      return this.getMockTemplates();
    }
  }

  async createMarketingMaterial(data: {
    type: 'quote' | 'invoice' | 'presentation' | 'catalog';
    content: any;
  }): Promise<string> {
    const templateMap: Record<string, string> = {
      quote: 'template_quote_001',
      invoice: 'template_invoice_001',
      presentation: 'template_presentation_001',
      catalog: 'template_catalog_001',
    };

    const request: DesignRequest = {
      templateId: templateMap[data.type],
      data: this.formatContentForCanva(data.content),
      format: 'pdf',
    };

    return this.createDesignFromTemplate(request);
  }

  private formatContentForCanva(content: any): any {
    // Transform business data to Canva template format
    return {
      text: {
        company_name: content.companyName || '',
        client_name: content.clientName || '',
        date: new Date().toLocaleDateString(),
        amount: content.amount?.toString() || '',
        description: content.description || '',
      },
      images: {
        logo: content.logoUrl || '',
        product_image: content.productImage || '',
      },
      colors: {
        primary: content.brandColor || '#1a73e8',
        secondary: content.secondaryColor || '#34a853',
      },
    };
  }

  async createEmailBanner(data: {
    headline: string;
    subheadline?: string;
    ctaText?: string;
    imageUrl?: string;
  }): Promise<string> {
    const request: DesignRequest = {
      templateId: 'template_email_banner',
      data: {
        text: {
          headline: data.headline,
          subheadline: data.subheadline || '',
          cta: data.ctaText || 'Learn More',
        },
        images: {
          background: data.imageUrl || '',
        },
      },
      format: 'png',
    };

    return this.createDesignFromTemplate(request);
  }

  async createSocialMediaPost(data: {
    platform: 'linkedin' | 'facebook' | 'instagram';
    message: string;
    imageUrl?: string;
  }): Promise<string> {
    const dimensionsMap = {
      linkedin: { width: 1200, height: 627 },
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
    };

    const request: DesignRequest = {
      templateId: `template_social_${data.platform}`,
      data: {
        text: {
          message: data.message,
        },
        images: {
          main: data.imageUrl || '',
        },
      },
      format: 'jpg',
    };

    return this.createDesignFromTemplate(request);
  }

  // Mock methods for development
  private getMockDesignUrl(request: DesignRequest): string {
    logger.info('Returning mock design URL (Canva API not configured)');
    return `https://placeholder.com/design/${request.templateId}.${request.format}`;
  }

  private getMockTemplates(): DesignTemplate[] {
    return [
      {
        id: 'template_quote_001',
        name: 'Business Quote Template',
        type: 'document',
        dimensions: { width: 210, height: 297, unit: 'mm' },
      },
      {
        id: 'template_invoice_001',
        name: 'Invoice Template',
        type: 'document',
        dimensions: { width: 210, height: 297, unit: 'mm' },
      },
      {
        id: 'template_presentation_001',
        name: 'Sales Presentation',
        type: 'presentation',
        dimensions: { width: 1920, height: 1080, unit: 'px' },
      },
      {
        id: 'template_catalog_001',
        name: 'Product Catalog',
        type: 'marketing',
        dimensions: { width: 210, height: 297, unit: 'mm' },
      },
    ];
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}