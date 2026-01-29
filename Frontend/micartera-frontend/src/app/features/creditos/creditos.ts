import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';

import { CreditosService } from './services/creditos.service';
import { ClientesService } from '../clientes/services/clientes.service';

import { Credito } from './models/credito.model';
import { Cliente } from '../clientes/models/cliente.model';

type CrearPlanAPayload = {
  clienteId: number;
  montoPrestado: number;
  cuotaFija: number;
  numeroCuotas: number;
  frecuencia: 'DAILY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY';
  fechaInicio: string;
};

@Component({
  selector: 'app-creditos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    MatSelectModule,
    MatTooltipModule,
    MatAutocompleteModule,
  ],
  templateUrl: './creditos.html',
  styleUrls: ['./creditos.scss'],
})
export class CreditosComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'clienteId',
    'montoPrestado',
    'cuotaBase',
    'numeroCuotas',
    'frecuencia',
    'fechaInicio',
    'estado',
    'acciones',
  ];

  dataSource = new MatTableDataSource<Credito>([]);
  clientes: Cliente[] = [];

  // Autocomplete: SIEMPRE string
  clienteSearchCtrl = new FormControl<string>('', { nonNullable: true });
  filteredClientes: Cliente[] = [];

  loading = false;
  totalRegistros = 0;
  pageSize = 10;
  currentPage = 1;

  searchForm!: FormGroup;
  creditoForm!: FormGroup;
  showForm = false;
  submitted = false;

  constructor(
    private creditosService: CreditosService,
    private clientesService: ClientesService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.cargarCreditos(1);
    this.cargarClientes();

    // ✅ filtro reactivo estable
    this.clienteSearchCtrl.valueChanges
      .pipe(
        startWith(this.clienteSearchCtrl.value),
        debounceTime(120),
        distinctUntilChanged()
      )
      .subscribe((q) => {
        this.filteredClientes = this.filtrarClientes(q);

        // si limpian el input, invalida clienteId
        const s = String(q ?? '').trim();
        if (!s) {
          this.creditoForm.patchValue({ clienteId: null }, { emitEvent: false });
        }
      });
  }

  private initForms(): void {
    this.searchForm = this.fb.group({
      busqueda: [''],
    });

    this.creditoForm = this.fb.group({
      clienteId: [null, Validators.required],
      montoPrestado: [null, [Validators.required, Validators.min(100)]],
      cuotaFija: [null, [Validators.required, Validators.min(1)]],
      numeroCuotas: [null, [Validators.required, Validators.min(1)]],
      frecuencia: ['DAILY', Validators.required],
      fechaInicio: [this.todayISODate(), Validators.required],
    });
  }

  // ===============================
  // Créditos
  // ===============================
  cargarCreditos(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;

    this.creditosService.listar(page, this.pageSize).subscribe({
      next: (resp) => {
        this.dataSource.data = resp?.data ?? [];
        this.totalRegistros = resp?.total ?? 0;

        this.loading = false;
        // ✅ evita ExpressionChanged en dev
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargarCreditos:', err);
        this.dataSource.data = [];
        this.totalRegistros = 0;

        this.loading = false;
        this.cdr.detectChanges();

        if (err?.status === 401) {
          this.snackBar.open('Sesión expirada / sin token (401). Inicie sesión.', 'Cerrar', {
            duration: 5000,
          });
          return;
        }

        this.snackBar.open('Error al cargar créditos', 'Cerrar', { duration: 4000 });
      },
    });
  }

  // ===============================
  // Clientes
  // ===============================
  cargarClientes(): void {
    this.clientesService.listar(1, 500).subscribe({
      next: (resp) => {
        this.clientes = resp?.data ?? [];
        this.filteredClientes = this.filtrarClientes(this.clienteSearchCtrl.value);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargarClientes:', err);

        if (err?.status === 401) {
          this.snackBar.open('No autorizado (401). Falta token para /clientes.', 'Cerrar', {
            duration: 5000,
          });
          return;
        }

        this.snackBar.open('Error al cargar clientes', 'Cerrar', { duration: 4000 });
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.cargarCreditos(event.pageIndex + 1);
  }

  obtenerNombreCliente(clienteId: number): string {
    const c = this.clientes.find((x) => Number(x.id) === Number(clienteId));
    if (!c) return `Cliente ${clienteId}`;
    const full = `${c.nombres ?? ''} ${c.apellidos ?? ''}`.trim();
    return full.length ? full : `Cliente ${clienteId}`;
  }

  // ===============================
  // Autocomplete (alineado al HTML corregido)
  // ===============================
  onClienteSeleccionadoId(clienteId: number): void {
    const cliente =
      this.clientes.find((c) => Number(c.id) === Number(clienteId)) ?? null;

    if (!cliente) {
      this.creditoForm.patchValue({ clienteId: null }, { emitEvent: false });
      return;
    }

    this.creditoForm.patchValue({ clienteId: Number(cliente.id) }, { emitEvent: false });
    this.clienteSearchCtrl.setValue(this.displayCliente(cliente), { emitEvent: false });
    this.filteredClientes = this.filtrarClientes(this.clienteSearchCtrl.value);
  }

  displayCliente = (c: Cliente | null): string => {
    if (!c) return '';
    return `${c.nombres ?? ''} ${c.apellidos ?? ''}`.trim();
  };

  limpiarCliente(): void {
    this.clienteSearchCtrl.setValue('', { emitEvent: true });
    this.creditoForm.patchValue({ clienteId: null }, { emitEvent: false });
  }

  onClienteBlur(): void {
    const q = String(this.clienteSearchCtrl.value ?? '').trim().toLowerCase();
    if (!q) {
      this.creditoForm.patchValue({ clienteId: null }, { emitEvent: false });
      return;
    }

    const exact = this.clientes.find((c) => {
      const nombre = `${c.nombres ?? ''} ${c.apellidos ?? ''}`.trim().toLowerCase();
      const dpi = String(c.dpi ?? '').trim().toLowerCase();
      return nombre === q || dpi === q;
    });

    if (exact) {
      this.creditoForm.patchValue({ clienteId: Number(exact.id) }, { emitEvent: false });
      this.clienteSearchCtrl.setValue(this.displayCliente(exact), { emitEvent: false });
    } else {
      this.creditoForm.patchValue({ clienteId: null }, { emitEvent: false });
    }
  }

  private filtrarClientes(q: unknown): Cliente[] {
    const query = String(q ?? '').trim().toLowerCase();
    if (!query) return this.clientes.slice(0, 30);

    return this.clientes
      .filter((c) => {
        const nombre = `${c.nombres ?? ''} ${c.apellidos ?? ''}`.trim().toLowerCase();
        const dpi = String(c.dpi ?? '').trim().toLowerCase();
        return nombre.includes(query) || dpi.includes(query);
      })
      .slice(0, 30);
  }

  // ===============================
  // Formulario
  // ===============================
  abrirFormulario(): void {
    this.showForm = true;
    this.submitted = false;

    this.creditoForm.reset({
      frecuencia: 'DAILY',
      fechaInicio: this.todayISODate(),
    });

    this.limpiarCliente();
    this.cdr.detectChanges();
  }

  cancelarFormulario(): void {
    this.showForm = false;
    this.submitted = false;
    this.creditoForm.reset({ frecuencia: 'DAILY', fechaInicio: this.todayISODate() });
    this.limpiarCliente();
    this.cdr.detectChanges();
  }

  crearCredito(): void {
    this.submitted = true;

    if (this.creditoForm.invalid) {
      this.creditoForm.markAllAsTouched();
      return;
    }

    const raw = this.creditoForm.value;

    const payload: CrearPlanAPayload = {
      clienteId: Number(raw.clienteId),
      montoPrestado: Number(raw.montoPrestado),
      cuotaFija: Number(raw.cuotaFija),
      numeroCuotas: Number(raw.numeroCuotas),
      frecuencia: raw.frecuencia,
      fechaInicio: this.normalizeToISODate(raw.fechaInicio),
    };

    this.loading = true;

    this.creditosService.crearPlanA(payload).subscribe({
      next: () => {
        this.loading = false;
        this.showForm = false;
        this.submitted = false;

        this.snackBar.open('Crédito creado exitosamente', 'Cerrar', { duration: 3000 });

        this.creditoForm.reset({ frecuencia: 'DAILY', fechaInicio: this.todayISODate() });
        this.limpiarCliente();
        this.cargarCreditos(1);
      },
      error: (err) => {
        console.error('Error crearCredito:', err);
        this.loading = false;
        this.cdr.detectChanges();

        if (err?.status === 401) {
          this.snackBar.open('No autorizado (401). Revise token/rol.', 'Cerrar', {
            duration: 5000,
          });
          return;
        }

        this.snackBar.open('Error al crear el crédito', 'Cerrar', { duration: 5000 });
      },
    });
  }

  verDetalles(credito: Credito): void {
    console.log('Detalle crédito:', credito);
  }

  // ===============================
  // Helpers
  // ===============================
  private todayISODate(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private normalizeToISODate(value: any): string {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return this.todayISODate();

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
