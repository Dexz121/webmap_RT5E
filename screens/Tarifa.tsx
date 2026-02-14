// screens/Tarifa.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { getTarifas, setTarifas } from '@/firebase';

export default function Tarifa() {
  const [precioBase, setPrecioBase] = useState('');
  const [multiplicador, setMultiplicador] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarTarifas = async () => {
      const tarifas = await getTarifas();
      if (tarifas) {
        setPrecioBase(tarifas.precio_base.toString());
        setMultiplicador(tarifas.tarifa_km.toString());
      }
    };
    cargarTarifas();
  }, []);

  const handleGuardar = async () => {
    if (!precioBase || !multiplicador) {
      Alert.alert('Error', 'Completa ambos campos.');
      return;
    }

    setGuardando(true);
    try {
      await setTarifas({
        precio_base: parseFloat(precioBase),
        tarifa_km: parseFloat(multiplicador),
      });
      Alert.alert('✅ Guardado', 'Tarifas actualizadas correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la tarifa');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, alignItems: 'center' }}
    >
      <Text className="text-2xl font-bold text-black mb-6">Ajustar Tarifa</Text>

      <View className="w-full space-y-4" style={{ width: '100%', maxWidth: '100%' }}>
        <View>
          <Text className="text-black mb-1">Banderazo ($)</Text>
          <TextInput
            keyboardType="numeric"
            value={precioBase}
            onChangeText={setPrecioBase}
            className="border border-gray-300 rounded-md px-4 py-2 text-black"
            placeholder="Ej. 30"
          />
        </View>

        <View>
          <Text className="text-black mb-1">Costo por km</Text>
          <TextInput
            keyboardType="numeric"
            value={multiplicador}
            onChangeText={setMultiplicador}
            className="border border-gray-300 rounded-md px-4 py-2 text-black"
            placeholder="Ej. 10"
          />
        </View>

        <TouchableOpacity
          className={`mt-6 py-3 rounded-lg ${guardando ? 'bg-gray-400' : 'bg-yellow-500'}`}
          onPress={handleGuardar}
          disabled={guardando}
        >
          <Text className="text-white text-center font-semibold text-base">
            {guardando ? 'Guardando...' : 'Guardar Tarifa'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
