/**
 * Google Drive Folder Automation System
 * Google Workspace Architect - TSK-002
 * Advanced folder creation and management for Trade Operations
 */

// DRIVE FOLDER CONFIGURATION
const DRIVE_CONFIG = {
  rootStructure: {
    'Trade_Operations': {
      '01_Orders': {
        // Dynamic year/quarter folders created automatically
      },
      '02_Templates': {
        'Documents': ['Quote_Template.docx', 'Contract_Template.docx', 'Invoice_Template.docx'],
        'Emails': ['Welcome_Email.html', 'Order_Confirmation.html', 'Shipping_Notice.html'],
        'Reports': ['Daily_Report.xlsx', 'Weekly_Summary.xlsx', 'Monthly_Analysis.xlsx']
      },
      '03_Marketing': {
        'Campaigns': [],
        'Leads': [],
        'Analytics': []
      },
      '04_Archive': {
        // Automatically organized by year
      },
      '05_Documentation': {
        'API_Docs': [],
        'Process_Guides': [],
        'Training_Materials': []
      }
    }
  },
  
  orderFolderStructure: {
    'Documents': {
      'Quotes': [],
      'Contracts': [],
      'Invoices': [],
      'Certificates': []
    },
    'Communications': {
      'Emails': [],
      'WeChat_Logs': [],
      'Phone_Records': []
    },
    'Attachments': {
      'Product_Specs': [],
      'Shipping_Docs': [],
      'Quality_Reports': [],
      'Photos': []
    },
    'Internal': {
      'Production_Notes': [],
      'Quality_Control': [],
      'Logistics_Planning': []
    }
  },
  
  permissions: {
    'Admin': { access: DriveApp.Access.DOMAIN, permission: DriveApp.Permission.EDIT },
    'Manager': { access: DriveApp.Access.DOMAIN, permission: DriveApp.Permission.EDIT },
    'User': { access: DriveApp.Access.DOMAIN_WITH_LINK, permission: DriveApp.Permission.VIEW },
    'Client': { access: DriveApp.Access.ANYONE_WITH_LINK, permission: DriveApp.Permission.VIEW }
  }
};

// MAIN DRIVE SYSTEM INITIALIZATION
function initializeDriveSystem() {
  console.log('Initializing Trade Operations Drive System...');
  
  try {
    // Create root folder structure
    const rootFolder = createRootStructure();
    
    // Store folder IDs in script properties
    storeSystemFolderIds(rootFolder);
    
    // Set up automated triggers
    setupDriveTriggers();
    
    // Create initial template files
    createInitialTemplates();
    
    console.log('Drive system initialized successfully!');
    console.log(`Root folder ID: ${rootFolder.getId()}`);
    
    return rootFolder;
    
  } catch (error) {
    console.error('Error initializing drive system:', error);
    throw error;
  }
}

function createRootStructure() {
  // Check if root folder exists
  let rootFolder;
  const existingFolders = DriveApp.getFoldersByName('Trade_Operations');
  
  if (existingFolders.hasNext()) {
    rootFolder = existingFolders.next();
    console.log('Using existing Trade_Operations folder');
  } else {
    rootFolder = DriveApp.createFolder('Trade_Operations');
    console.log('Created new Trade_Operations folder');
  }
  
  // Create main structure
  Object.entries(DRIVE_CONFIG.rootStructure.Trade_Operations).forEach(([folderName, subStructure]) => {
    const mainFolder = getOrCreateFolder(rootFolder, folderName);
    
    if (typeof subStructure === 'object' && Object.keys(subStructure).length > 0) {
      createSubfolderStructure(mainFolder, subStructure);
    }
  });
  
  // Set permissions for root folder
  setFolderPermissions(rootFolder, 'Admin');
  
  return rootFolder;
}

function createSubfolderStructure(parentFolder, structure) {
  Object.entries(structure).forEach(([folderName, content]) => {
    const subfolder = getOrCreateFolder(parentFolder, folderName);
    
    if (Array.isArray(content)) {
      // Create placeholder files if specified
      content.forEach(filename => {
        if (!fileExists(subfolder, filename)) {
          const blob = Utilities.newBlob('', 'text/plain', filename);
          subfolder.createFile(blob);
        }
      });
    } else if (typeof content === 'object') {
      // Recursive subfolder creation
      createSubfolderStructure(subfolder, content);
    }
  });
}

