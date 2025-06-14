// app/viajes/index.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const VIAJES_POR_PAGINA = 10;

export default function ViajesListScreen() {
  const [viajes, setViajes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    fetchViajes();
  }, []);

  const fetchViajes = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'Viaje'));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setViajes(data);
    } catch (e) {
      console.error('Error al obtener los viajes:', e);
    }
  };

  const agregarViajeFicticio = async () => {
    const now = new Date();
    const inicio = new Date(now.getTime() - Math.floor(Math.random() * 3600000));
    const fin = new Date(inicio.getTime() + Math.floor(Math.random() * 1800000));

    const viaje = {
      id_pasajero: 'P-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      id_conductor: 'C-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      id_vehiculo: 'V-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      fecha_inicio_viaje: Timestamp.fromDate(inicio),
      fecha_finalizacion_viaje: Timestamp.fromDate(fin),
      origen_latitud: '19.4' + Math.random().toFixed(6).substring(2),
      origen_longitud: '-99.1' + Math.random().toFixed(6).substring(2),
      destino_latitud: '19.4' + Math.random().toFixed(6).substring(2),
      destino_longitud: '-99.1' + Math.random().toFixed(6).substring(2),
      costo_estimado: Math.floor(Math.random() * 200 + 50),
      costo_final: Math.floor(Math.random() * 200 + 50),
      estado: ['programado', 'en progreso', 'completado', 'cancelado'][Math.floor(Math.random() * 4)],
      fecha_creacion: Timestamp.now(),
      fecha_eliminacion: null,
      id_tarifa: 'T-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    };

    try {
      await addDoc(collection(db, 'Viaje'), viaje);
      Alert.alert('Éxito', 'Viaje demo agregado');
      fetchViajes();
    } catch (error) {
      console.error('Error al agregar viaje demo:', error);
    }
  };

  const viajesFiltrados = viajes.filter((v) => {
    const filtro = busqueda.toLowerCase();
    return (
      v.estado?.toLowerCase().includes(filtro) ||
      v.id_viaje?.toLowerCase().includes(filtro)
    );
  });

  const totalPaginas = Math.ceil(viajesFiltrados.length / VIAJES_POR_PAGINA);
  const inicio = (paginaActual - 1) * VIAJES_POR_PAGINA;
  const viajesPagina = viajesFiltrados.slice(inicio, inicio + VIAJES_POR_PAGINA);

  return (
    <ScrollView className="bg-white flex-1">
      <View className="items-center pt-6">
        <Text className="text-black text-2xl font-bold mb-4">Lista de Viajes</Text>

        <View className="w-[960px]">
          <View className="flex-row justify-between mb-4 space-x-4">
            <TextInput
              placeholder="Buscar por estado o ID de viaje"
              className="border border-gray-300 rounded-md px-4 py-2 flex-1"
              value={busqueda}
              onChangeText={(text) => {
                setBusqueda(text);
                setPaginaActual(1);
              }}
            />

            <TouchableOpacity
              className="bg-yellow-500 rounded-md px-4 justify-center"
              onPress={agregarViajeFicticio}
            >
              <Text className="text-white font-semibold text-sm">+ Agregar Viaje Demo</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal className="mb-4">
            <View>
              <View className="flex-row border-b border-gray-400 pb-2">
                {["ID", "Estado", "Inicio", "Fin", "Costo Estimado", "Costo Final"].map((h) => (
                  <Text key={h} className="w-48 font-bold text-black text-center">
                    {h}
                  </Text>
                ))}
              </View>

              {viajesPagina.map((viaje) => (
                <View
                  key={viaje.id}
                  className="flex-row border-b border-gray-200 py-2 items-center"
                >
                  <Text className="w-48 text-center text-gray-800">{viaje.id_viaje || viaje.id}</Text>
                  <Text className="w-48 text-center text-gray-800">{viaje.estado}</Text>
                  <Text className="w-48 text-center text-gray-800">
                    {viaje.fecha_inicio_viaje?.toDate?.().toLocaleString?.() || '-'}
                  </Text>
                  <Text className="w-48 text-center text-gray-800">
                    {viaje.fecha_finalizacion_viaje?.toDate?.().toLocaleString?.() || '-'}
                  </Text>
                  <Text className="w-48 text-center text-gray-800">{viaje.costo_estimado || '-'}</Text>
                  <Text className="w-48 text-center text-gray-800">{viaje.costo_final || '-'}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {totalPaginas > 1 && (
            <View className="flex-row justify-center space-x-2 mt-4">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                <TouchableOpacity
                  key={pagina}
                  className={`px-4 py-2 rounded-full ${
                    paginaActual === pagina ? 'bg-yellow-500' : 'bg-gray-200'
                  }`}
                  onPress={() => setPaginaActual(pagina)}
                >
                  <Text
                    className={`font-semibold ${
                      paginaActual === pagina ? 'text-white' : 'text-black'
                    }`}
                  >
                    {pagina}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
