// screens/VerUsuario.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Props {
  userId: string;
}

export default function VerUsuario({ userId }: Props) {

  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const obtenerUsuario = async () => {
      if (userId) {
        const ref = doc(db, 'users', String(userId));
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUsuario({ id: snap.id, ...snap.data() });
        }
      }
    };
    obtenerUsuario();
  }, [userId]);

  if (!usuario) return null;

  return (
    <ScrollView className="flex-1 bg-white px-4 py-6">
      <Text className="text-2xl font-bold text-center mb-6">Detalles del Usuario</Text>

      <View className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'ID', value: usuario.id },
          { label: 'Nombre', value: usuario.displayName },
          { label: 'Email', value: usuario.email },
          { label: 'Teléfono', value: usuario.telefono },
          { label: 'Rol', value: usuario.role },
          { label: 'Estado', value: usuario.estado },
          { label: 'Fecha Creación', value: usuario.fecha_creacion?.toDate?.().toLocaleString?.() || '' },
          { label: 'Fecha Eliminación', value: usuario.fecha_eliminacion || '-' },
          { label: 'Método Pago Predeterminado', value: usuario.metodo_pago_predeterminado },
          { label: 'Licencia Conducir', value: usuario.licencia_conducir },
          { label: 'Expiración Licencia', value: usuario.expiracion_licencia },
          { label: 'Verificación Antecedentes', value: usuario.verificacion_antecedentes },
        ].map((field) => (
          <View key={field.label}>
            <Text className="font-semibold text-gray-700 mb-1">{field.label}</Text>
            <TextInput
              value={String(field.value || '')}
              editable={false}
              className="border border-gray-300 rounded-md px-4 py-2 bg-gray-100 text-gray-600"
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
