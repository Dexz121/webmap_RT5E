// hooks/useConductoresAdmin.ts
import { useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';

interface Conductor {
  id: string;
  coord: [number, number]; // [lng, lat]
}

export function useConductoresAdmin(role: string, setTaxis: (t: Conductor[]) => void) {
  useEffect(() => {
    if (role !== 'admin') return;

    const fetchConductores = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'conductor'));
        const snapshot = await getDocs(q);

        const lista: Conductor[] = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const ubicacion = data.ubicacion;
            if (
              ubicacion &&
              typeof ubicacion.latitude === 'number' &&
              typeof ubicacion.longitude === 'number'
            ) {
              return {
                id: doc.id,
                coord: [ubicacion.longitude, ubicacion.latitude],
              };
            }
            return null;
          })
          .filter(Boolean) as Conductor[];

        setTaxis(lista);
      } catch (error) {
        console.error('❌ Error cargando conductores:', error);
      }
    };

    const interval = setInterval(fetchConductores, 15000); // cada 15 segundos
    fetchConductores(); // llamada inicial inmediata

    return () => clearInterval(interval);
  }, [role]);
}
