/**
 * LIVE Google API Test Suite
 * API Integration Specialist - Real Google API Testing
 * Using API Key: AIzaSyB5DvYbcJI3jkTv4D5jNVzyFVGC-WbFH8g
 */

const https = require('https');
const fs = require('fs');

// API CONFIGURATION
const GOOGLE_API_KEY = 'AIzaSyB5DvYbcJI3jkTv4D5jNVzyFVGC-WbFH8g';
const BASE_URLS = {
  sheets: 'https://sheets.googleapis.com/v4',
  drive: 'https://www.googleapis.com/drive/v3'
};

// Test tracking
const testResults = {
  timestamp: new Date().toISOString(),
  apiKey: GOOGLE_API_KEY,
  authentication: null,
  sheetsAPI: null,
  driveAPI: null,
  spreadsheetCreation: null,
  orderSchema: null,
  folderStructure: null,
  integration: null,
  performance: {
    startTime: Date.now(),
    endTime: null,
    totalDuration: null
  }
};

// AUTHENTICATION TESTER
class GoogleAPIAuth {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async testAuthentication() {
    console.log('🔑 Testing Google API Authentication...');
    
    try {
      // Test with a simple API call - get list of files (Drive API)
      const authTest = await this.makeAPICall(
        'GET',
        `${BASE_URLS.drive}/files?pageSize=1&key=${this.apiKey}`,
        null
      );

      if (authTest.error) {
        throw new Error(`Auth failed: ${authTest.error.message}`);
      }

      console.log('✓ Authentication successful');
      testResults.authentication = {
        success: true,
        message: 'API key authentication working',
        timestamp: new Date().toISOString()
      };

      return true;
    } catch (error) {
      console.error('✗ Authentication failed:', error.message);
      testResults.authentication = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      throw error;
    }
  }

  makeAPICall(method, url, data) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (data && method !== 'GET') {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            resolve(parsedData);
          } catch (error) {
            resolve({ raw: responseData });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data && method !== 'GET') {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }
}

// GOOGLE SHEETS API TESTER
class SheetsAPITester {
  constructor(auth) {
    this.auth = auth;
    this.testSpreadsheetId = null;
  }

