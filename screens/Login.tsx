// screens/Login.tsx
import { auth } from '@/firebase';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RegisterScreen from './Register';

export default function LoginScreen() {
  const { signInWithGoogle, loading: gLoading, error: gError } = useGoogleAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isRegistering) return <RegisterScreen onBack={() => setIsRegistering(false)} />;

  const onEmailLogin = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged en _layout.tsx hará el resto
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="w-11/12 bg-white p-6 rounded-lg shadow-lg">
        <Text className="text-2xl font-bold mb-8 text-center">Iniciar Sesión</Text>

        <TextInput
          placeholder="Correo electrónico"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          className="w-full bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300"
        />

        <TextInput
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="w-full bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300"
        />

        <TouchableOpacity
          className="w-full bg-blue-500 py-3 rounded-lg mb-4"
          onPress={onEmailLogin}
          disabled={loading}
        >
          <Text className="text-center text-white font-semibold">
            {loading ? 'Ingresando…' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>

        <Text className="text-gray-500 mb-4 text-center">
          ¿No tienes una cuenta?{' '}
          <Text onPress={() => setIsRegistering(true)} className="text-blue-500 font-semibold">
            Regístrate
          </Text>
        </Text>

        <View className="flex-row items-center mb-4">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500">O</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        <TouchableOpacity
          className="w-full bg-red-500 py-3 rounded-lg mb-2"
          onPress={signInWithGoogle}
          disabled={gLoading}
        >
          <Text className="text-center text-white font-semibold">
            {gLoading ? 'Conectando…' : 'Continuar con Google'}
          </Text>
        </TouchableOpacity>

        {gError && <Text className="mt-4 text-red-500">{gError.message}</Text>}
      </View>
    </View>

  );
}
