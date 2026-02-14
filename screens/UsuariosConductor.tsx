// screens/UsuariosConductor.tsx
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, getDocs, getDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { router } from 'expo-router';
import { RotateCcw } from 'lucide-react-native';

const USUARIOS_POR_PAGINA = 5;

interface Usuario {
  id: string;
  displayName?: string;
  email?: string;
  telefono?: string;
  role?: string;
  estado?: 'activo' | 'deshabilitado' | string;
  id_vehiculo?: string;
  // campos calculados para la tabla
  movilVehiculo?: string | null; // el "movil" del doc Vehiculo
}

export default function UsuariosConductorIndex() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [reiniciandoId, setReiniciandoId] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    try {
      // 1) Traer conductores
      const q = query(collection(db, 'users'), where('role', '==', 'conductor'));
      const snapshot = await getDocs(q);
      const base = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Usuario, 'id'>) }));

      // 2) Enriquecer cada usuario con su "movil" desde Vehiculo (si tiene id_vehiculo)
      const enriquecidos: Usuario[] = await Promise.all(
        base.map(async (u) => {
          let movilVehiculo: string | null = null;
          const vehId = (u as any).id_vehiculo as string | undefined;
          if (vehId && vehId.trim() !== '') {
            try {
              const vehSnap = await getDoc(doc(db, 'Vehiculo', vehId));
              if (vehSnap.exists()) {
                const vehData = vehSnap.data() as { movil?: string };
                movilVehiculo = (vehData?.movil ?? null);
              }
            } catch (e) {
              console.warn('No se pudo leer Vehiculo para', u.id, e);
            }
          }
          return { ...(u as Usuario), movilVehiculo };
        })
      );

      setUsuarios(enriquecidos);
    } catch (error) {
      console.error('Error al obtener usuarios (conductores):', error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const ejecutarDeshabilitar = async (id: string) => {
    try {
      await updateDoc(doc(db, 'users', id), { role: 'pasajero' });
      fetchUsuarios();
    } catch (error) {
      console.error('Error al deshabilitar conductor:', error);
    }
  };

  const deshabilitarConductor = (id: string, displayName?: string) => {
    const nombre = displayName?.trim() || 'Este conductor';
    const mensaje = `${nombre} pasará a ser pasajero y dejará de aparecer en la lista de conductores. Ahora aparecerá en la tabla de Pasajeros. ¿Continuar?`;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      if (window.confirm(`Confirmar deshabilitar\n\n${mensaje}`)) {
        ejecutarDeshabilitar(id);
      }
      return;
    }

    Alert.alert('Confirmar deshabilitar', mensaje, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Deshabilitar', style: 'destructive', onPress: () => ejecutarDeshabilitar(id) },
    ]);
  };

  const reiniciarConductor = async (id: string) => {
    setReiniciandoId(id);
    try {
      await updateDoc(doc(db, 'users', id), {
        viaje_activo_id: null,
        estado: 'offline',
      });
      fetchUsuarios();
    } catch (error) {
      console.error('Error al reiniciar conductor:', error);
    } finally {
      setReiniciandoId(null);
    }
  };

  // Filtro + ordenamiento:
  // - Filtra por nombre, email, teléfono o número de móvil (del vehículo)
  // - Orden: activos primero, luego deshabilitados
  // - Dentro de cada grupo, orden numérico por movilVehiculo
  const usuariosFiltrados = usuarios
    .filter((u) => {
      const f = busqueda.toLowerCase();
      return (
        (u.displayName || '').toLowerCase().includes(f) ||
        (u.email || '').toLowerCase().includes(f) ||
        (u.telefono || '').toLowerCase().includes(f) ||
        (u.movilVehiculo || '').toLowerCase().includes(f)
      );
    })
    .sort((a, b) => {
      const estadoA = a.estado || 'activo';
      const estadoB = b.estado || 'activo';

      if (estadoA !== estadoB) {
        return estadoA === 'activo' ? -1 : 1;
      }

      // Orden numérico por "movil" del vehículo (vacíos al final dentro del grupo)
      const nA = Number.parseInt(a.movilVehiculo || '', 10);
      const nB = Number.parseInt(b.movilVehiculo || '', 10);

      const isNa = Number.isNaN(nA);
      const isNb = Number.isNaN(nB);
      if (isNa && isNb) return 0;
      if (isNa) return 1; // a sin número va después
      if (isNb) return -1; // b sin número va después
      return nA - nB;
    });

  const totalPaginas = Math.ceil(usuariosFiltrados.length / USUARIOS_POR_PAGINA);
  const inicio = (paginaActual - 1) * USUARIOS_POR_PAGINA;
  const usuariosPagina = usuariosFiltrados.slice(inicio, inicio + USUARIOS_POR_PAGINA);

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, alignItems: 'center' }}
    >
      <Text className="text-2xl font-bold mb-4 text-center">Lista de Conductores</Text>

      <View className="w-full" style={{ width: '100%' }}>
        <View className="flex-row flex-wrap gap-2 justify-between mb-4">
          <TextInput
            placeholder="Buscar por nombre, correo o número de móvil"
            className="border border-gray-300 rounded-md px-4 py-2"
            style={{ flex: 1, minWidth: 200 }}
            value={busqueda}
            onChangeText={(text) => {
              setBusqueda(text);
              setPaginaActual(1);
            }}
          />
        </View>

        <View className="mb-4" style={{ width: '100%' }}>
          <View style={{ width: '100%' }}>
            <View className="flex-row border-b border-gray-400 pb-2" style={{ width: '100%' }}>
              {['Nombre', 'Email', 'Número de Móvil', 'Estado', 'Acción'].map((h) => (
                <Text 
                  key={h} 
                  className="font-bold text-black text-center"
                  style={{ flex: 1, minWidth: 120, textAlign: 'center' }}
                >
                  {h}
                </Text>
              ))}
            </View>

            {usuariosPagina.map((usuario) => {
              const estado = usuario.estado || 'offline';
              const esActivo = estado === 'activo' || estado === 'disponible';
              return (
                <View
                  key={usuario.id}
                  className="flex-row border-b border-gray-200 py-2 items-center"
                  style={{ width: '100%' }}
                >
                  <Text 
                    className="text-center text-gray-800"
                    style={{ flex: 1, minWidth: 120, textAlign: 'center' }}
                  >
                    {usuario.displayName}
                  </Text>
                  <Text 
                    className="text-center text-gray-800"
                    style={{ flex: 1, minWidth: 120, textAlign: 'center' }}
                  >
                    {usuario.email}
                  </Text>
                  <Text 
                    className="text-center text-gray-800"
                    style={{ flex: 1, minWidth: 120, textAlign: 'center' }}
                  >
                    {usuario.movilVehiculo ?? '—'}
                  </Text>
                  <Text
                    className={`text-center font-semibold ${
                      esActivo ? 'text-green-600' : 'text-red-500'
                    }`}
                    style={{ flex: 1, minWidth: 120, textAlign: 'center' }}
                  >
                    {estado}
                  </Text>

                  <View 
                    className="flex-row justify-center items-center"
                    style={{ flex: 1, minWidth: 200, flexShrink: 0, gap: 8 }}
                  >
                    <TouchableOpacity
                      className="bg-blue-500 px-3 py-1 rounded-full"
                      onPress={() => router.push(`/usuarios/editar/${usuario.id}`)}
                    >
                      <Text className="text-white text-sm">Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-gray-600 px-2 py-1.5 rounded-full"
                      onPress={() => reiniciarConductor(usuario.id)}
                      disabled={!!reiniciandoId}
                      accessibilityLabel="Reiniciar"
                    >
                      {reiniciandoId === usuario.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <RotateCcw size={18} color="#fff" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-red-500 px-3 py-1 rounded-full"
                      onPress={() => deshabilitarConductor(usuario.id, usuario.displayName)}
                    >
                      <Text className="text-white text-sm">Deshabilitar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {totalPaginas > 1 && (
          <View className="flex-row justify-center space-x-2 mt-4">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
              <TouchableOpacity
                key={pagina}
                className={`px-4 py-2 rounded-full ${
                  paginaActual === pagina ? 'bg-yellow-500' : 'bg-gray-200'
                }`}
                onPress={() => setPaginaActual(pagina)}
              >
                <Text
                  className={`font-semibold ${
                    paginaActual === pagina ? 'text-white' : 'text-black'
                  }`}
                >
                  {pagina}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
