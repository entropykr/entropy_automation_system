/**
 * Supporting Sheets Configuration
 * Google Workspace Architect - TSK-002
 * Supporting database tables for Order_Management system
 */

// CLIENTS DATABASE SHEET
const CLIENTS_DB_SCHEMA = {
  sheetName: "Clients_DB",
  columns: {
    A: { name: "Client_ID", type: "TEXT", validation: "UNIQUE_REQUIRED" },
    B: { name: "Company_Name", type: "TEXT", validation: "REQUIRED" },
    C: { name: "Contact_Person", type: "TEXT", validation: "REQUIRED" },
    D: { name: "Email", type: "EMAIL", validation: "EMAIL_REQUIRED" },
    E: { name: "Phone", type: "TEXT", validation: "PHONE_FORMAT" },
    F: { name: "WeChat_ID", type: "TEXT", validation: "OPTIONAL" },
    G: { name: "Address", type: "TEXT", validation: "OPTIONAL" },
    H: { name: "Country", type: "DROPDOWN", validation: "COUNTRY_LIST" },
    I: { name: "Industry", type: "DROPDOWN", validation: "INDUSTRY_LIST" },
    J: { name: "Credit_Limit", type: "CURRENCY", validation: "MIN_0" },
    K: { name: "Payment_Terms", type: "DROPDOWN", validation: "PAYMENT_TERMS" },
    L: { name: "Status", type: "DROPDOWN", validation: "CLIENT_STATUS" },
    M: { name: "Created_Date", type: "DATE", validation: "AUTO_DATE" },
    N: { name: "Last_Order", type: "DATE", validation: "OPTIONAL" },
    O: { name: "Total_Orders", type: "NUMBER", validation: "AUTO_COUNT" },
    P: { name: "Notes", type: "TEXT", validation: "OPTIONAL" }
  }
};

// PRODUCTS CATALOG SHEET
const PRODUCTS_CATALOG_SCHEMA = {
  sheetName: "Products_Catalog",
  columns: {
    A: { name: "Product_ID", type: "TEXT", validation: "UNIQUE_REQUIRED" },
    B: { name: "Product_Name", type: "TEXT", validation: "REQUIRED" },
    C: { name: "Category", type: "DROPDOWN", validation: "CATEGORY_LIST" },
    D: { name: "Description", type: "TEXT", validation: "OPTIONAL" },
    E: { name: "Unit_Price", type: "CURRENCY", validation: "MIN_0" },
    F: { name: "Cost_Price", type: "CURRENCY", validation: "MIN_0" },
    G: { name: "Margin", type: "FORMULA", formula: "=(E{row}-F{row})/E{row}" },
    H: { name: "Stock_Level", type: "NUMBER", validation: "MIN_0" },
    I: { name: "Min_Order_Qty", type: "NUMBER", validation: "MIN_1" },
    J: { name: "Lead_Time_Days", type: "NUMBER", validation: "MIN_0" },
    K: { name: "Supplier", type: "TEXT", validation: "OPTIONAL" },
    L: { name: "Status", type: "DROPDOWN", validation: "PRODUCT_STATUS" },
    M: { name: "Image_URL", type: "URL", validation: "OPTIONAL" },
    N: { name: "Specifications", type: "TEXT", validation: "OPTIONAL" },
    O: { name: "Created_Date", type: "DATE", validation: "AUTO_DATE" },
    P: { name: "Last_Updated", type: "TIMESTAMP", validation: "AUTO_UPDATE" }
  }
};

