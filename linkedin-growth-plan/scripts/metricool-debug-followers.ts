import { MetricoolClient } from './metricool-client.js';

class MetricoolFollowerDebugger {
  private client: MetricoolClient;
  private blogId: string = '5103233'; // Gal's LinkedIn brand ID

  constructor() {
    this.client = new MetricoolClient();
  }

  /**
   * Try multiple approaches to get follower data
   */
  async debugFollowerData(): Promise<void> {
    console.log('🔍 DEBUGGING METRICOOL FOLLOWER DATA\n');
    console.log('═'.repeat(60));

    // Test 1: Current follower count (not timeline)
    await this.testCurrentFollowerCount();

    // Test 2: Different date ranges
    await this.testDifferentDateRanges();

    // Test 3: Different follower endpoints
    await this.testAlternativeEndpoints();

    // Test 4: Check what data is actually available
    await this.exploreAvailableData();

    console.log('\n' + '═'.repeat(60));
  }

  private async testCurrentFollowerCount(): Promise<void> {
    console.log('\n📊 TEST 1: Current Follower Count');
    console.log('─'.repeat(40));

    const currentEndpoints = [
      '/stats/current/followers',
      '/stats/followers/current',
      '/stats/followers',
      '/analytics/followers',
      '/metrics/followers',
      '/followers',
      '/stats/summary',
      '/analytics/summary'
    ];

    for (const endpoint of currentEndpoints) {
      try {
        console.log(`🧪 Testing: ${endpoint}`);
        const response = await (this.client as any).makeRequest(endpoint, {
          blogId: this.blogId
        });
        
        if (response) {
          console.log(`✅ SUCCESS: ${endpoint}`);
          console.log(`📄 Response:`, JSON.stringify(response, null, 2));
          return;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (errorMsg.includes('404')) {
          console.log(`❓ ${endpoint}: Not found`);
        } else {
          console.log(`❌ ${endpoint}: ${errorMsg}`);
        }
      }
    }
  }

  private async testDifferentDateRanges(): Promise<void> {
    console.log('\n📅 TEST 2: Different Date Ranges');
    console.log('─'.repeat(40));

    const today = new Date();
    const dateRanges = [
      // Last 7 days
      {
        name: 'Last 7 days',
        start: this.formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
        end: this.formatDate(today)
      },
      // Last 30 days
      {
        name: 'Last 30 days',
        start: this.formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
        end: this.formatDate(today)
      },
      // Since connection (July 31)
      {
        name: 'Since connection',
        start: '20250731',
        end: this.formatDate(today)
      },
      // Wider range (last 60 days)
      {
        name: 'Last 60 days',
        start: this.formatDate(new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)),
        end: this.formatDate(today)
      }
    ];

    for (const range of dateRanges) {
      try {
        console.log(`\n🗓️  Testing ${range.name} (${range.start} to ${range.end})`);
        
        const response = await (this.client as any).makeRequest('/stats/timeline/inFollowers', {
          blogId: this.blogId,
          start: range.start,
          end: range.end
        });

        if (response && Array.isArray(response) && response.length > 0) {
          console.log(`✅ Found ${response.length} data points:`);
          response.forEach((point: any, index: number) => {
            console.log(`   ${index + 1}. ${point[0]}: ${point[1]} followers`);
          });
          
          // Look for non-zero values
          const nonZero = response.filter((point: any) => parseInt(point[1]) > 0);
          if (nonZero.length > 0) {
            console.log(`🎯 Found ${nonZero.length} non-zero values!`);
          }
        } else {
          console.log(`❌ No data returned`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error}`);
      }
    }
  }

  private async testAlternativeEndpoints(): Promise<void> {
    console.log('\n🔄 TEST 3: Alternative Follower Endpoints');
    console.log('─'.repeat(40));

    const endpoints = [
      // Different metric types
      '/stats/timeline/followers',
      '/stats/timeline/totalFollowers',
      '/stats/timeline/inFollowers',
      '/stats/timeline/outFollowers',
      '/stats/timeline/netFollowers',
      
      // Different API versions
      '/v1/stats/followers',
      '/v2/stats/followers',
      '/api/v1/followers',
      
      // LinkedIn specific
      '/linkedin/followers',
      '/stats/linkedin/followers',
      '/analytics/linkedin/followers',
      
      // General analytics
      '/analytics/metrics',
      '/stats/metrics',
      '/dashboard/stats'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🧪 Testing: ${endpoint}`);
        const response = await (this.client as any).makeRequest(endpoint, {
          blogId: this.blogId,
          start: '20250701',
          end: this.formatDate(new Date())
        });
        
        if (response) {
          console.log(`✅ WORKING: ${endpoint}`);
          console.log(`📊 Data type: ${Array.isArray(response) ? 'Array' : typeof response}`);
          if (Array.isArray(response)) {
            console.log(`📈 Data points: ${response.length}`);
            if (response.length > 0) {
              console.log(`📄 Sample:`, response.slice(0, 3));
            }
          } else {
            console.log(`📄 Response:`, JSON.stringify(response, null, 2));
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (!errorMsg.includes('404')) {
          console.log(`❌ ${endpoint}: ${errorMsg}`);
        }
      }
    }
  }

  private async exploreAvailableData(): Promise<void> {
    console.log('\n🔍 TEST 4: Explore Available Data');
    console.log('─'.repeat(40));

    try {
      // Check what data categories are available
      const exploreEndpoints = [
        '/stats/categories',
        '/analytics/available',
        '/metrics/list',
        '/stats/types',
        '/admin/stats',
        '/admin/metrics'
      ];

      for (const endpoint of exploreEndpoints) {
        try {
          console.log(`🔍 Exploring: ${endpoint}`);
          const response = await (this.client as any).makeRequest(endpoint, {
            blogId: this.blogId
          });
          
          if (response) {
            console.log(`✅ Available at ${endpoint}:`);
            console.log(JSON.stringify(response, null, 2));
          }
        } catch (error) {
          // Silently continue
        }
      }
    } catch (error) {
      console.log(`❌ Error exploring data: ${error}`);
    }
  }

  /**
   * Test what happens if we call the brands endpoint to see current stats
   */
  async checkBrandStats(): Promise<void> {
    console.log('\n📋 CHECKING BRAND STATS DIRECTLY');
    console.log('─'.repeat(40));

    try {
      const brands = await this.client.getBrands();
      console.log('✅ Brand data retrieved:');
      
      brands.forEach((brand: any, index: number) => {
        console.log(`\nBrand ${index + 1}: ${brand.label}`);
        console.log('Raw brand data:');
        console.log(JSON.stringify(brand, null, 2));
        
        // Look for any follower-related fields
        const followerFields = Object.keys(brand).filter(key => 
          key.toLowerCase().includes('follow') || 
          key.toLowerCase().includes('fan') ||
          key.toLowerCase().includes('subscriber') ||
          key.toLowerCase().includes('count')
        );
        
        if (followerFields.length > 0) {
          console.log(`🎯 Potential follower fields found:`, followerFields);
          followerFields.forEach(field => {
            console.log(`   ${field}: ${brand[field]}`);
          });
        }
      });
    } catch (error) {
      console.log(`❌ Error fetching brand stats: ${error}`);
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }
}

// CLI execution
async function main() {
  const followerDebugger = new MetricoolFollowerDebugger();
  
  console.log('🚀 Starting comprehensive follower data debugging...\n');
  
  try {
    await followerDebugger.debugFollowerData();
    await followerDebugger.checkBrandStats();
    
    console.log('\n🎯 SUMMARY:');
    console.log('If you can see follower counts in the Metricool web interface,');
    console.log('the data definitely exists. We just need to find the right endpoint!');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { MetricoolFollowerDebugger }; 