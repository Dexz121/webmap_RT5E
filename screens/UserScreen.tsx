import { View, Text, Image } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';


export default function UserScreen() {
  const router = useRouter();

  return (
    <View className="h-full w-full bg-white p-4 rounded-3xl overflow-hidden">
      <Text className="text-black text-2xl font-semibold mt-12 ml-8">
        ¿Qué haremos el día de hoy?
      </Text>

      <View className="flex-row justify-between mt-12 px-8">
  <TouchableOpacity
    className="w-40 h-40 bg-[#EEEEEE] rounded-xl shadow-md flex justify-center items-center"
    onPress={() => router.push({ pathname: '/viaje', params: { tipo: 'viaje' } })}
  >
    <Image source={require('@/assets/images/viajes.png')} className="w-20 h-20" />
    <Text className="text-black font-semibold mt-2">Viajes</Text>
  </TouchableOpacity>

  <TouchableOpacity
    className="w-40 h-40 bg-[#EEEEEE] rounded-xl shadow-md flex justify-center items-center"
    onPress={() => router.push({ pathname: '/', params: { tipo: 'paqueteria' } })}
  >
    <Image source={require('../assets/images/Package.png')} className="w-20 h-20" />
    <Text className="text-black font-semibold mt-2 text-center">Enviar paquetería</Text>
  </TouchableOpacity>
</View>

      {/* Accesos rápidos - Administración */}
      <View className="mt-10 px-8">
        <Text className="text-black text-2xl font-semibold mb-4">Administración</Text>
        <View className="flex-row flex-wrap justify-between">
          {[
            { label: 'Usuarios', route: '/', icon: require('../assets/images/viajes.png') },
            { label: 'Vehículos', route: '/', icon: require('../assets/images/viajes.png') },
            { label: 'Viajes', route: '/viaje', icon: require('../assets/images/viajes.png') },
            { label: 'Pagos', route: '/', icon: require('../assets/images/viajes.png') },
            { label: 'Puntuaciones', route: '/', icon: require('../assets/images/viajes.png') },
            { label: 'Tarifa', route: '/', icon: require('../assets/images/viajes.png') },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              className="w-36 h-36 bg-gray-200 rounded-xl m-2 flex justify-center items-center"
              onPress={() => router.push(item.route)}
            >
              <Image source={item.icon} className="w-16 h-16" />
              <Text className="text-black font-semibold mt-2 text-center">{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Historial de viajes */}
      <Text className="text-black text-xl font-semibold mt-12 ml-8">Historial de viajes</Text>
      <View className="mt-4 px-8">
        {[
          { destino: 'Sitio', precio: '$60', fecha: '20/01/2025' },
          { destino: 'Parque - Club', precio: '$100', fecha: '19/01/2025' },
        ].map((item) => (
          <View key={item.destino} className="flex-row items-center py-2 border-b border-gray-300">
            <View className="w-10 h-10 bg-gray-200 rounded-full flex justify-center items-center">
              <Image source={require('../assets/images/Car.png')} className="w-6 h-6" />
            </View>
            <View className="ml-4">
              <Text className="text-black text-lg font-semibold">{item.destino}</Text>
              <Text className="text-gray-500 text-sm">{item.precio} - {item.fecha}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}