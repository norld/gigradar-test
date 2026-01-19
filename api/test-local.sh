#!/bin/bash

echo "🚀 Testing Telegram Bot API Locally"
echo "===================================="
echo ""

# Test 1: Health Check
echo "📊 Test 1: Health Check"
echo "Testing: http://localhost:3003/api/health"
echo ""

HEALTH_RESPONSE=$(curl -s http://localhost:3003/api/health)
echo "$HEALTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_RESPONSE"
echo ""

# Check if health check was successful
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
  echo "✅ Health check passed!"
else
  echo "❌ Health check failed"
fi
echo ""

# Test 2: Webhook endpoint (simulated message)
echo "📨 Test 2: Webhook Endpoint"
echo "Sending test message to webhook..."
echo ""

WEBHOOK_RESPONSE=$(curl -s -X POST http://localhost:3003/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "update_id": 123456789,
    "message": {
      "message_id": 1,
      "from": {
        "id": 987654321,
        "is_bot": false,
        "first_name": "Test User"
      },
      "chat": {
        "id": 987654321,
        "type": "private"
      },
      "date": 1705702400,
      "text": "Hello! What can you do?"
    }
  }')

echo "Webhook Response:"
echo "$WEBHOOK_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$WEBHOOK_RESPONSE"
echo ""

# Check if webhook acknowledged
if echo "$WEBHOOK_RESPONSE" | grep -q "ok.*true"; then
  echo "✅ Webhook acknowledged!"
  echo ""
  echo "⏳ Message is being processed in the background..."
  echo "📝 Check server logs above for AI response details"
else
  echo "❌ Webhook failed"
fi
echo ""

echo "===================================="
echo "Testing complete!"
echo ""
echo "💡 To stop the server, press Ctrl+C in the server terminal"
echo "💡 To restart the server, run: PORT=3003 npx tsx dev-server.ts"
