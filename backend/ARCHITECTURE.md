# Backend Architecture

## Overview

This backend is built with **NestJS**, a progressive Node.js framework for building efficient and scalable server-side applications. The architecture follows NestJS best practices with a modular, service-oriented design.

## Technology Stack

- **Framework**: NestJS 11.x
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Prisma 7.1.0
- **Authentication**: JWT with Passport
- **Validation**: Zod
- **Language**: TypeScript

## Architecture Decisions

### 1. Modular Design

The application is organized into feature modules:

```
src/
├── app.module.ts          # Root module
├── prisma/                # Database module
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── auth/                  # Authentication module
    ├── auth.module.ts
    ├── auth.service.ts
    ├── auth.controller.ts
    ├── jwt.strategy.ts
    ├── jwt-auth.guard.ts
    └── dto/
        ├── login.dto.ts
        └── register.dto.ts
```

**Rationale**: Modular architecture promotes:
- **Separation of concerns**: Each module handles a specific domain
- **Reusability**: Modules can be imported and reused
- **Testability**: Isolated modules are easier to test
- **Maintainability**: Changes are localized to specific modules

### 2. Prisma 7 with Driver Adapters

**Decision**: Use Prisma 7 with the PostgreSQL driver adapter pattern.

```typescript
// prisma.service.ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
super({ adapter });
```

**Rationale**:
- **Prisma 7 Requirement**: Version 7 mandates driver adapters for database connections
- **Connection Pooling**: The `pg` Pool manages database connections efficiently
- **Serverless Compatibility**: Works well with Neon's serverless PostgreSQL
- **Type Safety**: Prisma generates TypeScript types from the schema

**Trade-offs**:
- Additional dependency (`@prisma/adapter-pg`)
- More verbose setup compared to Prisma 6
- Better performance and smaller bundle size

### 3. JWT Authentication Strategy

**Decision**: Implement stateless authentication with JWT tokens.

```typescript
// Flow:
// 1. User registers → Password hashed with bcrypt
// 2. User logs in → JWT token generated
// 3. Protected routes → JWT validated via Passport strategy
```

**Rationale**:
- **Stateless**: No server-side session storage needed
- **Scalable**: Works across multiple server instances
- **Standard**: Industry-standard authentication method
- **Flexible**: Easy to extend with refresh tokens

**Security Considerations**:
- Passwords hashed with bcrypt (10 salt rounds)
- JWT secret stored in environment variables
- Token expiration set to 1 hour
- Bearer token authentication in headers

### 4. Zod for Validation

**Decision**: Use Zod instead of class-validator.

