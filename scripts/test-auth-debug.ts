import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';

async function debugAuth() {
  console.log('🔍 Debugging authentication tokens...\n');
  
  // Check all possible token variations
  const tokenVariations = {
    apiKey: process.env.TWITTER_API_KEY || process.env.TWITTER_API_KEY,
    apiSecret: process.env.TWITTER_API_KEY_SECRET || process.env.TWITTER_API_SECRET,
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
    userToken: process.env.TWITTER_USER_TOKEN,
    userSecret: process.env.TWITTER_USER_TOKEN_SECRET,
  };
  
  console.log('Token status (first 8 chars only):');
  Object.entries(tokenVariations).forEach(([key, value]) => {
    if (value) {
      console.log(`✅ ${key}: ${value.substring(0, 8)}...`);
    } else {
      console.log(`❌ ${key}: Not found`);
    }
  });
  
  // Try authentication with available tokens
  if (tokenVariations.apiKey && tokenVariations.apiSecret && 
      tokenVariations.userToken && tokenVariations.userSecret) {
    
    console.log('\n🧪 Testing authentication...');
    
    const client = new TwitterApi({
      appKey: tokenVariations.apiKey,
      appSecret: tokenVariations.apiSecret,
      accessToken: tokenVariations.userToken,
      accessSecret: tokenVariations.userSecret,
    });
    
    try {
      const me = await client.v2.me();
      console.log('✅ SUCCESS! Authenticated as:', me.data?.username);
      
      // Test private metrics
      const timeline = await client.v2.userTimeline(me.data.id, {
        exclude: ['replies'],
        max_results: 1,
        'tweet.fields': ['public_metrics', 'non_public_metrics']
      });
      
      const tweet = timeline.data?.data?.[0];
      if (tweet?.non_public_metrics) {
        console.log('🎉 PRIVATE METRICS ACCESSIBLE!');
        console.log('Impressions:', tweet.non_public_metrics.impression_count);
      } else {
        console.log('⚠️  Private metrics not available');
      }
      
    } catch (error) {
      console.log('❌ Authentication failed:', (error as Error).message);
    }
  } else {
    console.log('\n❌ Missing required tokens for user authentication');
  }
}

debugAuth(); 