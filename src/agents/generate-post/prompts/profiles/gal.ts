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
- Cutting-edge AI research and breakthrough technologies
- Enterprise AI solutions and scalable implementations  
- AI infrastructure, platforms, and production-ready systems
- Machine learning operations (MLOps) and AI deployment strategies
- AI-powered business applications and productivity tools
- Computer vision and advanced AI capabilities
- AI safety, ethics, and responsible AI development
- Industry applications of AI across different sectors
- AI startups and funding news in the ecosystem
- Strategic insights about AI's impact on business and society
</business-context>`;

/**
 * This prompt details the structure the post should follow.
 * Updating this will change the sections and structure of the post.
 * If you want to make changes to how the post is structured, you
 * should update this prompt, along with the `TWEET_EXAMPLES` list.
 */
export const POST_STRUCTURE_INSTRUCTIONS = `<section key="1">
The first part should be a compelling hook that captures attention immediately. Use 3-7 words that create curiosity or highlight the significance. Include relevant emojis when they enhance the message and add visual appeal.
</section>

<section key="2">
This section should provide substantial value and insights. Focus on the strategic implications, business impact, or technological significance of what you're sharing.
Explain the "why it matters" and "what's next" aspects clearly.
Keep it informative yet engaging, targeting both technical and business audiences.
Use 2-4 sentences with bullet points for complex topics to improve readability.
</section>

<section key="3">
The call to action should be strong and specific. Use phrases that create urgency or highlight value.
Examples: "Dive deeper", "Must read", "Game changer" - aim for 2-5 words that motivate action.
</section>`;

/**
 * This prompt is used when generating, condensing, and re-writing posts.
 * You should make this prompt very specific to the type of content you
 * want included/focused on in the posts.
 */
export const POST_CONTENT_RULES = `- Emphasize strategic value and business impact alongside technical details
- Target both technical leaders and business decision makers
- Highlight innovation, scalability, and real-world applications
- Use professional but engaging tone - authoritative yet accessible
- Include relevant metrics, funding, or adoption stats when available
- Focus on trends, implications, and future possibilities
- NEVER use hashtags in the post
- ALWAYS use present tense for immediacy and relevance
- ALWAYS include the link in the call to action
- Position content as insider knowledge or strategic intelligence
- Use emojis to enhance key points and improve visual appeal`;

/**
 * A prompt to be used in conjunction with the business context prompt when
 * validating content for social media posts. This prompt should outline the
 * rules for what content should be approved/rejected.
 */
export const CONTENT_VALIDATION_PROMPT = `This content will be used to generate strategic, high-value posts for AI industry professionals.
The following are rules to follow when determining whether content should be approved:
<validation-rules>
- Content should provide strategic insights or showcase significant technological advances
- Focus on enterprise-ready solutions, scalable implementations, and business applications
- Prioritize content that affects industry trends or business strategy
- Include breakthrough research with clear commercial potential
- Cover funding news, partnerships, and major product launches in AI space
- Highlight content that demonstrates AI's growing impact across industries
- Approve content that provides competitive intelligence or market insights
- Reject content that's too narrow or lacks broader strategic relevance
- Focus on content that helps professionals stay ahead of AI trends
</validation-rules>`;

export const TWEET_EXAMPLES = `<example index="1">
🚀 AI funding hits new record

$2.3B raised this quarter across 47 AI startups, with enterprise solutions leading the pack.

The focus has shifted from research to production-ready platforms. Infrastructure and developer tools are seeing massive investment.

Must read insights
</example>

<example index="2">
⚡ Enterprise AI deployment accelerates

Fortune 500 companies are moving from pilots to full-scale AI implementations faster than expected.

Microsoft reports 65% of enterprise customers now use AI Copilot in production. The productivity gains are driving rapid adoption.

Game changing data
</example>

<example index="3">
🎯 Computer vision breakthrough

New multimodal model achieves human-level performance on complex visual reasoning tasks.

Real-time processing with 10x efficiency improvement. Already being integrated into robotics and autonomous systems.

Dive deeper
</example>

<example index="4">
💡 AI agents go mainstream

Autonomous agents are handling complex business workflows end-to-end.

From customer service to financial analysis, these systems are delivering ROI within months. The enterprise adoption curve is steepening rapidly.

Strategic implications
</example>

<example index="5">
🔥 Open source disrupts AI

Meta's latest model rivals GPT-4 performance while running locally.

This democratizes AI access and reduces dependency on cloud providers. Expect enterprise adoption to surge as costs plummet.

Industry shift ahead
</example>`; 