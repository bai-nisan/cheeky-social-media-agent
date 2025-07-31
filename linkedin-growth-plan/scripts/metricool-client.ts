import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env file
try {
  require('dotenv').config({ path: join(process.cwd(), '.env') });
} catch (error) {
  // dotenv not available, continue without it
  console.log('📝 Note: dotenv not available, using system environment variables');
}

// Metricool API Configuration
interface MetricoolConfig {
  token: string;
  userId: string;
  baseUrl: string;
}

interface LinkedInPost {
  id: string;
  text: string;
  publishedDate: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  url: string;
}

interface PostAnalytics {
  totalPosts: number;
  totalImpressions: number;
  totalEngagement: number;
  averageEngagementRate: number;
  topPosts: LinkedInPost[];
  bestPostingTimes: { hour: number; day: string; avgEngagement: number }[];
}

class MetricoolClient {
  private config: MetricoolConfig;

  constructor() {
    // Load config from environment variables (from .env file in project root)
    console.log('🔍 Debug: Checking environment variables...');
    console.log('🔍 METRICOOL_USER_TOKEN exists:', !!process.env.METRICOOL_USER_TOKEN);
    console.log('🔍 METRICOOL_USER_ID exists:', !!process.env.METRICOOL_USER_ID);
    
    this.config = {
      token: process.env.METRICOOL_USER_TOKEN || '',
      userId: process.env.METRICOOL_USER_ID || '',
      baseUrl: 'https://app.metricool.com/api'
    };

    if (!this.config.token) {
      throw new Error('METRICOOL_USER_TOKEN not found. Add it to your .env file');
    }
    
    if (!this.config.userId) {
      console.log('⚠️  METRICOOL_USER_ID not set - will try without it...');
    }
  }

