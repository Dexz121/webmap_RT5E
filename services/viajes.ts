// services/viajes.ts
// reglas de negocio de viajes
import {
  getDocs,
  query,
  where,
  runTransaction,
} from 'firebase/firestore';
import {
  DB,
  ts,
  userRef,
  viajeRef,
  usersCol,
  viajesCol,
  vehiculosCol,
} from './firestore';

// ===================== Tipos mínimos =====================
export type Viaje = {
  id: string;
  estado?: string;
  uid_pasajero?: string;
  uid_conductor?: string | null;
  distancia_km?: number;
  tarifa?: number;
  origen?: { tarifa?: number };
};

export type Conductor = {
  id: string;
  role?: 'conductor' | 'pasajero' | string;
  estado?: 'disponible' | 'ocupado' | string;
  viaje_activo_id?: string | null;
  id_vehiculo?: string | null;
  movil_asignado?: number | null;
  movil?: number | null;
};

export type Vehiculo = {
  id: string;
  movil?: string | number | null;
  estado?: string | null;
  numero_economico?: string | number | null;
  placas?: string | null;
  marca?: string | null;
};

// ===================== Escrituras críticas =====================
// Asignar conductor a viaje (atómico con transacción)
export async function assignDriverToViaje(params: { viajeId: string; driverId: string }) {
  const { viajeId, driverId } = params;

  await runTransaction(DB, async (tx) => {
    const vRef = viajeRef(viajeId);
    const dRef = userRef(driverId);

    const vSnap = await tx.get(vRef);
    if (!vSnap.exists()) throw new Error('El viaje no existe');

    const dSnap = await tx.get(dRef);
    if (!dSnap.exists()) throw new Error('El conductor no existe');

    const viaje = vSnap.data() as Viaje;
    const driver = dSnap.data() as Conductor;

    // Validaciones coherentes con tus reglas
    if (viaje.estado !== 'solicitado') {
      throw new Error('El viaje ya no está disponible para asignar');
    }
    if (viaje.uid_conductor != null) {
      throw new Error('El viaje ya tiene conductor asignado');
    }
    if (driver.role !== 'conductor') {
      throw new Error('El usuario elegido no es conductor');
    }
    // Si tu modelo usa estado del conductor
    if (driver.estado && driver.estado !== 'disponible') {
      throw new Error('El conductor no está disponible');
    }
    if (driver.viaje_activo_id != null && String(driver.viaje_activo_id).trim() !== '') {
      throw new Error('El conductor ya tiene viaje activo');
    }

    const uidPasajero = (vSnap.data() as any)?.uid_pasajero as string | undefined;
    const pRef = uidPasajero ? userRef(uidPasajero) : null;
    let pSnap: any = null;
    if (pRef) {
      pSnap = await tx.get(pRef);
      if (!pSnap.exists()) throw new Error('El pasajero no existe');
    }

    // Escrituras atómicas
    tx.update(vRef, {
      uid_conductor: driverId,
      estado: 'asignado',   // transición solicitada -> asignado
      asignado_en: ts(),    // auditoría
    });

    const driverUpdate: any = {
      viaje_activo_id: viajeId,
      estado: 'ocupado',
      ocupado_desde: ts(),
    };
    tx.update(dRef, driverUpdate);

    // Pasajero toma viaje activo
    if (pRef) {
      tx.update(pRef, { viaje_activo_id: viajeId });
    }
  });
}

// ===================== Lecturas =====================
export async function listViajesSolicitados(): Promise<Viaje[]> {
  const qv = query(viajesCol(), where('estado', '==', 'solicitado'));
  const snap = await getDocs(qv);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

// ✅ Versión robusta: NO usa where == null (permite campo ausente o '')
export async function listConductoresDisponibles(): Promise<Conductor[]> {
  // 1) Solo role=conductor (el resto se filtra en cliente)
  const qc = query(usersCol(), where('role', '==', 'conductor'));
  const snap = await getDocs(qc);

  // 2) Filtrado en cliente igual que tu pantalla
  const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Conductor[];
  const disponibles = all.filter(
    (c) => !c.viaje_activo_id || String(c.viaje_activo_id).trim() === ''
  );

  // (Opcional) Si también usas estado del conductor:
  // return disponibles.filter((c) => !c.estado || c.estado === 'disponible');

  // console.log('[listConductoresDisponibles] total', all.length, 'disponibles', disponibles.length);
  return disponibles;
}

export async function getVehiculosMap(): Promise<Record<string, Vehiculo>> {
  const vs = await getDocs(vehiculosCol());
  const map: Record<string, Vehiculo> = {};
  vs.docs.forEach((d) => (map[d.id] = { id: d.id, ...(d.data() as any) }));
  return map;
}
