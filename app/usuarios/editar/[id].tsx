// app/usuarios/editar.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
;

export default function EditarUsuario() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    const cargarDatos = async () => {
      if (!id) return;
      const docRef = doc(db, 'users', id as string);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setForm(snap.data());
      } else {
        Alert.alert('Error', 'Usuario no encontrado');
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
      const docRef = doc(db, 'users', id as string);
      await updateDoc(docRef, form);
      Alert.alert('Actualizado', 'Usuario actualizado con éxito');
      router.replace('/usuarios');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar');
      console.error(error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 py-8 items-center">
      <Text className="text-2xl font-bold text-center mb-6">Editar Usuario</Text>

      <View className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <View>
          <Text className="text-gray-700 mb-1">Nombre</Text>
          <TextInput
            value={form.displayName}
            onChangeText={(value) => handleChange('displayName', value)}
            className="border rounded px-4 py-2"
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-1">Correo Electrónico</Text>
          <TextInput
            value={form.email}
            onChangeText={(value) => handleChange('email', value)}
            className="border rounded px-4 py-2"
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-1">Teléfono</Text>
          <TextInput
            value={form.telefono}
            onChangeText={(value) => handleChange('telefono', value)}
            className="border rounded px-4 py-2"
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-1">Tipo de Usuario</Text>
          <View className="border rounded overflow-hidden">
            <Picker
              selectedValue={form.role}
              onValueChange={(value) => handleChange('role', value)}
            >
              <Picker.Item label="Pasajero" value="pasajero" />
              <Picker.Item label="Conductor" value="conductor" />
            </Picker>
          </View>
        </View>

        {form.role === 'pasajero' && (
          <View>
            <Text className="text-gray-700 mb-1">Método de Pago</Text>
            <View className="border rounded overflow-hidden">
              <Picker
                selectedValue={form.metodo_pago_predeterminado}
                onValueChange={(value) => handleChange('metodo_pago_predeterminado', value)}
              >
                <Picker.Item label="Efectivo" value="efectivo" />
                <Picker.Item label="Tarjeta" value="tarjeta" />
                <Picker.Item label="Paypal" value="paypal" />
              </Picker>
            </View>
          </View>
        )}

        {form.role === 'conductor' && (
          <>
            <View>
              <Text className="text-gray-700 mb-1">Licencia</Text>
              <TextInput
                value={form.licencia_conducir}
                onChangeText={(value) => handleChange('licencia_conducir', value)}
                className="border rounded px-4 py-2"
              />
            </View>
            <View>
              <Text className="text-gray-700 mb-1">Expiración Licencia</Text>
              <TextInput
                value={form.expiracion_licencia}
                onChangeText={(value) => handleChange('expiracion_licencia', value)}
                className="border rounded px-4 py-2"
              />
            </View>
            <View>
              <Text className="text-gray-700 mb-1">Verificación de Antecedentes</Text>
              <View className="border rounded overflow-hidden">
                <Picker
                  selectedValue={form.verificacion_antecedentes}
                  onValueChange={(value) => handleChange('verificacion_antecedentes', value)}
                >
                  <Picker.Item label="Verificado" value="Verificado" />
                  <Picker.Item label="Pendiente" value="Pendiente" />
                </Picker>
              </View>
            </View>
          </>
        )}

        <View>
          <Text className="text-gray-700 mb-1">Estado</Text>
          <View className="border rounded overflow-hidden">
            <Picker
              selectedValue={form.estado}
              onValueChange={(value) => handleChange('estado', value)}
            >
              <Picker.Item label="Activo" value="Activo" />
              <Picker.Item label="Inactivo" value="Inactivo" />
            </Picker>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="mt-6 py-3 rounded-lg w-full max-w-3xl bg-yellow-500"
        onPress={handleUpdate}
      >
        <Text className="text-white text-center font-semibold text-base">
          Guardar Cambios
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
