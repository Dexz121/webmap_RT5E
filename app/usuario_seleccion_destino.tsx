import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from 'expo-router';

const UsuarioSeleccionDestino = () => {
  const { tipo } = useLocalSearchParams(); 
  const router = useRouter();

  return (
    <View className="flex-1 bg-white rounded-3xl overflow-hidden">
      {/* Barra Superior */}
      <View className="w-full h-40 bg-[#8DA508] flex justify-center items-center px-6 flex-row">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-6 top-6 w-10 h-10 bg-[#e60c0c] rounded-md justify-center items-center shadow"
        >
          <Text className="text-white text-lg">{'<'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold text-center">SELECCIONA TU DESTINO</Text>
        {/* Icono al lado del título }
        <Image
          source={require('../../assets/images/pin.png')} // reemplázalo si usas otro icono
          className="w-5 h-5 ml-2"
          resizeMode="contain"
        />{*/}
      </View>

      {/* Información del viaje */}
      <View className="px-6 mt-10">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <Image
              source={{ uri: 'https://placehold.co/64x62' }}
              className="w-[64px] h-[62px] rounded mr-4"
            />
            <Text className="text-black text-2xl font-normal">
              {tipo === 'paqueteria' ? 'Paquetería' : 'Viaje'}
            </Text>
          </View>
          <Text className="text-black text-2xl font-normal">$48</Text>
        </View>

        {/* Línea separadora */}
        <View className="border-t border-gray-300 my-2" />

        {/* Método de pago */}
        <Text className="text-black text-2xl text-center mt-4">EFECTIVO</Text>
      </View>

      {/* Botón de Solicitar */}
      <TouchableOpacity
        onPress={() => console.log("Solicitar", tipo)}
        className="bg-[#C8BB32] rounded-xl py-3 px-10 mt-10 mx-6 absolute bottom-10 w-80 self-center"
      >
        <Text className="text-white text-center text-2xl font-normal">SOLICITAR</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UsuarioSeleccionDestino;
