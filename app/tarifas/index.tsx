// app/tarifas/ajustar.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Timestamp } from 'firebase/firestore';

export default function AjustarTarifaScreen() {
  const [precioBase, setPrecioBase] = useState('');
  const [multiplicador, setMultiplicador] = useState('1');
  const [guardando, setGuardando] = useState(false);

  const calcularTotal = () => {
    const base = parseFloat(precioBase);
    const multi = parseFloat(multiplicador);
    if (isNaN(base) || isNaN(multi)) return '0.00';
    return (base * multi).toFixed(2);
  };

  const handleGuardar = async () => {
    const base = parseFloat(precioBase);
    const multi = parseFloat(multiplicador);
    if (isNaN(base) || isNaN(multi)) {
      Alert.alert('Error', 'Ingrese valores numéricos válidos.');
      return;
    }

    setGuardando(true);
    try {
      const ref = doc(db, 'Tarifa', 'tarifa_activa');
      await setDoc(ref, {
        precio_base: base,
        multiplicador_servicio: multi,
        tarifa_total: base * multi,
        fecha_modificacion: Timestamp.now(),
      });
      Alert.alert('Guardado', 'Tarifa actualizada correctamente');
    } catch (error) {
      console.error('Error al guardar tarifa:', error);
      Alert.alert('Error', 'No se pudo guardar la tarifa.');
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    const cargarTarifa = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'Tarifa'));
        const docData = snapshot.docs.find((d) => d.id === 'tarifa_activa');
        if (docData?.exists()) {
          const data = docData.data();
          setPrecioBase(data.precio_base.toString());
          setMultiplicador(data.multiplicador_servicio.toString());
        }
      } catch (e) {
        console.error('Error al cargar tarifa:', e);
      }
    };
    cargarTarifa();
  }, []);

  return (
    <ScrollView className="flex-1 bg-white px-6 py-8 items-center">
      <Text className="text-2xl font-bold text-black mb-6">Ajustar Tarifa</Text>

      <View className="w-full max-w-2xl space-y-4">
        <View>
          <Text className="text-black mb-1">Precio base ($)</Text>
          <TextInput
            keyboardType="numeric"
            value={precioBase}
            onChangeText={setPrecioBase}
            className="border border-gray-300 rounded-md px-4 py-2 text-black"
            placeholder="Ej. 50"
          />
        </View>

        <View>
          <Text className="text-black mb-1">Multiplicador de servicio</Text>
          <TextInput
            keyboardType="numeric"
            value={multiplicador}
            onChangeText={setMultiplicador}
            className="border border-gray-300 rounded-md px-4 py-2 text-black"
            placeholder="Ej. 1.2"
          />
        </View>

        <View>
          <Text className="text-black mb-1">Tarifa total calculada</Text>
          <Text className="text-xl font-bold text-green-700">
            ${calcularTotal()}
          </Text>
        </View>

        <TouchableOpacity
          className={`mt-6 py-3 rounded-lg ${
            guardando ? 'bg-gray-400' : 'bg-yellow-500'
          }`}
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