// app/usuarios/agregar.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { router } from 'expo-router';

const etiquetasCampos: Record<string, string> = {
  displayName: 'Nombre',
  email: 'Correo Electrónico',
  telefono: 'Teléfono'
};

export default function AgregarUsuario() {
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    telefono: '',
    role: 'pasajero',
    estado: 'Activo',
    metodo_pago_predeterminado: 'efectivo',
    licencia_conducir: '',
    expiracion_licencia: '',
    verificacion_antecedentes: 'Verificado'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const camposRequeridos = ['displayName', 'email', 'telefono'];

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    const camposFaltantes = camposRequeridos.filter(
      (campo) => !form[campo] || form[campo].trim() === ''
    );

    if (camposFaltantes.length > 0) {
      const mensaje = `Por favor completa los siguientes campos:\n\n${camposFaltantes
        .map((c) => `- ${etiquetasCampos[c] || c}`)
        .join('\n')}`;
      setErrorMsg(mensaje);
      return;
    }

    try {
      await addDoc(collection(db, 'users'), {
        ...form,
        fecha_creacion: Timestamp.now(),
        fecha_eliminacion: null
      });
      Alert.alert('Éxito', 'Usuario registrado con éxito');
      router.replace('/usuarios');
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'No se pudo guardar el usuario.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 py-8 items-center">
      <Text className="text-2xl font-bold text-center mb-6">Agregar Usuario</Text>

      {errorMsg !== '' && (
        <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 max-w-2xl w-full">
          <Text className="text-red-800 whitespace-pre-line">{errorMsg}</Text>
          <TouchableOpacity onPress={() => setErrorMsg('')}>
            <Text className="text-sm text-red-600 underline mt-2">Cerrar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <View>
          <Text className="text-gray-700 mb-1">
            Nombre <Text className="text-red-500 font-bold">*</Text>
          </Text>
          <TextInput
            value={form.displayName}
            onChangeText={(value) => handleChange('displayName', value)}
            className="border rounded px-4 py-2"
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-1">
            Correo Electrónico <Text className="text-red-500 font-bold">*</Text>
          </Text>
          <TextInput
            value={form.email}
            onChangeText={(value) => handleChange('email', value)}
            className="border rounded px-4 py-2"
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-1">
            Teléfono <Text className="text-red-500 font-bold">*</Text>
          </Text>
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
        onPress={handleSubmit}
      >
        <Text className="text-white text-center font-semibold text-base">
          Guardar Usuario
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
