/**
 * Notification Service
 * Handles multi-channel notifications (Email, WeChat placeholder, etc.)
 */

import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { logger } from '../utils/logger';

export interface NotificationConfig {
  email?: {
    service: 'gmail' | 'smtp';
    auth: {
      user?: string;
      pass?: string;
      clientId?: string;
      clientSecret?: string;
      refreshToken?: string;
    };
    smtp?: {
      host: string;
      port: number;
      secure: boolean;
    };
  };
  wechat?: {
    // Placeholder for your existing WeChat tool integration
    toolPath?: string;
    config?: any;
  };
}

export interface NotificationMessage {
  channel: 'email' | 'wechat' | 'all';
  recipient: string | string[];
  subject?: string;
  content: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  channel: string;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

export class NotificationService {
  private emailTransporter: nodemailer.Transporter | null = null;
  private initialized: boolean = false;
  private wechatEnabled: boolean = false;

  constructor(private config?: NotificationConfig) {
    this.config = config || this.loadConfigFromEnv();
  }

  private loadConfigFromEnv(): NotificationConfig {
    return {
      email: {
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        },
      },
      wechat: {
        // Will be configured when integrating your existing tool
        toolPath: process.env.WECHAT_TOOL_PATH,
      },
    };
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Notification Service...');
      
      // Initialize email
      await this.initializeEmail();
      
      // Check WeChat tool availability
      this.checkWeChatAvailability();
      
