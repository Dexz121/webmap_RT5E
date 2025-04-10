import React, { useEffect, useState } from "react";
import { SafeAreaView, Text } from "react-native";
import { Provider, useDispatch } from "react-redux";
import { store } from "../store";
import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth, getUserInfo } from "../firebase"; // importar getUserInfo
import { setUser, clearUser } from "../slices/userSlice";
import 'mapbox-gl/dist/mapbox-gl.css';
import "../global.css";

// Creamos un wrapper para poder usar hooks dentro del Provider
function AuthWrapper({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log("Usuario logueado:", user.email);

          const userData = await getUserInfo(user.uid);
          if (userData && userData.role !== undefined) {
            dispatch(setUser({
              user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
              },
              role: userData.role,
            }));
          } else {
            console.warn("El usuario no tiene rol definido en Firestore.");
            dispatch(clearUser());
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
          dispatch(clearUser());
        }
      } else {
        console.log("Usuario no está logueado");
        dispatch(clearUser());
        router.replace("/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <Text style={{ marginTop: 50, textAlign: "center" }}>Cargando usuario...</Text>;
  }

  return children;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaView className="flex-1 bg-white">
        <AuthWrapper>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: "#6200ea" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontSize: 18, fontWeight: "bold" },
            }}
          />
        </AuthWrapper>
      </SafeAreaView>
    </Provider>
  );
}
