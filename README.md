# MiCartera 💼 - Gestor de Créditos

Sistema de gestión de créditos personales tipo "prestamitos" colombianos.

**Status**: ✅ Production Ready

---

## 📚 Documentación

- [Backend Setup](./Backend/README.md) - NestJS API
- [Swagger API Docs](http://localhost:3000/api-docs) - Cuando el servidor está corriendo
- [P2-SWAGGER.md](./P2-SWAGGER.md) - Documentación de endpoints
- [P4-TESTS.md](./P4-TESTS.md) - Testing E2E

---

## 🏗️ Arquitectura

```
MiCartera/
├── Backend/              # NestJS API + Prisma ORM
│   ├── src/
│   │   ├── auth/         # JWT Authentication + Roles
│   │   ├── clientes/     # Client management
│   │   ├── creditos/     # Credit management
│   │   ├── pagos/        # Payment tracking
│   │   ├── dashboard/    # KPIs & metrics
│   │   └── common/       # Shared utilities
│   ├── prisma/           # Database migrations & schema
│   ├── test/             # E2E tests
│   └── package.json
├── Frontend/             # Angular SPA (optional)
│   └── micartera-frontend/
└── Documentation files
```

---

## ⚡ Quick Start

### 1. Clonar el repositorio
```bash
git clone https://github.com/your-username/gestor-creditos.git
cd Gestor de Creditos
```

### 2. Backend Setup (NestJS)
```bash
cd Backend

# Copiar variables de entorno
cp .env.example .env

# Instalar dependencias
npm install

# Setup Prisma (migrations + seed inicial)
npx prisma migrate deploy
npx prisma db seed

# Ejecutar en desarrollo
npm run start:dev
```

✅ Backend corriendo en `http://localhost:3000`  
📚 Swagger docs en `http://localhost:3000/api-docs`

### 3. Frontend Setup (Opcional - Angular)
```bash
cd Frontend/micartera-frontend

# Copiar .env
cp .env.example .env

# Instalar
npm install

# Desarrollo
ng serve
```

✅ Frontend en `http://localhost:4200`

---

## 🔒 Variables de Entorno

Crear archivo `.env` en `Backend/` con:

```env
# Servidor
APP_PORT=3000
LOG_LEVEL=INFO

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=creditos_app
DB_PASSWORD=your_secure_password_here    # CAMBIAR EN PRODUCCIÓN
DB_NAME=gestor_creditos
DATABASE_URL=mysql://creditos_app:your_secure_password_here@localhost:3306/gestor_creditos

# JWT (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=your_super_secret_key_min_32_characters_CHANGE_PRODUCTION
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGINS=http://localhost:4200,http://localhost:3000
```

**⚠️ IMPORTANTE**:
- Nunca comitear `.env` con secretos reales
- Usar `.env.example` para documentar estructura
- En producción, usar variables de sistema o secrets manager

---

## 🎯 Funcionalidades

### ✅ Autenticación & Autorización
- JWT tokens (access + refresh)
- 3 roles: ADMIN, COBRADOR, VIEWER
- Auditoría de operaciones

### ✅ Gestión de Clientes
- Crear/actualizar/eliminar clientes
- Validación de DNI único
- Histórico de créditos por cliente

### ✅ Gestión de Créditos
- Plan-A: Créditos con cuotas fijas
- Generación automática de cuotas
- Estados: ACTIVO, PAUSADO, CANCELADO

### ✅ Registrar Pagos
- Pagos flexibles (parciales, adelantados)
- Actualización automática de saldos
- Transacciones atómicas

### ✅ Dashboard & Reportes
- KPIs: Clientes, créditos, cartera vencida
- Balance por crédito
- Total cobrado

---

## 🧪 Testing

### Tests E2E (Happy Path)
```bash
cd Backend
npm run test:e2e
```

Resultado: 8/8 tests pasando ✅

### Tests Unitarios
```bash
npm test          # Una sola ejecución
npm run test:watch  # Watch mode
npm run test:cov  # Con coverage report
```

---

## 📦 Base de Datos

### Setup inicial
```bash
cd Backend

# Crear DB y ejecutar migraciones
npx prisma migrate deploy

# Cargar datos de prueba (seed)
npx prisma db seed

# Ver datos en Studio
npx prisma studio
```

### Estructura de BD
```sql
usuarios        → Autenticación + roles
clientes        → Información de clientes
creditos        → Información de créditos
cuotas          → Cuotas generadas automáticamente
pagos           → Registro de pagos
```

---

## 🚀 Despliegue (Production)

### Build
```bash
cd Backend
npm run build
```

### Ejecutar en producción
```bash
npm run start:prod
```

### Con Docker (Opcional)
```bash
docker build -t gestor-creditos .
docker run -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-password \
  -e JWT_SECRET=your-secret \
  gestor-creditos
```

---

## 📋 API Endpoints

Todos los endpoints están documentados en **Swagger** (`http://localhost:3000/api-docs`)

### Ejemplos principales:
```
POST   /auth/login              - Iniciar sesión
GET    /clientes               - Listar clientes
POST   /clientes               - Crear cliente
POST   /creditos/plan-a        - Crear crédito
POST   /pagos                  - Registrar pago
GET    /pagos/balance/{id}     - Ver balance
GET    /dashboard/kpis         - Ver KPIs
```

---

## 🛠️ Tecnologías

| Componente | Tech | Versión |
|-----------|------|---------|
| Backend | NestJS | 10.x |
| ORM | Prisma | Latest |
| Database | MySQL | 8.0+ |
| Auth | JWT + Passport | - |
| Testing | Jest + Supertest | - |
| Frontend | Angular | 17.x (optional) |

---

## 🐛 Troubleshooting

### "Can't find database"
```bash
# Verificar conexión MySQL
mysql -u creditos_app -p -h localhost

# Ejecutar migraciones
npx prisma migrate deploy
```

### "JWT_SECRET too short"
```env
# Debe ser mínimo 32 caracteres
JWT_SECRET=this_must_be_at_least_32_characters_long_CHANGE_ME
```

### "Port 3000 already in use"
```bash
# Cambiar puerto en .env
APP_PORT=3001
```

---

## 📞 Soporte

Para issues o preguntas, consultar documentación en `docs/` o crear un issue.

---

## 📄 Licencia

Este proyecto es privado. Derechos reservados.

---

**Última actualización**: Enero 2026  
**Status**: ✅ Production Ready
