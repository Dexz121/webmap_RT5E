// screens/Vehiculo.tsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal
} from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import VehiculoForm from './VehiculoForm';


const VEHICULOS_POR_PAGINA = 10;

export default function VehiculosListScreen() {
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [vehiculos, setVehiculos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [mostrarEditar, setMostrarEditar] = useState(false);

  const fetchVehiculos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Vehiculo'));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVehiculos(data);
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const toggleEstado = async (vehiculoId: string, estadoActual: string) => {
    const nuevoEstado =
      (estadoActual || '').toLowerCase() === 'activo'
        ? 'deshabilitado'
        : 'activo';
    try {
      const docRef = doc(db, 'Vehiculo', vehiculoId);
      await updateDoc(docRef, { estado: nuevoEstado });
      fetchVehiculos();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const vehiculosFiltrados = vehiculos.filter((v) => {
    const filtro = busqueda.toLowerCase();
    return (
      v.marca?.toLowerCase().includes(filtro) ||
      v.placas?.toLowerCase().includes(filtro)
    );
  });

  const totalPaginas = Math.ceil(vehiculosFiltrados.length / VEHICULOS_POR_PAGINA);
  const inicio = (paginaActual - 1) * VEHICULOS_POR_PAGINA;
  const vehiculosPagina = vehiculosFiltrados.slice(
    inicio,
    inicio + VEHICULOS_POR_PAGINA
  );

  return (

    <ScrollView className="bg-white flex-1">
      {/* Modal agregar */}
      <Modal visible={mostrarAgregar} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="bg-white p-4 rounded-xl w-full max-w-4xl max-h-[90%]">
            <ScrollView>
              <VehiculoForm
                onSuccess={() => {
                  setMostrarAgregar(false);
                  fetchVehiculos();
                }}
              />
            </ScrollView>
            <TouchableOpacity
              onPress={() => setMostrarAgregar(false)}
              className="mt-4 bg-gray-200 rounded px-4 py-2"
            >
              <Text className="text-center text-black">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal editar */}
      <Modal visible={mostrarEditar} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="bg-white p-4 rounded-xl w-full max-w-4xl max-h-[90%]">
            <ScrollView>
              <VehiculoForm
                initialData={vehiculos.find(v => v.id === vehiculoSeleccionado)}
                onSuccess={() => {
                  setMostrarEditar(false);
                  fetchVehiculos();
                }}
              />
            </ScrollView>
            <TouchableOpacity
              onPress={() => setMostrarEditar(false)}
              className="mt-4 bg-gray-200 rounded px-4 py-2"
            >
              <Text className="text-center text-black">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View className="items-center pt-6">
        <Text className="text-black text-2xl font-bold mb-4">
          Lista de Vehículos
        </Text>

        <View className="w-[960px]">
          <View className="flex-row justify-between mb-4">
            <TextInput
              placeholder="Buscar por marca o placa"
              className="border border-gray-300 rounded-md px-4 py-2 w-1/2"
              value={busqueda}
              onChangeText={(text) => {
                setBusqueda(text);
                setPaginaActual(1);
              }}
            />

            <View className="flex-row space-x-2">
              <TouchableOpacity
                className="bg-yellow-500 rounded-xl py-2 px-4"
                onPress={() => setMostrarAgregar(true)}
              >
                <Text className="text-white font-semibold text-sm">
                  + Agregar Vehículo
                </Text>
              </TouchableOpacity>

              {vehiculoSeleccionado && (
                <TouchableOpacity
                  className="bg-blue-600 rounded-xl py-2 px-4"
                  onPress={() => setMostrarEditar(true)}
                >
                  <Text className="text-white font-semibold text-sm">
                    Editar Vehículo
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView horizontal className="mb-4">
            <View>
              <View className="flex-row border-b border-gray-400 pb-2">
                {[
                  'Marca',
                  'Modelo',
                  'Año',
                  'Placa',
                  'Color',
                  'Estado',
                  'Acción',
                ].map((h) => (
                  <Text
                    key={h}
                    className="w-32 font-bold text-black text-center"
                  >
                    {h}
                  </Text>
                ))}
              </View>

              {vehiculosPagina.map((vehiculo) => {
                const estadoActual = (vehiculo.estado || '').toLowerCase();
                const esActivo = estadoActual === 'activo';
                const estaSeleccionado = vehiculoSeleccionado === vehiculo.id;

                return (
                  <TouchableOpacity
                    key={vehiculo.id}
                    onPress={() => setVehiculoSeleccionado(vehiculo.id)}
                    className={`flex-row border-b border-gray-200 py-2 items-center ${estaSeleccionado ? 'bg-yellow-100' : ''
                      }`}
                  >
                    <Text className="w-32 text-center text-gray-800">
                      {vehiculo?.marca || '-'}
                    </Text>
                    <Text className="w-32 text-center text-gray-800">
                      {vehiculo?.modelo || '-'}
                    </Text>
                    <Text className="w-32 text-center text-gray-800">
                      {vehiculo?.ano || '-'}
                    </Text>
                    <Text className="w-32 text-center text-gray-800">
                      {vehiculo?.placas || '-'}
                    </Text>
                    <Text className="w-32 text-center text-gray-800">
                      {vehiculo?.color || '-'}
                    </Text>
                    <Text
                      className={`w-32 text-center font-semibold ${esActivo ? 'text-green-600' : 'text-red-500'
                        }`}
                    >
                      {vehiculo?.estado || '-'}
                    </Text>
                    <TouchableOpacity
                      className={`w-32 px-2 py-1 rounded-full ${esActivo ? 'bg-red-500' : 'bg-green-500'
                        }`}
                      onPress={() => toggleEstado(vehiculo.id, vehiculo.estado)}
                    >
                      <Text className="text-white text-center text-sm">
                        {esActivo ? 'Deshabilitar' : 'Activar'}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {totalPaginas > 1 && (
            <View className="flex-row justify-center space-x-2 mt-4">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                (pagina) => (
                  <TouchableOpacity
                    key={pagina}
                    className={`px-4 py-2 rounded-full ${paginaActual === pagina
                      ? 'bg-yellow-500'
                      : 'bg-gray-200'
                      }`}
                    onPress={() => setPaginaActual(pagina)}
                  >
                    <Text
                      className={`font-semibold ${paginaActual === pagina
                        ? 'text-white'
                        : 'text-black'
                        }`}
                    >
                      {pagina}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