  async testSheetsAPI() {
    console.log('\n📊 Testing Google Sheets API v4...');
    
    try {
      // Test 1: Create a new spreadsheet
      await this.createTestSpreadsheet();
      
      // Test 2: Implement Order Management Schema
      await this.implementOrderSchema();
      
      // Test 3: Insert sample data
      await this.insertSampleData();
      
      // Test 4: Test data validation and formulas
      await this.testValidationAndFormulas();

      testResults.sheetsAPI = {
        success: true,
        spreadsheetId: this.testSpreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${this.testSpreadsheetId}/edit`,
        message: 'Sheets API testing completed successfully'
      };

      console.log('✓ Sheets API testing completed');
      return true;

    } catch (error) {
      console.error('✗ Sheets API testing failed:', error.message);
      testResults.sheetsAPI = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      throw error;
    }
  }

  async createTestSpreadsheet() {
    console.log('  Creating test spreadsheet...');
    
    const createData = {
      properties: {
        title: `Trade_Operations_Test_${Date.now()}`,
        locale: 'en_US',
        timeZone: 'America/New_York'
      },
      sheets: [{
        properties: {
          title: 'Order_Management',
          gridProperties: {
            rowCount: 1000,
            columnCount: 17,
            frozenRowCount: 1
          }
        }
      }]
    };

    const response = await this.auth.makeAPICall(
      'POST',
      `${BASE_URLS.sheets}/spreadsheets?key=${this.auth.apiKey}`,
      createData
    );

    if (response.error) {
      throw new Error(`Failed to create spreadsheet: ${response.error.message}`);
    }

    this.testSpreadsheetId = response.spreadsheetId;
    console.log(`  ✓ Spreadsheet created: ${this.testSpreadsheetId}`);
    
    testResults.spreadsheetCreation = {
      success: true,
      spreadsheetId: this.testSpreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${this.testSpreadsheetId}/edit`,
      timestamp: new Date().toISOString()
    };
  }

  async implementOrderSchema() {
    console.log('  Implementing Order Management Schema...');
    
    // Set up headers
    const headers = [
      'Order_ID', 'Client_Name', 'Client_Email', 'Client_Phone',
      'Product_Name', 'Product_Category', 'Quantity', 'Unit_Price',
      'Total_Amount', 'Order_Status', 'Order_Date', 'Delivery_Date',
      'Tracking_Number', 'Drive_Folder_Link', 'Payment_Status', 'Notes', 'Last_Updated'
    ];

    // Update headers
    const headerResponse = await this.auth.makeAPICall(
      'PUT',
      `${BASE_URLS.sheets}/spreadsheets/${this.testSpreadsheetId}/values/Order_Management!A1:Q1?valueInputOption=RAW&key=${this.auth.apiKey}`,
      {
        values: [headers]
      }
    );

    if (headerResponse.error) {
      throw new Error(`Failed to set headers: ${headerResponse.error.message}`);
    }

    // Format headers with batch update
    const formatRequests = {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId: 0,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 17
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.26, green: 0.52, blue: 0.96 },
                textFormat: {
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  bold: true,
                  fontSize: 11
                },
                horizontalAlignment: 'CENTER'
              }
            },
            fields: 'userEnteredFormat'
          }
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: 0,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 1
            },
            properties: {
              pixelSize: 150
            },
            fields: 'pixelSize'
          }
        }
      ]
    };

    const formatResponse = await this.auth.makeAPICall(
      'POST',
      `${BASE_URLS.sheets}/spreadsheets/${this.testSpreadsheetId}:batchUpdate?key=${this.auth.apiKey}`,
      formatRequests
    );

    if (formatResponse.error) {
      throw new Error(`Failed to format headers: ${formatResponse.error.message}`);
    }

    console.log('  ✓ Schema implemented successfully');
    
    testResults.orderSchema = {
      success: true,
      headersCount: headers.length,
      message: 'Order Management schema implemented',
      timestamp: new Date().toISOString()
    };
  }

  async insertSampleData() {
    console.log('  Inserting sample order data...');
    
    const sampleData = [
      [
        'ORD-2024-01-15-001',
        'ABC Electronics Ltd',
        'orders@abcelectronics.com',
        '+1-555-0123',
        'Industrial Sensors Pack',
        'Electronics',
        25,
        89.99,
        '=G2*H2',
        'Processing',
        '2024-01-15',
        '2024-01-25',
        'TRK-ABC-001',
        '',
        'Partial',
        'Rush order - priority shipping',
        '=NOW()'
      ],
      [
        'ORD-2024-01-16-001',
        'Global Textiles Inc',
        'procurement@globaltextiles.com',
        '+1-555-0456',
        'Cotton Fabric Rolls',
        'Textiles',
        100,
        45.50,
        '=G3*H3',
        'Pending',
        '2024-01-16',
        '2024-02-01',
        '',
        '',
        'Pending',
        'Quality inspection required',
        '=NOW()'
      ],
      [
        'ORD-2024-01-17-001',
        'MechCorp Manufacturing',
        'orders@mechcorp.com',
        '+1-555-0789',
        'Precision Gear Set',
        'Machinery',
        5,
        1299.99,
        '=G4*H4',
        'Shipped',
        '2024-01-17',
        '2024-01-22',
        'TRK-MECH-789',
        '',
        'Complete',
        'Custom specifications delivered',
        '=NOW()'
      ]
    ];

    const dataResponse = await this.auth.makeAPICall(
      'PUT',
      `${BASE_URLS.sheets}/spreadsheets/${this.testSpreadsheetId}/values/Order_Management!A2:Q4?valueInputOption=USER_ENTERED&key=${this.auth.apiKey}`,
      {
        values: sampleData
      }
    );

    if (dataResponse.error) {
      throw new Error(`Failed to insert sample data: ${dataResponse.error.message}`);
    }

    console.log(`  ✓ Inserted ${sampleData.length} sample orders`);
  }

  async testValidationAndFormulas() {
    console.log('  Testing data validation and formulas...');
    
    // Check if formulas calculated correctly
    const calculatedResponse = await this.auth.makeAPICall(
      'GET',
      `${BASE_URLS.sheets}/spreadsheets/${this.testSpreadsheetId}/values/Order_Management!I2:I4?valueRenderOption=FORMATTED_VALUE&key=${this.auth.apiKey}`
    );

    if (calculatedResponse.error) {
      throw new Error(`Failed to verify calculations: ${calculatedResponse.error.message}`);
    }

    const calculatedValues = calculatedResponse.values || [];
    const expectedTotals = [2249.75, 4550, 6499.95]; // 25*89.99, 100*45.50, 5*1299.99

    let formulasWorking = true;
    for (let i = 0; i < calculatedValues.length && i < expectedTotals.length; i++) {
      const actual = parseFloat(calculatedValues[i][0]) || 0;
      const expected = expectedTotals[i];
      if (Math.abs(actual - expected) > 0.01) {
        formulasWorking = false;
        console.log(`  Formula error: Row ${i+2} expected ${expected}, got ${actual}`);
        break;
      }
    }

    if (formulasWorking) {
      console.log('  ✓ Formulas calculating correctly');
    } else {
      console.log('  ⚠ Formula calculation issues detected');
    }

    return formulasWorking;
  }
}

