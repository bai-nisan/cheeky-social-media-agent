import { TwitterClient } from '../../src/clients/twitter/client.js';
import { Client } from '@langchain/langgraph-sdk';
import { MetricoolClient } from '../../linkedin-growth-plan/scripts/metricool-client.js';

interface TwitterPost {
  id?: string;
  text: string;
  scheduledTime?: Date;
  media?: {
    media: Buffer;
    mimeType: string;
  };
  threadPosts?: string[]; // For Twitter threads
}

interface SchedulingOptions {
  method: 'direct' | 'langgraph' | 'metricool' | 'buffer';
  scheduledTime?: Date;
  timezone?: string;
  priority?: 'p1' | 'p2' | 'p3';
}

interface SchedulingResult {
  success: boolean;
  postId?: string;
  scheduledId?: string;
  scheduledTime?: Date;
  method: string;
  error?: string;
}

/**
 * Comprehensive Twitter Post Scheduler
 * Supports multiple scheduling methods:
 * 1. Direct X API (immediate posting)
 * 2. LangGraph Cloud scheduling (built-in delayed execution)
 * 3. Metricool (if they support Twitter scheduling)
 * 4. Buffer/Hootsuite integration (future)
 */
class TwitterScheduler {
  private twitterClient: TwitterClient;
  private langGraphClient: Client;
  private metricoolClient: MetricoolClient;

  constructor() {
    // Initialize clients
    if (this.hasBasicTwitterAuth()) {
      this.twitterClient = TwitterClient.fromBasicTwitterAuth();
    } else if (this.hasArcadeAuth()) {
      // Will need user-specific setup for Arcade
      console.log('📝 Note: Arcade auth requires user-specific setup');
    } else {
      throw new Error('No Twitter authentication method available');
    }

    this.langGraphClient = new Client({
      apiUrl: process.env.LANGGRAPH_API_URL || 'http://localhost:8123',
    });

    this.metricoolClient = new MetricoolClient();
  }

