// app/auth/_layout.tsx
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, getUserInfo } from "@/firebase";

import { store } from "../../store";

import { Provider, useDispatch } from "react-redux";
import { setUser, clearUser } from "@/slices/userSlice";
import { SafeAreaView, Text } from "react-native";


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

export default function AuthLayout() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await getUserInfo(user.uid);
        dispatch(setUser({ user, role: userData?.role || null }));
      } else {
        dispatch(clearUser());
        router.replace("/"); // vuelve al layout público
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Text style={{ marginTop: 50, textAlign: "center" }}>Verificando sesión...</Text>;
  }

  return (
      <Provider store={store}>
        <SafeAreaView className="flex-1 bg-white">
          <AuthWrapper>
            <Stack />
          </AuthWrapper>
        </SafeAreaView>
      </Provider>
  );
}