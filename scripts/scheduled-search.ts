import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Priority accounts to search
const PRIORITY_ACCOUNTS = [
  'paulroetzer', 'HaroldSinnott', 'antgrasso', 'bernardmarr', 'YuHelenYu',
  'alliekmiller', 'TamaraMcCleary', 'Ronald_vanLoon', 'Prathkum', 'bentossell',
  'DataChaz', 'hasantoxr', 'heyBarsee', 'FrancescoD_Ales', 'Ishansharma7390',
  'jspeiser', 'khemaridh', 'thatroblennon', 'andyjankowski', 'sarahburnett',
  'eringriffith', 'madzadev', 'MakadiaHarsh', 'shushant_l', 'imAlfaiz',
  'ammaar', 'ThorHartvigsen', 'Damn_coder', 'ihteshamit', 'GuptaSayujya',
  'dillionverma', // Added your special priority account
];

// Keywords to search for
const KEYWORDS = [
  'AI development',
  'Cursor IDE',
  'AI productivity',
  'building with AI',
];

interface TweetOpportunity {
  id: string;
  url: string;
  text: string;
  author_username: string;
  created_at: string;
  public_metrics: any;
  relevance_reason: string;
}

async function searchForOpportunities(): Promise<TweetOpportunity[]> {
  console.log('🔍 Starting scheduled search...');
  
  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '');
  const opportunities: TweetOpportunity[] = [];
  
  try {
    // Search 1: Recent posts from priority accounts (2-3 accounts per run to avoid rate limits)
    const accountsToCheck = PRIORITY_ACCOUNTS.slice(0, 3); // Rotate through accounts
    
    for (const username of accountsToCheck) {
      try {
        console.log(`Checking @${username}...`);
        
        const user = await client.v2.userByUsername(username);
        const timeline = await client.v2.userTimeline(user.data.id, {
          exclude: ['replies'],
          max_results: 5,
          'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
          'user.fields': ['username']
        });
        
        if (timeline.data?.data) {
          for (const tweet of timeline.data.data.slice(0, 2)) { // Top 2 tweets per account
            // Check if tweet is recent (last 24 hours)
            const tweetAge = Date.now() - new Date(tweet.created_at || '').getTime();
            const hoursOld = tweetAge / (1000 * 60 * 60);
            
            if (hoursOld < 24) { // Only tweets from last 24 hours
              opportunities.push({
                id: tweet.id,
                url: `https://x.com/${username}/status/${tweet.id}`,
                text: tweet.text || '',
                author_username: username,
                created_at: tweet.created_at || '',
                public_metrics: tweet.public_metrics,
                relevance_reason: `Recent post from priority account @${username}`
              });
            }
          }
        }
        
        // Small delay to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`⚠️  Skipped @${username}:`, (error as Error).message);
      }
    }
    
    // Search 2: Keyword search (1 keyword per run)
    const keyword = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
    
    try {
      console.log(`Searching for "${keyword}"...`);
      
      const searchResults = await client.v2.search(keyword, {
        max_results: 10,
        'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
        'user.fields': ['username'],
        expansions: ['author_id']
      });
      
      if (searchResults.data?.data) {
        for (const tweet of searchResults.data.data.slice(0, 3)) { // Top 3 from keyword search
          const author = searchResults.includes?.users?.find(u => u.id === tweet.author_id);
          
          opportunities.push({
            id: tweet.id,
            url: `https://x.com/i/web/status/${tweet.id}`,
            text: tweet.text || '',
            author_username: author?.username || 'unknown',
            created_at: tweet.created_at || '',
            public_metrics: tweet.public_metrics,
            relevance_reason: `Keyword match: "${keyword}"`
          });
        }
      }
      
    } catch (error) {
      console.log(`⚠️  Keyword search failed:`, (error as Error).message);
    }
    
  } catch (error) {
    console.log('❌ Search failed:', (error as Error).message);
  }
  
  console.log(`✅ Found ${opportunities.length} opportunities`);
  return opportunities;
}

async function saveOpportunities(opportunities: TweetOpportunity[]) {
  // Create cache directory if it doesn't exist
  const cacheDir = join(process.cwd(), 'cache');
  try {
    mkdirSync(cacheDir, { recursive: true });
  } catch (error) {
    // Directory probably exists
  }
  
  // Add timestamp and metadata
  const output = {
    generated_at: new Date().toISOString(),
    count: opportunities.length,
    opportunities: opportunities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  };
  
  // Save to cache file
  const filePath = join(cacheDir, 'reply-opps.json');
  writeFileSync(filePath, JSON.stringify(output, null, 2));
  
  console.log(`💾 Saved to ${filePath}`);
}

// Main execution
async function main() {
  console.log(`🚀 Scheduled search started at ${new Date().toISOString()}`);
  
  const opportunities = await searchForOpportunities();
  await saveOpportunities(opportunities);
  
  console.log('✅ Scheduled search completed');
}

// Auto-run when executed directly
main().catch(console.error);

export { main as runScheduledSearch }; 