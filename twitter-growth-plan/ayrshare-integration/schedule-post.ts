#!/usr/bin/env tsx

import 'dotenv/config';
import { AyrshareScheduler, parseRelativeTime } from './ayrshare-scheduler.js';

async function schedulePost() {
  // Check for required environment variables
  if (!process.env.AYRSHARE_API_KEY) {
    console.error('❌ AYRSHARE_API_KEY environment variable is required');
    console.error('Add it to your .env file: AYRSHARE_API_KEY=your_api_key_here');
    process.exit(1);
  }

  // Parse command line arguments
  const content = process.argv[2];
  const timeArg = process.argv[3];

  if (!content) {
    console.error('❌ Tweet content is required');
    console.error('Usage: yarn ayr:tweet "content" [time]');
    console.error('Examples:');
    console.error('  yarn ayr:tweet "Hello world!"');
    console.error('  yarn ayr:tweet "Good morning!" "tomorrow 9am"');
    console.error('  yarn ayr:tweet "Working late..." "in 30 minutes"');
    process.exit(1);
  }

  // Check tweet length
  if (content.length > 280) {
    console.error(`❌ Tweet too long: ${content.length}/280 characters`);
    console.error('Consider using thread mode for longer content');
    process.exit(1);
  }

  try {
    const scheduler = new AyrshareScheduler({
      apiKey: process.env.AYRSHARE_API_KEY
    });

    // Validate connection
    console.log('🔄 Validating Ayrshare connection...');
    const isValid = await scheduler.validateConnection();
    if (!isValid) {
      console.error('❌ Failed to connect to Ayrshare. Please check your API key.');
      process.exit(1);
    }

    // Parse schedule time if provided
    let scheduleDate: string | undefined;
    if (timeArg) {
      try {
        const parsedDate = parseRelativeTime(timeArg);
        scheduleDate = parsedDate.toISOString();
        console.log(`📅 Scheduling for: ${parsedDate.toLocaleString()}`);
      } catch (error) {
        console.error(`❌ Invalid time format: ${timeArg}`);
        console.error('Supported formats:');
        console.error('  - "in 30 minutes", "in 2 hours", "in 1 day"');
        console.error('  - "tomorrow 9am", "today 2pm"');
        console.error('  - ISO format: "2024-02-01T15:30:00Z"');
        process.exit(1);
      }
    }

    // Schedule the post
    console.log('🚀 Scheduling tweet...');
    console.log(`📝 Content: "${content}"`);

    const result = await scheduler.schedulePost(content, scheduleDate);

    if (result.status === 'success') {
      console.log('✅ Tweet scheduled successfully!');
      
      if (result.postIds && result.postIds.length > 0) {
        console.log('📊 Post details:');
        result.postIds.forEach((post, index) => {
          console.log(`  ${index + 1}. Platform: ${post.platform}`);
          console.log(`     ID: ${post.id}`);
          console.log(`     Posted: ${post.posted ? 'Yes' : 'No'}`);
          if (post.postUrl) {
            console.log(`     URL: ${post.postUrl}`);
          }
        });
      }

      if (!scheduleDate) {
        console.log('🎉 Your tweet has been posted immediately!');
      } else {
        console.log(`⏰ Your tweet will be posted at: ${new Date(scheduleDate).toLocaleString()}`);
      }
    } else {
      console.error('❌ Failed to schedule tweet');
      if (result.errors && result.errors.length > 0) {
        console.error('Errors:', result.errors);
      }
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error scheduling tweet:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        console.error('🔑 Authentication failed. Please check your AYRSHARE_API_KEY');
      } else if (error.message.includes('429')) {
        console.error('⏰ Rate limit exceeded. Please wait and try again');
      } else if (error.message.includes('400')) {
        console.error('📝 Invalid request. Please check your content and schedule time');
      }
    }
    
    process.exit(1);
  }
}

// Show usage help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('🐦 Ayrshare Tweet Scheduler');
  console.log('');
  console.log('Usage: yarn ayr:tweet "content" [time]');
  console.log('');
  console.log('Examples:');
  console.log('  yarn ayr:tweet "Hello world!"');
  console.log('  yarn ayr:tweet "Good morning everyone! ☀️" "tomorrow 8am"');
  console.log('  yarn ayr:tweet "Just finished coding..." "in 15 minutes"');
  console.log('  yarn ayr:tweet "Weekend vibes" "today 5pm"');
  console.log('');
  console.log('Time formats:');
  console.log('  • Relative: "in 30 minutes", "in 2 hours", "in 1 day"');
  console.log('  • Natural: "tomorrow 9am", "today 2pm"');
  console.log('  • ISO: "2024-02-01T15:30:00Z"');
  console.log('');
  console.log('Environment variables required:');
  console.log('  AYRSHARE_API_KEY - Your Ayrshare API key');
  process.exit(0);
}

schedulePost().catch(console.error); 