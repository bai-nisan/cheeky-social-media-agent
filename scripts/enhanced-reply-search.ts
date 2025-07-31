import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';
import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// PRIORITY 1: Signal Boosters (Your main networking targets)
const SIGNAL_BOOSTERS = [
  { username: 'dillionverma', category: 'AI Developer Priority', relevance: 'TOP PRIORITY - AI development and building tools', priority: 1 },
  { username: 'paulroetzer', category: 'AI Marketing Expert', relevance: 'Industry leader - AI marketing strategy and insights', priority: 1 },
  { username: 'bernardmarr', category: 'Tech Futurist', relevance: 'Influential - AI trends and business intelligence', priority: 1 },
  { username: 'bentossell', category: 'AI Tools Expert', relevance: 'High value - AI tool discovery and productivity', priority: 1 },
  { username: 'HaroldSinnott', category: 'AI Consultant', relevance: 'Strategic - Enterprise AI implementation', priority: 2 },
  { username: 'antgrasso', category: 'Digital Innovation', relevance: 'Thought leader - AI transformation', priority: 2 },
  { username: 'YuHelenYu', category: 'AI Ethics Expert', relevance: 'Authority - Responsible AI development', priority: 2 },
  { username: 'alliekmiller', category: 'AI Leader', relevance: 'Executive - AI product development', priority: 2 },
];

// PRIORITY 2: AI Marketing Peers (Secondary networking value)  
const AI_MARKETING_PEERS = [
  { username: 'DataChaz', category: 'Data Expert', relevance: 'Analytics expert - Data-driven marketing insights', priority: 3 },
  { username: 'hasantoxr', category: 'AI Developer', relevance: 'Technical peer - AI development implementation', priority: 3 },
  { username: 'madzadev', category: 'Developer Advocate', relevance: 'Community leader - Developer tools and AI', priority: 3 },
  { username: 'ThorHartvigsen', category: 'AI Researcher', relevance: 'Academic - NLP and AI research', priority: 3 },
  { username: 'ammaar', category: 'AI Builder', relevance: 'Builder - AI applications and tools', priority: 3 },
  { username: 'heyBarsee', category: 'Tech Content', relevance: 'Educator - Technical content creation', priority: 4 },
  { username: 'FrancescoD_Ales', category: 'AI Researcher', relevance: 'Research - AI insights and analysis', priority: 4 },
  { username: 'TamaraMcCleary', category: 'Tech Influencer', relevance: 'Influencer - AI adoption in enterprise', priority: 4 },
];

// Targeted keywords for YOUR specific niches
const KEYWORD_SEARCHES = [
  // AI Development focused
  { query: 'AI development OR "building with AI" OR "AI tools"', context: 'AI Development - Your core expertise' },
  { query: 'LangChain OR LangGraph OR "AI agents"', context: 'AI Agents - Your specialized area' },
  { query: 'Cursor OR Claude OR "prompt engineering"', context: 'AI Development Tools - Your tech stack' },
  
  // AI Marketing focused  
  { query: 'AI marketing OR "marketing automation"', context: 'AI Marketing - Your business application area' },
  { query: '"content automation" OR "social media AI"', context: 'AI Marketing Automation - Your product space' },
  
  // AI Agents focused
  { query: '"agentic AI" OR "autonomous agents" OR "multi-agent"', context: 'AI Agents - Your technical specialization' },
  
  // Vibe Marketing focused
  { query: '"vibe marketing" OR "brand vibes" OR "authentic marketing"', context: 'Vibe Marketing - Your unique approach' },
  
  // Vibe Coding focused
  { query: '"vibe coding" OR "developer experience" OR "coding vibes"', context: 'Vibe Coding - Your development philosophy' },
  
  // E-commerce AI focused  
  { query: '"ecommerce AI" OR "AI commerce" OR "retail AI"', context: 'E-commerce AI - Your business application' },
];

interface EnhancedTweetOpportunity {
  id: string;
  url: string;
  text: string;
  author_username: string;
  author_category: string;
  created_at: string;
  public_metrics: any;
  relevance_reason: string;
  relevance_score: number; // 1-10 scoring
  reply_angle: string; // Suggested approach for reply
  hours_old: number;
  source_type: 'signal_booster' | 'ai_peer' | 'keyword_search';
}

interface OpportunityCache {
  generated_at: string;
  last_updated: string;
  total_count: number;
  opportunities: EnhancedTweetOpportunity[];
  search_stats: {
    signal_boosters_checked: number;
    ai_peers_checked: number;
    keyword_searches: number;
    time_window_hours: number;
  };
}

