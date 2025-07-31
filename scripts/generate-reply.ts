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

// Gal's preferred reply patterns based on his style preferences
const REPLY_PATTERNS = {
  DIRECT_OPENERS: [
    "This.",
    "Exactly.",
    "100%.",
    "Facts.",
    "So true.",
  ],
  
  PERSONAL_EXPERIENCE_STARTERS: [
    "I've seen",
    "I've noticed", 
    "I've experienced",
    "I've built",
    "I've worked with",
    "I've found",
    "I've learned",
  ],
  
  TECHNICAL_INSIGHTS: [
    "Most people focus on X but ignore Y",
    "The real challenge isn't X, it's Y",
    "Everyone talks about X but misses Y",
    "People obsess over X but ignore Y",
    "The gap between X and Y is where the magic happens",
  ],
  
  CONVERSATION_ENDERS: [
    "What's been your experience?",
    "Have you seen this too?",
    "Curious about your take.",
    "What patterns have you noticed?",
    "Would love to hear your thoughts.",
  ]
};

function generatePersonalizedReply(opportunity: EnhancedTweetOpportunity): string[] {
  const tweetText = opportunity.text.toLowerCase();
  const authorCategory = opportunity.author_category;
  
  // Analyze the tweet for YOUR specific niches - EXPANDED KEYWORDS
  const isAboutAIDevelopment = tweetText.includes('ai development') || tweetText.includes('ai dev') || tweetText.includes('building with ai') || tweetText.includes('cursor') || tweetText.includes('claude') || tweetText.includes('langchain') || tweetText.includes('ml') || tweetText.includes('machine learning') || tweetText.includes('development workflow') || tweetText.includes('ai system');
  const isAboutAIMarketing = tweetText.includes('ai marketing') || tweetText.includes('marketing automation') || tweetText.includes('content automation') || tweetText.includes('social media ai') || tweetText.includes('ai content');
  const isAboutAIAgents = tweetText.includes('ai agents') || tweetText.includes('ai agent') || tweetText.includes('agents') || tweetText.includes('agentic') || tweetText.includes('autonomous') || tweetText.includes('multi-agent') || tweetText.includes('agent workflow');
  const isAboutVibeMarketing = tweetText.includes('vibe marketing') || tweetText.includes('vibes') || tweetText.includes('authentic marketing') || tweetText.includes('brand vibes') || tweetText.includes('emotional marketing');
  const isAboutVibeCoding = tweetText.includes('vibe coding') || tweetText.includes('developer experience') || tweetText.includes('coding vibes') || tweetText.includes('dx') || tweetText.includes('dev vibes');
  const isAboutEcommerce = tweetText.includes('ecommerce') || tweetText.includes('e-commerce') || tweetText.includes('retail') || tweetText.includes('commerce') || tweetText.includes('shopify') || tweetText.includes('ai commerce');
  const isAboutChallenge = tweetText.includes('challenge') || tweetText.includes('problem') || tweetText.includes('difficult') || tweetText.includes('struggle') || tweetText.includes('obstacle');
  const isAboutTools = tweetText.includes('ai tools') || tweetText.includes('prompt engineering') || tweetText.includes('productivity') || tweetText.includes('automation') || tweetText.includes('workflow') || tweetText.includes('automat') || tweetText.includes('tool');
  
  const replies: string[] = [];
  
  // Pattern 1: AI Development Replies
  if (isAboutAIDevelopment) {
    replies.push(
      `This. I've built AI agents with Cursor and the real game-changer isn't the tool itself—it's understanding how to prompt effectively and iterate quickly.`
    );
    
    replies.push(
      `Exactly. Most people obsess over perfect LangChain setups but ignore user feedback. I've seen 'perfect' AI systems fail because real users behave nothing like training assumptions.`
    );
    
    replies.push(
      `100%. Building with Claude has taught me that the magic is in the conversation flow design, not just the model choice. Context management is everything.`
    );
  }
  
  // Pattern 2: AI Marketing Replies  
  if (isAboutAIMarketing) {
    replies.push(
      `This. I've built social media automation systems and learned that the human review step is where the magic happens. AI drafts, humans add soul.`
    );
    
    replies.push(
      `Exactly. Everyone talks about scaling content creation but ignores distribution strategy. I've seen amazing AI-generated content get zero engagement because posting ≠ marketing.`
    );
  }
  
  // Pattern 3: AI Agents Replies
  if (isAboutAIAgents) {
    replies.push(
      `This. I've built multi-agent systems and the hardest part isn't the tech—it's designing the human-in-the-loop interrupts. People want control, not black boxes.`
    );
    
    replies.push(
      `100%. Most agentic AI fails because teams focus on autonomous capabilities but ignore the collaboration patterns. Agents should augment decisions, not replace them.`
    );
  }
  
  // Pattern 4: AI Tools & Productivity
  if (isAboutTools) {
    replies.push(
      `So true. I've noticed developers spend 80% of time switching between AI tools and 20% actually building. The productivity gain comes from workflow integration, not feature counts.`
    );
    
    replies.push(
      `Exactly. I've found that AI tools amplify existing workflows—if your process is messy, AI just makes it messier faster. Clean workflow first, then automate.`
    );
  }
  
  // Pattern 5: Challenge/Problem Solving
  if (isAboutChallenge) {
    replies.push(
      `This. Most AI development challenges aren't technical—they're about understanding user behavior and designing appropriate guardrails. I've seen this in my agent work.`
    );
  }
  
  // Pattern 6: Vibe Marketing Replies
  if (isAboutVibeMarketing) {
    replies.push(
      `This. I've found that vibe marketing beats feature marketing every time. People connect with energy and authenticity, not bullet points. The best AI tools feel human.`
    );
    
    replies.push(
      `Exactly. Traditional marketing feels robotic now. I've seen AI companies win by focusing on the vibe—how their tool makes developers feel, not just what it does.`
    );
  }
  
  // Pattern 7: Vibe Coding Replies  
  if (isAboutVibeCoding) {
    replies.push(
      `100%. I've noticed the best code comes from good vibes—when developers feel flow, creativity, and ownership. Tools that enhance the vibe, not just productivity, win.`
    );
    
    replies.push(
      `This. Developer experience isn't just about speed—it's about that feeling when everything clicks. I've seen teams choose "slower" tools because they felt better to use.`
    );
  }
  
  // Pattern 8: E-commerce AI Replies
  if (isAboutEcommerce) {
    replies.push(
      `This. I've built AI automation for e-commerce and the magic isn't in replacing humans—it's in amplifying what they're already good at. Personalization at scale with soul.`
    );
    
    replies.push(
      `Exactly. Most e-commerce AI fails because it optimizes for metrics, not relationships. I've seen simple AI that maintains the human touch outperform complex systems.`
    );
  }
  
  // Pattern 2: Industry-specific insights based on author category
  if (authorCategory.includes('Marketing')) {
    replies.push(
      `This. I've seen marketing teams automate content creation but still manually distribute. The real efficiency comes from end-to-end automation with strategic human checkpoints.`
    );
  }
  
  if (authorCategory.includes('Developer') || authorCategory.includes('AI')) {
    replies.push(
      `Exactly. I've noticed most AI projects fail not because of technical limitations but because of poor prompt engineering and unrealistic expectations about model capabilities.`
    );
  }
  
  // Pattern 3: Conversation starters
  if (opportunity.relevance_score >= 8) {
    replies.push(
      `This resonates. I've experienced similar challenges building AI marketing agents. The gap between demo and production is where most projects die. What's been your biggest obstacle?`
    );
  }
  
  // Pattern 4: Technical takes for high-engagement posts
  if (opportunity.public_metrics?.like_count > 50) {
    replies.push(
      `100%. The real challenge isn't building AI tools—it's designing the human-AI interaction patterns. I've found that users want to feel in control, not replaced.`
    );
  }
  
  // Pattern 5: Dillion-specific replies (priority account)
  if (opportunity.author_username === 'dillionverma') {
    replies.push(
      `This. I've been using Cursor for agent development and the biggest win isn't the AI suggestions—it's how it maintains context across file edits. Game changer for complex projects.`
    );
    
    replies.push(
      `Exactly. Building with Claude via Cursor has completely changed my development flow. The real magic is in the iterative refinement, not the initial generation.`
    );
  }
  
  // If no specific patterns match, create a general thoughtful reply
  if (replies.length === 0) {
    replies.push(
      `This. I've seen this pattern in AI development too—the surface solution looks obvious but the implementation details are where complexity hides. What's been your experience?`
    );
    
    replies.push(
      `Exactly. I've found that most AI challenges aren't technical—they're about understanding user behavior and designing appropriate guardrails. Have you seen this too?`
    );
  }
  
  return replies;
}

