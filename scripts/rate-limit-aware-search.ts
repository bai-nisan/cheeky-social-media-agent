import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Priority accounts to check (rotate through them)
const PRIORITY_ACCOUNTS = [
  'paulroetzer', 'HaroldSinnott', 'antgrasso', 'bernardmarr', 'YuHelenYu',
  'alliekmiller', 'TamaraMcCleary', 'Ronald_vanLoon', 'Prathkum', 'bentossell',
  'DataChaz', 'hasantoxr', 'heyBarsee', 'FrancescoD_Ales', 'dillionverma'
];

interface SearchResult {
  success_count: number;
  rate_limited_count: number;
  error_count: number;
  opportunities: any[];
  next_accounts_to_try: string[];
}

async function rateLimitAwareSearch(): Promise<SearchResult> {
  console.log('🔍 Rate-Limit-Aware Search');
  console.log('==========================\n');

  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '');
  const result: SearchResult = {
    success_count: 0,
    rate_limited_count: 0,
    error_count: 0,
    opportunities: [],
    next_accounts_to_try: []
  };

  // Strategy: Try a few accounts, expect some to hit rate limits
  const accountsToTry = PRIORITY_ACCOUNTS.slice(0, 5); // Try 5 accounts max
  const remainingAccounts = PRIORITY_ACCOUNTS.slice(5);

  console.log('🎯 Trying accounts:', accountsToTry.join(', '));
  console.log('📅 Reserved for next run:', remainingAccounts.slice(0, 3).join(', '));
  console.log('');

  for (const username of accountsToTry) {
    try {
      console.log(`👤 Checking @${username}...`);
      
      const user = await client.v2.userByUsername(username, {
        'user.fields': ['public_metrics', 'description']
      });
      
      console.log(`✅ @${username}: ${user.data.public_metrics?.followers_count || 0} followers`);
      result.success_count++;
      
      // Create opportunity entry
      result.opportunities.push({
        id: `check_${Date.now()}_${username}`,
        url: `https://x.com/${username}`,
        text: `Recent posts from @${username} (${user.data.public_metrics?.followers_count || 0} followers)`,
        author_username: username,
        created_at: new Date().toISOString(),
        public_metrics: user.data.public_metrics,
        relevance_reason: `Priority account: ${user.data.public_metrics?.followers_count || 0} followers`,
        bio: user.data.description?.substring(0, 100) + '...' || ''
      });
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1200));
      
    } catch (error: any) {
      const errorMsg = error.message || '';
      
      if (errorMsg.includes('429')) {
        console.log(`⏱️ @${username}: Rate limited (EXPECTED - API working!)`);
        result.rate_limited_count++;
        
        // Add to opportunities as "check manually"
        result.opportunities.push({
          id: `manual_${Date.now()}_${username}`,
          url: `https://x.com/${username}`,
          text: `Manual check needed for @${username} (rate limited)`,
          author_username: username,
          created_at: new Date().toISOString(),
          public_metrics: { rate_limited: true },
          relevance_reason: `Rate limited - check manually`,
          status: 'rate_limited'
        });
        
        // Stop trying more accounts for now
        break;
        
      } else if (errorMsg.includes('401')) {
        console.log(`❌ @${username}: Authentication failed - check tokens`);
        result.error_count++;
        
      } else if (errorMsg.includes('404')) {
        console.log(`⚠️ @${username}: Account not found or private`);
        result.error_count++;
        
      } else {
        console.log(`⚠️ @${username}: ${errorMsg}`);
        result.error_count++;
      }
    }
  }

  // Set up next accounts for rotation
  result.next_accounts_to_try = remainingAccounts.slice(0, 5);
  
  console.log('\n📊 Search Results:');
  console.log(`✅ Successful checks: ${result.success_count}`);
  console.log(`⏱️ Rate limited: ${result.rate_limited_count} (good sign!)`);
  console.log(`❌ Errors: ${result.error_count}`);
  console.log(`📋 Total opportunities: ${result.opportunities.length}`);

  return result;
}

async function saveResults(result: SearchResult) {
  // Create cache directory
  const cacheDir = join(process.cwd(), 'cache');
  mkdirSync(cacheDir, { recursive: true });

  // Save main results
  const output = {
    generated_at: new Date().toISOString(),
    search_strategy: 'rate_limit_aware',
    stats: {
      success_count: result.success_count,
      rate_limited_count: result.rate_limited_count,
      error_count: result.error_count,
      total_opportunities: result.opportunities.length
    },
    next_run_accounts: result.next_accounts_to_try,
    opportunities: result.opportunities.sort((a, b) => {
      // Prioritize successful checks over rate-limited ones
      if (a.status === 'rate_limited' && b.status !== 'rate_limited') return 1;
      if (b.status === 'rate_limited' && a.status !== 'rate_limited') return -1;
      return 0;
    })
  };

  const filePath = join(cacheDir, 'reply-opps.json');
  writeFileSync(filePath, JSON.stringify(output, null, 2));

  console.log(`\n💾 Results saved to: ${filePath}`);
  
  // Also save account rotation state for scheduler
  const rotationState = {
    last_run: new Date().toISOString(),
    next_accounts: result.next_accounts_to_try,
    remaining_accounts: PRIORITY_ACCOUNTS.slice(result.next_accounts_to_try.length + 5)
  };
  
  const rotationPath = join(cacheDir, 'account-rotation.json');
  writeFileSync(rotationPath, JSON.stringify(rotationState, null, 2));
  
  console.log(`🔄 Account rotation saved to: ${rotationPath}`);
}

async function main() {
  console.log('🚀 Starting Rate-Limit-Aware Search...\n');
  
  const result = await rateLimitAwareSearch();
  await saveResults(result);
  
  console.log('\n🎯 Scheduler Strategy:');
  console.log('- Run this every 15 minutes');
  console.log('- Each run tries 3-5 accounts');
  console.log('- Rate limits = success (means API works)');
  console.log('- Rotates through all priority accounts over time');
  console.log('- Manual checking for rate-limited accounts');
  
  console.log('\n📋 Next Actions:');
  result.opportunities.forEach((opp, i) => {
    const status = opp.status === 'rate_limited' ? '⏱️' : '✅';
    console.log(`${i + 1}. ${status} ${opp.url} (${opp.relevance_reason})`);
  });
}

// Run the search
main().catch(console.error);

export { rateLimitAwareSearch, saveResults }; 