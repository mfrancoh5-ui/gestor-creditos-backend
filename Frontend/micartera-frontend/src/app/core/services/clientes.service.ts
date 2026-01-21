import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Cliente = {
  id: number;
  nombres: string;
  apellidos: string;
  dpi: string;
  telefonos: string[];
  direcciones: string[];
  creadoEn: Date;
};

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly _clientes$ = new BehaviorSubject<Cliente[]>([
    {
      id: 1,
      nombres: 'Juan',
      apellidos: 'Pérez',
      dpi: '1234567890101',
      telefonos: ['+502 5555-1111'],
      direcciones: ['Zacapa, Guatemala'],
      creadoEn: new Date(),
    },
  ]);

  clientes$ = this._clientes$.asObservable();

  get snapshot(): Cliente[] {
    return this._clientes$.value;
  }

  crear(cliente: Omit<Cliente, 'id' | 'creadoEn'>) {
    const nextId = (this.snapshot.at(-1)?.id ?? 0) + 1;
    const nuevo: Cliente = { id: nextId, creadoEn: new Date(), ...cliente };
    this._clientes$.next([...this.snapshot, nuevo]);
  }

  eliminar(id: number) {
    this._clientes$.next(this.snapshot.filter(c => c.id !== id));
  }
}
