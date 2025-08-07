// screens/pagos.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Pago {
  id: string;
  id_viaje: string;
  monto: number;
  metodo: string;
  estado: string;
  fecha_creacion: any;
}

export default function PagosIndex() {
  const [pagos, setPagos] = useState<Pago[]>([]);

  const fetchPagos = async () => {
    const snapshot = await getDocs(collection(db, 'Pago'));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Pago));
    setPagos(data);
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  return (
    <ScrollView
      className="bg-white"
      contentContainerStyle={{ alignItems: 'center', padding: 16 }}
    >

      <Text className="text-2xl font-bold text-center mb-6">Pagos Registrados</Text>

      <View className="border-t border-gray-300 w-[900px]">
        <View className="flex-row py-2 border-b border-gray-200">
          {['ID', 'ID Viaje', 'Monto', 'Método', 'Estado', 'Fecha'].map((header) => (
            <Text
              key={header}
              className="flex-1 font-bold text-black text-sm text-center truncate"
            >
              {header}
            </Text>
          ))}
        </View>

        {pagos.map((pago) => (
          <View key={pago.id} className="flex-row border-b border-gray-100 py-2">
            <Text className="flex-1 text-center text-gray-700 text-sm truncate">{pago.id}</Text>
            <Text className="flex-1 text-center text-gray-700 text-sm truncate">{pago.id_viaje}</Text>
            <Text className="flex-1 text-center text-gray-700 text-sm truncate">${pago.monto}</Text>
            <Text className="flex-1 text-center text-gray-700 text-sm truncate">{pago.metodo}</Text>
            <Text className="flex-1 text-center text-gray-700 text-sm truncate">{pago.estado}</Text>
            <Text className="flex-1 text-center text-gray-700 text-sm truncate">
              {pago.fecha_creacion?.toDate ? pago.fecha_creacion.toDate().toLocaleString() : ''}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
