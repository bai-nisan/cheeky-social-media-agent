# Twitter Post Scheduling Guide

## 🐦 **Multiple Ways to Schedule Twitter Posts**

Based on your existing codebase infrastructure, here are the available methods for scheduling Twitter/X posts:

---

## ✅ **Method 1: LangGraph Cloud Scheduling (RECOMMENDED)**

### What it is:
Your existing social media agent already has built-in Twitter scheduling through LangGraph Cloud's delayed execution feature.

### How it works:
- Uses your existing `upload_post` agent 
- Leverages the `afterSeconds` parameter for delayed posting
- Integrates with your existing Twitter authentication (Basic Auth or Arcade)
- Supports single posts, threads, and media attachments

### Usage:
```typescript
// From your existing codebase
const client = new Client({ apiUrl: process.env.LANGGRAPH_API_URL });

// Schedule a post for 1 hour from now
const thread = await client.threads.create();
const run = await client.runs.create(thread.thread_id, "upload_post", {
  input: {
    post: "Your tweet content here",
    image: "optional-image-url"
  },
  afterSeconds: 3600 // 1 hour delay
});
```

### Advantages:
- ✅ Already implemented and tested
- ✅ Supports your existing auth methods  
- ✅ Handles media uploads
- ✅ Can schedule threads
- ✅ Integrates with Slack notifications
- ✅ Built-in error handling and retries

### Current Scripts:
- `scripts/generate-post.ts` - Generate and schedule posts
- `scripts/get-scheduled-runs.ts` - View scheduled posts
- Use your existing `schedulePost` function in `src/agents/shared/nodes/generate-post/schedule-post.ts`

---

## 🚀 **Method 2: Direct X/Twitter API (IMMEDIATE POSTING)**

### What it is:
Post immediately to Twitter using your existing TwitterClient.

### How it works:
```typescript
import { TwitterClient } from '../src/clients/twitter/client.js';

// Immediate posting
const client = TwitterClient.fromBasicTwitterAuth();
await client.uploadTweet({
  text: "Your tweet content",
  media: optionalMediaBuffer
});

// Thread posting
await client.uploadThread([
  { text: "Tweet 1" },
  { text: "Tweet 2" },
  { text: "Tweet 3" }
]);
```

### Authentication Options:
1. **Basic Auth** (requires env variables):
   - `TWITTER_USER_TOKEN`
   - `TWITTER_USER_TOKEN_SECRET` 
   - `TWITTER_API_KEY`
   - `TWITTER_API_KEY_SECRET`

2. **Arcade Auth** (for OAuth flow):
   - `ARCADE_API_KEY`
   - User-specific tokens

### Current Implementation:
- `src/clients/twitter/client.ts` - Full-featured Twitter client
- `src/agents/upload-post/index.ts` - Upload logic with error handling

---

## 📊 **Method 3: Metricool (ANALYTICS ONLY)**

### Current Status:
❌ **Metricool does NOT support posting/scheduling via API**

### What Metricool CAN do:
- ✅ Analytics and follower tracking (as we set up)
- ✅ Performance monitoring
- ✅ Engagement metrics

### What it CANNOT do:
- ❌ Schedule posts via API
- ❌ Post content directly
- ❌ Manage content calendar programmatically

### Recommendation:
Use Metricool for analytics only, not for posting.

---

## 🔮 **Method 4: Third-Party Tools (FUTURE OPTIONS)**

### Buffer API:
- Paid service with scheduling API
- Would require additional integration
- Good for cross-platform scheduling

### Hootsuite API:
- Enterprise-focused
- Robust scheduling features
- Higher cost

### TweetDeck/X Pro:
- Native X scheduling (manual only)
- No API access

---

## 🎯 **RECOMMENDED SETUP FOR YOU**

Based on your codebase, here's the optimal approach:

### For Immediate Posting:
```bash
# Use your existing scripts
yarn generate-post --immediate
```

### For Scheduled Posting:
```bash
# Schedule using priority system (P1, P2, P3)
yarn generate-post --schedule p2

# Or specific date/time
yarn generate-post --schedule "2025-08-02 10:00 AM PST"
```

### For Bulk Scheduling:
```typescript
// Use your repurposer agent for multiple posts
yarn tsx scripts/repurposer/ingest.ts --url "blog-post-url" --posts 5
```

---

## 📋 **CURRENT CAPABILITIES SUMMARY**

| Method | Immediate | Scheduled | Threads | Media | Status |
|--------|-----------|-----------|---------|-------|--------|
| LangGraph | ✅ | ✅ | ✅ | ✅ | ✅ Working |
| Direct API | ✅ | ❌ | ✅ | ✅ | ✅ Working |
| Metricool | ❌ | ❌ | ❌ | ❌ | ❌ Not supported |
| Buffer | ❌ | ❌ | ❌ | ❌ | 🔮 Future |

---

## 🛠️ **QUICK START EXAMPLES**

### 1. Schedule a Single Post (5 minutes from now):
```bash
cd /path/to/your/project
yarn tsx -e "
import { Client } from '@langchain/langgraph-sdk';
const client = new Client({ apiUrl: process.env.LANGGRAPH_API_URL });
const thread = await client.threads.create();
await client.runs.create(thread.thread_id, 'upload_post', {
  input: { post: 'Hello from scheduled post! 🚀' },
  afterSeconds: 300
});
console.log('Post scheduled for 5 minutes from now!');
"
```

### 2. Post Immediately:
```bash
yarn tsx -e "
import { TwitterClient } from './src/clients/twitter/client.js';
const client = TwitterClient.fromBasicTwitterAuth();
await client.uploadTweet({ text: 'Posted immediately! ⚡' });
console.log('Posted successfully!');
"
```

### 3. View Scheduled Posts:
```bash
yarn tsx scripts/get-scheduled-runs.ts
```

---

## 🔐 **AUTHENTICATION SETUP**

Ensure your `.env` file contains:

```bash
# Twitter API (Basic Auth)
TWITTER_USER_TOKEN=your_token
TWITTER_USER_TOKEN_SECRET=your_secret
TWITTER_API_KEY=your_key
TWITTER_API_KEY_SECRET=your_key_secret

# LangGraph Cloud
LANGGRAPH_API_URL=your_langgraph_url

# Optional: Arcade (for OAuth)
ARCADE_API_KEY=your_arcade_key
TWITTER_USER_ID=your_user_id
```

---

## 💡 **BEST PRACTICES**

1. **Use LangGraph for scheduling** - It's already integrated and tested
2. **Use Direct API for immediate posts** - Fastest for real-time posting  
3. **Use Metricool for analytics** - Great for tracking performance
4. **Test with small delays first** - Start with 1-2 minute schedules
5. **Monitor scheduled runs** - Use `get-scheduled-runs.ts` regularly
6. **Set up Slack notifications** - Get alerts when posts go live

---

## 🚀 **NEXT STEPS**

1. **Test your current setup:**
   ```bash
   yarn tsx twitter-growth-plan/scripts/twitter-scheduler.ts test
   ```

2. **Schedule your first post:**
   ```bash
   yarn generate-post --schedule p3
   ```

3. **Set up regular posting:**
   ```bash
   yarn cron:create  # Use your existing cron system
   ```

Your infrastructure is already robust for Twitter scheduling! 🎉 