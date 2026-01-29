# P1-A RBAC Implementation - Test Examples

## Endpoints Protegidos:

1. **GET /auth/me** - Cualquier rol autenticado (ADMIN/COBRADOR/VIEWER)
2. **GET /admin/ping** - Solo ADMIN
3. **GET /clientes** - ADMIN/COBRADOR/VIEWER (del módulo anterior)

## Curl Test Examples:

### Test 1: Login como ADMIN
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gestor-creditos.local",
    "password": "admin123"
  }' | jq .

# Guardar el token en variable
export ADMIN_TOKEN="<ACCESS_TOKEN_FROM_RESPONSE>"
```

### Test 2: ADMIN accede GET /auth/me ✅
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Response esperada:
# {
#   "success": true,
#   "statusCode": 200,
#   "data": {
#     "id": 1,
#     "email": "admin@gestor-creditos.local",
#     "nombres": "Admin",
#     "rol": "ADMIN",
#     ...
#   }
# }
```

### Test 3: ADMIN accede GET /admin/ping ✅
```bash
curl -X GET http://localhost:3000/admin/ping \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Response:
# {
#   "success": true,
#   "statusCode": 200,
#   "data": {
#     "message": "🔐 Admin access granted",
#     "timestamp": "2026-01-22T..."
#   }
# }
```

### Test 4: Login como VIEWER
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "viewer@gestor-creditos.local",
    "password": "admin123"
  }' | jq .

export VIEWER_TOKEN="<ACCESS_TOKEN_FROM_RESPONSE>"
```

### Test 5: VIEWER accede GET /auth/me ✅
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $VIEWER_TOKEN" | jq .

# Response: Success (200)
```

### Test 6: VIEWER accede GET /admin/ping ❌ 403 Forbidden
```bash
curl -X GET http://localhost:3000/admin/ping \
  -H "Authorization: Bearer $VIEWER_TOKEN" | jq .

# Response esperada:
# {
#   "success": false,
#   "statusCode": 403,
#   "message": "Forbidden",
#   "data": null,
#   "errors": "Rol insuficiente. Se requiere uno de: ADMIN"
# }
```

### Test 7: Sin Authorization (sin token) ❌ 401 Unauthorized
```bash
curl -X GET http://localhost:3000/admin/ping | jq .

# Response:
# {
#   "success": false,
#   "statusCode": 401,
#   "message": "Unauthorized",
#   "data": null
# }
```

## Clean Pattern Used:

### Para proteger un endpoint:
```typescript
@Get('ruta')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
async metodo() {
  // Lógica...
}
```

### Secuencia de validación:
1. **JwtAuthGuard**: Valida token JWT y carga `request.user`
2. **RolesGuard**: Verifica `request.user.rol` contra `@Roles(...)`
3. Si ambos pasan: Procede
4. Si token inválido: 401
5. Si rol insuficiente: 403

## Archivos Modificados:

- ✅ `src/auth/decorators/roles.decorator.ts` - Ya existía (no cambios)
- ✅ `src/auth/guards/roles.guard.ts` - Ya existía (no cambios)
- ✅ `src/auth/auth.controller.ts` - Agregado RolesGuard + @Roles a GET /auth/me
- ✅ `src/app.controller.ts` - Nuevo endpoint GET /admin/ping (ADMIN only)

## Commit Message Suggestion:

```
feat(rbac): apply RBAC to auth and admin endpoints

- Add RolesGuard to GET /auth/me allowing all authenticated roles
- Create admin-only endpoint GET /admin/ping with ADMIN role requirement
- Enforce RBAC pattern: @UseGuards(JwtAuthGuard, RolesGuard) + @Roles(...)
- Returns 403 Forbidden for insufficient role, 401 for unauthenticated
- Pattern ready for application across all modules
```

## Risks Mitigated:

✅ No cambios a existing modules (except guard application)
✅ No modificación de response interceptor o exception filter
✅ Type-safe: Roles enum de Prisma
✅ Minimal diff: 2 files touched, clear pattern
✅ 401/403 handling via global HttpExceptionFilter (existing)
