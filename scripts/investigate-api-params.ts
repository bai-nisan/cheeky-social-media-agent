import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';

async function investigateAPIParams() {
  console.log('🧪 Investigating API Parameter Issues');
  console.log('====================================\n');

  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '');
  
  // Test 1: User lookup (we know this works)
  console.log('📋 Test 1: User Lookup (Known Working)');
  try {
    const user = await client.v2.userByUsername('paulroetzer');
    console.log('✅ User lookup success:', user.data.username, 'ID:', user.data.id);
    
    // Test 2: Minimal timeline request
    console.log('\n📋 Test 2: Minimal Timeline Request');
    try {
      const timeline = await client.v2.userTimeline(user.data.id, {
        max_results: 5
      });
      console.log('✅ Timeline success:', timeline.data?.data?.length || 0, 'tweets');
    } catch (timelineError: any) {
      console.log('❌ Timeline failed:', timelineError.message);
      if (timelineError.data) {
        console.log('   API Error Details:', timelineError.data);
      }
      if (timelineError.code) {
        console.log('   Error Code:', timelineError.code);
      }
    }
    
  } catch (userError: any) {
    console.log('❌ User lookup failed:', userError.message);
    return;
  }

  // Test 3: Minimal search request
  console.log('\n📋 Test 3: Minimal Search Request');
  try {
    const search = await client.v2.search('hello', {
      max_results: 5
    });
    console.log('✅ Search success:', search.data?.data?.length || 0, 'results');
  } catch (searchError: any) {
    console.log('❌ Search failed:', searchError.message);
    if (searchError.data) {
      console.log('   API Error Details:', searchError.data);
    }
    if (searchError.code) {
      console.log('   Error Code:', searchError.code);
    }
  }

  // Test 4: Check API access level
  console.log('\n📋 Test 4: API Access Level Check');
  try {
    // Try to get rate limit status (indicates API access level)
    const rateLimits = await client.v1.get('application/rate_limit_status.json');
    console.log('✅ Rate limit access works - this suggests higher API access');
  } catch (rateLimitError: any) {
    console.log('⚠️ Rate limit check failed:', rateLimitError.message);
    console.log('   This might indicate limited API access (Essential vs Elevated)');
  }

  console.log('\n🎯 Analysis:');
  console.log('- If timeline/search fail but user lookup works:');
  console.log('  → Your tokens are CORRECT');
  console.log('  → Issue is API access level or specific endpoint permissions');
  console.log('  → May need "Elevated" access instead of "Essential"');
  console.log('\n- If all tests fail:');
  console.log('  → Token issue or app configuration problem');
}

investigateAPIParams().catch(console.error); 