# WMS Implementation Stories

**Project:** Warehouse Management System (GraphQL API)  
**Author:** Thomas Markiewicz  
**Date:** December 11, 2025

This document breaks down the WMS implementation into small, implementable stories suitable for GitHub issues. Stories are ordered for incremental development with clear acceptance criteria.

---

## Story Breakdown Overview

| Story | Title | Priority | Estimate | Dependencies |
|-------|-------|----------|----------|--------------|
| #1 | Database Schema & Seed Data | P0 | 2h | None |
| #2 | GraphQL Server Setup | P0 | 1h | None |
| #3 | Package Repository & Basic Queries | P0 | 2h | #1, #2 |
| #4 | Induct Mutation - Core Logic | P0 | 3h | #3 |
| #5 | Stow Mutation - Core Logic | P0 | 3h | #3 |
| #6 | Batch Induct Mutation | P1 | 2h | #4 |
| #7 | Error Handling & Result Types | P1 | 2h | #4, #5 |
| #8 | Unit Tests - Induct Service | P0 | 2h | #4 |
| #9 | Unit Tests - Stow Service | P0 | 2h | #5 |
| #10 | Integration Tests - GraphQL Resolvers | P1 | 3h | #4, #5, #7 |
| #11 | Architecture Diagram Export | P0 | 1h | None |
| #12 | README Documentation | P0 | 2h | All |

**Total Estimated Time:** ~23 hours (3 working days)

---

## Story #1: Database Schema & Seed Data

**Priority:** P0 (Must Have)  
**Estimate:** 2 hours  
**Labels:** `database`, `setup`, `prisma`

### Description
Set up the Prisma schema for the WMS domain model and create seed data with sample packages in `PENDING` state, warehouses, and storage locations.

### Acceptance Criteria
- [ ] Prisma schema defined with all required models (Package, Pallet, Warehouse, StorageLocation)
- [ ] All fields from DESIGN.md data model implemented
- [ ] Optimistic locking `version` field added to Package model
- [ ] Seed script creates at least:
  - 2 warehouses
  - 10 packages in `PENDING` state
  - 5 storage locations
- [ ] `npm run db:seed` successfully populates database
- [ ] Database migrations can be run successfully

### Implementation Subtasks
- [ ] Create `api/prisma/schema.prisma` with models:
  - `Warehouse` (id, name, address, createdAt)
  - `Package` (id, warehouseId, palletId, status, inductedAt, stowedAt, createdAt, updatedAt, version)
  - `Pallet` (id, storageLocationId, stagedAt, createdAt, updatedAt)
  - `StorageLocation` (id, warehouseId, zone, aisle, shelf, createdAt)
- [ ] Define enums: `PackageStatus` (PENDING, INDUCTED, STOWED, STAGED, PICKED)
- [ ] Set up relationships (foreign keys, cascades)
- [ ] Create `api/prisma/seed.ts`:
  - 2 warehouses ("Chicago Hub", "Los Angeles Hub")
  - 10 packages (IDs: PKG-001 to PKG-010) in PENDING state
  - 5 storage locations (various zones/aisles)
- [ ] Add seed script to `package.json`
- [ ] Run `npx prisma migrate dev` to create initial migration
- [ ] Run `npx prisma generate` to generate client
- [ ] Verify seed data with Prisma Studio or SQL query

### Testing Subtasks
- [ ] Verify all tables created in database
- [ ] Verify foreign key constraints work correctly
- [ ] Verify seed data matches expected counts
- [ ] Test that seed script is idempotent (can run multiple times)

### References
- DESIGN.md Section 3: Data Model
- PROMPT.md: "pre-seed your database with sample package data"

---

## Story #2: GraphQL Server Setup

**Priority:** P0 (Must Have)  
**Estimate:** 1 hour  
**Labels:** `graphql`, `setup`, `apollo`

### Description
Configure Apollo Server with GraphQL schema, integrate with NestJS, and set up basic health check query.

