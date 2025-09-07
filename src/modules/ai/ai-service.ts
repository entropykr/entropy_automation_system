/**
 * AI Service Integration Module
 * Handles Gemini and Claude API integrations
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../../utils/logger';

export interface AIServiceConfig {
  provider: 'gemini' | 'claude';
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: string;
  model: string;
}

export abstract class BaseAIService {
  protected client: AxiosInstance;
  protected apiKey: string;
  protected model: string;
  
  constructor(config: AIServiceConfig) {
    this.apiKey = config.apiKey || '';
    this.model = config.model || '';
    
    this.client = axios.create({
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  abstract generateText(prompt: string, options?: any): Promise<AIResponse>;
  abstract generateDocument(template: string, data: any): Promise<string>;
  abstract analyzeText(text: string, task: string): Promise<any>;
}

export class GeminiService extends BaseAIService {
  constructor(config?: Partial<AIServiceConfig>) {
    super({
      provider: 'gemini',
      apiKey: process.env.GEMINI_API_KEY,
      model: 'gemini-pro',
      ...config,
    });

    this.client.defaults.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    this.client.defaults.params = { key: this.apiKey };
  }

  async generateText(prompt: string, options?: any): Promise<AIResponse> {
    try {
      const response = await this.client.post(`/models/${this.model}:generateContent`, {
        contents: [{
          parts: [{
            text: prompt,
          }],
        }],
        generationConfig: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.maxTokens || 2048,
          topP: 0.8,
          topK: 40,
        },
      });

      const content = response.data.candidates[0].content.parts[0].text;
      
      logger.info('Gemini text generation completed');
      
      return {
        content,
        provider: 'gemini',
        model: this.model,
        usage: response.data.usageMetadata,
      };
    } catch (error: any) {
      logger.error('Gemini API error:', error.message);
      throw new Error(`Gemini generation failed: ${error.message}`);
    }
  }

  async generateDocument(template: string, data: any): Promise<string> {
    const prompt = `
      Generate a professional business document based on this template and data:
      
      Template: ${template}
      
      Data: ${JSON.stringify(data, null, 2)}
      
      Requirements:
      - Professional B2B tone
      - Clear formatting
      - Complete all template fields
      - Ensure accuracy with provided data
    `;

    const response = await this.generateText(prompt);
    return response.content;
  }

  async analyzeText(text: string, task: string): Promise<any> {
    const prompt = `
      Analyze the following text for ${task}:
      
      Text: ${text}
      
      Provide structured analysis with key insights.
    `;

    const response = await this.generateText(prompt);
    return response.content;
  }
}

export class ClaudeService extends BaseAIService {
  constructor(config?: Partial<AIServiceConfig>) {
    super({
      provider: 'claude',
      apiKey: process.env.CLAUDE_API_KEY,
      model: 'claude-3-opus-20240229',
      ...config,
    });

    this.client.defaults.baseURL = 'https://api.anthropic.com/v1';
    this.client.defaults.headers['x-api-key'] = this.apiKey;
    this.client.defaults.headers['anthropic-version'] = '2023-06-01';
  }

  async generateText(prompt: string, options?: any): Promise<AIResponse> {
    try {
      const response = await this.client.post('/messages', {
        model: this.model,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.7,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      });

      const content = response.data.content[0].text;
      
      logger.info('Claude text generation completed');
      
      return {
        content,
        provider: 'claude',
        model: this.model,
        usage: {
          promptTokens: response.data.usage.input_tokens,
          completionTokens: response.data.usage.output_tokens,
          totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens,
        },
      };
    } catch (error: any) {
      logger.error('Claude API error:', error.message);
      throw new Error(`Claude generation failed: ${error.message}`);
    }
  }

  async generateDocument(template: string, data: any): Promise<string> {
    const prompt = `
      You are a professional business document generator. Create a document based on:
      
      Template Structure: ${template}
      
      Business Data: ${JSON.stringify(data, null, 2)}
      
      Requirements:
      - Professional B2B communication style
      - Accurate data representation
      - Clear structure and formatting
      - Complete all required fields
    `;

    const response = await this.generateText(prompt);
    return response.content;
  }

  async analyzeText(text: string, task: string): Promise<any> {
    const prompt = `
      Perform the following analysis task: ${task}
      
      Content to analyze: ${text}
      
      Provide detailed, structured analysis with actionable insights.
    `;

    const response = await this.generateText(prompt);
    return response.content;
  }
}

export class AIServiceManager {
  private geminiService: GeminiService;
  private claudeService: ClaudeService;
  private defaultProvider: 'gemini' | 'claude' = 'gemini';

  constructor() {
    this.geminiService = new GeminiService();
    this.claudeService = new ClaudeService();
  }

  setDefaultProvider(provider: 'gemini' | 'claude'): void {
    this.defaultProvider = provider;
  }

  getService(provider?: 'gemini' | 'claude'): BaseAIService {
    const selectedProvider = provider || this.defaultProvider;
    return selectedProvider === 'claude' ? this.claudeService : this.geminiService;
  }

  async generateEmailContent(data: {
    recipientName: string;
    productName: string;
    purpose: 'introduction' | 'followup' | 'quote' | 'order_confirmation';
  }): Promise<string> {
    const template = this.getEmailTemplate(data.purpose);
    return this.getService().generateDocument(template, data);
  }

  async generateQuote(orderData: any): Promise<string> {
    const template = `
      QUOTATION
      Quote Number: [AUTO_GENERATE]
      Date: [CURRENT_DATE]
      Valid Until: [30_DAYS_FROM_NOW]
      
      To: [CLIENT_NAME]
      Company: [CLIENT_COMPANY]
      
      Items:
      [PRODUCT_LIST_WITH_PRICING]
      
      Terms and Conditions:
      [STANDARD_TERMS]
    `;
    
    return this.getService('claude').generateDocument(template, orderData);
  }

  async generateContract(orderData: any): Promise<string> {
    const template = `
      SALES CONTRACT
      Contract Number: [AUTO_GENERATE]
      Date: [CURRENT_DATE]
      
      Parties:
      Seller: [COMPANY_NAME]
      Buyer: [CLIENT_NAME]
      
      Products: [PRODUCT_DETAILS]
      Delivery Terms: [DELIVERY_TERMS]
      Payment Terms: [PAYMENT_TERMS]
      
      Legal Clauses: [STANDARD_CLAUSES]
    `;
    
    return this.getService('claude').generateDocument(template, orderData);
  }

  async analyzeLeadQuality(leadData: any): Promise<{
    score: number;
    reasoning: string;
    recommendations: string[];
  }> {
    const analysis = await this.getService().analyzeText(
      JSON.stringify(leadData),
      'lead scoring and qualification for B2B sales'
    );
    
    // Parse the analysis into structured format
    // This would be enhanced with better parsing logic
    return {
      score: 75,
      reasoning: analysis,
      recommendations: ['Follow up within 24 hours', 'Send product catalog'],
    };
  }

  private getEmailTemplate(purpose: string): string {
    const templates: Record<string, string> = {
      introduction: `
        Subject: [COMPELLING_SUBJECT]
        
        Dear [RECIPIENT_NAME],
        
        [PERSONALIZED_OPENING]
        [VALUE_PROPOSITION]
        [PRODUCT_INTRODUCTION]
        [CALL_TO_ACTION]
        
        Best regards,
        [SENDER_NAME]
      `,
      followup: `
        Subject: Following up on [PREVIOUS_TOPIC]
        
        Dear [RECIPIENT_NAME],
        
        [REFERENCE_PREVIOUS_CONTACT]
        [ADDITIONAL_VALUE]
        [SPECIFIC_OFFER]
        [NEXT_STEPS]
        
        Best regards,
        [SENDER_NAME]
      `,
      quote: `
        Subject: Quotation for [PRODUCT_NAME]
        
        Dear [RECIPIENT_NAME],
        
        [THANK_YOU_FOR_INTEREST]
        [QUOTE_SUMMARY]
        [KEY_BENEFITS]
        [VALIDITY_AND_TERMS]
        [CALL_TO_ACTION]
        
        Best regards,
        [SENDER_NAME]
      `,
      order_confirmation: `
        Subject: Order Confirmation - [ORDER_ID]
        
        Dear [RECIPIENT_NAME],
        
        [ORDER_CONFIRMATION]
        [ORDER_DETAILS]
        [DELIVERY_INFORMATION]
        [NEXT_STEPS]
        
        Best regards,
        [SENDER_NAME]
      `,
    };

    return templates[purpose] || templates.introduction;
  }
}