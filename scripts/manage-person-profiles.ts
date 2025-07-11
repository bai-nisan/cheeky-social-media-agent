#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import inquirer from 'inquirer';
import { PersonProfileManager, LinkedInPost } from '../src/agents/generate-post/person-profiles';

// Load environment variables
config();

const program = new Command();
const profileManager = new PersonProfileManager();

program
  .name('person-profile')
  .description('Manage LinkedIn person profiles for post generation')
  .version('1.0.0');

// List all profiles
program
  .command('list')
  .description('List all available person profiles')
  .action(async () => {
    try {
      const profiles = await profileManager.listProfiles();
      
      if (profiles.length === 0) {
        console.log('No profiles found.');
        return;
      }

      console.log('\nAvailable profiles:');
      console.log('==================');
      profiles.forEach(profile => {
        console.log(`- ${profile.name} (ID: ${profile.id})${profile.title ? ` - ${profile.title}` : ''}`);
      });
    } catch (error) {
      console.error('Error listing profiles:', error);
    }
  });

// Create a new profile
program
  .command('create <person-name>')
  .description('Create a new person profile from LinkedIn posts')
  .option('-f, --file <path>', 'JSON file containing LinkedIn posts')
  .option('-i, --interactive', 'Enter posts interactively')
  .action(async (personName, options) => {
    try {
      let posts: LinkedInPost[] = [];

      if (options.file) {
        // Load posts from file
        const fileContent = await fs.readFile(options.file, 'utf-8');
        posts = JSON.parse(fileContent);
        console.log(`Loaded ${posts.length} posts from ${options.file}`);
      } else if (options.interactive) {
        // Interactive mode
        console.log('Enter LinkedIn posts (press Enter twice to finish a post, type "done" to complete):');
        
        while (true) {
          const { postContent } = await inquirer.prompt([
            {
              type: 'editor',
              name: 'postContent',
              message: 'Enter post content (or type "done" to finish):'
            }
          ]);

          if (postContent.trim().toLowerCase() === 'done') {
            break;
          }

          const { likes, comments } = await inquirer.prompt([
            {
              type: 'number',
              name: 'likes',
              message: 'Number of likes (optional):',
              default: 0
            },
            {
              type: 'number',
              name: 'comments',
              message: 'Number of comments (optional):',
              default: 0
            }
          ]);

          posts.push({
            content: postContent.trim(),
            engagement: likes > 0 || comments > 0 ? { likes, comments, shares: 0 } : undefined
          });

          console.log(`Added post ${posts.length}`);
        }
      } else {
        console.error('Please specify either --file or --interactive option');
        return;
      }

      if (posts.length === 0) {
        console.error('No posts provided');
        return;
      }

      console.log(`\nCreating profile for ${personName} with ${posts.length} posts...`);
      const result = await profileManager.createProfile(personName, posts);
      
      console.log('\n✅ Profile created successfully!');
      console.log(`Profile ID: ${result.profile.id}`);
      console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log('\nProfile summary:');
      console.log(`- Tone: ${result.profile.writingStyle.tone.join(', ')}`);
      console.log(`- Topics: ${result.profile.metadata.topics.join(', ')}`);
      console.log(`- Avg post length: ${result.profile.contentPatterns.postLength.average} chars`);
      console.log(`- Common phrases: ${result.profile.writingStyle.vocabulary.commonPhrases.slice(0, 3).join(', ')}`);
      
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  });

// View a profile
program
  .command('view <profile-id>')
  .description('View details of a person profile')
  .action(async (profileId) => {
    try {
      const profile = await profileManager.getProfile(profileId);
      
      if (!profile) {
        console.error(`Profile not found: ${profileId}`);
        return;
      }

      console.log('\nProfile Details:');
      console.log('================');
      console.log(`Name: ${profile.name}`);
      console.log(`ID: ${profile.id}`);
      if (profile.title) console.log(`Title: ${profile.title}`);
      
      console.log('\nWriting Style:');
      console.log(`- Tone: ${profile.writingStyle.tone.join(', ')}`);
      console.log(`- Sentence structure: ${profile.writingStyle.sentenceStructure}`);
      console.log(`- Common phrases:`);
      profile.writingStyle.vocabulary.commonPhrases.forEach(phrase => {
        console.log(`  • "${phrase}"`);
      });
      
      console.log('\nContent Patterns:');
      console.log(`- Post length: ${profile.contentPatterns.postLength.min}-${profile.contentPatterns.postLength.max} chars (avg: ${profile.contentPatterns.postLength.average})`);
      console.log(`- Emoji usage: ${profile.contentPatterns.emojiUsage.frequency}`);
      console.log(`- Hashtags: ${profile.contentPatterns.hashtagUsage.count} ${profile.contentPatterns.hashtagUsage.placement}`);
      console.log(`- Line breaks: ${profile.contentPatterns.structurePreferences.usesLineBreaks}`);
      
      console.log(`\nExample posts: ${profile.examplePosts.length}`);
      console.log(`Topics: ${profile.metadata.topics.join(', ')}`);
      
    } catch (error) {
      console.error('Error viewing profile:', error);
    }
  });

// Export a profile
program
  .command('export <profile-id>')
  .description('Export a profile to JSON')
  .option('-o, --output <path>', 'Output file path')
  .action(async (profileId, options) => {
    try {
      const profileJson = await profileManager.exportProfile(profileId);
      
      if (options.output) {
        await fs.writeFile(options.output, profileJson, 'utf-8');
        console.log(`Profile exported to: ${options.output}`);
      } else {
        console.log(profileJson);
      }
    } catch (error) {
      console.error('Error exporting profile:', error);
    }
  });

// Import a profile
program
  .command('import <file-path>')
  .description('Import a profile from JSON')
  .action(async (filePath) => {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const profile = await profileManager.importProfile(fileContent);
      console.log(`✅ Profile imported successfully: ${profile.name} (${profile.id})`);
    } catch (error) {
      console.error('Error importing profile:', error);
    }
  });