### Acceptance Criteria
- [ ] Apollo Server running on port 3000
- [ ] GraphQL Playground accessible at `/graphql`
- [ ] Basic `hello` query returns response
- [ ] PrismaService properly configured with pg adapter
- [ ] Server starts without errors

### Implementation Subtasks
- [ ] Verify Apollo Server and GraphQL dependencies installed
- [ ] Update `api/src/app/app.module.ts` GraphQL configuration
- [ ] Create `api/src/schema/schema.graphql` with base types
- [ ] Add scalar types (DateTime, ID, String, Boolean, Int)
- [ ] Configure code-first approach with `autoSchemaFile`
- [ ] Test server startup with `npm run dev:api`
- [ ] Verify Playground loads at `http://localhost:3000/graphql`

### Testing Subtasks
- [ ] Test `hello` query in GraphQL Playground
- [ ] Verify schema introspection works
- [ ] Test that PrismaService connects to database
- [ ] Verify hot reload works (change resolver, see update)

### References
- DESIGN.md Section 10: Technology Stack
- Current `api/src/app/app.module.ts`

---

## Story #3: Package Repository & Basic Queries

**Priority:** P0 (Must Have)  
**Estimate:** 2 hours  
**Labels:** `backend`, `repository`, `queries`

### Description
Create repository layer for database access and implement GraphQL queries to fetch packages and pallets.

### Acceptance Criteria
- [ ] `PackageRepository` with CRUD methods implemented
- [ ] `PalletRepository` with CRUD methods implemented
- [ ] `WarehouseRepository` with find methods implemented
- [ ] GraphQL queries working:
  - `package(id: ID!)` returns package details
  - `pallet(id: ID!)` returns pallet with packages
  - `packages(warehouseId, status, limit, offset)` returns filtered list
- [ ] All queries tested in GraphQL Playground

### Implementation Subtasks
- [ ] Create `api/src/repositories/package.repository.ts`:
  - `findById(id: string)`
  - `findMany(filters)`
  - `create(data)`
  - `update(id, data)`
  - `updateWithVersion(id, data, expectedVersion)` (optimistic locking)
- [ ] Create `api/src/repositories/pallet.repository.ts`:
  - `findById(id: string)`
  - `findOrCreate(id: string)`
  - `update(id, data)`
- [ ] Create `api/src/repositories/warehouse.repository.ts`:
  - `findById(id: string)`
  - `findAll()`
- [ ] Create `api/src/resolvers/package.resolver.ts`:
  - Implement `@Query` for `package(id)`
  - Implement `@Query` for `packages(filters)`
  - Implement `@ResolveField` for nested `warehouse` relation
- [ ] Create `api/src/resolvers/pallet.resolver.ts`:
  - Implement `@Query` for `pallet(id)`
  - Implement `@ResolveField` for nested `packages` relation
- [ ] Register resolvers in `app.module.ts`

### Testing Subtasks
- [ ] Test `package(id: "PKG-001")` returns correct data
- [ ] Test `packages(warehouseId: "WH-001")` returns filtered results
- [ ] Test `packages(status: PENDING)` returns only pending packages
- [ ] Test `pallet(id: "PLT-001")` returns pallet with packages array
- [ ] Test pagination with `limit` and `offset`
- [ ] Test querying non-existent package returns null

### References
- DESIGN.md Section 6: GraphQL Schema (Queries)
- DESIGN.md Section 11: Project Structure

---

## Story #4: Induct Mutation - Core Logic

**Priority:** P0 (Must Have)  
**Estimate:** 3 hours  
**Labels:** `backend`, `mutation`, `business-logic`

### Description
Implement the `inductPackage` mutation with validation logic, state transitions, and idempotency support.

### Acceptance Criteria
- [ ] `inductPackage(packageId, warehouseId, receivedAt)` mutation works
- [ ] Package status transitions from `PENDING` → `INDUCTED`
- [ ] `inductedAt` timestamp is set
- [ ] Idempotent: calling twice on same package returns success
- [ ] Validation errors for:
  - Non-existent package
  - Non-existent warehouse
  - Invalid state transitions (e.g., STOWED → INDUCTED)
