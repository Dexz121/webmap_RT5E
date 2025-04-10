import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as Location from 'expo-location';

const LocationTestScreen = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso denegado para acceder a la ubicación');
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación.');
      setErrorMsg(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold">Ubicación del Dispositivo</Text>
      {errorMsg ? (
        <Text className="text-red-500">{errorMsg}</Text>
      ) : (
        location && (
          <Text className="text-blue-500">
            Lat: {location.latitude}, Lon: {location.longitude}
          </Text>
        )
      )}
      <Button title="Obtener Ubicación" onPress={getLocation} />
    </View>
  );
};

export default LocationTestScreen;
