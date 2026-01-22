export function fechaLocalFija(fechaIso: string, hora = 8): Date {
  // Si recibimos solo fecha (YYYY-MM-DD), la interpretamos en zona local
  if (fechaIso.length === 10) {
    const [year, month, day] = fechaIso.split('-').map(Number);
    const d = new Date(year, month - 1, day, hora, 0, 0, 0);
    return d;
  }

  // Si es ISO completo, lo parseamos normalmente
  const d = new Date(fechaIso);
  if (Number.isNaN(d.getTime())) throw new Error('fechaInicio inválida');

  // fijamos hora local para evitar brincos por UTC
  d.setHours(hora, 0, 0, 0);
  return d;
}
