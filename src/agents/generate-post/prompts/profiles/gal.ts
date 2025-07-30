/**
 * This should contain "business content" into the type of content you care
 * about, and want to post/focus your posts on. This prompt is used widely
 * throughout the agent in steps such as content validation, and post generation.
 * It should be generalized to the type of content you care about, or if using
 * for a business, it should contain details about your products/offerings/business.
 */
export const BUSINESS_CONTEXT = `Context about the types of content and topics you're interested in:
  
  <business-context>
  Core areas of expertise:
  - Artificial intelligence and language models - development, implementation and innovation in the field
  - AI-first approach - how to build products and processes with artificial intelligence at the core
  - Marketing and artificial intelligence - using AI to improve marketing processes
  - Code and artificial intelligence - integrating AI into software development processes
  - Fast thinking - rapid approach to decision making and execution
  - Quick decision making - fast decision processes and efficient execution
  - Startup co-founders - partnership experiences and founding companies
  
  Interesting topics for posts:
  - Technological innovation and its impact on businesses
  - Managing teams in the technology era
  - Product development and technology processes
  - Entrepreneurship and business partnership experiences
  - Insights about the market and technology in Israel
  - Challenges of dealing with security reality in Israel
  - Moving from idea to execution in technology businesses
  - Dealing with failures and learning from them
  - Building products in a rapidly changing world
  
  Content style:
  - Emphasis on personal and professional experiences
  - Connecting personal stories to business insights
  - Focus on the human side behind technology
  - Integration of Israeli reality and local challenges
  - Practical and not theoretical approach to topics
  - Encouragement for thought and open discussion
  - Sharing thought processes and learning
  </business-context>`;

/**
 * This prompt details the structure the post should follow.
 * Updating this will change the sections and structure of the post.
 * If you want to make changes to how the post is structured, you
 * should update this prompt, along with the `TWEET_EXAMPLES` list.
 */
export const POST_STRUCTURE_INSTRUCTIONS = `This structure must always be respected:
  
  <section key="1">
  Opening Hook - The first line or two that appear before "...See more"
  Must grab attention immediately with:
  - Surprising contrarian statement or painful question
  - Statement that challenges what people think
  - Unusual or surprising data point
  - Beginning of a meaningful personal story
  Effective opening patterns: "When...", "What if...", "I didn't think that...", "Before X..."
  The opening should create curiosity and make people want to read more.
  </section>
  
  <section key="2">
  Personal Story - The central part of the post
  Must include:
  - Real personal or professional experience related to the topic
  - Description of a specific situation or challenge
  - Recognition of vulnerabilities, mistakes or challenges (not just successes)
  - Story development with details that make it real and interesting
  - Use of short paragraphs and empty lines to create breathing space
  - Possibility for analogy or concrete example to clarify the point
  The story must be authentic and show the human side behind technology.
  </section>
  
  <section key="3">
  Key Insight - The main takeaway
  Must include:
  - One clear message derived from the story
  - Connection between personal experience and broader trend
  - Insight that readers can take and apply
  - Brief expansion on the broader significance
  - Preference to focus on one message instead of multiple tips
  The insight should be practical and relevant to the target audience.
  </section>
  
  <section key="4">
  Call to Action - Interactive conclusion
  Must include:
  - Specific question that encourages real discussion
  - Invitation to share similar experiences
  - Creating a sense of open dialogue
  Examples of good endings: "What do you think?", "Where are you on the scale?", "What worked for you?", "How do you deal with this?"
  Avoid generic calls to action like "leave a comment" or "tag friends".
  </section>`;

/**
 * This prompt is used when generating, condensing, and re-writing posts.
 * You should make this prompt very specific to the type of content you
 * want included/focused on in the posts.
 */
export const POST_CONTENT_RULES = `Language and style rules:
  - Write in English only, with no emojis at all
  - Personal, authentic and informal tone - write like talking to a friend
  - Use first-person writing - "I", "I started", "I understood"
  - Everyday and simple language - avoid unnecessary professional jargon
  - Use natural colloquial expressions appropriately
  - Include appropriate humor when relevant
  - Direct writing without excessive polite phrases
  - Preference for clear English words over complex terminology
  
  Structure and visual rules:
  - Short paragraphs - 1-3 lines per paragraph
  - Many empty lines between paragraphs to create visual breathing space
  - Single sentences on separate lines for emphasis and dramatic effect
  - Use "..." to build tension and transitions
  - Move to new line before climax points
  - Length of 200-600 words - long posts but with high readability
  
  Content and authenticity rules:
  - Focus on one clear message - not lists of tips or multiple insights
  - Share real personal and professional experiences
  - Acknowledge vulnerabilities, mistakes and challenges - not just successes
  - Admit uncertainty and continuous learning
  - Include real emotions and human elements
  - Balance between optimism and realism
  - Avoid generalizations or absolute statements
  - Connect small experiences to big industry trends
  
  Preferred language patterns:
  - Typical openings: "When...", "What if...", "I didn't think that...", "Before X..."
  - Transitions: "But...", "And that's exactly...", "Then...", "The problem is...", "And the truth?"
  - Endings: Open questions, request for sharing, thoughts about the future
  
  What not to do:
  - Avoid marketing language or clichés
  - Don't write formal or dry posts
  - Don't use structured lists (•) - flow in paragraphs
  - Avoid big generalizations without personal context
  - Don't forget the human dimension behind technology
  - Avoid scattering across multiple messages - focus on one message
  - Don't write generic call to action like "leave a comment" - encourage real discussion
  - Avoid comparisons or condescension toward others
  - Don't use foreign or overly technical expressions
  - Avoid business or corporate language`;

