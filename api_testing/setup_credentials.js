/**
 * Google API Credentials Setup Script
 * Guides users through credential configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class CredentialsSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.credentials = {};
  }

  async setup() {
    console.log('🔧 Google API Credentials Setup');
    console.log('================================\n');
    
    try {
      await this.checkExistingCredentials();
      await this.chooseSetupMethod();
      await this.validateCredentials();
      await this.saveCredentials();
      
      console.log('\n✅ Credentials setup completed successfully!');
      console.log('Run "npm test" to start API testing.');
      
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  async checkExistingCredentials() {
    const envPath = path.join(__dirname, '.env');
    
    if (fs.existsSync(envPath)) {
      const overwrite = await this.question('⚠️  Existing .env file found. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        process.exit(0);
      }
    }
  }

  async chooseSetupMethod() {
    console.log('Choose setup method:');
    console.log('1. Manual credential entry');
    console.log('2. Service account JSON file path');
    console.log('3. Environment variables (already set)');
    
    const choice = await this.question('\nEnter choice (1-3): ');
    
    switch (choice) {
      case '1':
        await this.manualSetup();
        break;
      case '2':
        await this.filePathSetup();
        break;
      case '3':
        await this.environmentSetup();
        break;
      default:
        throw new Error('Invalid choice');
    }
  }

  async manualSetup() {
    console.log('\n📝 Manual Credential Entry');
    console.log('Please enter your Google Service Account credentials:\n');
    
    this.credentials.GOOGLE_PROJECT_ID = await this.question('Project ID: ');
    this.credentials.GOOGLE_PRIVATE_KEY_ID = await this.question('Private Key ID: ');
    this.credentials.GOOGLE_CLIENT_EMAIL = await this.question('Client Email: ');
    this.credentials.GOOGLE_CLIENT_ID = await this.question('Client ID: ');
    
    console.log('\nPlease paste your private key (including BEGIN/END lines):');
    this.credentials.GOOGLE_PRIVATE_KEY = await this.question('Private Key: ');
    
    // Validate key format
    if (!this.credentials.GOOGLE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
      throw new Error('Invalid private key format. Must include BEGIN PRIVATE KEY header.');
    }
  }

  async filePathSetup() {
    console.log('\n📁 Service Account JSON File Setup');
    
    const filePath = await this.question('Enter path to service account JSON file: ');
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      this.credentials.GOOGLE_PROJECT_ID = serviceAccount.project_id;
      this.credentials.GOOGLE_PRIVATE_KEY_ID = serviceAccount.private_key_id;
      this.credentials.GOOGLE_PRIVATE_KEY = serviceAccount.private_key;
      this.credentials.GOOGLE_CLIENT_EMAIL = serviceAccount.client_email;
      this.credentials.GOOGLE_CLIENT_ID = serviceAccount.client_id;
      
      console.log('✅ Service account file loaded successfully');
      
    } catch (error) {
      throw new Error(`Invalid service account file: ${error.message}`);
    }
  }

  async environmentSetup() {
    console.log('\n🔧 Environment Variables Setup');
    console.log('Checking existing environment variables...\n');
    
    const requiredVars = [
      'GOOGLE_PROJECT_ID',
      'GOOGLE_PRIVATE_KEY_ID', 
      'GOOGLE_PRIVATE_KEY',
      'GOOGLE_CLIENT_EMAIL',
      'GOOGLE_CLIENT_ID'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.log('❌ Missing environment variables:', missing.join(', '));
      console.log('Please set these variables in your system environment or choose a different setup method.');
      throw new Error('Missing required environment variables');
    }
    
    // Copy from environment
    requiredVars.forEach(varName => {
      this.credentials[varName] = process.env[varName];
    });
    
    console.log('✅ All required environment variables found');
  }

  async validateCredentials() {
    console.log('\n🔍 Validating credentials...');
    
    // Basic validation
    const required = ['GOOGLE_PROJECT_ID', 'GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY'];
    const missing = required.filter(key => !this.credentials[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required credentials: ${missing.join(', ')}`);
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.credentials.GOOGLE_CLIENT_EMAIL)) {
      throw new Error('Invalid client email format');
    }
    
    console.log('✅ Credential validation passed');
  }

  async saveCredentials() {
    const envPath = path.join(__dirname, '.env');
    const templatePath = path.join(__dirname, '.env.template');
    
    let envContent = '';
    
    if (fs.existsSync(templatePath)) {
      envContent = fs.readFileSync(templatePath, 'utf8');
    }
    
    // Replace template values with actual credentials
    Object.entries(this.credentials).forEach(([key, value]) => {
      const regex = new RegExp(`${key}=.*`, 'g');
      const replacement = `${key}="${value.replace(/\n/g, '\\n')}"`;
      
      if (envContent.includes(`${key}=`)) {
        envContent = envContent.replace(regex, replacement);
      } else {
        envContent += `\n${replacement}`;
      }
    });
    
    // Add default test configuration
    if (!envContent.includes('TEST_ENVIRONMENT=')) {
      envContent += '\n\n# Test Configuration\n';
      envContent += 'TEST_ENVIRONMENT=development\n';
      envContent += 'LOG_LEVEL=info\n';
      envContent += 'GENERATE_TEST_DATA=true\n';
      envContent += 'TEST_RECORD_COUNT=100\n';
      envContent += 'CLEANUP_AFTER_TESTS=false\n';
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Credentials saved to ${envPath}`);
  }

  question(query) {
    return new Promise(resolve => {
      this.rl.question(query, resolve);
    });
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new CredentialsSetup();
  setup.setup();
}

module.exports = CredentialsSetup;