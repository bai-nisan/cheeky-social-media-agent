import { MetricoolClient } from './metricool-client.js';

interface ScheduledPost {
  id?: string;
  content: string;
  scheduledTime: string;
  platform: 'linkedin';
  blogId: string;
  status: 'scheduled' | 'published' | 'failed';
  mediaUrls?: string[];
  hashtags?: string[];
}

interface PostSchedulingOptions {
  content: string;
  scheduledTime: Date;
  mediaUrls?: string[];
  hashtags?: string[];
  blogId?: string;
}

class MetricoolPostScheduler {
  private client: MetricoolClient;
  private defaultBlogId: string = '5103233'; // Gal's LinkedIn brand ID

  constructor() {
    this.client = new MetricoolClient();
  }

  /**
   * Schedule a LinkedIn post using Metricool
   * Note: This is exploratory - we need to investigate actual Metricool post scheduling endpoints
   */
  async scheduleLinkedInPost(options: PostSchedulingOptions): Promise<any> {
    console.log('🚀 Attempting to schedule LinkedIn post via Metricool...\n');

    const {
      content,
      scheduledTime,
      mediaUrls = [],
      hashtags = [],
      blogId = this.defaultBlogId
    } = options;

    console.log(`📝 Content: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
    console.log(`⏰ Scheduled for: ${scheduledTime.toLocaleString()}`);
    console.log(`📱 Platform: LinkedIn`);
    console.log(`🏢 Blog ID: ${blogId}`);
    
    if (mediaUrls.length > 0) {
      console.log(`🖼️  Media URLs: ${mediaUrls.join(', ')}`);
    }
    
    if (hashtags.length > 0) {
      console.log(`#️⃣ Hashtags: ${hashtags.join(' ')}`);
    }

    // Based on research, Metricool likely has post scheduling endpoints
    // These are common patterns for social media management APIs
    const possibleEndpoints = [
      '/v1/posts/schedule',
      '/v2/content/schedule',
      '/api/posts/create',
      '/scheduler/posts',
      '/social/linkedin/schedule'
    ];

    console.log('\n🔍 Exploring potential Metricool scheduling endpoints...\n');

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`🧪 Testing endpoint: ${endpoint}`);
        
        const postData = {
          content,
          platform: 'linkedin',
          blogId,
          scheduledTime: scheduledTime.toISOString(),
          mediaUrls,
          hashtags,
          // Common fields for social media scheduling
          status: 'scheduled',
          publishAt: Math.floor(scheduledTime.getTime() / 1000), // Unix timestamp
          socialNetworks: ['linkedin'],
          accounts: [blogId]
        };

        // Access private method through any for testing
        const response = await (this.client as any).makeRequest(endpoint, postData, 'POST');
        
        if (response) {
          console.log(`✅ SUCCESS! Found working endpoint: ${endpoint}`);
          console.log(`📄 Response:`, JSON.stringify(response, null, 2));
          return {
            success: true,
            endpoint,
            postId: response.id || response.postId || 'unknown',
            response
          };
        }
        
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log('\n⚠️  No working scheduling endpoints found in exploration.');
    console.log('💡 This could mean:');
    console.log('   1. Metricool scheduling requires different authentication');
    console.log('   2. Endpoints use different naming conventions');
    console.log('   3. Scheduling is done through the web interface only');
    console.log('   4. API access requires specific permissions\n');

