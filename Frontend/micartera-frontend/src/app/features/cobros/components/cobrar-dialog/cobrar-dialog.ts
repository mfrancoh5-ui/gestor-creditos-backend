import { Component, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { CobrosService } from '../../services/cobros.service'
import { CuotaOperativa } from '../../models/cuota-operativa.model'
import { CobroPayload } from '../../models/cobro-payload.model'

type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA'

@Component({
  selector: 'app-cobrar-dialog',
  templateUrl: './cobrar-dialog.html',
  styleUrls: ['./cobrar-dialog.scss'],
})
export class CobrarDialogComponent {
  monto: number

  metodo: MetodoPago = 'EFECTIVO'
  referencia = ''
  observacion = ''

  montoError: string | null = null
  private marcarMora = false

  constructor(
    @Inject(MAT_DIALOG_DATA) public cuota: CuotaOperativa,
    private dialogRef: MatDialogRef<CobrarDialogComponent>,
    private cobrosService: CobrosService
  ) {
    this.monto = Number(cuota?.saldoCuota ?? 0)
    this.validarMonto()
  }

  // =========================
  // Quick Actions (UX)
  // =========================
  setPagoCompleto(): void {
    this.marcarMora = false
    this.monto = Number(this.cuota?.saldoCuota ?? 0)
    this.validarMonto()
  }

  setPagoParcial(): void {
    this.marcarMora = false
    const saldo = Number(this.cuota?.saldoCuota ?? 0)
    const parcial = Math.max(0, Math.round(saldo * 0.5 * 100) / 100)
    this.monto = parcial
    this.validarMonto()
  }

  setNoPagoMora(): void {
    this.marcarMora = true
    this.monto = 0
    this.validarMonto()
  }

  // =========================
  // Validaciones
  // =========================
  validarMonto(): void {
    const saldo = Number(this.cuota?.saldoCuota ?? 0)
    const monto = Number(this.monto ?? 0)

    // ✅ EstadoCuota: 'PENDING' | 'PAID' | 'LATE'
    if (this.cuota?.estado === 'PAID') {
      this.montoError = 'Esta cuota ya está pagada.'
      return
    }

    if (this.marcarMora) {
      this.montoError = null
      return
    }

    if (!Number.isFinite(monto)) {
      this.montoError = 'Monto inválido.'
      return
    }

    if (monto <= 0) {
      this.montoError = 'El monto debe ser mayor a 0.'
      return
    }

    if (monto > saldo) {
      this.montoError = `El monto no puede ser mayor al saldo pendiente (Q${saldo}).`
      return
    }

    this.montoError = null
  }

  onMontoChange(): void {
    this.marcarMora = false
    this.validarMonto()
  }

  // =========================
  // Confirmar / Cancelar
  // =========================
  confirmar(): void {
    this.validarMonto()
    if (this.montoError) return

    if (this.marcarMora) {
      this.dialogRef.close({
        ok: true,
        accion: 'MARCAR_MORA',
        cuotaId: this.cuota.cuotaId,
      })
      return
    }

    // ✅ backend solo entiende: cuotaId, monto, fechaPago, nota?
    const notaParts: string[] = []
    notaParts.push(`Método: ${this.metodo}`)
    if (this.metodo !== 'EFECTIVO' && this.referencia.trim()) {
      notaParts.push(`Ref: ${this.referencia.trim()}`)
    }
    if (this.observacion.trim()) {
      notaParts.push(`Obs: ${this.observacion.trim()}`)
    }

    const payload: CobroPayload = {
      cuotaId: this.cuota.cuotaId,
      monto: Number(this.monto),
      fechaPago: new Date().toISOString().split('T')[0],
      nota: notaParts.join(' | ') || 'Cobro desde módulo Cobros',
    }

    this.cobrosService.registrarCobro(payload).subscribe({
      next: (res) => {
        this.dialogRef.close({
          ok: true,
          accion: 'PAGO_REGISTRADO',
          cuotaId: this.cuota.cuotaId,
          monto: payload.monto,
          response: res,
        })
      },
      error: (err) => {
        this.montoError =
          err?.error?.message ||
          err?.message ||
          'No se pudo registrar el cobro. Verifique conexión/servidor.'
      },
    })
  }

  cancelar(): void {
    this.dialogRef.close({ ok: false })
  }
}
