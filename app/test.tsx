// app/index.tsx
import { useEffect, useState } from "react";
import { Platform, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const [mostrarInicio, setMostrarInicio] = useState(true);

  const continuar = () => {
    const plataforma = Platform.OS;
    if (Platform.OS !== "web") {
      router.replace("/mobile/home");
    }
  };

  if (mostrarInicio) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-4">
        <Text className="text-2xl font-bold mb-4">Bienvenido a Radio Taxis 5 Estrellas</Text>
        <Text className="text-gray-600 mb-6 text-center">
          Servicio rápido, seguro y confiable. Presiona continuar para empezar.
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={continuar}
        >
          <Text className="text-white font-semibold text-lg">Continuar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null; // fallback por si expandes lógica después
}
