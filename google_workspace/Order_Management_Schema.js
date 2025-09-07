/**
 * Order_Management Google Sheets Database Schema
 * Google Workspace Architect - TSK-002
 * Critical Path Implementation
 */

// SHEET STRUCTURE CONFIGURATION
const ORDER_MANAGEMENT_SCHEMA = {
  sheetName: "Order_Management",
  columns: {
    A: { name: "Order_ID", type: "TEXT", validation: "UNIQUE_REQUIRED", format: "ORD-YYYY-MM-DD-XXX" },
    B: { name: "Client_Name", type: "TEXT", validation: "REQUIRED", maxLength: 100 },
    C: { name: "Client_Email", type: "EMAIL", validation: "EMAIL_REQUIRED" },
    D: { name: "Client_Phone", type: "TEXT", validation: "PHONE_FORMAT" },
    E: { name: "Product_Name", type: "TEXT", validation: "REQUIRED", maxLength: 200 },
    F: { name: "Product_Category", type: "DROPDOWN", validation: "CATEGORY_LIST" },
    G: { name: "Quantity", type: "NUMBER", validation: "MIN_1", format: "#,##0" },
    H: { name: "Unit_Price", type: "CURRENCY", validation: "MIN_0", format: "$#,##0.00" },
    I: { name: "Total_Amount", type: "FORMULA", formula: "=G{row}*H{row}", format: "$#,##0.00" },
    J: { name: "Order_Status", type: "DROPDOWN", validation: "STATUS_LIST" },
    K: { name: "Order_Date", type: "DATE", validation: "REQUIRED", format: "MM/DD/YYYY" },
    L: { name: "Delivery_Date", type: "DATE", validation: "AFTER_ORDER_DATE", format: "MM/DD/YYYY" },
    M: { name: "Tracking_Number", type: "TEXT", validation: "OPTIONAL" },
    N: { name: "Drive_Folder_Link", type: "URL", validation: "AUTO_GENERATED" },
    O: { name: "Payment_Status", type: "DROPDOWN", validation: "PAYMENT_LIST" },
    P: { name: "Notes", type: "TEXT", validation: "OPTIONAL", maxLength: 500 },
    Q: { name: "Last_Updated", type: "TIMESTAMP", validation: "AUTO_UPDATE" }
  }
};

// DATA VALIDATION RULES
const VALIDATION_RULES = {
  Order_ID: {
    pattern: /^ORD-\d{4}-\d{2}-\d{2}-\d{3}$/,
    unique: true,
    required: true,
    generator: () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const sequence = getNextOrderSequence();
      return `ORD-${year}-${month}-${day}-${sequence}`;
    }
  },
  
  Client_Email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: true,
    errorMessage: "Please enter a valid email address"
  },
  
  Client_Phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    required: false,
    errorMessage: "Please enter a valid phone number"
  },
  
  Product_Category: {
    list: ["Electronics", "Textiles", "Machinery", "Raw Materials", "Consumer Goods", "Industrial Parts"],
    required: false
  },
  
  Quantity: {
    min: 1,
    max: 999999,
    integer: true,
    required: true
  },
  
  Unit_Price: {
    min: 0,
    max: 9999999,
    decimal: true,
    required: true
  },
  
  Order_Status: {
    list: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
    required: true
  },
  
  Payment_Status: {
    list: ["Pending", "Partial", "Complete", "Refunded"],
    default: "Pending",
    required: true
  },
  
  Delivery_Date: {
    custom: (value, row) => {
      const orderDate = new Date(row.Order_Date);
      const deliveryDate = new Date(value);
      return deliveryDate > orderDate;
    },
    errorMessage: "Delivery date must be after order date"
  }
};

// CONDITIONAL FORMATTING RULES
const FORMATTING_RULES = {
  Status_Colors: {
    range: "J:J",
    rules: [
      { condition: "TEXT_EQ", value: "Pending", backgroundColor: "#FFF2CC", fontColor: "#BF9000" },
      { condition: "TEXT_EQ", value: "Processing", backgroundColor: "#E1D5E7", fontColor: "#6C3483" },
      { condition: "TEXT_EQ", value: "Shipped", backgroundColor: "#D5E8D4", fontColor: "#388E3C" },
      { condition: "TEXT_EQ", value: "Delivered", backgroundColor: "#C8E6C9", fontColor: "#2E7D32" },
      { condition: "TEXT_EQ", value: "Cancelled", backgroundColor: "#FFCDD2", fontColor: "#C62828" }
    ]
  },
  
  Payment_Colors: {
    range: "O:O",
    rules: [
      { condition: "TEXT_EQ", value: "Pending", backgroundColor: "#FFCDD2", fontColor: "#C62828" },
      { condition: "TEXT_EQ", value: "Partial", backgroundColor: "#FFF2CC", fontColor: "#BF9000" },
      { condition: "TEXT_EQ", value: "Complete", backgroundColor: "#C8E6C9", fontColor: "#2E7D32" }
    ]
  },
  
  Overdue_Orders: {
    range: "L:L",
    condition: "CUSTOM_FORMULA",
    formula: "=AND(L2<TODAY(), J2<>\"Delivered\", J2<>\"Cancelled\")",
    backgroundColor: "#FFCDD2",
    fontColor: "#C62828"
  }
};

