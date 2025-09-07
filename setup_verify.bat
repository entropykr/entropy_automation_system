@echo off
REM Environment Variables Verification for Entropy Automation System
REM API Integration Specialist

echo ================================================
echo Environment Variables Verification
echo API Integration Specialist
echo ================================================

echo.
echo Checking Google API Configuration...
echo Google Project ID: %N8N_GOOGLE_PROJECT_ID%
echo Google Client ID: %N8N_GOOGLE_CLIENT_ID%
echo Google Client Secret: %N8N_GOOGLE_CLIENT_SECRET%
echo Service Account Key: %N8N_GOOGLE_SERVICE_ACCOUNT_KEY%
echo Service Account Email: %N8N_GOOGLE_SERVICE_ACCOUNT_EMAIL%

echo.
echo Checking AI API Configuration...
echo Gemini API Key: %N8N_GEMINI_API_KEY%
echo Gemini Model: %N8N_GEMINI_MODEL%
echo Claude API Key: %N8N_CLAUDE_API_KEY%
echo Claude Model: %N8N_CLAUDE_MODEL%

echo.
echo Checking External API Configuration...
echo Canva API Key: %N8N_CANVA_API_KEY%
echo WeChat App ID: %N8N_WECHAT_APP_ID%
echo WeChat App Secret: %N8N_WECHAT_APP_SECRET%

echo.
echo Checking n8n Configuration...
echo Webhook URL: %N8N_WEBHOOK_URL%
echo Encryption Key: %N8N_ENCRYPTION_KEY%
echo Basic Auth Active: %N8N_BASIC_AUTH_ACTIVE%
echo Database Type: %N8N_DB_TYPE%

echo.
echo Checking Logging Configuration...
echo Log Level: %N8N_LOG_LEVEL%
echo Log Output: %N8N_LOG_OUTPUT%
echo Log File Location: %N8N_LOG_FILE_LOCATION%

echo.
echo ================================================
echo Verification Complete
echo ================================================

echo.
echo Status Check:
if "%N8N_GOOGLE_PROJECT_ID%"=="entropy-automation-system" (
    echo [✓] Google Project ID configured
) else (
    echo [✗] Google Project ID not configured
)

if not "%N8N_GEMINI_API_KEY%"=="your-gemini-api-key-here" (
    echo [✓] Gemini API Key appears configured
) else (
    echo [⚠] Gemini API Key needs to be updated
)

if not "%N8N_CLAUDE_API_KEY%"=="your-claude-api-key-here" (
    echo [✓] Claude API Key appears configured  
) else (
    echo [⚠] Claude API Key needs to be updated
)

if not "%N8N_CANVA_API_KEY%"=="your-canva-api-key-here" (
    echo [✓] Canva API Key appears configured
) else (
    echo [⚠] Canva API Key needs to be updated
)

if not "%N8N_WECHAT_APP_ID%"=="your-wechat-app-id-here" (
    echo [✓] WeChat App ID appears configured
) else (
    echo [⚠] WeChat App ID needs to be updated
)

echo.
pause