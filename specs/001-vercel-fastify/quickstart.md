# Quickstart Guide: Vercel Fastify Serverless Infrastructure

**Feature**: 001-vercel-fastify
**Date**: 2026-01-19
**Phase**: Phase 1 - Design & Contracts

## Overview

This guide provides step-by-step instructions for setting up the local development environment, running the serverless webhook service, testing endpoints, and deploying to Vercel.

---

## Prerequisites

- **Node.js**: 18.x or 20.x LTS installed
- **pnpm**: 8.x or later (package manager)
- **Git**: For cloning and version control
- **Vercel CLI**: `npm install -g vercel` (optional, for deployment)
- **Telegram Bot Token**: From [@BotFather](https://t.me/botfather) (optional for webhook testing)
- **OpenAI API Key**: From [platform.openai.com](https://platform.openai.com/api-keys) (optional for future AI features)

---

## 1. Repository Setup

### Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd gigradar-test

# Install dependencies with pnpm
pnpm install

# Or with npm (if pnpm not available)
npm install
```

### Environment Configuration

Create a `.env` file in the project root:

```bash
# Copy the example .env file (if available)
cp .env.example .env

# Or create manually
cat > .env << 'EOF'
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
OPEN_AI_TOKEN=sk-your_openai_api_key_here
LOG_LEVEL=info
NODE_ENV=development
PORT=3000
EOF
```

**Required Environment Variables**:

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot authentication token | `8371831501:AAEDKscU4HB3...` | Yes |
| `OPEN_AI_TOKEN` | OpenAI API key for AI responses | `sk-proj-qe9c-VNGM7C...` | Yes |
| `LOG_LEVEL` | Logging verbosity | `info` | No (default: `info`) |
| `NODE_ENV` | Environment mode | `development` | No (default: `development`) |
| `PORT` | Local development port | `3000` | No (default: `3000`) |

---

## 2. Local Development

### Start Development Server

```bash
# Using pnpm
pnpm dev

# Or using npm
npm run dev
```

The server will start at `http://localhost:3000`

**Expected Output**:
```
> api@1.0.0 dev /path/to/api
> fastify start -l info -a 0.0.0.0 -p 3000 src/server.ts

Server listening on http://0.0.0.0:3000
```

### Verify Server Health

```bash
curl http://localhost:3000/api/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-19T12:34:56.789Z",
  "uptime": 1.234,
  "version": "1.0.0",
  "checks": {
    "server": "healthy",
    "memory": "healthy"
  }
}
```

---

## 3. Testing Webhook Endpoint

### Test with cURL

```bash
# Send a test webhook POST request
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "update_id": 123456789,
    "message": {
      "message_id": 1,
      "from": {
        "id": 987654321,
        "is_bot": false,
        "first_name": "John"
      },
      "chat": {
        "id": 987654321,
        "type": "private"
      },
      "date": 1705702400,
      "text": "Hello, bot!"
    }
  }'
```

**Expected Response**:
```json
{
  "ok": true,
  "message": "Webhook received"
}
```

### Test with HTTPie

```bash
# Install HTTPie: brew install httpie (macOS) or apt install httpie (Linux)
http POST localhost:3000/api/webhook \
  update_id=123456789 \
  message:='{
    "message_id": 1,
    "from": {"id": 987654321, "is_bot": false, "first_name": "John"},
    "chat": {"id": 987654321, "type": "private"},
    "date": 1705702400,
    "text": "Hello, bot!"
  }'
```

### Test Error Handling

```bash
# Test missing required fields (should return 400)
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{}'

# Test malformed JSON (should return 400)
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d 'invalid json'

# Test payload size limit (create large JSON >3MB)
dd if=/dev/zero bs=1M count=4 | curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d @- \
  --max-time 5
```

---

## 4. Running Tests

### Run All Tests

```bash
# Using pnpm
pnpm test

# Or using npm
npm test
```

**Expected Output**:
```
 ✓ api/src/routes/webhook.test.ts (4)
 ✓ api/src/routes/health.test.ts (3)
 ✓ api/src/middleware/validation.test.ts (5)
 ✓ api/src/middleware/logger.test.ts (3)
 ✓ api/src/config/env.test.ts (2)

Test Files  4 passed (4)
     Tests  17 passed (17)
  Start at  12:34:56
  Duration  234ms
```

### Run Tests in Watch Mode

```bash
pnpm test:watch
```

### Generate Coverage Report

```bash
pnpm test:coverage
```

Coverage report will be generated in `coverage/index.html`

**Constitution Requirement**: Minimum 80% coverage

---

## 5. Type Checking and Linting

### Run TypeScript Type Check

```bash
pnpm type-check
```

### Run ESLint

```bash
pnpm lint
```

### Fix Linting Issues Automatically

```bash
pnpm lint:fix
```

### Format Code with Prettier

```bash
pnpm format
```

---

## 6. Deployment to Vercel

### Initial Deployment

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview environment
vercel

# Deploy to production
vercel --prod
```

### Set Environment Variables in Vercel

```bash
# Using Vercel CLI
vercel env add TELEGRAM_BOT_TOKEN
vercel env add OPEN_AI_TOKEN

# Or via Vercel Dashboard
# 1. Go to https://vercel.com/dashboard
# 2. Select your project
# 3. Navigate to Settings > Environment Variables
# 4. Add each required variable
```

**Note**: Environment variable changes require redeployment per specification.

### Verify Deployment

```bash
# Test health endpoint on deployed URL
curl https://your-project.vercel.app/api/health

# Test webhook endpoint
curl -X POST https://your-project.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"update_id":123456789,"message":{"message_id":1,"from":{"id":987654321,"is_bot":false,"first_name":"John"},"chat":{"id":987654321,"type":"private"},"date":1705702400,"text":"Hello!"}}'
```

---

## 7. Setting Up Telegram Webhook

Once deployed, configure your Telegram bot to send webhooks to your Vercel endpoint:

```bash
# Set webhook via Telegram Bot API
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-project.vercel.app/api/webhook"
  }'

# Verify webhook
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

**Expected Response**:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-project.vercel.app/api/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

## 8. Debugging and Troubleshooting

### View Logs in Development

```bash
# Logs are output to console in structured JSON format
pnpm dev

# Filter logs by level (Linux/macOS)
pnpm dev 2>&1 | grep '"level":"error"'
```

### View Logs in Production

```bash
# Using Vercel CLI
vercel logs

# Follow logs in real-time
vercel logs --follow
```

### Common Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| Missing environment variables | Application fails to start with error | Verify `.env` file exists and contains all required variables |
| Port already in use | `EADDRINUSE: address already in use` | Change `PORT` in `.env` or kill process using port 3000 |
| Payload size exceeded | 413 Payload Too Large error | Reduce request body size to under 3MB |
| Type checking errors | `TS2322: Type 'X' is not assignable to type 'Y'` | Run `pnpm type-check` and fix type mismatches |
| Test failures | Tests fail with timeout or assertion errors | Verify environment variables are set for testing mode |

---

## 9. Integration Scenarios

### Scenario 1: Receive Text Message

1. User sends text message to Telegram bot
2. Telegram POSTs webhook to `/api/webhook`
3. Server validates payload size and schema
4. Server acknowledges with 200 OK
5. Server logs request with correlation ID

**Request Example**:
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {"id": 987654321, "is_bot": false, "first_name": "Alice"},
    "chat": {"id": 987654321, "type": "private"},
    "date": 1705702400,
    "text": "Hello, bot!"
  }
}
```

**Log Output**:
```json
{
  "level": "info",
  "msg": "Webhook received",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "path": "/api/webhook",
  "statusCode": 200,
  "timestamp": "2026-01-19T12:34:56.789Z"
}
```

### Scenario 2: Receive Image Message

1. User sends image to Telegram bot
2. Telegram POSTs webhook with photo array
3. Server validates payload size (images may be large)
4. Server acknowledges with 200 OK
5. Image data preserved for future processing

**Request Example**:
```json
{
  "update_id": 123456790,
  "message": {
    "message_id": 2,
    "from": {"id": 987654321, "is_bot": false, "first_name": "Alice"},
    "chat": {"id": 987654321, "type": "private"},
    "date": 1705702401,
    "photo": [
      {"file_id": "AgACAgIAAxkBAAI...", "file_size": 1234}
    ],
    "caption": "Check this out!"
  }
}
```

### Scenario 3: Health Check

1. Monitoring system calls GET `/api/health`
2. Server responds immediately with status
3. Response includes uptime, version, and dependency checks

**Request**: `GET /api/health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-19T12:34:56.789Z",
  "uptime": 3600.123,
  "version": "1.0.0",
  "checks": {
    "server": "healthy",
    "memory": "healthy"
  }
}
```

---

## 10. Next Steps

After completing this quickstart:

1. ✅ Verify all tests pass: `pnpm test`
2. ✅ Check type safety: `pnpm type-check`
3. ✅ Confirm zero linting warnings: `pnpm lint`
4. ✅ Test health endpoint responds in <500ms
5. ✅ Deploy to Vercel preview environment
6. ✅ Configure Telegram webhook
7. ✅ Send test message from Telegram
8. ✅ Verify logs in Vercel dashboard

**Constitution Compliance Checklist**:

- [x] TypeScript strict mode enabled
- [x] ESLint zero-warnings policy configured
- [x] Prettier formatting configured
- [x] Test coverage target ≥80%
- [x] Structured JSON logging implemented
- [x] Environment variables validated at startup
- [x] Payload size limits enforced
- [x] Health check responds <500ms
- [x] Cold start <3 seconds

---

## Appendix: Useful Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report

# Code Quality
pnpm type-check       # TypeScript type checking
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix linting issues
pnpm format           # Format with Prettier

# Deployment
vercel                # Deploy to preview
vercel --prod         # Deploy to production
vercel logs           # View production logs
vercel env ls         # List environment variables
```

---

## Support and Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Fastify Docs**: https://fastify.dev/docs/latest
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **Project Constitution**: `.specify/memory/constitution.md`
- **CLAUDE.md**: Project overview and Speckit workflow
