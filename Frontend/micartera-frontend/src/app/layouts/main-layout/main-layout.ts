import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';

import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    LayoutModule,

    RouterOutlet,
    RouterLink,
    RouterLinkActive,

    BottomNavComponent,

    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent {

  private bp = inject(BreakpointObserver);

  readonly isMobile$ = this.bp
    .observe([Breakpoints.Handset, Breakpoints.Small])
    .pipe(
      map(r => r.matches),
      shareReplay(1)
    );
}
