#!/usr/bin/env tsx

import 'dotenv/config';
import { AyrshareScheduler } from './ayrshare-scheduler.js';

async function manageScheduled() {
  // Check for required environment variables
  if (!process.env.AYRSHARE_API_KEY) {
    console.error('❌ AYRSHARE_API_KEY environment variable is required');
    console.error('Add it to your .env file: AYRSHARE_API_KEY=your_api_key_here');
    process.exit(1);
  }

  const command = process.argv[2];
  const postId = process.argv[3];

  if (!command) {
    console.error('❌ Command is required');
    console.error('Usage: yarn ayr:manage <command> [postId]');
    console.error('Commands: list, delete, analytics, profiles, usage');
    process.exit(1);
  }

  try {
    const scheduler = new AyrshareScheduler({
      apiKey: process.env.AYRSHARE_API_KEY
    });

    // Validate connection
    console.log('🔄 Connecting to Ayrshare...');
    const isValid = await scheduler.validateConnection();
    if (!isValid) {
      console.error('❌ Failed to connect to Ayrshare. Please check your API key.');
      process.exit(1);
    }

    switch (command.toLowerCase()) {
      case 'list':
      case 'scheduled':
        console.log('📋 Fetching scheduled posts...');
        const scheduledPosts = await scheduler.getScheduledPosts();
        
        if (scheduledPosts.length === 0) {
          console.log('📭 No scheduled posts found');
        } else {
          console.log(`📊 Found ${scheduledPosts.length} scheduled post(s):`);
          console.log('');
          
          scheduledPosts.forEach((post, index) => {
            console.log(`📝 Post ${index + 1}:`);
            console.log(`   ID: ${post.id}`);
            console.log(`   Content: "${post.post.substring(0, 100)}${post.post.length > 100 ? '...' : ''}"`);
            console.log(`   Platforms: ${post.platforms.join(', ')}`);
            console.log(`   Scheduled: ${new Date(post.scheduleDate).toLocaleString()}`);
            console.log(`   Status: ${post.status}`);
            if (post.postIds && post.postIds.length > 0) {
              console.log(`   Post IDs: ${post.postIds.map(p => `${p.platform}:${p.id}`).join(', ')}`);
            }
            console.log('');
          });
        }
        break;

      case 'delete':
      case 'remove':
        if (!postId) {
          console.error('❌ Post ID is required for delete command');
          console.error('Usage: yarn ayr:manage delete <postId>');
          console.error('Use "yarn ayr:manage list" to see available post IDs');
          process.exit(1);
        }
        
        console.log(`🗑️ Deleting scheduled post: ${postId}`);
        const deleteResult = await scheduler.deleteScheduledPost(postId);
        
        if (deleteResult.status === 'success') {
          console.log('✅ Post deleted successfully!');
        } else {
          console.error('❌ Failed to delete post');
          console.error(deleteResult);
        }
        break;

      case 'analytics':
      case 'stats':
        if (!postId) {
          console.error('❌ Post ID is required for analytics command');
          console.error('Usage: yarn ayr:manage analytics <postId>');
          console.error('Use "yarn ayr:manage list" to see available post IDs');
          process.exit(1);
        }
        
        console.log(`📊 Fetching analytics for post: ${postId}`);
        const analytics = await scheduler.getPostAnalytics(postId);
        
        console.log('📈 Post Analytics:');
        console.log(JSON.stringify(analytics, null, 2));
        break;

      case 'profiles':
      case 'accounts':
        console.log('👥 Fetching connected social media profiles...');
        const profiles = await scheduler.getProfiles();
        
        console.log('🔗 Connected Profiles:');
        if (profiles.profiles && profiles.profiles.length > 0) {
          profiles.profiles.forEach((profile: any, index: number) => {
            console.log(`${index + 1}. ${profile.platform || 'Unknown Platform'}`);
            console.log(`   Username: ${profile.username || 'N/A'}`);
            console.log(`   Profile Key: ${profile.profileKey || 'N/A'}`);
            console.log(`   Status: ${profile.status || 'N/A'}`);
            console.log('');
          });
        } else {
          console.log('📭 No connected profiles found');
        }
        break;

      case 'usage':
      case 'limits':
        console.log('📊 Fetching account usage and limits...');
        const usage = await scheduler.getUsage();
        
        console.log('💳 Account Information:');
        console.log(JSON.stringify(usage, null, 2));
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.error('Available commands: list, delete, analytics, profiles, usage');
        process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error managing scheduled posts:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        console.error('🔑 Authentication failed. Please check your AYRSHARE_API_KEY');
      } else if (error.message.includes('429')) {
        console.error('⏰ Rate limit exceeded. Please wait and try again');
      } else if (error.message.includes('404')) {
        console.error('🔍 Post not found. Please check the post ID');
      }
    }
    
    process.exit(1);
  }
}

// Show usage help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('🔧 Ayrshare Scheduled Post Manager');
  console.log('');
  console.log('Usage: yarn ayr:manage <command> [postId]');
  console.log('');
  console.log('Commands:');
  console.log('  list      - List all scheduled posts');
  console.log('  delete    - Delete a scheduled post (requires postId)');
  console.log('  analytics - Get analytics for a post (requires postId)');
  console.log('  profiles  - Show connected social media accounts');
  console.log('  usage     - Show account usage and limits');
  console.log('');
  console.log('Examples:');
  console.log('  yarn ayr:manage list');
  console.log('  yarn ayr:manage delete 507f1f77bcf86cd799439011');
  console.log('  yarn ayr:manage analytics 507f1f77bcf86cd799439011');
  console.log('  yarn ayr:manage profiles');
  console.log('  yarn ayr:manage usage');
  console.log('');
  console.log('Environment variables required:');
  console.log('  AYRSHARE_API_KEY - Your Ayrshare API key');
  process.exit(0);
}

manageScheduled().catch(console.error); 