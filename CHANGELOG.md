# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added - 2025-12-04

#### Backend Authentication System
- **NestJS Authentication Module**: Implemented complete authentication system with JWT tokens
  - User registration endpoint (`POST /auth/register`)
  - User login endpoint (`POST /auth/login`)
  - Protected profile endpoint (`GET /auth/profile`)
  
- **Database Layer**:
  - Prisma 7 integration with Neon PostgreSQL
  - User model with email (unique), password (hashed), timestamps
  - Initial migration: `20251204090252_init`
  - Prisma adapter pattern for Prisma 7 compatibility (`@prisma/adapter-pg`)

- **Security Features**:
  - Password hashing with bcrypt (salt rounds: 10)
  - JWT token generation and validation
  - Passport JWT strategy for route protection
  - JWT expiration: 1 hour

- **Validation**:
  - Zod schema validation for DTOs
  - Email format validation
  - Password minimum length: 6 characters

- **Dependencies**:
  - `@nestjs/passport`, `passport`, `passport-jwt` - Authentication
  - `@nestjs/jwt` - JWT token management
  - `bcrypt` - Password hashing
  - `zod`, `nestjs-zod` - Request validation
  - `@prisma/client`, `prisma` - Database ORM
  - `@prisma/adapter-pg`, `pg` - PostgreSQL driver adapter
  - `@nestjs/config` - Environment configuration

### Technical Details

#### Prisma 7 Migration
- Adapted to Prisma 7's breaking changes:
  - Removed `url` from datasource block in `schema.prisma`
  - Implemented driver adapter pattern with `PrismaPg`
  - Database URL configured via `prisma.config.ts` and environment variables

#### Architecture Decisions
- Modular structure: Separate `PrismaModule` and `AuthModule`
- Global configuration with `ConfigModule`
- Reusable `JwtAuthGuard` for protecting routes
- Service-based architecture for business logic separation

### Files Created
- `backend/prisma/schema.prisma` - Database schema
- `backend/prisma/migrations/20251204090252_init/` - Initial migration
- `backend/src/prisma/prisma.service.ts` - Database service
- `backend/src/prisma/prisma.module.ts` - Prisma module
- `backend/src/auth/auth.service.ts` - Authentication business logic
- `backend/src/auth/auth.controller.ts` - Authentication endpoints
- `backend/src/auth/auth.module.ts` - Auth module configuration
- `backend/src/auth/jwt.strategy.ts` - JWT validation strategy
- `backend/src/auth/jwt-auth.guard.ts` - Route protection guard
- `backend/src/auth/dto/login.dto.ts` - Login validation schema
- `backend/src/auth/dto/register.dto.ts` - Registration validation schema

### Files Modified
- `backend/src/app.module.ts` - Added ConfigModule and AuthModule
- `backend/.env` - Added DATABASE_URL and JWT_SECRET
