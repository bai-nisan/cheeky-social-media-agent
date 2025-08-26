import { MetricoolClient } from './metricool-client.js';

class MetricoolLiveFollowerChecker {
  private client: MetricoolClient;
  private blogId: string = '5103233'; // Gal's LinkedIn brand ID

  constructor() {
    this.client = new MetricoolClient();
  }

  /**
   * Try to get live/current follower data using different approaches
   */
  async checkLiveFollowers(): Promise<void> {
    console.log('🔴 LIVE FOLLOWER COUNT INVESTIGATION\n');
    console.log('🎯 Goal: Find the endpoint that matches what you see in the web interface\n');
    console.log('═'.repeat(70));

    // Approach 1: Try today's data with different parameters
    await this.tryTodayWithDifferentParams();

    // Approach 2: Try different metric types that might represent current counts
    await this.tryCurrentMetricTypes();

    // Approach 3: Check if there are dashboard/live endpoints
    await this.tryDashboardEndpoints();

    // Approach 4: Explore brand-specific endpoints
    await this.tryBrandSpecificEndpoints();

    console.log('\n' + '═'.repeat(70));
    console.log('🤔 If all these show 0 but web interface shows real numbers:');
    console.log('   1. Web interface might use WebSocket/real-time data');
    console.log('   2. Different authentication might be needed');
    console.log('   3. Enterprise API endpoints might have the live data');
    console.log('   4. Data might take 24-48 hours to populate in analytics API');
  }

  private async tryTodayWithDifferentParams(): Promise<void> {
    console.log('\n📊 APPROACH 1: Today\'s Data with Different Parameters');
    console.log('─'.repeat(50));

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    const paramVariations = [
      // Standard call
      { blogId: this.blogId },
      
      // With different date formats
      { blogId: this.blogId, start: today, end: today },
      { blogId: this.blogId, date: today },
      { blogId: this.blogId, period: 'today' },
      
      // With granularity
      { blogId: this.blogId, granularity: 'daily' },
      { blogId: this.blogId, granularity: 'live' },
      { blogId: this.blogId, granularity: 'current' },
      
      // With additional flags
      { blogId: this.blogId, live: true },
      { blogId: this.blogId, current: true },
      { blogId: this.blogId, realtime: true }
    ];

    for (const params of paramVariations) {
      try {
        console.log(`🧪 Testing params:`, JSON.stringify(params));
        
        const response = await (this.client as any).makeRequest('/stats/timeline/totalFollowers', params);
        
        if (response && Array.isArray(response)) {
          const nonZeroData = response.filter((point: any) => parseInt(point[1]) > 0);
          if (nonZeroData.length > 0) {
            console.log(`🎉 FOUND NON-ZERO DATA:`, nonZeroData);
          } else {
            console.log(`📊 Data points: ${response.length}, all zeros`);
          }
        }
      } catch (error) {
        console.log(`❌ Failed with params:`, JSON.stringify(params));
      }
    }
  }

  private async tryCurrentMetricTypes(): Promise<void> {
    console.log('\n📈 APPROACH 2: Different Metric Types');
    console.log('─'.repeat(50));

    const metricTypes = [
      // Live/current variations
      'currentFollowers',
      'liveFollowers', 
      'totalFollowersNow',
      'followersCount',
      'followers_count',
      
      // LinkedIn specific
      'linkedinFollowers',
      'linkedin_followers',
      'in_followers_total',
      
      // General counts
      'subscriberCount',
      'memberCount',
      'fanCount',
      'connectionCount'
    ];

    for (const metric of metricTypes) {
      try {
        console.log(`🧪 Testing metric: ${metric}`);
        
        const endpoints = [
          `/stats/${metric}`,
          `/stats/current/${metric}`,
          `/stats/live/${metric}`,
          `/analytics/${metric}`,
          `/metrics/${metric}`,
          `/${metric}`
        ];

        for (const endpoint of endpoints) {
          try {
            const response = await (this.client as any).makeRequest(endpoint, {
              blogId: this.blogId
            });
            
            if (response) {
              console.log(`✅ SUCCESS: ${endpoint}`);
              console.log(`📄 Response:`, JSON.stringify(response, null, 2));
              
              // Look for any number that might be follower count
              const numbers = this.extractNumbers(response);
              if (numbers.length > 0) {
                console.log(`🔢 Found numbers:`, numbers);
              }
            }
          } catch (error) {
            // Continue silently
          }
        }
      } catch (error) {
        // Continue silently
      }
    }
  }