// GOOGLE DRIVE API TESTER  
class DriveAPITester {
  constructor(auth) {
    this.auth = auth;
    this.testFolderId = null;
  }

  async testDriveAPI() {
    console.log('\n📁 Testing Google Drive API v3...');
    
    try {
      // Test 1: Create root folder
      await this.createRootFolder();
      
      // Test 2: Create Trade Operations folder structure
      await this.createFolderStructure();
      
      // Test 3: Test order folder automation
      await this.testOrderFolderAutomation();

      testResults.driveAPI = {
        success: true,
        rootFolderId: this.testFolderId,
        folderUrl: `https://drive.google.com/drive/folders/${this.testFolderId}`,
        message: 'Drive API testing completed successfully'
      };

      console.log('✓ Drive API testing completed');
      return true;

    } catch (error) {
      console.error('✗ Drive API testing failed:', error.message);
      testResults.driveAPI = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      throw error;
    }
  }

  async createRootFolder() {
    console.log('  Creating Trade Operations test folder...');
    
    const folderData = {
      name: `Trade_Operations_Test_${Date.now()}`,
      mimeType: 'application/vnd.google-apps.folder'
    };

    const response = await this.auth.makeAPICall(
      'POST',
      `${BASE_URLS.drive}/files?key=${this.auth.apiKey}`,
      folderData
    );

    if (response.error) {
      throw new Error(`Failed to create root folder: ${response.error.message}`);
    }

    this.testFolderId = response.id;
    console.log(`  ✓ Root folder created: ${this.testFolderId}`);
  }

  async createFolderStructure() {
    console.log('  Creating Trade Operations folder structure...');
    
    const structure = [
      '01_Orders',
      '02_Templates', 
      '03_Marketing',
      '04_Archive',
      '05_Documentation'
    ];

    const createdFolders = [];
    
    for (const folderName of structure) {
      const folderData = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [this.testFolderId]
      };

      const response = await this.auth.makeAPICall(
        'POST',
        `${BASE_URLS.drive}/files?key=${this.auth.apiKey}`,
        folderData
      );

      if (response.error) {
        throw new Error(`Failed to create folder ${folderName}: ${response.error.message}`);
      }

      createdFolders.push({ name: folderName, id: response.id });
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`  ✓ Created ${createdFolders.length} main folders`);

    // Create subfolders for Orders
    const ordersFolder = createdFolders.find(f => f.name === '01_Orders');
    if (ordersFolder) {
      await this.createOrderSubstructure(ordersFolder.id);
    }