// EMAIL TEMPLATES SHEET
const EMAIL_TEMPLATES_SCHEMA = {
  sheetName: "Email_Templates",
  columns: {
    A: { name: "Template_ID", type: "TEXT", validation: "UNIQUE_REQUIRED" },
    B: { name: "Template_Name", type: "TEXT", validation: "REQUIRED" },
    C: { name: "Category", type: "DROPDOWN", validation: "TEMPLATE_CATEGORY" },
    D: { name: "Subject", type: "TEXT", validation: "REQUIRED" },
    E: { name: "Body_HTML", type: "TEXT", validation: "REQUIRED" },
    F: { name: "Variables", type: "TEXT", validation: "OPTIONAL" },
    G: { name: "Language", type: "DROPDOWN", validation: "LANGUAGE_LIST" },
    H: { name: "Status", type: "DROPDOWN", validation: "TEMPLATE_STATUS" },
    I: { name: "Usage_Count", type: "NUMBER", validation: "AUTO_COUNT" },
    J: { name: "Created_By", type: "TEXT", validation: "AUTO_USER" },
    K: { name: "Created_Date", type: "DATE", validation: "AUTO_DATE" },
    L: { name: "Last_Used", type: "TIMESTAMP", validation: "AUTO_UPDATE" }
  }
};

// SHIPPING LOG SHEET
const SHIPPING_LOG_SCHEMA = {
  sheetName: "Shipping_Log",
  columns: {
    A: { name: "Shipping_ID", type: "TEXT", validation: "UNIQUE_REQUIRED" },
    B: { name: "Order_ID", type: "TEXT", validation: "REQUIRED" },
    C: { name: "Tracking_Number", type: "TEXT", validation: "REQUIRED" },
    D: { name: "Carrier", type: "DROPDOWN", validation: "CARRIER_LIST" },
    E: { name: "Service_Type", type: "DROPDOWN", validation: "SERVICE_TYPE" },
    F: { name: "Ship_Date", type: "DATE", validation: "REQUIRED" },
    G: { name: "Expected_Delivery", type: "DATE", validation: "AFTER_SHIP_DATE" },
    H: { name: "Actual_Delivery", type: "DATE", validation: "OPTIONAL" },
    I: { name: "Weight_KG", type: "NUMBER", validation: "MIN_0" },
    J: { name: "Dimensions", type: "TEXT", validation: "OPTIONAL" },
    K: { name: "Shipping_Cost", type: "CURRENCY", validation: "MIN_0" },
    L: { name: "Status", type: "DROPDOWN", validation: "SHIPPING_STATUS" },
    M: { name: "Origin_Address", type: "TEXT", validation: "REQUIRED" },
    N: { name: "Destination_Address", type: "TEXT", validation: "REQUIRED" },
    O: { name: "Special_Instructions", type: "TEXT", validation: "OPTIONAL" },
    P: { name: "Last_Updated", type: "TIMESTAMP", validation: "AUTO_UPDATE" }
  }
};

// PAYMENT RECORDS SHEET
const PAYMENT_RECORDS_SCHEMA = {
  sheetName: "Payment_Records",
  columns: {
    A: { name: "Payment_ID", type: "TEXT", validation: "UNIQUE_REQUIRED" },
    B: { name: "Order_ID", type: "TEXT", validation: "REQUIRED" },
    C: { name: "Invoice_Number", type: "TEXT", validation: "OPTIONAL" },
    D: { name: "Payment_Date", type: "DATE", validation: "REQUIRED" },
    E: { name: "Amount", type: "CURRENCY", validation: "MIN_0" },
    F: { name: "Payment_Method", type: "DROPDOWN", validation: "PAYMENT_METHOD" },
    G: { name: "Transaction_ID", type: "TEXT", validation: "OPTIONAL" },
    H: { name: "Currency", type: "DROPDOWN", validation: "CURRENCY_LIST" },
    I: { name: "Exchange_Rate", type: "NUMBER", validation: "MIN_0" },
    J: { name: "Amount_USD", type: "FORMULA", formula: "=E{row}*I{row}" },
    K: { name: "Status", type: "DROPDOWN", validation: "PAYMENT_STATUS" },
    L: { name: "Notes", type: "TEXT", validation: "OPTIONAL" },
    M: { name: "Processed_By", type: "TEXT", validation: "AUTO_USER" },
    N: { name: "Created_Date", type: "TIMESTAMP", validation: "AUTO_TIMESTAMP" }
  }
};

