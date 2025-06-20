// screens/HomeScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Dimensions, Pressable, TouchableWithoutFeedback } from 'react-native';
import Panel from './Panel';

export default function HomeScreen() {
  const screenHeight = Dimensions.get('window').height;
  const collapsedHeight = 60;

  const [isExpanded, setIsExpanded] = useState(true);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [mode, setMode] = useState<'menu' | 'historial' | 'solicitarViaje'>('menu');

  const panelHeight = useMemo(() => {
    if (!isExpanded) return collapsedHeight;
    switch (mode) {
      case 'solicitarViaje':
        return screenHeight * 0.25;
      case 'menu':
      case 'historial':
      default:
        return screenHeight * 0.65;
    }
  }, [isExpanded, mode]);

  return (
    <View className="flex-1 relative">
      {/* Capa transparente para colapsar el panel tocando el mapa */}
      {isExpanded && (
        <Pressable
          onPress={() => setIsExpanded(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: panelHeight,
            zIndex: 1,
          }}
        />
      )}

      {/* Panel dinámico */}
      <TouchableWithoutFeedback onPress={() => setIsExpanded(true)}>
        <View
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-hidden"
          style={{
            height: panelHeight,
            zIndex: 2,
          }}
        >
          <Panel
            onDestinationSet={setDestination}
            isCollapsed={!isExpanded}
            expand={() => setIsExpanded(true)}
            // ⚠️ Prop extra para sincronizar el modo en el futuro si deseas
            // setMode externo no es necesario aún, pero útil si decides sincronizar.
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}