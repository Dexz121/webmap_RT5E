// screens/SetViaje.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { selectUser } from '@/slices/userSlice';
import {
  selectOrigin,
  selectDestination,
  selectTravelTimeInformation,
} from '@/slices/navSlice';
import { db } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';

interface Props {
  onBack: () => void;
}

export default function SetViaje({ onBack }: Props) {
  const user = useSelector(selectUser);
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const travelInfo = useSelector(selectTravelTimeInformation);
  const [loading, setLoading] = useState(false);

  const ABORDO = 30; // tarifa fija por subir
  const TARIFA_POR_KM = 10; // costo por km (puedes hacer dinámico luego)

  const distanciaKm = useMemo(() => {
    if (!travelInfo?.distance) return 0;
    return travelInfo.distance / 1000; // metros a kilómetros
  }, [travelInfo]);

  const tarifaTotal = useMemo(() => {
    return ABORDO + distanciaKm * TARIFA_POR_KM;
  }, [distanciaKm]);

  const publicarViaje = async () => {
    if (!origin || !destination || !user?.uid) {
      Alert.alert('Faltan datos', 'Debes seleccionar origen y destino en el mapa.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'viajes'), {
        estado: 'pendiente',
        uid_pasajero: user.uid,
        fecha_inicio: new Date(),
        origen: {
          lat: origin[1],
          lng: origin[0],
        },
        destino: {
          lat: destination[1],
          lng: destination[0],
        },
        distancia_km: parseFloat(distanciaKm.toFixed(2)),
        tarifa: parseFloat(tarifaTotal.toFixed(2)),
      });

      Alert.alert('✅ Viaje publicado', 'Tu viaje ha sido enviado');
      onBack();
    } catch (error) {
      console.error('❌ Error al subir viaje:', error);
      Alert.alert('Error', 'No se pudo publicar el viaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-6 justify-between">
      <View>
        <Text className="text-xl font-semibold text-black mb-2">Tu tarifa estimada</Text>
        <Text className="text-4xl font-bold text-blue-600">${tarifaTotal.toFixed(2)}</Text>
        <Text className="text-sm text-gray-500 mt-2">
          {distanciaKm.toFixed(2)} km de recorrido
        </Text>
        <Text className="text-sm text-gray-400">
          (Base: ${ABORDO} + ${TARIFA_POR_KM}/km)
        </Text>
      </View>

      <TouchableOpacity
        className="bg-green-500 rounded-xl p-4 mt-8"
        onPress={publicarViaje}
        disabled={loading}
      >
        <Text className="text-white text-center text-lg font-bold">
          {loading ? 'Publicando...' : 'Confirmar viaje'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onBack} className="mt-4">
        <Text className="text-center text-gray-500 underline">Volver</Text>
      </TouchableOpacity>
    </View>
  );
}