- [ ] Returns structured `InductResult` with success/error details

### Implementation Subtasks
- [ ] Create `api/src/services/induct.service.ts`:
  - `async inductPackage(packageId, warehouseId, receivedAt?)`
  - Validation: check package exists
  - Validation: check warehouse exists
  - Validation: check package status (PENDING or INDUCTED)
  - Idempotency: return success if already INDUCTED
  - State transition: update status to INDUCTED
  - Set `inductedAt` timestamp (use receivedAt or current time)
  - Return structured result
- [ ] Create `api/src/services/validation.service.ts`:
  - `validatePackageExists(packageId)`
  - `validateWarehouseExists(warehouseId)`
  - `validateStateTransition(currentState, targetState)`
- [ ] Create `api/src/resolvers/induct.resolver.ts`:
  - `@Mutation` for `inductPackage`
  - Call `InductService`
  - Map service result to GraphQL types
- [ ] Define GraphQL types in schema:
  - `InductResult` type
  - `ValidationError` type
  - `ErrorCode` enum
- [ ] Register service and resolver in `app.module.ts`

### Testing Subtasks
- [ ] Manual test in Playground: induct PKG-001
- [ ] Verify package status changed to INDUCTED in database
- [ ] Verify `inductedAt` timestamp is set
- [ ] Test idempotency: induct PKG-001 again, verify success
- [ ] Test error: induct non-existent package
- [ ] Test error: induct package in STOWED state
- [ ] Test error: induct with invalid warehouseId

### References
- DESIGN.md Section 7.1: Induct Validation
- DESIGN.md Section 5 ADR-001: Idempotency Strategy
- PROMPT.md: Induct Workflow

---

## Story #5: Stow Mutation - Core Logic

**Priority:** P0 (Must Have)  
**Estimate:** 3 hours  
**Labels:** `backend`, `mutation`, `business-logic`

### Description
Implement the `stowPackages` mutation to assign packages to a pallet with validation.

### Acceptance Criteria
- [ ] `stowPackages(palletId, packageIds, stowedAt)` mutation works
- [ ] Packages transition from `INDUCTED` → `STOWED`
- [ ] `palletId` foreign key is set on packages
- [ ] `stowedAt` timestamp is set
- [ ] Pallet is created if it doesn't exist
- [ ] Validation errors for:
  - Non-existent packages
  - Packages not in INDUCTED state
  - Packages already on a different pallet
- [ ] Returns structured `StowResult` with success/error details

### Implementation Subtasks
- [ ] Create `api/src/services/stow.service.ts`:
  - `async stowPackages(palletId, packageIds, stowedAt?)`
  - Find or create pallet
  - For each packageId:
    - Validate package exists
    - Validate package is in INDUCTED state
    - Validate package is not already on a different pallet
  - Update all packages atomically:
    - Set `palletId`
    - Set status to `STOWED`
    - Set `stowedAt` timestamp
  - Return structured result with pallet
- [ ] Create `api/src/resolvers/stow.resolver.ts`:
  - `@Mutation` for `stowPackages`
  - Call `StowService`
  - Map service result to GraphQL types
- [ ] Define GraphQL types in schema:
  - `StowResult` type
  - `StowPackagesInput` (if using input type)
- [ ] Register service and resolver in `app.module.ts`

### Testing Subtasks
- [ ] Manual test: stow PKG-002, PKG-003 on PLT-001
- [ ] Verify packages have `palletId` set and status is STOWED
- [ ] Verify `stowedAt` timestamp is set
- [ ] Query pallet PLT-001, verify packages array includes both
- [ ] Test error: stow non-existent package
- [ ] Test error: stow package in PENDING state
- [ ] Test error: stow package already on a different pallet
- [ ] Test creating new pallet (use non-existent palletId)

