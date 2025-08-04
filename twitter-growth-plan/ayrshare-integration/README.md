# 🚀 Ayrshare API Twitter Scheduler

Schedule tweets and threads directly from Cursor using Ayrshare's simple API!

## 🎯 Why Ayrshare?

- ⚡ **Dead Simple API** - Just POST with content and date
- 🧵 **Auto-threading** - Long posts automatically split into threads
- 🌐 **12+ Platforms** - Twitter, LinkedIn, Facebook, Instagram, and more
- 📊 **Built-in Analytics** - Track post performance
- 💰 **Affordable** - Starting at $9/month
- 🔗 **Webhook Support** - Get notified when posts go live

## 🏃‍♂️ Quick Start

1. **Add your Ayrshare API key to `.env`:**
   ```bash
   AYRSHARE_API_KEY=your_api_key_here
   ```

2. **Test your setup:**
   ```bash
   yarn ayr:test
   ```

3. **Schedule your first tweet:**
   ```bash
   yarn ayr:tweet "Hello from Cursor! 🚀"
   ```

## 📋 Commands

| Command | Description | Example |
|---------|-------------|---------|
| `yarn ayr:test` | Test your Ayrshare setup | `yarn ayr:test` |
| `yarn ayr:tweet "content" [time]` | Schedule a tweet | `yarn ayr:tweet "AI is amazing!" "tomorrow 9am"` |
| `yarn ayr:thread "tweet1\|tweet2\|tweet3" [time] [interval]` | Schedule a thread | `yarn ayr:thread "First\|Second\|Third" "in 5 minutes" 2` |
| `yarn ayr:manage list` | List scheduled posts | `yarn ayr:manage list` |
| `yarn ayr:manage delete <id>` | Delete a scheduled post | `yarn ayr:manage delete 507f1f77bcf86cd799439011` |
| `yarn ayr:manage profiles` | Show connected accounts | `yarn ayr:manage profiles` |
| `yarn ayr:manage usage` | Show account usage | `yarn ayr:manage usage` |

## ⚡ Examples

### 📝 Tweet Scheduling

```bash
# Post immediately
yarn ayr:tweet "Just shipped a new feature! 🎉"

# Schedule for later
yarn ayr:tweet "Good morning! ☀️" "tomorrow 8am"

# Relative scheduling
yarn ayr:tweet "Working on something cool..." "in 30 minutes"

# Specific time (ISO format)
yarn ayr:tweet "Weekend vibes!" "2024-02-01T17:00:00Z"
```

### 🧵 Thread Scheduling

```bash
# Simple thread
yarn ayr:thread "Here's what I learned about AI|First insight...|Second insight...|Conclusion 🚀"

# Scheduled thread with custom interval
yarn ayr:thread "Teaching moments|Key concepts|Practical tips|Final thoughts" "today 2pm" 5

# Thread from file
echo -e "Tweet 1\nTweet 2\nTweet 3" > my-thread.txt
yarn ayr:thread --file my-thread.txt "in 10 minutes"
```

### 🔧 Management Commands

```bash
# Check what's scheduled
yarn ayr:manage list

# Show connected social media accounts
yarn ayr:manage profiles

# Check account usage and limits
yarn ayr:manage usage

# Delete a scheduled post
yarn ayr:manage delete 507f1f77bcf86cd799439011

# Get analytics for a post
yarn ayr:manage analytics 507f1f77bcf86cd799439011
```

## 🎯 Time Formats

- **Immediate**: No time argument
- **Relative**: `"in 5 minutes"`, `"in 2 hours"`, `"in 1 day"`
- **Tomorrow**: `"tomorrow 9am"`, `"tomorrow 2pm"`
- **Today**: `"today 5pm"`, `"today 14:30"`
- **ISO**: `"2024-02-01T15:30:00Z"`

## 📖 Setup Guide

### Step 1: Create Ayrshare Account

