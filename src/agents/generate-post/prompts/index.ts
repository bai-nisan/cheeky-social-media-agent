import {
  BUSINESS_CONTEXT as LANGCHAIN_BUSINESS_CONTEXT,
  TWEET_EXAMPLES as LANGCHAIN_TWEET_EXAMPLES,
  POST_STRUCTURE_INSTRUCTIONS as LANGCHAIN_POST_STRUCTURE_INSTRUCTIONS,
  POST_CONTENT_RULES as LANGCHAIN_POST_CONTENT_RULES,
  CONTENT_VALIDATION_PROMPT as LANGCHAIN_CONTENT_VALIDATION_PROMPT,
} from "./prompts.langchain.js";
import { EXAMPLES } from "./examples.js";
import { useLangChainPrompts } from "../../utils.js";

export const TWEET_EXAMPLES = EXAMPLES.map(
  (example, index) => `<example index="${index}">\n${example}\n</example>`,
).join("\n");

/**
 * This prompt details the structure the post should follow.
 * Updating this will change the sections and structure of the post.
 * If you want to make changes to how the post is structured, you
 * should update this prompt, along with the `EXAMPLES` list.
 */
export const POST_STRUCTURE_INSTRUCTIONS = `המבנה הזה צריך להיות מכובד תמיד:

<section key="1">
פתיחה - השורה-שתיים הראשונות שמופיעות לפני "...See more"
צריך לתפוס את תשומת הלב מיד עם:
- ניסוח קונטרא מפתיע או שאלה כואבת
- הצהרה שמערערת על מה שחושבים
- נתון חריג או מפתיע
- תחילת סיפור אישי משמעותי
דרכי פתיחה יעילות: "כש...", "מה אם...", "לא חשבתי ש...", "לפני X..."
הפתיחה צריכה ליצור סקרנות ולגרום לאדם לרצות לקרוא הלאה.
</section>

<section key="2">
סיפור אישי - החלק המרכזי של הפוסט
צריך לכלול:
- חוויה אישית או מקצועית אמיתית שקשורה לנושא
- תיאור מצב או אתגר ספציפי
- הכרה בפגיעות, טעויות או אתגרים (לא רק הצלחות)
- פיתוח הסיפור עם פרטים שעושים אותו אמיתי ומעניין
- שימוש בפסקאות קצרות ושורות ריקות ליצירת נשימה
- אפשרות לאנלוגיה או דוגמה קונקרטית להבהרת הנקודה
הסיפור צריך להיות אותנטי ולהראות את הצד האנושי מאחורי הטכנולוגיה.
</section>

<section key="3">
תובנה מרכזית - הלקח העיקרי
צריך לכלול:
- מסר אחד וברור שנגזר מהסיפור
- קישור בין החוויה האישית למגמה רחבה יותר
- תובנה שהקוראים יוכלו לקחת ולהחיל
- הרחבה קצרה על המשמעות הרחבה יותר
- עדיפות להתמקד במסר אחד במקום מספר עצות
התובנה צריכה להיות מעשית ורלוונטית לקהל היעד.
</section>

<section key="4">
קריאה לפעולה - סיום אינטראקטיבי
צריך לכלול:
- שאלה ספציפית שמעודדת דיון אמיתי
- הזמנה לשיתוף חוויות דומות
- יצירת תחושת שיח פתוח
דוגמאות לסיומים טובים: "מה דעתכם?", "איפה אתם בסקאלה?", "מה עבד אצלכם?", "איך אתם מתמודדים עם זה?"
הימנעות מקריאות לפעולה כלליות כמו "תשאירו תגובה" או "תסמנו חברים".
</section>`;

/**
 * Post content rules and principles - used during post creation, condensing, and rewriting.
 * Make these rules specific to the type of content you want to include and focus on.
 */
