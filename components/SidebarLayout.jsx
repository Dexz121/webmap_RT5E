// app/components/SidebarLayout.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Slot } from 'expo-router';
import { Menu, X } from 'lucide-react-native';
import { Link } from 'expo-router';

const links = [
  { href: '/usuarios', label: 'Usuarios' },
  { href: '/vehiculos', label: 'Vehículos' },
  { href: '/viajes', label: 'Viajes' },
  { href: '/pagos', label: 'Pagos' },
  { href: '/puntuaciones', label: 'Puntuaciones' },
  { href: '/tarifa', label: 'Tarifa' },
];

export default function SidebarLayout() {
  const [open, setOpen] = useState(false);

  return (
    <View className="flex-1">
      {/* Botón flotante */}
      <TouchableOpacity
        className="absolute z-50 top-5 left-5 bg-yellow-500 p-2 rounded-md"
        onPress={() => setOpen(!open)}
      >
        {open ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
      </TouchableOpacity>

      {/* Sidebar */}
      {open && (
        <View className="absolute top-0 left-0 h-full w-64 bg-white shadow-md z-40 px-4 py-8">
          {links.map((item) => (
            <Link key={item.href} href={item.href} onPress={() => setOpen(false)}>
              <Text className="text-lg font-medium py-2 border-b border-gray-200">{item.label}</Text>
            </Link>
          ))}
        </View>
      )}

      {/* Contenido */}
      <View className="flex-1 z-0">
        <Slot />
      </View>
    </View>
  );
}
