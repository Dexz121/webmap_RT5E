import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, registerNewUser } from '../firebase';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio.';
    }

    // Validar edad
    if (!formData.age) {
      newErrors.age = 'La edad es obligatoria.';
    } else if (isNaN(formData.age) || formData.age <= 0) {
      newErrors.age = 'Ingresa una edad válida.';
    }

    // Validar género
    if (!formData.gender) {
      newErrors.gender = 'Por favor selecciona un género válido.';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido.';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmación de la contraseña es obligatoria.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setErrors(newErrors);

    // Si no hay errores, el formulario es válido
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Registrar al usuario con Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Guardar información adicional en Firestore
      await registerNewUser({
        uid: user.uid,
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        email: user.email,
      });

      Alert.alert('Éxito', 'Usuario registrado exitosamente');
      router.push('/');
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el usuario');
      console.error(error);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 px-4">
      <View className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <Text className="text-2xl font-bold mb-8 text-center">Registro de Usuario</Text>

        {/* Input para Nombre */}
        <TextInput
          placeholder="Nombre"
          className="w-full bg-gray-100 p-4 rounded-lg mb-2 border border-gray-300"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
        {errors.name && <Text className="text-red-500 text-sm mb-4">{errors.name}</Text>}

        {/* Input para Edad */}
        <TextInput
          placeholder="Edad"
          className="w-full bg-gray-100 p-4 rounded-lg mb-2 border border-gray-300"
          keyboardType="numeric"
          value={formData.age}
          onChangeText={(text) => setFormData({ ...formData, age: text })}
        />
        {errors.age && <Text className="text-red-500 text-sm mb-4">{errors.age}</Text>}

        {/* Lista desplegable para Género */}
        <View className="w-full bg-gray-100 rounded-lg mb-2 border border-gray-300">
          <Picker
            selectedValue={formData.gender}
            onValueChange={(itemValue) => setFormData({ ...formData, gender: itemValue })}
          >
            <Picker.Item label="Selecciona tu género" value="" />
            <Picker.Item label="Masculino" value="Masculino" />
            <Picker.Item label="Femenino" value="Femenino" />
            <Picker.Item label="No binario" value="No binario" />
            <Picker.Item label="Prefiero no decirlo" value="Prefiero no decirlo" />
          </Picker>
        </View>
        {errors.gender && <Text className="text-red-500 text-sm mb-4">{errors.gender}</Text>}

        {/* Input para Correo */}
        <TextInput
          placeholder="Correo"
          className="w-full bg-gray-100 p-4 rounded-lg mb-2 border border-gray-300"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
        />
        {errors.email && <Text className="text-red-500 text-sm mb-4">{errors.email}</Text>}

        {/* Input para Contraseña */}
        <TextInput
          placeholder="Contraseña"
          className="w-full bg-gray-100 p-4 rounded-lg mb-2 border border-gray-300"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
        />
        {errors.password && <Text className="text-red-500 text-sm mb-4">{errors.password}</Text>}

        {/* Input para Confirmar Contraseña */}
        <TextInput
          placeholder="Confirmar Contraseña"
          className="w-full bg-gray-100 p-4 rounded-lg mb-2 border border-gray-300"
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
        />
        {errors.confirmPassword && <Text className="text-red-500 text-sm mb-4">{errors.confirmPassword}</Text>}

        {/* Botón de Registro */}
        <TouchableOpacity
          className="w-full bg-blue-500 py-3 rounded-lg"
          onPress={handleRegister}
        >
          <Text className="text-center text-white font-semibold">Registrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
