/**
 * Quick test script for the bot API
 * Run with: node tests/manual/quick-test.js
 */

async function testAPI() {
  console.log('🧪 Testing Bot API...\n');

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Endpoint...');
  try {
    const healthResponse = await fetch('http://localhost:3000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health Check Passed!');
    console.log('Response:', JSON.stringify(healthData, null, 2));
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }
  console.log('');

  // Test 2: Webhook
  console.log('2️⃣ Testing Webhook Endpoint...');
  try {
    const webhookResponse = await fetch('http://localhost:3000/api/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        update_id: 123456789,
        message: {
          message_id: 1,
          from: {
            id: 987654321,
            is_bot: false,
            first_name: 'Test User',
          },
          chat: {
            id: 987654321,
            type: 'private',
          },
          date: Math.floor(Date.now() / 1000),
          text: 'Hello! What can you do?',
        },
      }),
    });
    const webhookData = await webhookResponse.json();
    console.log('✅ Webhook Accepted!');
    console.log('Response:', JSON.stringify(webhookData, null, 2));
    console.log('');
    console.log('⏳ Message processing in background...');
    console.log('📝 Check the server terminal for AI response');
  } catch (error) {
    console.log('❌ Webhook Failed:', error.message);
  }

  console.log('\n✨ Test complete!');
}

testAPI().catch(console.error);