  /**
   * Get LinkedIn brands/accounts connected to Metricool
   */
  async getBrands(): Promise<any> {
    // Based on Metricool API docs, use simpleProfiles endpoint
    // This endpoint requires userId but not blogId since we're getting the list of brands
    const endpoint = `/admin/simpleProfiles`;
    
    try {
      console.log(`🔍 Trying Metricool simpleProfiles endpoint: ${endpoint}`);
      const response = await this.makeRequest(endpoint);
      console.log(`✅ Successfully connected to Metricool API!`);
      return response;
    } catch (error) {
      console.log(`❌ Failed with simpleProfiles endpoint:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Get LinkedIn analytics for a specific brand
   */
  async getLinkedInAnalytics(blogId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    // Based on Metricool API documentation patterns
    const endpoint = `/v2/analytics/posts/linkedin`;
    
    // Default to last 30 days if no dates provided
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const params: any = {
      blogId,
      from: dateFrom || thirtyDaysAgo.toISOString().split('T')[0], // YYYY-MM-DD format
      to: dateTo || today.toISOString().split('T')[0], // YYYY-MM-DD format
    };
    
    try {
      console.log(`📊 Fetching LinkedIn analytics using official pattern: ${endpoint}`);
      const response = await this.makeRequest(endpoint, params);
      console.log(`✅ LinkedIn analytics retrieved successfully!`);
      return response;
    } catch (error) {
      console.log(`❌ Failed to get LinkedIn analytics:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Get LinkedIn followers timeline based on API documentation pattern
   */
  async getLinkedInFollowersTimeline(blogId: string, start?: string, end?: string): Promise<any> {
    // From Swagger: /stats/timeline/inFollowers with YYYYMMDD format
    const endpoint = `/stats/timeline/inFollowers`;
    
    // Default to last 30 days if no dates provided
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const params: any = {
      blogId,
      start: start || thirtyDaysAgo.toISOString().slice(0, 10).replace(/-/g, ''), // YYYYMMDD format
      end: end || today.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD format
    };
    
    try {
      console.log(`📈 Fetching LinkedIn followers timeline: ${endpoint}`);
      const response = await this.makeRequest(endpoint, params);
      console.log(`✅ LinkedIn followers timeline retrieved successfully!`);
      return response;
    } catch (error) {
      console.log(`❌ Failed to get LinkedIn followers timeline:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Get LinkedIn posts performance using correct Swagger endpoint
   */
  async getLinkedInPosts(blogId: string, start?: string, end?: string, sortColumn?: string): Promise<any> {
    // From Swagger: /stats/linkedin/posts with YYYYMMDD format
    const endpoint = `/stats/linkedin/posts`;
    
    // Default to last 30 days if no dates provided
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const params: any = {
      blogId,
      start: start || thirtyDaysAgo.toISOString().slice(0, 10).replace(/-/g, ''), // YYYYMMDD format
      end: end || today.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD format
    };
    
    if (sortColumn) {
      params.sortcolumn = sortColumn; // likes, clicks, impressions, engagement, comments
    }
    
    try {
      console.log(`📝 Fetching LinkedIn posts from Swagger endpoint: ${endpoint}`);
      console.log(`📅 Date range: ${params.start} to ${params.end}`);
      const response = await this.makeRequest(endpoint, params);
      console.log(`✅ LinkedIn posts retrieved successfully!`);
      return response;
    } catch (error) {
      console.log(`❌ Failed to get LinkedIn posts:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Get best posting times for LinkedIn
   */
  async getBestPostingTimes(blogId: number): Promise<any> {
    try {
      const response = await this.makeRequest('/best-time-to-post', {
        blog_id: blogId,
        social_network: 'linkedin'
      });
      return response;
    } catch (error) {
      console.error('Error fetching best posting times:', error);
      return null;
    }
  }

  /**
   * Analyze LinkedIn performance and generate insights
   */
  async analyzeLinkedInPerformance(blogId: number, days: number = 30): Promise<PostAnalytics> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const posts = await this.getLinkedInPosts(blogId, startDate, endDate);
    
    if (posts.length === 0) {
      return {
        totalPosts: 0,
        totalImpressions: 0,
        totalEngagement: 0,
        averageEngagementRate: 0,
        topPosts: [],
        bestPostingTimes: []
      };
    }

    // Calculate analytics
    const totalImpressions = posts.reduce((sum, post) => sum + post.impressions, 0);
    const totalEngagement = posts.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0);
    const averageEngagementRate = posts.reduce((sum, post) => sum + post.engagementRate, 0) / posts.length;

    // Get top performing posts
    const topPosts = posts
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, 5);

    // Analyze posting times (simplified)
    const bestPostingTimes = this.analyzePostingTimes(posts);

    return {
      totalPosts: posts.length,
      totalImpressions,
      totalEngagement,
      averageEngagementRate,
      topPosts,
      bestPostingTimes
    };
  }

  /**
   * Generate content recommendations based on performance data
   */
  async generateContentRecommendations(blogId: number): Promise<string[]> {
    const analytics = await this.analyzeLinkedInPerformance(blogId);
    const recommendations: string[] = [];

    if (analytics.topPosts.length > 0) {
      const topPost = analytics.topPosts[0];
      recommendations.push(`Your best performing post had ${topPost.engagementRate.toFixed(1)}% engagement. Similar content: "${topPost.text.substring(0, 100)}..."`);
    }

    if (analytics.averageEngagementRate > 0) {
      recommendations.push(`Your average engagement rate is ${analytics.averageEngagementRate.toFixed(1)}%. Posts above this threshold tend to perform well.`);
    }

    if (analytics.bestPostingTimes.length > 0) {
      const bestTime = analytics.bestPostingTimes[0];
      recommendations.push(`Best posting time: ${bestTime.day} at ${bestTime.hour}:00 (${bestTime.avgEngagement.toFixed(1)}% avg engagement)`);
    }

    return recommendations;
  }

  /**
   * Save analytics data locally for future reference
   */
  async saveAnalyticsData(blogId: number): Promise<void> {
    const analytics = await this.analyzeLinkedInPerformance(blogId);
    const cacheDir = join(process.cwd(), 'linkedin-growth-plan', 'cache');
    
    // Create cache directory if it doesn't exist
    try {
      const fs = await import('fs');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating cache directory:', error);
    }

    const data = {
      generatedAt: new Date().toISOString(),
      blogId,
      analytics,
      lastUpdated: new Date().toISOString()
    };

    const filePath = join(cacheDir, 'linkedin-analytics.json');
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Analytics data saved to ${filePath}`);
  }

  /**
   * Test all available LinkedIn metrics from Swagger specification
   */
  async testAllLinkedInMetrics(blogId: string): Promise<void> {
    // All LinkedIn metrics from Swagger spec
    const linkedinMetrics = [
      'inFollowers',
      'inPaidFollowers', 
      'inCompanyImpressions',
      'inPosts',
      'inCliks', // This appears to be "Clicks" in the API
      'inPostsLikes',
      'inComments'
    ];

    console.log('🔍 Testing all LinkedIn metrics available for your profile...\n');

    for (const metric of linkedinMetrics) {
      try {
        console.log(`📊 Testing: ${metric}`);
        const endpoint = `/stats/timeline/${metric}`;
        
        // Use last 30 days
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const params = {
          blogId,
          start: thirtyDaysAgo.toISOString().slice(0, 10).replace(/-/g, ''),
          end: today.toISOString().slice(0, 10).replace(/-/g, '')
        };
        
        const response = await this.makeRequest(endpoint, params);
        
        if (response && response.length > 0) {
          console.log(`✅ ${metric}: Found ${response.length} data points`);
          // Show a sample of the data
          console.log(`   Sample: ${JSON.stringify(response.slice(0, 2))}`);
        } else {
          console.log(`⭕ ${metric}: No data available`);
        }
        
      } catch (error) {
        console.log(`❌ ${metric}: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      console.log(''); // Empty line for readability
    }
  }

  /**
   * Test LinkedIn followers with different date ranges
   */
  async testFollowersWithDateRanges(blogId: string): Promise<void> {
    console.log('🔍 Testing LinkedIn followers with different date ranges...\n');

    const testRanges = [
      {
        name: 'Last 7 days',
        days: 7
      },
      {
        name: 'Last 30 days', 
        days: 30
      },
      {
        name: 'Last 90 days',
        days: 90
      },
      {
        name: 'Since January 1, 2025',
        start: '20250101',
        end: new Date().toISOString().slice(0, 10).replace(/-/g, '')
      }
    ];

    for (const range of testRanges) {
      try {
        console.log(`📅 Testing: ${range.name}`);
        
        let start, end;
        
        if (range.start && range.end) {
          start = range.start;
          end = range.end;
        } else {
          const today = new Date();
          const startDate = new Date(today.getTime() - (range.days! * 24 * 60 * 60 * 1000));
          start = startDate.toISOString().slice(0, 10).replace(/-/g, '');
          end = today.toISOString().slice(0, 10).replace(/-/g, '');
        }
        
        const response = await this.makeRequest('/stats/timeline/inFollowers', {
          blogId,
          start,
          end
        });
        
        if (response && response.length > 0) {
          console.log(`✅ Found ${response.length} data points`);
          // Show all data points to see the pattern
          response.forEach((point: any) => {
            console.log(`   ${point[0]}: ${point[1]} followers`);
          });
        } else {
          console.log(`⭕ No data available`);
        }
        
      } catch (error) {
        console.log(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      console.log(''); // Empty line
    }
  }

  /**
   * Verify LinkedIn follower count using multiple approaches
   */
  async verifyLinkedInFollowers(blogId: string): Promise<void> {
    console.log('🔍 Verifying LinkedIn follower count using multiple approaches...\n');

    // Approach 1: Check today's date specifically
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    console.log(`📅 Today's date: ${todayStr}`);
    console.log(`📅 Formatted for API: ${todayStr}\n`);

    try {
      console.log('📊 Approach 1: Single day (today)');
      const singleDay = await this.makeRequest('/stats/timeline/inFollowers', {
        blogId,
        start: todayStr,
        end: todayStr
      });
      
      console.log('✅ Single day result:', JSON.stringify(singleDay, null, 2));
    } catch (error) {
      console.log('❌ Single day failed:', error instanceof Error ? error.message : String(error));
    }

    console.log('');

    // Approach 2: Try without date parameters
    try {
      console.log('📊 Approach 2: No date parameters');
      const noDate = await this.makeRequest('/stats/timeline/inFollowers', {
        blogId
      });
      
      console.log('✅ No date result:', JSON.stringify(noDate, null, 2));
    } catch (error) {
      console.log('❌ No date failed:', error instanceof Error ? error.message : String(error));
    }

    console.log('');

    // Approach 3: Try a wider date range (last year)
    try {
      console.log('📊 Approach 3: Last 365 days');
      const oneYearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
      const oneYearAgoStr = oneYearAgo.toISOString().slice(0, 10).replace(/-/g, '');
      
      const wideRange = await this.makeRequest('/stats/timeline/inFollowers', {
        blogId,
        start: oneYearAgoStr,
        end: todayStr
      });
      
      console.log('✅ Wide range result:', JSON.stringify(wideRange, null, 2));
      if (wideRange && wideRange.length > 0) {
        console.log(`📈 Found ${wideRange.length} data points over the last year`);
        // Show the last few entries
        console.log('📅 Recent entries:');
        wideRange.slice(-5).forEach((point: any) => {
          console.log(`   ${point[0]}: ${point[1]} followers`);
        });
      }
    } catch (error) {
      console.log('❌ Wide range failed:', error instanceof Error ? error.message : String(error));
    }

    console.log('');

    // Approach 4: Try other follower-related metrics
    const otherMetrics = ['inPaidFollowers'];
    
    for (const metric of otherMetrics) {
      try {
        console.log(`📊 Approach 4: Testing ${metric}`);
        const result = await this.makeRequest(`/stats/timeline/${metric}`, {
          blogId,
          start: todayStr,
          end: todayStr
        });
        
        console.log(`✅ ${metric}:`, JSON.stringify(result, null, 2));
      } catch (error) {
        console.log(`❌ ${metric} failed:`, error instanceof Error ? error.message : String(error));
      }
    }
  }

  /**
   * Make authenticated request to Metricool API
   */
  private async makeRequest(endpoint: string, params?: any): Promise<any> {
    const url = new URL(this.config.baseUrl + endpoint);
    
    // Add authentication and parameters according to Metricool API docs
    const requestParams: any = {
      ...params
    };
    
    // Add userId as required by Metricool API
    if (this.config.userId) {
      requestParams.userId = this.config.userId;
    }

    Object.keys(requestParams).forEach(key => {
      url.searchParams.append(key, requestParams[key].toString());
    });

    console.log(`🔍 Making request to: ${endpoint}`);
    console.log(`🔍 Full URL: ${url.toString()}`);
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Mc-Auth': this.config.token,
          'User-Agent': 'LinkedIn-Growth-Plan/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`❌ API request failed: ${error}`);
      throw error;
    }
  }

  /**
   * Transform Metricool LinkedIn post data to our format
   */
  private transformLinkedInPosts(metricoolPosts: any[]): LinkedInPost[] {
    return metricoolPosts.map(post => ({
      id: post.id || '',
      text: post.text || '',
      publishedDate: post.published_date || '',
      impressions: post.impressions || 0,
      likes: post.likes || 0,
      comments: post.comments || 0,
      shares: post.shares || 0,
      engagementRate: this.calculateEngagementRate(post),
      url: post.url || ''
    }));
  }

  /**
   * Calculate engagement rate from post metrics
   */
  private calculateEngagementRate(post: any): number {
    const totalEngagement = (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
    const impressions = post.impressions || 0;
    
    if (impressions === 0) return 0;
    return (totalEngagement / impressions) * 100;
  }

  /**
   * Analyze optimal posting times from historical data
   */
  private analyzePostingTimes(posts: LinkedInPost[]): { hour: number; day: string; avgEngagement: number }[] {
    const timeData: { [key: string]: { totalEngagement: number; count: number } } = {};

    posts.forEach(post => {
      const date = new Date(post.publishedDate);
      const hour = date.getHours();
      const day = date.toLocaleDateString('en', { weekday: 'long' });
      const key = `${day}-${hour}`;

      if (!timeData[key]) {
        timeData[key] = { totalEngagement: 0, count: 0 };
      }

      timeData[key].totalEngagement += post.engagementRate;
      timeData[key].count += 1;
    });

    return Object.entries(timeData)
      .map(([key, data]) => {
        const [day, hour] = key.split('-');
        return {
          hour: parseInt(hour),
          day,
          avgEngagement: data.totalEngagement / data.count
        };
      })
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 5);
  }
}

// CLI interface for testing
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    const client = new MetricoolClient();

    switch (command) {
      case 'brands':
        console.log('📊 Fetching LinkedIn brands...');
        const brands = await client.getBrands();
        console.log(JSON.stringify(brands, null, 2));
        break;

      case 'analytics':
        // Use the discovered brand ID: 5103233
        console.log(`📈 Fetching LinkedIn analytics for brand 5103233...`);
        const analytics = await client.getLinkedInAnalytics('5103233');
        console.log('\n📊 LinkedIn Analytics:');
        console.log(JSON.stringify(analytics, null, 2));
        break;

      case 'posts':
        // Use the discovered brand ID: 5103233
        console.log(`📝 Fetching LinkedIn posts for brand 5103233...`);
        const posts = await client.getLinkedInPosts('5103233');
        console.log('\n📝 LinkedIn Posts:');
        console.log(JSON.stringify(posts, null, 2));
        break;

      case 'followers':
        // Use the discovered brand ID: 5103233
        console.log(`📈 Fetching LinkedIn followers timeline for brand 5103233...`);
        const followers = await client.getLinkedInFollowersTimeline('5103233');
        console.log('\n📈 LinkedIn Followers Timeline:');
        console.log(JSON.stringify(followers, null, 2));
        break;

      case 'test':
      case 'metrics':
        // Test all available LinkedIn metrics
        console.log(`🧪 Testing all LinkedIn metrics for brand 5103233...\n`);
        await client.testAllLinkedInMetrics('5103233');
        break;

      case 'datetest':
      case 'dates':
        // Test followers with different date ranges
        await client.testFollowersWithDateRanges('5103233');
        break;

      case 'verify':
      case 'check':
        // Verify LinkedIn follower count using multiple approaches
        await client.verifyLinkedInFollowers('5103233');
        break;

      case 'recommendations':
        const recBlogId = parseInt(args[1]);
        if (!recBlogId) {
          console.error('❌ Please provide blog ID: yarn recommendations <blogId>');
          process.exit(1);
        }
        
        console.log(`💡 Generating content recommendations for blog ${recBlogId}...`);
        const recommendations = await client.generateContentRecommendations(recBlogId);
        console.log('\n📝 Content Recommendations:');
        recommendations.forEach((rec, i) => {
          console.log(`   ${i + 1}. ${rec}`);
        });
        break;

      default:
        console.log('📋 Available commands:');
        console.log('   yarn metricool:brands - Get connected LinkedIn accounts');
        console.log('   yarn metricool:analytics - Get LinkedIn posts analytics');
        console.log('   yarn metricool:posts - Get LinkedIn posts performance');
        console.log('   yarn metricool:followers - Get LinkedIn followers timeline');
        console.log('   yarn tsx linkedin-growth-plan/scripts/metricool-client.ts test - Test all LinkedIn metrics');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Export for use in other scripts
export { MetricoolClient, type LinkedInPost, type PostAnalytics };

// Run CLI if executed directly
if (require.main === module) {
  main();
} 