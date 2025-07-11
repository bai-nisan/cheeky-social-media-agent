/**
 * This should contain "business content" into the type of content you care
 * about, and want to post/focus your posts on. This prompt is used widely
 * throughout the agent in steps such as content validation, and post generation.
 * It should be generalized to the type of content you care about, or if using
 * for a business, it should contain details about your products/offerings/business.
 */
export const BUSINESS_CONTEXT = `
<business-context>
- Practical tips for developers on integrating and applying AI in daily workflows.
- Updates and breakthroughs in the AI ecosystem (new models, LLM capabilities, tools, research) and their impact on the dev community.
- Developer Experience and tools that streamline development through AI.
- Lessons learned and execution stories from building and running AI-focused tech startups.
- Open-source, architectures and best practices for building AI systems at scale.
</business-context>`;

/**
 * This prompt details the structure the post should follow.
 * Updating this will change the sections and structure of the post.
 * If you want to make changes to how the post is structured, you
 * should update this prompt, along with the `TWEET_EXAMPLES` list.
 */
export const POST_STRUCTURE_INSTRUCTIONS = `<section key="1">
A sharp hook (1–2 lines) highlighting a surprising data point, painful question, or strong counter-intuition.
</section>

<section key="2">
TL;DR — start with the post *type* in square brackets (e.g. [Tip], [Opinion], [Future Thought]) followed by one concise sentence summarising the post.
</section>

<section key="3">
Main story: free-length narrative of the subject (can be a full LinkedIn post or a multi-tweet thread).
</section>

<section key="4">
Takeaway: one sentence distilling the practical value for the reader.
</section>

<section key="5">
CTA: a specific question that invites comments (e.g. "What’s your take on this approach?").
</section>`;

/**
 * This prompt is used when generating, condensing, and re-writing posts.
 * You should make this prompt very specific to the type of content you
 * want included/focused on in the posts.
 */
export const POST_CONTENT_RULES = `- The *output text itself must be written in Hebrew*.
- No emojis, no hashtags.
- Exactly one clear message per post.
- Always explain *why it matters* to developers and illustrate practically.
- No bulleted lists; keep paragraphs short (1–3 lines).
- CTA is always a question encouraging comments, not any marketing action.`;

/**
 * A prompt to be used in conjunction with the business context prompt when
 * validating content for social media posts. This prompt should outline the
 * rules for what content should be approved/rejected.
 */
export const CONTENT_VALIDATION_PROMPT = `The content will be used for LinkedIn tech posts targeting developers and senior technical leaders.
<validation-rules>
- Must provide practical value or a new insight in AI / Dev Experience / startup execution.
- Must be concise, in Hebrew, and emoji-free.
- Must contain a single core message.
- Reject purely promotional or sales-driven material.
- Reject content that merely repeats well-known trivia without added value.
</validation-rules>`;

export const TWEET_EXAMPLES = `<example index="1">
אני בשוק שזה אשכרה עבד 🤯

אתמול חיברתי את קלוד ל-Figma ול-Jira בחיבור MCP, ותוך פחות מ-10 דקות הוא:

👈 יצר לי עיצוב ראשוני לפיצ'ר חדש בהתבסס על Design System קיים שנמצא בתוך פיגמה (תודה ל Sahar Carmel (סהר כרמל) על הרעיון!)

👈 בנה לי לבד פרוייקט שלם לפיצ׳ר החדש בתוך ה-Jira, כולל Epics ו-Stories על בסיס העיצוב שהוא יצר (בהשראת סרטון מעולה של Paweł Huryn)

נשמע מופרך, נכון?
גם אני לא האמנתי שזה יעבוד, עד שראיתי את זה קורה מול העיניים שלי בלייב.

אבל לפני שצוללים, בואו נעצור שנייה ונסביר – מה זה MCP?

אז בגדול זה פרוטוקול תקשורת שיצרה חברת Anthropic (החברה של קלוד), שהפך לאחרונה לסטנדרט גם אצל OpenAI, והוא מאפשר לחבר מודלי שפה למערכות שונות בצורה פשוטה, קלה ומהירה.

מה דעתכם – יצא לכם להתנסות ב-MCP?
</example>

<example index="2">
תעצרו הכל – אתם חייבים לקרוא את הפצצה ש-Tobias Lütke מנכ״ל Shopify הטיל על העובדים שלו בנוגע לציפיות החדשות בעידן ה-AI 👇

🟢 שימוש ב-AI זה כבר לא המלצה אלא דרישה – הציפייה היא לתפוקות שעולות פי 10 עד פי 100.
🟢 AI חייב להיות חלק מהשלב הראשוני בכל פרויקט: לבנות משהו מהיר עם AI ולקבל פידבק.
🟢 מי שרוצה תקציב כח-אדם יצטרך להסביר למה אי אפשר להשיג את זה עם AI.
🟢 הלמידה עצמאית עם הכלים הכי חזקים כמו Cursor, Copilot, Claude code.
🟢 היכולת למנף AI הופכת לחלק מהערכת העובדים והקידומים.

האם אצלכם בארגון כבר מיישמים מדיניות דומה?
</example>

<example index="3">
ה-captcha מת, וביותר מדרך אחת. אם הדאטה שלך מעניין מספיק, מישהו ישלם או יתאמץ כדי לעבור אותו.

הדרך הקלה: לא לקבל captcha, להשתמש בשירות שמגריל כתובות IP ביתיות ולהתחפש לדפדפן רגיל.
דרך נוספת: לתת את ה-captcha לסדנאות יזע בעולם שלישי שיפתרו אותו ב-API תמורת 5$ ל-1,000 פיצוחים.
ואפשר גם לתת ל-AI לפתור captcha בראייה ממוחשבת – קיבלתי 75% הצלחה (בפועל 100% כי יש אינסוף ניסיונות) בעלות $0.002763 לאתגר על yad2 עם hCaptcha.

מה הייתם עושים כדי להקשות על scrape אצלכם?
</example>`; 