      this.initialized = true;
      logger.info('Notification Service initialized');
    } catch (error) {
      logger.error('Failed to initialize Notification Service:', error);
      // Continue with available channels
      this.initialized = true;
    }
  }

  private async initializeEmail(): Promise<void> {
    if (!this.config?.email) {
      logger.warn('Email configuration not found');
      return;
    }

    const emailConfig = this.config.email;

    if (emailConfig.service === 'gmail' && emailConfig.auth.clientId) {
      // Gmail OAuth2 setup
      const oauth2Client = new google.auth.OAuth2(
        emailConfig.auth.clientId,
        emailConfig.auth.clientSecret,
        'https://developers.google.com/oauthplayground',
      );

      oauth2Client.setCredentials({
        refresh_token: emailConfig.auth.refreshToken,
      });

      const accessToken = await oauth2Client.getAccessToken();

      this.emailTransporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: emailConfig.auth.user,
          clientId: emailConfig.auth.clientId,
          clientSecret: emailConfig.auth.clientSecret,
          refreshToken: emailConfig.auth.refreshToken,
          accessToken: accessToken.token || '',
        },
      } as any);
    } else if (emailConfig.service === 'smtp' && emailConfig.smtp) {
      // SMTP setup
      this.emailTransporter = nodemailer.createTransporter({
        host: emailConfig.smtp.host,
        port: emailConfig.smtp.port,
        secure: emailConfig.smtp.secure,
        auth: {
          user: emailConfig.auth.user,
          pass: emailConfig.auth.pass,
        },
      });
    } else {
      // Fallback to simple auth
      this.emailTransporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: emailConfig.auth.user,
          pass: emailConfig.auth.pass,
        },
      });
    }

    // Verify connection
    try {
      await this.emailTransporter.verify();
      logger.info('Email service connected successfully');
    } catch (error) {
      logger.error('Email service connection failed:', error);
      this.emailTransporter = null;
    }
  }

  private checkWeChatAvailability(): void {
    // Placeholder for WeChat tool integration
    if (this.config?.wechat?.toolPath) {
      // Check if the WeChat tool exists and is accessible
      this.wechatEnabled = false; // Will be true when integrated
      logger.info('WeChat notification channel: Not yet integrated');
    }
  }

  async send(message: NotificationMessage): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    if (message.channel === 'all' || message.channel === 'email') {
      const emailResult = await this.sendEmail(message);
      results.push(emailResult);
    }

    if (message.channel === 'all' || message.channel === 'wechat') {
      const wechatResult = await this.sendWeChat(message);
      results.push(wechatResult);
    }

    return results;
  }

  private async sendEmail(message: NotificationMessage): Promise<NotificationResult> {
    if (!this.emailTransporter) {
      return {
        success: false,
        channel: 'email',
        error: 'Email service not configured',
        timestamp: new Date(),
      };
    }

    try {
      const recipients = Array.isArray(message.recipient) 
        ? message.recipient.join(', ') 
        : message.recipient;

      const mailOptions = {
        from: this.config?.email?.auth.user,
        to: recipients,
        subject: message.subject || 'Notification from Entropy Automation',
        text: message.content,
        html: message.html || message.content,
        attachments: message.attachments,
        priority: message.priority || 'normal',
      };

      const info = await this.emailTransporter.sendMail(mailOptions);
      
      logger.info(`Email sent successfully to ${recipients}`);
      
      return {
        success: true,
        channel: 'email',
        messageId: info.messageId,
        timestamp: new Date(),
      };
    } catch (error: any) {
      logger.error('Failed to send email:', error);
      
      return {
        success: false,
        channel: 'email',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  private async sendWeChat(message: NotificationMessage): Promise<NotificationResult> {
    // Placeholder for WeChat implementation
    // Will integrate with your existing WeChat tool
    
    logger.debug('WeChat notification placeholder called');
    
    return {
      success: false,
      channel: 'wechat',
      error: 'WeChat integration pending - will use existing tool',
      timestamp: new Date(),
    };
  }

  // Business-specific notification methods

  async notifyOrderConfirmation(orderData: any): Promise<NotificationResult[]> {
    const message: NotificationMessage = {
      channel: 'all',
      recipient: orderData.clientEmail,
      subject: `Order Confirmation - ${orderData.orderId}`,
      html: this.generateOrderConfirmationHTML(orderData),
      content: `Your order ${orderData.orderId} has been confirmed.`,
      priority: 'high',
      metadata: { orderId: orderData.orderId },
    };

    return this.send(message);
  }

  async notifyShipment(shipmentData: any): Promise<NotificationResult[]> {
    const message: NotificationMessage = {
      channel: 'all',
      recipient: shipmentData.clientEmail,
      subject: `Shipment Update - ${shipmentData.orderId}`,
      html: this.generateShipmentHTML(shipmentData),
      content: `Your order ${shipmentData.orderId} has been shipped. Tracking: ${shipmentData.trackingNumber}`,
      priority: 'normal',
      metadata: { 
        orderId: shipmentData.orderId,
        trackingNumber: shipmentData.trackingNumber,
      },
    };

    return this.send(message);
  }

  async notifyDeadlineAlert(alertData: any): Promise<NotificationResult[]> {
    const message: NotificationMessage = {
      channel: 'all',
      recipient: alertData.recipients,
      subject: `⚠️ Deadline Alert - ${alertData.orderId}`,
      content: `Order ${alertData.orderId} delivery deadline is approaching: ${alertData.deadline}`,
      priority: 'high',
      metadata: { 
        orderId: alertData.orderId,
        deadline: alertData.deadline,
      },
    };

    return this.send(message);
  }

  async sendMarketingEmail(campaignData: {
    recipients: string[];
    subject: string;
    content: string;
    attachments?: any[];
  }): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    
    // Send in batches to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < campaignData.recipients.length; i += batchSize) {
      const batch = campaignData.recipients.slice(i, i + batchSize);
      
      const message: NotificationMessage = {
        channel: 'email',
        recipient: batch,
        subject: campaignData.subject,
        html: campaignData.content,
        content: campaignData.content,
        attachments: campaignData.attachments,
        priority: 'low',
      };
      
      const batchResults = await this.send(message);
      results.push(...batchResults);
      
      // Rate limiting delay
      if (i + batchSize < campaignData.recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  // HTML Template generators

  private generateOrderConfirmationHTML(orderData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a73e8; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f5f5f5; }
          .footer { text-align: center; padding: 10px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <h2>Thank you for your order!</h2>
            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
            <p><strong>Product:</strong> ${orderData.productName}</p>
            <p><strong>Quantity:</strong> ${orderData.quantity}</p>
            <p><strong>Total Amount:</strong> $${orderData.totalAmount}</p>
            <p><strong>Expected Delivery:</strong> ${orderData.deliveryDate}</p>
            <p>We'll notify you when your order ships.</p>
          </div>
          <div class="footer">
            <p>© 2025 Entropy Automation System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateShipmentHTML(shipmentData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #34a853; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f5f5f5; }
          .tracking { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #34a853; }
          .footer { text-align: center; padding: 10px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Order Has Shipped!</h1>
          </div>
          <div class="content">
            <h2>Shipment Details</h2>
            <p><strong>Order ID:</strong> ${shipmentData.orderId}</p>
            <div class="tracking">
              <p><strong>Tracking Number:</strong> ${shipmentData.trackingNumber}</p>
              <p><strong>Carrier:</strong> ${shipmentData.carrier || 'Standard Shipping'}</p>
              <p><strong>Estimated Delivery:</strong> ${shipmentData.estimatedDelivery}</p>
            </div>
            <p>You can track your package using the tracking number above.</p>
          </div>
          <div class="footer">
            <p>© 2025 Entropy Automation System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}