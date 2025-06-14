// app/puntuaciones/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';

interface Puntuacion {
  id: string;
  id_viaje: string;
  id_pasajero: string;
  id_conductor: string;
  valoracion: number;
  comentarios: string;
  fecha_creacion: any;
}

const REGISTROS_POR_PAGINA = 10;

export default function PuntuacionesIndex() {
  const [puntuaciones, setPuntuaciones] = useState<Puntuacion[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  const fetchPuntuaciones = async () => {
    const snapshot = await getDocs(collection(db, 'Puntuacion'));
    const data = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Puntuacion)
    );
    setPuntuaciones(data);
  };

  useEffect(() => {
    fetchPuntuaciones();
  }, []);

  const puntuacionesFiltradas = puntuaciones.filter((p) =>
    p.id_viaje.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.id_pasajero.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.id_conductor.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(puntuacionesFiltradas.length / REGISTROS_POR_PAGINA);
  const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
  const registrosPagina = puntuacionesFiltradas.slice(inicio, inicio + REGISTROS_POR_PAGINA);

  return (
    <ScrollView className="flex-1 bg-white px-6 py-4 items-center">
      <Text className="text-2xl font-bold text-center mb-6">Puntuaciones Registradas</Text>

      <View className="mb-4 flex-row justify-between w-[900px]">
        <TextInput
          placeholder="Buscar por ID de viaje, pasajero o conductor"
          value={busqueda}
          onChangeText={(text) => {
            setBusqueda(text);
            setPaginaActual(1);
          }}
          className="border border-gray-300 px-4 py-2 rounded-md w-full"
        />
      </View>

      <View className="border-t border-gray-300 w-[900px]">
        <View className="flex-row py-2 border-b border-gray-200">
          {["ID", "ID Viaje", "Pasajero", "Conductor", "Valoración", "Comentario", "Fecha"].map(
            (header) => (
              <Text
                key={header}
                className="flex-1 font-bold text-black text-sm text-center truncate"
              >
                {header}
              </Text>
            )
          )}
        </View>

        {registrosPagina.map((p) => (
          <View key={p.id} className="flex-row border-b border-gray-100 py-2">
            <Text className="flex-1 text-center text-gray-700 text-sm truncate">{p.id}</Text>
            <Text className="flex-1 text-center text-gray-700 text-sm truncate">{p.id_viaje}</Text>
            <Text className="flex-1 text-center text-gray-700 text-sm truncate">{p.id_pasajero}</Text>
            <Text className="flex-1 text-center text-gray-700 text-sm truncate">{p.id_conductor}</Text>
            <Text className="flex-1 text-center text-gray-700 text-sm truncate">{p.valoracion}</Text>
            <Text className="flex-1 text-center text-gray-700 text-sm truncate">{p.comentarios}</Text>
            <Text className="flex-1 text-center text-gray-700 text-sm truncate">
              {p.fecha_creacion?.toDate ? p.fecha_creacion.toDate().toLocaleString() : ''}
            </Text>
          </View>
        ))}
      </View>

      {totalPaginas > 1 && (
        <View className="flex-row justify-center space-x-2 mt-6">
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
    </ScrollView>
  );
}