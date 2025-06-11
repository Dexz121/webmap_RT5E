import React, { useEffect, useState }from 'react';
import { View, Text, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import BotonPanico from '../components/BotonPanico';



const UsuarioMenu = () => {
  const router = useRouter();
  const [viajes, setViajes] = useState([]);
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
  <TouchableOpacity
    className="w-40 h-40 bg-[#EEEEEE] rounded-xl shadow-md flex justify-center items-center"
    onPress={() => router.push({ pathname: '/usuario_seleccion_destino', params: { tipo: 'viaje' } })}
  >
    <Image source={require('../assets/images/viajes.png')} className="w-20 h-20" />
    <Text className="text-black font-semibold mt-2">Viajes</Text>
  </TouchableOpacity>

  <TouchableOpacity
    className="w-40 h-40 bg-[#EEEEEE] rounded-xl shadow-md flex justify-center items-center"
    onPress={() => router.push({ pathname: '/usuario_seleccion_destino', params: { tipo: 'paqueteria' } })}
  >
    <Image source={require('../assets/images/Package.png')} className="w-20 h-20" />
    <Text className="text-black font-semibold mt-2 text-center">Enviar paquetería</Text>
  </TouchableOpacity>

  <TouchableOpacity
    className="w-40 h-40 bg-[#EEEEEE] rounded-xl shadow-md flex justify-center items-center"
    onPress={() => router.push({ pathname: '/usuario_seleccion_destino', params: { tipo: 'paqueteria' } })}
  >
    <Image source={require('../assets/images/user-in.png')} className="w-20 h-20" />
    <Text className="text-black font-semibold mt-2 text-center">Datos de usuario</Text>
  </TouchableOpacity>

  <TouchableOpacity
    className="w-40 h-40 bg-[#EEEEEE] rounded-xl shadow-md flex justify-center items-center"
    onPress={() => router.push({ pathname: '/usuario_seleccion_destino', params: { tipo: 'paqueteria' } })}
  >
    <Image source={require('../assets/images/pagos.png')} className="w-20 h-20" />
    <Text className="text-black font-semibold mt-2 text-center">Ganancias</Text>
  </TouchableOpacity>
</View>

      {/* Accesos rápidos - Administración */}
      <View className="mt-10 px-8">
        <Text className="text-black text-2xl font-semibold mb-4">Administración</Text>
        <View className="flex-row flex-wrap justify-between">
          {[
            { label: 'Usuarios', route: '/usuarios', icon: require('../assets/images/user-in.png') },
            { label: 'Vehículos', route: '/vehiculos', icon: require('../assets/images/carro.png') },
            { label: 'Viajes', route: '/viajes', icon: require('../assets/images/viajes_historial.png') },
            { label: 'Pagos', route: '/pagos', icon: require('../assets/images/pagos.png') },
            { label: 'Puntuaciones', route: '/puntuaciones', icon: require('../assets/images/puntuaciones.png') },
            { label: 'Tarifa', route: '/tarifas', icon: require('../assets/images/tarifa.png') },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              className="w-36 h-36 bg-gray-200 rounded-xl m-2 flex justify-center items-center"
              onPress={() => router.push(item.route)}
            >
              <Image source={item.icon} className="w-16 h-16" />
              <Text className="text-black font-semibold mt-2 text-center">{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Historial de viajes */}
      <Text className="text-black text-xl font-semibold mt-12 ml-8">Historial de viajes</Text>
      {/*<View className="mt-4 px-8">
        {viajes.length === 0 ? (
          <Text className="text-gray-400">No hay viajes registrados aún.</Text>
        ) : (
          viajes.map((item) => {
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
          })
        )}
      </View>*/}
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
