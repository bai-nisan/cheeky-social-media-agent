# How to Customize Prompts Based on Your LinkedIn Posts

## Current Limitation
The system currently generates the same content for both Twitter and LinkedIn, missing LinkedIn's advantages:
- LinkedIn allows 3,000 characters (vs Twitter's 280)
- LinkedIn audiences expect more detailed, professional content
- LinkedIn's algorithm favors native content with high dwell time

## Recommended Approach

### 1. Export Your LinkedIn Posts
First, gather your LinkedIn post history:
- Use LinkedIn's data export feature (Settings & Privacy > Data Privacy > Get a copy of your data)
- Or manually copy your best-performing posts
- Focus on posts with high engagement (likes, comments, shares)

### 2. Analyze Your Post Patterns
Create a spreadsheet with:
- Post content
- Engagement metrics (likes, comments, shares)
- Post structure (intro, body, CTA)
- Topics covered
- Tone and style elements
- Use of emojis, formatting, lists

### 3. Update the Prompt Files

#### A. Update `BUSINESS_CONTEXT` in `src/agents/generate-post/prompts/index.ts`
Replace the current AI focus with your specific domain:
```typescript
export const BUSINESS_CONTEXT = `
[Your industry/domain context]
Target audience: [Your specific audience]
Key topics: [Your main content themes]
`;
```

#### B. Replace Examples in `src/agents/generate-post/prompts/examples.ts`
Structure your examples like this:
```typescript
export const EXAMPLES = [
  `1. [Your highest-performing post]`,
  `2. [Another successful post]`,
  // Add 10-15 of your best posts
].join('\n\n');
```

#### C. Create LinkedIn-Specific Rules
Update `POST_CONTENT_RULES` for LinkedIn's format:
```typescript
export const LINKEDIN_POST_CONTENT_RULES = `
- Longer form: 500-1500 characters optimal
- Professional tone with personality
- Use line breaks for readability
- Include 3-5 relevant hashtags at the end
- Statistics and data points perform well
- Personal stories and lessons learned
- Questions to encourage engagement
`;
```

### 4. Add Platform-Specific Logic

Create a new file `src/agents/generate-post/prompts/linkedin-prompts.ts`:
```typescript
export const LINKEDIN_STRUCTURE = `
1. Hook (1-2 lines with line break)
2. Context/Story (3-5 paragraphs)
3. Key Takeaways (bullet points)
4. Engagement question
5. Hashtags (3-5 relevant ones)
`;
```

### 5. Modify the Generation Logic

In `src/agents/generate-post/nodes/generate-post-graph.ts`, add platform detection:
```typescript
// Around line 63, replace the simple length check with:
const isLinkedIn = true; // or detect from state
const characterLimit = isLinkedIn ? 3000 : 280;

if (cleanedPost.length > characterLimit && state.condenseCount <= 3) {
  return isLinkedIn ? "enhanceForLinkedIn" : "condensePost";
}
```

## Quick Start Script

Here's a script to analyze your posts and generate the prompt updates:

```typescript
// analyze-posts.ts
import fs from 'fs';

interface LinkedInPost {
  content: string;
  likes: number;
  comments: number;
  date: string;
}

function analyzePostPatterns(posts: LinkedInPost[]) {
  // Sort by engagement
  const topPosts = posts
    .sort((a, b) => (b.likes + b.comments * 2) - (a.likes + a.comments * 2))
    .slice(0, 15);
  
  // Extract patterns
  const patterns = {
    avgLength: topPosts.reduce((sum, p) => sum + p.content.length, 0) / topPosts.length,
    commonStarters: extractCommonStarters(topPosts),
    emojiUsage: analyzeEmojiUsage(topPosts),
    hashtagPatterns: extractHashtags(topPosts),
  };
  
  // Generate examples format
  const examples = topPosts.map((post, i) => 
    `${i + 1}. ${post.content}`
  ).join('\n\n');
  
  return { patterns, examples };
}

// Save your posts in a JSON file and run:
// const posts = JSON.parse(fs.readFileSync('my-linkedin-posts.json', 'utf8'));
// const { patterns, examples } = analyzePostPatterns(posts);
```

## Testing Your Customization

1. Back up the original prompt files
2. Update prompts incrementally
3. Test with recent content similar to your posts:
   ```bash
   yarn generate_post --url [article-in-your-domain]
   ```
4. Compare outputs before and after customization
5. Iterate based on results

## Pro Tips

1. **Maintain Your Voice**: Extract phrases and expressions you commonly use
2. **Topic Clustering**: Group examples by topic for better context matching
3. **Engagement Patterns**: Prioritize examples that drove conversations
4. **Format Variety**: Include different post formats (stories, lists, questions)
5. **Update Regularly**: Refresh examples quarterly based on performance

Would you like me to help you create a specific script to analyze your LinkedIn posts once you have them exported?