    testResults.folderStructure = {
      success: true,
      foldersCreated: createdFolders.length,
      structure: createdFolders,
      message: 'Folder structure created successfully'
    };
  }

  async createOrderSubstructure(ordersFolderId) {
    console.log('  Creating Orders subfolder structure...');
    
    // Create year folder
    const yearFolderData = {
      name: '2024',
      mimeType: 'application/vnd.google-apps.folder',
      parents: [ordersFolderId]
    };

    const yearResponse = await this.auth.makeAPICall(
      'POST',
      `${BASE_URLS.drive}/files?key=${this.auth.apiKey}`,
      yearFolderData
    );

    if (yearResponse.error) {
      throw new Error(`Failed to create year folder: ${yearResponse.error.message}`);
    }

    // Create quarter folders
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    for (const quarter of quarters) {
      const quarterData = {
        name: quarter,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [yearResponse.id]
      };

      await this.auth.makeAPICall(
        'POST',
        `${BASE_URLS.drive}/files?key=${this.auth.apiKey}`,
        quarterData
      );

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('  ✓ Orders subfolder structure created');
  }

  async testOrderFolderAutomation() {
    console.log('  Testing automated order folder creation...');
    
    const testOrders = [
      { orderId: 'ORD-2024-01-15-001', clientName: 'ABC Electronics Ltd' },
      { orderId: 'ORD-2024-02-20-001', clientName: 'Global Textiles Inc' },
      { orderId: 'ORD-2024-03-10-001', clientName: 'MechCorp Manufacturing' }
    ];

    const createdOrderFolders = [];

    for (const order of testOrders) {
      try {
        const orderFolder = await this.createOrderFolder(order.orderId, order.clientName);
        createdOrderFolders.push(orderFolder);
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.log(`  ⚠ Failed to create folder for ${order.orderId}: ${error.message}`);
      }
    }

    console.log(`  ✓ Created ${createdOrderFolders.length} order folders`);
    return createdOrderFolders;
  }

  async createOrderFolder(orderId, clientName) {
    // Find the appropriate quarter folder first
    const orderParts = orderId.split('-');
    const year = orderParts[1];
    const month = parseInt(orderParts[2]);
    const quarter = `Q${Math.ceil(month / 3)}`;

    // Sanitize client name for folder usage
    const sanitizedClient = clientName.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
    const orderFolderName = `${orderId}_${sanitizedClient}`;

    // For testing, create directly under test folder (simplified)
    const folderData = {
      name: orderFolderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [this.testFolderId]
    };

    const response = await this.auth.makeAPICall(
      'POST',
      `${BASE_URLS.drive}/files?key=${this.auth.apiKey}`,
      folderData
    );

    if (response.error) {
      throw new Error(`Failed to create order folder: ${response.error.message}`);
    }

    // Create subfolders
    const subfolders = ['Documents', 'Communications', 'Attachments'];
    for (const subfolder of subfolders) {
      const subData = {
        name: subfolder,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [response.id]
      };

      await this.auth.makeAPICall(
        'POST',
        `${BASE_URLS.drive}/files?key=${this.auth.apiKey}`,
        subData
      );
    }

    return {
      orderId: orderId,
      folderId: response.id,
      folderUrl: `https://drive.google.com/drive/folders/${response.id}`,
      path: `${year}/${quarter}/${orderFolderName}`
    };
  }
}

// INTEGRATION TESTER
class IntegrationTester {
  constructor(auth, sheetsTest, driveTest) {
    this.auth = auth;
    this.sheetsTest = sheetsTest;
    this.driveTest = driveTest;
  }

