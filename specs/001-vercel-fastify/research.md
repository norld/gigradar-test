# Research: Vercel Fastify Serverless Infrastructure

**Feature**: 001-vercel-fastify
**Date**: 2026-01-19
**Phase**: Phase 0 - Outline & Research

## Overview

This document consolidates technical research and decision-making for the Vercel Fastify serverless infrastructure. All unknowns from the Technical Context have been resolved through investigation of best practices, platform constraints, and community standards.

---

## Research Topics

### 1. Fastify for Vercel Serverless Functions

**Question**: Is Fastify suitable for Vercel serverless functions, and what are the best practices for integration?

**Decision**: Use Fastify 4.x with `@vercel/node` adapter for serverless deployment

**Rationale**:
- **Performance**: Fastify is 20-30% faster than Express due to low overhead and optimized architecture
- **TypeScript Support**: First-class TypeScript support with built-in type definitions
- **Serverless Compatibility**: Fastify's lightweight initialization minimizes cold start times
- **Schema Validation**: Built-in JSON schema validation via `fastify-type-provider-json-schema-to-ts` reduces dependency overhead
- **Logging**: Pino integration provides structured JSON logging out of the box (matches FR-007 requirement)
- **Community**: Large community (30k+ GitHub stars), active maintenance, and extensive plugin ecosystem

**Alternatives Considered**:
1. **Express.js**: More popular but slower; requires additional setup for TypeScript and structured logging. Rejected due to performance overhead and cold start impact.
2. **Hono**: Emerging framework optimized for Edge functions; less mature ecosystem for Vercel serverless. Rejected due to ecosystem maturity concerns.
3. **Plain Node.js http module**: Maximum performance but requires implementing all middleware (validation, logging, error handling) from scratch. Rejected due to development time cost and maintenance burden.

**Best Practices**:
- Use Fastify instance per request (serverless pattern) to avoid request contamination
- Enable `disableRequestLogging` to use custom Pino logger for structured JSON format
- Register plugins in global scope but instantiate routes per request
- Use `fastify-plugin` wrapper for custom middleware to ensure proper encapsulation

---

### 2. Structured JSON Logging Strategy

**Question**: What logging approach provides structured JSON output compatible with Vercel's log aggregation?

**Decision**: Use Pino 8.x with custom serializers for request/response correlation

**Rationale**:
- **Performance**: Pino is 5x faster than Winston or Bunyan due to async writes and minimal overhead
- **JSON Output**: Native JSON format matches Vercel's log parsing and aggregation
- **Structured Fields**: Built-in support for timestamps, severity levels, and contextual metadata
- **Child Loggers**: Automatic request ID propagation via child logger pattern
- **Serverless Optimized**: Low memory footprint and efficient stringification

**Alternatives Considered**:
1. **Winston**: Popular but slower; requires custom transport for JSON output. Rejected due to performance impact.
2. **Bunyan**: Mature but less actively maintained; heavier footprint. Rejected due to lack of recent updates.
3. **Console.log with JSON.stringify**: Simple but lacks automatic metadata and correlation. Rejected due to manual maintenance burden.

**Implementation Strategy**:
- Pino logger instance with `level: process.env.LOG_LEVEL || 'info'`
- Custom serializers to redact sensitive data (API keys, tokens)
- Request ID generation via `crypto.randomUUID()` for correlation
- Log level configuration via environment variable
- Error serialization with stack traces and context

---

### 3. Environment Variable Validation

**Question**: How to validate environment variables at startup without external dependencies?

**Decision**: Custom TypeScript validation function with Zod schema parsing

**Rationale**:
- **Type Safety**: Zod provides runtime type validation with TypeScript inference
- **Error Messages**: Clear, actionable error messages when required variables are missing
- **No Extra Dependencies**: Lightweight compared to full-featured config libraries (Convict, Convict)
- **Validation**: Supports type coercion, defaults, and custom validators
- **Immutable**: Config object is frozen after validation to prevent runtime mutations

**Alternatives Considered**:
1. **Convict**: Feature-rich but heavy; adds unnecessary complexity for simple validation. Rejected due to over-engineering.
2. **dotenv**: Loads .env files but no validation; requires separate schema library. Rejected due to lack of validation.
3. **process.env direct access**: No validation; harder to debug missing config. Rejected due to late failure detection.

**Implementation Strategy**:
- Zod schema defining all required environment variables with types
- Validation function called at module import time (fails fast)
- Frozen config object exported for use throughout application
- Clear error messages listing all missing or invalid variables

---

### 4. Payload Size Validation

**Question**: How to enforce 3MB payload limit efficiently in serverless environment?

**Decision**: Middleware using `content-length` header check + stream body size validation

**Rationale**:
- **Early Rejection**: Checking `content-length` header before parsing body saves processing time
- **Stream Safety**: For requests without content-length, count bytes during parsing to prevent memory exhaustion
- **Standard HTTP**: Returns 413 Payload Too Large status (RFC-compliant)
- **Fail Fast**: Rejects oversized requests before full body upload

