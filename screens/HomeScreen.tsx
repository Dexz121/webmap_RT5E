// HomeScreen.tsx
import React, { useState } from 'react';
import { View, Dimensions, Pressable, TouchableWithoutFeedback } from 'react-native';
import UserScreen from './UserScreen';
import PersistentMap from '../components/PersistentMap'; // ✅ Asegúrate de importarlo

export default function HomeScreen() {
  const screenHeight = Dimensions.get('window').height;
  const expandedHeight = (screenHeight * 2) / 3;
  const collapsedHeight = 60;

  const [isExpanded, setIsExpanded] = useState(true);
  const [destination, setDestination] = useState<[number, number] | null>(null);

  return (
    <View className="flex-1 relative">

      {/* Mapa de fondo con destino dinámico */}
      <PersistentMap
        destination={destination}
        onDestinationSelect={(coords) => {
          setDestination(coords);
          setIsExpanded(false); // opcional: colapsa el panel al marcar
        }}
      />

      {/* Capa transparente que detecta toques en el mapa */}
      {isExpanded && (
        <Pressable
          onPress={() => setIsExpanded(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: expandedHeight,
            zIndex: 1,
          }}
        />
      )}

      {/* Panel flotante */}
      <TouchableWithoutFeedback onPress={() => setIsExpanded(true)}>
        <View
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-hidden"
          style={{
            height: isExpanded ? expandedHeight : collapsedHeight,
            zIndex: 2,
          }}
        >
          <UserScreen minimized={!isExpanded} onExpand={() => setIsExpanded(true)} />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}
