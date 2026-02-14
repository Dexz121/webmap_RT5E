// screens/AsignarViajes.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import {
  getDocs,
  getDoc,
  query,
  collection,
  where,
  doc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { Picker } from '@react-native-picker/picker';
import { assignDriverToViaje } from '@/services/viajes';

const VIAJES_POR_PAGINA = 2;

type Conductor = {
  id: string;
  displayName?: string;
  role?: string; // 'conductor' | 'pasajero' (ambos en 'users')
  viaje_activo_id?: string | null;
  id_vehiculo?: string | null;
  movil_asignado?: number | null;
  movil?: number | null;
};

type Vehiculo = {
  id: string;
  movil?: string | number | null;
  estado?: string | null;
  numero_economico?: string | number | null;
  placas?: string | null;
  marca?: string | null;
};

export default function AsignarViajes() {
  const [viajes, setViajes] = useState<any[]>([]);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [vehiculos, setVehiculos] = useState<Record<string, Vehiculo>>({});
  const [asignando, setAsignando] = useState<string | null>(null);
  const [seleccionados, setSeleccionados] = useState<{ [viajeId: string]: string }>({});
  const [paginaActual, setPaginaActual] = useState(1);

  const money = (n?: number) => (typeof n === 'number' ? n.toFixed(2) : 'N/A');

  const cargarViajes = async () => {
    const qv = query(collection(db, 'viajes'), where('estado', '==', 'solicitado'));
    const snapshot = await getDocs(qv);
    setViajes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    setPaginaActual(1);
  };

  const cargarVehiculos = async () => {
    const vSnap = await getDocs(collection(db, 'Vehiculo'));
    const map: Record<string, Vehiculo> = {};
    vSnap.docs.forEach((d) => (map[d.id] = { id: d.id, ...(d.data() as any) }));
    setVehiculos(map);
  };

  const cargarConductores = async () => {
    const qc = query(collection(db, 'users'), where('role', '==', 'conductor'));
    const csnap = await getDocs(qc);
    const docs = csnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Conductor[];

    const disponibles = docs.filter((c) => !c.viaje_activo_id || String(c.viaje_activo_id).trim() === '');

    const getMovilText = (c: Conductor) => {
      const veh = c.id_vehiculo ? vehiculos[c.id_vehiculo] : undefined;
      const mVeh = veh?.movil ?? null;
      const mUser = Number.isFinite(c.movil_asignado) ? c.movil_asignado : c.movil ?? null;
      return String(mVeh ?? mUser ?? '');
    };
    const toNum = (s: string) => {
      const n = parseInt(String(s).replace(/[^\d]/g, ''), 10);
      return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
    };

    disponibles.sort((a, b) => toNum(getMovilText(a)) - toNum(getMovilText(b)));
    setConductores(disponibles);
  };

  useEffect(() => {
    (async () => {
      await Promise.all([cargarVehiculos(), cargarViajes()]);
      await cargarConductores();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await cargarConductores();
    })();
  }, [Object.keys(vehiculos).length]);

  const getConductorLabel = (c: Conductor) => {
    const veh = c.id_vehiculo ? vehiculos[c.id_vehiculo] : undefined;
    const mVeh = veh?.movil ?? null;
    const mUser = Number.isFinite(c.movil_asignado) ? c.movil_asignado : c.movil ?? null;
    const movilText = String(mVeh ?? mUser ?? '').trim();
    return movilText.length ? `Móvil ${movilText}` : 'Móvil s/datos';
  };

const asignarConductor = async (viajeId: string) => {
  const conductorId = seleccionados[viajeId];
  if (!conductorId) {
    Alert.alert('Selecciona un conductor antes de asignar.');
    return;
  }

  setAsignando(viajeId);
  try {
    // 🔒 Transacción atómica en el service: valida estados y escribe 3 docs
    await assignDriverToViaje({ viajeId, driverId: conductorId });

    Alert.alert('✅ Asignado', 'El conductor fue asignado correctamente.');

    setSeleccionados((prev) => {
      const copy = { ...prev };
      delete copy[viajeId];
      return copy;
    });

    // Recarga con tus mismas funciones que ya sabes que funcionan
    await Promise.all([cargarViajes(), cargarConductores()]);
  } catch (error: any) {
    console.error('[assignDriverToViaje]', error);
    Alert.alert('Error', error?.message || 'No se pudo asignar el conductor.');
  } finally {
    setAsignando(null);
  }
};


  const totalPaginas = Math.ceil(viajes.length / VIAJES_POR_PAGINA);
  const inicio = (paginaActual - 1) * VIAJES_POR_PAGINA;
  const viajesPagina = useMemo(
    () => viajes.slice(inicio, inicio + VIAJES_POR_PAGINA),
    [viajes, inicio]
  );

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, alignItems: 'center' }}
    >
      <Text className="text-2xl font-bold text-black mb-6">Asignar Viajes Solicitados</Text>

      <View className="w-full space-y-6" style={{ width: '100%', maxWidth: '100%' }}>
        {viajesPagina.map((viaje) => {
          const tarifa =
            typeof viaje?.tarifa === 'number'
              ? viaje.tarifa
              : (typeof viaje?.origen?.tarifa === 'number' ? viaje.origen.tarifa : undefined);

          return (
            <View
              key={viaje.id}
              className="border border-gray-300 rounded-lg p-4 space-y-2 bg-gray-50"
            >
              <Text className="text-black">📍 Pasajero: {viaje.uid_pasajero}</Text>
              <Text className="text-black">
                📏 Distancia:{' '}
                {typeof viaje.distancia_km === 'number' ? viaje.distancia_km.toFixed(2) : 'N/A'} km
              </Text>
              <Text className="text-black">💲 Tarifa: ${money(tarifa)}</Text>

              {/* Seleccionar conductor */}
              <View>
                <Text className="text-black mb-1">Seleccionar conductor:</Text>
                <View className="border border-gray-300 rounded-md bg-white">
                  <Picker
                    selectedValue={seleccionados[viaje.id] || ''}
                    onValueChange={(itemValue) => {
                      setSeleccionados((prev) => ({ ...prev, [viaje.id]: itemValue }));
                    }}
                  >
                    <Picker.Item label="Selecciona un conductor..." value="" />
                    {conductores
                      .filter((c) => {
                        const label = getConductorLabel(c);
                        return label !== 'Móvil s/datos';   // 👈 Filtramos solo los que sí tienen datos
                      })
                      .map((c) => (
                        <Picker.Item key={c.id} label={getConductorLabel(c)} value={c.id} />
                      ))}
                  </Picker>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => asignarConductor(viaje.id)}
                className={`mt-2 py-2 px-4 rounded-md ${asignando === viaje.id ? 'bg-gray-400' : 'bg-green-600'}`}
                disabled={asignando === viaje.id}
              >
                <Text className="text-white text-center font-semibold">
                  {asignando === viaje.id ? 'Asignando...' : 'Asignar'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {viajes.length === 0 && (
          <Text className="text-gray-500 text-center">No hay viajes solicitados.</Text>
        )}

        {totalPaginas > 1 && (
          <View className="flex-row justify-center space-x-2 mt-6">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
              <TouchableOpacity
                key={pagina}
                className={`px-4 py-2 rounded-full ${paginaActual === pagina ? 'bg-yellow-500' : 'bg-gray-200'}`}
                onPress={() => setPaginaActual(pagina)}
              >
                <Text className={`font-semibold ${paginaActual === pagina ? 'text-white' : 'text-black'}`}>
                  {pagina}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