```typescript
// Example DTO
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

**Rationale**:
- **Type Inference**: Zod schemas automatically infer TypeScript types
- **Runtime Safety**: Validates data at runtime
- **Composability**: Easy to compose and reuse schemas
- **Developer Experience**: Better error messages and autocomplete

### 5. Global Configuration Module

**Decision**: Use `@nestjs/config` with global scope.

```typescript
ConfigModule.forRoot({
  isGlobal: true,
})
```

**Rationale**:
- **Centralized Config**: Single source of truth for environment variables
- **Type Safety**: Can define typed configuration
- **No Import Needed**: Global scope eliminates repeated imports
- **Validation**: Can validate env vars on startup

## Database Schema Design

### User Model

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Design Decisions**:
- **Integer ID**: Auto-incrementing for simplicity (can migrate to UUID if needed)
- **Unique Email**: Ensures one account per email address
- **Password Field**: Stores bcrypt hash (never plain text)
- **Timestamps**: Automatic tracking of creation and updates

**Future Considerations**:
- Add `name` field for user profiles
- Add `role` enum for authorization (USER, ADMIN)
- Add `emailVerified` boolean for email verification flow
- Add `refreshToken` field for refresh token rotation

## Service Layer Pattern

**Decision**: Separate business logic into service classes.

```
Controller → Service → Prisma
```

**Rationale**:
- **Single Responsibility**: Controllers handle HTTP, services handle logic
- **Testability**: Services can be unit tested without HTTP layer
- **Reusability**: Services can be injected into multiple controllers
- **Maintainability**: Business logic centralized and easier to modify

## Authentication Flow

### Registration Flow
1. Client sends email + password to `POST /auth/register`
2. `ZodValidationPipe` validates request body
3. `AuthService.register()` hashes password with bcrypt
4. User created in database via Prisma
5. Response returns user info (without password)

### Login Flow
1. Client sends email + password to `POST /auth/login`
2. `ZodValidationPipe` validates request body
3. `AuthService.login()` finds user by email
4. Password compared with bcrypt
5. JWT token generated with user payload
6. Response returns access token

### Protected Route Access
1. Client sends request with `Authorization: Bearer <token>` header
2. `JwtAuthGuard` extracts and validates token
3. `JwtStrategy.validate()` decodes payload
4. User object attached to request
5. Controller accesses user via `@Request() req`

## Error Handling

**Current Implementation**:
- `UnauthorizedException` for invalid credentials
- Zod validation errors automatically formatted by `nestjs-zod`
- Prisma errors (unique constraint, etc.) bubble up as 500 errors

**Improvements Needed**:
- Global exception filter for Prisma errors
- Custom error messages for better UX
- Error logging and monitoring

## Environment Configuration

Required environment variables:

```env
DATABASE_URL="postgresql://..."  # Neon PostgreSQL connection string
JWT_SECRET="..."                 # Secret key for JWT signing
PORT=3000                        # Optional, defaults to 3000
```

## Testing Strategy

**Recommended Approach**:
- **Unit Tests**: Test services in isolation with mocked dependencies
- **Integration Tests**: Test controllers with real database (test container)
- **E2E Tests**: Test complete authentication flows

**Current Status**: Tests not yet implemented (future work)

## Performance Considerations

1. **Connection Pooling**: pg Pool manages database connections
2. **Password Hashing**: Bcrypt is CPU-intensive (consider async operations)
3. **JWT Validation**: Stateless validation is fast (no DB lookup)
4. **Database Indexes**: Email field has unique index for fast lookups

## Security Best Practices

✅ **Implemented**:
- Password hashing with bcrypt
- JWT token expiration
- Environment variable for secrets
- Unique email constraint

⚠️ **Future Improvements**:
- Rate limiting on auth endpoints
- Refresh token rotation
- Email verification
- Password reset flow
- CORS configuration
- Helmet for security headers
- Input sanitization

## Scalability Considerations

**Current Architecture Supports**:
- Horizontal scaling (stateless JWT)
- Database connection pooling
- Neon serverless auto-scaling

**Future Enhancements**:
- Redis for token blacklisting
- Caching layer for frequently accessed data
- Message queue for async operations
- Microservices separation if needed

## Migration Strategy

**Prisma Migrations**:
- Development: `prisma migrate dev`
- Production: `prisma migrate deploy`
- Schema changes tracked in `prisma/migrations/`

**Best Practices**:
- Always review generated SQL
- Test migrations on staging first
- Keep migrations small and focused
- Never edit migration files manually

## Deployment Considerations

**Environment Setup**:
1. Set environment variables (DATABASE_URL, JWT_SECRET)
2. Run migrations: `pnpm exec prisma migrate deploy`
3. Generate Prisma Client: `pnpm exec prisma generate`
4. Build application: `pnpm build`
5. Start server: `pnpm start:prod`

**Neon-Specific**:
- Use connection pooler URL for better performance
- Enable SSL mode (already configured)
- Monitor connection usage in Neon dashboard

## Future Roadmap

### Short-term
- [ ] Add refresh token mechanism
- [ ] Implement role-based access control (RBAC)
- [ ] Add email verification
- [ ] Add password reset flow
- [ ] Write unit and integration tests

### Medium-term
- [ ] Add user profile management
- [ ] Implement OAuth providers (Google, GitHub)
- [ ] Add rate limiting and throttling
- [ ] Set up logging and monitoring
- [ ] Add API documentation (Swagger)

### Long-term
- [ ] Implement microservices architecture
- [ ] Add GraphQL API
- [ ] Set up CI/CD pipeline
- [ ] Add comprehensive E2E tests
- [ ] Performance optimization and caching
