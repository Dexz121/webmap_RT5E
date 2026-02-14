// screens/Usuarios.tsx
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { router } from 'expo-router';
import Register from '@/app/register';
import VerUsuario from '@/screens/VerUsuario';

const USUARIOS_POR_PAGINA = 5;

export default function UsuariosIndex() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [usuarioParaVer, setUsuarioParaVer] = useState<string | null>(null);
  const [mostrarAgregar, setMostrarAgregar] = useState(false);

  const fetchUsuarios = async () => {
    try {
      // 🔑 Consulta solo pasajeros
      const q = query(collection(db, 'users'), where('role', '==', 'pasajero'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsuarios(data);
    } catch (error) {
      console.error('Error al obtener usuarios (pasajeros):', error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter((u) => {
    const f = busqueda.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(f) ||
      u.email?.toLowerCase().includes(f) ||
      u.telefono?.toLowerCase().includes(f)
    );
  });

  const totalPaginas = Math.ceil(usuariosFiltrados.length / USUARIOS_POR_PAGINA);
  const inicio = (paginaActual - 1) * USUARIOS_POR_PAGINA;
  const usuariosPagina = usuariosFiltrados.slice(inicio, inicio + USUARIOS_POR_PAGINA);

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, alignItems: 'center' }}
    >
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
                <Register
                  onSuccess={() => {
                    setMostrarAgregar(false);
                    fetchUsuarios();
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

      {/* Modal ver usuario */}
      <Modal visible={!!usuarioParaVer} transparent animationType="fade">
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
                {usuarioParaVer && <VerUsuario userId={usuarioParaVer} />}
              </ScrollView>
              <View className="border-t border-gray-200 p-4">
                <TouchableOpacity
                  onPress={() => setUsuarioParaVer(null)}
                  className="bg-gray-200 rounded px-4 py-2"
                >
                  <Text className="text-center text-black">Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Text className="text-2xl font-bold mb-4 text-center">Lista de Pasajeros</Text>

      <View className="w-full" style={{ width: '100%' }}>
        <View className="flex-row flex-wrap gap-2 justify-between mb-4">
          <TextInput
            placeholder="Buscar por nombre, correo o teléfono"
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
            <Text className="text-white font-semibold text-sm">+ Agregar Usuario</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-4" style={{ width: '100%' }}>
          <View style={{ width: '100%' }}>
            <View className="flex-row border-b border-gray-400 pb-2" style={{ width: '100%' }}>
              {['Nombre', 'Email', 'Teléfono', 'Acción'].map((h) => (
                <Text 
                  key={h} 
                  className="font-bold text-black text-center"
                  style={{ flex: 1, minWidth: 120, textAlign: 'center' }}
                >
                  {h}
                </Text>
              ))}
            </View>

            {usuariosPagina.map((usuario) => (
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
                    {usuario.telefono}
                  </Text>
                  <View 
                    className="flex-row justify-center"
                    style={{ flex: 1, minWidth: 160, flexShrink: 0, gap: 8 }}
                  >
                    <TouchableOpacity
                      className="bg-yellow-500 px-3 py-1 rounded-full"
                      onPress={() => setUsuarioParaVer(usuario.id)}
                    >
                      <Text className="text-white text-sm">Ver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-blue-500 px-3 py-1 rounded-full"
                      onPress={() => router.push(`/usuarios/editar/${usuario.id}`)}
                    >
                      <Text className="text-white text-sm">Editar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
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
