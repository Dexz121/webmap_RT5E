// screens/UserMenu.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import BotonPanico from '../components/BotonPanico';
import { useSelector } from 'react-redux';
import { selectRole } from '../slices/userSlice';

interface Viaje {
  id: string;
  [key: string]: any;
}

interface UsuarioMenuProps {
  onNavigate: (
    screen: 'menu' | 'historial' | 'solicitarViaje' | 'ganancias' | 'datosUsuario'
  ) => void;
}

const UsuarioMenu: React.FC<UsuarioMenuProps> = ({ onNavigate }) => {
  const role = useSelector(selectRole);
  const [viajes, setViajes] = useState<Viaje[]>([]);

  useEffect(() => {
    const obtenerViajes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'Viaje'));
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setViajes(lista);
      } catch (error) {
        console.error('Error obteniendo viajes:', error);
      }
    };

    obtenerViajes();
  }, []);

  return (
    <View className="h-full w-full bg-white p-4 rounded-3xl overflow-hidden">
      <Text className="text-black text-2xl font-semibold mt-12 ml-8">
        ¿Qué haremos el día de hoy?
      </Text>

      <View className="flex-row justify-between mt-12 px-8">
        <View className="mt-12 px-8">
          {(role === 'pasajero' || role === 'admin') && (
            <View className="flex-row justify-between gap-4 mb-6">
              <TouchableOpacity
                className="w-40 h-40 bg-[#EEEEEE] rounded-xl shadow-md flex justify-center items-center"
                onPress={() => onNavigate('solicitarViaje')}
              >
                <Image
                  source={require('../assets/images/viajes.png')}
                  className="w-20 h-20"
                />
                <Text className="text-black font-semibold mt-2">Viajes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-40 h-40 bg-[#EEEEEE] rounded-xl shadow-md flex justify-center items-center"
                onPress={() => onNavigate('historial')}
              >
                <Image source={require('../assets/images/Package.png')} className="w-20 h-20" />
                <Text className="text-black font-semibold mt-2 text-center">Historial</Text>
              </TouchableOpacity>
            </View>
          )}

          {(role === 'conductor' || role === 'admin') && (
            <View className="flex-row justify-between gap-4 mb-6">
              <TouchableOpacity
                className="w-40 h-40 bg-[#EEEEEE] rounded-xl shadow-md flex justify-center items-center"
                onPress={() => onNavigate('datosUsuario')}
              >
                <Image source={require('../assets/images/Package.png')} className="w-20 h-20" />
                <Text className="text-black font-semibold mt-2 text-center">Datos usuario</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-40 h-40 bg-[#EEEEEE] rounded-xl shadow-md flex justify-center items-center"
                onPress={() => onNavigate('ganancias')}
              >
                <Image source={require('../assets/images/Package.png')} className="w-20 h-20" />
                <Text className="text-black font-semibold mt-2 text-center">Ganancias</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <Text className="text-black text-xl font-semibold mt-12 ml-8">Historial de viajes</Text>

      {viajes.slice(0, 3).map((item) => {
        const fechaInicio = item.fecha_inicio_viaje?.toDate?.().toLocaleString?.() || 'Sin inicio';
        const fechaFin = item.fecha_finalizacion_viaje?.toDate?.().toLocaleString?.() || 'Sin fin';

        return (
          <View key={item.id} className="flex-row items-center py-2 border-b border-gray-300">
            <View className="w-10 h-10 bg-gray-200 rounded-full flex justify-center items-center">
              <Image source={require('../assets/images/Car.png')} className="w-6 h-6" />
            </View>
            <View className="ml-4">
              <Text className="text-black text-lg font-semibold capitalize">{item.estado}</Text>
              <Text className="text-gray-500 text-sm">{fechaInicio} → {fechaFin}</Text>
            </View>
          </View>
        );
      })}

      <View className="flex-1 justify-center items-center bg-white">
        <BotonPanico />
      </View>
    </View>
  );
};

export default UsuarioMenu;
