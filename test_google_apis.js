const { google } = require('googleapis');

// Configuration
const API_KEY = 'AIzaSyB5DvYbcJI3jkTv4D5jNVzyFVGC-WbFH8g';
const auth = new google.auth.GoogleAuth({
  apiKey: API_KEY,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file'
  ]
});

// Initialize Google APIs
const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth });

// Order Management Schema
const ORDER_SCHEMA = {
  headers: [
    'Order_ID',
    'Order_Date', 
    'Client_Name',
    'Client_Email',
    'Client_WeChat',
    'Product_Name',
    'Product_Code',
    'Quantity',
    'Unit_Price',
    'Total_Amount',
    'Currency',
    'Order_Status',
    'Payment_Status',
    'Delivery_Date',
    'Tracking_Number',
    'Drive_Folder_Link',
    'Notes'
  ],
  validations: {
    Order_Status: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    Payment_Status: ['Pending', 'Paid', 'Partial', 'Refunded'],
    Currency: ['USD', 'EUR', 'CNY', 'KRW', 'JPY']
  }
};

class GoogleAPITester {
  constructor() {
    this.testResults = {
      sheets: { success: false, error: null, timing: null },
      drive: { success: false, error: null, timing: null },
      integration: { success: false, error: null, spreadsheetId: null, folderId: null }
    };
  }

