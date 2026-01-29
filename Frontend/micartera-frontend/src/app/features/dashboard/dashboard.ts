import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { DashboardService } from '../../core/services/dashboard.service';
import { ClientesService } from '../../core/services/clientes.service';
import { CreditosService } from '../../core/services/creditos.service';

type DashboardStats = {
  totalClientes: number;
  creditosActivos: number;
  montoDesembolsado: number;
  recaudacionMes: number;
  morosidad: number; // puede venir 0..1 o 0..100
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  loading = false;

  stats: DashboardStats = {
    totalClientes: 0,
    creditosActivos: 0,
    montoDesembolsado: 0,
    recaudacionMes: 0,
    morosidad: 0,
  };

  recentClientes: any[] = [];
  recentCreditos: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    private clientesService: ClientesService,
    private creditosService: CreditosService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private normalizeStats(anyRes: any): DashboardStats | null {
    const raw =
      anyRes?.data ??
      anyRes?.kpis ??
      (anyRes?.success && anyRes?.data ? anyRes.data : null) ??
      anyRes;

    if (!raw || typeof raw !== 'object') return null;

    const s: DashboardStats = {
      totalClientes: Number(raw.totalClientes ?? raw.total_clientes ?? 0),
      creditosActivos: Number(raw.creditosActivos ?? raw.creditos_activos ?? 0),
      montoDesembolsado: Number(raw.montoDesembolsado ?? raw.monto_desembolsado ?? 0),
      recaudacionMes: Number(raw.recaudacionMes ?? raw.recaudacion_mes ?? 0),
      morosidad: Number(raw.morosidad ?? raw.morosidad_pct ?? 0),
    };

    // saneo NaN
    Object.keys(s).forEach((k) => {
      const key = k as keyof DashboardStats;
      if (!Number.isFinite(s[key])) (s[key] as number) = 0;
    });

    return s;
  }

  private cargarDatos(): void {
    this.loading = true;

    const resumen$ = this.dashboardService.obtenerResumen().pipe(
      map((res) => this.normalizeStats(res)),
      catchError((err) => {
        console.error('Error cargando estadísticas:', err);
        return of(null);
      })
    );

    const clientes$ = this.clientesService.listarClientes(1, 5).pipe(
      map((res) => (res?.success && res.data ? res.data.items ?? [] : res?.data?.items ?? [])),
      catchError((err) => {
        console.error('Error cargando clientes:', err);
        return of([]);
      })
    );

    const creditos$ = this.creditosService.listarCreditos(1, 5).pipe(
      map((res) => (res?.success && res.data ? res.data.items ?? [] : res?.data?.items ?? [])),
      catchError((err) => {
        console.error('Error cargando créditos:', err);
        return of([]);
      })
    );

    forkJoin({ resumen: resumen$, clientes: clientes$, creditos: creditos$ })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(({ resumen, clientes, creditos }) => {
        if (resumen) this.stats = resumen;
        this.recentClientes = clientes;
        this.recentCreditos = creditos;
      });
  }

  // ✅ Devuelve siempre porcentaje 0..100 (string)
  getMorosidadPercentage(): string {
    const v = Number(this.stats.morosidad) || 0;
    const pct = v <= 1 ? v * 100 : v; // soporta 0..1 o 0..100
    const safe = Math.max(0, Math.min(100, pct));
    return `${safe.toFixed(2)}%`;
  }

  getMorosidadStatus(): string {
    const v = Number(this.stats.morosidad) || 0;
    const pct = v <= 1 ? v * 100 : v;

    if (pct < 5) return 'Bajo';
    if (pct < 15) return 'Medio';
    return 'Alto';
  }
}
