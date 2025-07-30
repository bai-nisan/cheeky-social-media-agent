import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

async function debugScheduledSearch() {
  console.log('🔍 DEBUG: Scheduled Search Step-by-Step');
  console.log('========================================\n');

  // Step 1: Environment Check
  console.log('📋 Step 1: Environment Variables');
  console.log('Bearer Token Present:', !!process.env.TWITTER_BEARER_TOKEN);
  console.log('Bearer Token Length:', process.env.TWITTER_BEARER_TOKEN?.length || 0);
  console.log('Bearer Token Starts With AAAA:', process.env.TWITTER_BEARER_TOKEN?.startsWith('AAAAAAAA') || false);
  console.log('');

  // Step 2: API Client Setup
  console.log('🔌 Step 2: Twitter API Client');
  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '');
  console.log('Client Created: ✅');
  console.log('');

  // Step 3: Test Single Account Access
  console.log('👤 Step 3: Testing Single Account (@dillionverma)');
  try {
    const user = await client.v2.userByUsername('dillionverma');
    console.log('✅ User found:', user.data.username, 'ID:', user.data.id);
    
    const timeline = await client.v2.userTimeline(user.data.id, {
      max_results: 3,
      'tweet.fields': ['created_at', 'public_metrics']
    });
    
    console.log('✅ Timeline accessed:', timeline.data?.data?.length || 0, 'tweets');
    
    if (timeline.data?.data && timeline.data.data.length > 0) {
      const tweet = timeline.data.data[0];
      console.log('   Latest tweet:');
      console.log('   - ID:', tweet.id);
      console.log('   - Text:', tweet.text?.substring(0, 100) + '...');
      console.log('   - Created:', tweet.created_at);
      console.log('   - Likes:', tweet.public_metrics?.like_count);
    }
  } catch (error) {
    console.log('❌ Account test failed:', (error as Error).message);
  }
  console.log('');

  // Step 4: Test Keyword Search
  console.log('🔍 Step 4: Testing Keyword Search');
  try {
    const searchResult = await client.v2.search('AI development', {
      max_results: 3,
      'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
      'user.fields': ['username'],
      expansions: ['author_id']
    });
    
    console.log('✅ Search completed:', searchResult.data?.data?.length || 0, 'results');
    
    if (searchResult.data?.data && searchResult.data.data.length > 0) {
      const tweet = searchResult.data.data[0];
      const author = searchResult.includes?.users?.find(u => u.id === tweet.author_id);
      
      console.log('   First result:');
      console.log('   - ID:', tweet.id);
      console.log('   - Author:', author?.username || 'unknown');
      console.log('   - Text:', tweet.text?.substring(0, 100) + '...');
    }
  } catch (error) {
    console.log('❌ Search test failed:', (error as Error).message);
    if ((error as Error).message.includes('429')) {
      console.log('   This is likely a rate limit - expected if we ran tests recently');
    }
  }
  console.log('');

  // Step 5: Test Cache Directory
  console.log('📁 Step 5: Testing Cache Directory');
  const cacheDir = join(process.cwd(), 'cache');
  const cacheFile = join(cacheDir, 'reply-opps.json');
  
  console.log('Cache directory path:', cacheDir);
  console.log('Cache directory exists:', existsSync(cacheDir));
  console.log('Cache file exists:', existsSync(cacheFile));
  
  if (existsSync(cacheFile)) {
    try {
      const cacheContent = JSON.parse(readFileSync(cacheFile, 'utf-8'));
      console.log('✅ Cache file is valid JSON');
      console.log('   Generated at:', cacheContent.generated_at);
      console.log('   Opportunities count:', cacheContent.count);
      console.log('   Actual opportunities:', cacheContent.opportunities?.length || 0);
    } catch (error) {
      console.log('❌ Cache file is invalid JSON:', (error as Error).message);
    }
  }
  console.log('');

  // Step 6: Manual Mini-Search
  console.log('🧪 Step 6: Manual Mini-Search (1 account, 1 keyword)');
  const opportunities = [];
  
  // Try one account
  try {
    const user = await client.v2.userByUsername('bentossell');
    const timeline = await client.v2.userTimeline(user.data.id, {
      max_results: 2,
      'tweet.fields': ['created_at', 'public_metrics']
    });
    
    if (timeline.data?.data) {
      for (const tweet of timeline.data.data) {
        opportunities.push({
          id: tweet.id,
          url: `https://x.com/bentossell/status/${tweet.id}`,
          text: tweet.text?.substring(0, 100) + '...',
          author: 'bentossell',
          source: 'account_check'
        });
      }
    }
    console.log('✅ Account check added', timeline.data?.data?.length || 0, 'opportunities');
  } catch (error) {
    console.log('⚠️ Account check skipped:', (error as Error).message);
  }
  
  console.log('');
  console.log('📊 Final Debug Results:');
  console.log('Opportunities found:', opportunities.length);
  opportunities.forEach((opp, i) => {
    console.log(`${i + 1}. ${opp.author}: ${opp.text}`);
    console.log(`   URL: ${opp.url}`);
  });

  console.log('\n🎯 Debug Complete!');
  return opportunities;
}

// Run debug if called directly
debugScheduledSearch().catch(console.error);

export { debugScheduledSearch }; 