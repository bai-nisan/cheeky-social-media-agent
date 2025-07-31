import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';

interface EnhancedTweetOpportunity {
  id: string;
  url: string;
  text: string;
  author_username: string;
  author_category: string;
  created_at: string;
  public_metrics: any;
  relevance_reason: string;
  relevance_score: number;
  reply_angle: string;
  hours_old: number;
  source_type: 'signal_booster' | 'ai_peer' | 'keyword_search';
}

interface OpportunityCache {
  generated_at: string;
  last_updated: string;
  total_count: number;
  opportunities: EnhancedTweetOpportunity[];
  search_stats: any;
}

function loadOpportunities(): OpportunityCache | null {
  const cacheDir = join(process.cwd(), 'cache');
  const filePath = join(cacheDir, 'reply-opps.json');
  
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    return data;
  } catch (error) {
    console.log('❌ No opportunities cache found. Run enhanced search first.');
    console.log('   Command: tsx scripts/enhanced-reply-search.ts');
    return null;
  }
}

function formatEngagementMetrics(metrics: any): string {
  const likes = metrics?.like_count || 0;
  const retweets = metrics?.retweet_count || 0;
  const replies = metrics?.reply_count || 0;
  const total = likes + retweets + replies;
  
  return `💫 ${total} total (${likes}❤️ ${retweets}🔄 ${replies}💬)`;
}

function formatTimeAgo(hoursOld: number): string {
  if (hoursOld < 1) return '< 1h ago';
  if (hoursOld < 24) return `${hoursOld}h ago`;
  const days = Math.floor(hoursOld / 24);
  return `${days}d ${hoursOld % 24}h ago`;
}

function displayOpportunities(opportunities: EnhancedTweetOpportunity[], maxCount: number = 10): void {
  console.log(`\n🎯 Top ${Math.min(opportunities.length, maxCount)} Reply Opportunities:`);
  console.log('=' .repeat(80));
  
  opportunities.slice(0, maxCount).forEach((opp, i) => {
    const number = `${i + 1}`.padStart(2, ' ');
    const score = `${opp.relevance_score}/10`;
    const timeAgo = formatTimeAgo(opp.hours_old);
    const engagement = formatEngagementMetrics(opp.public_metrics);
    
    console.log(`\n${number}. @${opp.author_username} • ${opp.author_category} • Score: ${score} • ${timeAgo}`);
    console.log(`    ${engagement}`);
    console.log(`    🔗 ${opp.url}`);
    console.log(`    💭 "${opp.text.substring(0, 120)}${opp.text.length > 120 ? '...' : ''}"`);
    console.log(`    💡 Reply Angle: ${opp.reply_angle}`);
    console.log(`    🎯 Why Relevant: ${opp.relevance_reason}`);
  });
}

function showStats(cache: OpportunityCache): void {
  const opps = cache.opportunities;
  
  // Count by source type
  const signalBoosters = opps.filter(o => o.source_type === 'signal_booster').length;
  const aiPeers = opps.filter(o => o.source_type === 'ai_peer').length;
  const keywordFinds = opps.filter(o => o.source_type === 'keyword_search').length;
  
  // Count by recency
  const last6h = opps.filter(o => o.hours_old < 6).length;
  const last24h = opps.filter(o => o.hours_old < 24).length;
  const last72h = opps.filter(o => o.hours_old < 72).length;
  
  // Score distribution
  const highScore = opps.filter(o => o.relevance_score >= 8).length;
  const medScore = opps.filter(o => o.relevance_score >= 6 && o.relevance_score < 8).length;
  const lowScore = opps.filter(o => o.relevance_score < 6).length;
  
  console.log('\n📊 Opportunity Statistics:');
  console.log('=' .repeat(50));
  console.log(`🎯 Total Opportunities: ${cache.total_count}`);
  console.log(`📅 Last Updated: ${new Date(cache.last_updated).toLocaleString()}`);
  console.log('');
  console.log('📍 Sources:');
  console.log(`   🎯 Signal Boosters: ${signalBoosters}`);
  console.log(`   🤝 AI Marketing Peers: ${aiPeers}`);
  console.log(`   🔍 Keyword Discoveries: ${keywordFinds}`);
  console.log('');
  console.log('⏰ Recency:');
  console.log(`   🔥 Last 6 hours: ${last6h}`);
  console.log(`   📝 Last 24 hours: ${last24h}`);
  console.log(`   📚 Last 72 hours: ${last72h}`);
  console.log('');
  console.log('⭐ Relevance Scores:');
  console.log(`   🏆 High (8-10): ${highScore}`);
  console.log(`   📈 Medium (6-7): ${medScore}`);
  console.log(`   📊 Lower (<6): ${lowScore}`);
}

