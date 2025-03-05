import { View, Text } from 'react-native';
import { Stack } from 'expo-router'; //al usar expo-router la navegacion entre pantallas genera automaticamente un boton de retroceso, esto puede ser estatico o dinamico

export default function Map() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Stack.Screen options={{ title: 'Mapa Personalizado' }} />
      <Text className='text-emerald-600'>Contenido de la pantalla del mapa</Text>
    </View>
  );
}