function loadOpportunityById(tweetId: string): EnhancedTweetOpportunity | null {
  const cacheDir = join(process.cwd(), 'cache');
  const filePath = join(cacheDir, 'reply-opps.json');
  
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    return data.opportunities.find((opp: any) => opp.id === tweetId) || null;
  } catch (error) {
    console.log('❌ No opportunities cache found. Run enhanced search first.');
    return null;
  }
}

function displayTweetContext(opportunity: EnhancedTweetOpportunity): void {
  console.log('\n📝 Tweet Context:');
  console.log('=' .repeat(60));
  console.log(`👤 @${opportunity.author_username} (${opportunity.author_category})`);
  console.log(`⭐ Relevance: ${opportunity.relevance_score}/10`);
  console.log(`⏰ Posted: ${opportunity.hours_old}h ago`);
  console.log(`🔗 URL: ${opportunity.url}`);
  console.log(`\n💭 Tweet: "${opportunity.text}"`);
  console.log(`\n💡 Suggested Angle: ${opportunity.reply_angle}`);
  console.log(`🎯 Why Relevant: ${opportunity.relevance_reason}`);
}

function displayReplyOptions(replies: string[]): void {
  console.log('\n✨ Generated Reply Options (Gal\'s Style):');
  console.log('=' .repeat(60));
  
  replies.forEach((reply, i) => {
    console.log(`\n${i + 1}. ${reply}`);
    console.log(`   ${reply.length} characters`);
  });
  
  console.log('\n💡 Style Elements Used:');
  console.log('✅ Direct opener ("This.", "Exactly.")');
  console.log('✅ Personal experience ("I\'ve seen...", "I\'ve built...")');
  console.log('✅ Clear insight with specific context');
  console.log('✅ Natural, conversational tone');
  console.log('✅ Avoids corporate/LLM language');
}

