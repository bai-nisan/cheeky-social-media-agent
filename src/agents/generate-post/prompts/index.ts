import {
  BUSINESS_CONTEXT as LANGCHAIN_BUSINESS_CONTEXT,
  TWEET_EXAMPLES as LANGCHAIN_TWEET_EXAMPLES,
  POST_STRUCTURE_INSTRUCTIONS as LANGCHAIN_POST_STRUCTURE_INSTRUCTIONS,
  POST_CONTENT_RULES as LANGCHAIN_POST_CONTENT_RULES,
  CONTENT_VALIDATION_PROMPT as LANGCHAIN_CONTENT_VALIDATION_PROMPT,
} from "./prompts.langchain.js";
import { EXAMPLES } from "./examples.js";
import { useLangChainPrompts, activePromptProfile } from "../../utils.js";

export const TWEET_EXAMPLES = EXAMPLES.map(
  (example, index) => `<example index="${index}">\n${example}\n</example>`,
).join("\n");

/**
 * This prompt details the structure the post should follow.
 * Updating this will change the sections and structure of the post.
 * If you want to make changes to how the post is structured, you
 * should update this prompt, along with the `EXAMPLES` list.
 */
export const POST_STRUCTURE_INSTRUCTIONS = `<section key="1">
The first part should be the introduction or hook. This should be short and to the point, ideally no more than 5 words. If necessary, you can include one to two emojis in the header, however this is not required. You should not include emojis if the post is more casual, however if you're making an announcement, you should include an emoji.
</section>

<section key="2">
This section will contain the main content of the post. The post body should contain a concise, high-level overview of the content/product/service/findings outlined in the marketing report.
It should focus on what the content does, shows off, or the problem it solves.
This may include some technical details if the marketing report is very technical, however you should keep in mind your audience is not all advanced developers, so do not make it overly technical.
Ensure this section is short, no more than 3 (short) sentences. Optionally, if the content is very technical, you may include bullet points covering the main technical aspects of the content to make it more engaging and easier to follow.
Remember, the content/product/service/findings outlined in the marketing report is the main focus of this post.
</section>

<section key="3">
The final section of the post should contain a call to action. This should contain a few words that encourage the reader to click the link to the content being promoted.
Optionally, you can include an emoji here.
Ensure you do not make this section more than 3-6 words.
</section>`;

/**
 * This prompt is used when generating, condensing, and re-writing posts.
 * You should make this prompt very specific to the type of content you
 * want included/focused on in the posts.
 */
export const POST_CONTENT_RULES = `- Focus your post on what the content covers, aims to achieve, or the findings of the marketing report. This should be concise and high level.
- Do not make the post over technical as some of our audience may not be advanced developers, but ensure it is technical enough to engage developers.
- Keep posts short, concise and engaging
- Limit the use of emojis to the post header, and optionally in the call to action.
- NEVER use hashtags in the post.
- ALWAYS use present tense to make announcements feel immediate (e.g., "Microsoft just launched..." instead of "Microsoft launches...").
- ALWAYS include the link to the content being promoted in the call to action section of the post.
- You're acting as a human, posting for other humans. Keep your tone casual and friendly. Don't make it too formal or too consistent with the tone.`;

/**
 * This should contain "business content" into the type of content you care
 * about, and want to post/focus your posts on. This prompt is used widely
 * throughout the agent in steps such as content validation, and post generation.
 * It should be generalized to the type of content you care about, or if using
 * for a business, it should contain details about your products/offerings/business.
 */
export const BUSINESS_CONTEXT = `
Here is some context about the types of content you should be interested in prompting:
<business-context>
- AI applications. You care greatly about all new and novel ways people are using AI to solve problems.
- UI/UX for AI. You are interested in how people are designing UI/UXs for AI applications.
- New AI/LLM research. You want your followers to always be up to date with the latest in AI research.
- Agents. You find agents very interesting and want to always be up to date with the latest in agent implementations and systems.
- Multi-modal AI. You're deeply invested in how multi-modal LLMs can be used in AI applications.
- Generative UI. You're interested in how developers are using generative UI to enhance their applications.
- Development software for building AI applications.
- Open source AI/LLM projects, tools, frameworks, etc.
</business-context>`;

/**
 * A prompt to be used in conjunction with the business context prompt when
 * validating content for social media posts. This prompt should outline the
 * rules for what content should be approved/rejected.
 */
export const CONTENT_VALIDATION_PROMPT = `This content will be used to generate engaging, informative and educational social media posts.
The following are rules to follow when determining whether or not to approve content as valid, or not:
<validation-rules>
- The content may be about a new product, tool, service, or similar.
- The content is a blog post, or similar content of which, the topic is AI, which can likely be used to generate a high quality social media post.
- The goal of the final social media post should be to educate your users, or to inform them about new content, products, services, or findings about AI.
- You should NOT approve content from users who are requesting help, giving feedback, or otherwise not clearly about software for AI.
- You only want to approve content which can be used as marketing material, or other content to promote the content above.
</validation-rules>`;

// Import profile prompts statically
import * as nisanPrompts from "./profiles/nisan.js";
import * as galPrompts from "./profiles/gal.js";

function getProfilePrompts(profileName: string) {
  if (profileName === "nisan") {
    return {
      businessContext: nisanPrompts.BUSINESS_CONTEXT,
      tweetExamples: nisanPrompts.TWEET_EXAMPLES,
      postStructureInstructions: nisanPrompts.POST_STRUCTURE_INSTRUCTIONS,
      postContentRules: nisanPrompts.POST_CONTENT_RULES,
      contentValidationPrompt: nisanPrompts.CONTENT_VALIDATION_PROMPT,
    };
  }
  if (profileName === "gal") {
    return {
      businessContext: galPrompts.BUSINESS_CONTEXT,
      tweetExamples: galPrompts.TWEET_EXAMPLES,
      postStructureInstructions: galPrompts.POST_STRUCTURE_INSTRUCTIONS,
      postContentRules: galPrompts.POST_CONTENT_RULES,
      contentValidationPrompt: galPrompts.CONTENT_VALIDATION_PROMPT,
    };
  }
  return null;
}

export function getPrompts() {
  // Check for profile-specific prompts first
  const profile = activePromptProfile();
  if (profile) {
    const profilePrompts = getProfilePrompts(profile);
    if (profilePrompts) {
      return profilePrompts;
    }
  }

  // NOTE: you should likely not have this set, unless you want to use the LangChain prompts
  if (useLangChainPrompts()) {
    return {
      businessContext: LANGCHAIN_BUSINESS_CONTEXT,
      tweetExamples: LANGCHAIN_TWEET_EXAMPLES,
      postStructureInstructions: LANGCHAIN_POST_STRUCTURE_INSTRUCTIONS,
      postContentRules: LANGCHAIN_POST_CONTENT_RULES,
      contentValidationPrompt: LANGCHAIN_CONTENT_VALIDATION_PROMPT,
    };
  }

  return {
    businessContext: BUSINESS_CONTEXT,
    tweetExamples: TWEET_EXAMPLES,
    postStructureInstructions: POST_STRUCTURE_INSTRUCTIONS,
    postContentRules: POST_CONTENT_RULES,
    contentValidationPrompt: CONTENT_VALIDATION_PROMPT,
  };
}
