#!/usr/bin/env node

import { BufferScheduler } from './buffer-scheduler.js';
import { readFileSync } from 'fs';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
🧵 Buffer Thread Scheduler

Usage: 
  yarn tsx schedule-thread.ts "tweet1|tweet2|tweet3" [start-time] [interval-minutes]
  yarn tsx schedule-thread.ts --file thread.txt [start-time] [interval-minutes]

Examples:
  yarn tsx schedule-thread.ts "First tweet|Second tweet|Third tweet"
  yarn tsx schedule-thread.ts "AI is fascinating|Here's why...|Let me explain" "tomorrow 9am" 2
  yarn tsx schedule-thread.ts --file my-thread.txt "in 5 minutes" 1

File format (one tweet per line):
  First tweet in the thread
  Second tweet continues the thought
  Final tweet wraps it up

Options:
  --file: Read thread from a text file (one tweet per line)
  start-time: When to start the thread (default: now)
  interval-minutes: Minutes between tweets (default: 1)
    `);
    process.exit(1);
  }

  try {
    const scheduler = new BufferScheduler();
    let posts: string[] = [];
    let startTimeArg = args[1];
    let intervalArg = args[2];

    // Parse posts from command line or file
    if (args[0] === '--file') {
      if (!args[1]) {
        throw new Error('File path required when using --file option');
      }
      
      const filePath = args[1];
      startTimeArg = args[2];
      intervalArg = args[3];
      
      try {
        const fileContent = readFileSync(filePath, 'utf-8');
        posts = fileContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      } catch (error) {
        throw new Error(`Could not read file ${filePath}: ${error}`);
      }
    } else {
      // Parse from command line argument separated by |
      posts = args[0].split('|').map(post => post.trim());
    }

    // Validate posts
    if (posts.length === 0) {
      throw new Error('No posts found. Please provide at least one tweet.');
    }

    if (posts.length === 1) {
      console.log('⚠️  Only one post detected. Consider using schedule-post.ts for single tweets.');
    }

    // Validate post lengths
    for (let i = 0; i < posts.length; i++) {
      if (posts[i].length > 280) {
        throw new Error(`Tweet ${i + 1} is too long: ${posts[i].length}/280 characters`);
      }
      if (posts[i].length === 0) {
        throw new Error(`Tweet ${i + 1} is empty`);
      }
    }

    // Parse start time
    let startTime = new Date();
    if (startTimeArg) {
      if (startTimeArg.toLowerCase().includes('in ')) {
        startTime = scheduler.parseRelativeTime(startTimeArg);
      } else if (startTimeArg.toLowerCase().includes('tomorrow')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (startTimeArg.includes('9am')) {
          tomorrow.setHours(9, 0, 0, 0);
        } else if (startTimeArg.includes('10am')) {
          tomorrow.setHours(10, 0, 0, 0);
        } else if (startTimeArg.includes('2pm')) {
          tomorrow.setHours(14, 0, 0, 0);
        } else {
          tomorrow.setHours(9, 0, 0, 0);
        }
        
        startTime = tomorrow;
      } else {
        try {
          startTime = new Date(startTimeArg);
          if (isNaN(startTime.getTime())) {
            startTime = scheduler.parseRelativeTime(startTimeArg);
          }
        } catch (error) {
          startTime = scheduler.parseRelativeTime(startTimeArg);
        }
      }

      if (isNaN(startTime.getTime())) {
        throw new Error(`Invalid start time: ${startTimeArg}`);
      }

      if (startTime <= new Date()) {
        throw new Error('Start time must be in the future');
      }
    }

    // Parse interval
    const intervalMinutes = intervalArg ? parseInt(intervalArg) : 1;
    if (isNaN(intervalMinutes) || intervalMinutes < 1) {
      throw new Error('Interval must be a positive number of minutes');
    }

    // Show thread preview
    console.log('\n🧵 THREAD PREVIEW:');
    console.log('═'.repeat(50));
    posts.forEach((post, index) => {
      const postTime = new Date(startTime.getTime() + (index * intervalMinutes * 60000));
      console.log(`${index + 1}/${posts.length} (${postTime.toLocaleTimeString()}): ${post}`);
      console.log('─'.repeat(30));
    });

    console.log(`\n⏰ Thread starts: ${startTime.toLocaleString()}`);
    console.log(`⏱️  Interval: ${intervalMinutes} minute${intervalMinutes === 1 ? '' : 's'}`);
    console.log(`📏 Total duration: ${(posts.length - 1) * intervalMinutes} minutes`);

    // Schedule the thread
    console.log('\n🚀 Scheduling thread...');
    const results = await scheduler.scheduleThread(posts, startTime, intervalMinutes);

    console.log(`\n🎉 Successfully scheduled ${results.length} tweets!`);
    console.log('\n📋 Scheduled Posts:');
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.id} - ${result.due_time}`);
    });

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 