// VALIDATION LISTS
const SUPPORTING_VALIDATION_LISTS = {
  COUNTRY_LIST: ["United States", "China", "Germany", "Japan", "United Kingdom", "France", "Italy", "Canada", "Australia", "South Korea", "Other"],
  
  INDUSTRY_LIST: ["Manufacturing", "Technology", "Healthcare", "Automotive", "Textiles", "Electronics", "Food & Beverage", "Construction", "Energy", "Other"],
  
  PAYMENT_TERMS: ["NET 30", "NET 15", "COD", "50% Advance", "Letter of Credit", "Custom Terms"],
  
  CLIENT_STATUS: ["Active", "Inactive", "Potential", "Blocked"],
  
  PRODUCT_STATUS: ["Active", "Discontinued", "Out of Stock", "Pre-Order"],
  
  TEMPLATE_CATEGORY: ["Quote", "Order Confirmation", "Shipping Notice", "Payment Reminder", "Marketing", "Follow-up"],
  
  LANGUAGE_LIST: ["English", "Chinese (Simplified)", "Chinese (Traditional)", "Spanish", "German", "French"],
  
  TEMPLATE_STATUS: ["Active", "Draft", "Archived"],
  
  CARRIER_LIST: ["DHL", "FedEx", "UPS", "EMS", "SF Express", "Local Courier", "Other"],
  
  SERVICE_TYPE: ["Express", "Standard", "Economy", "Overnight", "2-Day"],
  
  SHIPPING_STATUS: ["Pending", "Picked Up", "In Transit", "Out for Delivery", "Delivered", "Exception"],
  
  PAYMENT_METHOD: ["Wire Transfer", "Credit Card", "PayPal", "Alipay", "WeChat Pay", "Check", "Cash"],
  
  CURRENCY_LIST: ["USD", "CNY", "EUR", "GBP", "JPY", "KRW", "CAD", "AUD"],
  
  PAYMENT_STATUS: ["Pending", "Processing", "Completed", "Failed", "Refunded"]
};

// SHEET CREATION FUNCTIONS
function createSupportingSheets() {
  const sheets = [
    CLIENTS_DB_SCHEMA,
    PRODUCTS_CATALOG_SCHEMA,
    EMAIL_TEMPLATES_SCHEMA,
    SHIPPING_LOG_SCHEMA,
    PAYMENT_RECORDS_SCHEMA
  ];
  
  sheets.forEach(schema => {
    createSupportingSheet(schema);
  });
  
  // Create lookup relationships
  createLookupFormulas();
  
  console.log('All supporting sheets created successfully!');
}

function createSupportingSheet(schema) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(schema.sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(schema.sheetName);
  }
  
  // Set up headers
  const headers = Object.values(schema.columns).map(col => col.name);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#34A853");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Apply schema-specific validations
  applySupportingSheetValidations(sheet, schema);
  
  return sheet;
}

function applySupportingSheetValidations(sheet, schema) {
  const lastRow = Math.max(sheet.getLastRow(), 500);
  
  Object.entries(schema.columns).forEach(([col, config], index) => {
    const colNum = index + 1;
    const range = sheet.getRange(2, colNum, lastRow - 1, 1);
    
    switch (config.validation) {
      case 'EMAIL_REQUIRED':
        const emailValidation = SpreadsheetApp.newDataValidation()
          .requireTextIsEmail()
          .setHelpText('Please enter a valid email address')
          .build();
        range.setDataValidation(emailValidation);
        break;
        
      case 'MIN_0':
        const minValidation = SpreadsheetApp.newDataValidation()
          .requireNumberGreaterThanOrEqualTo(0)
          .setHelpText('Value must be 0 or greater')
          .build();
        range.setDataValidation(minValidation);
        break;
        
      case 'MIN_1':
        const minOneValidation = SpreadsheetApp.newDataValidation()
          .requireNumberGreaterThanOrEqualTo(1)
          .setHelpText('Value must be at least 1')
          .build();
        range.setDataValidation(minOneValidation);
        break;
        
      default:
        // Check if it's a dropdown validation
        const validationKey = config.validation;
        if (SUPPORTING_VALIDATION_LISTS[validationKey]) {
          const dropdownValidation = SpreadsheetApp.newDataValidation()
            .requireValueInList(SUPPORTING_VALIDATION_LISTS[validationKey])
            .setAllowInvalid(false)
            .build();
          range.setDataValidation(dropdownValidation);
        }
        break;
    }
    
    // Apply formulas
    if (config.formula) {
      const formula = config.formula.replace('{row}', '2');
      range.setFormula(formula);
    }
  });
}

