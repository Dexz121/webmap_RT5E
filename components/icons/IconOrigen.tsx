// components/icons/IconOrigen.tsx
import React from 'react';
import { Image } from 'react-native';

export default function IconOrigen({ size = 30 }: { size?: number }) {
  return <Image source={require('../../assets/images/user.png')} style={{ width: size, height: size }} />;
}