// ENHANCED ORDER FOLDER CREATION
function createAdvancedOrderFolder(orderId, clientName, clientEmail = '', productCategory = '') {
  try {
    console.log(`Creating order folder for: ${orderId} - ${clientName}`);
    
    const rootFolderId = PropertiesService.getScriptProperties().getProperty('TRADE_OPERATIONS_FOLDER_ID');
    if (!rootFolderId) {
      throw new Error('Root folder ID not found. Please run initializeDriveSystem() first.');
    }
    
    const rootFolder = DriveApp.getFolderById(rootFolderId);
    const ordersFolder = getOrCreateFolder(rootFolder, '01_Orders');
    
    // Parse date from Order_ID (ORD-YYYY-MM-DD-XXX)
    const orderParts = orderId.split('-');
    if (orderParts.length !== 4) {
      throw new Error(`Invalid Order ID format: ${orderId}. Expected: ORD-YYYY-MM-DD-XXX`);
    }
    
    const year = orderParts[1];
    const month = parseInt(orderParts[2]);
    const quarter = `Q${Math.ceil(month / 3)}`;
    
    // Navigate to correct location
    const yearFolder = getOrCreateFolder(ordersFolder, year);
    const quarterFolder = getOrCreateFolder(yearFolder, quarter);
    
    // Create order-specific folder with sanitized name
    const sanitizedClientName = sanitizeFolderName(clientName);
    const orderFolderName = `${orderId}_${sanitizedClientName}`;
    const orderFolder = getOrCreateFolder(quarterFolder, orderFolderName);
    
    // Create detailed subfolder structure
    createOrderSubfolders(orderFolder);
    
    // Set folder permissions based on client access needs
    setOrderFolderPermissions(orderFolder, clientEmail);
    
    // Create initial metadata file
    createOrderMetadata(orderFolder, orderId, clientName, clientEmail, productCategory);
    
    // Log creation for audit trail
    logFolderCreation(orderId, orderFolder.getId(), orderFolder.getUrl());
    
    return {
      folderId: orderFolder.getId(),
      folderUrl: orderFolder.getUrl(),
      folderPath: `${year}/${quarter}/${orderFolderName}`,
      subfolders: getSubfolderDetails(orderFolder)
    };
    
  } catch (error) {
    console.error(`Error creating order folder for ${orderId}:`, error);
    return {
      error: error.message,
      folderId: 'ERROR_CREATING_FOLDER',
      folderUrl: 'ERROR',
      folderPath: 'ERROR'
    };
  }
}

function createOrderSubfolders(orderFolder) {
  function createStructure(parentFolder, structure) {
    Object.entries(structure).forEach(([folderName, subStructure]) => {
      const subfolder = getOrCreateFolder(parentFolder, folderName);
      
      if (typeof subStructure === 'object' && Object.keys(subStructure).length > 0) {
        createStructure(subfolder, subStructure);
      }
    });
  }
  
  createStructure(orderFolder, DRIVE_CONFIG.orderFolderStructure);
}

function setOrderFolderPermissions(orderFolder, clientEmail) {
  try {
    // Set domain permissions
    orderFolder.setSharing(DRIVE_CONFIG.permissions.User.access, DRIVE_CONFIG.permissions.User.permission);
    
    // Add specific client access if email provided
    if (clientEmail && clientEmail.includes('@')) {
      orderFolder.addEditor(clientEmail);
      
      // Create client-specific view folder
      const clientFolder = getOrCreateFolder(orderFolder, 'Client_Access');
      clientFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      console.log(`Added client access for: ${clientEmail}`);
    }
    
  } catch (error) {
    console.error('Error setting folder permissions:', error);
  }
}

function createOrderMetadata(orderFolder, orderId, clientName, clientEmail, productCategory) {
  const metadata = {
    orderId: orderId,
    clientName: clientName,
    clientEmail: clientEmail,
    productCategory: productCategory,
    createdDate: new Date().toISOString(),
    folderStructure: Object.keys(DRIVE_CONFIG.orderFolderStructure),
    status: 'Active'
  };
  
  const metadataJson = JSON.stringify(metadata, null, 2);
  const blob = Utilities.newBlob(metadataJson, 'application/json', '_order_metadata.json');
  orderFolder.createFile(blob);
}