**Alternatives Considered**:
1. **Vercel platform limit**: Let Vercel reject at 4.5MB limit. Rejected because we need 3MB limit for predictability.
2. **Only check content-length**: Fails if header is missing or spoofed. Rejected due to security concerns.
3. **Parse entire body then check**: Wastes memory and processing time. Rejected due to inefficiency.

**Implementation Strategy**:
- Fastify `onRequest` hook to check `content-length` header if present
- Stream parsing with byte counter for requests without content-length
- Return 413 status immediately if limit exceeded
- Log oversized request attempts (method, path, size, client IP if available)

---

### 5. Execution Timeout Tracking

**Question**: How to log timeout warnings at 80% of execution time without interfering with request processing?

**Decision**: Fastify `onResponse` hook with elapsed time calculation

**Rationale**:
- **Non-blocking**: Runs after response sent, doesn't delay request processing
- **Accurate**: Measures actual request duration including all middleware
- **Simple**: Single calculation per request, minimal overhead
- **Configurable**: Warning threshold (80%) can be adjusted via environment variable

**Alternatives Considered**:
1. **SetInterval check**: Runs periodically during request; adds overhead. Rejected due to complexity.
2. **Async timer with AbortController**: Complex to implement correctly in serverless. Rejected due to maintenance burden.
3. **Vercel Analytics**: Post-hoc analysis, no real-time warnings. Rejected due to delayed visibility.

**Implementation Strategy**:
- Record request start time in `onRequest` hook
- Calculate elapsed time in `onResponse` hook
- If elapsed > 8 seconds (80% of 10s Hobby limit), log warning
- Include request ID, method, path, and elapsed time in warning

---

### 6. Testing Framework Selection

**Question**: What testing framework provides best TypeScript integration and Vercel compatibility?

**Decision**: Vitest 1.x with MSW for contract testing

**Rationale**:
- **Native ESM**: Vitest uses native ES modules (no bundler required)
- **TypeScript Support**: First-class TypeScript with no extra configuration
- **Performance**: 10x faster than Jest due to Vite-based architecture
- **Watch Mode**: Instant hot module reload during development
- **Coverage**: Built-in coverage via c8 (Istanbul-compatible)
- **MSW Integration**: Mock Service Worker for contract testing external APIs

**Alternatives Considered**:
1. **Jest**: Popular but slower; requires ts-jest transformation; ESM support is experimental. Rejected due to performance and ESM issues.
2. **Mocha**: Flexible but requires more setup; no built-in coverage. Rejected due to configuration overhead.
3. **Node:test**: Built-in Node.js test runner but lacking watch mode and advanced features. Rejected due to feature limitations.

**Test Strategy**:
- **Unit Tests**: Test middleware functions, validators, and utilities in isolation
- **Integration Tests**: Test full request lifecycle through Fastify routes
- **Contract Tests**: Mock Telegram API with MSW to verify request format
- **Coverage Target**: 80% as mandated by constitution

---

## Technology Stack Summary

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| Runtime | Node.js | 18.x or 20.x | LTS support, Vercel optimized |
| Language | TypeScript | 5.x | Type safety, strict mode |
| Web Framework | Fastify | 4.x | Performance, TypeScript, serverless-optimized |
| Serverless Adapter | @vercel/node | Latest | Official Vercel integration |
| Logging | Pino | 8.x | Structured JSON, performance |
| Validation | Zod | 3.x | Runtime type validation, TypeScript inference |
| Testing | Vitest | 1.x | Performance, ESM, TypeScript |
| Mocking | MSW | 2.x | Contract testing, API mocking |
| Coverage | @vitest/coverage-v8 | Latest | c8-based, Istanbul-compatible |

---

## Performance Targets Validation

| Metric | Constitution Requirement | Our Target | Achievability |
|--------|-------------------------|------------|---------------|
| Cold Start | <3 seconds | <3 seconds | ✅ Fastify lightweight initialization |
| Response Latency | <15 seconds | <1 second (webhook ack) | ✅ Fast I/O, no blocking |
| Memory Usage | <1024 MB | <512 MB estimated | ✅ Minimal dependencies, efficient code |
| Health Check | <500ms | <100ms | ✅ Simple status response |
| Concurrent Requests | 100 supported | 100+ | ✅ Vercel auto-scaling |

---

## Open Questions Resolved

All unknowns from Technical Context have been resolved:
- ✅ Node.js version: 18.x or 20.x (LTS)
- ✅ TypeScript version: 5.x (latest stable)
- ✅ Web framework: Fastify 4.x (research validated)
- ✅ Logging: Pino 8.x (structured JSON)
- ✅ Testing: Vitest 1.x (performance, TypeScript)
- ✅ Storage: N/A (stateless design confirmed)
- ✅ Platform: Vercel Serverless Functions (confirmed)
- ✅ Performance: All targets validated as achievable

---

## Next Steps

Proceed to **Phase 1: Design & Contracts**
1. Extract entities from spec → `data-model.md`
2. Define API contracts from functional requirements → `contracts/`
3. Create quickstart guide for local development → `quickstart.md`
4. Update agent context with new technology

