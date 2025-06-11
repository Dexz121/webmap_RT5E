import React from 'react';
import { View, Dimensions } from 'react-native';
import UserScreen from './UserScreen';

export default function HomeScreen() {
  const screenHeight = Dimensions.get('window').height;
  const userScreenHeight = (screenHeight * 2) / 3;

  return (
    <View className="flex-1 relative">
      {/* Vista flotante sobre el mapa: UserScreen */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-hidden"
        style={{ height: userScreenHeight }}
      >
        <UserScreen />
      </View>
    </View>
  );
}
