#!/usr/bin/env tsx

import 'dotenv/config';
import { readFileSync } from 'fs';
import { AyrshareScheduler, parseRelativeTime } from './ayrshare-scheduler.js';

async function scheduleThread() {
  // Check for required environment variables
  if (!process.env.AYRSHARE_API_KEY) {
    console.error('❌ AYRSHARE_API_KEY environment variable is required');
    console.error('Add it to your .env file: AYRSHARE_API_KEY=your_api_key_here');
    process.exit(1);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  let content = '';
  let timeArg = '';
  let intervalMinutes = 1;
  let isFileMode = false;

  // Check for --file flag
  const fileIndex = args.findIndex(arg => arg === '--file');
  if (fileIndex !== -1) {
    isFileMode = true;
    const filePath = args[fileIndex + 1];
    if (!filePath) {
      console.error('❌ File path required after --file flag');
      process.exit(1);
    }
    
    try {
      content = readFileSync(filePath, 'utf-8').trim();
    } catch (error) {
      console.error(`❌ Failed to read file: ${filePath}`);
      process.exit(1);
    }
    
    // Remove --file and filepath from args
    args.splice(fileIndex, 2);
    timeArg = args[0] || '';
    intervalMinutes = parseInt(args[1] || '1');
  } else {
    content = args[0] || '';
    timeArg = args[1] || '';
    intervalMinutes = parseInt(args[2] || '1');
  }

  if (!content) {
    console.error('❌ Thread content is required');
    console.error('Usage: yarn ayr:thread "tweet1|tweet2|tweet3" [time] [interval]');
    console.error('   or: yarn ayr:thread --file path/to/file.txt [time] [interval]');
    console.error('');
    console.error('Examples:');
    console.error('  yarn ayr:thread "First tweet|Second tweet|Third tweet"');
    console.error('  yarn ayr:thread "Start|Middle|End" "tomorrow 9am" 2');
    console.error('  yarn ayr:thread --file my-thread.txt "in 30 minutes"');
    process.exit(1);
  }

  // Parse thread content
  let posts: string[];
  if (isFileMode) {
    // Split by lines for file mode
    posts = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  } else {
    // Split by | for command line mode
    posts = content.split('|').map(post => post.trim()).filter(post => post.length > 0);
  }

  if (posts.length === 0) {
    console.error('❌ No valid posts found in thread content');
    process.exit(1);
  }

  if (posts.length === 1) {
    console.error('❌ Thread must contain at least 2 posts');
    console.error('For single posts, use: yarn ayr:tweet');
    process.exit(1);
  }

  // Validate post lengths
  const invalidPosts = posts.map((post, index) => ({
    index: index + 1,
    length: post.length,
    content: post
  })).filter(post => post.length > 260); // Leave room for thread numbering

  if (invalidPosts.length > 0) {
    console.error('❌ Some posts are too long (max 260 chars to allow for numbering):');
    invalidPosts.forEach(post => {
      console.error(`  Post ${post.index}: ${post.length}/260 chars`);
      console.error(`    "${post.content.substring(0, 50)}..."`);
    });
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

    // Show thread preview
    console.log('🧵 Thread preview:');
    posts.forEach((post, index) => {
      console.log(`  ${index + 1}/${posts.length} ${post}`);
    });
    console.log('');

    if (intervalMinutes > 1) {
      console.log(`⏱️ Posts will be spaced ${intervalMinutes} minute(s) apart`);
    }

    // Schedule the thread
    console.log('🚀 Scheduling thread...');
    const results = await scheduler.scheduleThread(posts, scheduleDate, intervalMinutes);

    let successCount = 0;
    let errorCount = 0;

    console.log('📊 Thread scheduling results:');
    results.forEach((result, index) => {
      if (result.status === 'success') {
        successCount++;
        console.log(`  ✅ Post ${index + 1}/${posts.length}: Scheduled successfully`);
        if (result.postIds && result.postIds.length > 0) {
          result.postIds.forEach(post => {
            console.log(`     Platform: ${post.platform}, ID: ${post.id}`);
          });
        }
      } else {
        errorCount++;
        console.log(`  ❌ Post ${index + 1}/${posts.length}: Failed to schedule`);
        if (result.errors && result.errors.length > 0) {
          console.log(`     Errors: ${JSON.stringify(result.errors)}`);
        }
      }
    });

    console.log('');
    console.log(`✅ Successfully scheduled: ${successCount}/${posts.length} posts`);
    if (errorCount > 0) {
      console.log(`❌ Failed to schedule: ${errorCount}/${posts.length} posts`);
    }

    if (!scheduleDate) {
      console.log('🎉 Your thread has been posted immediately!');
    } else {
      console.log(`⏰ Your thread will start posting at: ${new Date(scheduleDate).toLocaleString()}`);
      if (intervalMinutes > 1) {
        const endTime = new Date(scheduleDate);
        endTime.setMinutes(endTime.getMinutes() + ((posts.length - 1) * intervalMinutes));
        console.log(`🏁 Last post will be at: ${endTime.toLocaleString()}`);
      }
    }

  } catch (error) {
    console.error('❌ Error scheduling thread:', error);
    
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
  console.log('🧵 Ayrshare Thread Scheduler');
  console.log('');
  console.log('Usage: yarn ayr:thread "tweet1|tweet2|tweet3" [time] [interval]');
  console.log('   or: yarn ayr:thread --file path/to/file.txt [time] [interval]');
  console.log('');
  console.log('Examples:');
  console.log('  yarn ayr:thread "First tweet|Second tweet|Third tweet"');
  console.log('  yarn ayr:thread "Start|Middle|End" "tomorrow 9am" 2');
  console.log('  yarn ayr:thread --file my-thread.txt "in 30 minutes"');
  console.log('  yarn ayr:thread "Teaching AI|Key concepts|Practical tips" "today 2pm" 5');
  console.log('');
  console.log('Parameters:');
  console.log('  content  - Thread content (pipe-separated or file)');
  console.log('  time     - When to start posting (optional)');
  console.log('  interval - Minutes between posts (default: 1)');
  console.log('');
  console.log('Time formats:');
  console.log('  • Relative: "in 30 minutes", "in 2 hours", "in 1 day"');
  console.log('  • Natural: "tomorrow 9am", "today 2pm"');
  console.log('  • ISO: "2024-02-01T15:30:00Z"');
  console.log('');
  console.log('File format:');
  console.log('  One tweet per line in a text file');
  console.log('');
  console.log('Environment variables required:');
  console.log('  AYRSHARE_API_KEY - Your Ayrshare API key');
  process.exit(0);
}

scheduleThread().catch(console.error); 