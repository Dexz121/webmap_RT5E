// hooks/useGoogleAuth.ts
import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { auth } from '@/firebase';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';

const ANDROID_CLIENT_ID = '<tu-oauth-client-android>';
const EXPO_CLIENT_ID = '<tu-oauth-client-expo>';
const WEB_CLIENT_ID = '<tu-oauth-client-web>';

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | Error>(null);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        // Web: popup sí está soportado
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        return;
      }

      // RN: usar AuthSession
      const redirect = AuthSession.makeRedirectUri({ useProxy: true });
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      };

      const result = await AuthSession.startAsync({
        authUrl:
          `${discovery.authorizationEndpoint}?` +
          `client_id=${encodeURIComponent(EXPO_CLIENT_ID)}&` +
          `redirect_uri=${encodeURIComponent(redirect)}&` +
          `response_type=id_token&` +
          `scope=${encodeURIComponent('openid email profile')}&` +
          `nonce=${encodeURIComponent(String(Date.now()))}`,
      });

      // @ts-ignore
      const idToken = result?.params?.id_token;
      if (!idToken) throw new Error('No se obtuvo id_token de Google');

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { signInWithGoogle, loading, error };
}