async function getExistingCache(): Promise<OpportunityCache> {
  const cacheDir = join(process.cwd(), 'cache');
  const filePath = join(cacheDir, 'reply-opps.json');
  
  try {
    const existing = JSON.parse(readFileSync(filePath, 'utf8'));
    return existing;
  } catch {
    return {
      generated_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      total_count: 0,
      opportunities: [],
      search_stats: {
        signal_boosters_checked: 0,
        ai_peers_checked: 0,
        keyword_searches: 0,
        time_window_hours: 72
      }
    };
  }
}

function calculateRelevanceScore(tweet: any, author: any, context: string, sourceType: string, authorPriority?: number): number {
  let score = 3; // Lower base score for non-signal boosters
  
  // PRIORITY BOOST: Signal Boosters get massive boost
  if (sourceType === 'signal_booster') {
    score = 7; // High base for signal boosters
    if (authorPriority === 1) score += 2; // Top priority accounts
    if (authorPriority === 2) score += 1; // High priority accounts
  } else if (sourceType === 'ai_peer') {
    score = 5; // Medium base for AI peers
  } else {
    score = 3; // Low base for keyword discoveries
  }
  
  // Engagement boost (smaller impact than before)
  const metrics = tweet.public_metrics || {};
  const engagement = (metrics.like_count || 0) + (metrics.retweet_count || 0) + (metrics.reply_count || 0);
  
  if (engagement > 100) score += 1;
  else if (engagement > 50) score += 0.5;
  
  // Recency boost (smaller impact)
  const hoursOld = (Date.now() - new Date(tweet.created_at).getTime()) / (1000 * 60 * 60);
  if (hoursOld < 6) score += 1;
  else if (hoursOld < 24) score += 0.5;
  
  // Niche relevance boost for YOUR specific expertise areas
  const text = tweet.text.toLowerCase();
  const yourNicheKeywords = [
    // AI Development
    'ai development', 'ai dev', 'cursor', 'claude', 'langchain', 'langgraph', 'building with ai', 'ai tools', 'prompt engineering',
    // AI Marketing  
    'ai marketing', 'marketing automation', 'content automation', 'ai content', 'social media ai', 'marketing ai',
    // AI Agents
    'ai agents', 'ai agent', 'agents', 'autonomous', 'agentic', 'multi-agent', 'agent workflow', 'agent development',
    // Vibe Marketing
    'vibe marketing', 'vibes', 'authentic marketing', 'brand vibes', 'emotional marketing', 'vibe-based',
    // Vibe Coding  
    'vibe coding', 'coding vibes', 'developer experience', 'dx', 'coding culture', 'dev vibes',
    // E-commerce with AI
    'ecommerce ai', 'e-commerce ai', 'ai ecommerce', 'shopify ai', 'ai commerce', 'retail ai', 'commerce automation'
  ];
  const nicheMatches = yourNicheKeywords.filter(kw => text.includes(kw)).length;
  
  // Bigger boost for signal boosters posting about your niche
  if (sourceType === 'signal_booster' && nicheMatches > 0) {
    score += Math.min(nicheMatches * 1.5, 3);
  } else {
    score += Math.min(nicheMatches, 1);
  }
  
  return Math.min(Math.round(score), 10);
}

function generateReplyAngle(tweet: any, authorCategory: string): string {
  const text = tweet.text.toLowerCase();
  
  // AI Development angle
  if (text.includes('ai development') || text.includes('building with ai') || text.includes('cursor') || text.includes('claude')) {
    return "Share your AI development experience with Cursor/Claude/LangChain";
  } 
  // AI Agents angle
  else if (text.includes('agents') || text.includes('agentic') || text.includes('autonomous') || text.includes('langchain')) {
    return "Share insights from building AI agents and automation systems";
  }
  // Vibe Marketing angle
  else if (text.includes('vibe marketing') || text.includes('vibes') || text.includes('authentic marketing') || text.includes('brand vibes')) {
    return "Share your vibe marketing approach and authentic brand building insights";
  }
  // Vibe Coding angle
  else if (text.includes('vibe coding') || text.includes('developer experience') || text.includes('coding vibes') || text.includes('dx')) {
    return "Share your vibe coding philosophy and developer experience insights";
  }
  // E-commerce AI angle
  else if (text.includes('ecommerce') || text.includes('e-commerce') || text.includes('retail') || text.includes('commerce')) {
    return "Connect to your e-commerce AI automation and retail technology experience";
  }
  // AI Marketing angle  
  else if (text.includes('marketing') || text.includes('content') || text.includes('automation')) {
    return "Connect to your AI marketing automation and social media agent work";
  }
  // AI Tools angle
  else if (text.includes('ai tools') || text.includes('productivity') || text.includes('prompt')) {
    return "Share your AI development tools and prompt engineering expertise";
  }
  // Problem-solving angle
  else if (text.includes('challenge') || text.includes('problem') || text.includes('difficult')) {
    return "Share how you've solved similar challenges in AI development/marketing";
  }
  // Future/trends angle
  else if (text.includes('future') || text.includes('trend') || text.includes('innovation')) {
    return "Connect to trends you're seeing in AI development and marketing";
  } 
  // General expertise angle
  else {
    return "Share relevant insights from your AI development, marketing, agents, or vibe work";
  }
}

