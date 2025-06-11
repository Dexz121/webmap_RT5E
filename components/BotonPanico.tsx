import React from 'react';
import { TouchableOpacity, Text, Linking, Alert } from 'react-native';

export default function BotonPanico() {
  const numeroEmergencia = '911'; // Puedes cambiar esto al número que necesites

  const llamarEmergencia = async () => {
    const telURL = `tel:${numeroEmergencia}`;
    const supported = await Linking.canOpenURL(telURL);

    if (supported) {
      Linking.openURL(telURL);
    } else {
      Alert.alert('Error', 'Este dispositivo no puede realizar llamadas.');
    }
  };

  return (
    <TouchableOpacity
      onPress={llamarEmergencia}
      className="bg-red-600 px-6 py-4 rounded-full shadow-lg active:opacity-80"
    >
      <Text className="text-white text-lg font-bold text-center">🚨 Botón de Pánico</Text>
    </TouchableOpacity>
  );
}