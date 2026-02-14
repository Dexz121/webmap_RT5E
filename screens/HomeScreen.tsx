import React, { useState } from 'react';
import { View, Modal, Pressable, Text } from 'react-native';
import PersistentMap from '@/components/PersistentMap';
import UserMenu from '@/components/UserMenu';
import Tarifa from '@/screens/Tarifa';
import Vehiculos from '@/screens/Vehiculos';
import Usuarios from '@/screens/Usuarios';
import UsuariosConductor from '@/screens/UsuariosConductor';
import AsignarViajes from '@/screens/AsignarViajes';
import Viajes from '@/screens/Viajes';

export default function HomeScreen() {
  const [panelView, setPanelView] = useState<'asignarViajes' | 'viajes' | 'tarifa' | 'acciones' | 'vehiculos' | 'usuarios' | 'usuariosConductor' | null>(null);

  const closeModal = () => setPanelView(null);

  const renderModalContent = () => {
    switch (panelView) {
      case 'asignarViajes':
        return <AsignarViajes />;
      case 'viajes':
        return <Viajes />;
      case 'tarifa':
        return <Tarifa />;
      case 'vehiculos':
        return <Vehiculos />;
      case 'usuarios':
        return <Usuarios />;
      case 'usuariosConductor':
        return <UsuariosConductor />;
      case 'acciones':
        return <Text>⚙️ Acciones del sistema</Text>;
      default:
        return null;
    }
  };

  return (
    <View className="flex-1">
      <PersistentMap />

      <View className="absolute top-6 right-4 z-10">
        <Text className="text-lg font-bold text-gray-700 tracking-widest opacity-90">
          WEBMAP
        </Text>
      </View>

      {/* Menú vertical a la izquierda */}
      <UserMenu onNavigate={(view) => setPanelView(view)} />

      {/* Modal flotante al centro */}
      <Modal
        animationType="fade"
        transparent
        visible={panelView !== null}
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center items-center bg-black/40 p-4">
          <View
            className={`bg-white rounded-xl max-h-[90vh] flex flex-col ${
              panelView === 'tarifa' 
                ? 'max-w-md' 
                : panelView === 'usuarios' || panelView === 'usuariosConductor'
                ? 'max-w-6xl' 
                : panelView === 'vehiculos' || panelView === 'viajes'
                ? 'max-w-6xl'
                : 'max-w-4xl'
            }`}
            style={{ 
              maxWidth: panelView === 'tarifa' 
                ? '28rem' 
                : panelView === 'usuarios' || panelView === 'usuariosConductor'
                ? '72rem' 
                : panelView === 'vehiculos' || panelView === 'viajes'
                ? '72rem'
                : '56rem',
              width: 'auto',
              minWidth: panelView === 'tarifa' ? '28rem' : 'min(90vw, 72rem)'
            }}
          >
            <View className="flex-1" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <View 
                className="flex-1 p-4 md:p-6"
                style={{ 
                  overflow: 'auto', 
                  WebkitOverflowScrolling: 'touch',
                  flex: 1,
                  minHeight: 0
                }}
              >
                {renderModalContent()}
              </View>
              <View className="border-t border-gray-200 p-4">
                <Pressable
                  onPress={closeModal}
                  className="bg-gray-200 rounded px-4 py-2"
                >
                  <Text className="text-center text-black">Cerrar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
