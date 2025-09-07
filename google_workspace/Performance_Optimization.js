/**
 * Performance Optimization System
 * Google Workspace Architect - TSK-002
 * Advanced performance optimization for 1000+ record capacity
 */

// PERFORMANCE CONFIGURATION
const PERFORMANCE_CONFIG = {
  batchSizes: {
    sheetsAPI: 100,        // Maximum batch size for Sheets API
    driveAPI: 50,          // Maximum batch size for Drive API
    formulaUpdate: 200,    // Maximum rows to update formulas at once
    dataValidation: 500    // Maximum rows for validation rules
  },
  
  caching: {
    ttl: 300000,          // Cache TTL: 5 minutes in milliseconds
    maxEntries: 1000,     // Maximum cache entries
    keyPrefix: 'trade_ops_'
  },
  
  optimization: {
    maxRowsPerSheet: 10000,     // Maximum rows before archiving
    formulaRecalcInterval: 30,   // Seconds between formula updates
    indexUpdateThreshold: 50,    // Records changed before index rebuild
    compressionLevel: 'high'     // Data compression level
  },
  
  monitoring: {
    performanceThresholds: {
      queryTime: 2000,      // Max query time in milliseconds
      apiLatency: 1000,     // Max API response time
      memoryUsage: 85,      // Max memory usage percentage
      errorRate: 1          // Max error rate percentage
    }
  }
};

// PERFORMANCE MONITORING SYSTEM
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      queries: [],
      apiCalls: [],
      errors: [],
      cacheStats: { hits: 0, misses: 0, size: 0 }
    };
    this.cache = new Map();
    this.setupMonitoring();
  }
  
  setupMonitoring() {
    // Initialize performance tracking
    this.startTime = Date.now();
    this.queryCount = 0;
    this.errorCount = 0;
    
    console.log('Performance monitoring initialized');
  }
  
  trackQuery(operation, duration, rowCount = 0) {
    this.metrics.queries.push({
      timestamp: new Date(),
      operation: operation,
      duration: duration,
      rowCount: rowCount,
      performance: duration < PERFORMANCE_CONFIG.monitoring.performanceThresholds.queryTime ? 'good' : 'slow'
    });
    
    this.queryCount++;
    
    if (duration > PERFORMANCE_CONFIG.monitoring.performanceThresholds.queryTime) {
      console.warn(`Slow query detected: ${operation} took ${duration}ms`);
    }
  }
  
  trackAPICall(api, endpoint, duration, success = true) {
    this.metrics.apiCalls.push({
      timestamp: new Date(),
      api: api,
      endpoint: endpoint,
      duration: duration,
      success: success
    });
    
    if (!success) {
      this.errorCount++;
    }
  }
  
  trackError(error, context = '') {
    this.metrics.errors.push({
      timestamp: new Date(),
      error: error.message,
      stack: error.stack,
      context: context
    });
    
    this.errorCount++;
  }
  
  getCacheStats() {
    return {
      ...this.metrics.cacheStats,
      hitRate: this.metrics.cacheStats.hits / (this.metrics.cacheStats.hits + this.metrics.cacheStats.misses) * 100
    };
  }
  
  getPerformanceSummary() {
    const now = Date.now();
    const runtime = now - this.startTime;
    
    return {
      runtime: runtime,
      totalQueries: this.queryCount,
      totalErrors: this.errorCount,
      errorRate: (this.errorCount / this.queryCount) * 100,
      avgQueryTime: this.metrics.queries.reduce((sum, q) => sum + q.duration, 0) / this.metrics.queries.length,
      slowQueries: this.metrics.queries.filter(q => q.performance === 'slow').length,
      cacheStats: this.getCacheStats()
    };
  }
}

// Initialize global performance monitor
const performanceMonitor = new PerformanceMonitor();