### References
- DESIGN.md Section 7.2: Stow Validation
- DESIGN.md Section 5 ADR-003: Concurrency Control
- PROMPT.md: Stow Workflow

---

## Story #6: Batch Induct Mutation

**Priority:** P1 (Should Have)  
**Estimate:** 2 hours  
**Labels:** `backend`, `mutation`, `enhancement`

### Description
Implement `inductPackages` batch mutation with partial success support.

### Acceptance Criteria
- [ ] `inductPackages([{packageId, warehouseId, receivedAt}])` mutation works
- [ ] Returns `InductBatchResult` with:
  - `successCount` and `failureCount`
  - Array of individual `InductResult` per package
- [ ] Partial success: some packages succeed, others fail
- [ ] Each package result has detailed success/error info
- [ ] Order of results matches order of input

### Implementation Subtasks
- [ ] Update `api/src/services/induct.service.ts`:
  - Add `async inductPackages(inputs: InductPackageInput[])`
  - Loop through inputs, call `inductPackage` for each
  - Collect results in array
  - Don't stop on first error (partial success)
  - Count successes and failures
  - Return `InductBatchResult`
- [ ] Update `api/src/resolvers/induct.resolver.ts`:
  - Add `@Mutation` for `inductPackages`
  - Map input array to service call
- [ ] Define GraphQL types in schema:
  - `InductPackageInput` input type
  - `InductBatchResult` type with `results: [InductResult!]!`

### Testing Subtasks
- [ ] Test batch with 3 valid packages, all succeed
- [ ] Test batch with 2 valid, 1 invalid (non-existent)
- [ ] Verify `successCount: 2, failureCount: 1`
- [ ] Verify results array has 3 items with correct messages
- [ ] Test batch with all invalid packages
- [ ] Verify order of results matches input order

### References
- DESIGN.md Section 5 ADR-002: Batch Mutation Behavior
- PROMPT.md: "register one or more packages"

---

## Story #7: Error Handling & Result Types

**Priority:** P1 (Should Have)  
**Estimate:** 2 hours  
**Labels:** `backend`, `refactor`, `error-handling`

### Description
Refactor error handling to use consistent Result pattern across all mutations with structured error codes.

### Acceptance Criteria
- [ ] All mutations return Result types (not throwing exceptions)
- [ ] `ValidationError` type has `field`, `message`, `code`
- [ ] `ErrorCode` enum includes all error types:
  - `NOT_FOUND`
  - `INVALID_STATE`
  - `ALREADY_EXISTS`
  - `VALIDATION_FAILED`
  - `CONFLICT`
- [ ] Error messages are clear and actionable
- [ ] GraphQL `errors` array is only used for system errors

### Implementation Subtasks
- [ ] Create `api/src/models/result.types.ts`:
  - `ValidationError` interface
  - `ErrorCode` enum
  - `Result<T>` generic type
- [ ] Update `InductService` to return Result types
- [ ] Update `StowService` to return Result types
- [ ] Update resolvers to handle Result types
- [ ] Add helper function `createError(field, message, code)`
- [ ] Update GraphQL schema with error types

### Testing Subtasks
- [ ] Test each error code is returned correctly
- [ ] Verify error messages are descriptive
- [ ] Test that system exceptions still go to `errors` array
- [ ] Verify client can programmatically handle errors by code

### References
- DESIGN.md Section 5 ADR-004: Error Handling Pattern

---

## Story #8: Unit Tests - Induct Service

**Priority:** P0 (Must Have)  
**Estimate:** 2 hours  
**Labels:** `testing`, `unit-tests`

### Description
Write comprehensive unit tests for the induct service covering all validation logic and edge cases.

### Acceptance Criteria
- [ ] Test coverage > 90% for `induct.service.ts`
- [ ] All test cases from DESIGN.md Section 8.1 implemented
- [ ] Tests use mocked repositories (no database)
- [ ] Tests run fast (< 1 second total)
- [ ] All tests pass

