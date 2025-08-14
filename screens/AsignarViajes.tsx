// screens/AsignarViajes.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { getDocs, query, collection, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Picker } from '@react-native-picker/picker';

const VIAJES_POR_PAGINA = 2;

export default function AsignarViajes() {
  const [viajes, setViajes] = useState<any[]>([]);
  const [conductores, setConductores] = useState<any[]>([]);
  const [asignando, setAsignando] = useState<string | null>(null);
  const [seleccionados, setSeleccionados] = useState<{ [viajeId: string]: string }>({});
  const [paginaActual, setPaginaActual] = useState(1);

  const cargarViajes = async () => {
    const q = query(
      collection(db, 'viajes'),
      where('estado', '==', 'solicitado')
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setViajes(docs);
    setPaginaActual(1); // Reiniciar paginación al cargar
  };

  const cargarConductores = async () => {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'conductor')
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setConductores(docs);
  };

  useEffect(() => {
    cargarViajes();
    cargarConductores();
  }, []);

  const asignarConductor = async (viajeId: string) => {
    const conductorId = seleccionados[viajeId];
    if (!conductorId) {
      Alert.alert('Selecciona un conductor antes de asignar.');
      return;
    }

    setAsignando(viajeId);
    try {
      await updateDoc(doc(db, 'viajes', viajeId), {
        uid_conductor: conductorId,
        estado: 'asignado',
      });
      Alert.alert('✅ Asignado', 'El conductor fue asignado correctamente.');
      await cargarViajes();
    } catch (error) {
      Alert.alert('Error', 'No se pudo asignar el conductor.');
    } finally {
      setAsignando(null);
    }
  };

  const totalPaginas = Math.ceil(viajes.length / VIAJES_POR_PAGINA);
  const inicio = (paginaActual - 1) * VIAJES_POR_PAGINA;
  const viajesPagina = viajes.slice(inicio, inicio + VIAJES_POR_PAGINA);

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, alignItems: 'center' }}
    >
      <Text className="text-2xl font-bold text-black mb-6">Asignar Viajes Solicitados</Text>

      <View className="w-full max-w-4xl space-y-6">
        {viajesPagina.map((viaje) => (
          <View
            key={viaje.id}
            className="border border-gray-300 rounded-lg p-4 space-y-2 bg-gray-50"
          >
            <Text className="text-black">📍 Pasajero: {viaje.uid_pasajero}</Text>
            <Text className="text-black">📏 Distancia: {viaje.distancia_km?.toFixed(2) ?? 'N/A'} km</Text>
            <Text className="text-black">💲 Tarifa: ${viaje.tarifa?.toFixed(2) ?? 'N/A'}</Text>

            <View>
              <Text className="text-black mb-1">Seleccionar conductor:</Text>
              <View className="border border-gray-300 rounded-md bg-white">
                <Picker
                  selectedValue={seleccionados[viaje.id] || ''}
                  onValueChange={(itemValue) =>
                    setSeleccionados((prev) => ({ ...prev, [viaje.id]: itemValue }))
                  }
                >
                  <Picker.Item label="Selecciona un conductor..." value="" />
                  {conductores.map((c) => (
                    <Picker.Item key={c.id} label={c.displayName || c.id} value={c.id} />
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
        ))}

        {viajes.length === 0 && (
          <Text className="text-gray-500 text-center">No hay viajes solicitados.</Text>
        )}

        {totalPaginas > 1 && (
          <View className="flex-row justify-center space-x-2 mt-6">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
              <TouchableOpacity
                key={pagina}
                className={`px-4 py-2 rounded-full ${paginaActual === pagina ? 'bg-yellow-500' : 'bg-gray-200'
                  }`}
                onPress={() => setPaginaActual(pagina)}
              >
                <Text
                  className={`font-semibold ${paginaActual === pagina ? 'text-white' : 'text-black'
                    }`}
                >
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