// ADVANCED CACHING SYSTEM
class SmartCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.accessCount = new Map();
  }
  
  set(key, value, ttl = PERFORMANCE_CONFIG.caching.ttl) {
    const cacheKey = PERFORMANCE_CONFIG.caching.keyPrefix + key;
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= PERFORMANCE_CONFIG.caching.maxEntries) {
      this.evictOldest();
    }
    
    this.cache.set(cacheKey, value);
    this.timestamps.set(cacheKey, Date.now() + ttl);
    this.accessCount.set(cacheKey, 0);
    
    performanceMonitor.metrics.cacheStats.size = this.cache.size;
  }
  
  get(key) {
    const cacheKey = PERFORMANCE_CONFIG.caching.keyPrefix + key;
    
    // Check if key exists and is not expired
    if (!this.cache.has(cacheKey)) {
      performanceMonitor.metrics.cacheStats.misses++;
      return null;
    }
    
    const expiry = this.timestamps.get(cacheKey);
    if (Date.now() > expiry) {
      this.delete(cacheKey);
      performanceMonitor.metrics.cacheStats.misses++;
      return null;
    }
    
    // Update access count and return value
    this.accessCount.set(cacheKey, this.accessCount.get(cacheKey) + 1);
    performanceMonitor.metrics.cacheStats.hits++;
    
    return this.cache.get(cacheKey);
  }
  
  delete(key) {
    const cacheKey = PERFORMANCE_CONFIG.caching.keyPrefix + key;
    this.cache.delete(cacheKey);
    this.timestamps.delete(cacheKey);
    this.accessCount.delete(cacheKey);
    
    performanceMonitor.metrics.cacheStats.size = this.cache.size;
  }
  
  evictOldest() {
    // Find the least recently used entry
    let oldestKey = null;
    let lowestCount = Infinity;
    
    for (const [key, count] of this.accessCount.entries()) {
      if (count < lowestCount) {
        lowestCount = count;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey.replace(PERFORMANCE_CONFIG.caching.keyPrefix, ''));
    }
  }
  
  clear() {
    this.cache.clear();
    this.timestamps.clear();
    this.accessCount.clear();
    performanceMonitor.metrics.cacheStats.size = 0;
  }
}

// Initialize global cache
const smartCache = new SmartCache();

// BATCH OPERATIONS SYSTEM
class BatchProcessor {
  constructor() {
    this.batchQueue = [];
    this.processing = false;
  }
  
  async batchSheetsOperations(operations) {
    const startTime = Date.now();
    const batches = this.createBatches(operations, PERFORMANCE_CONFIG.batchSizes.sheetsAPI);
    const results = [];
    
    try {
      for (const batch of batches) {
        const batchResult = await this.processSheetsData(batch);
        results.push(...batchResult);
        
        // Rate limiting
        await this.delay(100);
      }
      
      const duration = Date.now() - startTime;
      performanceMonitor.trackQuery('batchSheetsOperations', duration, operations.length);
      
      return results;
      
    } catch (error) {
      performanceMonitor.trackError(error, 'batchSheetsOperations');
      throw error;
    }
  }
  
  async batchDriveOperations(operations) {
    const startTime = Date.now();
    const batches = this.createBatches(operations, PERFORMANCE_CONFIG.batchSizes.driveAPI);
    const results = [];
    
    try {
      for (const batch of batches) {
        const batchResult = await this.processDriveOperations(batch);
        results.push(...batchResult);
        
        // Rate limiting
        await this.delay(200);
      }
      
      const duration = Date.now() - startTime;
      performanceMonitor.trackQuery('batchDriveOperations', duration, operations.length);
      
      return results;
      
    } catch (error) {
      performanceMonitor.trackError(error, 'batchDriveOperations');
      throw error;
    }
  }
  
  createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
  
