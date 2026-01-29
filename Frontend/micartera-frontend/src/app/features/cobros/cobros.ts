import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CobrosService } from './services/cobros.service';
import { CuotaOperativa } from './models/cuota-operativa.model';
import { CobrarDialogComponent } from './components/cobrar-dialog/cobrar-dialog';

@Component({
  standalone: true,
  selector: 'app-cobros',
  imports: [CommonModule],
  templateUrl: './cobros.html',
  styleUrls: ['./cobros.scss'],
})
export class CobrosComponent implements OnInit {
  cuotas: CuotaOperativa[] = [];
  fechaSeleccionada = this.hoy();

  loading = false;

  constructor(
    private cobrosService: CobrosService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarCuotas();
  }

  cargarCuotas(): void {
    this.loading = true;
    this.cobrosService
      .listarCuotas({ fecha: this.fechaSeleccionada })
      .subscribe({
        next: (resp) => {
          this.cuotas = resp.data;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  abrirCobro(cuota: CuotaOperativa): void {
    const dialogRef = this.dialog.open(CobrarDialogComponent, {
      width: '420px',
      data: cuota,
    });

    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) this.cargarCuotas();
    });
  }

  private hoy(): string {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }
}
