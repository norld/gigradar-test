# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Telegram AI Assistant Bot** built with TypeScript, deployed on Vercel. The bot uses OpenAI's GPT-4o-mini model for chat responses and supports vision capabilities for image understanding.

### Core Architecture

- **Platform**: Vercel Functions (serverless)
- **Runtime**: Node.js with TypeScript
- **Webhook Server**: Fastify (for Telegram webhook handling)
- **AI Provider**: OpenAI API (Responses SDK, gpt-4o-mini model)
- **Chat History**: Last 20 messages fetched from Telegram API (no local persistence)

### Key Design Decisions

1. **No chat state persistence**: The app reads the last 20 messages from Telegram chat history before generating each response. Images in history are disregarded.
2. **Vision support**: Users can send images and the AI will use vision capabilities to understand them.
3. **Webhook-based**: Bot uses Telegram webhook (not polling) for real-time message handling.

## Environment Setup

Required environment variables (set in `.env` or Vercel environment variables):

```bash
TELEGRAM_BOT_TOKEN=<token_from_botfather>
OPEN_AI_TOKEN=<openai_api_key>
```

## Speckit Framework

This project uses the **Speckit** framework for structured development. Key commands:

### `/speckit.specify [feature description]`
Creates a feature specification from natural language.
- Generates a feature branch with numbering (e.g., `1-user-auth`)
- Creates `specs/[###-feature-name]/spec.md`
- Runs quality validation with checklist generation
- Limits clarifications to 3 critical questions maximum

### `/speckit.plan`
Generates implementation plan from a feature spec.
- Prerequisites: Must be on a feature branch with `spec.md`
- Phase 0: Research (`research.md`)
- Phase 1: Design artifacts (`data-model.md`, `contracts/`, `quickstart.md`)
- Constitution compliance checking
- Updates AI agent context with new technology

### `/speckit.tasks`
Creates actionable task breakdown from plan and spec.
- Organizes tasks by user story (P1, P2, P3 priorities)
- Supports parallel execution planning ([P] marker)
- Includes dependencies and execution order
- TDD approach (tests before implementation)

### `/speckit.implement`
Executes the implementation plan from `tasks.md`.
- Validates checklist completion before starting
- Follows TDD: tests written and must fail before implementation
- Marks tasks as complete in `tasks.md` as it progresses
- Phase-by-phase execution with checkpoint validation

### `/speckit.checklist`
Creates domain-specific checklists for quality validation.

### `/speckit.clarify`
Interactive refinement of spec requirements through targeted questions.

### `/speckit.analyze`
Cross-artifact consistency analysis across spec, plan, and tasks.

### `/speckit.taskstoissues`
Converts tasks to GitHub issues with dependency ordering.

### `/speckit.constitution`
Creates or updates project constitution with development principles.

## Speckit Workflow

1. **Specify**: `/speckit.specify "Create a simple telegram bot that works as an AI assistant"`
2. **Clarify** (optional): `/speckit.clarify` if spec has [NEEDS CLARIFICATION] markers
3. **Plan**: `/speckit.plan` - generates technical design
4. **Tasks**: `/speckit.tasks` - breaks down into actionable tasks
5. **Implement**: `/speckit.implement` - executes the tasks

## Feature Directory Structure

Each feature creates a directory under `specs/[###-feature-name]/`:

```text
specs/[###-feature-name]/
├── spec.md              # Feature specification (user stories, requirements, success criteria)
├── plan.md              # Implementation plan (tech stack, architecture, structure)
├── tasks.md             # Actionable task breakdown (created by /speckit.tasks)
├── research.md          # Technical research and decisions (Phase 0)
├── data-model.md        # Data entities and relationships (Phase 1)
├── quickstart.md        # Integration scenarios and testing (Phase 1)
├── contracts/           # API contracts and schemas (Phase 1)
└── checklists/          # Quality validation checklists
```

## Development Workflow

### Branch Strategy
- Features are numbered automatically: `1-feature-name`, `2-feature-name`, etc.
- The script checks remote branches, local branches, and specs directories for the highest number
- Short names are 2-4 words, action-noun format (e.g., `telegram-bot-webhook`)

### Creating a New Feature
1. Run `/speckit.specify "Your feature description"`
2. The script automatically:
   - Fetches all remote branches
   - Finds the next available number
   - Creates a short name for the branch
   - Creates the feature branch
   - Generates the spec file

### Implementation Process
1. Ensure all checklists pass before implementation
2. Use `/speckit.implement` to execute tasks in order:
   - Phase 1: Setup (project structure, dependencies)
   - Phase 2: Foundational (database, auth, routing - BLOCKS all stories)
   - Phase 3+: User Stories (P1, P2, P3 - can run in parallel)
   - Final Phase: Polish & cross-cutting concerns
3. Each user story should be independently testable

## Constitution

The project constitution (`.specify/memory/constitution.md`) defines core principles. Currently a template - should be customized with:
- Core development principles
- Technology stack requirements
- Quality standards
- Governance rules

## Speckit Scripts

Located in `.specify/scripts/bash/`:

- `create-new-feature.sh` - Creates feature branch and spec file with numbering
- `setup-plan.sh` - Validates prerequisites and returns feature paths
- `check-prerequisites.sh` - Verifies required files exist before implementation
- `update-agent-context.sh` - Updates AI agent context with new technology

Use `--json` flag with scripts to get machine-readable output for parsing.

## Active Technologies
- TypeScript 5.x (Node.js 18.x or 20.x runtime) + Fastify 4.x (web framework), @vercel/node (serverless adapter), pino (structured JSON logging) (001-vercel-fastify)
- N/A (stateless serverless functions; no persistence required) (001-vercel-fastify)

## Recent Changes
- 001-vercel-fastify: Added TypeScript 5.x (Node.js 18.x or 20.x runtime) + Fastify 4.x (web framework), @vercel/node (serverless adapter), pino (structured JSON logging)
