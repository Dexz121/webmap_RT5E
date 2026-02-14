// services/firestore.ts
// helpers genéricos (getDocStrict, ts(), refs)
import {
  collection,
  doc,
  DocumentReference,
  Firestore,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';

export type Id = string;

export const DB: Firestore = db; // por si quieres inyectar en tests/emulador

// Aliases
export const ts = () => serverTimestamp();

// Refs tipados (usa "any" si no tienes interfaces aún)
export const usersCol = () => collection(DB, 'users');
export const viajesCol = () => collection(DB, 'viajes');
export const vehiculosCol = () => collection(DB, 'Vehiculo');

export const userRef = (userId: Id): DocumentReference => doc(DB, 'users', userId);
export const viajeRef = (viajeId: Id): DocumentReference => doc(DB, 'viajes', viajeId);
export const vehiculoRef = (vehId: Id): DocumentReference => doc(DB, 'Vehiculo', vehId);

// Util pequeño para garantizar existencia
export async function getDocStrict<T = any>(ref: DocumentReference): Promise<T & { id: string }> {
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error(`Documento no existe: ${ref.path}`);
  return { id: snap.id, ...(snap.data() as any) };
}
