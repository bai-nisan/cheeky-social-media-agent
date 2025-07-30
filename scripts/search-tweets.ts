import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';

async function searchTweets(query: string) {
  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);
  const res = await client.v2.search(query, {
    max_results: 10,
    'tweet.fields': ['author_id', 'text', 'created_at'],
  });
  let index = 1;
  for await (const tweet of res) {
    console.log(`[${index}] https://x.com/i/web/status/${tweet.id}`);
    console.log(tweet.text.replace(/\n/g, ' '));
    console.log('---');
    index++;
  }
}

const query = process.argv.slice(2).join(' ');
if (!query) {
  console.error('Usage: tsx scripts/search-tweets.ts <query>');
  process.exit(1);
}
searchTweets(query).catch(err => console.error(err)); 