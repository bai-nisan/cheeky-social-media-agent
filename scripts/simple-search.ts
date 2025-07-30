import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Priority accounts to check
const PRIORITY_ACCOUNTS = [
  'paulroetzer', 'dillionverma', 'bentossell', 'HaroldSinnott', 'antgrasso'
];

async function simpleSearch() {
  console.log('🔍 Simple Search (Working Around API Limitations)');
  console.log('================================================\n');

  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '');
  const opportunities = [];

  // What we CAN do: Get user information
  console.log('👥 Checking Priority Accounts:');
  
  for (const username of PRIORITY_ACCOUNTS.slice(0, 3)) { // Just test 3 accounts
    try {
      const user = await client.v2.userByUsername(username, {
        'user.fields': ['public_metrics', 'description']
      });
      
      console.log(`✅ @${username}: ${user.data.public_metrics?.followers_count || 0} followers`);
      
      // Create a "manual check" opportunity
      opportunities.push({
        id: `manual_check_${Date.now()}_${username}`,
        url: `https://x.com/${username}`,
        text: `Check recent posts from @${username} (${user.data.public_metrics?.followers_count || 0} followers)`,
        author_username: username,
        created_at: new Date().toISOString(),
        public_metrics: { manual_check: true },
        relevance_reason: `Priority account with ${user.data.public_metrics?.followers_count || 0} followers`
      });
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`⚠️ @${username}: ${(error as Error).message}`);
    }
  }

  // Create cache directory
  const cacheDir = join(process.cwd(), 'cache');
  try {
    mkdirSync(cacheDir, { recursive: true });
    console.log('✅ Cache directory created');
  } catch (error) {
    console.log('✅ Cache directory exists');
  }

  // Save results
  const output = {
    generated_at: new Date().toISOString(),
    count: opportunities.length,
    note: "Limited functionality due to API restrictions. Manual checking required.",
    opportunities: opportunities
  };

  const filePath = join(cacheDir, 'reply-opps.json');
  writeFileSync(filePath, JSON.stringify(output, null, 2));
  
  console.log(`\n💾 Saved ${opportunities.length} opportunities to ${filePath}`);
  console.log('\n📋 Manual Action Required:');
  console.log('1. Visit the URLs below');
  console.log('2. Look for recent posts (last 24 hours)');
  console.log('3. Identify reply opportunities');
  console.log('');
  
  opportunities.forEach((opp, i) => {
    console.log(`${i + 1}. ${opp.url} (${opp.relevance_reason})`);
  });

  return opportunities;
}

// Run the simple search
simpleSearch().catch(console.error); 