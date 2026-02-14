import { useEffect, useRef } from 'react';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/firebase';

const OCUPADO_MAX_MIN = 60;
const CONSULTA_UBICACION_MS = 3 * 60 * 1000;

export interface Conductor {
  id: string;
  coord: [number, number];
  props: {
    nombre?: string;
    economico?: string | number;
    telefono?: string;
    numeroEconomico?: string | number;
    activo?: boolean;
    disponible?: boolean;
    estado?: string;
    id_vehiculo?: string | null;
  };
}

function getOcupadoMinutos(ocupadoDesde: any): number {
  if (!ocupadoDesde) return 0;
  try {
    if (typeof ocupadoDesde.toDate === 'function') {
      const ms = ocupadoDesde.toDate().getTime();
      return (Date.now() - ms) / 60000;
    }
    if (ocupadoDesde?.seconds != null) {
      return (Date.now() / 1000 - ocupadoDesde.seconds) / 60;
    }
  } catch (_) {}
  return 0;
}

export function useConductoresAdmin(role: string, setTaxis: (t: Conductor[]) => void) {
  const refetchRef = useRef<() => Promise<void>>(() => Promise.resolve());

  useEffect(() => {
    if (role !== 'admin') return;

    const q = query(
      collection(db, 'users'),
      where('role', '==', 'conductor'),
      where('disponible', '==', true)
    );

    const consultarUbicaciones = async () => {
      const ahora = new Date().toLocaleTimeString('es-MX', { hour12: false });
      console.log('[Mapa] Actualizando conductores:', ahora);
      try {
        const snap = await getDocs(q);
        const baseList: Conductor[] = snap.docs
          .map((docSnap) => {
            const d: any = docSnap.data();
            const u = d?.ubicacion;
            if (u && typeof u.latitude === 'number' && typeof u.longitude === 'number') {
              const activo = !!d?.viaje_activo_id;
              const economico =
                d?.movil_asignado != null
                  ? String(d.movil_asignado)
                  : (d?.movil ?? d?.numeroEconomico ?? d?.telefono ?? '—');
              const nombre = d?.displayName ?? d?.name ?? 'Conductor';
              const id_vehiculo = d?.id_vehiculo ?? null;
              const telefono = d?.telefono != null ? String(d.telefono) : '';
              const numeroEconomico = d?.movil_asignado != null ? String(d.movil_asignado) : '';
              return {
                id: docSnap.id,
                coord: [u.longitude, u.latitude] as [number, number],
                props: {
                  nombre,
                  economico,
                  telefono,
                  numeroEconomico,
                  activo,
                  disponible: !!d?.disponible,
                  estado: d?.estado,
                  id_vehiculo: id_vehiculo && String(id_vehiculo).trim() ? id_vehiculo : null,
                },
              };
            }
            return null;
          })
          .filter(Boolean) as Conductor[];

        const lista: Conductor[] = await Promise.all(
          baseList.map(async (c) => {
            const idVeh = c.props?.id_vehiculo;
            if (!idVeh) return c;
            try {
              const vehSnap = await getDoc(doc(db, 'Vehiculo', idVeh));
              if (vehSnap.exists()) {
                const movil = (vehSnap.data() as any)?.movil;
                const display = movil != null && movil !== '' ? String(movil) : c.props.economico;
                return {
                  ...c,
                  props: { ...c.props, economico: display },
                };
              }
            } catch (_) {}
            return c;
          })
        );

        setTaxis(lista);
        console.log('[Mapa] Conductores cargados:', lista.length, 'a las', new Date().toLocaleTimeString('es-MX', { hour12: false }));

        snap.docs.forEach((docSnap) => {
          const d = docSnap.data() as any;
          if (d?.estado !== 'ocupado' || !d?.ocupado_desde) return;
          const min = getOcupadoMinutos(d.ocupado_desde);
          if (min >= OCUPADO_MAX_MIN) {
            updateDoc(doc(db, 'users', docSnap.id), {
              viaje_activo_id: null,
              estado: 'offline',
              ocupado_desde: null,
            }).catch((err) => console.error('reset conductor ocupado >60min:', err));
          }
        });
      } catch (err) {
        console.error('Error consultando ubicación conductores:', err);
      }
    };

    refetchRef.current = consultarUbicaciones;
    consultarUbicaciones();
    const id = setInterval(consultarUbicaciones, CONSULTA_UBICACION_MS);
    return () => clearInterval(id);
  }, [role, setTaxis]);

  return () => refetchRef.current();
}
