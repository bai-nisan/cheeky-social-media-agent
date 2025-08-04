#!/usr/bin/env node

import { BufferScheduler } from './buffer-scheduler.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'list';

  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(`
📋 Buffer Scheduled Posts Manager

Commands:
  list, ls          Show all scheduled posts
  delete <post-id>  Delete a specific scheduled post
  profiles          Show connected social media profiles
  clear             Delete all scheduled posts (with confirmation)

Examples:
  yarn tsx manage-scheduled.ts list
  yarn tsx manage-scheduled.ts delete 507f1f77bcf86cd799439011
  yarn tsx manage-scheduled.ts profiles
  yarn tsx manage-scheduled.ts clear
    `);
    process.exit(0);
  }

  try {
    const scheduler = new BufferScheduler();

    switch (command) {
      case 'list':
      case 'ls':
        await listScheduledPosts(scheduler);
        break;

      case 'delete':
        if (!args[1]) {
          console.error('❌ Post ID required for delete command');
          console.log('Usage: yarn tsx manage-scheduled.ts delete <post-id>');
          process.exit(1);
        }
        await deletePost(scheduler, args[1]);
        break;

      case 'profiles':
        await showProfiles(scheduler);
        break;

      case 'clear':
        await clearAllPosts(scheduler);
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Run "yarn tsx manage-scheduled.ts help" for usage information');
        process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function listScheduledPosts(scheduler: BufferScheduler) {
  console.log('📋 Fetching scheduled posts...\n');
  
  const posts = await scheduler.getPendingPosts();
  
  if (posts.length === 0) {
    console.log('✨ No scheduled posts found.');
    console.log('💡 Use "yarn tsx schedule-post.ts" to schedule a new post!');
    return;
  }

  console.log(`📅 Found ${posts.length} scheduled post${posts.length === 1 ? '' : 's'}:\n`);
  console.log('═'.repeat(80));

  posts.forEach((post, index) => {
    const scheduleDate = new Date(post.due_at * 1000);
    const now = new Date();
    const timeUntil = Math.round((scheduleDate.getTime() - now.getTime()) / (1000 * 60));
    
    console.log(`${index + 1}. 🆔 ${post.id}`);
    console.log(`   ⏰ ${scheduleDate.toLocaleString()}`);
    console.log(`   ⏳ ${timeUntil > 0 ? `${timeUntil} minutes from now` : 'Past due'}`);
    console.log(`   📝 "${post.text.length > 100 ? post.text.substring(0, 100) + '...' : post.text}"`);
    console.log(`   📊 Status: ${post.status}`);
    console.log('─'.repeat(50));
  });

  console.log('\n💡 To delete a post, use: yarn tsx manage-scheduled.ts delete <post-id>');
}

async function deletePost(scheduler: BufferScheduler, postId: string) {
  console.log(`🗑️  Deleting post ${postId}...`);
  
  const success = await scheduler.deleteScheduledPost(postId);
  
  if (success) {
    console.log('✅ Post deleted successfully!');
  } else {
    console.log('❌ Failed to delete post. Please check the post ID and try again.');
  }
}

async function showProfiles(scheduler: BufferScheduler) {
  console.log('👤 Fetching connected profiles...\n');
  
  const profiles = await scheduler.getProfiles();
  
  if (profiles.length === 0) {
    console.log('❌ No connected profiles found.');
    console.log('💡 Please connect your social media accounts at buffer.com');
    return;
  }

  console.log(`🔗 Found ${profiles.length} connected profile${profiles.length === 1 ? '' : 's'}:\n`);
  console.log('═'.repeat(60));

  profiles.forEach((profile, index) => {
    console.log(`${index + 1}. ${getServiceEmoji(profile.service)} ${profile.service.toUpperCase()}`);
    console.log(`   🆔 Profile ID: ${profile.id}`);
    console.log(`   👤 Username: ${profile.formatted_username}`);
    console.log(`   🔗 Service Username: ${profile.service_username}`);
    console.log('─'.repeat(40));
  });
}

async function clearAllPosts(scheduler: BufferScheduler) {
  console.log('⚠️  WARNING: This will delete ALL scheduled posts!');
  
  // In a real CLI, you'd want to add a confirmation prompt
  // For now, we'll just show what would be deleted
  const posts = await scheduler.getPendingPosts();
  
  if (posts.length === 0) {
    console.log('✨ No scheduled posts to delete.');
    return;
  }

  console.log(`\n📋 Found ${posts.length} posts that would be deleted:`);
  posts.forEach((post, index) => {
    const scheduleDate = new Date(post.due_at * 1000);
    console.log(`  ${index + 1}. ${post.id} - ${scheduleDate.toLocaleString()}`);
  });

  console.log('\n🚨 To actually delete all posts, run this command for each post ID:');
  console.log('yarn tsx manage-scheduled.ts delete <post-id>');
  console.log('\n💡 Or implement a confirmation prompt in this script for bulk deletion.');
}

function getServiceEmoji(service: string): string {
  switch (service.toLowerCase()) {
    case 'twitter': return '🐦';
    case 'facebook': return '📘';
    case 'linkedin': return '💼';
    case 'instagram': return '📸';
    default: return '🌐';
  }
}

if (require.main === module) {
  main();
} 