// AUTOMATED FOLDER ORGANIZATION
function organizeCompletedOrders() {
  console.log('Starting automated order organization...');
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Order_Management');
    if (!sheet) {
      console.error('Order_Management sheet not found');
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const orderIdCol = headers.indexOf('Order_ID');
    const statusCol = headers.indexOf('Order_Status');
    const folderLinkCol = headers.indexOf('Drive_Folder_Link');
    
    let archivedCount = 0;
    
    // Process completed orders
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const orderId = row[orderIdCol];
      const status = row[statusCol];
      const folderLink = row[folderLinkCol];
      
      if (status === 'Delivered' && folderLink && folderLink !== '') {
        const archived = archiveCompletedOrder(orderId, folderLink);
        if (archived) {
          archivedCount++;
        }
      }
    }
    
    console.log(`Archived ${archivedCount} completed orders`);
    
  } catch (error) {
    console.error('Error organizing completed orders:', error);
  }
}

function archiveCompletedOrder(orderId, folderUrl) {
  try {
    const folderId = extractFolderIdFromUrl(folderUrl);
    if (!folderId) return false;
    
    const orderFolder = DriveApp.getFolderById(folderId);
    const archiveFolder = getArchiveFolder();
    
    // Move to archive with timestamp
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const archivedName = `${orderFolder.getName()}_archived_${timestamp}`;
    
    // Create archive subfolder
    const yearFolder = getOrCreateFolder(archiveFolder, new Date().getFullYear().toString());
    
    // Move folder to archive
    orderFolder.moveTo(yearFolder);
    orderFolder.setName(archivedName);
    
    console.log(`Archived order folder: ${orderId}`);
    return true;
    
  } catch (error) {
    console.error(`Error archiving order ${orderId}:`, error);
    return false;
  }
}

// DRIVE MAINTENANCE AND OPTIMIZATION
function performDriveMaintenance() {
  console.log('Performing drive maintenance...');
  
  try {
    // Clean up empty folders
    cleanupEmptyFolders();
    
    // Organize archive folders by date
    organizeArchiveFolders();
    
    // Update folder permissions
    updateFolderPermissions();
    
    // Generate storage report
    generateStorageReport();
    
    console.log('Drive maintenance completed successfully');
    
  } catch (error) {
    console.error('Error during drive maintenance:', error);
  }
}

function cleanupEmptyFolders() {
  const rootFolder = DriveApp.getFolderById(
    PropertiesService.getScriptProperties().getProperty('TRADE_OPERATIONS_FOLDER_ID')
  );
  
  const emptyFolders = findEmptyFolders(rootFolder);
  
  emptyFolders.forEach(folder => {
    if (folder.getName() !== 'Trade_Operations') { // Don't delete root
      console.log(`Removing empty folder: ${folder.getName()}`);
      folder.setTrashed(true);
    }
  });
}

function generateStorageReport() {
  const report = {
    timestamp: new Date().toISOString(),
    totalFolders: 0,
    totalFiles: 0,
    storageUsed: 0,
    folderBreakdown: {}
  };
  
  const rootFolder = DriveApp.getFolderById(
    PropertiesService.getScriptProperties().getProperty('TRADE_OPERATIONS_FOLDER_ID')
  );
  
  analyzeFolder(rootFolder, report);
  
  // Save report
  const reportJson = JSON.stringify(report, null, 2);
  const blob = Utilities.newBlob(reportJson, 'application/json', 
    `storage_report_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')}.json`);
  
  const reportsFolder = getOrCreateFolder(rootFolder, '05_Documentation/Reports');
  reportsFolder.createFile(blob);
  
  console.log('Storage report generated:', report);
  return report;
}

// UTILITY FUNCTIONS
function getOrCreateFolder(parentFolder, name) {
  const folders = parentFolder.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(name);
  }
}

function sanitizeFolderName(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
}

function fileExists(folder, filename) {
  const files = folder.getFilesByName(filename);
  return files.hasNext();
}

function setFolderPermissions(folder, roleType) {
  const permission = DRIVE_CONFIG.permissions[roleType];
  if (permission) {
    folder.setSharing(permission.access, permission.permission);
  }
}

