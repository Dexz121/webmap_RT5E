// app/_layout.tsx
import React, { useEffect, useState } from "react";
import { SafeAreaView, Text } from "react-native";
import { Provider, useDispatch } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth, getUserInfo } from "@/firebase";
import { setUser, clearUser, setLoading  } from "../slices/userSlice";
import 'mapbox-gl/dist/mapbox-gl.css';
import "@/global.css";
import { store } from "../store";

function AuthWrapper({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    dispatch(setLoading(true));
    console.log("👀 Verificando usuario con Firebase...");

    try {
      if (user) {
        console.log("✅ Usuario autenticado:", user.email);

        const userData = await getUserInfo(user.uid);
        console.log("📄 Datos en Firestore:", userData);

        if (userData && userData.role !== undefined) {
          dispatch(setUser({
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
            },
            role: userData.role,
          }));
          console.log("🧠 Rol asignado:", userData.role);
        } else {
          console.warn("⚠️ El usuario no tiene rol definido. Limpiando estado.");
          dispatch(clearUser());
        }
      } else {
        console.log("🚫 No hay usuario autenticado.");
        dispatch(clearUser());
      }
    } catch (error) {
      console.error("❌ Error al verificar usuario:", error);
      dispatch(clearUser());
    } finally {
      dispatch(setLoading(false)); // ✅ importante para terminar la carga
    }
  });

  return () => unsubscribe();
}, []);


  return children;
}

export default function PublicLayout() {
  return (
    <Provider store={store}>
      <SafeAreaView className="flex-1 bg-white">
        <AuthWrapper>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: "#ffffff" },
                headerTitleStyle: { fontWeight: "bold" },
                headerTintColor: "#000",
              }}
            />
          </GestureHandlerRootView>
        </AuthWrapper>
      </SafeAreaView>
    </Provider>
  );
}