### Implementation Subtasks
- [ ] Create `api/src/services/induct.service.spec.ts`
- [ ] Set up Jest mocks for repositories
- [ ] Test: should induct a PENDING package successfully
  - Mock package in PENDING state
  - Assert status changed to INDUCTED
  - Assert inductedAt is set
- [ ] Test: should be idempotent for already INDUCTED packages
  - Mock package in INDUCTED state
  - Assert returns success without error
- [ ] Test: should reject inducting a STOWED package
  - Mock package in STOWED state
  - Assert returns INVALID_STATE error
- [ ] Test: should reject inducting non-existent package
  - Mock repository returns null
  - Assert returns NOT_FOUND error
- [ ] Test: should reject invalid warehouse
  - Mock warehouse not found
  - Assert returns NOT_FOUND error
- [ ] Test: should use provided receivedAt timestamp
  - Pass custom timestamp
  - Assert inductedAt matches provided value
- [ ] Test: should use current time if receivedAt not provided
  - Don't pass timestamp
  - Assert inductedAt is recent

### Testing Subtasks
- [ ] Run `npm test -- induct.service.spec`
- [ ] Verify all tests pass
- [ ] Check code coverage report
- [ ] Fix any failing tests

### References
- DESIGN.md Section 8.1: Unit Tests

---

## Story #9: Unit Tests - Stow Service

**Priority:** P0 (Must Have)  
**Estimate:** 2 hours  
**Labels:** `testing`, `unit-tests`

### Description
Write comprehensive unit tests for the stow service covering validation and edge cases.

### Acceptance Criteria
- [ ] Test coverage > 90% for `stow.service.ts`
- [ ] All test cases from DESIGN.md Section 8.1 implemented
- [ ] Tests use mocked repositories
- [ ] Tests run fast (< 1 second total)
- [ ] All tests pass

### Implementation Subtasks
- [ ] Create `api/src/services/stow.service.spec.ts`
- [ ] Set up Jest mocks for repositories
- [ ] Test: should stow INDUCTED packages successfully
  - Mock packages in INDUCTED state
  - Assert status changed to STOWED
  - Assert palletId is set
  - Assert stowedAt is set
- [ ] Test: should create pallet if doesn't exist
  - Mock pallet not found
  - Assert pallet.create() was called
- [ ] Test: should reject stowing non-existent package
  - Mock package not found
  - Assert returns NOT_FOUND error
- [ ] Test: should reject stowing PENDING package
  - Mock package in PENDING state
  - Assert returns INVALID_STATE error
- [ ] Test: should reject stowing package already on different pallet
  - Mock package with palletId = "PLT-999"
  - Attempt to stow on "PLT-001"
  - Assert returns CONFLICT error
- [ ] Test: should handle multiple packages atomically
  - Mock 3 packages
  - Assert all updated or none updated
- [ ] Test: should use provided stowedAt timestamp
  - Pass custom timestamp
  - Assert stowedAt matches provided value

### Testing Subtasks
- [ ] Run `npm test -- stow.service.spec`
- [ ] Verify all tests pass
- [ ] Check code coverage report
- [ ] Fix any failing tests

### References
- DESIGN.md Section 8.1: Unit Tests

---

## Story #10: Integration Tests - GraphQL Resolvers

**Priority:** P1 (Should Have)  
**Estimate:** 3 hours  
**Labels:** `testing`, `integration-tests`

### Description
Write integration tests that test the full GraphQL API with a real test database.

### Acceptance Criteria
- [ ] Tests use in-memory SQLite or test database
- [ ] Tests cover complete workflows:
  - Induct package
  - Stow packages
  - Query package/pallet
- [ ] Tests verify database state after mutations
- [ ] Tests run in isolation (clean database per test)
- [ ] All tests pass

