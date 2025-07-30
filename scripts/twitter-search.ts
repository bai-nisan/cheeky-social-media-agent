import "dotenv/config";
import { TwitterApi } from "twitter-api-v2";

/**
 * Simple CLI: Search recent tweets.
 * Usage: yarn twitter:search "AI marketing"
 */
async function search() {
  const bearer = process.env.BEARER_TOKEN;
  if (!bearer) {
    console.error("❌ Missing BEARER_TOKEN in .env");
    process.exit(1);
  }

  const query = process.argv.slice(2).join(" ") || "AI marketing";
  const client = new TwitterApi(bearer).readOnly;

  const paginator = await client.v2.search(query, {
    max_results: 10,
    "tweet.fields": ["author_id", "created_at", "public_metrics"],
  });

  console.log(`🔍 Top results for: "${query}"`);
  for await (const tweet of paginator) {
    const metrics = tweet.public_metrics;
    console.log(
      `• (${metrics?.like_count ?? 0}❤ ${metrics?.retweet_count ?? 0}🔁) ${tweet.text.replace(/\n/g, " ")}`
    );
  }
}

search().catch((err) => {
  console.error("Twitter search failed", err);
  process.exit(1);
}); 