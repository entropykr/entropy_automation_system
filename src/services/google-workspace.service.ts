/**
 * Google Workspace Service
 * Handles Google Sheets and Drive operations
 * Based on Google API v4 documentation (2025)
 */

import { google, sheets_v4, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';

export interface GoogleCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}

export interface SheetRange {
  sheet: string;
  range: string;
}

export interface OrderData {
  orderId: string;
  clientName: string;
  clientEmail: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  orderDate: Date;
  deliveryDate: Date;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  trackingNumber?: string;
  paymentStatus: 'Pending' | 'Partial' | 'Complete';
  notes?: string;
  folderLink?: string;
  lastUpdated: Date;
}

export class GoogleWorkspaceService {
  private oauth2Client: OAuth2Client;
  private sheets: sheets_v4.Sheets;
  private drive: drive_v3.Drive;
  private initialized: boolean = false;
  private spreadsheetId: string;
  private rootFolderId: string;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID || '';
    this.rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
    
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    this.sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Google Workspace Service...');
      
      // Try to load stored credentials
      await this.loadStoredCredentials();
      
      if (!this.initialized) {
        logger.warn('Google Workspace credentials not found. Authorization required.');
        // In production, this would trigger OAuth flow
        // For now, we'll mark as initialized for development
        this.initialized = true;
      }
      
      logger.info('Google Workspace Service initialized');
    } catch (error) {
      logger.error('Failed to initialize Google Workspace:', error);
      throw error;
    }
  }

  private async loadStoredCredentials(): Promise<void> {
    try {
      const tokenPath = path.join(process.cwd(), 'credentials', 'token.json');
      const token = await fs.readFile(tokenPath, 'utf-8');
      const credentials = JSON.parse(token);
      
      this.oauth2Client.setCredentials(credentials);
      this.initialized = true;
      logger.info('Loaded stored Google credentials');
    } catch (error) {
      logger.debug('No stored credentials found');
    }
  }

  async saveCredentials(tokens: any): Promise<void> {
    const credentialsDir = path.join(process.cwd(), 'credentials');
    const tokenPath = path.join(credentialsDir, 'token.json');
    
    await fs.mkdir(credentialsDir, { recursive: true });
    await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2));
    logger.info('Saved Google credentials');
  }

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  async handleAuthCallback(code: string): Promise<void> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    await this.saveCredentials(tokens);
    this.initialized = true;
  }

  // Sheets Operations

  async readSheet(range: string): Promise<any[][]> {
    if (!this.initialized) {
      throw new Error('Google Workspace Service not initialized');
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
      });

      return response.data.values || [];
    } catch (error: any) {
      logger.error(`Failed to read sheet range ${range}:`, error.message);
      throw error;
    }
  }

  async writeSheet(range: string, values: any[][]): Promise<void> {
    if (!this.initialized) {
      throw new Error('Google Workspace Service not initialized');
    }

    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });

      logger.info(`Updated sheet range: ${range}`);
    } catch (error: any) {
      logger.error(`Failed to write to sheet range ${range}:`, error.message);
      throw error;
    }
  }

  async appendSheet(range: string, values: any[][]): Promise<void> {
    if (!this.initialized) {
      throw new Error('Google Workspace Service not initialized');
    }

    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values,
        },
      });

      logger.info(`Appended data to sheet range: ${range}`);
    } catch (error: any) {
      logger.error(`Failed to append to sheet range ${range}:`, error.message);
      throw error;
    }
  }

  async batchUpdate(requests: any[]): Promise<void> {
    if (!this.initialized) {
      throw new Error('Google Workspace Service not initialized');
    }

    try {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests,
        },
      });

      logger.info('Batch update completed');
    } catch (error: any) {
      logger.error('Failed to perform batch update:', error.message);
      throw error;
    }
  }

  // Order Management Methods

  async createOrder(order: OrderData): Promise<void> {
    const values = [[
      order.orderId,
      order.clientName,
      order.clientEmail,
      order.productName,
      order.quantity,
      order.unitPrice,
      order.totalAmount,
      order.orderDate.toISOString(),
      order.deliveryDate.toISOString(),
      order.status,
      order.trackingNumber || '',
      order.paymentStatus,
      order.notes || '',
      order.folderLink || '',
      new Date().toISOString(),
    ]];

    await this.appendSheet('Order_Management!A:O', values);
    logger.info(`Created order: ${order.orderId}`);
  }

  async getOrders(status?: string): Promise<OrderData[]> {
    const data = await this.readSheet('Order_Management!A2:O');
    
    const orders = data.map(row => ({
      orderId: row[0],
      clientName: row[1],
      clientEmail: row[2],
      productName: row[3],
      quantity: parseInt(row[4]),
      unitPrice: parseFloat(row[5]),
      totalAmount: parseFloat(row[6]),
      orderDate: new Date(row[7]),
      deliveryDate: new Date(row[8]),
      status: row[9] as OrderData['status'],
      trackingNumber: row[10],
      paymentStatus: row[11] as OrderData['paymentStatus'],
      notes: row[12],
      folderLink: row[13],
      lastUpdated: new Date(row[14]),
    }));

    if (status) {
      return orders.filter(order => order.status === status);
    }

    return orders;
  }

  // Drive Operations

  async createOrderFolder(orderId: string, clientName: string): Promise<string> {
    if (!this.initialized) {
      throw new Error('Google Workspace Service not initialized');
    }

    try {
      const year = new Date().getFullYear();
      const quarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
      
      // Create year folder if it doesn't exist
      const yearFolder = await this.findOrCreateFolder(year.toString(), this.rootFolderId);
      
      // Create quarter folder
      const quarterFolder = await this.findOrCreateFolder(quarter, yearFolder.id!);
      
      // Create order folder
      const orderFolderName = `${orderId}_${clientName}`;
      const orderFolder = await this.drive.files.create({
        requestBody: {
          name: orderFolderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [quarterFolder.id!],
        },
      });

      // Create subfolders
      const subfolders = ['Documents', 'Communications', 'Attachments'];
      for (const subfolder of subfolders) {
        await this.drive.files.create({
          requestBody: {
            name: subfolder,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [orderFolder.data.id!],
          },
        });
      }

      const folderLink = `https://drive.google.com/drive/folders/${orderFolder.data.id}`;
      logger.info(`Created order folder: ${orderFolderName}`);
      
      return folderLink;
    } catch (error: any) {
      logger.error('Failed to create order folder:', error.message);
      throw error;
    }
  }

  private async findOrCreateFolder(
    name: string,
    parentId: string,
  ): Promise<drive_v3.Schema$File> {
    // Search for existing folder
    const response = await this.drive.files.list({
      q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0];
    }

    // Create new folder
    const folder = await this.drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      },
    });

    return folder.data;
  }

  async uploadFile(
    filePath: string,
    fileName: string,
    folderId: string,
  ): Promise<string> {
    const fileContent = await fs.readFile(filePath);
    
    const response = await this.drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        body: fileContent as any,
      },
    });

    logger.info(`Uploaded file: ${fileName}`);
    return response.data.id!;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}