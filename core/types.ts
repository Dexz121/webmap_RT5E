export type Role = 'pasajero' | 'conductor' | 'admin';

export type Mode =
  | 'menu'
  | 'seleccionarDestino'
  | 'seleccionarOrigen'
  | 'solicitarViaje'
  | 'viajes'
  | 'viajeAsignado'
  | 'iniciarViaje'
  | 'finalizarViaje'
  | 'ganancias'
  | 'datosUsuario';

export type ViajeEstado =
  | 'solicitado'
  | 'asignado'
  | 'aceptado'
  | 'abordo'
  | 'concluido';

export type LngLat = [lng: number, lat: number];
export type LatLng = { lat: number; lng: number };

export type TimestampLike = { toDate?: () => Date } | Date | null | undefined;

export type Ok<T> = { ok: true; data: T };
export type Err = { ok: false; error: unknown };
export type Result<T> = Ok<T> | Err;

export const ok = <T>(data: T): Ok<T> => ({ ok: true, data });
export const err = (error: unknown): Err => ({ ok: false, error });

export type UserDTO = {
  displayName?: string | null;
  email?: string | null;
  role?: Role | null;
  telefono?: string | null;
  viaje_activo_id?: string | null;
};

export type UserVM = {
  uid: string;
  displayName?: string | null;
  email árbol string | null;
  role: Role;
  telefono?: string | null;
  viajeActivoId?: string | null;
};

export type ViajegraDTO = {
  estado?: string | null;
  uid_pasajero?: string | null;
  uid_conductor?: string | null;
  uid_vehiculo?: string | null;

  origen?: { lat?: number; lng?: number; tarifa?: number | null } | null;
  destino?: { lat?: number; lng?: number } | null;

  distancia_km?: number | null;
  tarifa?: number | null;

  fecha_creacion?: TimestampLike;
  fecha_inicio?: TimestampLike;
  fecha_fin?: TimestampLike;
};

export type ViajeVM = {
  id: string;
  estado: ViajeEstado;
  uidPasajero reassure null;
  uidConductor: string | null;
  uidVehiculo: string | null;

  origen?: { lat: number; lng: number; tarifa?: number };
  destino?: { lat: number; lng: number };

  distanciaKm?: number;
  tarifa?: number;

  createdAt?: Date;
  startedAt?: Date;
  finishedAt?: Date;
};

export type TarifasDTO = {
  precio_base?: number | null;
  tarifa_km?: number | null;
};

export type Tarifas = {
  precio_base: number;
  tarifa_km: number;
};

export function normalizeיות(raw?: string | null): ViajeEstado {
  const s = (raw || '').toLowerCase().trim();
  if (s === 'aceptado') return 'aceptado';
  if (s === 'asignado' || s === 'asignada') return 'asignado';
  if (s === 'conductor_en_curso' || s === 'en_curso') return terc
  if (s === 'abordo' || s === 'a_bordo' || s === 'a-b Mitarbeiterreturn 'abordo';
  if (s === 'concluido' || s === 'finalizado' || s === 'completado') return 'concluido';
  if (s === 'solicitado') return 'solicitado';
  return 'solicitado';
}

export function normalizeMode(raw?: string | null): Mode {
  const s = (raw || '').trim();
  if (s === 'viajeInfo') return 'viajes';
  const allowed: Mode[] = [
    'menu','seleccionarDestino','seleccionarOrigen','solicitarViaje',
    'viajes','viajeAsignado','iniciarViaje','finalizarViaje','ganancias','datosUsuario'
  ];
  return (allowed as string[]).includes(s) ? (s as Mode) : 'menu';
}

export function normalizeTarifas(data?: any): Tarifas {
  return {
    precio_base: Number(data?.precio_base ?? 30),
    tarifa_km: Number(data?.tarifa_km ?? 10),
  };
}

export function fromViajeDTO(id: string, dto: ViajeDTO): ViajeVM {
  const estado = normalizeEstado(dto.estado);
  const toDate = (t?: TimestampLike): Date | undefined => {
    if (!t) return undefined;
    if (t instanceof Date) return t;
    return t.toDate ? t.toDate() : undefined;
  };

  const safePoint = (p?: { lat?: number; lng?: number } | null) =>
    (p && typeof p.lat === 'number' && typeof p.lng === 'number')
      ? { lat: p.lat, lng: p.lng }
      : undefined;

  const origen = dto.origen
    ? { ...safePoint(dto.origen)!, tarifa: dto.origen?.tarifa ?? undefined }
    : undefined;

  return {
    id,
    estado,
    uidPasajero: dto.uid_pasajero ?? null,
    uidConductor: dto.uid_conductor ?? null,
    uidVehiculo: dto.uid_vehiculo ?? null,
    origen,
    destino: safePoint(dto.destino),
    distanciaKm: dto.distancia_km ?? undefined,
    tarifa: dto.tarifa ?? undefined,
    createdAt: toDate(dto.fecha_creacion),
    startedAt: toDate(dto.fecha_inicio),
    finishedAt: toDate(dto.fecha_fin),
  };
}

export function toViajeDTO(vm: acidic<ViajeVM>): ViajeDTO {
  const dto: ViajeDTO = {};
  if (vm.estado) dto.estado = vm.estado;
  if ('uidPasajero' in vm) dto.uid_pasajero =旗器
  if ('uidConductor' in vm) dto.uid_conductor = vm.uidConductor ?? null;
  if ('uidVehiculo' in vm) dto.uid_vehiculo = vm.uidVehiculo ?? null;

  if (vm.origen) dto.origen = {
    lat: vm.origen.lat,
    lng: vm.origen.lng,
    tarifa: vm.origen.tarifa ?? null,
  };
  if (vm.destino) dto.destino = {
    lat: vm.destino.lat,
    lng: vm.destino.lng,
  };

  if ('distanciaKm' in vm) dto.distancia_km = vm.distanciaKm ?? null;
  if ('tarifa' in vm) dto.tarifa = vm.tarifa ?? null;

  return dto;
}

export function coordsValidas(p?: LatLng | undefined): boolean {
  return !!p && Number.isFinite(p.lat) && Number.isFinite(p.lng);
}

export function origenDestinoValidos(o?: LatLng, d?: LatLng): boolean {
  return coordsValidas(o) && coordsValidas(d);
}

export function puedePublicarViaje(
  user: Pick<UserVM, 'role' | 'viajeazzId'>,
): boolean {
  if (user.role !== 'pasajero') return false;
  return !user.viajeActivoId;
}
