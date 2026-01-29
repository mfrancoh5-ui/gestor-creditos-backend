import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/clientes').then((m) => m.Clientes),
      },
      {
        path: 'creditos',
        loadComponent: () =>
          import('./features/creditos/creditos').then((m) => m.CreditosComponent),
      },
      {
        path: 'pagos',
        loadComponent: () =>
          import('./features/pagos/pagos').then((m) => m.PagosComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