  async testSheetsAPI() {
    console.log('🔍 Testing Google Sheets API v4...');
    const startTime = Date.now();
    
    try {
      // Test basic API connection
      const testSpreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: 'API_TEST_' + new Date().toISOString().slice(0,19).replace(/[:.]/g, '-')
          }
        }
      });

      const spreadsheetId = testSpreadsheet.data.spreadsheetId;
      console.log(`✅ Sheets API working! Created test spreadsheet: ${spreadsheetId}`);
      
      this.testResults.sheets = {
        success: true,
        error: null,
        timing: Date.now() - startTime,
        spreadsheetId: spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
      };

      return spreadsheetId;

    } catch (error) {
      console.error('❌ Sheets API Error:', error.message);
      this.testResults.sheets = {
        success: false,
        error: error.message,
        timing: Date.now() - startTime
      };
      throw error;
    }
  }

  async testDriveAPI() {
    console.log('🔍 Testing Google Drive API v3...');
    const startTime = Date.now();
    
    try {
      // Test folder creation
      const testFolder = await drive.files.create({
        requestBody: {
          name: 'API_TEST_FOLDER_' + new Date().toISOString().slice(0,19).replace(/[:.]/g, '-'),
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id, webViewLink'
      });

      const folderId = testFolder.data.id;
      console.log(`✅ Drive API working! Created test folder: ${folderId}`);
      
      this.testResults.drive = {
        success: true,
        error: null,
        timing: Date.now() - startTime,
        folderId: folderId,
        webViewLink: testFolder.data.webViewLink
      };

      return folderId;

    } catch (error) {
      console.error('❌ Drive API Error:', error.message);
      this.testResults.drive = {
        success: false,
        error: error.message,
        timing: Date.now() - startTime
      };
      throw error;
    }
  }

  async createOrderManagementSheet() {
    console.log('📊 Creating Order Management Sheet with full schema...');
    const startTime = Date.now();

    try {
      // Create spreadsheet with proper title
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: 'Order_Management_System_' + new Date().toISOString().slice(0,10)
          }
        }
      });

      const spreadsheetId = spreadsheet.data.spreadsheetId;
      console.log(`✅ Created Order Management Sheet: ${spreadsheetId}`);

      // Set up headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'A1:Q1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [ORDER_SCHEMA.headers]
        }
      });

      // Format headers (bold, freeze row)
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 17
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: { bold: true },
                    backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
                  }
                },
                fields: 'userEnteredFormat'
              }
            },
            {
              updateSheetProperties: {
                properties: {
                  sheetId: 0,
                  gridProperties: {
                    frozenRowCount: 1
                  }
                },
                fields: 'gridProperties.frozenRowCount'
              }
            }
          ]
        }
      });

      // Add data validation for dropdown fields
      await this.addDataValidations(spreadsheetId);
      
      // Add formulas
      await this.addFormulas(spreadsheetId);

      console.log('✅ Order Management Sheet configured with schema and validations');
      
      this.testResults.integration.spreadsheetId = spreadsheetId;
      this.testResults.integration.spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

      return spreadsheetId;

    } catch (error) {
      console.error('❌ Sheet Creation Error:', error.message);
      throw error;
    }
  }

  async addDataValidations(spreadsheetId) {
    const validationRequests = [];

    // Order Status validation (Column L - index 11)
    validationRequests.push({
      setDataValidation: {
        range: {
          sheetId: 0,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: 11,
          endColumnIndex: 12
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: ORDER_SCHEMA.validations.Order_Status.map(val => ({ userEnteredValue: val }))
          },
          showCustomUi: true
        }
      }
    });

    // Payment Status validation (Column M - index 12)
    validationRequests.push({
      setDataValidation: {
        range: {
          sheetId: 0,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: 12,
          endColumnIndex: 13
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: ORDER_SCHEMA.validations.Payment_Status.map(val => ({ userEnteredValue: val }))
          },
          showCustomUi: true
        }
      }
    });

    // Currency validation (Column K - index 10)
    validationRequests.push({
      setDataValidation: {
        range: {
          sheetId: 0,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: 10,
          endColumnIndex: 11
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: ORDER_SCHEMA.validations.Currency.map(val => ({ userEnteredValue: val }))
          },
          showCustomUi: true
        }
      }
    });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: validationRequests }
    });

    console.log('✅ Data validations added for dropdown fields');
  }

  async addFormulas(spreadsheetId) {
    // Add Total_Amount formula (Column J = H * I)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'J2:J1000',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: Array(999).fill(['=H2*I2'])
      }
    });

    // Add Order_ID formula (Column A)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A2:A1000', 
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: Array(999).fill(['=CONCATENATE("ORD-",TEXT(B2,"YYYY-MM-DD"),"-",TEXT(ROW()-1,"000"))'])
      }
    });

    console.log('✅ Formulas added for Total_Amount and Order_ID generation');
  }

  async createDriveFolderStructure() {
    console.log('📁 Creating Trade_Operations folder structure...');
    
    try {
      // Create main Trade_Operations folder
      const mainFolder = await drive.files.create({
        requestBody: {
          name: 'Trade_Operations',
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id, webViewLink'
      });

      const mainFolderId = mainFolder.data.id;
      console.log(`✅ Created Trade_Operations folder: ${mainFolderId}`);

      // Create subfolders
      const subfolders = [
        '01_Orders',
        '02_Templates', 
        '03_Marketing',
        '04_Archive'
      ];

      const subfolderIds = {};
      for (const folderName of subfolders) {
        const subfolder = await drive.files.create({
          requestBody: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [mainFolderId]
          },
          fields: 'id'
        });
        subfolderIds[folderName] = subfolder.data.id;
        console.log(`✅ Created subfolder: ${folderName}`);
      }

      // Test order folder creation (2024/Q3/ORD-2024-09-07-001)
      const currentYear = new Date().getFullYear().toString();
      const currentQuarter = 'Q' + Math.ceil((new Date().getMonth() + 1) / 3);
      const testOrderId = `ORD-${new Date().toISOString().slice(0,10)}-001`;

      // Create year folder
      const yearFolder = await drive.files.create({
        requestBody: {
          name: currentYear,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [subfolderIds['01_Orders']]
        },
        fields: 'id'
      });

      // Create quarter folder
      const quarterFolder = await drive.files.create({
        requestBody: {
          name: currentQuarter,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [yearFolder.data.id]
        },
        fields: 'id'
      });

      // Create test order folder
      const orderFolder = await drive.files.create({
        requestBody: {
          name: testOrderId,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [quarterFolder.data.id]
        },
        fields: 'id, webViewLink'
      });

      // Create order subfolders
      const orderSubfolders = ['Documents', 'Communications', 'Attachments'];
      for (const subfolderName of orderSubfolders) {
        await drive.files.create({
          requestBody: {
            name: subfolderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [orderFolder.data.id]
          }
        });
      }

      console.log(`✅ Created complete folder structure for test order: ${testOrderId}`);
      
      this.testResults.integration.folderId = mainFolderId;
      this.testResults.integration.folderUrl = mainFolder.data.webViewLink;
      this.testResults.integration.testOrderFolder = orderFolder.data.webViewLink;

      return {
        mainFolderId,
        mainFolderUrl: mainFolder.data.webViewLink,
        testOrderFolder: orderFolder.data.webViewLink
      };

    } catch (error) {
      console.error('❌ Drive Folder Creation Error:', error.message);
      throw error;
    }
  }

  async insertSampleData(spreadsheetId) {
    console.log('📝 Inserting sample order data for testing...');
    
    const sampleData = [
      [
        '', // Order_ID (auto-generated by formula)
        '2024-09-07', // Order_Date
        'Tech Solutions Ltd', // Client_Name
        'contact@techsolutions.com', // Client_Email
        'tech_solutions_wc', // Client_WeChat
        'Industrial Sensor Kit', // Product_Name
        'ISK-2024-V2', // Product_Code
        50, // Quantity
        125.50, // Unit_Price
        '', // Total_Amount (auto-calculated)
        'USD', // Currency
        'Processing', // Order_Status
        'Paid', // Payment_Status
        '2024-09-15', // Delivery_Date
        'TRK123456789', // Tracking_Number
        '', // Drive_Folder_Link (will be updated)
        'Bulk order for Q3 deployment'
      ],
      [
        '',
        '2024-09-07',
        'Global Manufacturing Co',
        'orders@globalmanuf.com', 
        'global_manuf_official',
        'Precision Components Set',
        'PCS-2024-PRO',
        25,
        89.99,
        '',
        'EUR',
        'Pending',
        'Pending',
        '2024-09-20',
        '',
        '',
        'Custom specifications required'
      ],
      [
        '',
        '2024-09-06',
        'Innovation Dynamics',
        'procurement@innovationdyn.com',
        'innovation_dyn',
        'Smart Control Module',
        'SCM-2024-ADV',
        100,
        75.25,
        '',
        'USD',
        'Shipped',
        'Paid',
        '2024-09-10',
        'TRK987654321',
        '',
        'Priority shipping requested'
      ]
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A2:Q4',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: sampleData
      }
    });

    console.log('✅ Sample data inserted successfully');
  }

  async runCompleteTest() {
    console.log('🚀 Starting Complete Google API Integration Test\n');

    try {
      // 1. Test APIs
      await this.testSheetsAPI();
      await this.testDriveAPI();

      // 2. Create Order Management System
      const spreadsheetId = await this.createOrderManagementSheet();

      // 3. Create Drive folder structure
      const folderInfo = await this.createDriveFolderStructure();

      // 4. Insert sample data
      await this.insertSampleData(spreadsheetId);

      // 5. Final validation
      this.testResults.integration.success = true;

      console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
      this.printResults();

    } catch (error) {
      console.error('\n💥 TEST FAILED:', error.message);
      this.testResults.integration.error = error.message;
      this.printResults();
      throw error;
    }
  }

  printResults() {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    
    console.log('\n📈 Google Sheets API v4:');
    console.log(`Status: ${this.testResults.sheets.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Timing: ${this.testResults.sheets.timing}ms`);
    if (this.testResults.sheets.spreadsheetId) {
      console.log(`URL: ${this.testResults.sheets.url}`);
    }
    if (this.testResults.sheets.error) {
      console.log(`Error: ${this.testResults.sheets.error}`);
    }

    console.log('\n📁 Google Drive API v3:');
    console.log(`Status: ${this.testResults.drive.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Timing: ${this.testResults.drive.timing}ms`);
    if (this.testResults.drive.webViewLink) {
      console.log(`URL: ${this.testResults.drive.webViewLink}`);
    }
    if (this.testResults.drive.error) {
      console.log(`Error: ${this.testResults.drive.error}`);
    }

    console.log('\n🔗 Integration Test:');
    console.log(`Status: ${this.testResults.integration.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (this.testResults.integration.spreadsheetUrl) {
      console.log(`Order Management Sheet: ${this.testResults.integration.spreadsheetUrl}`);
    }
    if (this.testResults.integration.folderUrl) {
      console.log(`Trade Operations Folder: ${this.testResults.integration.folderUrl}`);
    }
    if (this.testResults.integration.testOrderFolder) {
      console.log(`Test Order Folder: ${this.testResults.integration.testOrderFolder}`);
    }
    if (this.testResults.integration.error) {
      console.log(`Error: ${this.testResults.integration.error}`);
    }

    console.log('\n' + '='.repeat(50));
  }
}

// Run the complete test
const tester = new GoogleAPITester();
tester.runCompleteTest().catch(console.error);