// app/usuarios/index.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { router } from 'expo-router';

const USUARIOS_POR_PAGINA = 5;

export default function UsuariosIndex() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  const fetchUsuarios = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsuarios(data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const toggleEstado = async (id: string, estado: string) => {
    const nuevoEstado = estado === 'activo' ? 'deshabilitado' : 'activo';
    try {
      await updateDoc(doc(db, 'users', id), { estado: nuevoEstado });
      fetchUsuarios();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

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
      <Text className="text-2xl font-bold mb-4 text-center">Lista de Usuarios</Text>

      <View className="w-full max-w-5xl">
        <View className="flex-row justify-between mb-4">
          <TextInput
            placeholder="Buscar por nombre, correo o teléfono"
            className="border border-gray-300 rounded-md px-4 py-2 w-1/2"
            value={busqueda}
            onChangeText={(text) => {
              setBusqueda(text);
              setPaginaActual(1);
            }}
          />

          <TouchableOpacity
            className="bg-yellow-500 rounded-xl py-2 px-4"
            onPress={() => router.push('/usuarios/agregar')}
          >
            <Text className="text-white font-semibold text-sm">+ Agregar Usuario</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal className="mb-4">
          <View>
            <View className="flex-row border-b border-gray-400 pb-2">
              {["Nombre", "Email", "Rol", "Teléfono", "Estado", "Acción"].map((h) => (
                <Text key={h} className="w-40 font-bold text-black text-center">
                  {h}
                </Text>
              ))}
            </View>

            {usuariosPagina.map((usuario) => {
              const estado = usuario.estado || 'activo';
              const esActivo = estado === 'activo';
              return (
                <View
                  key={usuario.id}
                  className="flex-row border-b border-gray-200 py-2 items-center"
                >
                  <Text className="w-40 text-center text-gray-800">{usuario.displayName}</Text>
                  <Text className="w-40 text-center text-gray-800">{usuario.email}</Text>
                  <Text className="w-40 text-center text-gray-800">{usuario.role}</Text>
                  <Text className="w-40 text-center text-gray-800">{usuario.telefono}</Text>
                  <Text
                    className={`w-40 text-center font-semibold ${
                      esActivo ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {estado}
                  </Text>

                  <View className="w-40 flex-row justify-center space-x-2">
                    <TouchableOpacity
                      className="bg-yellow-500 px-3 py-1 rounded-full"
                      onPress={() => router.push(`/usuarios/ver/${usuario.id}`)}
                    >
                      <Text className="text-white text-sm">Ver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-blue-500 px-3 py-1 rounded-full"
                      onPress={() => router.push(`/usuarios/editar/${usuario.id}`)}
                    >
                      <Text className="text-white text-sm">Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`px-3 py-1 rounded-full ${
                        esActivo ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      onPress={() => toggleEstado(usuario.id, estado)}
                    >
                      <Text className="text-white text-sm">
                        {esActivo ? 'Deshabilitar' : 'Activar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

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
