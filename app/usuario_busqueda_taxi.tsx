import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

const UsuarioSeleccionDestino = () => {
  return (
    <View className="flex-1 bg-white rounded-3xl overflow-hidden">
      {/* Encabezado */}
      <View className="w-full h-40 bg-yellow-500 flex justify-center items-center">
        <Text className="text-white text-2xl font-bold">BUSCANDO</Text>
      </View>

      {/* Foto de perfil */}
      <View className="absolute top-10 right-6">
        <Image source={require('../assets/images/profile.svg')} className="w-24 h-24 rounded-full" />
      </View>



      {/* Línea separadora */}
      <View className="border-t border-gray-300 absolute bottom-28 left-10 w-80" />

      {/* Botón de Solicitar */}
      <TouchableOpacity className="bg-yellow-500 rounded-xl mt-6 py-3 mx-6 absolute bottom-10 w-80 self-center">
        <Text className="text-white text-center text-2xl font-normal">SOLICITAR</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UsuarioSeleccionDestino;