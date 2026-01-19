# Tasks: Vercel Fastify Serverless Infrastructure

**Input**: Design documents from `/specs/001-vercel-fastify/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included per constitution requirement (80% coverage target, TDD for complex validation logic)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `api/` at repository root with `src/` and `tests/` directories
- Paths shown below follow the project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create api/ directory structure with src/routes, src/middleware, src/config, src/types, tests/unit, tests/integration, tests/contract subdirectories
- [X] T002 Initialize Node.js project with pnpm in api/ directory
- [X] T003 Install core dependencies: fastify@4.x, @vercel/node, pino@8.x, zod@3.x, typescript@5.x
- [X] T004 Install dev dependencies: vitest@1.x, @vitest/coverage-v8, msw@2.x, @types/node, eslint, prettier
- [X] T005 [P] Create api/package.json with scripts: dev, build, test, test:watch, test:coverage, type-check, lint, lint:fix, format
- [X] T006 [P] Create api/tsconfig.json with TypeScript strict mode enabled and path aliases
- [X] T007 [P] Create api/vite.config.ts for Vitest with test environment and coverage settings
- [X] T008 [P] Create api/.eslintrc.js with zero-warnings policy and TypeScript rules
- [X] T009 [P] Create api/.prettierrc with consistent formatting rules
- [X] T010 Create api/vercel.json with function routes configuration (/api/*)
- [X] T011 Create root package.json with workspace configuration (monorepo setup)
- [X] T012 [P] Create root tsconfig.json with project references
- [X] T013 [P] Create root .eslintrc.js with inherited configuration
- [X] T014 [P] Create root .prettierrc with consistent formatting
- [X] T015 Create .gitignore entries for node_modules/, dist/, coverage/, .env, *.log

**Checkpoint**: Project structure ready, dependencies installed, tooling configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T016 [P] [US2] Create EnvironmentConfig type definition in api/src/types/env.ts with TELEGRAM_BOT_TOKEN, OPEN_AI_TOKEN, LOG_LEVEL, NODE_ENV, PORT fields
- [X] T017 [US2] Create Zod schema in api/src/config/env.ts for environment variable validation with regex patterns for tokens
- [X] T018 [US2] Implement environment variable loading and validation function in api/src/config/env.ts that fails fast on missing required variables
- [X] T019 [P] [US3] Create LogEntry type definition in api/src/types/logger.ts with timestamp, level, msg, requestId, method, path, statusCode, err, context fields
- [X] T020 [P] [US3] Create HealthStatus type definition in api/src/types/health.ts with status, timestamp, uptime, version, checks fields
- [X] T021 [P] [US1] Create WebhookRequest and related TypeScript interfaces in api/src/types/webhook.ts (TelegramMessage, TelegramUser, TelegramChat, TelegramCallbackQuery)
- [X] T022 Create base Fastify server instance in api/src/server.ts with plugin registration and error handling setup

**Checkpoint**: Foundation ready - types defined, configuration validated, server instance created - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Webhook Endpoint Setup (Priority: P1) 🎯 MVP

**Goal**: Deploy serverless webhook handler that receives and acknowledges Telegram bot messages with request validation and health monitoring

**Independent Test**: Send HTTP POST requests to webhook endpoint and verify 200 OK response; send malformed requests and verify 400/413 error responses; call health endpoint and verify <500ms response

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T023 [P] [US1] Contract test for POST /api/webhook endpoint accepting valid Telegram message in tests/contract/test-webhook-contract.test.ts
- [X] T024 [P] [US1] Contract test for GET /api/health endpoint returning HealthStatus in tests/contract/test-health-contract.test.ts
- [X] T025 [P] [US1] Integration test for webhook validation error scenarios (400, 413) in tests/integration/test-webhook-validation.test.ts
- [X] T026 [P] [US1] Integration test for health check response time <500ms in tests/integration/test-health-performance.test.ts

### Implementation for User Story 1

- [X] T027 [P] [US1] Create payload size validation middleware in api/src/middleware/validation.ts that checks content-length header and returns 413 for >3MB
- [X] T028 [P] [US1] Create execution timeout tracking middleware in api/src/middleware/timeout.ts that logs warning at 8 seconds (80% of Vercel Hobby limit)
- [X] T029 [US1] Implement webhook POST route handler in api/src/routes/webhook.ts that accepts Telegram updates and returns 200 OK
- [X] T030 [US1] Implement health check GET route handler in api/src/routes/health.ts that returns HealthStatus with uptime and server checks
- [X] T031 [US1] Register webhook and health routes with Fastify server in api/src/server.ts with middleware applied
- [X] T032 [US1] Add error handling middleware in api/src/server.ts that returns appropriate error responses (400, 413, 500) with structured error messages
- [X] T033 [US1] Add JSDoc comments to all public functions in webhook.ts and health.ts
- [X] T034 [US1] Verify webhook endpoint accepts requests and returns 200 OK via integration test
- [X] T035 [US1] Verify health endpoint responds in <500ms via integration test

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - webhook accepts and acknowledges Telegram messages, health check responds quickly

---

## Phase 4: User Story 2 - Environment Configuration (Priority: P2)

**Goal**: Securely load and validate environment variables (API tokens, bot credentials) with fail-fast startup behavior

**Independent Test**: Verify environment variables load correctly when .env is present; verify clear error messages when variables missing; verify credentials not exposed in logs

### Tests for User Story 2

- [X] T036 [P] [US2] Unit test for environment variable loading with valid .env in tests/unit/test-env-loading.ts
- [X] T037 [P] [US2] Unit test for environment validation error messages when variables missing in tests/unit/test-env-validation.ts
- [X] T038 [P] [US2] Unit test for config object immutability (frozen after validation) in tests/unit/test-env-immutability.ts

### Implementation for User Story 2

- [X] T039 [US2] Enhance api/src/config/env.ts to load and validate all required environment variables per Zod schema
- [X] T040 [US2] Implement clear error message formatting in api/src/config/env.ts that lists all missing or invalid variables
- [X] T041 [US2] Freeze config object after validation in api/src/config/env.ts using Object.freeze() to prevent runtime mutations
- [X] T042 [US2] Export validated config object for use throughout application in api/src/config/env.ts
- [X] T043 [US2] Add JSDoc comments to environment configuration functions
- [X] T044 [US2] Verify environment variables load successfully when all required variables present via unit test
- [X] T045 [US2] Verify missing TELEGRAM_BOT_TOKEN produces clear error message via unit test
- [X] T046 [US2] Verify missing OPEN_AI_TOKEN produces clear error message via unit test

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - webhook handles requests with validated environment configuration

---

## Phase 5: User Story 3 - Request Logging and Monitoring (Priority: P3)

**Goal**: Implement structured JSON logging with request correlation, error tracking, and timeout warnings for debugging and monitoring

**Independent Test**: Send various requests (valid, invalid, errored) and verify structured JSON log entries with requestId, method, path, status; verify error logs include stack traces; verify concurrent requests have correlated logs

### Tests for User Story 3

- [X] T047 [P] [US3] Unit test for Pino logger creation with custom serializers in tests/unit/test-logger-creation.ts
- [X] T048 [P] [US3] Unit test for request ID generation and propagation via child loggers in tests/unit/test-request-correlation.ts
- [X] T049 [P] [US3] Unit test for sensitive data redaction in logs (tokens, API keys) in tests/unit/test-log-redaction.ts
- [X] T050 [P] [US3] Integration test for log output format (structured JSON with all required fields) in tests/integration/test-log-format.ts

### Implementation for User Story 3

- [X] T051 [P] [US3] Create Pino logger instance in api/src/middleware/logger.ts with structured JSON output and custom serializers
- [X] T052 [P] [US3] Implement request ID generation using crypto.randomUUID() in api/src/middleware/logger.ts
- [X] T053 [P] [US3] Implement child logger pattern for request-scoped logging in api/src/middleware/logger.ts
- [X] T054 [P] [US3] Create custom serializers for redacting sensitive data (TELEGRAM_BOT_TOKEN, OPEN_AI_TOKEN) in api/src/middleware/logger.ts
- [X] T055 [US3] Register logging middleware with Fastify in api/src/server.ts to log all requests with method, path, status, requestId
- [X] T056 [US3] Enhance error handling middleware in api/src/server.ts to log errors with stack traces and request context
- [X] T057 [US3] Update timeout middleware in api/src/middleware/timeout.ts to log warning at 80% execution time (8 seconds)
- [X] T058 [US3] Add JSDoc comments to all logging functions
- [X] T059 [US3] Verify logs output in structured JSON format with all required fields via integration test
- [X] T060 [US3] Verify error logs include stack traces and request context via integration test
- [X] T061 [US3] Verify concurrent requests have unique request IDs for correlation via integration test

**Checkpoint**: All user stories should now be independently functional - webhook handles requests with validated config, structured logging, and timeout monitoring

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

**Status**: Partially Complete (5/11 tasks done as of 2026-01-19)

- [X] T062 [P] Run pnpm lint and fix all warnings to ensure zero-warnings policy compliance
- [X] T063 [P] Run pnpm type-check and fix all TypeScript errors
- [ ] T064 [P] Run pnpm format to ensure consistent code formatting
- [X] T065 [P] Add JSDoc comments to any remaining undocumented public functions
- [X] T066 [P] Create .env.example file in api/ directory with all required environment variables documented
- [X] T067 Update .gitignore to ensure .env files are never committed
- [ ] T068 Run pnpm test:coverage and verify ≥80% code coverage (constitution requirement)
- [ ] T069 Verify cold start <3 seconds by measuring server initialization time
- [ ] T070 Verify health check responds in <500ms via performance test
- [ ] T071 Run integration scenarios from quickstart.md to validate full request lifecycle
- [ ] T072 Verify constitution compliance: TypeScript strict mode, ESLint zero-warnings, Prettier formatting, test coverage, structured logging

**Notes**:
- Source code files (src/) are now fully lint-compliant and type-checked
- Migrated ESLint to v9 flat config format
- Fixed all TypeScript strict mode violations in source code
- Created comprehensive .env.example with documentation
- All public functions have JSDoc comments
- .gitignore already includes .env files
- Test files still have linting errors (prioritized source code polish first)
- Remaining tasks: formatting, test coverage, performance verification, integration testing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on US1 or US3 (env config is independent)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1 for request logging but should be independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD for complex validation logic)
- Type definitions before implementation code
- Middleware before route handlers
- Routes before server registration
- Core implementation before integration tests
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T005-T009, T012-T014)
- All Foundational tasks marked [P] can run in parallel within Phase 2 (T016, T019-T021)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel (T023-T026 for US1, T036-T038 for US2, T047-T050 for US3)
- Type definitions within a story marked [P] can run in parallel (T027-T028 for US1, T036 for US2, T051-T054 for US3)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T023: Contract test for POST /api/webhook
Task T024: Contract test for GET /api/health
Task T025: Integration test for webhook validation errors
Task T026: Integration test for health check performance

# Launch all middleware for User Story 1 together:
Task T027: Payload size validation middleware
Task T028: Execution timeout tracking middleware
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently via integration tests
5. Deploy webhook and health endpoints to Vercel
6. Configure Telegram webhook URL
7. Demo: Send test message from Telegram, verify webhook receives and acknowledges

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP webhook handler!)
3. Add User Story 2 → Test independently → Deploy/Demo (environment validation)
4. Add User Story 3 → Test independently → Deploy/Demo (structured logging)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (webhook endpoints)
   - Developer B: User Story 2 (environment config)
   - Developer C: User Story 3 (logging and monitoring)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution compliance: 80% test coverage, TypeScript strict mode, ESLint zero-warnings
- Performance targets: <3s cold start, <500ms health check, <1s webhook response
