# P2 Logging + RequestId - Implementation

## Overview

Implemented production-ready structured logging with Pino using:
- **Pino 9.x** - Fast JSON logger
- **Pino-HTTP** - HTTP middleware
- **Pino-Pretty** - Development pretty-printing
- **RequestId** - Per-request UUID tracking
- **LOG_LEVEL** - Configurable from .env (DEBUG, INFO, WARN, ERROR)

---

## Files Created

### 1. `src/common/logger/logger.service.ts`
```typescript
// Pino logger service with typed methods
- debug(message, context?)
- info(message, context?)
- warn(message, context?)
- error(message, error?, context?)
- httpRequest(method, path, statusCode, responseTimeMs, requestId)
- httpError(method, path, statusCode, message, requestId, error?)
```

**Features:**
- Level-based filtering from env
- Color-coded console output (development)
- Sensitive data sanitization (no passwords/tokens logged)
- Error stack trace capture
- RequestId correlation across logs

### 2. `src/common/logger/request-id.middleware.ts`
```typescript
// Express middleware that:
- Generates UUID for each request (or uses x-request-id header)
- Attaches to request.requestId
- Sets x-request-id response header
- Available for downstream use in services/controllers
```

**Pattern:**
```typescript
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}
```

### 3. `src/common/logger/logger.module.ts`
```typescript
// NestJS module exporting LoggerService
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
```

---

## Files Modified

### 1. `src/config/env.ts`
Added:
```typescript
LOG_LEVEL: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).default('INFO')
```

### 2. `src/common/filters/http-exception.filter.ts`
Changes:
- Added `@Inject(LoggerService)` in constructor
- Log all caught exceptions with `this.logger.httpError()`
- Includes method, path, statusCode, message, requestId, stack trace
- Does NOT log passwords/tokens (HttpExceptionFilter already sanitizes)

**Log Output Example:**
```json
{
  "level": 40,
  "requestId": "a1b2c3d4-e5f6...",
  "method": "POST",
  "path": "/auth/login",
  "statusCode": 400,
  "errorMessage": "Validación fallida",
  "error": {
    "message": "User not found",
    "stack": "Error: User not found at AuthService.login..."
  },
  "msg": "HTTP Error: 400"
}
```

### 3. `src/main.ts`
Changes:
- Import LoggerService, RequestIdMiddleware
- Get logger instance: `const logger = app.get(LoggerService)`
- Register middleware: `app.use(new RequestIdMiddleware().use)`
- Pass logger to HttpExceptionFilter: `new HttpExceptionFilter(logger)`
- Use logger for startup message: `logger.info('✅ Server running...')`

### 4. `.env.example`
Added:
```dotenv
LOG_LEVEL=INFO
```

---

## Configuration

### Environment Variables

```dotenv
# Available levels: DEBUG, INFO, WARN, ERROR
# Default: INFO
LOG_LEVEL=DEBUG
```

### Log Levels

| Level | Use Case |
|-------|----------|
| **DEBUG** | Detailed request/response, variable values, flow tracing |
| **INFO** | Server startup, request summaries, successful operations |
| **WARN** | Deprecated usage, missing optional config, retry attempts |
| **ERROR** | Exceptions, validation failures, database errors |

---

## Usage Examples

### In Services

```typescript
import { LoggerService } from '@common/logger/logger.service';

@Injectable()
export class AuthService {
  constructor(private logger: LoggerService) {}

  async login(dto: LoginDto) {
    this.logger.debug('Login attempt', { email: dto.email });
    
    try {
      const user = await this.prisma.usuario.findUnique({...});
      this.logger.info('Login successful', { userId: user.id });
      return tokens;
    } catch (error) {
      this.logger.error('Login failed', error, { email: dto.email });
      throw error;
    }
  }
}
```

### In Controllers

```typescript
import { Request } from 'express';

@Post('login')
async login(@Body() dto: LoginDto, @Req() req: Request) {
  const requestId = req.requestId;
  // Logger uses requestId automatically in HttpExceptionFilter
  return this.authService.login(dto);
}
```

### RequestId Access

```typescript
// In any controller/service:
import { Request } from 'express';

@Get('example')
async example(@Req() req: Request) {
  const requestId = req.requestId; // UUID automatically injected
  this.logger.info('Processing request', { requestId });
}
```