### Implementation Subtasks
- [ ] Create `api/src/resolvers/resolvers.integration.spec.ts`
- [ ] Set up test database connection
- [ ] Create test helper to reset database between tests
- [ ] Create test helper to seed test data
- [ ] Test: inductPackage mutation
  - Execute GraphQL mutation
  - Assert response structure
  - Query database to verify package updated
- [ ] Test: stowPackages mutation
  - Execute GraphQL mutation
  - Assert response structure
  - Query database to verify packages updated
- [ ] Test: complete workflow (induct → stow → query)
  - Induct PKG-001
  - Stow PKG-001 on PLT-001
  - Query pallet, verify package association
- [ ] Test: error scenarios through GraphQL
  - Invalid package ID
  - Invalid state transitions
- [ ] Test: batch induct with partial failure

### Testing Subtasks
- [ ] Run `npm test -- resolvers.integration.spec`
- [ ] Verify all tests pass
- [ ] Verify tests are isolated (no cross-test pollution)
- [ ] Check test execution time (should be < 5 seconds)

### References
- DESIGN.md Section 8.2: Integration Tests
- DESIGN.md Section 8.3: E2E Tests

---

## Story #11: Architecture Diagram Export

**Priority:** P0 (Must Have)  
**Estimate:** 1 hour  
**Labels:** `documentation`, `diagram`

### Description
Export the architecture diagram from DESIGN.md as a standalone image (PNG/PDF) for submission.

### Acceptance Criteria
- [ ] Architecture diagram exported as PNG or PDF
- [ ] Diagram includes all components:
  - GraphQL server, resolvers, services
  - Data access layer (repositories)
  - Data model (entities and relationships)
  - State transition diagram
- [ ] Diagram is clear and readable
- [ ] Diagram saved in `docs/architecture.png` or `.pdf`
- [ ] Future enhancements section included

### Implementation Subtasks
- [ ] Review DESIGN.md architecture diagrams (Section 3)
- [ ] Option A: Use mermaid CLI to export:
  - Install `@mermaid-js/mermaid-cli`
  - Extract mermaid diagrams to separate `.mmd` files
  - Run `mmdc -i architecture.mmd -o architecture.png`
- [ ] Option B: Use online tool:
  - Visit mermaid.live
  - Paste mermaid code
  - Export as PNG/PDF
- [ ] Option C: Create diagram in draw.io or Lucidchart:
  - Re-create diagrams in visual tool
  - Export as PNG/PDF
- [ ] Combine multiple diagrams if needed:
  - Architecture overview
  - Data model
  - State transitions
- [ ] Add legend/annotations if helpful
- [ ] Save to `docs/architecture.png`

### Testing Subtasks
- [ ] Verify diagram is readable at normal size
- [ ] Verify all text is legible
- [ ] Verify diagram matches DESIGN.md content
- [ ] Get feedback on clarity

### References
- DESIGN.md Section 3: Architecture Overview
- PROMPT.md: Architecture Deliverable requirements

---

## Story #12: README Documentation

**Priority:** P0 (Must Have)  
**Estimate:** 2 hours  
**Labels:** `documentation`

### Description
Write comprehensive README with setup instructions, example queries, and test instructions.

### Acceptance Criteria
- [ ] README includes:
  - Project overview
  - Prerequisites (Node.js, npm, Docker)
  - Setup instructions (clone, install, database)
  - How to run the server
  - Example GraphQL queries/mutations
  - How to run tests
  - Architecture reference
- [ ] All commands are copy-paste ready
- [ ] Examples use actual seed data (PKG-001, WH-001, etc.)
- [ ] Instructions are clear for someone unfamiliar with the project

### Implementation Subtasks
- [ ] Create `README.md` at project root
- [ ] Add project overview section:
  - Brief description of WMS
  - Mention interview context
  - Link to DESIGN.md for details
- [ ] Add prerequisites section:
  - Node.js 20+
  - npm or bun
  - Docker (for PostgreSQL)
- [ ] Add setup instructions:
  ```bash
  git clone <repo>
  npm install
  docker-compose up -d  # Start PostgreSQL
  npx prisma migrate dev
  npx prisma db seed
  npm run dev:api
  ```
