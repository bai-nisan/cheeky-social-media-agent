# 🚀 Buffer API Twitter Scheduler

Schedule tweets directly from Cursor using Buffer's API!

## 🏃‍♂️ Quick Start

1. **Add your Buffer token to `.env`:**
   ```bash
   BUFFER_ACCESS_TOKEN=your_token_here
   ```

2. **Test your setup:**
   ```bash
   yarn buffer:test
   ```

3. **Schedule your first tweet:**
   ```bash
   yarn tweet "Hello from Cursor! 🚀"
   ```

## 📋 Commands

| Command | Description | Example |
|---------|-------------|---------|
| `yarn buffer:test` | Test your Buffer setup | `yarn buffer:test` |
| `yarn tweet "content" [time]` | Schedule a tweet | `yarn tweet "AI is amazing!" "tomorrow 9am"` |
| `yarn thread "tweet1\|tweet2\|tweet3" [time] [interval]` | Schedule a thread | `yarn thread "First\|Second\|Third" "in 5 minutes" 2` |
| `yarn scheduled list` | List scheduled posts | `yarn scheduled list` |
| `yarn scheduled delete <id>` | Delete a scheduled post | `yarn scheduled delete 507f1f77bcf86cd799439011` |
| `yarn scheduled profiles` | Show connected accounts | `yarn scheduled profiles` |

## ⚡ Examples

```bash
# Immediate post
yarn tweet "Just shipped a new feature! 🎉"

# Scheduled post
yarn tweet "Good morning! ☀️" "tomorrow 8am"

# Relative time
yarn tweet "Working on something cool..." "in 30 minutes"

# Thread
yarn thread "Here's what I learned about AI|First insight...|Second insight...|Conclusion 🚀" "today 2pm" 2

# Thread from file
echo -e "Tweet 1\nTweet 2\nTweet 3" > my-thread.txt
yarn thread --file my-thread.txt "in 10 minutes"

# Check what's scheduled
yarn scheduled list

# Show connected accounts
yarn scheduled profiles
```

## 🎯 Time Formats

- **Immediate**: No time argument
- **Relative**: `"in 5 minutes"`, `"in 2 hours"`, `"in 1 day"`
- **Tomorrow**: `"tomorrow 9am"`, `"tomorrow 2pm"`
- **ISO**: `"2024-02-01T15:30:00Z"`

## 📖 Full Setup Guide

See [SETUP.md](./SETUP.md) for complete setup instructions including:
- Creating Buffer developer account
- Getting access tokens
- Connecting Twitter account
- Troubleshooting common issues

## 🔧 Files

- `buffer-scheduler.ts` - Main Buffer API client class
- `schedule-post.ts` - CLI for scheduling individual tweets
- `schedule-thread.ts` - CLI for scheduling Twitter threads
- `manage-scheduled.ts` - CLI for managing scheduled posts
- `test-setup.ts` - Setup verification script
- `SETUP.md` - Complete setup instructions

## 🎉 Ready to Tweet!

Your Buffer integration is ready to use. Start scheduling tweets from Cursor with these simple commands! 