#!/usr/bin/env node

import { BufferScheduler } from './buffer-scheduler.js';

async function testBufferSetup() {
  console.log('🧪 Testing Buffer API Setup...\n');

  try {
    const scheduler = new BufferScheduler();
    
    console.log('✅ Buffer scheduler initialized successfully!');
    
    // Test 1: Get profiles
    console.log('\n📋 Test 1: Fetching connected profiles...');
    const profiles = await scheduler.getProfiles();
    
    if (profiles.length === 0) {
      console.log('❌ No profiles found. Please connect your social media accounts to Buffer.');
      console.log('💡 Go to https://buffer.com/dashboard to connect accounts.');
      return;
    }
    
    console.log(`✅ Found ${profiles.length} connected profile(s):`);
    profiles.forEach(profile => {
      console.log(`   🔗 ${profile.service.toUpperCase()}: ${profile.formatted_username}`);
    });

    // Test 2: Check for Twitter profile
    const twitterProfile = profiles.find(p => p.service === 'twitter');
    if (twitterProfile) {
      console.log(`\n✅ Twitter profile found: ${twitterProfile.formatted_username}`);
      console.log(`   🆔 Profile ID: ${twitterProfile.id}`);
    } else {
      console.log('\n❌ No Twitter profile found. Please connect your Twitter account to Buffer.');
      console.log('💡 Go to https://buffer.com/dashboard → Channels → Connect Twitter');
      return;
    }

    // Test 3: Get pending posts
    console.log('\n📋 Test 3: Checking scheduled posts...');
    const pendingPosts = await scheduler.getPendingPosts();
    console.log(`✅ Found ${pendingPosts.length} scheduled post(s)`);

    console.log('\n🎉 All tests passed! Your Buffer API setup is working correctly.');
    console.log('\n🚀 Ready to schedule tweets! Try:');
    console.log('   yarn tweet "Hello from Cursor!" "in 5 minutes"');
    console.log('   yarn thread "Tweet 1|Tweet 2|Tweet 3" "tomorrow 9am"');
    console.log('   yarn scheduled list');

  } catch (error) {
    console.error('\n❌ Setup test failed:');
    
    if (error instanceof Error) {
      if (error.message.includes('access token')) {
        console.error('🔑 Issue with access token:');
        console.error('   1. Check your BUFFER_ACCESS_TOKEN in .env file');
        console.error('   2. Generate a new token at https://buffer.com/developers');
        console.error('   3. Make sure the token has proper permissions');
      } else if (error.message.includes('401')) {
        console.error('🔐 Authentication failed:');
        console.error('   1. Verify your BUFFER_ACCESS_TOKEN is correct');
        console.error('   2. Token might be expired - generate a new one');
      } else if (error.message.includes('No Twitter profile')) {
        console.error('🐦 Twitter account not connected:');
        console.error('   1. Go to https://buffer.com/dashboard');
        console.error('   2. Click "Connect Account" → Select Twitter/X');
        console.error('   3. Authorize Buffer to access your Twitter account');
      } else {
        console.error('   Error:', error.message);
      }
    } else {
      console.error('   Unknown error:', String(error));
    }
    
    console.error('\n📖 See SETUP.md for detailed instructions');
    process.exit(1);
  }
}

if (require.main === module) {
  testBufferSetup();
} 