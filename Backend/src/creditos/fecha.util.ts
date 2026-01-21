export function fechaLocalFija(fechaIso: string, hora = 8): Date {
  const d = new Date(fechaIso);
  if (Number.isNaN(d.getTime())) throw new Error('fechaInicio inválida');

  // fijamos hora local para evitar brincos por UTC
  d.setHours(hora, 0, 0, 0);
  return d;
}
