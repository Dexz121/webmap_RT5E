// screens/Panel.tsx
import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import UserMenu from './UserMenu';
import HistorialViajes from './HistorialViajes';
import SolicitarViaje from './SetViaje';

const Placeholder = ({ label }: { label: string }) => (
  <View className="flex-1 items-center justify-center">
    <Text className="text-xl font-semibold text-gray-700">{label}</Text>
  </View>
);

export default function Panel({
  onDestinationSet,
  isCollapsed,
  expand,
}: {
  onDestinationSet: (coords: [number, number]) => void;
  isCollapsed: boolean;
  expand: () => void;
}) {
  const [mode, setMode] = useState<'menu' | 'historial' | 'solicitarViaje' | 'ganancias' | 'datosUsuario'>('menu');

  const renderContent = () => {
    switch (mode) {
      case 'menu':
        return <UserMenu onNavigate={setMode} />;
      case 'historial':
        return <HistorialViajes onBack={() => setMode('menu')} />;
      case 'solicitarViaje':
        return (
          <SolicitarViaje
            onDestinoConfirmado={(coords) => {
              onDestinationSet(coords);
              setMode('menu');
            }}
            onBack={() => setMode('menu')}
          />
        );
      case 'ganancias':
        return <Placeholder label="Pantalla de Ganancias" />;
      case 'datosUsuario':
        return <Placeholder label="Pantalla de Datos de Usuario" />;
      default:
        return null;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={expand}>
      <View className="w-full h-full bg-white rounded-t-2xl overflow-hidden">
        {renderContent()}
      </View>
    </TouchableWithoutFeedback>
  );
}
