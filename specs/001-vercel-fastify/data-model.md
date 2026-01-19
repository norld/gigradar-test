# Data Model: Vercel Fastify Serverless Infrastructure

**Feature**: 001-vercel-fastify
**Date**: 2026-01-19
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the data entities, their attributes, validation rules, and relationships for the serverless webhook infrastructure. Since this is a stateless HTTP handling layer, entities are primarily request/response DTOs and runtime configuration objects.

---

## Entities

### 1. WebhookRequest

Represents an incoming Telegram webhook message containing user chat data, message content, and metadata.

**Purpose**: Capture and validate incoming POST requests from Telegram webhooks

**Attributes**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| update_id | number | Yes | Positive integer | Unique identifier for this update |
| message | object | No | Valid Telegram message object | Message sent by user (text, image, etc.) |
| callback_query | object | No | Valid callback query object | Callback from inline button press |
| edited_message | object | No | Valid Telegram message object | Edited version of message |
| channel_post | object | No | Valid Telegram message object | Message sent to channel |
| edited_channel_post | object | No | Valid Telegram message object | Edited channel post |

**Validation Rules**:
- At least one of `message`, `callback_query`, `edited_message`, `channel_post`, or `edited_channel_post` must be present
- `update_id` must be unique per webhook delivery (Telegram guarantees)
- Payload size ≤ 3MB (enforced before parsing)

**Relationships**:
- None (stateless request processing)

**Lifecycle**:
- Created on webhook POST receipt
- Validated against schema
- Processed (handled by future Telegram integration feature)
- Discarded after response sent

---

### 2. EnvironmentConfig

Represents the configuration values required for the service to operate (API tokens, bot credentials, service endpoints).

**Purpose**: Centralize and validate environment variable access

**Attributes**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| TELEGRAM_BOT_TOKEN | string | Yes | Non-empty string, matches regex `^\d+:[A-Za-z0-9_-]+$` | Telegram bot authentication token |
| OPEN_AI_TOKEN | string | Yes | Non-empty string, starts with `sk-` | OpenAI API key for AI responses |
| LOG_LEVEL | string | No | One of: `debug`, `info`, `warn`, `error` | Logging verbosity level (default: `info`) |
| NODE_ENV | string | No | One of: `development`, `production`, `test` | Environment indicator (default: `development`) |
| PORT | number | No | Positive integer 1-65535 | Local development port (default: 3000) |

**Validation Rules**:
- All required fields must be present at startup or application throws clear error
- Tokens are validated for format but not cryptographic correctness (checked by external APIs)
- Config is frozen after validation (immutable)

**Relationships**:
- Used by `logger.ts` to configure Pino instance
- Used by `webhook.ts` to authenticate Telegram requests (future feature)

**Lifecycle**:
- Loaded on application startup (module initialization)
- Validated immediately (fail-fast)
- Immutable throughout application lifetime
- Changes require redeployment (per clarification)

---

### 3. LogEntry

Represents a structured JSON record of system events including timestamp, severity level, request context, and message details.

**Purpose**: Standardize logging format for operational visibility and debugging

**Attributes**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| timestamp | string | Yes | ISO 8601 format | When the log entry was created |
| level | string | Yes | One of: `debug`, `info`, `warn`, `error` | Severity level for filtering |
| msg | string | Yes | Non-empty string | Human-readable log message |
| requestId | string | No | UUID v4 format | Unique request correlation ID |
| method | string | No | HTTP method (GET, POST, etc.) | Request method for HTTP logs |
| path | string | No | URL path | Request path for HTTP logs |
| statusCode | number | No | HTTP status code | Response status for HTTP logs |
| err | object | No | Error object with stack trace | Error details if applicable |
| context | object | No | Arbitrary key-value pairs | Additional contextual metadata |

**Validation Rules**:
- `timestamp` must be valid ISO 8601 date-time string
- `level` must match one of the four allowed values
- `requestId` must be valid UUID v4 if present (generated via `crypto.randomUUID()`)
- `err` object is serialized with stack trace and message (if Error instance)
- Sensitive data (API keys, tokens) is redacted via custom serializers

**Relationships**:
- Created by `logger.ts` middleware
- Consumed by Vercel log aggregation
- Queried via Vercel dashboard or log export tools

**Lifecycle**:
- Created on each request, error, or application event
- Written to console (stdout/stderr)
- Aggregated by Vercel logging system
- Retained per Vercel platform log retention policy

---

### 4. HealthStatus

Represents the current operational state of the service including availability status and dependencies health.

**Purpose**: Provide simple health check endpoint for monitoring and load balancer checks

**Attributes**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| status | string | Yes | One of: `healthy`, `degraded`, `unhealthy` | Overall service health |
| timestamp | string | Yes | ISO 8601 format | When health was assessed |
| uptime | number | Yes | Non-negative number | Seconds since application start |
| version | string | No | Semver format | Application version (optional) |
| checks | object | No | Map of check name to status | Individual dependency health checks |

**Validation Rules**:
- `status` must be one of the three allowed values
- `timestamp` must be valid ISO 8601 date-time string
- `uptime` must be ≥ 0 (calculated from `process.uptime()`)

**Relationships**:
- Returned by `health.ts` route handler
- Consumed by monitoring systems (Vercel, external health checks)

**Example Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-19T12:34:56.789Z",
  "uptime": 1234.567,
  "version": "1.0.0",
  "checks": {
    "server": "healthy",
    "memory": "healthy"
  }
}
```

**Lifecycle**:
- Created on each GET /health request
- Contains point-in-time health information
- Not persisted (stateless)

---

## Type Definitions (TypeScript)

```typescript
// webhook.ts
export interface WebhookRequest {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
}

interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  photo?: Array<{ file_id: string; file_size?: number }>;
  [key: string]: unknown;
}

interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
}

// env.ts
export interface EnvironmentConfig {
  TELEGRAM_BOT_TOKEN: string;
  OPEN_AI_TOKEN: string;
  LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
  NODE_ENV?: 'development' | 'production' | 'test';
  PORT?: number;
}

// logger.ts
export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  msg: string;
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  err?: {
    type: string;
    message: string;
    stack?: string;
  };
  context?: Record<string, unknown>;
}

// health.ts
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version?: string;
  checks?: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
}
```

---

## State Management

**Architecture**: Stateless serverless functions

- No in-memory state between requests
- No database or cache dependencies
- Configuration loaded once per function instance (cold start)
- Request context stored in async local storage (for logging correlation)

**Implications**:
- No session management required
- No distributed state synchronization
- Simple horizontal scaling via Vercel auto-scaling
- Function instances can be recycled arbitrarily

---

## Validation Strategy

1. **Schema Validation**: Zod schemas for all entities at boundaries
2. **Runtime Checks**: Fastify built-in validation for request/response
3. **Type Safety**: TypeScript strict mode catches errors at compile time
4. **Environment Validation**: Startup checks fail fast if config invalid
5. **Payload Size**: Middleware rejects oversized requests before parsing

---

## Next Steps

1. Generate API contracts in `contracts/` directory
2. Create quickstart guide for local development
3. Proceed to task breakdown via `/speckit.tasks`
