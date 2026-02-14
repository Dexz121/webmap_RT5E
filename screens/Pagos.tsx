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

      <View className="w-full" style={{ width: '100%' }}>
        <View style={{ width: '100%' }}>
          <View className="border-t border-gray-300" style={{ width: '100%' }}>
              <View className="flex-row py-2 border-b border-gray-200" style={{ width: '100%' }}>
                {['ID', 'ID Viaje', 'Monto', 'Método', 'Estado', 'Fecha'].map((header) => (
                  <Text
                    key={header}
                    className="font-bold text-black text-sm text-center truncate"
                    style={{ flex: 1, minWidth: 120, textAlign: 'center' }}
                  >
                    {header}
                  </Text>
                ))}
              </View>

              {pagos.map((pago) => (
                <View key={pago.id} className="flex-row border-b border-gray-100 py-2" style={{ width: '100%' }}>
                  <Text 
                    className="text-center text-gray-700 text-sm truncate"
                    style={{ flex: 1, minWidth: 120, textAlign: 'center' }}
                  >
                    {pago.id}
                  </Text>
                  <Text 
                    className="text-center text-gray-700 text-sm truncate"
                    style={{ flex: 1, minWidth: 120, textAlign: 'center' }}
                  >
                    {pago.id_viaje}
                  </Text>
                  <Text 
                    className="text-center text-gray-700 text-sm truncate"
                    style={{ flex: 1, minWidth: 120, textAlign: 'center' }}
                  >
                    ${pago.monto}
                  </Text>
                  <Text 
                    className="text-center text-gray-700 text-sm truncate"
                    style={{ flex: 1, minWidth: 120, textAlign: 'center' }}
                  >
                    {pago.metodo}
                  </Text>
                  <Text 
                    className="text-center text-gray-700 text-sm truncate"
                    style={{ flex: 1, minWidth: 120, textAlign: 'center' }}
                  >
                    {pago.estado}
                  </Text>
                  <Text 
                    className="text-center text-gray-700 text-sm truncate"
                    style={{ flex: 1, minWidth: 120, textAlign: 'center' }}
                  >
                    {pago.fecha_creacion?.toDate ? pago.fecha_creacion.toDate().toLocaleString() : ''}
                  </Text>
                </View>
              ))}
            </View>
          </View>
      </View>
    </ScrollView>
  );
}
