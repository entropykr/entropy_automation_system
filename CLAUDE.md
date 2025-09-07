# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Entropy Automation System is a B2B trade automation platform built on n8n with Google Workspace integration. It implements an 8-week phased rollout for complete business process automation including marketing, order processing, production management, and logistics.

## Architecture

The system follows a modular architecture:
- **n8n Workflow Engine**: Core automation platform running as Windows service
- **Google Workspace**: Data layer using Sheets as database and Drive for file management
- **AI Integration**: Gemini and Claude APIs for document generation and analysis
- **External APIs**: Canva (design), WeChat (messaging), Gmail (email)
- **Command System**: Structured `/trade:*` commands for system management

## Development Setup

This project is in early development stage. No standard package manager or build tools are configured yet.

### Project Structure
- `src/` - Source code (currently empty directories)
- `docs/` - Documentation  
- `tests/` - Test files
- `.claude/` - Claude Code custom commands and agents

### Custom Commands

This project uses Claude Code's custom command system with `/pm:*` commands defined in `.claude/commands/pm.md`. Key command categories:

#### Project Management Commands
- `/pm:assign <agent> <task>` - 특정 에이전트에게 작업 할당
- `/pm:agents:status` - 모든 에이전트 작업 현황 보기
- `/pm:agents:workload` - 에이전트별 업무량 분산 확인
- `/pm:handoff <from-agent> <to-agent> <task>` - 작업 인수인계

#### PM Git 자동화 Commands
- `/pm:git:branch:create <feature-name>` - 기능별 브랜치 생성 (명명 규칙 적용)
- `/pm:git:pr:create <agent> <task>` - 에이전트 작업 완료 후 PR 자동 생성
- `/pm:git:merge:milestone` - 마일스톤 완료 시 브랜치들 병합
- `/pm:git:release:tag <week-number>` - 주차별 릴리즈 태깅
- `/pm:git:rollback:safe` - 문제 발생 시 안전한 롤백
- `/pm:git:review:assign <reviewer> <pr>` - 코드 리뷰어 자동 할당
- `/pm:git:sync:agents` - 모든 에이전트 브랜치 동기화
- `/pm:git:cleanup:branches` - 완료된 기능 브랜치 정리

#### 프로젝트 진행 관리
- `/pm:milestone:check` - 현재 마일스톤 달성도
- `/pm:blockers:list` - 진행 중인 블로커 목록
- `/pm:dependencies:map` - 작업 의존성 맵핑
- `/pm:timeline:adjust` - 일정 조정 제안

#### 품질 관리
- `/pm:review:code` - 코드 리뷰 스케줄링
- `/pm:test:coverage` - 테스트 커버리지 체크
- `/pm:integration:test` - 통합 테스트 실행
- `/pm:deploy:readiness` - 배포 준비도 체크

#### 리포팅
- `/pm:report:daily` - 일일 진행 보고서
- `/pm:report:stakeholder` - 이해관계자 보고서
- `/pm:metrics:team` - 팀 성과 지표

These are Claude-specific automation commands for AI agent project management and development workflow automation.

## Specialized Agents

The system uses five specialized Claude agents for different aspects:

1. **trade-pm-agent**: Project management and coordination
2. **n8n-automation-lead**: Workflow development and n8n management
3. **google-workspace-architect**: Sheets database and Drive structure
4. **api-integration-specialist**: External API connections and auth
5. **workflow-developer**: n8n workflow creation and testing

Use these agents proactively when working on their respective domains.

## Data Architecture

### Google Sheets Schema (Order_Management)
- Order_ID: Unique identifier (ORD-YYYY-MM-DD-XXX format)
- Client information, product details, pricing
- Status tracking (Pending/Processing/Shipped/Delivered)
- Delivery dates and tracking numbers
- Auto-generated Drive folder links

### Drive Folder Structure
```
Trade_Operations/
├── 01_Orders/YYYY/QX/ORDER_ID/
│   ├── Documents/        # Quotes, contracts, invoices
│   ├── Communications/   # Email and WeChat logs
│   └── Attachments/      # Product specs, shipping docs
├── 02_Templates/         # Document templates
├── 03_Marketing/         # Campaign materials
└── 04_Archive/          # Completed orders
```

## n8n Workflow Patterns

### Standard Workflow Structure
```
Trigger → Data Validation → Main Processing → Error Handling → Success Actions
```

### Key Integration Points
- Google Sheets API v4 for database operations
- Google Drive API v3 for file management
- Batch processing with SplitInBatches node
- Wait nodes for API rate limiting
- Webhook triggers for real-time processing

## Performance Requirements

- Workflow execution time: <30 seconds
- Error rate: <1%
- System uptime: 99.9%
- API response time: <500ms
- Capacity: 1000+ orders/month

## Development Standards

### API Security
- All credentials stored in Windows environment variables
- Service account authentication for Google APIs
- Encrypted credential storage in n8n
- Regular credential rotation procedures

### Testing Requirements
- Unit tests for workflow logic
- Integration tests for API connections
- Load testing with 1000+ records
- Error scenario validation
- Mock data generators for development

### Error Handling
- Comprehensive try/catch in Function nodes
- Retry logic with exponential backoff
- Centralized error logging
- Alert systems for critical failures
- Fallback mechanisms for API outages

## 8-Week Implementation Timeline

**Week 1**: n8n setup, API configuration, Windows service deployment
**Week 2-3**: Google Workspace structure, database schema implementation
**Week 4-5**: Core workflows (marketing, order processing, document generation)
**Week 6-7**: Production management, WeChat integration, shipping automation
**Week 8**: Testing, optimization, production deployment

## Key Integration Details

### Google Workspace Operations
- Batch API calls (max 100 per request)
- Real-time data sync between Sheets and n8n
- Automated folder creation on order placement
- Permission management for different user roles

### External API Management
- Rate limiting compliance for all APIs
- Authentication token refresh automation
- API quota monitoring and alerts
- Fallback options for service interruptions

Use the trade-pm-agent proactively for coordinating implementation phases and the specialized agents for domain-specific tasks.