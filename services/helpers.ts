// services/helpers.ts
import { Conductor, Vehiculo } from './viajes';

export function resolveMovil(conductor: Conductor, vehiculos: Record<string, Vehiculo>): string {
  const veh = conductor.id_vehiculo ? vehiculos[conductor.id_vehiculo] : undefined;
  const mVeh = veh?.movil ?? null;
  const mUser = Number.isFinite(conductor.movil_asignado as any)
    ? (conductor.movil_asignado as number)
    : (conductor.movil ?? null);
  const movilText = String(mVeh ?? mUser ?? '').trim();
  return movilText.length ? `Móvil ${movilText}` : 'Móvil s/datos';
}

export function movilSortKey(label: string): number {
  const n = parseInt(label.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}