// LOOKUP FORMULAS FOR MAIN ORDER SHEET
function createLookupFormulas() {
  const orderSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Order_Management');
  if (!orderSheet) return;
  
  // Add VLOOKUP formulas for client and product information
  const lastRow = Math.max(orderSheet.getLastRow(), 1000);
  
  // Client lookup - populate client email from Clients_DB
  const clientEmailFormula = '=IF(B2<>"",IFERROR(VLOOKUP(B2,Clients_DB!B:D,3,FALSE),""),"")';
  orderSheet.getRange(2, 3, lastRow - 1, 1).setFormula(clientEmailFormula);
  
  // Product lookup - populate unit price from Products_Catalog
  const priceFormula = '=IF(E2<>"",IFERROR(VLOOKUP(E2,Products_Catalog!B:E,4,FALSE),""),"")';
  orderSheet.getRange(2, 8, lastRow - 1, 1).setFormula(priceFormula);
}

// DASHBOARD CREATION
function createDashboardSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboard = ss.getSheetByName('Dashboard');
  
  if (!dashboard) {
    dashboard = ss.insertSheet('Dashboard', 0); // Insert as first sheet
  }
  
  // Dashboard layout
  dashboard.getRange('A1').setValue('TRADE OPERATIONS DASHBOARD');
  dashboard.getRange('A1').setFontSize(18).setFontWeight('bold');
  dashboard.getRange('A1:H1').merge();
  
  // Key metrics
  const metrics = [
    ['METRIC', 'VALUE', 'FORMULA'],
    ['Total Orders', '', '=COUNTA(Order_Management!A:A)-1'],
    ['Pending Orders', '', '=COUNTIF(Order_Management!J:J,"Pending")'],
    ['Total Revenue', '', '=SUM(Order_Management!I:I)'],
    ['Active Clients', '', '=COUNTIF(Clients_DB!L:L,"Active")'],
    ['Products in Catalog', '', '=COUNTA(Products_Catalog!A:A)-1'],
    ['Avg Order Value', '', '=AVERAGE(Order_Management!I:I)']
  ];
  
  dashboard.getRange(3, 1, metrics.length, 3).setValues(metrics);
  dashboard.getRange(3, 1, 1, 3).setBackground('#4285F4').setFontColor('#FFFFFF').setFontWeight('bold');
  
  return dashboard;
}

// INSTALLATION FUNCTION
function installCompleteDatabaseSystem() {
  console.log('Installing complete Trade Operations database system...');
  
  // Create main Order Management sheet
  const mainSheet = installOrderManagementSystem();
  
  // Create supporting sheets
  createSupportingSheets();
  
  // Create dashboard
  createDashboardSheet();
  
  // Set up named ranges for easier formula references
  createNamedRanges();
  
  console.log('Complete database system installed successfully!');
  console.log('Sheets created: Order_Management, Clients_DB, Products_Catalog, Email_Templates, Shipping_Log, Payment_Records, Dashboard');
  
  return SpreadsheetApp.getActiveSpreadsheet();
}

function createNamedRanges() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Named ranges for easier formula references
  const namedRanges = [
    { name: 'OrderData', range: 'Order_Management!A:Q' },
    { name: 'ClientData', range: 'Clients_DB!A:P' },
    { name: 'ProductData', range: 'Products_Catalog!A:P' },
    { name: 'ShippingData', range: 'Shipping_Log!A:P' },
    { name: 'PaymentData', range: 'Payment_Records!A:N' }
  ];
  
  namedRanges.forEach(nr => {
    try {
      ss.setNamedRange(nr.name, ss.getRange(nr.range));
    } catch (error) {
      console.log(`Named range ${nr.name} already exists or invalid range`);
    }
  });
}