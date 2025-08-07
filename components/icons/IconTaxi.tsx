// components/icons/IconTaxi.tsx
import React from 'react';
import { Image } from 'react-native';

export default function IconTaxi({ size = 30 }: { size?: number }) {
  return <Image source={require('../../assets/images/audir8.png')} style={{ width: size, height: size }} />;
}
