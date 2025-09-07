@echo off
REM Environment Variables Setup for Entropy Automation System
REM API Integration Specialist Configuration

echo ================================================
echo Entropy Automation System - Environment Setup
echo API Integration Specialist
echo ================================================

echo.
echo Setting up Google API environment variables...

REM Google Workspace Configuration
setx N8N_GOOGLE_PROJECT_ID "entropy-automation-system"
setx N8N_GOOGLE_CLIENT_ID "YOUR_GOOGLE_CLIENT_ID_HERE"
setx N8N_GOOGLE_CLIENT_SECRET "YOUR_GOOGLE_CLIENT_SECRET_HERE"

REM Service Account Configuration (update path as needed)
setx N8N_GOOGLE_SERVICE_ACCOUNT_KEY "%cd%\service-account-key.json"
setx N8N_GOOGLE_SERVICE_ACCOUNT_EMAIL "entropy-automation@entropy-automation-system.iam.gserviceaccount.com"

echo Google API credentials configured.

echo.
echo Setting up AI API environment variables...

REM Gemini API Configuration
setx N8N_GEMINI_API_KEY "your-gemini-api-key-here"
setx N8N_GEMINI_MODEL "gemini-pro"
setx N8N_GEMINI_TEMPERATURE "0.7"

REM Claude API Configuration  
setx N8N_CLAUDE_API_KEY "your-claude-api-key-here"
setx N8N_CLAUDE_MODEL "claude-3-opus-20240229"
setx N8N_CLAUDE_MAX_TOKENS "4096"

echo AI API credentials configured.

echo.
echo Setting up External API environment variables...

REM Canva API Configuration
setx N8N_CANVA_API_KEY "your-canva-api-key-here"
setx N8N_CANVA_BRAND_ID "your-canva-brand-id-here"

REM WeChat API Configuration
setx N8N_WECHAT_APP_ID "your-wechat-app-id-here"
setx N8N_WECHAT_APP_SECRET "your-wechat-app-secret-here"
setx N8N_WECHAT_TOKEN "your-wechat-token-here"

echo External API credentials configured.

echo.
echo Setting up n8n configuration...

REM n8n Configuration
setx N8N_WEBHOOK_URL "https://your-domain.com/webhook"
setx N8N_ENCRYPTION_KEY "your-32-char-encryption-key-here"
setx N8N_BASIC_AUTH_ACTIVE "true"
setx N8N_BASIC_AUTH_USER "admin"
setx N8N_BASIC_AUTH_PASSWORD "secure-password-here"

REM Database Configuration
setx N8N_DB_TYPE "sqlite"
setx N8N_DB_SQLITE_DATABASE "%APPDATA%\n8n\database.sqlite"

echo n8n configuration completed.

echo.
echo Setting up monitoring and logging...

REM Monitoring Configuration
setx N8N_LOG_LEVEL "info"
setx N8N_LOG_OUTPUT "file,console"
setx N8N_LOG_FILE_LOCATION "%APPDATA%\n8n\logs\n8n.log"

REM Performance Configuration
setx N8N_EXECUTIONS_DATA_SAVE_ON_ERROR "all"
setx N8N_EXECUTIONS_DATA_SAVE_ON_SUCCESS "all"
setx N8N_EXECUTIONS_DATA_MAX_AGE "336"

echo Monitoring configuration completed.

echo.
echo ================================================
echo Environment Setup Complete!
echo ================================================

echo.
echo IMPORTANT: Please update the following with your actual values:
echo - N8N_GEMINI_API_KEY
echo - N8N_CLAUDE_API_KEY  
echo - N8N_CANVA_API_KEY
echo - N8N_WECHAT_APP_ID
echo - N8N_WECHAT_APP_SECRET
echo - N8N_WEBHOOK_URL
echo - N8N_ENCRYPTION_KEY
echo - N8N_BASIC_AUTH_PASSWORD

echo.
echo Next Steps:
echo 1. Restart your command prompt to load new environment variables
echo 2. Create Google Cloud service account and download key file
echo 3. Update N8N_GOOGLE_SERVICE_ACCOUNT_KEY path
echo 4. Install n8n: npm install -g n8n
echo 5. Start n8n: n8n start

echo.
echo For verification, run: setup_verify.bat

pause