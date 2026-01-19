# Telegram AI Assistant Bot

A serverless Telegram bot powered by OpenAI GPT-4o, deployed on Vercel with Fastify.

## Features

- 🤖 **AI-Powered Responses**: Uses OpenAI GPT-4o for intelligent conversations
- 📸 **Vision Support**: Can analyze images (infrastructure ready)
- 💬 **Chat History**: Maintains context with last 20 messages per conversation
- ⚡ **Real-Time Typing**: Shows typing indicator while processing
- 🔄 **Webhook-Based**: Instant message delivery via Telegram webhooks
- 📊 **Health Monitoring**: Built-in health check endpoint
- 🛡️ **Type-Safe**: Built with TypeScript strict mode

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Fastify 4.x (high-performance web framework)
- **AI**: OpenAI GPT-4o (text + vision)
- **Deployment**: Vercel Serverless Functions
- **Language**: TypeScript 5.x
- **Validation**: Zod 3.x
- **Logging**: Pino 8.x (structured JSON logging)

## Project Structure

```
gigradar-test/
├── api/
│   ├── src/
│   │   ├── config/       # Environment configuration
│   │   ├── middleware/   # Request validation, logging, timeout tracking
│   │   ├── routes/       # Webhook and health endpoints
│   │   ├── services/     # OpenAI & Telegram integrations
│   │   ├── types/        # TypeScript type definitions
│   │   ├── server.ts     # Fastify server instance
│   │   └── index.ts      # Vercel entry point
│   ├── tests/            # Unit, integration, and contract tests
│   ├── dist/             # Compiled JavaScript (build output)
│   └── package.json
├── vercel.json           # Vercel deployment config
├── package.json          # Root workspace config
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ or 20+
- npm or pnpm
- Telegram Bot Token from [@BotFather](https://t.me/botfather)
- OpenAI API Key from [platform.openai.com](https://platform.openai.com/api-keys)

### Installation

```bash
# Install dependencies
npm install

# or with pnpm
pnpm install
```

### Environment Configuration

Create a `.env` file in the `api/` directory:

```bash
cp api/.env.example api/.env
```

Edit `api/.env` with your credentials:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
OPEN_AI_TOKEN=sk-proj-your-openai-api-key
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

### Local Development

```bash
# Start the development server
cd api
npm run server:dev

# Or with the dev script
npm run server:dev
```

The server will start on `http://localhost:3000`

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

### Manual Testing

**Test Health Endpoint:**
```bash
curl http://localhost:3000/api/health
```

**Test Webhook:**
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "update_id": 123456789,
    "message": {
      "message_id": 1,
      "from": {
        "id": 987654321,
        "is_bot": false,
        "first_name": "Test"
      },
      "chat": {
        "id": 987654321,
        "type": "private"
      },
      "date": 1705702400,
      "text": "Hello! What can you do?"
    }
  }'
```

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Set Environment Variables in Vercel

**Via CLI:**
```bash
vercel env add TELEGRAM_BOT_TOKEN
vercel env add OPEN_AI_TOKEN
```

**Via Dashboard:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to Settings → Environment Variables
4. Add:
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
   - `OPEN_AI_TOKEN`: Your OpenAI API key

### Configure Telegram Webhook

After deployment, set up your Telegram webhook:

```bash
# Replace with your Vercel URL
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-project.vercel.app/api/webhook"
  }'
```

Verify the webhook:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## API Endpoints

### POST /api/webhook
Receives incoming Telegram messages.

**Request:**
```json
{
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
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Processing"
}
```

### GET /api/health
Health check endpoint for monitoring.

**Response:**
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

## Architecture

### Message Flow

1. **User sends message** → Telegram Bot API
2. **Webhook receives** → POST /api/webhook
3. **Immediate ACK** → Returns 200 OK
4. **Background Processing**:
   - Send typing indicator
   - Fetch chat history (last 20 messages)
   - Generate AI response with OpenAI
   - Send response via Telegram Bot API

### Error Handling

- **Validation errors**: 400 Bad Request
- **Payload too large**: 413 Payload Too Large (max 3MB)
- **Server errors**: 500 Internal Server Error
- **API failures**: Graceful fallback messages

## Performance

- **Cold start**: < 3 seconds
- **Health check**: < 500ms
- **Webhook response**: < 1 second (acknowledgment)
- **AI response**: 2-10 seconds (depends on OpenAI)

## Development

### Code Quality

```bash
# Run TypeScript type checking
npm run type-check

# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Project Structure (api/)

```
src/
├── config/
│   └── env.ts              # Environment variable validation
├── middleware/
│   ├── logger.ts           # Structured JSON logging
│   ├── timeout.ts          # Execution time tracking
│   └── validation.ts       # Payload size validation
├── routes/
│   ├── webhook.ts          # Telegram webhook handler
│   └── health.ts           # Health check endpoint
├── services/
│   ├── openai.ts           # OpenAI API integration
│   ├── telegram.ts         # Telegram Bot API client
│   └── messageProcessor.ts # Message orchestration
├── types/
│   ├── env.ts              # Environment config types
│   ├── health.ts           # Health check types
│   ├── logger.ts           # Logger types
│   └── webhook.ts          # Webhook types
├── server.ts               # Fastify server instance
└── index.ts                # Vercel entry point
```

## Troubleshooting

### Server won't start

- Verify environment variables are set in `.env`
- Check that port 3000 is not already in use
- Ensure all dependencies are installed: `npm install`

### Tests failing

- Run `npm install` to ensure all dependencies are installed
- Check that `.env` exists in the `api/` directory
- Run `npm run type-check` to verify TypeScript compilation

### Deployment fails

- Verify build command: `npm run build`
- Check that `api/dist/` directory exists after build
- Ensure environment variables are set in Vercel dashboard
- Review Vercel deployment logs for specific errors

### Webhook not receiving messages

- Verify webhook URL is set correctly via Telegram Bot API
- Check that the URL is accessible: `curl https://your-url.vercel.app/api/health`
- Ensure TELEGRAM_BOT_TOKEN is set correctly in Vercel
- Check Vercel function logs for errors

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