async function searchAccountTimeline(
  client: TwitterApi, 
  account: { username: string; category: string; relevance: string; priority?: number },
  timeWindowHours: number = 72
): Promise<EnhancedTweetOpportunity[]> {
  
  const opportunities: EnhancedTweetOpportunity[] = [];
  
  try {
    console.log(`🔍 Checking @${account.username} (${account.category})...`);
    
    const user = await client.v2.userByUsername(account.username);
    const timeline = await client.v2.userTimeline(user.data.id, {
      exclude: ['replies'],
      max_results: 10, // Get more tweets per account
      'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
      'user.fields': ['username']
    });
    
    if (timeline.data?.data) {
      for (const tweet of timeline.data.data) {
        const tweetAge = Date.now() - new Date(tweet.created_at || '').getTime();
        const hoursOld = tweetAge / (1000 * 60 * 60);
        
        // Extended time window
        if (hoursOld < timeWindowHours) {
          const sourceType = account.category.includes('Priority') ? 'signal_booster' : 'ai_peer';
          const relevanceScore = calculateRelevanceScore(tweet, user.data, account.relevance, sourceType, account.priority);
          
          // Lower threshold for signal boosters (5+), higher for others (6+)
          const threshold = sourceType === 'signal_booster' ? 5 : 6;
          if (relevanceScore >= threshold) {
            opportunities.push({
              id: tweet.id,
              url: `https://x.com/${account.username}/status/${tweet.id}`,
              text: tweet.text || '',
              author_username: account.username,
              author_category: account.category,
              created_at: tweet.created_at || '',
              public_metrics: tweet.public_metrics,
              relevance_reason: `${account.relevance} - Score: ${relevanceScore}/10`,
              relevance_score: relevanceScore,
              reply_angle: generateReplyAngle(tweet, account.category),
              hours_old: Math.round(hoursOld),
              source_type: sourceType
            });
          }
        }
      }
    }
    
    // Rate limiting - be nice to the API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    console.log(`⚠️  Skipped @${account.username}:`, (error as Error).message);
  }
  
  return opportunities;
}

async function searchKeywords(
  client: TwitterApi, 
  keyword: { query: string; context: string }
): Promise<EnhancedTweetOpportunity[]> {
  
  const opportunities: EnhancedTweetOpportunity[] = [];
  
  try {
    console.log(`🔍 Searching for "${keyword.query}"...`);
    
    const searchResults = await client.v2.search(keyword.query, {
      max_results: 15,
      'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
      'user.fields': ['username'],
      expansions: ['author_id']
    });
    
    if (searchResults.data?.data) {
      for (const tweet of searchResults.data.data) {
        const author = searchResults.includes?.users?.find(u => u.id === tweet.author_id);
        const tweetAge = Date.now() - new Date(tweet.created_at || '').getTime();
        const hoursOld = tweetAge / (1000 * 60 * 60);
        
        if (hoursOld < 48) { // 48 hour window for keyword searches
          const relevanceScore = calculateRelevanceScore(tweet, author, keyword.context, 'keyword_search');
          
          // Higher threshold for keyword searches (less valuable)
          if (relevanceScore >= 6) {
            opportunities.push({
              id: tweet.id,
              url: `https://x.com/i/web/status/${tweet.id}`,
              text: tweet.text || '',
              author_username: author?.username || 'unknown',
              author_category: 'Keyword Discovery',
              created_at: tweet.created_at || '',
              public_metrics: tweet.public_metrics,
              relevance_reason: `${keyword.context} - Score: ${relevanceScore}/10`,
              relevance_score: relevanceScore,
              reply_angle: generateReplyAngle(tweet, 'Keyword Discovery'),
              hours_old: Math.round(hoursOld),
              source_type: 'keyword_search'
            });
          }
        }
      }
    }
    
  } catch (error) {
    console.log(`⚠️  Keyword search failed for "${keyword.query}":`, (error as Error).message);
  }
  
  return opportunities;
}

