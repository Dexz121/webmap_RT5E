// hooks/useLocationSync.ts
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/slices/userSlice';
import { db } from '@/firebase'; 
import { doc, setDoc } from 'firebase/firestore';

type Coords = [number, number];

export default function useLocationSync(
  currentCoords: Coords | null,
  enabled: boolean
) {
  const user = useSelector(selectUser);
  const lastCoords = useRef<Coords | null>(null);

  useEffect(() => {
    console.log("🚀 useLocationSync ACTIVADO:", {
      enabled,
      currentCoords,
      uid: user?.uid,
    });

    if (!enabled || !currentCoords || !user?.uid) return;

    const [lng, lat] = currentCoords;

    const hasMovedSignificantly = () => {
      if (!lastCoords.current) return true;
      const [lastLng, lastLat] = lastCoords.current;
      const delta = Math.sqrt((lng - lastLng) ** 2 + (lat - lastLat) ** 2);
      return delta > 0.0001;
    };

    if (hasMovedSignificantly()) {
      lastCoords.current = currentCoords;
      console.log("📤 Enviando ubicación a Firestore:", {
        uid: user.uid,
        lat,
        lng,
      });

      const updateLocation = async () => {
        try {
          const ref = doc(db, 'users', user.uid);
          await setDoc(
            ref,
            {
              ubicacion: {
                latitude: lat,
                longitude: lng,
                timestamp: Date.now(),
              },
            },
            { merge: true }
          );
          console.log("✅ Ubicación guardada correctamente");
        } catch (err) {
          console.error("❌ Error al guardar ubicación:", err);
        }
      };

      updateLocation();
    } else {
      console.log("⛔ Movimiento insignificante, no se guarda ubicación");
    }
  }, [currentCoords, enabled, user?.uid]);
}
