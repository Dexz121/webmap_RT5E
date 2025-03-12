import { Stack } from "expo-router";
import "../global.css";
import 'mapbox-gl/dist/mapbox-gl.css';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#6200ea" }, // Color de fondo del header
        headerTintColor: "#fff", // Color del texto
        headerTitleStyle: { fontSize: 18, fontWeight: "bold" }, // Estilo del título
      }}
    />
  );
}
