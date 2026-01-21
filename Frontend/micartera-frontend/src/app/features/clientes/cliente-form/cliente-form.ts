import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormBuilder, Validators } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgFor } from '@angular/common';


@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
  NgFor,
  ReactiveFormsModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatIconModule,
],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.scss',
})
export class ClienteFormComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ClienteFormComponent>);

  form = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    dpi: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
    telefonos: this.fb.array([this.fb.control('', Validators.required)]),
    direcciones: this.fb.array([this.fb.control('', Validators.required)]),
  });

  get telefonos() { return this.form.get('telefonos') as FormArray; }
  get direcciones() { return this.form.get('direcciones') as FormArray; }

  addTelefono() { this.telefonos.push(this.fb.control('', Validators.required)); }
  removeTelefono(i: number) { if (this.telefonos.length > 1) this.telefonos.removeAt(i); }

  addDireccion() { this.direcciones.push(this.fb.control('', Validators.required)); }
  removeDireccion(i: number) { if (this.direcciones.length > 1) this.direcciones.removeAt(i); }

  cerrar() { this.dialogRef.close(); }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value);
  }
}