async function runEnhancedSearch(): Promise<void> {
  console.log('🚀 Enhanced Reply Opportunity Search Starting...');
  
  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '');
  const existingCache = await getExistingCache();
  const allOpportunities: EnhancedTweetOpportunity[] = [];
  
  // Remove opportunities older than 5 days to keep cache fresh
  const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000);
  const freshOpportunities = existingCache.opportunities.filter(opp => 
    new Date(opp.created_at).getTime() > fiveDaysAgo
  );
  
  console.log(`📦 Keeping ${freshOpportunities.length} fresh opportunities from cache`);
  
  try {
    // PRIORITY 1: Signal Boosters (Most important - always check top priority)
    console.log('🎯 Searching Signal Boosters (Priority 1)...');
    const topPrioritySignalBoosters = SIGNAL_BOOSTERS.filter(account => account.priority === 1);
    for (const account of topPrioritySignalBoosters.slice(0, 2)) { // Always check 2 top priority
      const opportunities = await searchAccountTimeline(client, account, 72);
      allOpportunities.push(...opportunities);
    }
    
    // PRIORITY 2: Rotate through other Signal Boosters  
    console.log('🎯 Searching Signal Boosters (Priority 2)...');
    const otherSignalBoosters = SIGNAL_BOOSTERS.filter(account => account.priority === 2);
    for (const account of otherSignalBoosters.slice(0, 1)) { // 1 rotating signal booster
      const opportunities = await searchAccountTimeline(client, account, 72);
      allOpportunities.push(...opportunities);
    }
    
    // PRIORITY 3: AI Marketing Peers (Secondary value)
    console.log('🤝 Searching AI Marketing Peers...');
    const topPeers = AI_MARKETING_PEERS.filter(account => account.priority === 3);
    for (const account of topPeers.slice(0, 1)) { // Only 1 peer per run
      const opportunities = await searchAccountTimeline(client, account, 48);
      allOpportunities.push(...opportunities);
    }
    
    // PRIORITY 4: Keyword searches (Filler only - reduced)
    console.log('🔍 Running keyword searches (reduced priority)...');
    const selectedKeywords = KEYWORD_SEARCHES.slice(0, 1); // Only 1 keyword per run
    for (const keyword of selectedKeywords) {
      const opportunities = await searchKeywords(client, keyword);
      allOpportunities.push(...opportunities);
    }
    
  } catch (error) {
    console.log('❌ Search error:', (error as Error).message);
  }
  
  // Combine fresh cache with new opportunities and remove duplicates
  const combinedOpportunities = [...freshOpportunities, ...allOpportunities];
  const uniqueOpportunities = combinedOpportunities.filter((opp, index, self) => 
    index === self.findIndex(o => o.id === opp.id)
  );
  
  // Sort by relevance score (desc) then by recency
  const sortedOpportunities = uniqueOpportunities.sort((a, b) => {
    if (b.relevance_score !== a.relevance_score) {
      return b.relevance_score - a.relevance_score;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  // Save enhanced cache
  const enhancedCache: OpportunityCache = {
    generated_at: existingCache.generated_at,
    last_updated: new Date().toISOString(),
    total_count: sortedOpportunities.length,
    opportunities: sortedOpportunities,
    search_stats: {
      signal_boosters_checked: SIGNAL_BOOSTERS.slice(0, 4).length,
      ai_peers_checked: AI_MARKETING_PEERS.slice(0, 3).length,
      keyword_searches: 2,
      time_window_hours: 72
    }
  };
  
  // Create cache directory and save
  const cacheDir = join(process.cwd(), 'cache');
  mkdirSync(cacheDir, { recursive: true });
  const filePath = join(cacheDir, 'reply-opps.json');
  writeFileSync(filePath, JSON.stringify(enhancedCache, null, 2));
  
  console.log(`✅ Enhanced search completed!`);
  console.log(`📊 Total opportunities: ${sortedOpportunities.length}`);
  console.log(`🆕 New opportunities found: ${allOpportunities.length}`);
  console.log(`💾 Saved to ${filePath}`);
  
  // Show top opportunities
  console.log('\n🏆 Top Reply Opportunities:');
  sortedOpportunities.slice(0, 5).forEach((opp, i) => {
    console.log(`${i + 1}. @${opp.author_username} (${opp.relevance_score}/10) - ${opp.hours_old}h ago`);
    console.log(`   ${opp.text.substring(0, 100)}...`);
    console.log(`   💡 ${opp.reply_angle}`);
    console.log(`   🔗 ${opp.url}\n`);
  });
}

// Auto-run when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runEnhancedSearch().catch(console.error);
}

export { runEnhancedSearch }; 