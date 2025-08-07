// hooks/usePushNotifications.ts
import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useSelector } from 'react-redux';
import { selectUser } from '@/slices/userSlice';
import { updateUser } from '@/firebase';

export default function usePushNotifications() {
  const user = useSelector(selectUser);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    const registerToken = async () => {
      if (!user?.uid || !Device.isDevice) return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('🔒 Permiso de notificaciones denegado');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);

      // Guardar token si cambió
      if (token && token !== user.expoPushToken) {
        await updateUser({ uid: user.uid, expoPushToken: token });
        console.log('✅ Token actualizado en Firestore');
      }
    };

    registerToken();
  }, [user?.uid]);

  return { expoPushToken };
}
