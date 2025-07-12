import { filterLinksForPostContent } from "../../../utils.js";

/**
 * Parse the LLM generation to extract the report from inside the <report> tag.
 * If the report can not be parsed, the original generation is returned.
 * @param generation The text generation to parse
 * @returns The parsed generation, or the unmodified generation if it cannot be parsed
 */
export function parseGeneration(generation: string): string {
  const reportMatch = generation.match(/<post>([\s\S]*?)<\/post>/);
  if (!reportMatch) {
    console.warn(
      "Could not parse post from generation:\nSTART OF POST GENERATION\n\n",
      generation,
      "\n\nEND OF POST GENERATION",
    );
  }
  return reportMatch ? reportMatch[1].trim() : generation;
}

  export function formatPrompt(report: string, relevantLinks: string[]): string {
    return `Here is the report I wrote on the content I'd like to write a post about:
<report>
${report}
</report>

Here are the relevant links used to create the report.
You should remove tracking query parameters from the link, if present.
If you are unsure whether a link's parameters are tracking, do not remove them. It's better to have a link with tracking parameters than a broken link.
The links do NOT contribute to the post's length. They are temporarily removed from the post before the length is calculated, and re-added afterwards.
<links>
${filterLinksForPostContent(relevantLinks)}
</links>`;
}

export function formatRawContentPrompt(rawContent: string[], relevantLinks: string[]): string {
  return `Here is the raw content I'd like to write a post about:
<content>
${rawContent.join('\n\n---\n\n')}
</content>

Here are the relevant links used to extract the content.
You should remove tracking query parameters from the link, if present.
If you are unsure whether a link's parameters are tracking, do not remove them. It's better to have a link with tracking parameters than a broken link.
The links do NOT contribute to the post's length. They are temporarily removed from the post before the length is calculated, and re-added afterwards.
<links>
${filterLinksForPostContent(relevantLinks)}
</links>`;
}
