// components/UserMenu.tsx
import React from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';

interface UsuarioMenuProps {
  onNavigate: (
    screen: 'menu' | 'paqueteria' | 'solicitarViaje' |
      'usuarios' | 'vehiculos' | 'viajes' | 'pagos' | 'tarifa'
  ) => void;
}

const botones = [
  { label: 'Viaje', screen: 'solicitarViaje', icon: require('../assets/images/viajes-1.png') },
  { label: 'Paquete', screen: 'paqueteria', icon: require('../assets/images/paquete-1.png') },
  { label: 'Usuarios', screen: 'usuarios', icon: require('../assets/images/user.png') },
  { label: 'Vehículos', screen: 'vehiculos', icon: require('../assets/images/carros.png') },
  { label: 'Viajes', screen: 'viajes', icon: require('../assets/images/informe-5.png') },
  { label: 'Pagos', screen: 'pagos', icon: require('../assets/images/ganancias-3.png') },
  { label: 'Tarifa', screen: 'tarifa', icon: require('../assets/images/tarifa.png') },
];

const UsuarioMenu: React.FC<UsuarioMenuProps> = ({ onNavigate }) => {
  return (
    <View className="absolute top-6 left-4 z-10">
      <View className="group opacity-65 bg-white rounded-xl shadow-lg p-2 w-16 hover:w-32 hover:opacity-100 transition-all duration-300 overflow-hidden">
        {botones.map((btn) => (
          <TouchableOpacity
            key={btn.screen}
            onPress={() => onNavigate(btn.screen)}
            className="flex-row items-center space-x-2 mt-0.5 py-2 px-3 rounded group-hover:bg-gray-100"
          >
            <Image
              source={btn.icon}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
            <Text className="text-sm text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default UsuarioMenu;
