import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Cliente } from '../../../core/models';

export interface ClienteFormValue {
  nombres: string;
  apellidos: string;
  dni?: string;
  telefono?: string;
  direccion?: string;
}

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.scss',
})
export class ClienteFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ClienteFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Cliente | undefined
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.data) this.loadClienteData();
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombres: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(120)],
      ],
      apellidos: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(120)],
      ],
      // opcionales según backend
      dni: ['', [Validators.maxLength(30), Validators.pattern(/^\d{1,30}$/)]],
      telefono: ['', [Validators.maxLength(30)]],
      direccion: ['', [Validators.maxLength(255)]],
    });
  }

  private splitNombreCompleto(fullName: string): { nombres: string; apellidos: string } {
    const clean = (fullName || '').trim().replace(/\s+/g, ' ');
    if (!clean) return { nombres: '', apellidos: '' };

    const parts = clean.split(' ');
    if (parts.length === 1) return { nombres: parts[0], apellidos: '-' };

    // Heurística simple: primer token = nombres, resto = apellidos
    const nombres = parts[0];
    const apellidos = parts.slice(1).join(' ');
    return { nombres, apellidos };
  }

  private loadClienteData(): void {
    this.isEditMode = true;

    // Soporta ambos mundos:
    // - Nuevo modelo: data.nombres / data.apellidos
    // - Legacy: data.nombre (Nombre Completo)
    const anyData: any = this.data as any;

    const nombres =
      (anyData?.nombres ?? '').toString().trim();

    const apellidos =
      (anyData?.apellidos ?? '').toString().trim();

    let patch = {
      nombres,
      apellidos,
      dni: (anyData?.dni ?? '').toString(),
      telefono: (anyData?.telefono ?? '').toString(),
      direccion: (anyData?.direccion ?? '').toString(),
    };

    // Si viene legacy "nombre" y no trae nombres/apellidos separados
    if ((!patch.nombres || !patch.apellidos) && anyData?.nombre) {
      const split = this.splitNombreCompleto(anyData.nombre);
      patch = { ...patch, ...split };
    }

    this.form.patchValue(patch);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const raw = this.form.value as ClienteFormValue;

    // Limpieza defensiva: enviar opcionales solo si tienen valor
    const payload: ClienteFormValue = {
      nombres: (raw.nombres || '').trim(),
      apellidos: (raw.apellidos || '').trim(),
      ...(raw.dni?.trim() ? { dni: raw.dni.trim() } : {}),
      ...(raw.telefono?.trim() ? { telefono: raw.telefono.trim() } : {}),
      ...(raw.direccion?.trim() ? { direccion: raw.direccion.trim() } : {}),
    };

    this.dialogRef.close(payload);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get nombres() {
    return this.form.get('nombres');
  }
  get apellidos() {
    return this.form.get('apellidos');
  }
  get dni() {
    return this.form.get('dni');
  }
  get telefono() {
    return this.form.get('telefono');
  }
  get direccion() {
    return this.form.get('direccion');
  }
}
