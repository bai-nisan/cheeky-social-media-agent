#!/usr/bin/env tsx

import "dotenv/config";
import { Client } from "@langchain/langgraph-sdk";

/**
 * Schedule a specific tweet for a future date using the upload_post graph
 */
async function scheduleSpecificTweet() {
  // Parse command line arguments
  const content = process.argv[2];
  const dateArg = process.argv[3];
  const timeArg = process.argv[4];

  if (!content || !dateArg) {
    console.error('❌ Usage: yarn schedule:tweet "content" "YYYY-MM-DD" [HH:MM]');
    console.error('Examples:');
    console.error('  yarn schedule:tweet "Hello world!" "2024-08-05"');
    console.error('  yarn schedule:tweet "Good morning!" "2024-08-05" "09:00"');
    process.exit(1);
  }

  // Parse the date and time
  const time = timeArg || "09:00";
  const scheduleDate = new Date(`${dateArg}T${time}:00Z`);
  
  if (isNaN(scheduleDate.getTime())) {
    console.error('❌ Invalid date format. Use YYYY-MM-DD for date and HH:MM for time');
    process.exit(1);
  }

  // Check if date is in the future
  if (scheduleDate <= new Date()) {
    console.error('❌ Schedule date must be in the future');
    process.exit(1);
  }

  console.log(`📅 Scheduling tweet for: ${scheduleDate.toLocaleString()}`);
  console.log(`📝 Content: "${content}"`);

  const client = new Client({
    apiUrl: process.env.LANGGRAPH_API_URL,
  });

  try {
    // Calculate delay in milliseconds
    const delayMs = scheduleDate.getTime() - Date.now();
    
    console.log(`⏱️  Tweet will be posted in ${Math.round(delayMs / 1000 / 60)} minutes`);

    // Create a thread for the upload_post graph
    const thread = await client.threads.create();
    
    // Schedule the post using afterSeconds
    const run = await client.runs.create(thread.thread_id, "upload_post", {
      input: {
        post: content
      },
      config: {
        configurable: {}
      },
      afterSeconds: Math.round(delayMs / 1000) // Convert to seconds
    });

    console.log('✅ Tweet scheduled successfully!');
    console.log(`🔗 Thread ID: ${thread.thread_id}`);
    console.log(`🔗 Run ID: ${run.run_id}`);
    console.log(`⏰ Will post at: ${scheduleDate.toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error scheduling tweet:', error);
    process.exit(1);
  }
}

scheduleSpecificTweet().catch(console.error); 