# Prompts Flow Documentation

This document outlines all prompts used in the report and post generation workflow, their locations, and purposes.

## Overview

The social media agent uses a multi-stage prompt pipeline:
1. **Content Ingestion** → 2. **Report Generation** → 3. **Post/Thread Generation** → 4. **Human Review** → 5. **Reflection & Learning**

## Report Generation Flow

### 1. Extract Key Details (Optional - O1 Model Path)
- **Location**: `src/agents/generate-report/prompts.ts`
- **Prompt**: `EXTRACT_KEY_DETAILS_PROMPT`
- **Purpose**: Pre-processes content to extract key technical details before report generation when using O1 model
- **What it does**: Instructs AI to read content carefully, group similar details together, and extract ALL key technical details (no detail too small or large) for use in report generation

### 2. Generate Marketing Report
- **Primary Location**: `src/agents/generate-post/nodes/generate-report/prompts.ts`
- **Prompt**: `GENERATE_REPORT_PROMPT`
- **Purpose**: Transforms raw content (articles, papers, repos) into structured 3-part marketing reports
- **What it does**: 
  - Acts as a marketing employee creating detailed reports
  - Reads content thoroughly and takes notes (in `<thinking>` tags)
  - Creates 3-part report: introduction, business context relation, additional details
  - Focuses on technical details for developer audience
  - Outputs markdown format wrapped in `<report>` tags

- **Alternative Location**: `src/agents/generate-report/prompts.ts`
- **Alternative Prompt**: `GENERATE_REPORT_PROMPT_O1` (for O1 model)
- **What it does**: Similar to above but uses pre-extracted key details as emphasis points and creates a 4-part report with extra section for additional details

## Post Generation Flow

### 1. Business Context & Rules
- **Location**: `src/agents/generate-post/prompts/index.ts`
- **Prompts**:
  - `BUSINESS_CONTEXT` - Defines target content (AI applications, agents, RAG, etc.)
    - **What it does**: Specifies interest areas including AI applications, UI/UX for AI, research, agents, multi-modal AI, voice agents, computer use, and more
  - `POST_STRUCTURE_INSTRUCTIONS` - 3-section post structure
    - **What it does**: Defines format as 5-word hook + 3-sentence body + 3-6 word call-to-action
  - `POST_CONTENT_RULES` - Style and content guidelines
    - **What it does**: Sets tone as casual, present tense, no hashtags, limited emojis, developer-focused
  - `CONTENT_VALIDATION_PROMPT` - Relevance validation rules
    - **What it does**: Defines criteria for approving/rejecting content based on relevance to AI applications and business context
- **Purpose**: Provides overarching context and rules for all post generation

### 2. Example Posts
- **Location**: `src/agents/generate-post/prompts/examples.ts`
- **Content**: `EXAMPLES` array with 16 real post examples
- **Purpose**: Style reference for AI to emulate when generating posts
- **What it contains**: Real-world examples of successful posts following the desired format and tone

### 3. Generate Social Media Post
- **Location**: `src/agents/generate-post/nodes/generate-post/prompts.ts`
- **Prompt**: `GENERATE_POST_PROMPT`
- **Purpose**: Converts marketing reports into LinkedIn/Twitter posts
- **What it does**:
  - Reads marketing report thoroughly
  - Takes notes on engagement strategies (in `<thinking>` tags)
  - Creates a single post following specific structure (hook, body, call-to-action)
  - Keeps posts short, engaging, and developer-focused
  - Outputs wrapped in `<post>` tags

## Thread Generation Flow

### 1. Plan Thread Structure
- **Location**: `src/agents/generate-thread/nodes/generate-thread-plan.ts`
- **Prompt**: `PROMPT`
- **Purpose**: Creates detailed thread outline with intro, body sections, and conclusion
- **What it does**:
  - Creates outline for Twitter threads (3-10 posts)
  - Includes introduction, body sections for each post topic, and conclusion
  - Targets AI enthusiasts and developers
  - Outputs total post count in `<total-posts>` tags

### 2. Generate Thread Posts
- **Location**: `src/agents/generate-thread/nodes/generate-thread-posts.ts`
- **Prompts**:
  - `FIRST_POST_PROMPT` - Creates engaging hook/intro
    - **What it does**: Generates compelling opening post under 280 characters to hook readers
  - `FOLLOWING_POST_PROMPTS` - Generates body posts
    - **What it does**: Creates body posts that maintain coherence and flow with previous posts
  - `FINAL_POST_PROMPT` - Creates conclusion with CTA
    - **What it does**: Wraps up thread with summary and call-to-action
  - `STYLE_RULES` - Tweet formatting guidelines
    - **What it does**: Defines formatting rules for readability and engagement
- **Purpose**: Generates individual tweets following the thread plan

### 3. Rewrite Thread (User Feedback)
- **Location**: `src/agents/generate-thread/nodes/rewrite-thread.ts`
- **Prompt**: `REWRITE_THREAD_PROMPT`
- **Purpose**: Edits threads based on user feedback while maintaining structure
- **What it does**:
  - Reviews original thread and plan
  - Applies user-requested changes
  - Keeps reflections/rules in mind
  - Returns all posts (both updated and unchanged)

## Supporting Prompts

### Content Curation
- **Location**: `src/agents/curate-data/nodes/tweets/prompts.ts`
- **Prompt**: `GROUP_BY_CONTENT_CRITERIA`
- **Purpose**: Groups tweets by topic for batch processing
- **What it does**:
  - Defines criteria: new models/tools, UI/UX patterns, prompting strategies, general AI news
  - Groups related tweets together
  - Allows tweets to appear in multiple groups
  - Identifies specific products/tools mentioned

### Supervisor Decision Making
- **Group Reports Location**: `src/agents/supervisor/nodes/group-reports.ts`
- **Prompt**: `IDENTIFY_SIMILAR_REPORTS_PROMPT`
- **Purpose**: Identifies related reports for potential thread creation
- **What it does**:
  - Identifies reports on same product/topic
  - Distinguishes between same product but different releases
  - Outputs indices of similar reports for grouping

- **Post Type Location**: `src/agents/supervisor/nodes/determine-post-type.ts`
- **Prompt**: `DETERMINE_POST_TYPE_PROMPT`
- **Purpose**: Decides whether content should be a single post or thread
- **What it does**:
  - Analyzes report complexity and interest level
  - New products/papers → recommends threads
  - Smaller features → recommends single posts
  - Provides reasoning for decision

### Learning & Reflection
- **Location**: `src/agents/reflection/prompts.ts`
- **Prompts**:
  - `REFLECTION_PROMPT` - Analyzes user feedback patterns
    - **What it does**: Compares original vs revised posts, identifies patterns in user feedback, decides if changes should become automatic rules
  - `UPDATE_RULES_PROMPT` - Updates posting rules based on learnings
    - **What it does**: Integrates new rules into existing ruleset, combines similar rules, removes conflicts/duplicates, prioritizes newer rules
- **Purpose**: Continuous improvement based on human feedback

## LangChain-Specific Prompts

- **Location**: `src/agents/generate-post/prompts/prompts.langchain.ts`
- **Purpose**: Alternative prompt set specifically tailored for LangChain ecosystem content
- **Usage**: Activated through configuration when targeting LangChain-specific audiences

## Prompt Switching

The system supports switching between default and LangChain-specific prompts through the main prompts configuration file (`src/agents/generate-post/prompts/index.ts`), allowing customization for different target audiences or content focuses.