import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
}

class ScheduledSearchTester {
  private results: TestResult[] = [];
  private client: TwitterApi;

  constructor() {
    this.client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '');
  }

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, details?: any) {
    this.results.push({ test, status, message, details });
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} ${test}: ${message}`);
    if (details && status === 'FAIL') {
      console.log('   Details:', details);
    }
  }

  async testEnvironmentSetup() {
    console.log('\n🔧 Testing Environment Setup...');
    
    // Test 1: Check environment variables
    const requiredVars = ['TWITTER_BEARER_TOKEN'];
    for (const varName of requiredVars) {
      if (process.env[varName]) {
        this.addResult(`ENV_${varName}`, 'PASS', `Environment variable is set`);
      } else {
        this.addResult(`ENV_${varName}`, 'FAIL', `Environment variable is missing`);
      }
    }

    // Test 2: Validate Bearer Token format
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (bearerToken) {
      if (bearerToken.startsWith('AAAAAAAA') && bearerToken.length > 100) {
        this.addResult('BEARER_FORMAT', 'PASS', `Bearer token format looks correct (${bearerToken.length} chars)`);
      } else {
        this.addResult('BEARER_FORMAT', 'FAIL', `Bearer token format seems wrong (${bearerToken.length} chars, starts with: ${bearerToken.substring(0, 8)})`);
      }
    }
  }

  async testTwitterAPIAccess() {
    console.log('\n📡 Testing Twitter API Access...');
    
    try {
      // Test 1: Basic API connectivity
      const user = await this.client.v2.userByUsername('twitter');
      if (user.data?.username === 'Twitter') {
        this.addResult('API_CONNECTIVITY', 'PASS', 'Basic API access works');
      } else {
        this.addResult('API_CONNECTIVITY', 'FAIL', 'API response unexpected', user.data);
      }

      // Test 2: Search functionality
      const searchResult = await this.client.v2.search('hello', { max_results: 1 });
      if (searchResult.data?.data && searchResult.data.data.length > 0) {
        this.addResult('API_SEARCH', 'PASS', `Search works - found ${searchResult.data.data.length} tweets`);
      } else {
        this.addResult('API_SEARCH', 'FAIL', 'Search returned no results', searchResult);
      }

      // Test 3: User timeline access
      const testUser = await this.client.v2.userByUsername('GalKimron');
      const timeline = await this.client.v2.userTimeline(testUser.data.id, {
        max_results: 1,
        'tweet.fields': ['created_at', 'public_metrics']
      });
      
      if (timeline.data?.data && timeline.data.data.length > 0) {
        this.addResult('API_TIMELINE', 'PASS', `Timeline access works - found ${timeline.data.data.length} tweets`);
      } else {
        this.addResult('API_TIMELINE', 'FAIL', 'Timeline access failed', timeline);
      }

    } catch (error) {
      this.addResult('API_ACCESS', 'FAIL', `API access failed: ${(error as Error).message}`, error);
    }
  }

  async testPriorityAccounts() {
    console.log('\n👥 Testing Priority Account Access...');
    
    const testAccounts = ['paulroetzer', 'dillionverma', 'bentossell']; // Sample of priority accounts
    
    for (const username of testAccounts) {
      try {
        const user = await this.client.v2.userByUsername(username);
        const timeline = await this.client.v2.userTimeline(user.data.id, {
          max_results: 2,
          'tweet.fields': ['created_at']
        });
        
        if (timeline.data?.data && timeline.data.data.length > 0) {
          this.addResult(`ACCOUNT_${username}`, 'PASS', `Can access @${username} timeline (${timeline.data.data.length} tweets)`);
        } else {
          this.addResult(`ACCOUNT_${username}`, 'SKIP', `@${username} has no recent tweets`);
        }
        
        // Small delay to be nice to API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        const errorMsg = (error as Error).message;
        if (errorMsg.includes('429')) {
          this.addResult(`ACCOUNT_${username}`, 'SKIP', `Rate limited when checking @${username}`);
        } else {
          this.addResult(`ACCOUNT_${username}`, 'FAIL', `Failed to access @${username}: ${errorMsg}`);
        }
      }
    }
  }

  async testSearchScript() {
    console.log('\n🔍 Testing Search Script...');
    
    try {
      // Import and run the search function
      const { runScheduledSearch } = await import('./scheduled-search.js');
      
      console.log('Running scheduled search...');
      await runScheduledSearch();
      
      // Check if cache file was created
      const cacheFile = join(process.cwd(), 'cache', 'reply-opps.json');
      if (existsSync(cacheFile)) {
        const cacheContent = JSON.parse(readFileSync(cacheFile, 'utf-8'));
        
        this.addResult('SEARCH_EXECUTION', 'PASS', `Search script ran successfully`);
        this.addResult('CACHE_CREATION', 'PASS', `Cache file created with ${cacheContent.count} opportunities`);
        
        // Validate cache structure
        if (cacheContent.generated_at && cacheContent.opportunities && Array.isArray(cacheContent.opportunities)) {
          this.addResult('CACHE_STRUCTURE', 'PASS', 'Cache file has correct structure');
          
          // Check opportunity format
          if (cacheContent.opportunities.length > 0) {
            const firstOpp = cacheContent.opportunities[0];
            const requiredFields = ['id', 'url', 'text', 'author_username', 'relevance_reason'];
            const hasAllFields = requiredFields.every(field => field in firstOpp);
            
            if (hasAllFields) {
              this.addResult('OPPORTUNITY_FORMAT', 'PASS', 'Opportunities have correct format');
            } else {
              this.addResult('OPPORTUNITY_FORMAT', 'FAIL', 'Opportunities missing required fields', firstOpp);
            }
          } else {
            this.addResult('OPPORTUNITY_FORMAT', 'SKIP', 'No opportunities found to validate format');
          }
        } else {
          this.addResult('CACHE_STRUCTURE', 'FAIL', 'Cache file has incorrect structure', cacheContent);
        }
      } else {
        this.addResult('CACHE_CREATION', 'FAIL', 'Cache file was not created');
      }
      
    } catch (error) {
      this.addResult('SEARCH_EXECUTION', 'FAIL', `Search script failed: ${(error as Error).message}`, error);
    }
  }

  async testRateLimits() {
    console.log('\n⏱️ Testing Rate Limit Handling...');
    
    // This test checks how the system behaves under rate limits
    try {
      let successCount = 0;
      let rateLimitCount = 0;
      
      // Try multiple searches to potentially hit rate limits
      for (let i = 0; i < 3; i++) {
        try {
          await this.client.v2.search('test', { max_results: 1 });
          successCount++;
        } catch (error) {
          const errorMsg = (error as Error).message;
          if (errorMsg.includes('429')) {
            rateLimitCount++;
          } else {
            throw error;
          }
        }
      }
      
      if (successCount > 0) {
        this.addResult('RATE_LIMIT_HANDLING', 'PASS', `Handled rate limits gracefully (${successCount} success, ${rateLimitCount} rate limited)`);
      } else if (rateLimitCount > 0) {
        this.addResult('RATE_LIMIT_HANDLING', 'SKIP', 'Hit rate limits immediately - this is expected');
      }
      
    } catch (error) {
      this.addResult('RATE_LIMIT_HANDLING', 'FAIL', `Rate limit test failed: ${(error as Error).message}`);
    }
  }

  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    console.log(`✅ PASSED: ${passed}`);
    console.log(`❌ FAILED: ${failed}`);
    console.log(`⚠️ SKIPPED: ${skipped}`);
    console.log(`📝 TOTAL: ${this.results.length}`);
    
    if (failed > 0) {
      console.log('\n🚨 FAILED TESTS:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.test}: ${r.message}`));
    }
    
    const overallStatus = failed === 0 ? 'HEALTHY' : 'NEEDS ATTENTION';
    console.log(`\n🎯 OVERALL STATUS: ${overallStatus}`);
    
    return { passed, failed, skipped, overall: overallStatus };
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting Scheduled Search Tests...');
  console.log('=====================================\n');
  
  const tester = new ScheduledSearchTester();
  
  await tester.testEnvironmentSetup();
  await tester.testTwitterAPIAccess();
  await tester.testPriorityAccounts();
  await tester.testSearchScript();
  await tester.testRateLimits();
  
  return tester.printSummary();
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests, ScheduledSearchTester }; 