export const POST_CONTENT_RULES = `כללי שפה וסגנון:
- כתיבה בעברית בלבד, ללא שימוש בסמלי הבעה כלל
- טון אישי, אותנטי ולא פורמלי - כתיבה כמו בשיחה עם חבר
- שימוש בכתיבה בגוף ראשון - "אני", "התחלתי", "הבנתי"
- שפה יומיומית ופשוטה - הימנעות מז'רגון מקצועי מיותר
- שימוש בביטויים עממיים וישראליים טבעיים
- שילוב הומור מתאים כשרלוונטי
- כתיבה ישירה ובלי פניות מנומסות מיותר
- עדיפות למילים בעברית על פני מילים זרות

כללי מבנה ויזואלי:
- פסקאות קצרות - 1-3 שורות לפסקה
- שורות ריקות רבות בין פסקאות ליצירת נשימה ויזואלית
- משפטים יחידים בשורה נפרדת להדגשה ויצירת אפקט דרמטי
- שימוש ב"..." לבניית מתח ומעברים
- מעבר לשורה חדשה לפני נקודות שיא
- אורך של 200-600 מילים - פוסטים ארוכים אך בעלי קריאות גבוהה

כללי תוכן ואותנטיות:
- התמקדות במסר אחד וחד - לא רשימות עצות או מספר תובנות
- שיתוף חוויות אישיות ומקצועיות אמיתיות
- הכרה בפגיעות, טעויות ואתגרים - לא רק הצלחות
- הודאה בחוסר וודאות ובלמידה מתמשכת
- שילוב רגשות אמיתיים ואנושיים
- איזון בין אופטימיות למציאותיות
- הימנעות מהכללות או קביעות מוחלטות
- חיבור בין חוויות קטנות למגמות גדולות בתעשייה

דפוסים לשוניים מועדפים:
- פתיחות טיפוסיות: "כש...", "מה אם...", "לא חשבתי ש...", "לפני X..."
- מעברים: "אבל...", "וזה בדיוק...", "ואז...", "הבעיה היא...", "והאמת?"
- סיומים: שאלות פתוחות, בקשה לשיתוף, מחשבות על העתיד

מה לא לעשות:
- הימנעות מלשון שיווקית או קלישאות
- אי כתיבת פוסטים פורמליים או יבשים
- אי שימוש ברשימות מובנות (•) - הזרמה בפסקאות
- הימנעות מהכללות גדולות בלי הקשר אישי
- אי שכיחת הממד האנושי מאחורי הטכנולוגיה
- הימנעות מפיזור במספר מסרים - התמקדות במסר אחד
- אי כתיבת קריאה לפעולה כללית כמו "תשאירו תגובה" - עידוד לדיון אמיתי
- הימנעות מהשוואות או התנשאות על אחרים
- אי שימוש בביטויים זרים או טכניים מיותר
- הימנעות מלשון עסקית או תאגידית`;

/**
 * Business context - contains details about the types of content that are interesting and should be focused on.
 * Used in many places in the system like content validation and post creation.
 * Should be general to the type of content that's interesting, or specific to a particular business.
 */
export const BUSINESS_CONTEXT = `הקשר על סוגי התוכן והנושאים שאתה מתעניין בהם:

<business-context>
תחומי מומחיות מרכזיים:
- בינה מלאכותית ומודלי שפה - פיתוח, יישום וחדשנות בתחום
- גישת בינה מלאכותית-תחילה - איך לבנות מוצרים ותהליכים עם בינה מלאכותית בליבה
- שיווק ובינה מלאכותית - שימוש בבינה מלאכותית לשיפור תהליכי השיווק
- קוד ובינה מלאכותית - שילוב של בינה מלאכותית בתהליכי פיתוח תוכנה
- מחשבה מהירה - גישה מהירה לקבלת החלטות ולביצוע
- קבלת החלטות מהירה - תהליכי החלטה מהירים וביצוע יעיל
- שותפים מייסדים בסטארטאפ - חוויות שותפות וייסוד חברות

נושאים מעניינים לפוסטים:
- חדשנות טכנולוגית והשפעתה על העסקים
- ניהול צוותים בעידן הטכנולוגיה
- תהליכי פיתוח מוצר וטכנולוגיה
- חוויות יזמות ושותפות עסקית
- תובנות על השוק והטכנולוגיה בישראל
- אתגרי התמודדות עם מציאות הביטחון בישראל
- מעבר מרעיון לביצוע בעסקים טכנולוגיים
- התמודדות עם כישלונות ולמידה מהם
- בניית מוצרים בעולם המשתנה מהר

סגנון התוכן:
- דגש על חוויות אישיות ומקצועיות
- חיבור בין סיפורים אישיים לתובנות עסקיות
- התמקדות בצד האנושי מאחורי הטכנולוגיה
- שילוב מציאות ישראלית ואתגרים מקומיים
- גישה מעשית ולא תיאורטית לנושאים
- עידוד למחשבה ולדיון פתוח
- שיתוף תהליכי חשיבה ולמידה
</business-context>`;

/**
 * Content validation prompt - used together with the business context to validate content for posts.
 * Should include rules about what to approve and what to reject.
 */
export const CONTENT_VALIDATION_PROMPT = `התוכן הזה ישמש ליצירת פוסטים מעניינים, מידעתיים וחינוכיים לרשתות החברתיות.
להלן הכללים לקביעה האם לאשר תוכן כתקף או לא:
<validation-rules>
- התוכן יכול להיות על מוצר, כלי, שירות או דבר דומה חדש.
- התוכן הוא פוסט בבלוג או תוכן דומה שהנושא שלו קשור לבינה מלאכותית ויכול לשמש ליצירת פוסט איכותי.
- המטרה של הפוסט הסופי צריכה להיות לחנך את העוקבים או ליידע אותם על תוכן, מוצרים, שירותים או ממצאים חדשים בתחום הבינה המלאכותית.
- אין לאשר תוכן ממשתמשים שמבקשים עזרה, נותנים פידבק, או שלא עוסקים בבירור בתוכנה לבינה מלאכותית.
- רק תוכן שיכול לשמש כחומר שיווקי או תוכן אחר לקידום הנושאים הנ"ל צריך להיות מאושר.
</validation-rules>`;

export function getPrompts() {
  // Note: Probably shouldn't set this unless you want to use LangChain prompts
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
