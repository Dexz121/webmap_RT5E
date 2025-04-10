import React, { useEffect, useState } from "react";
import { Slot, useRouter } from "expo-router";
import { Stack } from "expo-router";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth"
import 'mapbox-gl/dist/mapbox-gl.css';
import "../global.css";

export default function RootLayout() {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Usuario logueado:", user.email);
        setIsLoggedIn(true);
      } else {
        console.log("Usuario no está logueado");
        setIsLoggedIn(false);
        router.replace("/login");
      }
    });
  
    // Limpieza al desmontar el componente
    return () => unsubscribe();
  }, []);
  
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
