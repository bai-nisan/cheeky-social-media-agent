import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';

async function testBasicAuth() {
  console.log('🧪 Testing basic authentication...\n');
  
  // Test 1: Bearer token (app-only) - should work
  console.log('1. Testing Bearer token...');
  const bearerClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '');
  
  try {
    const search = await bearerClient.v2.search('hello', { max_results: 1 });
    console.log('✅ Bearer token works - found', search.data?.data?.length || 0, 'tweets');
  } catch (error) {
    console.log('❌ Bearer token failed:', (error as Error).message);
    return;
  }
  
  // Test 2: Simple user lookup
  console.log('\n2. Testing user lookup with Bearer token...');
  try {
    const user = await bearerClient.v2.userByUsername('GalKimron');
    console.log('✅ User lookup works - ID:', user.data.id);
  } catch (error) {
    console.log('❌ User lookup failed:', (error as Error).message);
  }
  
  // Test 3: Try your timeline with Bearer token (public data only)
  console.log('\n3. Testing timeline access...');
  try {
    const user = await bearerClient.v2.userByUsername('GalKimron');
    const timeline = await bearerClient.v2.userTimeline(user.data.id, {
      max_results: 1,
      'tweet.fields': ['public_metrics']
    });
    console.log('✅ Timeline works - found', timeline.data?.data?.length || 0, 'tweets');
    
    const tweet = timeline.data?.data?.[0];
    if (tweet) {
      console.log('   Public metrics:', tweet.public_metrics);
    }
  } catch (error) {
    console.log('❌ Timeline failed:', (error as Error).message);
  }
}

testBasicAuth(); 