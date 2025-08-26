# Context System Integration - Quick Start

Fast setup guide for using the context system with your existing automation.

## Basic Integration Pattern

### 1. Load Context Function
```typescript
const loadContext = (contextPath: string) => {
  const fullPath = `social-media-context/${contextPath}`;
  return parseMarkdownContext(fullPath);
};
```

### 2. Content Creation Integration
```typescript
// In generate-post.ts
const voiceGuidelines = loadContext('twitter-specific/creation-guidelines/voice-guidelines.md');
const missionContext = loadContext('general-context/mission-and-goals/personal-mission.md');
const successfulExamples = loadContext('twitter-specific/my-content/best-performing/successful-replies.md');
```

### 3. Engagement Integration
```typescript
// In generate-reply.ts
const replyTemplates = loadContext('twitter-specific/engagement-strategy/reply-templates.md');
const targetAccounts = loadContext('general-context/people-and-accounts/signal-boosters/README.md');
```

## Key Context Files for Scripts

### Essential Context Files
- `general-context/mission-and-goals/personal-mission.md` - Strategic alignment
- `twitter-specific/creation-guidelines/voice-guidelines.md` - Voice consistency
- `twitter-specific/engagement-strategy/reply-templates.md` - Reply patterns
- `general-context/people-and-accounts/signal-boosters/README.md` - Target accounts

### Content Validation
Use quality checklists from voice guidelines to validate generated content before posting.

### Performance Tracking
Update best-performing content files automatically when posts exceed engagement thresholds. 