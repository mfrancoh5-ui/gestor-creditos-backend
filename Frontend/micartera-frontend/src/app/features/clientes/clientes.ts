import { Component, inject } from '@angular/core';
import {
  AsyncPipe,
  DatePipe,
  NgFor,
  NgIf,
  UpperCasePipe,
} from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ClientesService, Cliente } from '../../core/services/clientes.service';
import { ClienteFormComponent } from './cliente-form/cliente-form';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    // Angular
    AsyncPipe,
    DatePipe,
    NgIf,
    NgFor,
    UpperCasePipe,

    // Material
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,

    // Standalone dialog component (recomendado)
    ClienteFormComponent,
  ],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss',
})
export class Clientes {
  private dialog = inject(MatDialog);
  private clientesService = inject(ClientesService);

  clientes$ = this.clientesService.clientes$;

  displayedColumns: string[] = [
    'id',
    'nombre',
    'dpi',
    'telefonos',
    'direcciones',
    'creadoEn',
    'acciones',
  ];

  nuevoCliente() {
    const ref = this.dialog.open(ClienteFormComponent, {
      disableClose: true,
      width: 'min(560px, 92vw)',
      maxWidth: '92vw',
    });

    ref.afterClosed().subscribe((data) => {
      if (!data) return;

      this.clientesService.crear({
        nombres: data.nombres ?? '',
        apellidos: data.apellidos ?? '',
        dpi: data.dpi ?? '',
        telefonos: (data.telefonos ?? []).filter(Boolean),
        direcciones: (data.direcciones ?? []).filter(Boolean),
      });
    });
  }

  eliminar(id: number) {
    this.clientesService.eliminar(id);
  }

  nombreCompleto(c: Cliente) {
    return `${c.nombres} ${c.apellidos}`.trim();
  }
}
