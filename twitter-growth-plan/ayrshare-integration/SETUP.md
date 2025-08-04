# 🚀 Ayrshare Integration - Quick Setup Guide

Get up and running with Ayrshare in 5 minutes!

## 🎯 Prerequisites

- Node.js and Yarn installed
- A Twitter account
- 5 minutes to spare

## 📋 Step-by-Step Setup

### 1. Create Ayrshare Account (2 minutes)

1. Go to **[ayrshare.com](https://ayrshare.com)**
2. Sign up for a free account
3. You'll get 30 free posts to test with

### 2. Get Your API Key (1 minute)

1. Log into [Ayrshare Dashboard](https://ayrshare.com/dashboard)
2. Navigate to **"API Keys"** in the sidebar
3. Click **"Generate API Key"**
4. Copy the API key (starts with `ayr_...`)

### 3. Connect Your Twitter Account (1 minute)

1. In your dashboard, go to **"Social Accounts"**
2. Click **"Connect"** next to Twitter
3. Authorize Ayrshare to access your Twitter account
4. Verify the green checkmark appears

### 4. Configure Your Environment (30 seconds)

Add your API key to your `.env` file:

```bash
AYRSHARE_API_KEY=ayr_your_api_key_here
```

### 5. Install Dependencies (30 seconds)

```bash
yarn install
```

### 6. Test Your Setup (30 seconds)

```bash
yarn ayr:test
```

You should see:
- ✅ API key validated
- ✅ Connected to Ayrshare
- 🐦 Twitter profile ready for scheduling

## 🎉 You're Ready!

### Quick Examples

```bash
# Post immediately
yarn ayr:tweet "Hello from Ayrshare! 🚀"

# Schedule for later
yarn ayr:tweet "Good morning world!" "tomorrow 8am"

# Create a thread
yarn ayr:thread "Here's my thoughts|First point|Second point|Conclusion"

# Check scheduled posts
yarn ayr:manage list
```

## 🆘 Troubleshooting

### ❌ "Authentication failed"
- Double-check your API key in `.env`
- Make sure there are no extra spaces
- Try regenerating the API key

### ❌ "No connected profiles"
- Go back to dashboard → Social Accounts
- Reconnect your Twitter account
- Wait 30 seconds and try again

### ❌ "Rate limit exceeded"
- Free plan: 30 posts/month
- Wait for the limit to reset
- Consider upgrading your plan

## 📚 Commands Reference

| Command | What it does |
|---------|-------------|
| `yarn ayr:test` | Test your setup |
| `yarn ayr:tweet "content" [time]` | Schedule a tweet |
| `yarn ayr:thread "tweet1\|tweet2" [time]` | Schedule a thread |
| `yarn ayr:manage list` | See scheduled posts |
| `yarn ayr:manage profiles` | Check connected accounts |

## 🔗 Useful Links

- [Ayrshare Dashboard](https://ayrshare.com/dashboard)
- [API Documentation](https://docs.ayrshare.com)
- [Pricing Plans](https://ayrshare.com/pricing)
- [Support](https://ayrshare.com/support)

## 💡 Pro Tips

1. **Use relative times**: `"in 30 minutes"` is easier than exact times
2. **Test with immediate posts** first to make sure everything works
3. **Check your usage** regularly with `yarn ayr:manage usage`
4. **Set up webhooks** in your dashboard for real-time notifications

---

**Need help?** Run any command with `--help` for detailed usage info:
```bash
yarn ayr:tweet --help
yarn ayr:thread --help
yarn ayr:manage --help
``` 