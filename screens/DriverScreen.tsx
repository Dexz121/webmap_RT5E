import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

export default function DriverScreen() {
  return (
    <View className="flex-1 bg-white rounded-3xl overflow-hidden">
      {/* Encabezado */}
      <View className="w-full h-40 bg-yellow-500 flex justify-center items-center">
        <Text className="text-white text-2xl font-bold">Hola Maria</Text>
      </View>

      {/* Foto de perfil */}
      <View className="absolute top-10 right-6">
        <Image source={require('../assets/images/profile.svg')} className="w-24 h-24 rounded-full" />
      </View>

      {/* Opciones de usuario */}
      <View className="px-6 mt-20">
        <Text className="text-black text-2xl font-semibold">Cuenta</Text>
        <Text className="text-black text-2xl font-semibold mt-4">Ganancias</Text>
      </View>
      
      {/* Historial de viajes */}
      <Text className="text-black text-xl font-semibold mt-16 px-6">Historial de viajes</Text>
      <View className="mt-4 px-6">
        <View className="flex-row items-center py-2 border-b border-gray-300">
          <View className="w-10 h-10 bg-gray-200 rounded-full flex justify-center items-center">
          {/*<Image source={require('../assets/images/location.png')} className="w-6 h-6" />*/}
          </View>
          <View className="ml-4">
            <Text className="text-black text-lg font-semibold">Sitio</Text>
            <Text className="text-gray-500 text-sm">$60 - 20/01/2025</Text>
          </View>
        </View>
        <View className="flex-row items-center py-2">
          <View className="w-10 h-10 bg-gray-200 rounded-full flex justify-center items-center">
            {/*<Image source={require('../assets/images/location.png')} className="w-6 h-6" />*/}
          </View>
          <View className="ml-4">
            <Text className="text-black text-lg font-semibold">Parque - Club</Text>
            <Text className="text-gray-500 text-sm">$100 - 19/01/2025</Text>
          </View>
        </View>
      </View>
      
      {/* Botón de acción */}
      <TouchableOpacity className="bg-yellow-500 rounded-xl mt-6 py-3 mx-6">
        <Text className="text-white text-center text-2xl font-normal">CONECTARSE</Text>
      </TouchableOpacity>
    </View>
  );
}