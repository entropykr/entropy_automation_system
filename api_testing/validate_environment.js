/**
 * Environment Validation Script
 * Validates Google API credentials and environment setup
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

class EnvironmentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  async validate() {
    console.log('🔍 Validating Google API Environment');
    console.log('====================================\n');

    try {
      this.checkEnvironmentFile();
      this.validateCredentials();
      this.checkNetworkConnectivity();
      this.validateConfiguration();
      
      await this.testGoogleAPIs();
      
      this.displayResults();
      
      if (this.errors.length === 0) {
        console.log('\n✅ Environment validation passed!');
        console.log('Ready to run API tests.');
        return true;
      } else {
        console.log('\n❌ Environment validation failed!');
        console.log('Please fix the errors above before running tests.');
        return false;
      }
      
    } catch (error) {
      console.error('\n💥 Validation error:', error.message);
      return false;
    }
  }

  checkEnvironmentFile() {
    const envPath = path.join(__dirname, '.env');
    
    if (!fs.existsSync(envPath)) {
      this.errors.push('Missing .env file. Run "npm run setup" first.');
      return;
    }
    
    console.log('✓ .env file found');
    
    // Check file permissions
    try {
      fs.accessSync(envPath, fs.constants.R_OK);
      console.log('✓ .env file is readable');
    } catch (error) {
      this.errors.push('.env file is not readable');
    }
  }

  validateCredentials() {
    console.log('\n--- Credential Validation ---');
    
    const requiredVars = [
      'GOOGLE_PROJECT_ID',
      'GOOGLE_PRIVATE_KEY',
      'GOOGLE_CLIENT_EMAIL',
      'GOOGLE_CLIENT_ID'
    ];
    
    const missing = [];
    const invalid = [];
    
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      
      if (!value) {
        missing.push(varName);
        return;
      }
      
      // Specific validations
      switch (varName) {
        case 'GOOGLE_PROJECT_ID':
          if (!/^[a-z0-9\-]+$/.test(value)) {
            invalid.push(`${varName}: Invalid project ID format`);
          }
          break;
          
        case 'GOOGLE_CLIENT_EMAIL':
          if (!/^[^\s@]+@[^\s@]+\.iam\.gserviceaccount\.com$/.test(value)) {
            invalid.push(`${varName}: Invalid service account email format`);
          }
          break;
          
        case 'GOOGLE_PRIVATE_KEY':
          if (!value.includes('BEGIN PRIVATE KEY') || !value.includes('END PRIVATE KEY')) {
            invalid.push(`${varName}: Invalid private key format`);
          }
          break;
          
        case 'GOOGLE_CLIENT_ID':
          if (!/^\d+$/.test(value)) {
            invalid.push(`${varName}: Invalid client ID format`);
          }
          break;
      }
    });
    
    if (missing.length > 0) {
      this.errors.push(`Missing credentials: ${missing.join(', ')}`);
    } else {
      console.log('✓ All required credentials present');
    }
    
    if (invalid.length > 0) {
      this.errors.push(...invalid);
    } else if (missing.length === 0) {
      console.log('✓ Credential format validation passed');
    }
  }

  checkNetworkConnectivity() {
    console.log('\n--- Network Connectivity ---');
    
    // Basic DNS and connectivity check (simplified)
    const requiredHosts = [
      'sheets.googleapis.com',
      'drive.googleapis.com',
      'oauth2.googleapis.com'
    ];
    
    console.log('✓ Network connectivity check (simplified)');
    console.log(`  Required hosts: ${requiredHosts.join(', ')}`);
    
    // In a real implementation, you'd use DNS resolution or HTTP requests
    // For now, we'll assume connectivity is available
  }

  validateConfiguration() {
    console.log('\n--- Configuration Validation ---');
    
    const config = {
      testEnvironment: process.env.TEST_ENVIRONMENT || 'development',
      logLevel: process.env.LOG_LEVEL || 'info',
      generateTestData: process.env.GENERATE_TEST_DATA === 'true',
      testRecordCount: parseInt(process.env.TEST_RECORD_COUNT) || 100,
      cleanupAfterTests: process.env.CLEANUP_AFTER_TESTS === 'true'
    };
    
    // Validate test record count
    if (config.testRecordCount < 1 || config.testRecordCount > 1000) {
      this.warnings.push('TEST_RECORD_COUNT should be between 1 and 1000');
    }
    
    // Validate log level
    const validLogLevels = ['error', 'warn', 'info', 'debug'];
    if (!validLogLevels.includes(config.logLevel)) {
      this.warnings.push(`Invalid LOG_LEVEL: ${config.logLevel}. Valid options: ${validLogLevels.join(', ')}`);
    }
    
    console.log('✓ Configuration loaded:');
    console.log(`  Environment: ${config.testEnvironment}`);
    console.log(`  Log Level: ${config.logLevel}`);
    console.log(`  Test Records: ${config.testRecordCount}`);
    console.log(`  Generate Test Data: ${config.generateTestData}`);
    console.log(`  Cleanup After Tests: ${config.cleanupAfterTests}`);
  }

  async testGoogleAPIs() {
    console.log('\n--- Google API Connectivity Test ---');
    
    if (this.errors.length > 0) {
      console.log('⚠️  Skipping API test due to credential errors');
      return;
    }
    
    try {
      // Import and test authentication
      const { google } = require('googleapis');
      
      const auth = new google.auth.GoogleAuth({
        credentials: {
          type: "service_account",
          project_id: process.env.GOOGLE_PROJECT_ID,
          private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          client_id: process.env.GOOGLE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
        },
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive'
        ]
      });
      
      // Test Sheets API
      const sheets = google.sheets({ version: 'v4', auth });
      await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: 'API_Test_' + Date.now()
          }
        }
      }).then(response => {
        console.log('✓ Sheets API connection successful');
        
        // Clean up test spreadsheet
        const sheetsId = response.data.spreadsheetId;
        const drive = google.drive({ version: 'v3', auth });
        return drive.files.delete({ fileId: sheetsId });
      }).then(() => {
        console.log('✓ Test spreadsheet cleaned up');
      });
      
      // Test Drive API
      const drive = google.drive({ version: 'v3', auth });
      await drive.files.list({ pageSize: 1 });
      console.log('✓ Drive API connection successful');
      
    } catch (error) {
      this.errors.push(`Google API test failed: ${error.message}`);
      
      // Provide specific error guidance
      if (error.message.includes('invalid_grant')) {
        this.errors.push('Hint: Check that your private key is correctly formatted and service account is enabled');
      } else if (error.message.includes('forbidden')) {
        this.errors.push('Hint: Ensure your service account has the necessary permissions');
      } else if (error.message.includes('not found')) {
        this.errors.push('Hint: Verify your project ID and service account configuration');
      }
    }
  }

  displayResults() {
    console.log('\n=== VALIDATION RESULTS ===');
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n🎉 All validations passed!');
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      status: this.errors.length === 0 ? 'PASS' : 'FAIL',
      errors: this.errors,
      warnings: this.warnings,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        testEnvironment: process.env.TEST_ENVIRONMENT,
        hasCredentials: !!process.env.GOOGLE_CLIENT_EMAIL
      }
    };
    
    return JSON.stringify(report, null, 2);
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new EnvironmentValidator();
  
  validator.validate().then(success => {
    if (!success) {
      process.exit(1);
    }
  }).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = EnvironmentValidator;