# Project Structure Guide

## 🚀 Active Project (What You Actually Use)

### Core Application
- **`src/`** - Main TypeScript application code
  - `agents/` - LangGraph agents for social media automation
  - `clients/` - API clients (Twitter, LinkedIn, etc.)
  - `utils/` - Shared utilities
- **`scripts/`** - Automation scripts (generate-post, crons, etc.)

### Context & Strategy
- **`social-media-context/`** - Organized context system
  - `general-context/` - Cross-platform knowledge
  - `twitter-specific/` - Twitter voice, templates, examples
  - `linkedin-specific/` - LinkedIn voice, templates, examples
- **`twitter-growth-plan/`** - Twitter growth strategy
- **`linkedin-growth-plan/`** - LinkedIn growth strategy

### Configuration
- **`package.json`** - Project dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration
- **`jest.config.js`** - Testing configuration
- **`langgraph.json`** - LangGraph project configuration

## 📁 Archived/Unused (Safe to Ignore)

These directories exist but are NOT used by your active project:

### IDE Configuration
- `.cursor/` - Cursor editor rules (only used by IDE)
- `.vscode/` - VS Code settings (you use Cursor)

### Experimental Projects
- `memory-v2/` - Python experimental project (separate)
- `slack-messaging/` - Python package (separate)

### Old Data
- `post_extractions/` - Old LinkedIn scraping data

### Duplicate Directories
- `general-context/` (use `social-media-context/general-context/`)
- `linkedin-specific/` (use `social-media-context/linkedin-specific/`)
- `twitter-specific/` (use `social-media-context/twitter-specific/`)

## 📋 How to Know What's Active

Your TypeScript code only imports from:
- Relative paths within `src/` (e.g., `../../../agents/`)
- No imports from archived directories

See `.projectignore` for the complete list of unused directories.

## 🎯 Quick Start

1. **Content Creation**: Use `social-media-context/` for voice guidelines and templates
2. **Automation**: Run scripts from `scripts/` directory
3. **Development**: Work in `src/` for core functionality
4. **Strategy**: Reference `*-growth-plan/` directories for planning 