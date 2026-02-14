//app/register.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, registerNewUser } from '../firebase';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

interface RegisterScreenProps {
  onSuccess?: () => void;
}

export default function RegisterScreen({ onSuccess }: RegisterScreenProps = {}) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: '',
     expoPushToken: '',
    // Campos ocultos (no se muestran en el formulario)
    role: 'pasajero',
    metodo_pago_predeterminado: 'efectivo',
    estado: 'activo',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) <= 0)
      newErrors.age = 'Ingresa una edad válida.';
    if (!formData.gender) newErrors.gender = 'Selecciona un género.';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio.';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido.';
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres.';
    }
    if (!formData.confirmPassword || formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await registerNewUser({
        uid: user.uid,
        email: user.email,
        displayName: formData.name,
        age: formData.age,
        gender: formData.gender,
        telefono: formData.telefono,
        role: formData.role,
        estado: formData.estado,
        metodo_pago_predeterminado: formData.metodo_pago_predeterminado,
      });

      Alert.alert('Éxito', 'Usuario registrado exitosamente');
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el usuario');
      console.error(error);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 px-4">
      <View className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <Text className="text-2xl font-bold mb-8 text-center">Registro de Usuario</Text>

        {/* Nombre */}
        <TextInput
          placeholder="Nombre"
          className="w-full bg-gray-100 p-4 rounded-lg mb-2 border border-gray-300"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
        {errors.name && <Text className="text-red-500 text-sm mb-2">{errors.name}</Text>}

        {/* Edad */}
        <TextInput
          placeholder="Edad"
          keyboardType="numeric"
          className="w-full bg-gray-100 p-4 rounded-lg mb-2 border border-gray-300"
          value={formData.age}
          onChangeText={(text) => setFormData({ ...formData, age: text })}
        />
        {errors.age && <Text className="text-red-500 text-sm mb-2">{errors.age}</Text>}

        {/* Género */}
        <View className="w-full bg-gray-100 rounded-lg mb-2 border border-gray-300">
          <Picker
            selectedValue={formData.gender}
            onValueChange={(val) => setFormData({ ...formData, gender: val })}
          >
            <Picker.Item label="Selecciona tu género" value="" />
            <Picker.Item label="Masculino" value="Masculino" />
            <Picker.Item label="Femenino" value="Femenino" />
            <Picker.Item label="No binario" value="No binario" />
            <Picker.Item label="Prefiero no decirlo" value="Prefiero no decirlo" />
          </Picker>
        </View>
        {errors.gender && <Text className="text-red-500 text-sm mb-2">{errors.gender}</Text>}

        {/* Teléfono */}
        <TextInput
          placeholder="Teléfono"
          keyboardType="phone-pad"
          className="w-full bg-gray-100 p-4 rounded-lg mb-2 border border-gray-300"
          value={formData.telefono}
          onChangeText={(text) => setFormData({ ...formData, telefono: text })}
        />
        {errors.telefono && <Text className="text-red-500 text-sm mb-2">{errors.telefono}</Text>}

        {/* Email */}
        <TextInput
          placeholder="Correo"
          keyboardType="email-address"
          className="w-full bg-gray-100 p-4 rounded-lg mb-2 border border-gray-300"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
        />
        {errors.email && <Text className="text-red-500 text-sm mb-2">{errors.email}</Text>}

        {/* Contraseña */}
        <TextInput
          placeholder="Contraseña"
          secureTextEntry
          className="w-full bg-gray-100 p-4 rounded-lg mb-2 border border-gray-300"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
        />
        {errors.password && <Text className="text-red-500 text-sm mb-2">{errors.password}</Text>}

        {/* Confirmar contraseña */}
        <TextInput
          placeholder="Confirmar Contraseña"
          secureTextEntry
          className="w-full bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
        />
        {errors.confirmPassword && <Text className="text-red-500 text-sm mb-2">{errors.confirmPassword}</Text>}

        {/* Botón */}
        <TouchableOpacity className="w-full bg-blue-500 py-3 rounded-lg" onPress={handleRegister}>
          <Text className="text-center text-white font-semibold">Registrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
