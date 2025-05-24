import React from 'react';
import { View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native';

type Props = {
  title: string;
  children: React.ReactNode;
  headerColor?: string;
  opacity?: number;
  reverseOrder?: boolean;
};

const CardReciclable = ({
  title,
  children,
  headerColor = '#d4af37', // por defecto un amarillo dorado
  opacity = 1,
  reverseOrder = false,
}: Props) => {
  const Header = (
    <View
      className="w-full py-4 items-center justify-center"
      style={{ backgroundColor: headerColor }}
    >
      <Text className="text-white font-bold text-lg uppercase">{title}</Text>
    </View>
  );

  const Body = (
    <View className="flex-1 bg-white p-4">
      {children}
    </View>
  );

  return (
    <View
      className="rounded-xl overflow-hidden"
      style={{ flex: 1, opacity }}
    >
      {reverseOrder ? (
        <>
          {Body}
          {Header}
        </>
      ) : (
        <>
          {Header}
          {Body}
        </>
      )}
    </View>
  );
};

export default CardReciclable;