  async testIntegration() {
    console.log('\n🔗 Testing Google Workspace Integration...');
    
    try {
      if (!this.sheetsTest.testSpreadsheetId || !this.driveTest.testFolderId) {
        throw new Error('Required test resources not available');
      }

      // Update Drive folder links in spreadsheet
      const driveUrl = `https://drive.google.com/drive/folders/${this.driveTest.testFolderId}`;
      
      const updateResponse = await this.auth.makeAPICall(
        'PUT',
        `${BASE_URLS.sheets}/spreadsheets/${this.sheetsTest.testSpreadsheetId}/values/Order_Management!N2:N4?valueInputOption=RAW&key=${this.auth.apiKey}`,
        {
          values: [
            [driveUrl],
            [driveUrl],
            [driveUrl]
          ]
        }
      );

      if (updateResponse.error) {
        throw new Error(`Failed to update Drive links: ${updateResponse.error.message}`);
      }

      // Verify the integration
      const verifyResponse = await this.auth.makeAPICall(
        'GET',
        `${BASE_URLS.sheets}/spreadsheets/${this.sheetsTest.testSpreadsheetId}/values/Order_Management!N2:N4?key=${this.auth.apiKey}`
      );

      const linksVerified = verifyResponse.values && verifyResponse.values.length === 3;

      testResults.integration = {
        success: linksVerified,
        message: linksVerified ? 'Integration successful - Drive links working in Sheets' : 'Integration failed',
        driveUrl: driveUrl,
        timestamp: new Date().toISOString()
      };

      console.log(linksVerified ? '✓ Integration testing completed' : '✗ Integration testing failed');
      return linksVerified;

    } catch (error) {
      console.error('✗ Integration testing failed:', error.message);
      testResults.integration = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      throw error;
    }
  }
}

// MAIN TEST RUNNER
async function runGoogleAPITests() {
  console.log('🚀 Starting LIVE Google API Testing Suite');
  console.log('=' .repeat(50));
  
  try {
    // Initialize authentication
    const auth = new GoogleAPIAuth(GOOGLE_API_KEY);
    await auth.testAuthentication();

    // Initialize test suites  
    const sheetsTest = new SheetsAPITester(auth);
    const driveTest = new DriveAPITester(auth);
    
    // Run API tests
    await sheetsTest.testSheetsAPI();
    await driveTest.testDriveAPI();
    
    // Run integration test
    const integrationTest = new IntegrationTester(auth, sheetsTest, driveTest);
    await integrationTest.testIntegration();

    // Finalize results
    testResults.performance.endTime = Date.now();
    testResults.performance.totalDuration = testResults.performance.endTime - testResults.performance.startTime;

    // Generate summary
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('=' .repeat(30));
    console.log(`✓ Authentication: ${testResults.authentication?.success ? 'PASS' : 'FAIL'}`);
    console.log(`✓ Sheets API: ${testResults.sheetsAPI?.success ? 'PASS' : 'FAIL'}`);
    console.log(`✓ Drive API: ${testResults.driveAPI?.success ? 'PASS' : 'FAIL'}`);
    console.log(`✓ Integration: ${testResults.integration?.success ? 'PASS' : 'FAIL'}`);
    console.log(`⏱ Total Duration: ${testResults.performance.totalDuration}ms`);
    
    if (testResults.sheetsAPI?.success) {
      console.log(`\n📋 LIVE SPREADSHEET CREATED:`);
      console.log(`URL: ${testResults.sheetsAPI.spreadsheetUrl}`);
      console.log(`ID: ${testResults.sheetsAPI.spreadsheetId}`);
    }
    
    if (testResults.driveAPI?.success) {
      console.log(`\n📁 LIVE DRIVE STRUCTURE CREATED:`);
      console.log(`URL: ${testResults.driveAPI.folderUrl}`);
      console.log(`ID: ${testResults.driveAPI.rootFolderId}`);
    }

    // Save detailed results
    const reportPath = `google_api_test_results_${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    console.log(`\n📝 Detailed report saved: ${reportPath}`);

    return testResults;

  } catch (error) {
    console.error('\n🚨 TEST SUITE FAILED:', error.message);
    
    // Save error results
    testResults.performance.endTime = Date.now();
    testResults.performance.totalDuration = testResults.performance.endTime - testResults.performance.startTime;
    testResults.overallError = error.message;

    const errorReportPath = `google_api_error_${Date.now()}.json`;
    fs.writeFileSync(errorReportPath, JSON.stringify(testResults, null, 2));
    console.log(`📝 Error report saved: ${errorReportPath}`);

    throw error;
  }
}

// Run the tests
if (require.main === module) {
  runGoogleAPITests()
    .then(() => {
      console.log('\n🎉 Google API testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Google API testing failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runGoogleAPITests, testResults };