- [ ] Add GraphQL Playground access:
  - URL: http://localhost:3000/graphql
- [ ] Add example queries:
  - Get package by ID
  - List packages by status
  - Get pallet with packages
- [ ] Add example mutations:
  - Induct single package
  - Induct batch of packages
  - Stow packages on pallet
- [ ] Add testing section:
  ```bash
  npm test                    # Run all tests
  npm test -- --coverage      # With coverage
  npm test -- induct.service  # Specific test
  ```
- [ ] Add architecture section:
  - Link to `docs/architecture.png`
  - Link to `docs/DESIGN.md`
  - Brief tech stack overview
- [ ] Add project structure section (optional)

### Testing Subtasks
- [ ] Follow README from scratch in clean environment
- [ ] Verify all commands work as documented
- [ ] Verify example queries return expected results
- [ ] Fix any errors or unclear instructions

### References
- PROMPT.md: README requirements
- DESIGN.md Section 11: Project Structure

---

## Implementation Order Summary

### Phase 1: Foundation (Stories #1-3)
**Goal:** Database and basic infrastructure  
**Time:** ~5 hours
1. Story #1: Database Schema & Seed Data
2. Story #2: GraphQL Server Setup  
3. Story #3: Package Repository & Basic Queries

**Checkpoint:** GraphQL Playground accessible, can query seed data

---

### Phase 2: Core Mutations (Stories #4-5)
**Goal:** Implement required mutations  
**Time:** ~6 hours
4. Story #4: Induct Mutation - Core Logic
5. Story #5: Stow Mutation - Core Logic

**Checkpoint:** Can induct and stow packages via GraphQL

---

### Phase 3: Testing & Polish (Stories #6-10)
**Goal:** Robust error handling and comprehensive tests  
**Time:** ~11 hours
6. Story #6: Batch Induct Mutation
7. Story #7: Error Handling & Result Types
8. Story #8: Unit Tests - Induct Service
9. Story #9: Unit Tests - Stow Service
10. Story #10: Integration Tests - GraphQL Resolvers

**Checkpoint:** All tests passing, error handling complete

---

### Phase 4: Documentation (Stories #11-12)
**Goal:** Deliverable artifacts  
**Time:** ~3 hours
11. Story #11: Architecture Diagram Export
12. Story #12: README Documentation

**Checkpoint:** Project ready for submission

---

## GitHub Issue Template

Use this template when creating issues:

```markdown
## Story #X: [Title]

**Priority:** [P0/P1]  
**Estimate:** [Hours]  
**Labels:** [labels]

### Description
[Copy from story description]

### Acceptance Criteria
[Copy checklist from story]

### Implementation Subtasks
[Copy checklist from story]

### Testing Subtasks
[Copy checklist from story]

### References
[Copy links from story]

### Definition of Done
- [ ] All implementation subtasks completed
- [ ] All testing subtasks completed
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Documentation updated (if applicable)
```

---

## Notes

### Story Sizing
- **1 hour:** Simple, well-defined task
- **2 hours:** Standard feature with testing
- **3 hours:** Complex feature or multiple components

### Priority Levels
- **P0 (Must Have):** Required for MVP submission
- **P1 (Should Have):** Enhances quality, recommended for submission
- **P2 (Nice to Have):** Future enhancements

### Dependencies
Stories are ordered to minimize blocking. You can work on:
- Stories #1, #2, #11 in parallel (no dependencies)
- Stories #8, #9 in parallel after #4, #5 complete
- Story #12 should be last (needs all features done)

### Time Management
- **Day 1:** Stories #1-5 (Foundation + Core Mutations) = 11 hours
- **Day 2:** Stories #6-10 (Enhancements + Testing) = 11 hours
- **Day 3:** Stories #11-12 + Buffer (Documentation + Fixes) = 3 hours + buffer

Total: ~25 hours with buffer for unexpected issues.
