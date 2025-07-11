import "dotenv/config";
import { Client } from "@langchain/langgraph-sdk";
import { Command } from "commander";
import {
  SKIP_CONTENT_RELEVANCY_CHECK,
  SKIP_USED_URLS_CHECK,
  TEXT_ONLY_MODE,
} from "../src/agents/generate-post/constants.js";
import { getPersonProfileManager } from "../src/agents/generate-post/person-profiles/index.js";

const program = new Command();

program
  .name("generate-post")
  .description("Generate a social media post from a URL")
  .option("-u, --url <url>", "URL to generate post from", "https://blog.langchain.dev/customers-appfolio/")
  .option("-p, --person <profile-id>", "Person profile ID to use for style")
  .option("--list-profiles", "List available person profiles")
  .option("--text-only", "Run in text-only mode", false)
  .option("--skip-relevancy", "Skip content relevancy check", true)
  .option("--skip-used-urls", "Skip used URLs check", true)
  .action(async (options) => {
    // Handle listing profiles
    if (options.listProfiles) {
      const profileManager = getPersonProfileManager();
      await profileManager.initialize();
      const profiles = await profileManager.listProfiles();
      
      if (profiles.length === 0) {
        console.log("No person profiles found. Create one with: yarn person-profile create <name>");
        return;
      }
      
      console.log("\nAvailable person profiles:");
      profiles.forEach(p => {
        console.log(`- ${p.name} (ID: ${p.id})${p.title ? ` - ${p.title}` : ''}`);
      });
      return;
    }

    // Validate person profile if specified
    if (options.person) {
      const profileManager = getPersonProfileManager();
      await profileManager.initialize();
      const profile = await profileManager.getProfile(options.person);
      
      if (!profile) {
        console.error(`Error: Person profile '${options.person}' not found.`);
        console.log("Run with --list-profiles to see available profiles.");
        process.exit(1);
      }
      
      console.log(`Using person profile: ${profile.name}`);
    }

    // Generate the post
    console.log(`Generating post for: ${options.url}`);
    if (options.person) {
      console.log(`Style: ${options.person}`);
    }

    const client = new Client({
      apiUrl: process.env.LANGGRAPH_API_URL || "http://localhost:54367",
    });

    const { thread_id } = await client.threads.create();
    
    const input: any = {
      links: [options.url],
    };
    
    // Add person profile if specified
    if (options.person) {
      input.personProfileId = options.person;
    }
    
    console.log(`\nStarting post generation...`);
    console.log(`Thread ID: ${thread_id}`);
    
    await client.runs.create(thread_id, "generate_post", {
      input,
      config: {
        configurable: {
          [TEXT_ONLY_MODE]: options.textOnly,
          [SKIP_CONTENT_RELEVANCY_CHECK]: options.skipRelevancy,
          [SKIP_USED_URLS_CHECK]: options.skipUsedUrls,
        },
      },
    });
    
    console.log(`\nPost generation started! Check the Agent Inbox or LangSmith for results.`);
    console.log(`LangSmith: https://smith.langchain.com/o/${process.env.LANGCHAIN_PROJECT || 'default'}/projects/p/${process.env.LANGCHAIN_PROJECT || 'default'}/r/${thread_id}`);
  });

program.parse(process.argv);