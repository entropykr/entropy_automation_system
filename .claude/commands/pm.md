---
description: Project Management command system for entropy_automation_system
---

# Project Management Command System

Welcome to the Entropy Automation System PM command interface for automated project management.

## 🚀 Quick Start Commands

### Agent Management
- `/pm:assign <agent> <task>` - 특정 에이전트에게 작업 할당
- `/pm:agents:status` - 모든 에이전트 작업 현황 보기
- `/pm:agents:workload` - 에이전트별 업무량 분산 확인
- `/pm:handoff <from-agent> <to-agent> <task>` - 작업 인수인계

### Git Automation
- `/pm:git:branch:create <feature-name>` - 기능별 브랜치 생성
- `/pm:git:pr:create <agent> <task>` - 에이전트 작업 완료 후 PR 자동 생성
- `/pm:git:merge:milestone` - 마일스톤 완료 시 브랜치들 병합
- `/pm:git:release:tag <week-number>` - 주차별 릴리즈 태깅
- `/pm:git:rollback:safe` - 문제 발생 시 안전한 롤백

## 📊 Project Progress Management

### Milestone Tracking
- `/pm:milestone:check` - 현재 마일스톤 달성도 확인
- `/pm:blockers:list` - 진행 중인 블로커 목록
- `/pm:dependencies:map` - 작업 의존성 맵핑
- `/pm:timeline:adjust` - 일정 조정 제안

### Quality Assurance
- `/pm:review:code` - 코드 리뷰 스케줄링
- `/pm:test:coverage` - 테스트 커버리지 체크
- `/pm:integration:test` - 통합 테스트 실행
- `/pm:deploy:readiness` - 배포 준비도 체크

### Team Coordination
- `/pm:sync:agents` - 모든 에이전트 브랜치 동기화
- `/pm:review:assign <reviewer> <pr>` - 코드 리뷰어 자동 할당
- `/pm:cleanup:branches` - 완료된 기능 브랜치 정리

## 📋 Reporting & Analytics

### Daily Reports
- `/pm:report:daily` - 일일 진행 보고서 생성
- `/pm:report:stakeholder` - 이해관계자 보고서
- `/pm:metrics:team` - 팀 성과 지표
- `/pm:metrics:velocity` - 개발 속도 측정

### Performance Tracking
- `/pm:track:commits` - 커밋 활동 분석
- `/pm:track:prs` - PR 처리 속도 분석
- `/pm:track:issues` - 이슈 해결 시간 추적
- `/pm:track:burndown` - 번다운 차트 생성

## 🔄 Automation & Workflow

### CI/CD Management  
- `/pm:ci:status` - CI/CD 파이프라인 상태
- `/pm:ci:trigger` - 빌드 트리거 실행
- `/pm:deploy:staging` - 스테이징 환경 배포
- `/pm:deploy:prod` - 프로덕션 배포

### Notification Management
- `/pm:notify:slack` - Slack 알림 설정
- `/pm:notify:email` - 이메일 알림 설정  
- `/pm:alert:critical` - 크리티컬 이슈 알림
- `/pm:alert:deadline` - 데드라인 리마인더

## 🛠️ Development Tools

### Workflow Development
- `/trade:dev:create` - Create new workflow
- `/trade:dev:test` - Test workflow with mock data
- `/trade:dev:debug` - Debug workflow issues
- `/trade:dev:optimize` - Optimize performance

### Data Management
- `/trade:data:seed` - Generate test data
- `/trade:data:migrate` - Migrate existing data
- `/trade:data:backup` - Backup business data
- `/trade:data:clean` - Clean test data

## 📋 Implementation Phases

### Phase 1: Foundation (Week 1)
```
/trade:init
/trade:setup
/trade:api:test
/trade:n8n:scheduler
```

### Phase 2: Data Structure (Week 2-3)
```
/trade:sheets:create
/trade:sheets:schema
/trade:drive:structure
/trade:drive:permissions
```

### Phase 3: Core Workflows (Week 4-5)
```
/trade:marketing:cold-email
/trade:order:intake
/trade:order:documents
```

### Phase 4: Production (Week 6-7)
```
/trade:production:monitor
/trade:shipping:notify
/trade:api:wechat
```

### Phase 5: Deployment (Week 8)
```
/trade:n8n:backup
/trade:monitor:apis
/trade:report:daily
```

## 🎯 Current Status

Use `/trade:status` to see:
- Implementation progress (Week X of 8)
- Active workflows count
- API connection status
- Recent errors
- Performance metrics
- Next milestone

## ⚡ Quick Actions

### Emergency Commands
- `/trade:emergency:stop` - Stop all workflows
- `/trade:emergency:rollback` - Rollback to last stable
- `/trade:emergency:alert` - Send emergency notification

### Maintenance
- `/trade:maintenance:start` - Enter maintenance mode
- `/trade:maintenance:end` - Exit maintenance mode
- `/trade:maintenance:schedule` - Schedule downtime

## 📚 Help & Documentation

- `/trade:help` - Show this help menu
- `/trade:help:[command]` - Get help for specific command
- `/trade:docs` - Open documentation
- `/trade:support` - Contact support

---

Ready to automate your B2B trade operations? Start with `/trade:init`!