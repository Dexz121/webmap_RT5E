import { View, Text } from 'react-native';
import { Stack } from 'expo-router'; //al usar expo-router la navegacion entre pantallas genera automaticamente un boton de retroceso, esto puede ser estatico o dinamico
import MapScreen from "../components/Map";

export default function Map() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Stack.Screen options={{ title: 'Mapa Personalizado' }} />
      <MapScreen />
    </View>
  );
}