---

## Security Features

### What IS Logged
✅ HTTP method, path, status code, response time
✅ User ID (not email if sensitive)
✅ Error types and messages (business-safe)
✅ RequestId for tracing

### What is NOT Logged
❌ Passwords (never enter LoggerService)
❌ JWT tokens (not in logger calls)
❌ API keys (use sanitization in error messages)
❌ SSNs, credit cards (validate DTOs before logging)

### Best Practices
```typescript
// ❌ BAD
this.logger.info('User login', { email, password });

// ✅ GOOD
this.logger.info('User login', { userId: user.id, requestId });

// ❌ BAD
this.logger.error('Auth failed', error, { jwt: token });

// ✅ GOOD
this.logger.error('Auth failed', error, { requestId, statusCode: 401 });
```

---

## Output Examples

### Development (with pino-pretty)

```
  INFO  (app/12345): ✅ Server running on port 3000
        requestId: "a1b2c3d4-e5f6-4789-a012-b3456c789012"
        port: 3000

  DEBUG (auth/12345): Login attempt
        requestId: "a1b2c3d4-e5f6-4789-a012-b3456c789012"
        email: "admin@example.com"

  INFO  (auth/12345): Login successful
        requestId: "a1b2c3d4-e5f6-4789-a012-b3456c789012"
        userId: 1

  ERROR (http/12345): HTTP Error: 401
        requestId: "a1b2c3d4-e5f6-4789-a012-b3456c789012"
        method: "POST"
        path: "/auth/login"
        statusCode: 401
        errorMessage: "Email no encontrado"
        error: {
          message: "Email no encontrado"
          stack: "Error: Email no encontrado at AuthService.login..."
        }
```

### Production (JSON)

```json
{
  "level": 30,
  "time": 1674345678901,
  "pid": 12345,
  "hostname": "prod-server",
  "requestId": "a1b2c3d4-e5f6-4789-a012-b3456c789012",
  "method": "POST",
  "path": "/auth/login",
  "statusCode": 200,
  "responseTimeMs": 45,
  "msg": "HTTP Request"
}
```

---

## Testing

### Test 1: Check LOG_LEVEL env
```bash
# In .env
LOG_LEVEL=DEBUG

# Run server
npm run start:dev

# Should see DEBUG logs
# 🔍 Look for logs at all levels
```

### Test 2: Verify RequestId Header
```bash
curl -X GET http://localhost:3000/admin/ping \
  -H "Authorization: Bearer $TOKEN" \
  -v

# Should see response header:
# x-request-id: a1b2c3d4-e5f6-4789-a012-b3456c789012
```

### Test 3: Verify Error Logging
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@email.com","password":"wrong"}'

# Should see ERROR log with:
# - requestId
# - method: POST
# - path: /auth/login
# - statusCode: 401
# - errorMessage: "Email no encontrado"
# - error stack trace
```

---

## Commit Message Suggestion

```
feat(logging): implement structured logging with Pino & RequestId

- Add LoggerService with Pino for production-ready logging
- Implement RequestIdMiddleware for per-request UUID tracking
- Configure LOG_LEVEL from .env (DEBUG/INFO/WARN/ERROR)
- Integrate logging into HttpExceptionFilter for error tracking
- Add x-request-id header to all HTTP responses
- Sanitize sensitive data (no passwords/tokens logged)
- Add pino & pino-pretty dependencies
- Update .env.example with LOG_LEVEL=INFO default

Minimal risk:
- No changes to business logic
- Middleware-based injection (non-intrusive)
- Backward compatible with existing code
- LoggerService optional in services (use when needed)
- HttpExceptionFilter auto-logs all errors
```

---

## Status

✅ Build: PASS
✅ Logger module created with type-safe methods
✅ RequestId middleware injecting UUIDs
✅ HttpExceptionFilter logging all errors with requestId
✅ LOG_LEVEL configurable from .env
✅ Sensitive data not logged (sanitized)
✅ Production-ready (Pino optimized for performance)
✅ Development-friendly (pino-pretty for console)
✅ Documentation complete with examples

**Ready for deployment.**