1. Go to [ayrshare.com](https://ayrshare.com)
2. Sign up for an account (free trial available)
3. Choose a plan that fits your needs

### Step 2: Get API Key

1. Log into your [Ayrshare dashboard](https://ayrshare.com/dashboard)
2. Go to "API Keys" section
3. Generate a new API key
4. Copy the API key

### Step 3: Connect Social Media Accounts

1. In your dashboard, go to "Social Accounts"
2. Click "Connect" next to Twitter
3. Authorize Ayrshare to access your Twitter account
4. Verify the connection is successful

### Step 4: Configure Environment

1. Add your API key to `.env`:
   ```bash
   AYRSHARE_API_KEY=your_api_key_here
   ```

2. Test your setup:
   ```bash
   yarn ayr:test
   ```

### Step 5: Start Scheduling!

```bash
yarn ayr:tweet "My first scheduled tweet from Cursor! 🎉"
```

## 🔧 Files

- `ayrshare-scheduler.ts` - Main Ayrshare API client class
- `schedule-post.ts` - CLI for scheduling individual tweets
- `schedule-thread.ts` - CLI for scheduling Twitter threads
- `manage-scheduled.ts` - CLI for managing scheduled posts
- `test-setup.ts` - Setup verification script
- `README.md` - This documentation

## 🆚 Ayrshare vs Buffer

| Feature | Ayrshare | Buffer |
|---------|----------|--------|
| **Setup Complexity** | ⭐⭐⭐⭐⭐ Simple | ⭐⭐⭐ Moderate |
| **API Design** | ⭐⭐⭐⭐⭐ REST + Simple | ⭐⭐⭐⭐ REST |
| **Auto-threading** | ✅ Built-in | ❌ Manual |
| **Monthly Cost** | $9+ | $6+ |
| **Analytics** | ✅ Built-in | ✅ Built-in |
| **Platform Support** | ✅ 12+ platforms | ✅ 8+ platforms |
| **Webhooks** | ✅ Yes | ❌ No |

## 🚀 Advanced Features

### Multi-Platform Posting

```typescript
// Post to multiple platforms
const scheduler = new AyrshareScheduler({ apiKey: process.env.AYRSHARE_API_KEY });

await scheduler.schedulePost(
  "Cross-platform announcement! 🚀",
  "tomorrow 9am",
  {
    platforms: ['twitter', 'linkedin', 'facebook']
  }
);
```

### Media Attachments

```bash
# Note: Media upload coming in next version
# For now, include media URLs in your posts
yarn ayr:tweet "Check out this cool image! https://example.com/image.jpg"
```

### Webhook Notifications

Ayrshare automatically sends webhooks when posts are published. Configure webhook URLs in your dashboard to get real-time notifications.

## ⚠️ Rate Limits

- **Free Plan**: 30 posts/month
- **Starter Plan**: 100 posts/month  
- **Professional Plan**: 1,000 posts/month
- **API Rate Limit**: 100 requests/hour

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Failed (401)**
   - Check your API key is correct
   - Regenerate API key if needed
   - Verify account is active

2. **Rate Limit Exceeded (429)**
   - Wait before retrying
   - Upgrade plan for higher limits
   - Spread out scheduling

3. **Post Not Scheduled**
   - Check social media account is connected
   - Verify content follows platform rules
   - Check account permissions

4. **Time Format Errors**
   - Use supported time formats
   - Check timezone (defaults to local)
   - Use ISO format for precision

### Getting Help

```bash
# Show command help
yarn ayr:tweet --help
yarn ayr:thread --help
yarn ayr:manage --help

# Test your setup
yarn ayr:test

# Check account status
yarn ayr:manage usage
yarn ayr:manage profiles
```

## 🎉 Ready to Schedule!

Your Ayrshare integration is ready to use. Start scheduling tweets from Cursor with these simple commands!

**Pro Tips:**
- Use relative times for quick scheduling
- Leverage auto-threading for long content
- Monitor usage with `yarn ayr:manage usage`
- Set up webhooks for real-time notifications
- Use analytics to track post performance 