// GOOGLE APPS SCRIPT FUNCTIONS
function createOrderManagementSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(ORDER_MANAGEMENT_SCHEMA.sheetName);
  
  // Create sheet if doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(ORDER_MANAGEMENT_SCHEMA.sheetName);
  }
  
  // Set up headers
  const headers = Object.values(ORDER_MANAGEMENT_SCHEMA.columns).map(col => col.name);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#4285F4");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(11);
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Set column widths for optimal display
  const columnWidths = {
    1: 150,  // Order_ID
    2: 200,  // Client_Name
    3: 200,  // Client_Email
    4: 120,  // Client_Phone
    5: 250,  // Product_Name
    6: 120,  // Product_Category
    7: 80,   // Quantity
    8: 100,  // Unit_Price
    9: 120,  // Total_Amount
    10: 100, // Order_Status
    11: 100, // Order_Date
    12: 100, // Delivery_Date
    13: 150, // Tracking_Number
    14: 200, // Drive_Folder_Link
    15: 120, // Payment_Status
    16: 200, // Notes
    17: 120  // Last_Updated
  };
  
  Object.entries(columnWidths).forEach(([col, width]) => {
    sheet.setColumnWidth(col, width);
  });
  
  // Apply data validations
  applyDataValidations(sheet);
  
  // Apply conditional formatting
  applyConditionalFormatting(sheet);
  
  // Set up formulas
  setupFormulas(sheet);
  
  return sheet;
}

function applyDataValidations(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), 1000); // Prepare for 1000+ records
  
  // Order_ID validation (Column A)
  const orderIdRange = sheet.getRange(2, 1, lastRow - 1, 1);
  const orderIdValidation = SpreadsheetApp.newDataValidation()
    .requireTextMatchesPattern('^ORD-\\d{4}-\\d{2}-\\d{2}-\\d{3}$')
    .setHelpText('Format: ORD-YYYY-MM-DD-XXX (e.g., ORD-2024-01-15-001)')
    .build();
  orderIdRange.setDataValidation(orderIdValidation);
  
  // Client_Email validation (Column C)
  const emailRange = sheet.getRange(2, 3, lastRow - 1, 1);
  const emailValidation = SpreadsheetApp.newDataValidation()
    .requireTextIsEmail()
    .setHelpText('Please enter a valid email address')
    .build();
  emailRange.setDataValidation(emailValidation);
  
  // Product_Category dropdown (Column F)
  const categoryRange = sheet.getRange(2, 6, lastRow - 1, 1);
  const categoryValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(VALIDATION_RULES.Product_Category.list)
    .setAllowInvalid(false)
    .build();
  categoryRange.setDataValidation(categoryValidation);
  
  // Quantity validation (Column G)
  const quantityRange = sheet.getRange(2, 7, lastRow - 1, 1);
  const quantityValidation = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThanOrEqualTo(1)
    .setHelpText('Quantity must be at least 1')
    .build();
  quantityRange.setDataValidation(quantityValidation);
  
  // Unit_Price validation (Column H)
  const priceRange = sheet.getRange(2, 8, lastRow - 1, 1);
  const priceValidation = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThanOrEqualTo(0)
    .setHelpText('Price must be 0 or greater')
    .build();
  priceRange.setDataValidation(priceValidation);
  
  // Order_Status dropdown (Column J)
  const statusRange = sheet.getRange(2, 10, lastRow - 1, 1);
  const statusValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(VALIDATION_RULES.Order_Status.list)
    .setAllowInvalid(false)
    .build();
  statusRange.setDataValidation(statusValidation);
  
  // Payment_Status dropdown (Column O)
  const paymentRange = sheet.getRange(2, 15, lastRow - 1, 1);
  const paymentValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(VALIDATION_RULES.Payment_Status.list)
    .setAllowInvalid(false)
    .build();
  paymentRange.setDataValidation(paymentValidation);
}

