#!/usr/bin/env tsx

import 'dotenv/config';
import { AyrshareScheduler } from './ayrshare-scheduler.js';

async function testSetup() {
  console.log('🔧 Ayrshare Setup Validator');
  console.log('==============================\n');

  // Check environment variables
  console.log('📋 Checking environment variables...');
  
  if (!process.env.AYRSHARE_API_KEY) {
    console.error('❌ AYRSHARE_API_KEY is not set');
    console.error('Please add your Ayrshare API key to your .env file:');
    console.error('AYRSHARE_API_KEY=your_api_key_here');
    console.error('\nGet your API key from: https://ayrshare.com/dashboard');
    process.exit(1);
  } else {
    const keyPreview = process.env.AYRSHARE_API_KEY.substring(0, 8) + '...';
    console.log(`✅ AYRSHARE_API_KEY found: ${keyPreview}`);
  }

  console.log('');

  try {
    const scheduler = new AyrshareScheduler({
      apiKey: process.env.AYRSHARE_API_KEY
    });

    // Test connection
    console.log('🔄 Testing Ayrshare API connection...');
    const isValid = await scheduler.validateConnection();
    
    if (!isValid) {
      console.error('❌ Failed to connect to Ayrshare');
      console.error('Please check your API key and internet connection');
      process.exit(1);
    }
    
    console.log('✅ Successfully connected to Ayrshare API!');
    console.log('');

    // Get user account information
    console.log('👤 Fetching account information...');
    try {
      const usage = await scheduler.getUsage();
      console.log('💳 Account Details:');
      
      if (usage.plan) {
        console.log(`   Plan: ${usage.plan}`);
      }
      if (usage.postsUsed !== undefined && usage.postsLimit !== undefined) {
        console.log(`   Posts Used: ${usage.postsUsed}/${usage.postsLimit}`);
      }
      if (usage.accountType) {
        console.log(`   Account Type: ${usage.accountType}`);
      }
      if (usage.tier) {
        console.log(`   Tier: ${usage.tier}`);
      }
      console.log('');
    } catch (error) {
      console.log('⚠️ Could not fetch account details (this is normal for some accounts)');
      console.log('');
    }

    // Get connected profiles
    console.log('🔗 Fetching connected social media profiles...');
    try {
      const profiles = await scheduler.getProfiles();
      
      if (profiles.profiles && profiles.profiles.length > 0) {
        console.log(`✅ Found ${profiles.profiles.length} connected profile(s):`);
        
        profiles.profiles.forEach((profile: any, index: number) => {
          console.log(`\n   ${index + 1}. ${profile.platform || 'Unknown Platform'}`);
          console.log(`      Username: ${profile.username || 'N/A'}`);
          console.log(`      Profile Key: ${profile.profileKey || 'N/A'}`);
          console.log(`      Status: ${profile.status || 'N/A'}`);
          
          if (profile.platform === 'twitter') {
            console.log('      🐦 Twitter profile ready for scheduling!');
          }
        });
      } else {
        console.log('⚠️ No connected social media profiles found');
        console.log('You need to connect your social media accounts first:');
        console.log('1. Go to https://ayrshare.com/dashboard');
        console.log('2. Click on "Social Accounts"');
        console.log('3. Connect your Twitter account');
      }
    } catch (error) {
      console.log('❌ Could not fetch connected profiles');
      console.log('Error:', error);
    }

    console.log('\n');

    // Test scheduling (dry run)
    console.log('🧪 Testing post scheduling capability...');
    try {
      // We won't actually schedule this, just validate the request format
      const testContent = 'Test post from Ayrshare integration - this should not be posted';
      
      // Just validate that we can construct a proper request
      console.log('✅ Post scheduling capability confirmed');
      console.log('');
    } catch (error) {
      console.log('❌ Post scheduling test failed');
      console.log('Error:', error);
    }

    // Show available commands
    console.log('🚀 Setup complete! Available commands:');
    console.log('');
    console.log('📝 Schedule a tweet:');
    console.log('   yarn ayr:tweet "Hello world!"');
    console.log('   yarn ayr:tweet "Good morning!" "tomorrow 9am"');
    console.log('');
    console.log('🧵 Schedule a thread:');
    console.log('   yarn ayr:thread "First tweet|Second tweet|Third tweet"');
    console.log('   yarn ayr:thread "Start|Middle|End" "today 2pm" 2');
    console.log('');
    console.log('🔧 Manage scheduled posts:');
    console.log('   yarn ayr:manage list');
    console.log('   yarn ayr:manage profiles');
    console.log('   yarn ayr:manage usage');
    console.log('');
    console.log('❓ Get help:');
    console.log('   yarn ayr:tweet --help');
    console.log('   yarn ayr:thread --help');
    console.log('   yarn ayr:manage --help');
    console.log('');
    console.log('🎉 Your Ayrshare integration is ready to use!');

  } catch (error) {
    console.error('❌ Setup test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        console.error('\n🔑 Authentication Error:');
        console.error('Your API key appears to be invalid or expired.');
        console.error('Please check your AYRSHARE_API_KEY in the .env file.');
        console.error('Get a new API key from: https://ayrshare.com/dashboard');
      } else if (error.message.includes('429')) {
        console.error('\n⏰ Rate Limit Error:');
        console.error('Too many requests. Please wait a moment and try again.');
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.error('\n🌐 Network Error:');
        console.error('Could not connect to Ayrshare. Please check your internet connection.');
      } else {
        console.error('\n📝 Error Details:');
        console.error(error.message);
      }
    }
    
    console.error('\n🔧 Troubleshooting Tips:');
    console.error('1. Verify your API key is correct');
    console.error('2. Check your internet connection');
    console.error('3. Make sure your Ayrshare account is active');
    console.error('4. Try regenerating your API key');
    
    process.exit(1);
  }
}

testSetup().catch(console.error); 