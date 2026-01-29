# 🚀 Guía Rápida de Inicio - Frontend

## ⚡ Setup en 5 minutos

### 1. Instalación de Dependencias
```bash
cd Frontend/micartera-frontend
npm install
```

### 2. Configuración del Backend
Edita `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // ← Cambia aquí si necesario
};
```

### 3. Inicia el Servidor de Desarrollo
```bash
npm start
```

La app abrirá automáticamente en `http://localhost:4200`

---

## 🔓 Credenciales de Prueba

Usa estas credenciales para probar el login (del backend):
```
Email: admin@gestor-creditos.local
Password: admin123
```

---

## 📱 Pantallas Disponibles

1. **Login** (`/login`)
   - Email y contraseña
   - Validación en tiempo real
   - Manejo de errores

2. **Dashboard** (`/dashboard`)
   - 5 KPI principales
   - Últimos clientes
   - Últimos créditos
   - Indicadores de negocio

3. **Clientes** (`/clientes`)
   - Tabla paginada
   - Crear/Editar/Eliminar
   - Búsqueda
   - Validaciones

4. **Créditos** (`/creditos`)
   - Tabla de créditos
   - Crear nuevo crédito
   - Seleccionar cliente
   - Configurar términos

5. **Pagos** (`/pagos`)
   - Tabla de pagos
   - Registrar nuevo pago
   - Seleccionar fecha
   - Tipos de pago

---

## 🛠️ Comandos Útiles

### Desarrollo
```bash
npm start              # Inicia servidor dev
npm run build         # Build de producción
npm test              # Ejecuta tests
npm run lint          # Linting con ESLint
```

### Troubleshooting
```bash
npm cache clean --force    # Limpiar cache de npm
rm -rf node_modules       # Borrar node_modules
npm install               # Reinstalar dependencias
```

---

## 🎨 Temas de Colores

El proyecto usa un tema gradiente púrpura:
- **Primario**: `#667eea` → `#764ba2`
- **Acento**: `#FF9800` (naranja)
- **Error**: `#D32F2F` (rojo)
- **Success**: `#4CAF50` (verde)

Para cambiar, edita `src/styles.scss`

---

## 📊 Estructura de Datos

### Usuario (del Login)
```typescript
{
  id: number,
  email: string,
  rol: 'ADMIN' | 'COBRADOR' | 'VIEWER',
  createdAt: string
}
```

### Cliente
```typescript
{
  id: number,
  nombre: string,
  dni: string,
  email: string,
  telefono: string,
  direccion: string,
  activo: boolean,
  createdAt: string
}
```

### Crédito
```typescript
{
  id: number,
  clienteId: number,
  monto: number,
  tasaInteres: number,
  plazoMeses: number,
  plan: string,
  estado: string,
  cuotaMensual?: number,
  cuotasRestantes?: number,
  createdAt: string
}
```

### Pago
```typescript
{
  id: number,
  creditoId: number,
  monto: number,
  fecha: string,
  tipo: string,
  estado: string,
  createdAt: string
}
```

---

## 🔐 Token JWT

Los tokens se almacenan automáticamente en `localStorage`:
```javascript
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')
localStorage.getItem('user')
```

Se limpian automáticamente al hacer logout.

---

## 🐛 Problemas Comunes

### Error: "Module not found"
```bash
npm install
```

### Error: "Cannot match any routes"
- Verifica que el backend esté running en `http://localhost:3000`
- Revisa la consola del navegador (F12)

### Error: "401 Unauthorized"
- El token expiró
- Haz logout y login de nuevo

### Tabla vacía
- Verifica que el backend tiene datos
- Revisa la consola de red (F12 → Network)
- Comprueba que la API URL es correcta

---

## 📈 Performance

Optimizaciones incluidas:
- ✅ Lazy loading de componentes
- ✅ OnPush change detection
- ✅ Standalone components
- ✅ Tree-shaking automático
- ✅ Gzip compression

---

## 🌐 Deployment

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist/micartera-frontend
```

### Docker
```bash
docker build -t gestor-creditos-frontend .
docker run -p 80:80 gestor-creditos-frontend
```

### AWS S3 + CloudFront
```bash
npm run build
aws s3 sync dist/micartera-frontend s3://bucket-name/
```

---

## 🎓 Recursos Útiles

- [Angular Docs](https://angular.io)
- [Material Design](https://material.angular.io)
- [RxJS Guide](https://rxjs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## 🆘 Soporte

**Si algo no funciona:**

1. Revisa la consola del navegador (F12)
2. Verifica que el backend esté corriendo
3. Comprueba que las variables de entorno son correctas
4. Intenta limpiar cache: `npm cache clean --force`
5. Reinstala dependencias: `rm -rf node_modules && npm install`

---

## ✅ Checklist Inicial

- [ ] Backend corriendo en `http://localhost:3000`
- [ ] `npm install` ejecutado
- [ ] `environment.ts` configurado correctamente
- [ ] `npm start` ejecutado
- [ ] Browser abierto en `http://localhost:4200`
- [ ] Login funciona con las credenciales de prueba
- [ ] Dashboard carga sin errores

---

**¡Listo! El frontend está completamente operacional.** 🎉

Para documentación completa, ver `FRONTEND_GUIDE.md`

