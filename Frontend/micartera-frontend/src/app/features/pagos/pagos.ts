import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
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
import { MatChipsModule } from '@angular/material/chips';

import { CreditosService } from '../creditos/services/creditos.service';
import { ClientesService } from '../clientes/services/clientes.service';
import { PagosService, CrearPagoPayload } from './pagos.service';

import { CobrosService } from '../cobros/services/cobros.service';
import { CuotaOperativa } from '../cobros/models/cuota-operativa.model';

// Ajuste estos tipos a sus modelos reales si ya los tiene:
type Cliente = {
  id: number;
  nombres?: string;
  apellidos?: string;
  dpi?: string;
};

type Credito = {
  id: number;
  clienteId: number;
  montoPrestado?: number;
  saldo?: number;
  estado?: string;
  fechaInicio?: string;
  folio?: string;
};

type PagoApi = {
  id: number;
  cuotaId: number;
  monto: number;
  nota?: string | null;
  fechaPago?: string;
  fecha?: string;
};

type PagoRow = {
  id: number;
  creditoId: number;
  cuotaId: number;
  monto: number;
  fecha: string;
  metodo?: string;
  referencia?: string;
  observacion?: string;
};

@Component({
  selector: 'app-pagos',
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
    MatChipsModule,
  ],
  templateUrl: './pagos.html',
  styleUrls: ['./pagos.scss'],
})
export class PagosComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'credito',
    'cliente',
    'monto',
    'fecha',
    'metodo',
    'referencia',
    'acciones',
  ];

  dataSource = new MatTableDataSource<PagoRow>([]);
  loading = false;

  totalRegistros = 0;
  pageSize = 10;
  currentPage = 1;

  showForm = false;

  searchForm!: FormGroup;
  pagoForm!: FormGroup;

  clientes: Cliente[] = [];
  creditos: Credito[] = [];

  creditoSeleccionado: Credito | null = null;

  // ✅ cuota a cobrar (puede ser PENDING/PARTIAL/LATE)
  cuotaSeleccionada: CuotaOperativa | null = null;

  loadingCuota = false;

  constructor(
    private pagosService: PagosService,
    private creditosService: CreditosService,
    private clientesService: ClientesService,
    private cobrosService: CobrosService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarCreditos();
  }

  private initForms(): void {
    this.searchForm = this.fb.group({
      busqueda: [''],
      estado: ['TODOS'],
    });

    this.pagoForm = this.fb.group({
      creditoId: [null, Validators.required],

      // ✅ monto SIEMPRE bloqueado (autocompletado)
      monto: [{ value: null, disabled: true }, [Validators.required, Validators.min(1)]],

      fecha: [this.todayISODate(), Validators.required],

      metodo: ['EFECTIVO'],
      referencia: [''],
      observacion: [''],
    });

    // ✅ cuando cambia crédito: cargar pagos y resolver cuota
    this.pagoForm.get('creditoId')?.valueChanges.subscribe((id) => {
      const creditoId = Number(id || 0);

      this.creditoSeleccionado =
        this.creditos.find((c) => c.id === creditoId) ?? null;

      this.cuotaSeleccionada = null;

      // reset monto (sin loops)
      this.pagoForm.patchValue({ monto: null }, { emitEvent: false });
      this.pagoForm.get('monto')?.disable({ emitEvent: false });

      if (!creditoId) {
        this.dataSource.data = [];
        this.totalRegistros = 0;
        return;
      }

      this.cargarPagosPorCredito(creditoId);
      this.cargarCuotaPendientePorCredito(creditoId);
    });
  }

  // ===============================
  // Normalizadores (CLAVE)
  // ===============================
  private getCuotaId(q: any): number {
    // soporta cuotaId o id (según su modelo real)
    return Number(q?.cuotaId ?? q?.id ?? 0);
  }

  private getSaldoCuota(q: any): number {
    // soporta saldoCuota o saldo (según su modelo real)
    const val = q?.saldoCuota ?? q?.saldo ?? q?.monto ?? q?.montoCuota ?? 0;
    return Number(val || 0);
  }

  // ===============================
  // Cargar data
  // ===============================
  private cargarPagosPorCredito(creditoId: number): void {
    this.loading = true;

    this.pagosService.listarPorCredito(creditoId).subscribe({
      next: (resp: any) => {
        const pagos: PagoApi[] = Array.isArray(resp) ? resp : (resp?.data ?? []);

        const rows: PagoRow[] = (pagos ?? []).map((p) => ({
          id: Number(p.id),
          creditoId,
          cuotaId: Number(p.cuotaId),
          monto: Number(p.monto),
          fecha: this.normalizeToISODate(p.fechaPago ?? p.fecha ?? this.todayISODate()),
        }));

        rows.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

        this.dataSource.data = rows;
        this.totalRegistros = rows.length;
        this.currentPage = 1;

        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargarPagosPorCredito:', err);
        this.loading = false;
        this.dataSource.data = [];
        this.totalRegistros = 0;

        this.snackBar.open(
          err?.error?.message || 'Error al cargar pagos del crédito',
          'Cerrar',
          { duration: 4500 }
        );
      },
    });
  }

  cargarClientes(): void {
    this.clientesService.listar(1, 500).subscribe({
      next: (resp: any) => (this.clientes = resp.data ?? []),
      error: (err: any) => {
        console.error('Error cargarClientes:', err);
        this.snackBar.open('Error al cargar clientes', 'Cerrar', { duration: 4000 });
      },
    });
  }

  cargarCreditos(): void {
    this.creditosService.listar(1, 500).subscribe({
      next: (resp: any) => (this.creditos = resp.data ?? []),
      error: (err: any) => {
        console.error('Error cargarCreditos:', err);
        this.snackBar.open('Error al cargar créditos', 'Cerrar', { duration: 4000 });
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
  }

  // ===============================
  // Búsqueda (UI)
  // ===============================
  buscar(): void {
    const q = (this.searchForm.value?.busqueda || '').trim().toLowerCase();
    if (!q) return;

    const filtered = this.dataSource.data.filter((p) => {
      const cliente = this.obtenerClientePago(p).toLowerCase();
      const credito = this.labelCreditoPago(p).toLowerCase();
      const ref = (p.referencia || '').toLowerCase();
      return cliente.includes(q) || credito.includes(q) || ref.includes(q);
    });

    this.dataSource.data = filtered;
    this.totalRegistros = filtered.length;
    this.currentPage = 1;
  }

  limpiar(): void {
    this.searchForm.reset({ busqueda: '', estado: 'TODOS' });

    const creditoId = Number(this.pagoForm.get('creditoId')?.value || 0);
    if (creditoId) this.cargarPagosPorCredito(creditoId);
  }

  // ===============================
  // Form
  // ===============================
  abrirFormulario(): void {
    this.showForm = true;
    this.creditoSeleccionado = null;
    this.cuotaSeleccionada = null;

    this.pagoForm.reset({
      creditoId: null,
      monto: null,
      fecha: this.todayISODate(),
      metodo: 'EFECTIVO',
      referencia: '',
      observacion: '',
    });

    this.pagoForm.get('monto')?.disable({ emitEvent: false });
  }

  cancelarFormulario(): void {
    this.showForm = false;
    this.creditoSeleccionado = null;
    this.cuotaSeleccionada = null;
  }

  /**
   * ✅ Próxima cuota cobrable (PENDING/PARTIAL/LATE) + autocompletar monto
   */
  private cargarCuotaPendientePorCredito(creditoId: number): void {
    this.loadingCuota = true;
    this.cuotaSeleccionada = null;

    // Bloqueo mientras carga
    this.pagoForm.patchValue({ monto: null }, { emitEvent: false });
    this.pagoForm.get('monto')?.disable({ emitEvent: false });

    this.cobrosService.listarCuotas({ page: 1, pageSize: 1000 } as any).subscribe({
      next: (resp: any) => {
        const cuotas: any[] = resp?.data ?? [];

        const candidatas = cuotas
          .filter((q) =>
            Number(q?.creditoId) === creditoId &&
            ['PENDING', 'PARTIAL', 'LATE'].includes(String(q?.estado || '').toUpperCase())
          )
          .sort((a, b) => {
            const fa = new Date(a?.fechaVenc).getTime();
            const fb = new Date(b?.fechaVenc).getTime();
            if (fa !== fb) return fa - fb;
            return Number(a?.numero ?? 0) - Number(b?.numero ?? 0);
          });

        const cuota = candidatas[0] ?? null;
        this.cuotaSeleccionada = cuota;

        if (!cuota) {
          this.loadingCuota = false;
          this.pagoForm.patchValue({ monto: null }, { emitEvent: false });
          this.pagoForm.get('monto')?.disable({ emitEvent: false });
          return;
        }

        const montoExacto = this.getSaldoCuota(cuota);

        if (!Number.isFinite(montoExacto) || montoExacto <= 0) {
          this.loadingCuota = false;
          this.cuotaSeleccionada = null;
          this.pagoForm.patchValue({ monto: null }, { emitEvent: false });
          this.pagoForm.get('monto')?.disable({ emitEvent: false });
          this.snackBar.open('No se pudo determinar el monto de la cuota (saldo inválido).', 'Cerrar', { duration: 4500 });
          return;
        }

        this.pagoForm.patchValue({ monto: montoExacto }, { emitEvent: false });
        this.pagoForm.get('monto')?.disable({ emitEvent: false });

        this.loadingCuota = false;
      },
      error: (err: any) => {
        console.error('Error cargarCuotaPendientePorCredito:', err);
        this.loadingCuota = false;
        this.cuotaSeleccionada = null;
        this.pagoForm.patchValue({ monto: null }, { emitEvent: false });
        this.pagoForm.get('monto')?.disable({ emitEvent: false });
        this.snackBar.open('No se pudo cargar la cuota pendiente', 'Cerrar', { duration: 4500 });
      },
    });
  }

  registrarPago(): void {
    if (this.pagoForm.invalid) {
      this.pagoForm.markAllAsTouched();
      return;
    }

    const raw = this.pagoForm.getRawValue();

    if (!this.cuotaSeleccionada) {
      this.snackBar.open('Seleccione un crédito con cuota pendiente', 'Cerrar', {
        duration: 4000,
      });
      return;
    }

    const cuotaIdReal = this.getCuotaId(this.cuotaSeleccionada);
    const montoExacto = this.getSaldoCuota(this.cuotaSeleccionada);
    const montoForm = Number(raw.monto ?? 0);

    if (!cuotaIdReal || cuotaIdReal <= 0) {
      this.snackBar.open('No se pudo determinar la cuota a cobrar (ID inválido).', 'Cerrar', { duration: 4500 });
      return;
    }

    // ✅ cuota completa sí o sí
    if (montoForm !== montoExacto) {
      this.snackBar.open(
        `Monto inválido. Debe ser exactamente Q${montoExacto}.`,
        'Cerrar',
        { duration: 4500 }
      );
      this.pagoForm.patchValue({ monto: montoExacto }, { emitEvent: false });
      this.pagoForm.get('monto')?.disable({ emitEvent: false });
      return;
    }

    const payload: CrearPagoPayload = {
      cuotaId: cuotaIdReal,
      monto: montoExacto,
      nota:
        (raw.observacion || '').trim() ||
        `Pago cuota #${(this.cuotaSeleccionada as any)?.numero ?? ''} desde Pagos`.trim(),
    };

    this.loading = true;

    this.pagosService.registrar(payload).subscribe({
      next: () => {
        this.loading = false;
        this.showForm = false;

        this.snackBar.open('Pago registrado exitosamente', 'Cerrar', {
          duration: 3000,
        });

        const creditoId = Number(raw.creditoId || 0);
        if (creditoId) {
          this.cargarPagosPorCredito(creditoId);
          this.cargarCuotaPendientePorCredito(creditoId);
        }

        this.cargarCreditos();
      },
      error: (err: any) => {
        console.error('Error registrarPago:', err);
        this.loading = false;

        this.snackBar.open(
          err?.error?.message || 'Error al registrar el pago.',
          'Cerrar',
          { duration: 5500 }
        );
      },
    });
  }

  // ===============================
  // Helpers UI
  // ===============================
  labelCredito(c: Credito): string {
    const cliente = this.obtenerNombreCliente(c.clienteId);
    const folio = c.folio ? ` • ${c.folio}` : '';
    return `#${c.id}${folio} — ${cliente}`;
  }

  obtenerNombreCliente(clienteId: number): string {
    const c = this.clientes.find((x) => x.id === clienteId);
    if (!c) return `Cliente ${clienteId}`;
    const full = `${c.nombres ?? ''} ${c.apellidos ?? ''}`.trim();
    return full.length ? full : `Cliente ${clienteId}`;
  }

  obtenerClientePago(p: PagoRow): string {
    const credito = this.creditos.find((c) => c.id === p.creditoId);
    if (credito) return this.obtenerNombreCliente(credito.clienteId);
    return '—';
  }

  labelCreditoPago(p: PagoRow): string {
    const credito = this.creditos.find((c) => c.id === p.creditoId);
    if (!credito) return `#${p.creditoId}`;
    return credito.folio ? `#${credito.id} (${credito.folio})` : `#${credito.id}`;
  }

  badgeMetodo(m?: string): { text: string; cls: string } {
    const val = (m || 'EFECTIVO').toUpperCase();
    if (val === 'EFECTIVO') return { text: 'Efectivo', cls: 'chip chip-ok' };
    if (val === 'TRANSFERENCIA') return { text: 'Transfer.', cls: 'chip chip-info' };
    if (val === 'DEPOSITO') return { text: 'Depósito', cls: 'chip chip-info' };
    if (val === 'TARJETA') return { text: 'Tarjeta', cls: 'chip chip-warn' };
    return { text: val, cls: 'chip chip-neutral' };
  }

  verDetalle(pago: PagoRow): void {
    console.log('Detalle pago:', pago);
  }

  // ===============================
  // Dates
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
