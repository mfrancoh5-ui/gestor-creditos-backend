import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

import {
  ClientesService,
  CrearClienteDto,
  ActualizarClienteDto,
} from '../../core/services/clientes.service';

import { Cliente } from '../../core/models';
import { ClienteFormComponent } from './cliente-form/cliente-form';

type ClienteLike = Cliente & {
  // por si su model aún trae legado:
  nombre?: string;
  email?: string;
};

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    ClienteFormComponent,
  ],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss',
})
export class Clientes implements OnInit {
  displayedColumns: string[] = ['id', 'nombre', 'dni', 'telefono', 'activo', 'acciones'];

  dataSource = new MatTableDataSource<ClienteLike>([]);
  loading = false;

  totalRegistros = 0;
  pageSize = 10;
  currentPage = 1;

  searchForm!: FormGroup;

  // cache local para búsqueda sin endpoint
  private allClientes: ClienteLike[] = [];

  constructor(
    private clientesService: ClientesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.initSearchForm();
  }

  ngOnInit(): void {
    this.cargarClientes(1);
  }

  private initSearchForm(): void {
    this.searchForm = this.fb.group({
      busqueda: [''],
    });
  }

  getNombreCompleto(c: ClienteLike): string {
    // Nuevo modelo
    const nombres = (c as any)?.nombres?.toString().trim() ?? '';
    const apellidos = (c as any)?.apellidos?.toString().trim() ?? '';

    if (nombres || apellidos) return `${nombres} ${apellidos}`.trim();

    // Legacy fallback
    if ((c as any)?.nombre) return String((c as any).nombre).trim();

    return '-';
  }

  cargarClientes(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;

    this.clientesService.listarClientes(page, this.pageSize).subscribe({
      next: (res) => {
        // ✅ Su backend devuelve ClientesPaginados directamente
        // { data: Cliente[], total, page, pageSize, totalPages }
        const data = (res as any)?.data ?? [];
        const total = (res as any)?.total ?? 0;
        const pageSize = (res as any)?.pageSize ?? this.pageSize;

        this.allClientes = Array.isArray(data) ? data : [];
        this.dataSource.data = this.allClientes;

        this.totalRegistros = Number(total) || 0;
        this.pageSize = Number(pageSize) || this.pageSize;

        this.loading = false;
      },
      error: (_error: unknown) => {
        this.loading = false;
        this.snackBar.open('Error al cargar los clientes', 'Cerrar', {
          duration: 5000,
        });
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.cargarClientes(event.pageIndex + 1);
  }

  abrirFormulario(cliente?: ClienteLike): void {
    const ref = this.dialog.open(ClienteFormComponent, {
      width: '520px',
      data: cliente,
    });

    ref.afterClosed().subscribe((result: CrearClienteDto | null | undefined) => {
      if (!result) return;

      if (cliente?.id) {
        this.actualizarCliente(cliente.id, result);
      } else {
        this.crearCliente(result);
      }
    });
  }

  crearCliente(dto: CrearClienteDto): void {
    this.loading = true;

    this.clientesService.crearCliente(dto).subscribe({
      next: (_created) => {
        this.loading = false;
        this.snackBar.open('Cliente creado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.cargarClientes(1);
      },
      error: (err: any) => {
        this.loading = false;
        const msg =
          err?.error?.message ??
          'Error al crear el cliente. Revise los datos e intente nuevamente.';
        this.snackBar.open(msg, 'Cerrar', { duration: 6000 });
      },
    });
  }

  actualizarCliente(id: number, dto: ActualizarClienteDto): void {
    this.loading = true;

    this.clientesService.actualizarCliente(id, dto).subscribe({
      next: (_updated) => {
        this.loading = false;
        this.snackBar.open('Cliente actualizado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.cargarClientes(this.currentPage);
      },
      error: (err: any) => {
        this.loading = false;
        const msg =
          err?.error?.message ??
          'Error al actualizar el cliente. Revise los datos e intente nuevamente.';
        this.snackBar.open(msg, 'Cerrar', { duration: 6000 });
      },
    });
  }

  eliminarCliente(id: number, nombre: string): void {
    if (!confirm(`¿Está seguro de que desea eliminar a ${nombre}?`)) return;

    this.loading = true;

    this.clientesService.eliminarCliente(id).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Cliente eliminado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.cargarClientes(1);
      },
      error: (err: any) => {
        this.loading = false;
        const msg =
          err?.error?.message ??
          'Error al eliminar el cliente. Verifique si tiene créditos activos.';
        this.snackBar.open(msg, 'Cerrar', { duration: 6000 });
      },
    });
  }

  buscar(): void {
    const terminoRaw = this.searchForm.get('busqueda')?.value ?? '';
    const termino = String(terminoRaw).trim().toLowerCase();

    if (!termino) {
      this.dataSource.data = this.allClientes;
      this.totalRegistros = this.allClientes.length;
      return;
    }

    // ✅ Búsqueda local (porque no existe /clientes/buscar en su controller)
    const filtered = this.allClientes.filter((c) => {
      const nombre = this.getNombreCompleto(c).toLowerCase();
      const dni = (c.dni ?? '').toString().toLowerCase();
      const tel = (c.telefono ?? '').toString().toLowerCase();
      return nombre.includes(termino) || dni.includes(termino) || tel.includes(termino);
    });

    this.dataSource.data = filtered;
    this.totalRegistros = filtered.length;
  }

  limpiarBusqueda(): void {
    this.searchForm.reset();
    this.dataSource.data = this.allClientes;
    this.totalRegistros = this.allClientes.length;
  }
}
