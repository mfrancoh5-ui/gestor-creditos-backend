import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [
    NgFor,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
})
export class BottomNavComponent {
  items = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { label: 'Clientes', icon: 'people', path: '/clientes' },
    { label: 'Créditos', icon: 'request_quote', path: '/creditos' },
    { label: 'Pagos', icon: 'payments', path: '/pagos' },
  ];
}
