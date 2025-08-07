//screens/HomeScreen.tsx
import React, { useState } from 'react';
import { View, Modal, Pressable, Text } from 'react-native';
import PersistentMap from '@/components/PersistentMap';
import UserMenu from '@/components/UserMenu';
import Tarifa from '@/screens/Tarifa';
import Pagos from '@/screens/Pagos';
import Vehiculos from '@/screens/Vehiculos';
import Usuarios from '@/screens/Usuarios'

export default function HomeScreen() {
  const [panelView, setPanelView] = useState<'viajes' | 'tarifa' | 'pagos' | 'acciones' | 'vehiculos' | 'usuarios' | null>(null);

  const closeModal = () => setPanelView(null);

  const renderModalContent = () => {
    switch (panelView) {
      case 'viajes':
        return <Text>📋 Lista de viajes</Text>;
      case 'tarifa':
        return (
          <View className="w-auto">
            <Tarifa />
          </View>
        );
      case 'pagos':
        return (
          <View className="w-auto">
            <Pagos />
          </View>
        );
      case 'vehiculos':
        return (
          <View className="w-auto">
            <Vehiculos />
          </View>
        );
      case 'usuarios':
        return (
          <View className="w-auto">
            <Usuarios />
          </View>
        );
      case 'acciones':
        return <Text>⚙️ Acciones del sistema</Text>;
      default:
        return null;
    }
  };

  return (
    <View className="flex-1">
      {/* Mapa de fondo */}
      <PersistentMap />

      {/* Menú vertical a la izquierda */}
      <UserMenu onNavigate={(view) => setPanelView(view)} />

      {/* Modal flotante al centro */}
      <Modal
        animationType="fade"
        transparent
        visible={panelView !== null}
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center items-center bg-black/40">
          <View
            className={`bg-white p-6 rounded-xl w-full max-h-[90%] ${panelView === 'tarifa' ? 'max-w-sm' : panelView === 'usuarios' ? 'max-w-6xl' : 'max-w-5xl'
              }`}
          >            {renderModalContent()}
            <Pressable
              onPress={closeModal}
              className="mt-4 bg-gray-200 rounded px-4 py-2"
            >
              <Text className="text-center text-black">Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
