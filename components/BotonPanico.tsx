// components/BotonPanico.tsx
import React from 'react';
import { TouchableOpacity, Text, Alert, Linking } from 'react-native';

export default function BotonPanico() {
  const numeroEmergencia = '911'; // Puedes reemplazarlo por el número de tu central

  const activarPanico = async () => {
    const telURL = `tel:${numeroEmergencia}`;
    const supported = await Linking.canOpenURL(telURL);

    if (supported) {
      Alert.alert(
        '¿Llamar a emergencias?',
        `Se va a llamar al ${numeroEmergencia}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Llamar',
            style: 'destructive',
            onPress: () => Linking.openURL(telURL),
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Este dispositivo no puede hacer llamadas telefónicas.');
    }
  };

  return (
    <TouchableOpacity
      onPress={activarPanico}
      style={{
        backgroundColor: 'red',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
      }}
    >
      <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
        🚨 Botón de Pánico
      </Text>
    </TouchableOpacity>
  );
}
