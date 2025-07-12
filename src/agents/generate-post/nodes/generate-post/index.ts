import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { GeneratePostAnnotation } from "../../generate-post-state.js";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { GENERATE_POST_PROMPT } from "./prompts.js";
import { formatPrompt, formatRawContentPrompt, parseGeneration } from "./utils.js";
import { ALLOWED_TIMES, LLM_PROVIDER } from "../../constants.js";
import {
  getReflectionsPrompt,
  REFLECTIONS_PROMPT,
} from "../../../../utils/reflections.js";
import { getNextSaturdayDate } from "../../../../utils/date.js";

export async function generatePost(
  state: typeof GeneratePostAnnotation.State,
  config: LangGraphRunnableConfig,
): Promise<Partial<typeof GeneratePostAnnotation.State>> {
  // Check if we're using raw content mode or traditional report mode
  const useRawContent = config.configurable?.useRawContentForPost;
  
  if (!useRawContent && !state.report) {
    throw new Error("No report found");
  }
  if (useRawContent && !state.pageContents?.length) {
    throw new Error("No page contents found for raw content mode");
  }
  if (!state.relevantLinks?.length) {
    throw new Error("No relevant links found");
  }
  
  // Choose LLM provider based on configuration
  const llmProvider = config.configurable?.[LLM_PROVIDER] || "anthropic";
  
  const postModel = llmProvider === "openai" 
    ? new ChatOpenAI({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.5"),
      })
    : new ChatAnthropic({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
        temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || "0.5"),
      });

  const prompt = useRawContent 
    ? formatRawContentPrompt(state.pageContents!, state.relevantLinks)
    : formatPrompt(state.report!, state.relevantLinks);

  const reflections = await getReflectionsPrompt(config);
  const reflectionsPrompt = REFLECTIONS_PROMPT.replace(
    "{reflections}",
    reflections,
  );

  const generatePostPrompt = GENERATE_POST_PROMPT.replace(
    "{reflectionsPrompt}",
    reflectionsPrompt,
  );

  const postResponse = await postModel.invoke([
    {
      role: "system",
      content: generatePostPrompt,
    },
    {
      role: "user",
      content: prompt,
    },
  ]);

  // Randomly select a time from the allowed times
  const [postHour, postMinute] = ALLOWED_TIMES[
    Math.floor(Math.random() * ALLOWED_TIMES.length)
  ]
    .split(" ")[0]
    .split(":");
  const postDate = getNextSaturdayDate(Number(postHour), Number(postMinute));

  return {
    post: parseGeneration(postResponse.content as string),
    scheduleDate: postDate,
  };
}
