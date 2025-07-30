import * as dotenv from "dotenv";
import { TwitterApi } from "twitter-api-v2";

// Load environment variables
dotenv.config();

const hasUserTokens = !!process.env.TWITTER_API_KEY && !!process.env.TWITTER_API_SECRET && !!process.env.TWITTER_ACCESS_TOKEN && !!process.env.TWITTER_ACCESS_SECRET;

const client = hasUserTokens
  ? new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    })
  : new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

/**
 * Returns the URL of the most recent non-reply tweet for the given username.
 */
export async function getLatestTweetUrl(username: string): Promise<string | null> {
  try {
    const user = await client.v2.userByUsername(username);
    const timeline = await client.v2.userTimeline(user.data.id, {
      exclude: "replies",
      max_results: 5,
      "tweet.fields": ["id"],
    });
    const first = timeline.data?.data?.[0];
    if (!first) return null;
    return `https://x.com/${username}/status/${first.id}`;
  } catch (err) {
    console.error(`Failed to fetch tweet for @${username}:`, err);
    return null;
  }
}

// ---- CLI usage (ESM compatible) ----
const isExecutedDirectly = process.argv[1] && process.argv[1].includes("fetch-latest-tweets");
if (isExecutedDirectly) {
  const username = process.argv[2];
  if (!username) {
    console.error("Usage: tsx scripts/fetch-latest-tweets.ts <twitter_handle>");
    process.exit(1);
  }
  getLatestTweetUrl(username).then((url) => {
    if (!url) console.log("No recent tweet found");
    else console.log(url);
  });
} 