    return {
      success: false,
      message: 'Post scheduling endpoints not accessible with current API setup'
    };
  }

  /**
   * Check scheduled posts status
   */
  async getScheduledPosts(blogId: string = this.defaultBlogId): Promise<any> {
    console.log('📅 Checking for scheduled posts...\n');

    const possibleEndpoints = [
      '/v1/posts/scheduled',
      '/v2/content/scheduled',
      '/api/posts/pending',
      '/scheduler/posts/list',
      '/social/linkedin/scheduled'
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`🔍 Checking: ${endpoint}`);
        
        const params = {
          blogId,
          platform: 'linkedin',
          status: 'scheduled',
          limit: 50
        };

        const response = await (this.client as any).makeRequest(endpoint, params);
        
        if (response && Array.isArray(response)) {
          console.log(`✅ Found ${response.length} scheduled posts`);
          return response;
        }
        
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return [];
  }

  /**
   * Investigate Metricool's posting capabilities through available endpoints
   */
  async investigatePostingCapabilities(): Promise<void> {
    console.log('🔍 INVESTIGATING METRICOOL POSTING CAPABILITIES\n');
    console.log('═'.repeat(60));

    // Test 1: Check current brands and permissions
    console.log('\n📊 STEP 1: Checking account capabilities');
    console.log('─'.repeat(40));
    
    try {
      const brands = await this.client.getBrands();
      console.log(`✅ Connected to ${brands.length} brand(s)`);
      
      brands.forEach((brand: any, index: number) => {
        console.log(`\n   Brand ${index + 1}:`);
        console.log(`   📛 Name: ${brand.label}`);
        console.log(`   🆔 ID: ${brand.id}`);
        console.log(`   🔗 LinkedIn URN: ${brand.linkedinCompany || 'Not connected'}`);
        console.log(`   📅 Connected: ${new Date(brand.firstConnectionDate).toLocaleDateString()}`);
      });
    } catch (error) {
      console.log(`❌ Could not fetch brands: ${error}`);
    }

    // Test 2: Explore common social media management endpoints
    console.log('\n\n🌐 STEP 2: Exploring social media management endpoints');
    console.log('─'.repeat(40));

    const commonEndpoints = [
      // Content management
      '/v1/content',
      '/v2/posts',
      '/api/social/posts',
      '/content/library',
      
      // Scheduling
      '/scheduler',
      '/v1/scheduler/posts',
      '/calendar',
      '/publish',
      
      // Account management
      '/accounts',
      '/social-accounts',
      '/platforms',
      
      // Media
      '/media',
      '/upload',
      '/assets'
    ];

    for (const endpoint of commonEndpoints) {
      try {
        const response = await (this.client as any).makeRequest(endpoint, {});
        console.log(`✅ ${endpoint}: Accessible (${JSON.stringify(response).length} chars)`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (errorMsg.includes('404')) {
          console.log(`❓ ${endpoint}: Not found`);
        } else if (errorMsg.includes('403') || errorMsg.includes('401')) {
          console.log(`🔒 ${endpoint}: Access denied`);
        } else {
          console.log(`❌ ${endpoint}: ${errorMsg}`);
        }
      }
    }

    // Test 3: Check API documentation hints
    console.log('\n\n📚 STEP 3: API insights and recommendations');
    console.log('─'.repeat(40));
    
    console.log('💡 Based on investigation:');
    console.log('   • Metricool API is primarily analytics-focused');
    console.log('   • Post scheduling likely requires web interface');
    console.log('   • Consider these alternatives for automated posting:');
    console.log('     - LinkedIn native Posts API');
    console.log('     - Buffer API');
    console.log('     - Hootsuite API');
    console.log('     - Sprout Social API');
    
    console.log('\n🎯 RECOMMENDED APPROACH FOR GAL:');
    console.log('   1. Use Metricool for analytics and insights');
    console.log('   2. Use LinkedIn Posts API for automated posting');
    console.log('   3. Combine both for comprehensive social media strategy');

    console.log('\n' + '═'.repeat(60));
  }

  /**
   * Generate sample posts for scheduling
   */
  generateSamplePosts(): PostSchedulingOptions[] {
    const now = new Date();
    
    return [
      {
        content: "🚀 Excited to share insights from my latest AI development project! The future of artificial intelligence is not just about algorithms - it's about creating meaningful solutions that enhance human productivity. What trends are you seeing in AI development? #AIDeveoper #TechInnovation #ProductivyHacks",
        scheduledTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        hashtags: ['#AIDeveloper', '#TechInnovation', '#ProductivyHacks']
      },
      {
        content: "Building effective AI agents requires more than just technical skills - it's about understanding user needs and creating intuitive experiences. Here's what I've learned from 6 months of agent development... 🧵 Thread below 👇",
        scheduledTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        hashtags: ['#AIAgents', '#UserExperience', '#TechThread']
      },
      {
        content: "Just published a comprehensive guide on integrating multiple AI tools into a cohesive workflow. The key is not using more tools, but using them smarter. Link in comments! What's your biggest challenge with AI tool integration?",
        scheduledTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        hashtags: ['#AIWorkflow', '#Productivity', '#TechGuide']
      }
    ];
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    const scheduler = new MetricoolPostScheduler();

    switch (command) {
      case 'schedule':
        console.log('📝 METRICOOL POST SCHEDULING TEST\n');
        
        const samplePosts = scheduler.generateSamplePosts();
        
        for (let i = 0; i < samplePosts.length; i++) {
          console.log(`\n--- Scheduling Post ${i + 1} ---`);
          const result = await scheduler.scheduleLinkedInPost(samplePosts[i]);
          
          if (result.success) {
            console.log(`🎉 Post ${i + 1} scheduled successfully!`);
            console.log(`📋 Post ID: ${result.postId}`);
          } else {
            console.log(`💔 Post ${i + 1} scheduling failed`);
          }
          
          console.log(''); // Space between posts
        }
        break;

      case 'check':
        console.log('📋 CHECKING SCHEDULED POSTS\n');
        const scheduled = await scheduler.getScheduledPosts();
        
        if (scheduled.length > 0) {
          console.log(`Found ${scheduled.length} scheduled posts:`);
          scheduled.forEach((post: any, index: number) => {
            console.log(`\n${index + 1}. ${post.content?.substring(0, 50)}...`);
            console.log(`   ⏰ Scheduled: ${post.scheduledTime}`);
            console.log(`   📊 Status: ${post.status}`);
          });
        } else {
          console.log('No scheduled posts found.');
        }
        break;

      case 'investigate':
      case 'explore':
        await scheduler.investigatePostingCapabilities();
        break;

      default:
        console.log('🔧 Metricool Post Scheduler Commands:');
        console.log('');
        console.log('   yarn tsx linkedin-growth-plan/scripts/metricool-post-scheduler.ts schedule');
        console.log('     → Test post scheduling functionality');
        console.log('');
        console.log('   yarn tsx linkedin-growth-plan/scripts/metricool-post-scheduler.ts check');
        console.log('     → Check for scheduled posts');
        console.log('');
        console.log('   yarn tsx linkedin-growth-plan/scripts/metricool-post-scheduler.ts investigate');
        console.log('     → Explore Metricool posting capabilities');
        console.log('');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Export for use in other scripts
export { MetricoolPostScheduler, type PostSchedulingOptions, type ScheduledPost };

// Run CLI if executed directly
if (require.main === module) {
  main();
} 