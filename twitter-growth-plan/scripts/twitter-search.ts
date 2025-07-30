import { config } from "dotenv";
import { TwitterApi } from "twitter-api-v2";
import { resolve } from "path";

// Load .env from parent directory (main project root)
const envPath = resolve(process.cwd(), "../.env");
const result = config({ path: envPath });

// Debug: Show if .env loaded successfully
if (result.error) {
  console.error("❌ Error loading .env:", result.error);
} else {
  console.log("✅ .env file loaded successfully");
}

/**
 * Simple CLI: Search recent tweets.
 * Usage: yarn twitter:search "AI marketing"
 */
async function search() {
  console.log(`🔍 Looking for .env at: ${envPath}`);
  
  // Show Twitter-related variables found
  const envVars = Object.keys(process.env).filter(key => 
    key.startsWith('BEARER') || key.startsWith('API') || key.startsWith('ACCESS')
  );
  console.log(`🔑 Twitter-related env vars found: ${envVars.join(', ') || 'none'}`);
  
  if (process.env.BEARER_TOKEN) {
    console.log(`✅ BEARER_TOKEN loaded successfully`);
  }
  
  const bearer = process.env.BEARER_TOKEN;
  if (!bearer) {
    console.error("❌ BEARER_TOKEN not found");
    console.error("💡 Make sure your .env file contains: BEARER_TOKEN=your_token_here");
    if (envVars.length > 0) {
      console.error("💡 Available variables:", envVars.join(', '));
    }
    process.exit(1);
  }

  const query = process.argv.slice(2).join(" ") || "AI marketing";
  console.log(`🔍 Searching Twitter for: "${query}"`);
  
  try {
    const client = new TwitterApi(bearer).readOnly;

    const paginator = await client.v2.search(query, {
      max_results: 10,
      "tweet.fields": ["author_id", "created_at", "public_metrics", "context_annotations"],
      "user.fields": ["username", "verified"],
      expansions: ["author_id"],
    });

    console.log(`\n📊 Top results for: "${query}"\n`);
    
    for await (const tweet of paginator) {
      const metrics = tweet.public_metrics;
      const author = paginator.includes?.users?.find(u => u.id === tweet.author_id);
      const username = author?.username || "unknown";
      const verified = author?.verified ? "✅" : "";
      
      console.log(`👤 @${username} ${verified}`);
      console.log(`📈 ${metrics?.like_count ?? 0}❤ ${metrics?.retweet_count ?? 0}🔁 ${metrics?.reply_count ?? 0}💬`);
      console.log(`📝 ${tweet.text.replace(/\n/g, " ").substring(0, 150)}...`);
      console.log(`🔗 https://twitter.com/${username}/status/${tweet.id}`);
      console.log("---");
    }
    
    console.log("\n✅ Twitter API connection successful!");
    
  } catch (error: any) {
    console.error("❌ Twitter API Error:");
    if (error.code === 401) {
      console.error("🔑 Invalid credentials. Check your BEARER_TOKEN in .env");
    } else if (error.code === 429) {
      console.error("⏰ Rate limit exceeded. Wait 15 minutes and try again.");
    } else {
      console.error(error.message || error);
    }
    process.exit(1);
  }
}

search(); 