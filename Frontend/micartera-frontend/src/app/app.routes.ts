import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
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
          import('./features/creditos/creditos').then((m) => m.Creditos),
      },
      {
        path: 'pagos',
        loadComponent: () =>
          import('./features/pagos/pagos').then((m) => m.Pagos),
      },
    ],
  },
];
