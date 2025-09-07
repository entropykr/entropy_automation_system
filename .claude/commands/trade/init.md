---
description: Initialize the entropy automation system environment
---

# Trade Init Command

Initializes the complete B2B trade automation environment with n8n and Google Workspace.

## Actions Performed

### 1. n8n Installation
```bash
# Check Node.js version
node --version  # Requires v18.10 or higher

# Install n8n globally
npm install n8n -g

# Create n8n data directory
mkdir %USERPROFILE%\.n8n
mkdir %USERPROFILE%\.n8n\workflows
mkdir %USERPROFILE%\.n8n\credentials
```

### 2. Environment Configuration
```bash
# Set n8n environment variables
setx N8N_HOST "localhost"
setx N8N_PORT "5678"
setx N8N_PROTOCOL "http"
setx N8N_BASIC_AUTH_ACTIVE "true"
setx N8N_BASIC_AUTH_USER "admin"
setx N8N_BASIC_AUTH_PASSWORD "your-secure-password"
setx N8N_ENCRYPTION_KEY "your-32-character-encryption-key"
setx N8N_USER_FOLDER "%USERPROFILE%\.n8n"
setx NODE_ENV "production"
```

### 3. API Credentials Setup
```bash
# Google Workspace
setx GOOGLE_APPLICATION_CREDENTIALS "%USERPROFILE%\.n8n\google-service-account.json"
setx GOOGLE_SHEETS_ID "your-sheets-id"
setx GOOGLE_DRIVE_FOLDER_ID "your-drive-folder-id"

# AI APIs
setx GEMINI_API_KEY "your-gemini-api-key"
setx CLAUDE_API_KEY "your-claude-api-key"

# Design & Messaging
setx CANVA_API_KEY "your-canva-api-key"
setx WECHAT_APP_ID "your-wechat-app-id"
setx WECHAT_APP_SECRET "your-wechat-app-secret"
```

### 4. Windows Service Setup
```powershell
# Install NSSM (Non-Sucking Service Manager)
# Download from: https://nssm.cc/download

# Create n8n service
nssm install n8n-service "C:\Program Files\nodejs\node.exe"
nssm set n8n-service AppParameters "%APPDATA%\npm\node_modules\n8n\bin\n8n"
nssm set n8n-service AppDirectory "%USERPROFILE%\.n8n"
nssm set n8n-service Start SERVICE_AUTO_START
nssm set n8n-service DisplayName "n8n Automation Service"
nssm set n8n-service Description "B2B Trade Automation Workflow Engine"
```

### 5. Google Workspace Preparation
- Create service account in Google Cloud Console
- Enable required APIs:
  - Google Sheets API
  - Google Drive API
  - Gmail API
- Download service account JSON key
- Share Google Sheets/Drive with service account email

### 6. Initial Workflow Templates
Creates starter workflows:
- `01_System_Health_Check`
- `02_API_Connection_Test`
- `03_Data_Backup_Daily`
- `04_Error_Notification`

### 7. Monitoring Setup
- Configure Windows Event Log
- Set up error alerting
- Create performance counters
- Initialize backup schedule

## Usage

```
/trade:init [--skip-service] [--custom-port=5678]
```

## Parameters

- `--skip-service`: Don't create Windows service
- `--custom-port`: Use custom port (default: 5678)
- `--dev-mode`: Initialize in development mode

## Initialization Checklist

The command will verify:
- [ ] Node.js v18+ installed
- [ ] n8n successfully installed
- [ ] Environment variables set
- [ ] Google credentials valid
- [ ] API keys configured
- [ ] Windows service created
- [ ] n8n accessible at http://localhost:5678
- [ ] Initial workflows imported
- [ ] Backup directory created

## Output Example

```
🚀 ENTROPY AUTOMATION SYSTEM INITIALIZATION
============================================

✅ Node.js v20.11.0 detected
✅ n8n v1.25.0 installed globally
✅ Environment variables configured (12 total)
✅ Google service account validated
✅ API credentials stored securely
✅ Windows service 'n8n-service' created
✅ n8n server started on http://localhost:5678
✅ 4 initial workflows imported
✅ Backup schedule configured (daily at 2 AM)

📊 System Status:
-----------------
n8n Version: 1.25.0
Node Version: 20.11.0
Data Directory: C:\Users\pc\.n8n
Service Status: Running
Web Interface: http://localhost:5678
Credentials: admin / [configured]

🔗 API Connections:
-------------------
Google Workspace: ✅ Connected
Gemini AI: ✅ Connected
Claude AI: ✅ Connected
Canva: ✅ Connected
WeChat: ⚠️ Pending configuration

📋 Next Steps:
--------------
1. Access n8n at http://localhost:5678
2. Complete WeChat API configuration
3. Run /trade:sheets:create to set up database
4. Import workflow templates with /trade:week1

Initialization completed successfully!
Time elapsed: 45 seconds
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   netstat -ano | findstr :5678
   taskkill /PID [process-id] /F
   ```

2. **Service won't start**
   ```bash
   nssm status n8n-service
   nssm restart n8n-service
   ```

3. **Google auth fails**
   - Verify service account has correct permissions
   - Check if APIs are enabled in Google Cloud Console
   - Ensure service account key path is correct

## Recovery

If initialization fails:
```
/trade:init --reset  # Clean and retry
/trade:init --repair # Fix existing installation
```

## Success Criteria

- [ ] n8n web interface accessible
- [ ] All APIs show green status
- [ ] Test workflow executes successfully
- [ ] Windows service auto-starts
- [ ] Backup system operational