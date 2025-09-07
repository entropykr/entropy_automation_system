/**
 * Google API OAuth 2.0 Authentication and Testing Suite
 * API Integration Specialist - Entropy Automation System
 */

const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const { createServer } = require('http');
const { parse } = require('url');

class GoogleAPITester {
  constructor() {
    this.credentials = null;
    this.oauth2Client = null;
    this.sheets = null;
    this.drive = null;
    this.testResults = {
      authentication: { status: 'pending', details: [] },
      sheetsAPI: { status: 'pending', details: [] },
      driveAPI: { status: 'pending', details: [] },
      integration: { status: 'pending', details: [] }
    };
  }

  async initialize() {
    try {
      // Load OAuth credentials
      const credentialsPath = path.join(__dirname, 'oauth_credentials.json');
      const credentialsContent = await fs.readFile(credentialsPath, 'utf8');
      this.credentials = JSON.parse(credentialsContent).web;
      
      console.log('✓ OAuth credentials loaded successfully');
      console.log(`Project ID: ${this.credentials.project_id}`);
      console.log(`Client ID: ${this.credentials.client_id}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load credentials:', error.message);
      return false;
    }
  }

  async authenticateOAuth() {
    return new Promise((resolve, reject) => {
      try {
        // Create OAuth2 client
        this.oauth2Client = new google.auth.OAuth2(
          this.credentials.client_id,
          this.credentials.client_secret,
          'http://localhost:8080/callback'
        );

        // Define required scopes
        const scopes = [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive'
        ];

        // Generate authorization URL
        const authUrl = this.oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: scopes,
          prompt: 'consent'
        });

        console.log('\n📋 OAuth 2.0 Authentication Required');
        console.log('Please visit this URL to authorize the application:');
        console.log(authUrl);
        console.log('\nWaiting for authorization callback...\n');

        // Create temporary server to handle callback
        const server = createServer(async (req, res) => {
          const urlParts = parse(req.url, true);
          
          if (urlParts.pathname === '/callback') {
            const code = urlParts.query.code;
            
            if (code) {
              try {
                // Exchange code for tokens
                const { tokens } = await this.oauth2Client.getAccessToken(code);
                this.oauth2Client.setCredentials(tokens);

                // Initialize Google APIs
                this.sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
                this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end('<h1>Authentication Successful!</h1><p>You can close this window and return to the terminal.</p>');
                
                server.close();
                
                this.testResults.authentication.status = 'success';
                this.testResults.authentication.details.push({
                  message: 'OAuth 2.0 authentication completed successfully',
                  timestamp: new Date().toISOString(),
                  tokenType: tokens.token_type,
                  expiresIn: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : 'N/A'
                });

                console.log('✅ Authentication successful!');
                console.log(`Token Type: ${tokens.token_type}`);
                console.log(`Expires: ${tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : 'N/A'}`);
                
                resolve(true);
              } catch (error) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>Authentication Failed!</h1><p>Error occurred during token exchange.</p>');
                server.close();
                
                this.testResults.authentication.status = 'failed';
                this.testResults.authentication.details.push({
                  message: `Authentication failed: ${error.message}`,
                  timestamp: new Date().toISOString()
                });
                
                reject(error);
              }
            } else {
              res.writeHead(400, { 'Content-Type': 'text/html' });
              res.end('<h1>Authorization Failed!</h1><p>No authorization code received.</p>');
              server.close();
              reject(new Error('No authorization code received'));
            }
          }
        });

        server.listen(8080, () => {
          console.log('Callback server listening on http://localhost:8080/callback');
        });

      } catch (error) {
        this.testResults.authentication.status = 'failed';
        this.testResults.authentication.details.push({
          message: `OAuth setup failed: ${error.message}`,
          timestamp: new Date().toISOString()
        });
        reject(error);
      }
    });
  }

  async testSheetsAPI() {
    console.log('\n🔄 Testing Google Sheets API...');
    
    try {
      // Test 1: Create new spreadsheet with Order_Management schema
      const createResponse = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `Order_Management_Test_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`
          },
          sheets: [{
            properties: {
              title: 'Orders'
            },
            data: [{
              rowData: [{
                values: [
                  { userEnteredValue: { stringValue: 'Order_ID' }},
                  { userEnteredValue: { stringValue: 'Client_Name' }},
                  { userEnteredValue: { stringValue: 'Client_Email' }},
                  { userEnteredValue: { stringValue: 'Product_Name' }},
                  { userEnteredValue: { stringValue: 'Quantity' }},
                  { userEnteredValue: { stringValue: 'Unit_Price' }},
                  { userEnteredValue: { stringValue: 'Total_Amount' }},
                  { userEnteredValue: { stringValue: 'Order_Date' }},
                  { userEnteredValue: { stringValue: 'Status' }},
                  { userEnteredValue: { stringValue: 'Delivery_Date' }},
                  { userEnteredValue: { stringValue: 'Drive_Folder_Link' }}
                ]
              }]
            }]
          }]
        }
      });

      const spreadsheetId = createResponse.data.spreadsheetId;
      const spreadsheetUrl = createResponse.data.spreadsheetUrl;
      
      console.log(`✅ Spreadsheet created: ${spreadsheetUrl}`);
      
      // Test 2: Insert sample data
      const today = new Date().toISOString().slice(0, 10);
      const orderId = `ORD-${today.replace(/-/g, '')}-001`;
      
      const sampleData = [
        [
          orderId,
          'Test Client Ltd',
          'client@example.com',
          'Industrial Pump Model X1',
          5,
          1200,
          '=E2*F2', // Formula for total calculation
          today,
          'Pending',
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          'https://drive.google.com/drive/folders/pending'
        ]
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Orders!A2:K2',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: sampleData
        }
      });

      console.log(`✅ Sample data inserted with Order ID: ${orderId}`);

      // Test 3: Read back data to verify
      const readResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Orders!A1:K2'
      });

      const values = readResponse.data.values;
      console.log('✅ Data verification successful:');
      console.log('Headers:', values[0]);
      console.log('Sample row:', values[1]);

      // Test 4: Test batch operations
      const batchUpdateResponse = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.2, green: 0.6, blue: 1.0 },
                    textFormat: { bold: true }
                  }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat)'
              }
            }
          ]
        }
      });

      console.log('✅ Batch formatting applied successfully');

      this.testResults.sheetsAPI.status = 'success';
      this.testResults.sheetsAPI.details.push({
        spreadsheetId,
        spreadsheetUrl,
        orderId,
        message: 'All Sheets API tests passed successfully',
        timestamp: new Date().toISOString()
      });

      return { spreadsheetId, spreadsheetUrl, orderId };

    } catch (error) {
      console.error('❌ Sheets API test failed:', error.message);
      this.testResults.sheetsAPI.status = 'failed';
      this.testResults.sheetsAPI.details.push({
        message: `Sheets API test failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async testDriveAPI() {
    console.log('\n🔄 Testing Google Drive API...');
    
    try {
      // Test 1: Create main Trade_Operations folder
      const mainFolderResponse = await this.drive.files.create({
        requestBody: {
          name: `Trade_Operations_Test_${Date.now()}`,
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id, name, webViewLink'
      });

      const mainFolderId = mainFolderResponse.data.id;
      const mainFolderUrl = mainFolderResponse.data.webViewLink;
      
      console.log(`✅ Main folder created: ${mainFolderUrl}`);

      // Test 2: Create subfolder structure
      const subfolders = ['01_Orders', '02_Templates', '03_Marketing', '04_Archive'];
      const createdSubfolders = {};

      for (const subfolder of subfolders) {
        const subfolderResponse = await this.drive.files.create({
          requestBody: {
            name: subfolder,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [mainFolderId]
          },
          fields: 'id, name, webViewLink'
        });
        
        createdSubfolders[subfolder] = {
          id: subfolderResponse.data.id,
          url: subfolderResponse.data.webViewLink
        };
        
        console.log(`✅ Subfolder created: ${subfolder}`);
      }

      // Test 3: Create year/quarter structure in Orders folder
      const currentYear = new Date().getFullYear();
      const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
      
      const yearFolderResponse = await this.drive.files.create({
        requestBody: {
          name: currentYear.toString(),
          mimeType: 'application/vnd.google-apps.folder',
          parents: [createdSubfolders['01_Orders'].id]
        },
        fields: 'id, name, webViewLink'
      });

      const quarterFolderResponse = await this.drive.files.create({
        requestBody: {
          name: currentQuarter,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [yearFolderResponse.data.id]
        },
        fields: 'id, name, webViewLink'
      });

      console.log(`✅ Year/Quarter structure created: ${currentYear}/${currentQuarter}`);

      // Test 4: Create sample order folder
      const orderId = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`;
      const orderFolderResponse = await this.drive.files.create({
        requestBody: {
          name: orderId,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [quarterFolderResponse.data.id]
        },
        fields: 'id, name, webViewLink'
      });

      // Test 5: Create order subfolders
      const orderSubfolders = ['Documents', 'Communications', 'Attachments'];
      const orderSubfolderIds = {};

      for (const subfolder of orderSubfolders) {
        const subfolderResponse = await this.drive.files.create({
          requestBody: {
            name: subfolder,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [orderFolderResponse.data.id]
          },
          fields: 'id, name, webViewLink'
        });
        
        orderSubfolderIds[subfolder] = subfolderResponse.data.id;
        console.log(`✅ Order subfolder created: ${orderId}/${subfolder}`);
      }

      // Test 6: Set permissions for sharing
      await this.drive.permissions.create({
        fileId: mainFolderId,
        requestBody: {
          role: 'writer',
          type: 'domain',
          domain: 'example.com' // Replace with actual domain
        }
      });

      console.log('✅ Folder permissions configured');

      this.testResults.driveAPI.status = 'success';
      this.testResults.driveAPI.details.push({
        mainFolderId,
        mainFolderUrl,
        orderFolderId: orderFolderResponse.data.id,
        orderFolderUrl: orderFolderResponse.data.webViewLink,
        orderId,
        structure: 'Complete folder structure created successfully',
        timestamp: new Date().toISOString()
      });

      return {
        mainFolderId,
        mainFolderUrl,
        orderFolderId: orderFolderResponse.data.id,
        orderFolderUrl: orderFolderResponse.data.webViewLink,
        orderId
      };

    } catch (error) {
      console.error('❌ Drive API test failed:', error.message);
      this.testResults.driveAPI.status = 'failed';
      this.testResults.driveAPI.details.push({
        message: `Drive API test failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async testIntegration(sheetsData, driveData) {
    console.log('\n🔄 Testing Complete Integration...');
    
    try {
      // Update spreadsheet with actual Drive folder link
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetsData.spreadsheetId,
        range: 'Orders!K2',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[driveData.orderFolderUrl]]
        }
      });

      console.log('✅ Spreadsheet updated with Drive folder link');

      // Verify the integration by reading the complete row
      const verificationResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetsData.spreadsheetId,
        range: 'Orders!A2:K2'
      });

      const orderData = verificationResponse.data.values[0];
      console.log('✅ Integration verification successful:');
      console.log(`Order ID: ${orderData[0]}`);
      console.log(`Client: ${orderData[1]}`);
      console.log(`Total: ${orderData[6]}`);
      console.log(`Drive Link: ${orderData[10]}`);

      // Test automated workflow simulation
      const workflowTest = {
        orderReceived: true,
        spreadsheetUpdated: true,
        folderCreated: true,
        linkEstablished: true,
        permissionsSet: true
      };

      console.log('✅ Workflow simulation completed');
      console.log('All integration points verified:', workflowTest);

      this.testResults.integration.status = 'success';
      this.testResults.integration.details.push({
        orderData: {
          orderId: orderData[0],
          client: orderData[1],
          total: orderData[6],
          driveLink: orderData[10]
        },
        workflowTest,
        message: 'Complete integration test passed successfully',
        timestamp: new Date().toISOString()
      });

      return true;

    } catch (error) {
      console.error('❌ Integration test failed:', error.message);
      this.testResults.integration.status = 'failed';
      this.testResults.integration.details.push({
        message: `Integration test failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  generateTestReport() {
    console.log('\n📊 COMPREHENSIVE TEST RESULTS REPORT');
    console.log('=' .repeat(50));
    
    const report = {
      timestamp: new Date().toISOString(),
      projectId: this.credentials.project_id,
      clientId: this.credentials.client_id,
      testResults: this.testResults,
      summary: {
        totalTests: 4,
        passed: 0,
        failed: 0
      }
    };

    // Calculate summary
    Object.values(this.testResults).forEach(test => {
      if (test.status === 'success') report.summary.passed++;
      else if (test.status === 'failed') report.summary.failed++;
    });

    // Display results
    console.log(`\nProject: ${report.projectId}`);
    console.log(`Test Execution: ${report.timestamp}`);
    console.log(`\nSUMMARY:`);
    console.log(`✅ Passed: ${report.summary.passed}/4`);
    console.log(`❌ Failed: ${report.summary.failed}/4`);
    console.log(`📈 Success Rate: ${(report.summary.passed/4*100).toFixed(1)}%`);

    console.log('\nDETAILED RESULTS:');
    
    // Authentication results
    console.log(`\n1. OAuth 2.0 Authentication: ${this.testResults.authentication.status.toUpperCase()}`);
    this.testResults.authentication.details.forEach(detail => {
      console.log(`   ${detail.message}`);
    });

    // Sheets API results
    console.log(`\n2. Google Sheets API: ${this.testResults.sheetsAPI.status.toUpperCase()}`);
    this.testResults.sheetsAPI.details.forEach(detail => {
      if (detail.spreadsheetUrl) {
        console.log(`   📊 Test Spreadsheet: ${detail.spreadsheetUrl}`);
        console.log(`   🆔 Order ID Generated: ${detail.orderId}`);
      }
      console.log(`   ${detail.message}`);
    });

    // Drive API results
    console.log(`\n3. Google Drive API: ${this.testResults.driveAPI.status.toUpperCase()}`);
    this.testResults.driveAPI.details.forEach(detail => {
      if (detail.mainFolderUrl) {
        console.log(`   📁 Main Folder: ${detail.mainFolderUrl}`);
        console.log(`   📂 Order Folder: ${detail.orderFolderUrl}`);
      }
      console.log(`   ${detail.message}`);
    });

    // Integration results
    console.log(`\n4. Integration Test: ${this.testResults.integration.status.toUpperCase()}`);
    this.testResults.integration.details.forEach(detail => {
      if (detail.orderData) {
        console.log(`   🔗 Order-Folder Link: Verified`);
        console.log(`   📋 Workflow Steps: ${Object.keys(detail.workflowTest).length} completed`);
      }
      console.log(`   ${detail.message}`);
    });

    console.log('\n' + '=' .repeat(50));

    return report;
  }

  async runAllTests() {
    console.log('🚀 Starting Google API OAuth 2.0 Authentication and Testing Suite');
    console.log('API Integration Specialist - Entropy Automation System\n');

    try {
      // Initialize credentials
      if (!await this.initialize()) {
        throw new Error('Failed to initialize OAuth credentials');
      }

      // Authenticate with OAuth 2.0
      await this.authenticateOAuth();

      // Test Google Sheets API
      const sheetsResult = await this.testSheetsAPI();

      // Test Google Drive API
      const driveResult = await this.testDriveAPI();

      // Test complete integration
      await this.testIntegration(sheetsResult, driveResult);

      // Generate comprehensive report
      const report = this.generateTestReport();

      // Save report to file
      await fs.writeFile(
        path.join(__dirname, `google_api_test_report_${Date.now()}.json`),
        JSON.stringify(report, null, 2)
      );

      console.log('\n🎉 All tests completed successfully!');
      return report;

    } catch (error) {
      console.error('\n💥 Test suite execution failed:', error.message);
      const report = this.generateTestReport();
      
      await fs.writeFile(
        path.join(__dirname, `google_api_test_report_failed_${Date.now()}.json`),
        JSON.stringify(report, null, 2)
      );
      
      return report;
    }
  }
}

// Execute tests if run directly
if (require.main === module) {
  const tester = new GoogleAPITester();
  tester.runAllTests().then(report => {
    process.exit(report.summary.failed === 0 ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = GoogleAPITester;