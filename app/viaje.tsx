import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Map from '../components/Map';
import CardReciclable from '../components/CardReciclable';
import { db } from '../firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';

export default function HomeViaje() {
  const [customOrigin, setCustomOrigin] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [setOriginNextTap, setSetOriginNextTap] = useState(false);

  const handleMapTap = (coords: [number, number]) => {
    if (setOriginNextTap) {
      setCustomOrigin(coords);
      setSetOriginNextTap(false);
    } else {
      setDestination(coords);
    }
  };

  const confirmarViaje = async () => {
    if (!destination) {
      Alert.alert('Destino no seleccionado', 'Selecciona un destino en el mapa');
      return;
    }

    const originToUse = customOrigin;

    if (!originToUse) {
      Alert.alert('Origen desconocido', 'Aún no se ha detectado o asignado un origen');
      return;
    }

    try {
      await addDoc(collection(db, 'viajes'), {
        origen: { lat: originToUse[1], lng: originToUse[0] },
        destino: { lat: destination[1], lng: destination[0] },
        estado: 'pendiente',
        fecha: Timestamp.now(),
      });
      Alert.alert('Éxito', 'Viaje guardado correctamente');
      setCustomOrigin(null);
      setDestination(null);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo guardar el viaje');
    }
  };

  return (
    <View className="flex-1 relative">
      <Map
        customOrigin={customOrigin}
        destination={destination}
        onDestinationSelect={handleMapTap}
      />

      <View className="absolute bottom-5 left-5 right-5">
        <CardReciclable
          title="Solicitar Taxi"
          headerColor="#facc15"
          opacity={0.95}
          reverseOrder={true}
        >
          <View className="space-y-4">
            <TouchableOpacity
              className="bg-blue-500 rounded-lg py-3 px-4"
              onPress={() => setSetOriginNextTap(true)}
            >
              <Text className="text-center font-semibold text-white">
                Cambiar origen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-green-500 rounded-lg py-3 px-4"
              onPress={confirmarViaje}
            >
              <Text className="text-center font-semibold text-white">
                Confirmar viaje
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-500 rounded-lg py-3 px-4"
              onPress={() => {
                setDestination(null);
                setCustomOrigin(null);
                setSetOriginNextTap(false);
              }}
            >
              <Text className="text-center font-semibold text-white">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </CardReciclable>
      </View>
    </View>
  );
}
