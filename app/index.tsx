import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
        Bienvenido a la app 🚖
      </Text>
      <Button title="Ir a Mapa" onPress={() => router.push("/map")} />
      <Button title="Ir a test" onPress={() => router.push("/test")} />
      <Button title="Ir a testUbicacion" onPress={() => router.push("/testUbicacion")} />
      <Button title="Ir a testUbicacionContinua" onPress={() => router.push("/testUbicacionContinua")} />
    </View>
  );
}
