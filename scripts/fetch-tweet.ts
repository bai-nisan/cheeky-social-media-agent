import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';

async function fetchTweet(tweetId: string) {
  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);
  const tweet = await client.v2.singleTweet(tweetId, { 'tweet.fields': ['text'] });
  console.log(tweet.data?.text);
}

if (process.argv[2]) {
  fetchTweet(process.argv[2]).catch(err => console.error(err));
} else {
  console.error('Usage: tsx scripts/fetch-tweet.ts <tweet_id>');
} 