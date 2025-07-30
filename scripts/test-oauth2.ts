import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';

async function testOAuth2() {
  console.log('🧪 Testing OAuth 2.0 approach...\n');
  
  // Method 1: Try Bearer token first (should work for public data)
  console.log('1. Testing Bearer Token...');
  const bearerClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '');
  
  try {
    const user = await bearerClient.v2.userByUsername('twitter');
    console.log('✅ Bearer token works for public data');
    console.log('   Found user:', user.data.username);
    
    // Try getting your own tweets with Bearer token
    const yourUser = await bearerClient.v2.userByUsername('GalKimron');
    const timeline = await bearerClient.v2.userTimeline(yourUser.data.id, {
      max_results: 1,
      'tweet.fields': ['public_metrics']
    });
    
    if (timeline.data?.data?.[0]) {
      console.log('✅ Can access your timeline with Bearer token');
      console.log('   Public metrics:', timeline.data.data[0].public_metrics);
      
      // This won't have private metrics (impressions) but proves API access works
      console.log('⚠️  Note: Bearer token gives public metrics only');
    }
    
  } catch (error) {
    console.log('❌ Bearer token failed:', (error as Error).message);
  }
  
  // Method 2: Try Client Credentials flow (if available)
  console.log('\n2. Testing Client Credentials...');
  try {
    const clientCredentialsClient = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    });
    
    const user = await clientCredentialsClient.v2.userByUsername('twitter');
    console.log('✅ Client credentials work');
    console.log('   Found user:', user.data.username);
    
  } catch (error) {
    console.log('❌ Client credentials failed:', (error as Error).message);
  }
}

testOAuth2(); 