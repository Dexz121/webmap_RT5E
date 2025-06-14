// app/components/vehiculos/VehiculoForm.tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface VehiculoFormProps {
  form: any;
  onChange: (key: string, value: string) => void;
  onSubmit: () => void;
  errorMsg?: string;
  submitting?: boolean;
  isEditMode?: boolean;
}

const camposObligatorios = [
  { key: 'marca', label: 'Marca' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'ano', label: 'Año' },
  { key: 'color', label: 'Color' },
  { key: 'placas', label: 'Placa' },
  { key: 'numero_economico', label: 'Número Económico' },
];

export function VehiculoForm({
  form,
  onChange,
  onSubmit,
  errorMsg,
  submitting,
  isEditMode = false,
}: VehiculoFormProps) {
  return (
    <ScrollView className="flex-1 bg-white px-6 py-8 items-center">
      <Text className="text-2xl font-bold text-center mb-6 text-black">
        {isEditMode ? 'Editar Vehículo' : 'Agregar Vehículo'}
      </Text>

      {errorMsg !== '' && (
        <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full max-w-4xl">
          <Text className="text-red-800 whitespace-pre-line">{errorMsg}</Text>
          <TouchableOpacity
            className="mt-2"
            onPress={() => onChange('errorMsg', '')}
          >
            <Text className="text-sm text-red-600 underline">Cerrar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="w-full max-w-4xl flex-row flex-wrap justify-between gap-4">
        <View className="w-full md:w-[48%]">
          <Text className="text-gray-700 mb-1 text-black">ID del Conductor</Text>
          <TextInput
            value={form.id_conductor || '1'}
            editable={false}
            className="border border-gray-300 rounded-md px-4 py-2 bg-gray-100 text-black"
          />
        </View>

        {camposObligatorios.map(({ key, label }) => (
          <View key={key} className="w-full md:w-[48%]">
            <Text className="text-gray-700 mb-1 text-black">{label} *</Text>
            <TextInput
              value={form[key] || ''}
              onChangeText={(value) => onChange(key, value)}
              className="border border-gray-300 rounded-md px-4 py-2 text-black"
              placeholderTextColor="#888"
            />
          </View>
        ))}

        <View className="w-full md:w-[48%]">
          <Text className="text-gray-700 mb-1 text-black">Fecha de Adquisición</Text>
          <TextInput
            value={form.fecha_adquisicion || ''}
            onChangeText={(value) => onChange('fecha_adquisicion', value)}
            className="border border-gray-300 rounded-md px-4 py-2 text-black"
            placeholder="dd/mm/aaaa"
            placeholderTextColor="#888"
            inputMode={Platform.OS === 'web' ? 'text' : 'numeric'}
          />
        </View>

        <View className="w-full md:w-[48%]">
          <Text className="text-gray-700 mb-1 text-black">Estado</Text>
          <View className="border border-gray-300 rounded-md">
            <Picker
              selectedValue={form.estado || 'activo'}
              onValueChange={(itemValue) => onChange('estado', itemValue)}
            >
              <Picker.Item label="Activo" value="activo" />
              <Picker.Item label="Desactivado" value="desactivado" />
            </Picker>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={onSubmit}
        className="bg-yellow-500 py-3 px-6 rounded-md mt-6 w-full max-w-4xl"
      >
        <Text className="text-white text-center font-semibold text-base">
          {submitting ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Guardar Vehículo'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
