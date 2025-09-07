/**
 * API Test Runner and Report Generator
 * Comprehensive execution and reporting for Google API testing
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { APITestRunner } = require('./Google_API_Test_Suite.js');
const EnvironmentValidator = require('./validate_environment.js');

class TestExecutor {
  constructor(options = {}) {
    this.options = {
      generateReport: options.generateReport !== false,
      saveResults: options.saveResults !== false,
      verbose: options.verbose || false,
      outputDir: options.outputDir || path.join(__dirname, 'test_results'),
      ...options
    };
    
    this.results = null;
    this.startTime = null;
    this.endTime = null;
  }

  async execute() {
    console.log('🚀 Starting Comprehensive Google API Testing');
    console.log('=============================================\n');
    
    this.startTime = new Date();
    
    try {
      // Step 1: Environment validation
      await this.validateEnvironment();
      
      // Step 2: Initialize test runner
      const testRunner = new APITestRunner();
      
      // Step 3: Execute all tests
      console.log('📋 Executing API test suite...');
      this.results = await testRunner.runAllTests();
      
      this.endTime = new Date();
      
      // Step 4: Process results
      await this.processResults();
      
      // Step 5: Generate reports
      if (this.options.generateReport) {
        await this.generateReports();
      }
      
      // Step 6: Display summary
      this.displaySummary();
      
      return this.results.overallSuccess;
      
    } catch (error) {
      console.error('💥 Test execution failed:', error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      return false;
    }
  }

  async validateEnvironment() {
    console.log('🔍 Validating environment...');
    
    const validator = new EnvironmentValidator();
    const isValid = await validator.validate();
    
    if (!isValid) {
      throw new Error('Environment validation failed. Please fix configuration issues.');
    }
    
    console.log('✅ Environment validation passed\n');
  }

  async processResults() {
    if (!this.results) {
      throw new Error('No test results available');
    }
    
    // Add execution metadata
    this.results.execution = {
      startTime: this.startTime.toISOString(),
      endTime: this.endTime.toISOString(),
      totalExecutionTime: this.endTime.getTime() - this.startTime.getTime(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        testEnvironment: process.env.TEST_ENVIRONMENT || 'development'
      }
    };
    
    // Calculate success rates
    this.results.analysis = this.analyzeResults();
    
    // Add recommendations
    this.results.recommendations = this.generateRecommendations();
  }

  analyzeResults() {
    const analysis = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      averageResponseTime: 0,
      performanceRating: 'Unknown'
    };
    
    // Analyze Sheets tests
    const sheetsTests = Object.entries(this.results.sheets || {});
    sheetsTests.forEach(([testName, result]) => {
      analysis.totalTests++;
      if (result.success) {
        analysis.passedTests++;
      } else {
        analysis.failedTests++;
      }
    });
    
    // Analyze Drive tests
    const driveTests = Object.entries(this.results.drive || {});
    driveTests.forEach(([testName, result]) => {
      analysis.totalTests++;
      if (result.success) {
        analysis.passedTests++;
      } else {
        analysis.failedTests++;
      }
    });
    
    // Calculate success rate
    analysis.successRate = analysis.totalTests > 0 ? 
      (analysis.passedTests / analysis.totalTests * 100).toFixed(2) : 0;
    
    // Performance analysis
    if (this.results.performance) {
      analysis.averageResponseTime = this.results.performance.averageOperationTime || 0;
      
      if (analysis.averageResponseTime < 1000) {
        analysis.performanceRating = 'Excellent';
      } else if (analysis.averageResponseTime < 2000) {
        analysis.performanceRating = 'Good';
      } else if (analysis.averageResponseTime < 5000) {
        analysis.performanceRating = 'Acceptable';
      } else {
        analysis.performanceRating = 'Poor';
      }
    }
    
    return analysis;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (!this.results.overallSuccess) {
      recommendations.push({
        type: 'critical',
        title: 'Test Failures Detected',
        message: 'Some tests failed. Review error messages and fix underlying issues.',
        action: 'Check failed test details and resolve configuration or permission issues.'
      });
    }
    
    if (this.results.analysis.averageResponseTime > 2000) {
      recommendations.push({
        type: 'performance',
        title: 'Slow API Response Times',
        message: `Average response time is ${this.results.analysis.averageResponseTime}ms`,
        action: 'Consider implementing caching, batch operations, or reviewing network connectivity.'
      });
    }
    
    if (this.results.sheets?.batchOperations?.throughput < 10) {
      recommendations.push({
        type: 'optimization',
        title: 'Low Batch Processing Throughput',
        message: 'Batch operations are processing fewer than 10 operations per second.',
        action: 'Optimize batch sizes and implement parallel processing where possible.'
      });
    }
    
    if (this.results.analysis.successRate < 100) {
      recommendations.push({
        type: 'reliability',
        title: 'Test Success Rate Below 100%',
        message: `Current success rate: ${this.results.analysis.successRate}%`,
        action: 'Implement retry logic and improve error handling for failed operations.'
      });
    }
    
    return recommendations;
  }

  async generateReports() {
    console.log('\n📊 Generating test reports...');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Generate JSON report
    await this.generateJSONReport(timestamp);
    
    // Generate HTML report
    await this.generateHTMLReport(timestamp);
    
    // Generate CSV summary
    await this.generateCSVReport(timestamp);
    
    console.log(`✅ Reports generated in: ${this.options.outputDir}`);
  }

  async generateJSONReport(timestamp) {
    const reportPath = path.join(this.options.outputDir, `test_results_${timestamp}.json`);
    
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        testSuiteVersion: '1.0.0',
        environment: this.results.execution.environment
      },
      summary: {
        overallSuccess: this.results.overallSuccess,
        totalDuration: this.results.overallDuration,
        analysis: this.results.analysis,
        recommendations: this.results.recommendations
      },
      detailed: this.results
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`  📄 JSON report: ${reportPath}`);
  }

  async generateHTMLReport(timestamp) {
    const reportPath = path.join(this.options.outputDir, `test_report_${timestamp}.html`);
    
    const html = this.createHTMLReport();
    fs.writeFileSync(reportPath, html);
    console.log(`  🌐 HTML report: ${reportPath}`);
  }

  createHTMLReport() {
    const results = this.results;
    const analysis = results.analysis;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google API Test Results</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
        }
        .metric-card.success { border-left-color: #28a745; }
        .metric-card.warning { border-left-color: #ffc107; }
        .metric-card.error { border-left-color: #dc3545; }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .metric-label {
            color: #6c757d;
            font-size: 0.9em;
        }
        .test-section {
            margin: 30px 0;
        }
        .test-section h2 {
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        .test-result {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #28a745;
        }
        .test-result.failed {
            border-left-color: #dc3545;
            background: #fff5f5;
        }
        .test-name {
            font-weight: 500;
        }
        .test-duration {
            color: #6c757d;
            font-size: 0.9em;
        }
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 500;
        }
        .status-badge.success {
            background: #d4edda;
            color: #155724;
        }
        .status-badge.failed {
            background: #f8d7da;
            color: #721c24;
        }
        .recommendations {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .recommendations h3 {
            color: #0066cc;
            margin-top: 0;
        }
        .recommendation {
            margin: 15px 0;
            padding: 15px;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #0066cc;
        }
        .recommendation.critical { border-left-color: #dc3545; }
        .recommendation.performance { border-left-color: #ffc107; }
        .recommendation.optimization { border-left-color: #17a2b8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔬 Google API Test Results</h1>
            <p>Comprehensive testing report for Entropy Automation System</p>
            <p>${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div class="content">
            <div class="summary-grid">
                <div class="metric-card ${results.overallSuccess ? 'success' : 'error'}">
                    <div class="metric-value">${results.overallSuccess ? '✅' : '❌'}</div>
                    <div class="metric-label">Overall Status</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${analysis.successRate}%</div>
                    <div class="metric-label">Success Rate</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${analysis.totalTests}</div>
                    <div class="metric-label">Total Tests</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${Math.round(results.overallDuration)}ms</div>
                    <div class="metric-label">Total Duration</div>
                </div>
                
                <div class="metric-card ${analysis.performanceRating === 'Excellent' ? 'success' : analysis.performanceRating === 'Good' ? 'success' : 'warning'}">
                    <div class="metric-value">${analysis.performanceRating}</div>
                    <div class="metric-label">Performance Rating</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${analysis.averageResponseTime}ms</div>
                    <div class="metric-label">Avg Response Time</div>
                </div>
            </div>

            <div class="test-section">
                <h2>📊 Google Sheets API Tests</h2>
                ${this.generateTestResultsHTML(results.sheets, 'sheets')}
            </div>

            <div class="test-section">
                <h2>📁 Google Drive API Tests</h2>
                ${this.generateTestResultsHTML(results.drive, 'drive')}
            </div>

            <div class="test-section">
                <h2>🔗 Integration Tests</h2>
                <div class="test-result ${results.integration?.success ? '' : 'failed'}">
                    <div>
                        <div class="test-name">Sheets-Drive Integration</div>
                        <div class="test-duration">${results.integration?.duration || 0}ms</div>
                    </div>
                    <span class="status-badge ${results.integration?.success ? 'success' : 'failed'}">
                        ${results.integration?.success ? 'PASSED' : 'FAILED'}
                    </span>
                </div>
            </div>

            ${this.generateRecommendationsHTML()}
        </div>
    </div>
</body>
</html>`;
  }

  generateTestResultsHTML(testResults, category) {
    if (!testResults) return '<p>No test results available</p>';
    
    return Object.entries(testResults)
      .map(([testName, result]) => `
        <div class="test-result ${result.success ? '' : 'failed'}">
            <div>
                <div class="test-name">${this.formatTestName(testName)}</div>
                <div class="test-duration">${result.duration || 0}ms</div>
            </div>
            <span class="status-badge ${result.success ? 'success' : 'failed'}">
                ${result.success ? 'PASSED' : 'FAILED'}
            </span>
        </div>
      `).join('');
  }

  generateRecommendationsHTML() {
    if (!this.results.recommendations || this.results.recommendations.length === 0) {
      return '';
    }
    
    const recommendationsHTML = this.results.recommendations
      .map(rec => `
        <div class="recommendation ${rec.type}">
            <h4>${rec.title}</h4>
            <p><strong>Issue:</strong> ${rec.message}</p>
            <p><strong>Action:</strong> ${rec.action}</p>
        </div>
      `).join('');
    
    return `
      <div class="recommendations">
        <h3>💡 Recommendations</h3>
        ${recommendationsHTML}
      </div>
    `;
  }

  formatTestName(testName) {
    return testName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  async generateCSVReport(timestamp) {
    const reportPath = path.join(this.options.outputDir, `test_summary_${timestamp}.csv`);
    
    const csvData = [
      ['Test Category', 'Test Name', 'Status', 'Duration (ms)', 'Details'],
      ...this.generateCSVRows('Sheets', this.results.sheets),
      ...this.generateCSVRows('Drive', this.results.drive),
      ['Integration', 'Sheets-Drive Integration', 
       this.results.integration?.success ? 'PASSED' : 'FAILED',
       this.results.integration?.duration || 0,
       this.results.integration?.message || '']
    ];
    
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    fs.writeFileSync(reportPath, csvContent);
    console.log(`  📈 CSV report: ${reportPath}`);
  }

  generateCSVRows(category, testResults) {
    if (!testResults) return [];
    
    return Object.entries(testResults).map(([testName, result]) => [
      category,
      this.formatTestName(testName),
      result.success ? 'PASSED' : 'FAILED',
      result.duration || 0,
      result.message || result.error || ''
    ]);
  }

  displaySummary() {
    console.log('\n📋 TEST EXECUTION SUMMARY');
    console.log('========================');
    
    const analysis = this.results.analysis;
    
    console.log(`Overall Status: ${this.results.overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Success Rate: ${analysis.successRate}%`);
    console.log(`Total Tests: ${analysis.totalTests} (${analysis.passedTests} passed, ${analysis.failedTests} failed)`);
    console.log(`Execution Time: ${Math.round(this.results.overallDuration)}ms`);
    console.log(`Performance Rating: ${analysis.performanceRating}`);
    
    if (this.results.recommendations.length > 0) {
      console.log(`\n💡 ${this.results.recommendations.length} recommendations available in detailed report`);
    }
    
    console.log(`\nTest Artifacts:`);
    if (this.results.sheets?.schemaCreation?.spreadsheetId) {
      console.log(`📊 Test Spreadsheet: https://docs.google.com/spreadsheets/d/${this.results.sheets.schemaCreation.spreadsheetId}/edit`);
    }
    
    if (this.options.generateReport) {
      console.log(`📁 Reports Directory: ${this.options.outputDir}`);
    }
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    generateReport: !args.includes('--no-report'),
    saveResults: !args.includes('--no-save')
  };
  
  const executor = new TestExecutor(options);
  
  executor.execute()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Execution failed:', error.message);
      process.exit(1);
    });
}

module.exports = TestExecutor;