/**
 * A prompt to be used in conjunction with the business context prompt when
 * validating content for social media posts. This prompt should outline the
 * rules for what content should be approved/rejected.
 */
export const CONTENT_VALIDATION_PROMPT = `This content will be used to create interesting, informative and educational posts for social networks.
Here are the rules for determining whether to approve content as valid or not:
<validation-rules>
- The content can be about a new product, tool, service or similar item.
- The content is a blog post or similar content whose topic is related to artificial intelligence and can be used to create a quality post.
- The goal of the final post should be to educate followers or inform them about new content, products, services or findings in the field of artificial intelligence.
- Do not approve content from users asking for help, giving feedback, or not clearly dealing with artificial intelligence software.
- Only content that can serve as marketing material or other content to promote the above topics should be approved.
</validation-rules>`;

export const TWEET_EXAMPLES = `<example index="1">
What if the biggest barrier to AI in your team isn't technological at all

We're in the middle of a process with one of the most fascinating teams we've worked with.
For now they asked not to be exposed, so we'll respect that
but their story is too important not to share.

When we presented them with our tools and methods for integrating AI into the development process,
the first response was:

"Maybe it works at your Base 44.
But here?
With our code?
No way!"

And I already knew this.
I recognized the tone, the fear
It wasn't about the code.
It was about the change.
About the "cheese that moved."

The big thing that AI changed in development is where planning happens.
In the past, we would plan among ourselves, and execute within the development environment.
Today the planning also happens there.
With the AI and with all the relevant context (your code, up-to-date libraries, roles, protocols etc.)

And whoever knows how to plan well,
can get quality results with the press of Enter.
And sometimes it also saves 20 hours of work.

Not everyone accepted this immediately.
But the developers who allowed themselves to open up and "waste" another 3 hours of work on proper planning, discovered that they're not just working differently, they're suddenly achieving results at a completely different pace.

And the truth?
This is what's exciting about every revolution

Technology is important
but humans are the ones who decide in the end.
</example>

<example index="2">
When I started working with AI systems, it was clear that technology was advancing fast. But what caught me was actually something else:

The gap between how ready the system is...
and how ready we are.

The models know how to write, code, make decisions.
But us?
We still need to see. Understand. Trust.

And that's exactly the challenge today. Not the computer's capabilities, but transparency.
Our ability to see what it's doing along the way, why it did it, and where we can stop and steer.

This is exactly why (among other things) tools like Cursor are making a difference.
When writing code with Cursor, you see every step the agent goes through.
You can understand the decisions, intervene, fine-tune, add missing information and context.
And suddenly, instead of a "smart machine" you get a real partner.

And it's not just in code. It's in every field where AI enters.
The outputs are good. Sometimes really better than us.
But it's hard for us to trust, because we don't see the path, only the result.

Kind of like in the autonomous vehicle world.
The technology has long been safer than human drivers.
But it took years to trust it.

And that's how it is today too.
The technology is ready.

But we still need to build the right connection between us and it.
</example>

<example index="3">
A few weeks ago I was at a funeral.

A good friend from the army, a difficult and very painful moment.

Even before the ceremony, I spoke with Nissan Rubinov, my partner.
I told him. Asked him to back me up in one of the meetings and step in for me.

And his response was that of a good partner:
"Disconnect. Be with yourself. Don't worry about work now."
And that was comforting.

But then something happened that I really didn't expect.
When the funeral ceremony ended, I lifted my head
and saw him standing there.

Nissan.

He drove north, in the middle of the day, without saying a word.
He doesn't know the deceased, he just came.
Came to be with me.
He was there the whole time.
Gave me a strong hug.

This isn't just a business partner.
This is a life partner.

We talk a lot about how important it is to find partners who complement us.
Someone who brings skills you don't bring.
Someone who pushes when you break.
But there's also a level above that.

Partnership that doesn't stop at the bank account and clients.
But starts and ends with people.
</example>`; 

  