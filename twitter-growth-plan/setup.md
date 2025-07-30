# Twitter Growth Plan Setup

## Quick Setup

### 1. Install Dependencies
```bash
cd twitter-growth-plan
npm install
```

### 2. Create .env File
Create a `.env` file in this directory with your Twitter API credentials:

```bash
# .env (create this file)
BEARER_TOKEN=your_bearer_token_here
API_KEY=your_api_key_here
API_SECRET_KEY=your_api_secret_key_here
ACCESS_TOKEN=your_access_token_here
ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

### 3. Get Twitter API Credentials
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new project/app
3. Generate Bearer Token (for read-only)
4. Generate API Keys & Access Tokens (for posting)

### 4. Test Your Setup
```bash
# Test API connection
npm run twitter:search "AI marketing"

# Should show recent tweets if working correctly
```

## Available Commands

```bash
# Search recent tweets
npm run twitter:search "your search term"

# Post a tweet (coming soon)  
npm run twitter:post "your tweet text"

# Get trending topics (coming soon)
npm run twitter:trends
```

## File Structure
```
twitter-growth-plan/
├── package.json          # Dependencies and scripts
├── .env                   # Your API keys (create this)
├── scripts/
│   ├── twitter-search.ts  # Search functionality
│   └── twitter-post.ts    # Posting functionality
└── *.md                   # Strategy documentation
```

## Security Notes
- ✅ `.env` is git-ignored (safe to add your keys)
- ✅ Never commit API keys to GitHub
- ✅ Use separate keys for development/production 