  async processSheetsData(batch) {
    // Implementation for sheets batch processing
    const results = [];
    
    for (const operation of batch) {
      try {
        let result;
        
        switch (operation.type) {
          case 'read':
            result = await this.readSheetsData(operation);
            break;
          case 'write':
            result = await this.writeSheetsData(operation);
            break;
          case 'update':
            result = await this.updateSheetsData(operation);
            break;
          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }
        
        results.push({ success: true, data: result });
        
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    
    return results;
  }
  
  async processDriveOperations(batch) {
    // Implementation for drive batch processing
    const results = [];
    
    for (const operation of batch) {
      try {
        let result;
        
        switch (operation.type) {
          case 'createFolder':
            result = await this.createDriveFolder(operation);
            break;
          case 'moveFile':
            result = await this.moveDriveFile(operation);
            break;
          case 'setPermissions':
            result = await this.setDrivePermissions(operation);
            break;
          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }
        
        results.push({ success: true, data: result });
        
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    
    return results;
  }
  
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Helper methods for specific operations
  async readSheetsData(operation) {
    const cacheKey = `sheets_read_${operation.sheetId}_${operation.range}`;
    const cached = smartCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const sheet = SpreadsheetApp.openById(operation.sheetId);
    const range = sheet.getRange(operation.range);
    const data = range.getValues();
    
    smartCache.set(cacheKey, data);
    return data;
  }
  
  async writeSheetsData(operation) {
    const sheet = SpreadsheetApp.openById(operation.sheetId);
    const range = sheet.getRange(operation.range);
    range.setValues(operation.values);
    
    // Invalidate cache for this sheet
    this.invalidateSheetCache(operation.sheetId);
    
    return { rowsUpdated: operation.values.length };
  }
  
  async updateSheetsData(operation) {
    const sheet = SpreadsheetApp.openById(operation.sheetId);
    
    if (operation.formulas) {
      const range = sheet.getRange(operation.range);
      range.setFormulas(operation.formulas);
    }
    
    if (operation.values) {
      const range = sheet.getRange(operation.range);
      range.setValues(operation.values);
    }
    
    this.invalidateSheetCache(operation.sheetId);
    return { success: true };
  }
  
  invalidateSheetCache(sheetId) {
    // Remove all cached entries for this sheet
    for (const [key, value] of smartCache.cache.entries()) {
      if (key.includes(sheetId)) {
        smartCache.delete(key.replace(PERFORMANCE_CONFIG.caching.keyPrefix, ''));
      }
    }
  }
}

// Initialize global batch processor
const batchProcessor = new BatchProcessor();

// OPTIMIZED SHEET OPERATIONS
class OptimizedSheetOperations {
  constructor(sheetId) {
    this.sheetId = sheetId;
    this.sheet = SpreadsheetApp.openById(sheetId);
  }
  
  // Optimized bulk insert with automatic batching
  async bulkInsert(sheetName, data) {
    const startTime = Date.now();
    const sheet = this.sheet.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet ${sheetName} not found`);
    }
    
    try {
      // Use batch insert for better performance
      const batches = this.createDataBatches(data, PERFORMANCE_CONFIG.batchSizes.formulaUpdate);
      let totalInserted = 0;
      
      for (const batch of batches) {
        const lastRow = sheet.getLastRow();
        const range = sheet.getRange(lastRow + 1, 1, batch.length, batch[0].length);
        range.setValues(batch);
        totalInserted += batch.length;
        
        // Flush changes periodically
        SpreadsheetApp.flush();
        await batchProcessor.delay(50);
      }
      
      const duration = Date.now() - startTime;
      performanceMonitor.trackQuery('bulkInsert', duration, totalInserted);
      
      return { inserted: totalInserted, duration: duration };
      
    } catch (error) {
      performanceMonitor.trackError(error, 'bulkInsert');
      throw error;
    }
  }
  
  // Optimized search with indexing
  async optimizedSearch(sheetName, searchCriteria) {
    const startTime = Date.now();
    const cacheKey = `search_${sheetName}_${JSON.stringify(searchCriteria)}`;
    
    // Check cache first
    const cached = smartCache.get(cacheKey);
    if (cached) {
      performanceMonitor.trackQuery('optimizedSearch_cached', Date.now() - startTime);
      return cached;
    }
    
    try {
      const sheet = this.sheet.getSheetByName(sheetName);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      // Build index if not exists
      const indexKey = `index_${sheetName}`;
      let index = smartCache.get(indexKey);
      
      if (!index) {
        index = this.buildSearchIndex(data, headers);
        smartCache.set(indexKey, index, 600000); // Cache for 10 minutes
      }
      
      // Perform indexed search
      const results = this.searchWithIndex(index, searchCriteria);
      
      smartCache.set(cacheKey, results, 300000); // Cache for 5 minutes
      
      const duration = Date.now() - startTime;
      performanceMonitor.trackQuery('optimizedSearch', duration, results.length);
      
      return results;
      
    } catch (error) {
      performanceMonitor.trackError(error, 'optimizedSearch');
      throw error;
    }
  }
  
  buildSearchIndex(data, headers) {
    const index = {};
    
    headers.forEach((header, colIndex) => {
      index[header] = new Map();
      
      for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
        const value = data[rowIndex][colIndex];
        if (value) {
          const valueStr = value.toString().toLowerCase();
          if (!index[header].has(valueStr)) {
            index[header].set(valueStr, []);
          }
          index[header].get(valueStr).push(rowIndex);
        }
      }
    });
    
    return index;
  }
  
  searchWithIndex(index, criteria) {
    const results = [];
    const matchingRows = new Set();
    
    Object.entries(criteria).forEach(([column, value]) => {
      if (index[column]) {
        const valueStr = value.toString().toLowerCase();
        const rows = index[column].get(valueStr) || [];
        
        if (matchingRows.size === 0) {
          rows.forEach(row => matchingRows.add(row));
        } else {
          // Intersection with existing matches
          const newMatches = new Set();
          rows.forEach(row => {
            if (matchingRows.has(row)) {
              newMatches.add(row);
            }
          });
          matchingRows.clear();
          newMatches.forEach(row => matchingRows.add(row));
        }
      }
    });
    
    return Array.from(matchingRows);
  }
  
  createDataBatches(data, batchSize) {
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }
    return batches;
  }
}

// PERFORMANCE OPTIMIZATION UTILITIES
function optimizeSheetFormulas(sheetId, sheetName) {
  const startTime = Date.now();
  
  try {
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    
    // Convert individual formulas to array formulas where possible
    const lastRow = sheet.getLastRow();
    
    // Optimize Total_Amount formula
    const totalRange = sheet.getRange(2, 9, lastRow - 1, 1); // Column I
    const arrayFormula = `=ARRAYFORMULA(IF(ROW(G2:G${lastRow})=1,"",IF(AND(G2:G${lastRow}<>"",H2:H${lastRow}<>""),G2:G${lastRow}*H2:H${lastRow},"")))`;
    sheet.getRange(2, 9).setFormula(arrayFormula);
    
    // Clear individual formulas that are now handled by array formula
    if (lastRow > 2) {
      sheet.getRange(3, 9, lastRow - 2, 1).clearContent();
    }
    
    const duration = Date.now() - startTime;
    performanceMonitor.trackQuery('optimizeSheetFormulas', duration);
    
    console.log(`Sheet formulas optimized in ${duration}ms`);
    
  } catch (error) {
    performanceMonitor.trackError(error, 'optimizeSheetFormulas');
    throw error;
  }
}

function setupPerformanceMonitoring(sheetId) {
  // Create monitoring dashboard
  const sheet = SpreadsheetApp.openById(sheetId);
  let monitorSheet = sheet.getSheetByName('Performance_Monitor');
  
  if (!monitorSheet) {
    monitorSheet = sheet.insertSheet('Performance_Monitor');
  }
  
  // Set up monitoring headers
  const headers = [
    'Timestamp', 'Operation', 'Duration_ms', 'Row_Count', 'Status', 'Cache_Hit_Rate', 'Memory_Usage'
  ];
  
  monitorSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  monitorSheet.getRange(1, 1, 1, headers.length).setBackground('#FF6D01').setFontColor('#FFFFFF').setFontWeight('bold');
  
  // Create automated monitoring trigger
  const trigger = ScriptApp.newTrigger('updatePerformanceMetrics')
    .timeBased()
    .everyMinutes(5)
    .create();
  
  console.log('Performance monitoring dashboard created');
}

function updatePerformanceMetrics() {
  try {
    const summary = performanceMonitor.getPerformanceSummary();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Performance_Monitor');
    
    if (sheet) {
      const newRow = [
        new Date(),
        'System Monitor',
        summary.avgQueryTime || 0,
        summary.totalQueries,
        summary.errorRate < 1 ? 'Good' : 'Warning',
        summary.cacheStats.hitRate || 0,
        getMemoryUsage()
      ];
      
      sheet.appendRow(newRow);
      
      // Keep only last 1000 entries
      if (sheet.getLastRow() > 1000) {
        sheet.deleteRows(2, 100);
      }
    }
    
  } catch (error) {
    console.error('Error updating performance metrics:', error);
  }
}

function getMemoryUsage() {
  // Approximate memory usage calculation
  const used = DriveApp.getStorageUsed();
  const limit = DriveApp.getStorageLimit();
  return (used / limit) * 100;
}

// AUTOMATED OPTIMIZATION FUNCTIONS
function runAutomatedOptimization() {
  console.log('Starting automated optimization...');
  
  try {
    // Clear expired cache entries
    clearExpiredCache();
    
    // Optimize sheet formulas
    const sheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    optimizeSheetFormulas(sheetId, 'Order_Management');
    
    // Rebuild search indexes
    rebuildSearchIndexes();
    
    // Clean up old performance logs
    cleanupPerformanceLogs();
    
    console.log('Automated optimization completed successfully');
    
  } catch (error) {
    console.error('Error during automated optimization:', error);
  }
}

function clearExpiredCache() {
  const now = Date.now();
  const keysToDelete = [];
  
  for (const [key, timestamp] of smartCache.timestamps.entries()) {
    if (now > timestamp) {
      keysToDelete.push(key.replace(PERFORMANCE_CONFIG.caching.keyPrefix, ''));
    }
  }
  
  keysToDelete.forEach(key => smartCache.delete(key));
  
  console.log(`Cleared ${keysToDelete.length} expired cache entries`);
}

function rebuildSearchIndexes() {
  const sheets = ['Order_Management', 'Clients_DB', 'Products_Catalog'];
  
  sheets.forEach(sheetName => {
    smartCache.delete(`index_${sheetName}`);
    console.log(`Cleared search index for ${sheetName}`);
  });
}

function cleanupPerformanceLogs() {
  // Keep only recent performance metrics
  performanceMonitor.metrics.queries = performanceMonitor.metrics.queries.slice(-500);
  performanceMonitor.metrics.apiCalls = performanceMonitor.metrics.apiCalls.slice(-500);
  performanceMonitor.metrics.errors = performanceMonitor.metrics.errors.slice(-100);
  
  console.log('Performance logs cleaned up');
}

// INSTALLATION AND SETUP
function installPerformanceOptimization() {
  console.log('Installing performance optimization system...');
  
  try {
    // Set up monitoring
    const sheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    setupPerformanceMonitoring(sheetId);
    
    // Optimize existing formulas
    optimizeSheetFormulas(sheetId, 'Order_Management');
    
    // Create automated optimization trigger
    ScriptApp.newTrigger('runAutomatedOptimization')
      .timeBased()
      .everyHours(6)
      .create();
    
    // Initialize cache warming
    warmupCache();
    
    console.log('Performance optimization system installed successfully!');
    console.log('Monitoring dashboard: Performance_Monitor sheet');
    console.log('Automated optimization scheduled every 6 hours');
    
    return {
      success: true,
      cacheSize: smartCache.cache.size,
      monitoringEnabled: true,
      optimizationScheduled: true
    };
    
  } catch (error) {
    console.error('Error installing performance optimization:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function warmupCache() {
  // Pre-load commonly accessed data
  const commonQueries = [
    { sheetName: 'Order_Management', range: 'A:Q' },
    { sheetName: 'Clients_DB', range: 'A:P' },
    { sheetName: 'Products_Catalog', range: 'A:P' }
  ];
  
  const sheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  const optimizer = new OptimizedSheetOperations(sheetId);
  
  commonQueries.forEach(query => {
    try {
      const cacheKey = `sheets_read_${sheetId}_${query.range}`;
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(query.sheetName);
      if (sheet) {
        const data = sheet.getRange(query.range).getValues();
        smartCache.set(cacheKey, data);
      }
    } catch (error) {
      console.error(`Error warming cache for ${query.sheetName}:`, error);
    }
  });
  
  console.log('Cache warmed with common queries');
}

// Export main classes and functions
const PerformanceSystem = {
  monitor: performanceMonitor,
  cache: smartCache,
  batchProcessor: batchProcessor,
  OptimizedSheetOperations: OptimizedSheetOperations,
  install: installPerformanceOptimization,
  optimize: runAutomatedOptimization
};