function showUsage(): void {
  console.log('\n🚀 Reply Generator for Gal\'s Twitter Style');
  console.log('=' .repeat(50));
  console.log('Usage: tsx scripts/generate-reply.ts <tweet-id>');
  console.log('');
  console.log('Find tweet IDs using: tsx scripts/view-reply-opportunities.ts');
  console.log('');
  console.log('Example:');
  console.log('  tsx scripts/generate-reply.ts 1234567890123456789');
  console.log('');
  console.log('Style Guidelines Applied:');
  console.log('• Direct and personal openers');
  console.log('• Include personal experience');
  console.log('• Concise and natural language');
  console.log('• Conversational, not corporate');
  console.log('• Clear insights with specific context');
}

function main(): void {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
    showUsage();
    return;
  }
  
  const tweetId = args[0];
  const opportunity = loadOpportunityById(tweetId);
  
  if (!opportunity) {
    console.log(`❌ Tweet ID "${tweetId}" not found in opportunities cache.`);
    console.log('\nFind available tweet IDs using:');
    console.log('tsx scripts/view-reply-opportunities.ts');
    return;
  }
  
  // Display the tweet context
  displayTweetContext(opportunity);
  
  // Generate reply options
  const replies = generatePersonalizedReply(opportunity);
  displayReplyOptions(replies);
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Copy your preferred reply');
  console.log('2. Paste and post on Twitter');
  console.log('3. Track engagement for future optimization');
  
  console.log('\n💡 Pro Tips:');
  console.log('• Edit replies to add more personal details');
  console.log('• Consider timing - engage when author is likely online');
  console.log('• Follow up on replies that get engagement');
}

// Auto-run when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generatePersonalizedReply, displayTweetContext }; 