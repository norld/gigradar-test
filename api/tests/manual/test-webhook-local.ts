/**
 * Manual local test for webhook endpoint
 *
 * Simulates Telegram webhook POST requests to test the bot locally.
 * Run with: node tests/manual/test-webhook-local.ts
 */

const testWebhook = async () => {
  const webhookUrl = 'http://localhost:3000/api/webhook';

  // Simulate a Telegram webhook message
  const testMessage = {
    update_id: 123456789,
    message: {
      message_id: 1,
      from: {
        id: 987654321,
        is_bot: false,
        first_name: 'Test',
        username: 'testuser',
      },
      chat: {
        id: 987654321,
        type: 'private',
        first_name: 'Test',
        username: 'testuser',
      },
      date: Math.floor(Date.now() / 1000),
      text: 'Hello! What can you do?',
    },
  };

  try {
    console.log('📤 Sending test webhook request...');
    console.log('Message:', testMessage.message.text);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });

    const data = await response.json();

    console.log('✅ Webhook response:', response.status);
    console.log('Response data:', data);
    console.log('\n⏳ Waiting for AI response (check server logs)...');

    // Give time for async processing
    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log('\n✨ Test complete!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testWebhook();
