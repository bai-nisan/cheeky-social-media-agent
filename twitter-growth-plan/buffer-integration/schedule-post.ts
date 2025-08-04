#!/usr/bin/env node

import { BufferScheduler } from './buffer-scheduler.js';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
🚀 Buffer Post Scheduler

Usage: yarn tsx schedule-post.ts "Your tweet content" [schedule-time]

Examples:
  yarn tsx schedule-post.ts "Hello World!"
  yarn tsx schedule-post.ts "Check out this cool project!" "2024-02-01T15:30:00Z"
  yarn tsx schedule-post.ts "AI is amazing!" "in 5 minutes"
  yarn tsx schedule-post.ts "Weekly update thread" "tomorrow 9am"

If no schedule time is provided, the post will be sent immediately.
    `);
    process.exit(1);
  }

  const content = args[0];
  const scheduleTimeArg = args[1];

  try {
    const scheduler = new BufferScheduler();
    
    if (!scheduleTimeArg) {
      // Post immediately
      console.log('📤 Posting immediately...');
      await scheduler.postNow(content);
      console.log('✅ Posted successfully!');
    } else {
      // Parse the schedule time
      let scheduleTime: Date;
      
      if (scheduleTimeArg.toLowerCase().includes('in ')) {
        // Handle relative times like "in 5 minutes"
        scheduleTime = scheduler.parseRelativeTime(scheduleTimeArg);
      } else if (scheduleTimeArg.toLowerCase().includes('tomorrow')) {
        // Handle "tomorrow 9am"
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (scheduleTimeArg.includes('9am')) {
          tomorrow.setHours(9, 0, 0, 0);
        } else if (scheduleTimeArg.includes('10am')) {
          tomorrow.setHours(10, 0, 0, 0);
        } else if (scheduleTimeArg.includes('2pm')) {
          tomorrow.setHours(14, 0, 0, 0);
        } else {
          tomorrow.setHours(9, 0, 0, 0); // Default to 9am
        }
        
        scheduleTime = tomorrow;
      } else {
        // Try to parse as ISO date or relative time
        try {
          scheduleTime = new Date(scheduleTimeArg);
          if (isNaN(scheduleTime.getTime())) {
            scheduleTime = scheduler.parseRelativeTime(scheduleTimeArg);
          }
        } catch (error) {
          scheduleTime = scheduler.parseRelativeTime(scheduleTimeArg);
        }
      }

      // Validate the schedule time
      if (isNaN(scheduleTime.getTime())) {
        throw new Error(`Invalid schedule time: ${scheduleTimeArg}`);
      }

      if (scheduleTime <= new Date()) {
        throw new Error('Schedule time must be in the future');
      }

      console.log(`⏰ Scheduling post for: ${scheduleTime.toLocaleString()}`);
      await scheduler.schedulePost(content, scheduleTime);
      console.log('✅ Post scheduled successfully!');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 