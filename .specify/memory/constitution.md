<!--
Sync Impact Report:
===================
Version change: 0.0.0 → 1.0.0 (Initial ratification)
Modified principles: N/A (initial version)
Added sections:
  - Core Principles (5 principles defined)
  - Quality Standards
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  ✅ .specify/templates/plan-template.md (Constitution Check section verified)
  ✅ .specify/templates/spec-template.md (compatible with constitution)
  ✅ .specify/templates/tasks-template.md (compatible with constitution)
  ✅ .specify/templates/checklist-template.md (compatible with constitution)
  ✅ .specify/templates/agent-file-template.md (compatible with constitution)
Follow-up TODOs: None
-->

# GigRadar Constitution

## Core Principles

### I. Code Quality

All code MUST meet these standards:

- **Type Safety**: TypeScript strict mode enabled. No `any` types without explicit justification.
- **Linting**: All code MUST pass ESLint without warnings. Zero warnings policy enforced.
- **Formatting**: Prettier with consistent configuration across all files. Auto-format on save.
- **Code Review**: All changes require review approval before merging.
- **Documentation**: Public functions, complex logic, and non-obvious implementations MUST have JSDoc comments.
- **Error Handling**: All async operations MUST have proper error handling with meaningful user-facing messages.

**Rationale**: High code quality reduces bugs, improves maintainability, and ensures long-term project sustainability.

### II. Testing Standards

Testing discipline is mandatory:

- **Test Coverage**: Minimum 80% code coverage required for all new features.
- **Test Types**:
  - Unit tests for individual functions and components
  - Integration tests for API endpoints and service interactions
  - Contract tests for external API integrations (Telegram, OpenAI)
- **Test-First Development**: For complex features, write tests BEFORE implementation (Red-Green-Refactor).
- **Test Independence**: Each test MUST be able to run in isolation without depending on other tests.
- **Mocking**: External services (Telegram API, OpenAI API) MUST be mocked in tests.
- **Flaky Tests**: Zero tolerance for flaky tests. Any test that fails intermittently MUST be fixed or removed.

**Rationale**: Comprehensive testing prevents regressions, documents expected behavior, and enables confident refactoring.

### III. User Experience Consistency

All user-facing features MUST maintain consistency:

- **Response Time**: AI responses MUST be delivered within 10 seconds for text queries, 15 seconds for vision queries.
- **Error Messages**: User-facing error messages MUST be clear, actionable, and consistent in tone.
- **Feedback**: Users MUST receive feedback for all actions (typing indicators, processing states, etc.).
- **Graceful Degradation**: If AI services fail, provide helpful fallback behavior or clear error messages.
- **Message Formatting**: All bot responses MUST follow consistent formatting patterns (markdown, code blocks, etc.).
- **Context Awareness**: The bot MUST maintain context within the 20-message history window for coherent conversations.

**Rationale**: Consistent UX builds user trust and reduces confusion, especially critical for AI assistants.

### IV. Performance Requirements

Performance is a feature:

- **Cold Start**: Vercel function cold start MUST complete within 3 seconds.
- **Response Latency**: End-to-end webhook response time MUST be under 15 seconds (Telegram timeout is 30s).
- **Memory Usage**: Function memory usage MUST stay under 1024 MB (Vercel limit).
- **API Efficiency**: Minimize API calls by batching operations and using efficient data structures.
- **Caching**: Cache frequently accessed data where appropriate (user preferences, bot info).
- **Monitoring**: Track response times and error rates with logging/monitoring.

**Rationale**: Fast, responsive interactions are critical for chat bot user engagement and retention.

### V. Simplicity & Maintainability

Keep it simple:

- **YAGNI**: You Aren't Gonna Need It - only build what's required for current user stories.
- **No Premature Abstraction**: Don't create abstractions until you have at least 3 use cases.
- **Clear Naming**: Variables, functions, and files MUST have descriptive, self-documenting names.
- **Small Functions**: Functions SHOULD be under 50 lines. If longer, consider splitting.
- **Minimal Dependencies**: Avoid adding dependencies unless they solve a specific problem.
- **Delete Unused Code**: Remove dead code, commented-out code, and unused dependencies.

**Rationale**: Simplicity reduces cognitive load, speeds development, and makes onboarding easier.

## Quality Standards

### Code Quality Gates

- All linting MUST pass (ESLint, TypeScript strict mode)
- All tests MUST pass (unit, integration, contract)
- Code coverage MUST be at least 80%
- Type coverage MUST be 100% (no implicit any)
- Bundle size SHOULD NOT increase significantly without justification

### Security Requirements

- All API keys and secrets MUST be in environment variables (never committed)
- Input validation MUST be performed on all webhook inputs
- Rate limiting SHOULD be implemented for API endpoints
- Dependencies MUST be kept up to date (security patches)

### Deployment Standards

- Features MUST be tested in development environment before production deployment
- Deployment MUST be via Vercel with automatic preview deployments
- Rollback plan MUST be documented for significant changes

## Development Workflow

### Feature Development Process

1. **Specification**: Use `/speckit.specify` to create feature spec with user stories
2. **Planning**: Use `/speckit.plan` to generate technical design
3. **Task Breakdown**: Use `/speckit.tasks` to create actionable tasks
4. **Implementation**: Use `/speckit.implement` to execute tasks (tests first if TDD)
5. **Checklist Validation**: Complete quality checklists before merge
6. **Code Review**: Get approval from at least one other developer
7. **Deploy**: Merge to main triggers automatic Vercel deployment

### Branch Strategy

- Feature branches: `[###-feature-name]` (auto-numbered by Speckit)
- Direct commits to main: Discouraged (use feature branches)
- Branch protection: Require reviews for main branch

### Git Commit Practices

- Commit messages: Conventional Commits format (feat:, fix:, docs:, etc.)
- Commit frequency: Commit after each logical task or group
- No secrets: Never commit API keys, tokens, or sensitive data

## Governance

### Amendment Process

- Constitution changes require team discussion and consensus
- Amendments MUST be documented with version bump and date
- Minor clarifications: Patch version increment (1.0.0 → 1.0.1)
- Principle additions: Minor version increment (1.0.0 → 1.1.0)
- Principle removals or major changes: Major version increment (1.0.0 → 2.0.0)

### Compliance Verification

- All plans MUST pass Constitution Check before Phase 0 research
- All PRs MUST verify compliance with relevant principles
- Complexity violations MUST be justified in plan.md Complexity Tracking table
- Non-compliance requires documented exception approval

### Complexity Justification

When principles must be violated:
- Document in `plan.md` Complexity Tracking table
- Explain why simpler alternative is insufficient
- Get approval before implementing violation

### Runtime Guidance

For day-to-day development guidance outside of constitution scope, refer to:
- `CLAUDE.md` - Project overview and Speckit workflow
- `README.md` - Project-specific documentation (when created)
- Feature-specific checklists in `specs/[###-feature]/checklists/`

**Version**: 1.0.0 | **Ratified**: 2026-01-19 | **Last Amended**: 2026-01-19
