import { generatePost } from "../agents/generate-post/nodes/generate-post/index.js";
import { GeneratePostAnnotation } from "../agents/generate-post/generate-post-state.js";
import { LLM_PROVIDER } from "../agents/generate-post/constants.js";

describe("generatePost", () => {
  const mockState: typeof GeneratePostAnnotation.State = {
    links: ["https://example.com"],
    relevantLinks: ["https://example.com"],
    pageContents: ["Sample content for testing"],
    imageOptions: ["https://example.com/image.png"],
    report: "Sample report content",
    post: "",
    complexPost: undefined,
    scheduleDate: new Date(),
    userResponse: undefined,
    next: undefined,
    image: undefined,
    condenseCount: 0,
  };

  const mockConfig = {
    configurable: {
      useRawContentForPost: true,
    },
  };

  it("should use Anthropic by default", async () => {
    // Mock ChatAnthropic
    const mockInvoke = jest.fn().mockResolvedValue({
      content: "<post>Generated post content</post>",
    });
    
    jest.doMock("@langchain/anthropic", () => ({
      ChatAnthropic: jest.fn().mockImplementation(() => ({
        invoke: mockInvoke,
      })),
    }));

    const result = await generatePost(mockState, mockConfig);
    
    expect(result.post).toBe("Generated post content");
    expect(mockInvoke).toHaveBeenCalled();
  });

  it("should use OpenAI when configured", async () => {
    // Mock ChatOpenAI
    const mockInvoke = jest.fn().mockResolvedValue({
      content: "<post>OpenAI generated post content</post>",
    });
    
    jest.doMock("@langchain/openai", () => ({
      ChatOpenAI: jest.fn().mockImplementation(() => ({
        invoke: mockInvoke,
      })),
    }));

    const configWithOpenAI = {
      configurable: {
        useRawContentForPost: true,
        [LLM_PROVIDER]: "openai",
      },
    };

    const result = await generatePost(mockState, configWithOpenAI);
    
    expect(result.post).toBe("OpenAI generated post content");
    expect(mockInvoke).toHaveBeenCalled();
  });

  it("should throw error when no page contents in raw content mode", async () => {
    const stateWithoutContent = {
      ...mockState,
      pageContents: [],
    };

    await expect(generatePost(stateWithoutContent, mockConfig)).rejects.toThrow(
      "No page contents found for raw content mode"
    );
  });

  it("should throw error when no relevant links", async () => {
    const stateWithoutLinks = {
      ...mockState,
      relevantLinks: [],
    };

    await expect(generatePost(stateWithoutLinks, mockConfig)).rejects.toThrow(
      "No relevant links found"
    );
  });
}); 