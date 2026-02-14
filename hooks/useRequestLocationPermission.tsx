// hooks/useRequestLocationPermission.ts
import { useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export function useRequestLocationPermission() {
  useEffect(() => {
    const solicitar = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Debes conceder acceso a la ubicación para usar el mapa.');
      } else {
        console.log('✅ Permiso de ubicación concedido');
      }
    };
    solicitar();
  }, []);
}