function showFilteredOpportunities(opportunities: EnhancedTweetOpportunity[], filter: string): void {
  let filtered: EnhancedTweetOpportunity[] = [];
  let title = '';
  
  switch (filter.toLowerCase()) {
    case 'fresh':
    case 'recent':
      filtered = opportunities.filter(o => o.hours_old < 6);
      title = '🔥 Fresh Opportunities (Last 6 Hours)';
      break;
      

      
    case 'peers':
    case 'ai':
      filtered = opportunities.filter(o => o.source_type === 'ai_peer');
      title = '🤝 AI Marketing Peer Opportunities';
      break;
      
    case 'keywords':
    case 'keyword':
      filtered = opportunities.filter(o => o.source_type === 'keyword_search');
      title = '🔍 Keyword Discovery Opportunities';
      break;
      
    case 'high':
    case 'best':
      filtered = opportunities.filter(o => o.relevance_score >= 8);
      title = '🏆 High-Relevance Opportunities (8-10 Score)';
      break;
      
    case 'dillion':
    case 'priority':
      filtered = opportunities.filter(o => o.author_username === 'dillionverma');
      title = '⭐ Dillion Verma (TOP Priority Account)';
      break;
      
    case 'signal':
    case 'boosters':
      filtered = opportunities.filter(o => o.source_type === 'signal_booster');
      title = '🎯 Signal Booster Opportunities (Your Main Targets)';
      break;
      
    default:
      // Search by username or keyword in text
      const searchTerm = filter.toLowerCase();
      filtered = opportunities.filter(o => 
        o.author_username.toLowerCase().includes(searchTerm) ||
        o.text.toLowerCase().includes(searchTerm) ||
        o.author_category.toLowerCase().includes(searchTerm)
      );
      title = `🔍 Search Results for "${filter}"`;
  }
  
  console.log(`\n${title}`);
  console.log(`Found ${filtered.length} opportunities`);
  
  if (filtered.length > 0) {
    displayOpportunities(filtered);
  } else {
    console.log('No opportunities found matching that filter.');
    console.log('\nAvailable filters: fresh, signal, peers, keywords, high, dillion, or search terms');
  }
}

function showUsage(): void {
  console.log('\n🚀 Reply Opportunity Viewer');
  console.log('=' .repeat(40));
  console.log('Usage: tsx scripts/view-reply-opportunities.ts [filter]');
  console.log('');
  console.log('Filters:');
  console.log('  (no filter)  - Show top 10 opportunities (Signal Boosters prioritized)');
  console.log('  all          - Show all opportunities');
  console.log('  stats        - Show statistics');
  console.log('  fresh        - Last 6 hours only');
  console.log('  signal       - Signal Boosters only (YOUR MAIN TARGETS)');
  console.log('  peers        - AI Marketing Peers only');
  console.log('  keywords     - Keyword discoveries only (lower priority)');
  console.log('  high         - High relevance (8-10) only');
  console.log('  dillion      - @dillionverma posts only (TOP PRIORITY)');
  console.log('  <search>     - Search by username/content');
  console.log('');
  console.log('Examples:');
  console.log('  tsx scripts/view-reply-opportunities.ts signal    # BEST opportunities');
  console.log('  tsx scripts/view-reply-opportunities.ts dillion   # TOP priority account');
  console.log('  tsx scripts/view-reply-opportunities.ts fresh     # Recent posts');
  console.log('  tsx scripts/view-reply-opportunities.ts paulroetzer # Specific influencer');
  console.log('  tsx scripts/view-reply-opportunities.ts high      # High relevance only');
}

function main(): void {
  const args = process.argv.slice(2);
  const filter = args.join(' ').trim();
  
  if (filter === 'help' || filter === '--help' || filter === '-h') {
    showUsage();
    return;
  }
  
  const cache = loadOpportunities();
  if (!cache) return;
  
  const opportunities = cache.opportunities;
  
  if (filter === 'stats') {
    showStats(cache);
    return;
  }
  
  if (filter === 'all') {
    console.log(`\n📋 All ${opportunities.length} Reply Opportunities:`);
    displayOpportunities(opportunities, opportunities.length);
    return;
  }
  
  if (filter === '' || !filter) {
    console.log(`\n🎯 Welcome to Your Daily Reply Opportunities!`);
    console.log(`📊 Total: ${cache.total_count} opportunities available`);
    console.log(`📅 Updated: ${new Date(cache.last_updated).toLocaleString()}`);
    displayOpportunities(opportunities, 10);
    
    console.log('\n💡 Best Actions for Twitter Growth:');
    console.log('  • tsx scripts/view-reply-opportunities.ts signal   (YOUR MAIN TARGETS 🎯)');
    console.log('  • tsx scripts/view-reply-opportunities.ts dillion  (TOP priority account ⭐)');
    console.log('  • tsx scripts/view-reply-opportunities.ts fresh    (recent opportunities)');
    console.log('  • tsx scripts/view-reply-opportunities.ts stats    (performance analytics)');
    return;
  }
  
  // Apply filter
  showFilteredOpportunities(opportunities, filter);
}

// Auto-run when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { loadOpportunities, displayOpportunities }; 