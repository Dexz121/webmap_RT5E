import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import * as Location from 'expo-location';

const LocationTestScreen = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);

  const startWatchingLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso denegado para acceder a la ubicación');
        return;
      }

      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      );
      setSubscription(sub);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Error al rastrear la ubicación');
    }
  };

  const stopWatchingLocation = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  };

  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [subscription]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold">Seguimiento de Ubicación</Text>
      {errorMsg ? (
        <Text className="text-red-500">{errorMsg}</Text>
      ) : (
        location && (
          <Text className="text-blue-500">
            Lat: {location.latitude}, Lon: {location.longitude}
          </Text>
        )
      )}
      <Button title="Iniciar Seguimiento" onPress={startWatchingLocation} />
      <Button title="Detener Seguimiento" onPress={stopWatchingLocation} />
    </View>
  );
};

export default LocationTestScreen;
