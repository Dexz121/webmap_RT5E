// app/index.tsx
import { useEffect } from "react";
import { Platform, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectIsLoading } from "../slices/userSlice";

export default function Index() {
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  console.log("🌀 Renderizando Index.tsx");
  console.log("📦 isLoading:", isLoading);
  console.log("✅ isAuthenticated:", isAuthenticated);
  console.log("🧭 Platform:", Platform.OS);

  useEffect(() => {
    console.log("🎯 Entró al useEffect");

    if (Platform.OS !== "web") {
      console.log("🚀 Redirigiendo a /mobile/home");
      router.replace("/mobile/home");
    } else {
      console.log("⏳ Aún no se redirige: esperando condiciones");
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View className="flex-1 justify-center items-center bg-white px-4">
      <Text className="text-2xl font-bold mb-4">Bienvenido a Radio Taxis 5 Estrellas</Text>
      <Text className="text-gray-600 mb-6 text-center">
        Servicio rápido, seguro y confiable. Presiona continuar para empezar.
      </Text>
      <Text className="text-white font-semibold text-lg">Continuar</Text>
    </View>
  );
}
