/**
 * Manual local test for health endpoint
 *
 * Tests the health check endpoint locally.
 * Run with: node tests/manual/test-health-local.ts
 */

const testHealth = async () => {
  const healthUrl = 'http://localhost:3000/api/health';

  try {
    console.log('📤 Sending health check request...');

    const startTime = Date.now();
    const response = await fetch(healthUrl);
    const duration = Date.now() - startTime;

    const data = await response.json();

    console.log('✅ Health check response:', response.status);
    console.log('Response time:', duration, 'ms');
    console.log('Response data:', JSON.stringify(data, null, 2));

    // Verify response time < 500ms (constitution requirement)
    if (duration < 500) {
      console.log('✅ Response time meets <500ms requirement');
    } else {
      console.log('⚠️  Response time exceeds 500ms requirement');
    }
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }
};

// Run the test
testHealth();
