// Este es un archivo base de edición. En los siguientes pasos crearé:
// 1. El componente Editar.tsx
// 2. Lógica para cargar datos al seleccionar un vehículo
// 3. Botón "Editar" visible solo si hay selección

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

export default function EditarVehiculo() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    const cargarDatos = async () => {
      if (!id) return;
      const docRef = doc(db, 'Vehiculo', id as string);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setForm(snap.data());
      } else {
        Alert.alert('Error', 'Vehículo no encontrado');
        router.back();
      }
      setLoading(false);
    };
    cargarDatos();
  }, [id]);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, 'Vehiculo', id as string);
      await updateDoc(docRef, form);
      Alert.alert('Actualizado', 'Vehículo actualizado con éxito');
      router.replace('/vehiculos');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="gray" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-6 py-8 items-center bg-white">
      <Text className="text-2xl font-bold text-center mb-6">Editar Vehículo</Text>
      <View className="w-[960px] flex flex-wrap flex-row gap-4">
        {[['marca', 'Marca'], ['modelo', 'Modelo'], ['ano', 'Año'], ['color', 'Color'], ['placas', 'Placa'], ['numero_economico', 'Número Económico']].map(([campo, label]) => (
          <View key={campo} className="w-[47%] mb-4">
            <Text className="text-gray-700 mb-1">
              {label} <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={form[campo]}
              onChangeText={(value) => handleChange(campo, value)}
              className="border border-gray-300 rounded-md px-4 py-2"
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleUpdate}
        className="bg-yellow-500 py-3 rounded-md mt-6 w-[960px]"
      >
        <Text className="text-white text-center font-semibold text-base">
          Guardar Cambios
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
