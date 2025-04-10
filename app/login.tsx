import { View, Text } from 'react-native';
import React from 'react';
import LoginScreen from '@/screens/Login';

export default function login() {
  return (
    <>
        <Text className=' text-red-700'>
            <LoginScreen/>
        </Text>
    </>
  )
}