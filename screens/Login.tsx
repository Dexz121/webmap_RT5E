import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { signInWithGoogle } from '../firebase';
import { Link, useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const { user } = await signInWithGoogle();
      Alert.alert("Inicio de Sesión Exitoso", `Bienvenido, ${user.displayName}`);
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "No se pudo iniciar sesión con Google");
    }
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-gray-100 px-4">
      <View className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <Text className="text-2xl font-bold mb-8 text-center">Iniciar Sesión</Text>

        <TextInput
          placeholder="Correo electrónico"
          className="w-full bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300"
        />

        <TextInput
          placeholder="Contraseña"
          secureTextEntry
          className="w-full bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300"
        />

        <TouchableOpacity className="w-full bg-blue-500 py-3 rounded-lg mb-4">
          <Text className="text-center text-white font-semibold">Iniciar Sesión</Text>
        </TouchableOpacity>

        <Text className="text-gray-500 mb-4 text-center">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="text-blue-500">
            Regístrate
          </Link>
        </Text>

        <View className="flex-row items-center mb-4">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500">O</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        <TouchableOpacity
          className="w-full bg-red-500 py-3 rounded-lg mb-2"
          onPress={handleGoogleSignIn}
        >
          <Text className="text-center text-white font-semibold">Continuar con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity className="w-full bg-blue-700 py-3 rounded-lg">
          <Text className="text-center text-white font-semibold">Continuar con Facebook</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
