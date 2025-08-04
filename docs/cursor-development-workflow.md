# Cursor Development Workflow for Social Media Agent

This document outlines our structured approach to developing with Cursor AI, based on proven agent collaboration principles adapted for our Social Media Agent codebase.

## Core Principles Applied

### 1. ✅ COMPLETED: Cursor Instructions as Living Rulebook
- **Location**: `.cursor/rules/cursor-agent-instructions.mdc`
- **Purpose**: Centralized coding standards, patterns, and behavior rules
- **Usage**: Always applied to maintain consistency across all development

### 2. 🔄 IN PROGRESS: Enhanced Documentation & Memory
- **Memory Bank**: Persistent knowledge storage for preferences and patterns
- **Living Docs**: Keep FEATURES.md, README.md, and prompt docs current
- **Context Preservation**: Store recurring patterns for future sessions

### 3. 🔄 NEXT: Code Quality & Architecture
**Current Issues Identified:**
- **Type Safety**: 50+ instances of `any` types need proper typing
- **Environment Variables**: 100+ direct `process.env` calls should use utility functions
- **Domain Separation**: Mixed concerns in some agent files

**Improvement Plan:**
```typescript
// ❌ Current Anti-Pattern
const token = process.env.GITHUB_TOKEN;
const result = await api.call(data as any);

// ✅ Target Pattern  
const token = getGitHubToken();
const result = await api.call(data: GitHubApiData);
```

### 4. Planning-First Development Workflow

For complex tasks (3+ steps), follow this structure:

#### 4a. PRD Creation
```markdown
## Task: [Brief Description]

### Requirements
- [ ] Specific requirement 1
- [ ] Specific requirement 2

### Acceptance Criteria
- [ ] Measurable outcome 1
- [ ] Measurable outcome 2

### Implementation Plan
1. Step 1 with rationale
2. Step 2 with dependencies
3. Step 3 with validation
```

#### 4b. Todo Breakdown
Use `todo_write` tool to create trackable subtasks:
- Mark only ONE todo as "in_progress" 
- Complete current task before starting next
- Update todos with progress and learnings

### 5. Automated Context Gathering

#### Integration Tools
- **context7**: External library documentation
- **gitMCP**: Repository context and history
- **Chat Modes**: Plan, implement, review workflows

#### Usage Pattern
```typescript
// Instead of manual context pasting
const context = await context7.getLibraryDocs('langchain');
const gitContext = await gitMCP.getRecentChanges();
```

### 6. Continuous Improvement Loop

#### When Agent Makes Mistakes
1. **HALT**: Stop current approach immediately
2. **ANALYZE**: Ask "Why did this happen?"
3. **EXPLAIN**: Agent provides reasoning for the error
4. **UPDATE**: Add new rule to Cursor Instructions
5. **VALIDATE**: Test correct approach before proceeding

#### Example Feedback Loop
```
❌ Agent adds 3rd argument to 2-argument function
🛑 Human: "Stop. This function only takes 2 arguments"
🤔 Agent: "I misunderstood the signature. Let me check the types"
📝 Update Rule: "Always verify function signatures before modification"
✅ Continue with correct implementation
```

## Development Workflow

### Starting a New Task

1. **Read Context**: Review existing code patterns in target area
2. **Plan First**: Create PRD for complex tasks (3+ steps)  
3. **Create Todos**: Break into trackable subtasks
4. **Gather Context**: Use automated tools for external dependencies
5. **Implement**: Follow established patterns and conventions
6. **Test**: Add appropriate unit/integration tests
7. **Document**: Update relevant docs if behavior changes

### Code Review Checklist

#### Before Committing
- [ ] Follows naming conventions (kebab-case files, PascalCase components)
- [ ] Uses utility functions instead of direct `process.env`
- [ ] Proper TypeScript types (no unnecessary `any`)
- [ ] Tests added for new functionality
- [ ] Documentation updated if needed
- [ ] Follows LangGraph agent structure patterns

#### Quality Gates
- [ ] ESLint passes (`yarn lint`)
- [ ] Prettier formatting applied (`yarn format`)
- [ ] Unit tests pass (`yarn test`)
- [ ] Integration tests pass (`yarn test:int`)
- [ ] No runtime errors in development mode

### Common Patterns to Follow

#### LangGraph Agent Structure
```
src/agents/[agent-name]/
├── index.ts              # Main entry & export
├── [agent]-graph.ts      # Graph definition & routing  
├── state.ts              # Typed state with Annotation.Root
├── nodes/                # Individual handlers
├── prompts/              # Template strings
├── constants.ts          # Config & env utilities
├── types.ts              # TypeScript interfaces
└── utils.ts              # Helper functions
```

#### Error Handling
```typescript
// ✅ Good: Graceful error handling
try {
  const result = await risky.operation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: error.message };
}
```

#### State Management
```typescript
// ✅ Good: Proper LangGraph state typing
export const MyAgentAnnotation = Annotation.Root({
  input: Annotation<string>,
  result: Annotation<ProcessedData | undefined>,
  errors: Annotation<string[]>({
    reducer: (state, update) => state.concat(update),
    default: () => [],
  }),
});
```

### Testing Strategy

#### Unit Tests (`*.test.ts`)
- Fast, isolated, mocked external APIs
- Test business logic and utilities
- Run with `yarn test`

#### Integration Tests (`*.int.test.ts`)  
- Real API calls, require environment variables
- Test full workflows end-to-end
- Run with `yarn test:int`
- Use `--testTimeout 100000` for longer operations

### Environment Management

#### Development
- Use `.env.local` for local development
- Never commit real API keys
- Use utility functions from `src/agents/utils.ts`

#### Testing
- Integration tests require real API keys
- Tests run in `America/Los_Angeles` timezone
- Mock external APIs in unit tests

### Continuous Learning

This workflow evolves based on our experience. When we discover better patterns or encounter new challenges, we:

1. Update the Cursor Instructions
2. Revise this workflow document
3. Share learnings through memory storage
4. Apply improvements to future development

By following these principles consistently, we create a collaborative development environment where the AI agent becomes increasingly effective at understanding and contributing to our codebase. 