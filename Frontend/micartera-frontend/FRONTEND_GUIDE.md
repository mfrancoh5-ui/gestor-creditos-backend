# Frontend - Gestor de Créditos

Un frontend moderno y funcional construido con **Angular 21** y **Angular Material** para gestionar créditos, clientes y pagos.

## 🚀 Características

- ✅ **Autenticación con JWT**: Login seguro con tokens JWT
- ✅ **Dashboard Interactivo**: KPI's en tiempo real y gráficos
- ✅ **Gestión de Clientes**: CRUD completo de clientes
- ✅ **Gestión de Créditos**: Crear, listar y administrar créditos
- ✅ **Gestión de Pagos**: Registrar y visualizar pagos
- ✅ **Diseño Responsivo**: Funciona en desktop, tablet y móvil
- ✅ **Material Design**: Interfaz moderna con Angular Material
- ✅ **Interceptores HTTP**: Manejo automático de autenticación
- ✅ **Componentes Standalone**: Arquitectura moderna de Angular

## 📋 Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- Angular CLI >= 21.x

## 📦 Instalación

1. **Navega al directorio del frontend**:
```bash
cd Frontend/micartera-frontend
```

2. **Instala las dependencias**:
```bash
npm install
```

3. **Configura las variables de entorno**:

Edita `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Cambia según tu backend
};
```

## 🏃 Ejecución

### Modo Desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://local host:4200`

### Modo Producción

```bash
npm run build
npm start:prod
```

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── core/                      # Servicios, guards, interceptores
│   │   ├── guards/               # Guards de autenticación
│   │   ├── interceptors/         # Interceptores HTTP
│   │   ├── models/               # Interfaces de datos
│   │   └── services/             # Servicios (Auth, API, etc)
│   ├── features/                 # Módulos de negocio
│   │   ├── auth/                 # Login
│   │   ├── dashboard/            # Dashboard
│   │   ├── clientes/             # Gestión de clientes
│   │   ├── creditos/             # Gestión de créditos
│   │   └── pagos/                # Gestión de pagos
│   ├── layouts/                  # Layouts principales
│   ├── shared/                   # Componentes compartidos
│   ├── app.config.ts             # Configuración de la app
│   └── app.routes.ts             # Rutas principales
├── environments/                 # Configuraciones de entorno
└── styles.scss                   # Estilos globales
```

## 🔐 Autenticación

### Flujo de Login

1. Usuario ingresa email y contraseña
2. El servicio `AuthService` realiza POST a `/auth/login`
3. Backend retorna `access_token`, `refresh_token` y datos del usuario
4. Tokens se almacenan en `localStorage`
5. El `authInterceptor` incluye automáticamente el token en requests

### Rutas Protegidas

Las rutas están protegidas por el `authGuard`. Solo usuarios autenticados pueden acceder.

```typescript
{
  path: 'dashboard',
  canActivate: [authGuard],
  loadComponent: () => ...
}
```

## 📱 Servicios Principales

### AuthService
Gestiona la autenticación y sesión del usuario.

```typescript
// Login
authService.login(email, password).subscribe(response => {
  // Token almacenado automáticamente
});

// Logout
authService.logout();

// Verificar autenticación
if (authService.isAuthenticated()) {
  // Usuario autenticado
}
```

### ClientesService
Operaciones CRUD de clientes.

```typescript
// Listar clientes
clientesService.listarClientes(page, pageSize).subscribe(...);

// Crear cliente
clientesService.crearCliente(dto).subscribe(...);

// Actualizar cliente
clientesService.actualizarCliente(id, dto).subscribe(...);

// Eliminar cliente
clientesService.eliminarCliente(id).subscribe(...);
```

### CreditosService
Gestión de créditos.

```typescript
// Listar créditos
creditosService.listarCreditos(page, pageSize).subscribe(...);

// Crear crédito
creditosService.crearCredito(dto).subscribe(...);

// Obtener balance
creditosService.obtenerBalance(creditoId).subscribe(...);
```

### PagosService
Gestión de pagos.

```typescript
// Listar pagos
pagosService.listarPagos(page, pageSize).subscribe(...);

// Registrar pago
pagosService.registrarPago(dto).subscribe(...);
```

### DashboardService
Datos del dashboard.

```typescript
// Obtener resumen
dashboardService.obtenerResumen().subscribe(...);

// Obtener indicadores
dashboardService.obtenerIndicadores().subscribe(...);
```

## 🎨 Temas y Estilos

El proyecto usa Angular Material con temas personalizados. Los colores principales son:

- **Primario**: Gradiente púrpura (#667eea - #764ba2)
- **Acento**: Naranja (#FF9800)
- **Error**: Rojo (#D32F2F)

### Customizar Tema

Edita `src/styles.scss` para cambiar los colores.

## 📋 Validaciones

### Formularios Reactivos

Todos los formularios usan `ReactiveFormsModule` con validaciones complejas:

```typescript
form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  monto: ['', [Validators.required, Validators.min(0)]],
});
```

### Mensajes de Error

Los campos muestran mensajes de error específicos usando Angular Material:

```html
<mat-error *ngIf="email?.hasError('required')">
  El email es requerido
</mat-error>
<mat-error *ngIf="email?.hasError('email')">
  Ingresa un email válido
</mat-error>
```

## 🔧 Utilidades

### Paginación

La tabla utiliza `MatPaginator` con configuración:
- Tamaño de página: 10 (configurable)
- Opciones: [5, 10, 25, 50]

```typescript
<mat-paginator
  [length]="totalRegistros"
  [pageSize]="pageSize"
  [pageSizeOptions]="[5, 10, 25, 50]"
  (page)="onPageChange($event)"
></mat-paginator>
```

### Notificaciones

Usa `MatSnackBar` para mensajes:

```typescript
this.snackBar.open('Operación exitosa', 'Cerrar', {
  duration: 3000,
  horizontalPosition: 'end',
  verticalPosition: 'bottom'
});
```

### Diálogos

Componentes en diálogos para formularios:

```typescript
const dialogRef = this.dialog.open(ClienteFormComponent, {
  width: '500px',
  data: cliente
});

dialogRef.afterClosed().subscribe(result => {
  if (result) {
    // Procesar resultado
  }
});
```

## 🚀 Deploy

### Netlify

1. Build el proyecto:
```bash
npm run build
```

2. Deploy la carpeta `dist/micartera-frontend`:
```bash
netlify deploy --prod --dir=dist/micartera-frontend
```

### Docker

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/micartera-frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🐛 Solución de Problemas

### Error: "Cannot match any routes"

Asegúrate de que el backend esté corriendo en `http://localhost:3000/api`

### Error: "401 Unauthorized"

El token ha expirado. Intenta hacer logout y login de nuevo.

### Los estilos no se cargan

Asegúrate de que Angular Material esté instalado:
```bash
ng add @angular/material
```

## 📚 Recursos

- [Angular Docs](https://angular.io/docs)
- [Angular Material](https://material.angular.io)
- [Angular Forms](https://angular.io/guide/reactive-forms)
- [RxJS Documentation](https://rxjs.dev)

## 📄 Licencia

MIT License

## 👨‍💻 Autor

Construido como parte del proyecto Gestor de Créditos

---

**¡Listo! Tu frontend está completamente funcional y listo para producción.** 🎉
