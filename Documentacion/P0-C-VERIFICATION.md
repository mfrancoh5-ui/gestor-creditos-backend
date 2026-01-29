# P0-C: JWT Authentication - VERIFICACIÓN Y PRUEBAS

## ✅ IMPLEMENTACIÓN COMPLETADA

### Archivos Creados
- ✅ `src/auth/auth.module.ts` - Módulo Auth con JWT + Passport
- ✅ `src/auth/auth.service.ts` - Lógica de login, refresh, hashing
- ✅ `src/auth/auth.controller.ts` - Endpoints /auth/login, /auth/refresh, /auth/me
- ✅ `src/auth/strategies/jwt.strategy.ts` - Estrategia Passport.js para validar JWT
- ✅ `src/auth/guards/jwt-auth.guard.ts` - Guard para proteger rutas
- ✅ `src/auth/decorators/current-user.decorator.ts` - Inyecta usuario autenticado
- ✅ `src/auth/dto/login.dto.ts` - DTO con validaciones
- ✅ `src/auth/dto/refresh-token.dto.ts` - DTO para refresh
- ✅ `prisma/seed.ts` - Script para crear usuario ADMIN de dev

### Archivos Modificados
- ✅ `prisma/schema.prisma` - Agregado modelo Usuario + enum Rol
- ✅ `src/config/env.ts` - Agregadas variables JWT_SECRET, JWT_EXPIRATION, JWT_REFRESH_EXPIRATION
- ✅ `.env` - Valores JWT configurados
- ✅ `.env.example` - Documentado con ejemplos
- ✅ `src/app.module.ts` - Importado AuthModule
- ✅ `package.json` - Agregadas dependencias + scripts Prisma

### Database Migration
```
✅ Migración creada: prisma/migrations/20260122060421_add_usuario_model/migration.sql
✅ Base de datos sincronizada con schema
✅ Usuario ADMIN creado: admin@gestor-creditos.local / admin123
```

---

## 🧪 PRUEBAS (Comandos para ejecutar)

### Paso 1: Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gestor-creditos.local",
    "password": "admin123"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Operación exitosa",
  "timestamp": "2026-01-22T00:05:40.000Z",
  "path": "/auth/login"
}
```

---

### Paso 2: Acceder a ruta protegida (/auth/me) con Access Token
```bash
# Copiar el accessToken de la respuesta anterior
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": 1,
    "email": "admin@gestor-creditos.local",
    "nombres": "Admin Local",
    "rol": "ADMIN",
    "clienteId": null,
    "activo": true,
    "createdAt": "2026-01-22T00:02:30.000Z",
    "updatedAt": "2026-01-22T00:02:30.000Z"
  },
  "message": "Operación exitosa",
  "timestamp": "2026-01-22T00:05:45.000Z",
  "path": "/auth/me"
}
```

---

### Paso 3: Refresh Token
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refreshToken>"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Operación exitosa",
  "timestamp": "2026-01-22T00:05:50.000Z",
  "path": "/auth/refresh"
}
```

---

### Prueba 4: Error - Token inválido/expirado
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer invalid_token"
```

**Respuesta esperada:**
```json
{
  "success": false,
  "statusCode": 401,
  "data": null,
  "message": "Token inválido o expirado",
  "timestamp": "2026-01-22T00:05:55.000Z",
  "path": "/auth/me"
}
```

---

### Prueba 5: Error - Credenciales incorrectas
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gestor-creditos.local",
    "password": "wrongpassword"
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "statusCode": 401,
  "data": null,
  "message": "Email o contraseña incorrectos",
  "timestamp": "2026-01-22T00:06:00.000Z",
  "path": "/auth/login"
}
```

---

### Prueba 6: Error - Validación de DTO
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "123"
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "statusCode": 400,
  "data": null,
  "message": "Validación fallida",
  "timestamp": "2026-01-22T00:06:05.000Z",
  "path": "/auth/login",
  "errors": {
    "email": ["Email debe ser válido"],
    "password": ["Password debe tener al menos 6 caracteres"]
  }
}
```

---

## 📝 NOTAS IMPORTANTES

### Credenciales de Desarrollo
```
Email: admin@gestor-creditos.local
Contraseña: admin123
```
⚠️ **SOLO PARA DESARROLLO** - Cambiar en producción

### Tokens
- **Access Token**: Válido por 15 minutos (JWT_EXPIRATION=15m)
- **Refresh Token**: Válido por 7 días (JWT_REFRESH_EXPIRATION=7d)
- Ambos se hashean y se guardan en BD por seguridad

### Endpoints sin protección
- ✅ POST /creditos/plan-a (sigue público)
- ✅ GET / (sigue público)

### Endpoints protegidos (con JwtAuthGuard)
- ✅ GET /auth/me (requiere Authorization header)

---

## 🔧 COMANDOS ÚTILES

```bash
# Compilar
npm run build

# Desarrollo
npm run start:dev

# Producción
npm run start:prod

# Ejecutar seed
npm run prisma:seed

# Ver BD en Prisma Studio
npm run prisma:studio

# Crear nueva migración
npm run prisma:migrate -- --name <name>
```

---

## 📦 ESTADO DE COMPILACIÓN
✅ **npm run build**: SIN ERRORES
✅ **npm run start:dev**: SERVIDOR CORRIENDO EN PUERTO 3000
✅ **Rutas mapeadas**: /auth/login, /auth/refresh, /auth/me
✅ **Base de datos**: MIGRACIÓN APLICADA, USUARIO ADMIN CREADO

---

## 🚀 PRÓXIMOS PASOS

- P1-A: RBAC (Role-Based Access Control) - Decorador @Roles(), RolesGuard
- P1-B: Módulo Clientes (CRUD completo)
- P1-C: Módulo Pagos
- P1-D: Dashboard KPIs
