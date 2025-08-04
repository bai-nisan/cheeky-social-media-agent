# 🚀 Buffer API Setup Guide

Get Twitter scheduling working from Cursor in 15 minutes!

## 📋 **Prerequisites**

- Node.js and yarn installed
- A Buffer account (free plan works)
- A Twitter account connected to Buffer

---

## 🔧 **Step 1: Create Buffer Developer Account**

1. **Visit Buffer Developers Portal:**
   - Go to https://buffer.com/developers
   - Click "Get Started" or "Create App"

2. **Create Your Application:**
   - App Name: `My Twitter Scheduler`
   - Description: `Twitter scheduling from Cursor`
   - Website URL: `http://localhost:3000` (for development)
   - Callback URL: `http://localhost:3000/auth/callback`

3. **Get Your Credentials:**
   - Copy your **Client ID** and **Client Secret**
   - Save them for the next step

---

## 🔑 **Step 2: Get Access Token**

Buffer uses OAuth 2.0, but for personal use, you can get a token via their web interface:

### **Option A: Personal Access Token (Easiest)**
1. Go to https://buffer.com/developers/apps
2. Click on your app
3. Go to "Access Token" tab
4. Generate a personal access token
5. Copy the token - this is your `BUFFER_ACCESS_TOKEN`

### **Option B: OAuth Flow (For Production)**
You can implement the full OAuth flow later if you want to allow other users to connect their Buffer accounts.

---

## 🔐 **Step 3: Environment Setup**

Create or update your `.env` file in the project root:

```bash
# Add these lines to your .env file
BUFFER_ACCESS_TOKEN=your_access_token_here
BUFFER_CLIENT_ID=your_client_id_here
BUFFER_CLIENT_SECRET=your_client_secret_here
```

**⚠️ Keep your tokens secure and never commit them to Git!**

---

## 🐦 **Step 4: Connect Twitter to Buffer**

1. **Login to Buffer:**
   - Go to https://buffer.com
   - Login to your account

2. **Connect Twitter:**
   - Click "Connect Account" or go to Settings → Channels
   - Select Twitter/X
   - Authorize Buffer to access your Twitter account
   - ✅ Your Twitter account is now connected!

---

## 🧪 **Step 5: Test Your Setup**

Let's verify everything works:

```bash
# Navigate to the buffer integration folder
cd twitter-growth-plan/buffer-integration

# Test your connection
yarn tsx manage-scheduled.ts profiles
```

**Expected output:**
```
👤 Fetching connected profiles...

🔗 Found 1 connected profile:
═══════════════════════════════════════════════
1. 🐦 TWITTER
   🆔 Profile ID: 507f1f77bcf86cd799439011
   👤 Username: @yourusername
   🔗 Service Username: yourusername
```

---

## 🎯 **Step 6: Schedule Your First Tweet**

Now let's schedule a tweet!

```bash
# Schedule a tweet for immediate posting
yarn tsx schedule-post.ts "Hello from Cursor! 🚀"

# Schedule a tweet for later
yarn tsx schedule-post.ts "AI is amazing!" "tomorrow 9am"

# Schedule a tweet in 5 minutes
yarn tsx schedule-post.ts "Testing Buffer API integration" "in 5 minutes"
```

---

## 🧵 **Step 7: Schedule Your First Thread**

```bash
# Schedule a 3-tweet thread
yarn tsx schedule-thread.ts "First tweet|Second tweet continues the thought|Final tweet wraps it up" "in 2 minutes" 1
```

---

## 📋 **Step 8: Manage Scheduled Posts**

```bash
# List all scheduled posts
yarn tsx manage-scheduled.ts list

# Delete a specific post
yarn tsx manage-scheduled.ts delete POST_ID_HERE

# Show connected profiles
yarn tsx manage-scheduled.ts profiles
```

---

## 🛠️ **Available Commands**

Add these to your `package.json` scripts for easier access:

```json
{
  "scripts": {
    "tweet": "yarn tsx twitter-growth-plan/buffer-integration/schedule-post.ts",
    "thread": "yarn tsx twitter-growth-plan/buffer-integration/schedule-thread.ts",
    "scheduled": "yarn tsx twitter-growth-plan/buffer-integration/manage-scheduled.ts"
  }
}
```

Then use them like:
```bash
yarn tweet "My awesome tweet!" "tomorrow 2pm"
yarn thread "Tweet 1|Tweet 2|Tweet 3" "in 10 minutes"
yarn scheduled list
```

---

## 📖 **Usage Examples**

### **Quick Tweet:**
```bash
yarn tweet "Just built something cool with AI! 🤖"
```

### **Scheduled Tweet:**
```bash
yarn tweet "Good morning! Starting my day with some coding ☕" "tomorrow 8am"
```

### **Thread:**
```bash
yarn thread "I've been experimenting with AI agents|Here's what I learned...|The future is exciting! 🚀" "today 2pm" 2
```

### **From File:**
```bash
# Create thread.txt with one tweet per line
echo -e "First tweet\nSecond tweet\nThird tweet" > thread.txt
yarn thread --file thread.txt "in 30 minutes"
```

---

## 🎨 **Integration with Cursor**

### **VS Code Tasks:**
Create `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Schedule Tweet",
      "type": "shell",
      "command": "yarn",
      "args": ["tweet", "${input:content}", "${input:time}"],
      "group": "build"
    }
  ],
  "inputs": [
    {
      "id": "content",
      "description": "Tweet content",
      "type": "promptString"
    },
    {
      "id": "time",
      "description": "Schedule time (e.g., 'in 5 minutes', 'tomorrow 9am')",
      "type": "promptString",
      "default": "now"
    }
  ]
}
```

### **Cursor Rules:**
Add to `.cursor/rules`:
```markdown
When user wants to schedule tweets:
1. Use the Buffer API integration
2. Format: yarn tweet "content" "time"
3. Support relative times like "in 5 minutes" or "tomorrow 9am"
4. Validate tweet length (280 characters max)
```

---

## 🔧 **Troubleshooting**

### **"No Twitter profile found" Error:**
- Ensure you've connected your Twitter account to Buffer
- Check at https://buffer.com/dashboard
- Try disconnecting and reconnecting your Twitter account

### **"Buffer API error: 401 Unauthorized":**
- Check your `BUFFER_ACCESS_TOKEN` in `.env`
- Generate a new access token if needed
- Ensure the token has proper permissions

### **"Tweet is too long" Error:**
- Keep tweets under 280 characters
- Use threads for longer content

### **Rate Limit Issues:**
- Buffer allows 60 requests per minute per user
- Add delays between bulk operations
- Check Buffer's rate limit documentation

---

## 📚 **Next Steps**

1. **Integrate with your content system:** Connect this to your existing content generation pipeline
2. **Add media support:** Upload images with your tweets
3. **Build automation:** Schedule weekly content automatically
4. **Analytics:** Use Buffer's analytics API to track performance
5. **Multiple platforms:** Expand to LinkedIn, Facebook, etc.

---

## 🎉 **You're Ready!**

You now have a powerful Twitter scheduling system that works directly from Cursor! 

**Quick commands to remember:**
- `yarn tweet "content" "time"` - Schedule a tweet
- `yarn thread "tweet1|tweet2|tweet3" "time"` - Schedule a thread
- `yarn scheduled list` - See what's scheduled

Happy tweeting! 🐦✨ 