// Delete a profile
program
  .command('delete <profile-id>')
  .description('Delete a person profile')
  .option('-f, --force', 'Skip confirmation')
  .action(async (profileId, options) => {
    try {
      if (!options.force) {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to delete profile ${profileId}?`,
            default: false
          }
        ]);

        if (!confirm) {
          console.log('Deletion cancelled');
          return;
        }
      }

      await profileManager.deleteProfile(profileId);
      console.log(`✅ Profile deleted: ${profileId}`);
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  });

// Add posts to existing profile
program
  .command('add-posts <profile-id>')
  .description('Add new posts to an existing profile')
  .option('-f, --file <path>', 'JSON file containing LinkedIn posts')
  .action(async (profileId, options) => {
    try {
      if (!options.file) {
        console.error('Please specify --file option with posts to add');
        return;
      }

      const fileContent = await fs.readFile(options.file, 'utf-8');
      const posts = JSON.parse(fileContent) as LinkedInPost[];
      
      console.log(`Adding ${posts.length} posts to profile ${profileId}...`);
      const updatedProfile = await profileManager.addPostsToProfile(profileId, posts);
      
      console.log(`✅ Profile updated successfully`);
      console.log(`Total example posts: ${updatedProfile.examplePosts.length}`);
    } catch (error) {
      console.error('Error adding posts:', error);
    }
  });

// Example posts format
program
  .command('example-format')
  .description('Show example format for posts JSON file')
  .action(() => {
    const example = [
      {
        content: "I've been thinking about what makes engineering teams truly exceptional...\n\nHere's what I learned:\n\n1. Trust is everything\n2. Communication beats code\n3. Learning never stops\n\nWhat's your experience?",
        engagement: {
          likes: 234,
          comments: 45,
          shares: 12
        },
        date: "2024-01-15"
      },
      {
        content: "Real talk: Not every engineer needs to become a manager.\n\nManagement is a career change, not a promotion.",
        engagement: {
          likes: 567,
          comments: 89,
          shares: 34
        },
        date: "2024-01-20"
      }
    ];

    console.log('Example posts.json format:');
    console.log(JSON.stringify(example, null, 2));
  });

program.parse(process.argv);