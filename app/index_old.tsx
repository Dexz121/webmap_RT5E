// app/index.tsx
import React from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { selectRole } from "../slices/userSlice";
import LoginScreen from '../screens/Login';
import HomeScreen from '../screens/UserScreen';

export default function Index() {
  const role = useSelector(selectRole);

  return (
    <View className="flex-1">
      {role ? <HomeScreen /> : <LoginScreen />}
    </View>
  );
}