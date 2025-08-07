// components/icons/IconDestino.tsx
import React from 'react';
import { Image } from 'react-native';

export default function IconDestino({ size = 30 }: { size?: number }) {
  return <Image source={require('../../assets/images/destino-2.png')} style={{ width: size, height: size }} />;
}
