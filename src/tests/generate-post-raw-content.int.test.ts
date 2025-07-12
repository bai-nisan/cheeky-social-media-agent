import { describe, it, expect } from "@jest/globals";
import { generatePostGraph } from "../agents/generate-post/generate-post-graph.js";
import { BASE_GENERATE_POST_CONFIG } from "../agents/generate-post/generate-post-state.js";

describe("GeneratePostGraph - Raw Content Mode", () => {
  it("should generate post using raw content mode", async () => {
    console.log("Starting raw content mode test");
    
    const result = await generatePostGraph.invoke(
      {
        links: ["https://github.com/langchain-ai/langgraph"],
      },
      {
        configurable: {
          ...BASE_GENERATE_POST_CONFIG,
          useRawContentForPost: true,
        },
      },
    );

    // Verify that a post was generated
    expect(result.post).toBeDefined();
    expect(result.post.length).toBeGreaterThan(10);
    
    // Verify that no report was generated (since we skipped report generation)
    expect(result.report).toBeUndefined();
    
    // Verify that page contents were used
    expect(result.pageContents).toBeDefined();
    expect(result.pageContents?.length).toBeGreaterThan(0);
    
    console.log("\nGenerated POST (Raw Content Mode):\n");
    console.log(result.post);
    console.log("\nPage Contents Used:\n");
    console.log(result.pageContents?.[0]?.substring(0, 200) + "...");
  }, 60000);

  it("should generate post using traditional report mode for comparison", async () => {
    console.log("Starting traditional report mode test");
    
    const result = await generatePostGraph.invoke(
      {
        links: ["https://github.com/langchain-ai/langgraph"],
      },
      {
        configurable: {
          ...BASE_GENERATE_POST_CONFIG,
          useRawContentForPost: false,
        },
      },
    );

    // Verify that a post was generated
    expect(result.post).toBeDefined();
    expect(result.post.length).toBeGreaterThan(10);
    
    // Verify that a report was generated (traditional flow)
    expect(result.report).toBeDefined();
    expect(result.report.length).toBeGreaterThan(10);
    
    // Verify that page contents were also available
    expect(result.pageContents).toBeDefined();
    expect(result.pageContents?.length).toBeGreaterThan(0);
    
    console.log("\nGenerated POST (Traditional Report Mode):\n");
    console.log(result.post);
    console.log("\nGenerated Report:\n");
    console.log(result.report.substring(0, 200) + "...");
  }, 60000);

  it("should handle both modes with the same input and produce different workflows", async () => {
    const testUrl = "https://github.com/langchain-ai/langgraph";
    
    // Test raw content mode
    const rawContentResult = await generatePostGraph.invoke(
      { links: [testUrl] },
      {
        configurable: {
          ...BASE_GENERATE_POST_CONFIG,
          useRawContentForPost: true,
        },
      },
    );

    // Test traditional mode
    const traditionalResult = await generatePostGraph.invoke(
      { links: [testUrl] },
      {
        configurable: {
          ...BASE_GENERATE_POST_CONFIG,
          useRawContentForPost: false,
        },
      },
    );

    // Both should generate posts
    expect(rawContentResult.post).toBeDefined();
    expect(traditionalResult.post).toBeDefined();
    
    // Raw content mode should not have a report
    expect(rawContentResult.report).toBeUndefined();
    
    // Traditional mode should have a report
    expect(traditionalResult.report).toBeDefined();
    
    // Both should have the same page contents (from verify-links)
    expect(rawContentResult.pageContents).toBeDefined();
    expect(traditionalResult.pageContents).toBeDefined();
    
    console.log("\nComparison Results:");
    console.log("Raw Content Post Length:", rawContentResult.post.length);
    console.log("Traditional Post Length:", traditionalResult.post.length);
    console.log("Traditional Report Generated:", !!traditionalResult.report);
    console.log("Raw Content Report Generated:", !!rawContentResult.report);
  }, 120000);

  it("should default to raw content mode when flag is omitted", async () => {
    const testUrl = "https://github.com/langchain-ai/langgraph";

    // Invoke without explicitly setting `useRawContentForPost` – should pick up default (true)
    const defaultResult = await generatePostGraph.invoke({ links: [testUrl] });

    // A post should have been generated
    expect(defaultResult.post).toBeDefined();

    // Report generation should have been skipped
    expect(defaultResult.report).toBeUndefined();
  }, 60000);
}); 