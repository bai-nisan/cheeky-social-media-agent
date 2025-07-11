# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Social Media Agent is an AI-powered LangGraph application that automates social media content generation. It processes URLs and generates Twitter/LinkedIn posts with human-in-the-loop approval workflows.

## Essential Commands

### Development
- `yarn dev` - Start LangGraph server with in-memory storage
- `yarn langgraph:up` - Start LangGraph server with persistence
- `yarn start:auth` - Run OAuth authentication server

### Testing & Quality
- `yarn test` - Run unit tests
- `yarn test:int` - Run integration tests
- `yarn test:single [file]` - Run a single test file
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix linting issues
- `yarn format` - Format code with Prettier

### Core Functionality
- `yarn generate_post` - Generate a social media post from URL
- `yarn cron:create` - Create automated posting job
- `yarn get:scheduled_runs` - View scheduled posts

## Architecture Overview

### Graph-Based Architecture
The project uses LangGraph with multiple interconnected agents defined in `langgraph.json`:

- **generate_post**: Main workflow for post generation
- **supervisor**: Orchestrates multiple agents for complex tasks
- **ingest_data**: Handles data ingestion from various sources
- **upload_post**: Manages post uploads to social platforms
- **curate_data**: Filters and curates content

### Key Directories
- `src/agents/`: All agent implementations with their specific logic
- `src/agents/shared/`: Utilities shared across agents
- `src/clients/`: External service integrations (Twitter, LinkedIn, Slack, Reddit)
- `src/utils/`: General utility functions

### State Management
Each agent uses typed state objects (e.g., `GeneratePostGraphState`) that flow through the graph nodes. State is managed through reducers defined in each agent module.

## Development Guidelines

### Adding New Features
1. New agents should be added to `src/agents/` with their own directory
2. Update `langgraph.json` to register new graphs
3. Use the existing state pattern with proper TypeScript types
4. Add reducers for state fields that need aggregation

### Customization Points
- **Prompts**: Modify files in `src/agents/generate-post/prompts/` to customize content style
- **Business Context**: Update `BUSINESS_CONTEXT` for your specific use case
- **Post Examples**: Add examples to `TWEET_EXAMPLES` for style guidance

### Environment Variables
Key environment variables to configure:
- `SKIP_USED_URLS_CHECK`: Allow duplicate content
- `SKIP_CONTENT_RELEVANCY_CHECK`: Skip content verification
- `POST_TO_LINKEDIN_ORGANIZATION`: Post as organization vs individual
- Authentication tokens for Twitter/LinkedIn (see README for setup)

### Testing Approach
- Unit tests use Jest with ts-jest for TypeScript support
- Integration tests are in `src/tests/int/`
- Test timeout is set to 20 seconds
- Use `yarn test:single` for rapid iteration on specific tests

## Common Patterns

### Error Handling
- Agents should return structured errors in their state
- Use the shared error handling utilities in `src/agents/shared/`
- Human-in-the-loop nodes handle authentication and approval flows

### State Reducers
When adding state fields that aggregate data:
```typescript
state: {
  fieldName: {
    value: (x: string[] | undefined, y: string[] | undefined) => {
      // Aggregation logic
    },
    default: () => []
  }
}
```

### Adding New Content Sources
1. Create a new client in `src/clients/`
2. Add ingestion logic to the `ingest_data` agent
3. Update content processing in relevant agents
4. Add tests for the new integration