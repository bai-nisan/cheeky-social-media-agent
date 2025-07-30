import 'dotenv/config';

// Simple test to see what we have
console.log('=== Environment Check ===');
console.log('API Key:', process.env.TWITTER_API_KEY ? 'Present' : 'Missing');
console.log('API Secret:', process.env.TWITTER_API_KEY_SECRET ? 'Present' : 'Missing');
console.log('User Token:', process.env.TWITTER_USER_TOKEN ? 'Present' : 'Missing');
console.log('User Secret:', process.env.TWITTER_USER_TOKEN_SECRET ? 'Present' : 'Missing');
console.log('Bearer Token:', process.env.TWITTER_BEARER_TOKEN ? 'Present' : 'Missing');

// Try a very basic Twitter API call
import { TwitterApi } from 'twitter-api-v2';

async function minimalTest() {
  console.log('\n=== Basic Twitter API Test ===');
  
  // Test just the me() endpoint
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_KEY_SECRET!,
    accessToken: process.env.TWITTER_USER_TOKEN!,
    accessSecret: process.env.TWITTER_USER_TOKEN_SECRET!,
  });

  try {
    console.log('Attempting to call /2/users/me...');
    const response = await client.v2.me();
    console.log('✅ SUCCESS!');
    console.log('Username:', response.data?.username);
    console.log('User ID:', response.data?.id);
  } catch (error: any) {
    console.log('❌ Failed with error:');
    console.log('Status:', error.code || 'unknown');
    console.log('Message:', error.message || 'unknown');
    
    // Check if it's specifically an OAuth signature issue
    if (error.message?.includes('signature')) {
      console.log('💡 This looks like an OAuth signature mismatch');
      console.log('   - Double-check that Access Token belongs to the same app as API Key');
    }
  }
}

minimalTest(); 