function extractFolderIdFromUrl(url) {
  const match = url.match(/folders\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

function getArchiveFolder() {
  const rootFolderId = PropertiesService.getScriptProperties().getProperty('TRADE_OPERATIONS_FOLDER_ID');
  const rootFolder = DriveApp.getFolderById(rootFolderId);
  return getOrCreateFolder(rootFolder, '04_Archive');
}

function getSubfolderDetails(parentFolder) {
  const subfolders = {};
  const folders = parentFolder.getFolders();
  
  while (folders.hasNext()) {
    const folder = folders.next();
    subfolders[folder.getName()] = folder.getId();
  }
  
  return subfolders;
}

function findEmptyFolders(parentFolder) {
  const emptyFolders = [];
  const folders = parentFolder.getFolders();
  
  while (folders.hasNext()) {
    const folder = folders.next();
    const hasFiles = folder.getFiles().hasNext();
    const hasSubfolders = folder.getFolders().hasNext();
    
    if (!hasFiles && !hasSubfolders) {
      emptyFolders.push(folder);
    } else {
      emptyFolders.push(...findEmptyFolders(folder));
    }
  }
  
  return emptyFolders;
}

function analyzeFolder(folder, report, path = '') {
  const currentPath = path ? `${path}/${folder.getName()}` : folder.getName();
  
  // Count folders and files
  const folders = folder.getFolders();
  const files = folder.getFiles();
  
  let folderCount = 0;
  let fileCount = 0;
  let size = 0;
  
  while (folders.hasNext()) {
    const subfolder = folders.next();
    folderCount++;
    const subResult = analyzeFolder(subfolder, report, currentPath);
    folderCount += subResult.folders;
    fileCount += subResult.files;
    size += subResult.size;
  }
  
  while (files.hasNext()) {
    const file = files.next();
    fileCount++;
    size += file.getSize();
  }
  
  report.totalFolders += folderCount;
  report.totalFiles += fileCount;
  report.storageUsed += size;
  report.folderBreakdown[currentPath] = { folders: folderCount, files: fileCount, size: size };
  
  return { folders: folderCount, files: fileCount, size: size };
}

function storeSystemFolderIds(rootFolder) {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('TRADE_OPERATIONS_FOLDER_ID', rootFolder.getId());
  
  // Store key subfolder IDs
  const ordersFolder = getOrCreateFolder(rootFolder, '01_Orders');
  const templatesFolder = getOrCreateFolder(rootFolder, '02_Templates');
  const archiveFolder = getOrCreateFolder(rootFolder, '04_Archive');
  
  properties.setProperties({
    'ORDERS_FOLDER_ID': ordersFolder.getId(),
    'TEMPLATES_FOLDER_ID': templatesFolder.getId(),
    'ARCHIVE_FOLDER_ID': archiveFolder.getId()
  });
  
  console.log('System folder IDs stored in script properties');
}

function setupDriveTriggers() {
  // Clean up existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'organizeCompletedOrders' || 
        trigger.getHandlerFunction() === 'performDriveMaintenance') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create daily maintenance trigger
  ScriptApp.newTrigger('performDriveMaintenance')
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();
  
  // Create weekly organization trigger
  ScriptApp.newTrigger('organizeCompletedOrders')
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(3)
    .create();
  
  console.log('Drive automation triggers created');
}

function createInitialTemplates() {
  // This will be expanded to create actual template files
  console.log('Template creation scheduled for future implementation');
}

function logFolderCreation(orderId, folderId, folderUrl) {
  const logData = [
    [new Date(), orderId, folderId, folderUrl, 'Created', Session.getActiveUser().getEmail()]
  ];
  
  // Log to a tracking sheet if it exists
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = ss.getSheetByName('Folder_Log');
    if (!logSheet) {
      logSheet = ss.insertSheet('Folder_Log');
      logSheet.getRange(1, 1, 1, 6).setValues([['Timestamp', 'Order_ID', 'Folder_ID', 'Folder_URL', 'Action', 'User']]);
    }
    
    logSheet.appendRow(logData[0]);
  } catch (error) {
    console.error('Error logging folder creation:', error);
  }
}

// MAIN INSTALLATION FUNCTION
function installDriveAutomationSystem() {
  console.log('Installing complete Drive automation system...');
  
  try {
    // Initialize drive structure
    const rootFolder = initializeDriveSystem();
    
    console.log('Drive automation system installed successfully!');
    console.log(`Root folder: ${rootFolder.getName()} (${rootFolder.getId()})`);
    console.log('Automated triggers configured');
    console.log('Folder creation functions ready');
    
    return {
      success: true,
      rootFolderId: rootFolder.getId(),
      rootFolderUrl: rootFolder.getUrl(),
      message: 'Drive automation system ready for order processing'
    };
    
  } catch (error) {
    console.error('Error installing drive system:', error);
    return {
      success: false,
      error: error.message
    };
  }
}