  private async tryDashboardEndpoints(): Promise<void> {
    console.log('\n🎛️  APPROACH 3: Dashboard/Live Endpoints');
    console.log('─'.repeat(50));

    const dashboardEndpoints = [
      // Dashboard data
      '/dashboard',
      '/dashboard/data',
      '/dashboard/summary',
      '/dashboard/live',
      '/dashboard/metrics',
      
      // Live data
      '/live/stats',
      '/live/followers',
      '/live/metrics',
      '/realtime/followers',
      '/current/stats',
      
      // Widget data (web interface might use these)
      '/widget/followers',
      '/widget/stats',
      '/widget/summary',
      '/widgets/data'
    ];

    for (const endpoint of dashboardEndpoints) {
      try {
        console.log(`🧪 Testing: ${endpoint}`);
        const response = await (this.client as any).makeRequest(endpoint, {
          blogId: this.blogId
        });
        
        if (response) {
          console.log(`✅ FOUND: ${endpoint}`);
          console.log(`📄 Response:`, JSON.stringify(response, null, 2));
          
          // Look for follower-related data
          const followerData = this.findFollowerData(response);
          if (followerData.length > 0) {
            console.log(`🎯 Potential follower data:`, followerData);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (!errorMsg.includes('404') && !errorMsg.includes('Unexpected token')) {
          console.log(`❌ ${endpoint}: ${errorMsg}`);
        }
      }
    }
  }

  private async tryBrandSpecificEndpoints(): Promise<void> {
    console.log('\n🏢 APPROACH 4: Brand-Specific Endpoints');
    console.log('─'.repeat(50));

    const brandEndpoints = [
      // Brand info with stats
      `/brands/${this.blogId}`,
      `/brands/${this.blogId}/stats`,
      `/brands/${this.blogId}/metrics`,
      `/brands/${this.blogId}/summary`,
      `/brands/${this.blogId}/followers`,
      
      // Profile endpoints
      `/profiles/${this.blogId}`,
      `/profiles/${this.blogId}/stats`,
      `/profiles/${this.blogId}/analytics`,
      
      // Account endpoints
      `/accounts/${this.blogId}`,
      `/accounts/${this.blogId}/stats`,
      `/accounts/${this.blogId}/summary`
    ];

    for (const endpoint of brandEndpoints) {
      try {
        console.log(`🧪 Testing: ${endpoint}`);
        const response = await (this.client as any).makeRequest(endpoint, {});
        
        if (response) {
          console.log(`✅ FOUND: ${endpoint}`);
          console.log(`📄 Response:`, JSON.stringify(response, null, 2));
          
          // Look for any follower counts
          const numbers = this.extractNumbers(response);
          if (numbers.length > 0) {
            console.log(`🔢 Numbers found:`, numbers);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (!errorMsg.includes('404') && !errorMsg.includes('Unexpected token')) {
          console.log(`❌ ${endpoint}: ${errorMsg}`);
        }
      }
    }
  }

  private extractNumbers(obj: any): number[] {
    const numbers: number[] = [];
    
    const extract = (item: any) => {
      if (typeof item === 'number' && item > 0) {
        numbers.push(item);
      } else if (typeof item === 'string') {
        const num = parseInt(item);
        if (!isNaN(num) && num > 0) {
          numbers.push(num);
        }
      } else if (Array.isArray(item)) {
        item.forEach(extract);
      } else if (typeof item === 'object' && item !== null) {
        Object.values(item).forEach(extract);
      }
    };
    
    extract(obj);
    return [...new Set(numbers)]; // Remove duplicates
  }

  private findFollowerData(obj: any): any[] {
    const followerData: any[] = [];
    
    const search = (item: any, path: string = '') => {
      if (typeof item === 'object' && item !== null) {
        for (const [key, value] of Object.entries(item)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (key.toLowerCase().includes('follow') || 
              key.toLowerCase().includes('fan') ||
              key.toLowerCase().includes('subscriber') ||
              key.toLowerCase().includes('count')) {
            followerData.push({ path: currentPath, value });
          }
          
          if (typeof value === 'object') {
            search(value, currentPath);
          }
        }
      }
    };
    
    search(obj);
    return followerData;
  }
}

// CLI execution
async function main() {
  console.log('🚀 Starting live follower data investigation...\n');
  console.log('💡 Since you can see follower counts in the web interface,');
  console.log('   the data definitely exists - we just need to find the right API call!\n');
  
  const checker = new MetricoolLiveFollowerChecker();
  
  try {
    await checker.checkLiveFollowers();
  } catch (error) {
    console.error('❌ Investigation error:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { MetricoolLiveFollowerChecker }; 