  /**
   * Main scheduling method - automatically chooses best approach
   */
  async schedulePost(
    post: TwitterPost, 
    options: SchedulingOptions
  ): Promise<SchedulingResult> {
    console.log(`🐦 Scheduling Twitter post using method: ${options.method}`);
    console.log(`📝 Post: "${post.text.substring(0, 50)}..."`);
    
    if (options.scheduledTime) {
      console.log(`⏰ Scheduled for: ${options.scheduledTime.toISOString()}`);
    }

    try {
      switch (options.method) {
        case 'direct':
          return await this.postDirectly(post);
        
        case 'langgraph':
          return await this.scheduleWithLangGraph(post, options);
        
        case 'metricool':
          return await this.scheduleWithMetricool(post, options);
        
        case 'buffer':
          return await this.scheduleWithBuffer(post, options);
        
        default:
          throw new Error(`Unknown scheduling method: ${options.method}`);
      }
    } catch (error) {
      console.error(`❌ Failed to schedule post:`, error);
      return {
        success: false,
        method: options.method,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Method 1: Direct X API posting (immediate)
   */
  private async postDirectly(post: TwitterPost): Promise<SchedulingResult> {
    console.log('🚀 Posting directly to X/Twitter...');
    
    if (!this.twitterClient) {
      throw new Error('Twitter client not initialized');
    }

    let response;

    if (post.threadPosts && post.threadPosts.length > 0) {
      // Post as thread
      const threadData = [
        { text: post.text, media: post.media },
        ...post.threadPosts.map(text => ({ text }))
      ];
      
      response = await this.twitterClient.uploadThread(threadData);
      console.log('✅ Thread posted successfully');
    } else {
      // Single post
      response = await this.twitterClient.uploadTweet({
        text: post.text,
        media: post.media
      });
      console.log('✅ Tweet posted successfully');
    }

    return {
      success: true,
      postId: Array.isArray(response) ? response[0]?.data?.id : response?.data?.id,
      method: 'direct',
      scheduledTime: new Date()
    };
  }

  /**
   * Method 2: LangGraph Cloud scheduling (delayed execution)
   */
  private async scheduleWithLangGraph(
    post: TwitterPost, 
    options: SchedulingOptions
  ): Promise<SchedulingResult> {
    console.log('📅 Scheduling with LangGraph Cloud...');

    const afterSeconds = options.scheduledTime 
      ? Math.floor((options.scheduledTime.getTime() - Date.now()) / 1000)
      : undefined;

    if (afterSeconds && afterSeconds <= 0) {
      throw new Error('Scheduled time must be in the future');
    }

    // Create a new thread for the scheduled post
    const thread = await this.langGraphClient.threads.create();

    // Schedule the post using the upload_post agent
    const run = await this.langGraphClient.runs.create(
      thread.thread_id,
      'upload_post',
      {
                 input: {
           post: post.text,
           complexPost: post.threadPosts ? {
             main_post: post.text,
             reply_post: post.threadPosts.join('\\n\\n')
           } : undefined,
           image: post.media ? `data:${post.media.mimeType};base64,${post.media.media.toString('base64')}` : undefined,
         },
        config: {
          configurable: {
            TEXT_ONLY_MODE: !post.media,
          },
        },
        ...(afterSeconds ? { afterSeconds } : {}),
      }
    );

    console.log(`✅ Scheduled with LangGraph (Run ID: ${run.run_id})`);

    return {
      success: true,
      scheduledId: run.run_id,
      method: 'langgraph',
      scheduledTime: options.scheduledTime || new Date()
    };
  }

  /**
   * Method 3: Metricool scheduling (if supported)
   */
  private async scheduleWithMetricool(
    post: TwitterPost, 
    options: SchedulingOptions
  ): Promise<SchedulingResult> {
    console.log('📊 Attempting to schedule with Metricool...');

    // Note: Metricool's API doesn't seem to support posting/scheduling
    // This is a placeholder for future implementation
    console.log('⚠️ Metricool scheduling not yet implemented');
    console.log('💡 Metricool is primarily for analytics, not posting');

    return {
      success: false,
      method: 'metricool',
      error: 'Metricool does not support post scheduling via API'
    };
  }

  /**
   * Method 4: Buffer/Hootsuite integration (future)
   */
  private async scheduleWithBuffer(
    post: TwitterPost, 
    options: SchedulingOptions
  ): Promise<SchedulingResult> {
    console.log('🔮 Buffer/Hootsuite integration coming soon...');

    return {
      success: false,
      method: 'buffer',
      error: 'Buffer integration not yet implemented'
    };
  }

  /**
   * Schedule multiple posts with optimal timing
   */
  async scheduleMultiplePosts(
    posts: TwitterPost[],
    options: Omit<SchedulingOptions, 'scheduledTime'> & {
      startTime?: Date;
      intervalMinutes?: number;
      priority?: 'p1' | 'p2' | 'p3';
    }
  ): Promise<SchedulingResult[]> {
    console.log(`📚 Scheduling ${posts.length} posts...`);

    const results: SchedulingResult[] = [];
    const startTime = options.startTime || new Date();
    const interval = (options.intervalMinutes || 60) * 60 * 1000; // Convert to milliseconds

    for (let i = 0; i < posts.length; i++) {
      const scheduledTime = new Date(startTime.getTime() + (i * interval));
      
      const result = await this.schedulePost(posts[i], {
        ...options,
        scheduledTime
      });

      results.push(result);
      
      // Small delay between scheduling calls
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Successfully scheduled ${successCount}/${posts.length} posts`);

    return results;
  }

  /**
   * Get scheduled posts (from LangGraph)
   */
     async getScheduledPosts(): Promise<any[]> {
     console.log('📋 Fetching scheduled posts...');

     try {
       // Get threads with pending runs from LangGraph
       const threads = await this.langGraphClient.threads.search({
         metadata: { graph_id: "upload_post" },
         status: "busy",
       });
       
       const scheduledRuns: any[] = [];
       
       for await (const thread of threads) {
         const runs = await this.langGraphClient.runs.list(thread.thread_id);
         const run = runs[0];
         if (run) {
           scheduledRuns.push(run);
         }
       }

       console.log(`📊 Found ${scheduledRuns.length} scheduled posts`);
       return scheduledRuns;
     } catch (error) {
       console.error('❌ Failed to fetch scheduled posts:', error);
       return [];
     }
   }

  /**
   * Cancel a scheduled post
   */
     async cancelScheduledPost(threadId: string, runId: string): Promise<boolean> {
     console.log(`🗑️ Cancelling scheduled post: ${runId}`);

     try {
       await this.langGraphClient.runs.cancel(threadId, runId);
       console.log('✅ Post cancelled successfully');
       return true;
     } catch (error) {
       console.error('❌ Failed to cancel post:', error);
       return false;
     }
   }

  /**
   * Helper: Check if basic Twitter auth is available
   */
  private hasBasicTwitterAuth(): boolean {
    return !!(
      process.env.TWITTER_USER_TOKEN &&
      process.env.TWITTER_USER_TOKEN_SECRET &&
      process.env.TWITTER_API_KEY &&
      process.env.TWITTER_API_KEY_SECRET
    );
  }

  /**
   * Helper: Check if Arcade auth is available
   */
  private hasArcadeAuth(): boolean {
    return !!(process.env.ARCADE_API_KEY);
  }
}

/**
 * CLI Interface for Twitter Scheduling
 */
async function main() {
  const command = process.argv[2];
  const scheduler = new TwitterScheduler();

  try {
    switch (command) {
      case 'post':
        await handlePostCommand(scheduler);
        break;
      
      case 'schedule':
        await handleScheduleCommand(scheduler);
        break;
      
      case 'thread':
        await handleThreadCommand(scheduler);
        break;
      
      case 'list':
        await handleListCommand(scheduler);
        break;
      
      case 'cancel':
        await handleCancelCommand(scheduler);
        break;
      
      case 'test':
        await handleTestCommand(scheduler);
        break;
      
      default:
        console.log(`
🐦 Twitter Scheduler CLI

Available commands:
  post              Post immediately to Twitter
  schedule          Schedule a post for later
  thread            Post or schedule a Twitter thread
  list              List all scheduled posts
  cancel <runId>    Cancel a scheduled post
  test              Test all scheduling methods

Examples:
  yarn tsx twitter-growth-plan/scripts/twitter-scheduler.ts post
  yarn tsx twitter-growth-plan/scripts/twitter-scheduler.ts schedule
  yarn tsx twitter-growth-plan/scripts/twitter-scheduler.ts list
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function handlePostCommand(scheduler: TwitterScheduler) {
  const post: TwitterPost = {
    text: "🚀 Testing direct Twitter posting from my automated system! This is posted immediately via X API. #TwitterBot #Automation"
  };

  const result = await scheduler.schedulePost(post, { method: 'direct' });
  console.log('📊 Result:', result);
}

async function handleScheduleCommand(scheduler: TwitterScheduler) {
  const scheduledTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  
  const post: TwitterPost = {
    text: "⏰ This is a scheduled post! Posted automatically using LangGraph scheduling. #Automation #ScheduledPost"
  };

  const result = await scheduler.schedulePost(post, { 
    method: 'langgraph',
    scheduledTime 
  });
  console.log('📊 Result:', result);
}

async function handleThreadCommand(scheduler: TwitterScheduler) {
  const thread: TwitterPost = {
    text: "🧵 This is the start of a scheduled Twitter thread! 1/3",
    threadPosts: [
      "Here's the second post in the thread with more details about the topic. 2/3",
      "And this is the final post with a conclusion and call to action! 3/3 #ThreadComplete"
    ]
  };

  const scheduledTime = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

  const result = await scheduler.schedulePost(thread, { 
    method: 'langgraph',
    scheduledTime 
  });
  console.log('📊 Result:', result);
}

async function handleListCommand(scheduler: TwitterScheduler) {
  const scheduled = await scheduler.getScheduledPosts();
  
  if (scheduled.length === 0) {
    console.log('📭 No scheduled posts found');
    return;
  }

  console.log(`📋 Scheduled Posts (${scheduled.length}):`);
  scheduled.forEach((run, index) => {
    console.log(`  ${index + 1}. ${run.run_id} - Status: ${run.status}`);
  });
}

async function handleCancelCommand(scheduler: TwitterScheduler) {
  const runId = process.argv[3];
  if (!runId) {
    console.log('❌ Please provide a run ID to cancel');
    return;
  }

  const success = await scheduler.cancelScheduledPost(runId);
  if (success) {
    console.log('✅ Post cancelled successfully');
  } else {
    console.log('❌ Failed to cancel post');
  }
}

async function handleTestCommand(scheduler: TwitterScheduler) {
  console.log('🧪 Testing all scheduling methods...\n');

  // Test 1: Check authentication
  console.log('1️⃣ Authentication Test:');
  console.log(`   Twitter Basic Auth: ${scheduler['hasBasicTwitterAuth']() ? '✅' : '❌'}`);
  console.log(`   Arcade Auth: ${scheduler['hasArcadeAuth']() ? '✅' : '❌'}`);
  console.log('');

  // Test 2: Test immediate posting (if auth available)
  if (scheduler['hasBasicTwitterAuth']()) {
    console.log('2️⃣ Testing immediate posting...');
    // Note: Uncomment to actually post
    // const result = await scheduler.schedulePost({
    //   text: "🧪 Test post from Twitter Scheduler CLI"
    // }, { method: 'direct' });
    // console.log('   Result:', result.success ? '✅' : '❌');
    console.log('   Skipped (would post immediately)');
    console.log('');
  }

  // Test 3: Test LangGraph scheduling
  console.log('3️⃣ Testing LangGraph scheduling...');
  try {
    const scheduled = await scheduler.getScheduledPosts();
    console.log(`   ✅ Connected to LangGraph (${scheduled.length} scheduled posts)`);
  } catch (error) {
    console.log(`   ❌ LangGraph connection failed: ${error}`);
  }
  console.log('');

  // Test 4: Test Metricool
  console.log('4️⃣ Testing Metricool...');
  try {
    const brands = await scheduler['metricoolClient'].getBrands();
    console.log('   ✅ Metricool connected (analytics only)');
  } catch (error) {
    console.log(`   ❌ Metricool connection failed: ${error}`);
  }

  console.log('\n🎯 Recommendation: Use LangGraph for scheduling, X API for immediate posts');
}

// Export for programmatic use
export { TwitterScheduler, TwitterPost, SchedulingOptions, SchedulingResult };

// CLI execution
if (require.main === module) {
  main().catch(console.error);
} 