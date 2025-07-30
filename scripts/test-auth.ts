import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';

async function testUserAuth() {
  console.log('Testing user authentication...');
  
  // Check if we have all required tokens
  const requiredTokens = ['TWITTER_API_KEY', 'TWITTER_API_KEY_SECRET', 'TWITTER_USER_TOKEN', 'TWITTER_USER_TOKEN_SECRET'];
  const missing = requiredTokens.filter(token => !process.env[token]);
  
  if (missing.length > 0) {
    console.log('❌ Missing tokens:', missing);
    return;
  }
  
  console.log('✅ All tokens present');
  
  // Create authenticated client
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY || '',
    appSecret: process.env.TWITTER_API_KEY_SECRET || '',
    accessToken: process.env.TWITTER_USER_TOKEN || '',
    accessSecret: process.env.TWITTER_USER_TOKEN_SECRET || '',
  });
  
  try {
    // Test authentication by getting user info
    const me = await client.v2.me();
    console.log('✅ Authenticated as:', me.data?.username);
    
    // Test if we can get private metrics for your latest tweet
    const user = await client.v2.userByUsername('GalKimron');
    const timeline = await client.v2.userTimeline(user.data.id, {
      exclude: ['replies'],
      max_results: 1,
      'tweet.fields': ['public_metrics', 'non_public_metrics']
    });
    
    const tweet = timeline.data?.data?.[0];
    if (tweet) {
      console.log('✅ Latest tweet metrics:');
      console.log('Public:', tweet.public_metrics);
      console.log('Private:', tweet.non_public_metrics);
      
      if (tweet.non_public_metrics) {
        console.log('🎉 SUCCESS: We can access impressions and bookmarks!');
      } else {
        console.log('⚠️  No private metrics - might need elevated permissions');
      }
    }
    
  } catch (error) {
    console.log('❌ Authentication failed:', (error as Error).message);
  }
}

testUserAuth(); 