function applyConditionalFormatting(sheet) {
  // Order Status formatting
  FORMATTING_RULES.Status_Colors.rules.forEach(rule => {
    const range = sheet.getRange(FORMATTING_RULES.Status_Colors.range);
    const conditionalFormatRule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(rule.value)
      .setBackground(rule.backgroundColor)
      .setFontColor(rule.fontColor)
      .setRanges([range])
      .build();
    
    const rules = sheet.getConditionalFormatRules();
    rules.push(conditionalFormatRule);
    sheet.setConditionalFormatRules(rules);
  });
  
  // Payment Status formatting
  FORMATTING_RULES.Payment_Colors.rules.forEach(rule => {
    const range = sheet.getRange(FORMATTING_RULES.Payment_Colors.range);
    const conditionalFormatRule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(rule.value)
      .setBackground(rule.backgroundColor)
      .setFontColor(rule.fontColor)
      .setRanges([range])
      .build();
    
    const rules = sheet.getConditionalFormatRules();
    rules.push(conditionalFormatRule);
    sheet.setConditionalFormatRules(rules);
  });
}

function setupFormulas(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), 1000);
  
  // Total_Amount formula (Column I)
  const totalRange = sheet.getRange(2, 9, lastRow - 1, 1);
  const totalFormula = '=IF(AND(G2<>"",H2<>""),G2*H2,"")';
  totalRange.setFormula(totalFormula);
  
  // Drive_Folder_Link formula (Column N)
  const folderRange = sheet.getRange(2, 14, lastRow - 1, 1);
  const folderFormula = '=IF(A2<>"",CONCATENATE("https://drive.google.com/drive/folders/",createOrderFolder(A2,B2)),"")';
  folderRange.setFormula(folderFormula);
  
  // Last_Updated timestamp (Column Q)
  const timestampRange = sheet.getRange(2, 17, lastRow - 1, 1);
  const timestampFormula = '=IF(A2<>"",NOW(),"")';
  timestampRange.setFormula(timestampFormula);
}

// DRIVE FOLDER CREATION FUNCTION
function createOrderFolder(orderId, clientName) {
  try {
    const rootFolderId = PropertiesService.getScriptProperties().getProperty('TRADE_OPERATIONS_FOLDER_ID');
    const rootFolder = DriveApp.getFolderById(rootFolderId);
    
    // Parse date from Order_ID
    const orderParts = orderId.split('-');
    const year = orderParts[1];
    const month = parseInt(orderParts[2]);
    const quarter = 'Q' + Math.ceil(month / 3);
    
    // Navigate/create folder structure
    const ordersFolder = getOrCreateFolder(rootFolder, '01_Orders');
    const yearFolder = getOrCreateFolder(ordersFolder, year);
    const quarterFolder = getOrCreateFolder(yearFolder, quarter);
    
    // Create order-specific folder
    const orderFolderName = `${orderId}_${clientName}`;
    const orderFolder = getOrCreateFolder(quarterFolder, orderFolderName);
    
    // Create subfolders
    getOrCreateFolder(orderFolder, 'Documents');
    const commFolder = getOrCreateFolder(orderFolder, 'Communications');
    getOrCreateFolder(commFolder, 'Emails');
    getOrCreateFolder(commFolder, 'WeChat_Logs');
    const attachFolder = getOrCreateFolder(orderFolder, 'Attachments');
    getOrCreateFolder(attachFolder, 'Product_Specs');
    getOrCreateFolder(attachFolder, 'Shipping_Docs');
    
    // Set sharing permissions
    orderFolder.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
    
    return orderFolder.getId();
    
  } catch (error) {
    console.error('Error creating order folder:', error);
    return 'ERROR_CREATING_FOLDER';
  }
}

function getOrCreateFolder(parentFolder, name) {
  const folders = parentFolder.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(name);
  }
}

// HELPER FUNCTIONS
function getNextOrderSequence() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ORDER_MANAGEMENT_SCHEMA.sheetName);
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const todayPattern = `ORD-${today}-`;
  
  const orderIds = sheet.getRange('A:A').getValues().flat().filter(id => 
    id.toString().startsWith(todayPattern)
  );
  
  const sequences = orderIds.map(id => {
    const parts = id.toString().split('-');
    return parseInt(parts[3]) || 0;
  });
  
  const maxSequence = Math.max(0, ...sequences);
  return String(maxSequence + 1).padStart(3, '0');
}

// PERFORMANCE OPTIMIZATION
function optimizeSheet(sheet) {
  // Enable iterative calculation
  SpreadsheetApp.getActiveSpreadsheet().setIterativeCalculationEnabled(true);
  SpreadsheetApp.getActiveSpreadsheet().setMaxIterativeCalculationCycles(10);
  
  // Batch operations for better performance
  SpreadsheetApp.flush();
}

// INSTALLATION FUNCTION
function installOrderManagementSystem() {
  console.log('Installing Order Management System...');
  
  const sheet = createOrderManagementSheet();
  optimizeSheet(sheet);
  
  console.log('Order Management System installed successfully!');
  console.log(`Sheet created: ${sheet.getName()}`);
  console.log(`Columns: ${Object.keys(ORDER_MANAGEMENT_SCHEMA.columns).length}`);
  console.log('Data validations applied');
  console.log('Conditional formatting applied');
  console.log('Drive integration ready');
  
  return sheet;
}