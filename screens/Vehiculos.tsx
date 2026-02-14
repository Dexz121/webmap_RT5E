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

type TabVehiculos = 'activos' | 'deshabilitados';

type TVehiculo = {
  id: string;
  marca?: string | number | null;
  modelo?: string | number | null;
  ano?: string | number | null;
  color?: string | number | null;
  placas?: string | number | null;
  estado?: string | null;
  fecha_adquisicion?: string | null;
  numero_economico?: string | number | null;
  movil?: string | number | null;
};

export default function VehiculosListScreen() {
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [vehiculos, setVehiculos] = useState<TVehiculo[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<string | null>(null);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [tab, setTab] = useState<TabVehiculos>('activos');

  const fetchVehiculos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Vehiculo'));
      const data = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as TVehiculo[];
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

  // 1) FILTRO por marca, placas, móvil y número económico
  const vehiculosFiltrados = vehiculos.filter((v) => {
    const filtro = busqueda.trim().toLowerCase();
    if (!filtro) return true;
    const marca  = (v?.marca ?? '').toString().toLowerCase();
    const placas = (v?.placas ?? '').toString().toLowerCase();
    const movil  = (v?.movil ?? '').toString().toLowerCase();
    const numEco = (v?.numero_economico ?? '').toString().toLowerCase();
    return (
      marca.includes(filtro) ||
      placas.includes(filtro) ||
      movil.includes(filtro) ||
      numEco.includes(filtro)
    );
  });

  const vehiculosActivos = vehiculosFiltrados.filter(
    (v) => (v?.estado ?? '').toLowerCase() === 'activo'
  );
  const vehiculosDeshabilitados = vehiculosFiltrados.filter(
    (v) => (v?.estado ?? '').toLowerCase() === 'deshabilitado'
  );
  const listaActual = tab === 'activos' ? vehiculosActivos : vehiculosDeshabilitados;

  const getMovilKey = (v: TVehiculo) => {
    const raw = (v?.movil ?? '').toString().trim();
    if (/^\d+$/.test(raw)) return { type: 'num' as const, value: Number(raw) };
    return { type: 'str' as const, value: raw.toLowerCase() };
  };

  const vehiculosOrdenados = [...listaActual].sort((a, b) => {
    const A = getMovilKey(a);
    const B = getMovilKey(b);
    if (A.type === 'num' && B.type === 'num') return A.value - B.value;
    if (A.type === 'num' && B.type === 'str') return -1;
    if (A.type === 'str' && B.type === 'num') return 1;
    return A.value.localeCompare(B.value);
  });

  const totalPaginas = Math.ceil(vehiculosOrdenados.length / VEHICULOS_POR_PAGINA);
  const inicio = (paginaActual - 1) * VEHICULOS_POR_PAGINA;
  const vehiculosPagina = vehiculosOrdenados.slice(
    inicio,
    inicio + VEHICULOS_POR_PAGINA
  );

  return (
    <ScrollView className="bg-white flex-1">
      {/* Modal agregar */}
      <Modal visible={mostrarAgregar} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40 p-4">
          <View 
            className="bg-white rounded-xl w-full max-w-[90vw] max-h-[90vh] flex flex-col"
            style={{ maxWidth: '90vw', width: '100%' }}
          >
            <View className="flex-1" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <ScrollView 
                className="flex-1 p-4" 
                contentContainerStyle={{ paddingBottom: 16 }}
                style={{ flex: 1, minHeight: 0 }}
              >
                <VehiculoForm
                  onSuccess={() => {
                    setMostrarAgregar(false);
                    fetchVehiculos();
                  }}
                />
              </ScrollView>
              <View className="border-t border-gray-200 p-4">
                <TouchableOpacity
                  onPress={() => setMostrarAgregar(false)}
                  className="bg-gray-200 rounded px-4 py-2"
                >
                  <Text className="text-center text-black">Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal editar */}
      <Modal visible={mostrarEditar} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40 p-4">
          <View 
            className="bg-white rounded-xl w-full max-w-[90vw] max-h-[90vh] flex flex-col"
            style={{ maxWidth: '90vw', width: '100%' }}
          >
            <View className="flex-1" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <ScrollView 
                className="flex-1 p-4" 
                contentContainerStyle={{ paddingBottom: 16 }}
                style={{ flex: 1, minHeight: 0 }}
              >
                <VehiculoForm
                  initialData={vehiculos.find(v => v.id === vehiculoSeleccionado)}
                  onSuccess={() => {
                    setMostrarEditar(false);
                    setVehiculoSeleccionado(null);
                    fetchVehiculos();
                  }}
                />
              </ScrollView>
              <View className="border-t border-gray-200 p-4">
                <TouchableOpacity
                  onPress={() => {
                    setMostrarEditar(false);
                    setVehiculoSeleccionado(null);
                  }}
                  className="bg-gray-200 rounded px-4 py-2"
                >
                  <Text className="text-center text-black">Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <View className="items-center pt-6">
        <Text className="text-black text-2xl font-bold mb-4">
          Lista de Vehículos
        </Text>

        <View className="w-full" style={{ width: '100%', maxWidth: '100%' }}>
          <View className="flex-row mb-4 gap-2">
            <TouchableOpacity
              onPress={() => { setTab('activos'); setPaginaActual(1); }}
              className={`flex-1 py-3 rounded-lg ${tab === 'activos' ? 'bg-gray-800' : 'bg-gray-200'}`}
            >
              <Text
                className={`text-center font-semibold text-sm ${tab === 'activos' ? 'text-white' : 'text-gray-700'}`}
              >
                ACTIVOS
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setTab('deshabilitados'); setPaginaActual(1); }}
              className={`flex-1 py-3 rounded-lg ${tab === 'deshabilitados' ? 'bg-gray-800' : 'bg-gray-200'}`}
            >
              <Text
                className={`text-center font-semibold text-sm ${tab === 'deshabilitados' ? 'text-white' : 'text-gray-700'}`}
              >
                DESHABILITADOS
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap gap-2 justify-between mb-4">
            <TextInput
              placeholder="Buscar por marca, placa, móvil o número económico"
              className="border border-gray-300 rounded-md px-4 py-2"
              style={{ flex: 1, minWidth: 200 }}
              value={busqueda}
              onChangeText={(text) => {
                setBusqueda(text);
                setPaginaActual(1);
              }}
            />
            <TouchableOpacity
              className="bg-yellow-500 rounded-xl py-2 px-4"
              onPress={() => setMostrarAgregar(true)}
            >
              <Text className="text-white font-semibold text-sm">
                + Agregar Vehículo
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-4" style={{ width: '100%' }}>
            <View style={{ width: '100%' }}>
              <View className="flex-row border-b border-gray-400 pb-2" style={{ width: '100%' }}>
                {[
                  'Número de móvil',
                  'Número económico',
                  'Placa',
                  'Marca',
                  'Año',
                  'Estado',
                  'Acción',
                ].map((h) => (
                  <Text
                    key={h}
                    className="font-bold text-black text-center"
                    style={{
                      flex: 1,
                      minWidth: h === 'Acción' ? 180 : 110,
                      textAlign: 'center',
                    }}
                  >
                    {h}
                  </Text>
                ))}
              </View>

              {vehiculosPagina.length === 0 ? (
              <View className="py-8 px-4">
                <Text className="text-gray-500 text-center">
                  {tab === 'activos'
                    ? 'No hay vehículos activos.'
                    : 'No hay vehículos deshabilitados.'}
                </Text>
              </View>
            ) : (
              vehiculosPagina.map((vehiculo) => {
                const estadoActual = (vehiculo?.estado || '').toLowerCase();
                const esActivo = estadoActual === 'activo';

                return (
                  <View
                    key={vehiculo.id}
                    className="flex-row border-b border-gray-200 py-2 items-center"
                    style={{ width: '100%' }}
                  >
                    <Text 
                      className="text-center text-gray-800"
                      style={{ flex: 1, minWidth: 110, textAlign: 'center' }}
                    >
                      {String(vehiculo?.movil ?? '').trim() || '-'}
                    </Text>
                    <Text 
                      className="text-center text-gray-800"
                      style={{ flex: 1, minWidth: 110, textAlign: 'center' }}
                    >
                      {String(vehiculo?.numero_economico ?? '').trim() || '-'}
                    </Text>
                    <Text 
                      className="text-center text-gray-800"
                      style={{ flex: 1, minWidth: 110, textAlign: 'center' }}
                    >
                      {vehiculo?.placas || '-'}
                    </Text>
                    <Text 
                      className="text-center text-gray-800"
                      style={{ flex: 1, minWidth: 110, textAlign: 'center' }}
                    >
                      {vehiculo?.marca || '-'}
                    </Text>
                    <Text 
                      className="text-center text-gray-800"
                      style={{ flex: 1, minWidth: 110, textAlign: 'center' }}
                    >
                      {vehiculo?.ano || '-'}
                    </Text>
                    <Text
                      className={`text-center font-semibold ${esActivo ? 'text-green-600' : 'text-red-500'}`}
                      style={{ flex: 1, minWidth: 110, textAlign: 'center' }}
                    >
                      {vehiculo?.estado || '-'}
                    </Text>
                    <View
                      className="flex-row justify-center items-center"
                      style={{ flex: 1, minWidth: 180, flexShrink: 0, gap: 8 }}
                    >
                      <TouchableOpacity
                        className="bg-blue-500 px-3 py-1 rounded-full"
                        onPress={() => {
                          setVehiculoSeleccionado(vehiculo.id);
                          setMostrarEditar(true);
                        }}
                      >
                        <Text className="text-white text-sm">Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className={`px-3 py-1 rounded-full ${esActivo ? 'bg-red-500' : 'bg-green-500'}`}
                        onPress={() => toggleEstado(vehiculo.id, vehiculo.estado as string)}
                      >
                        <Text className="text-white text-sm">
                          {esActivo ? 'Deshabilitar' : 'Activar'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
            </View>
          </View>

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
