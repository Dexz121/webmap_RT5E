// app/usuarios/[id].tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, router } from 'expo-router';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';

type Usuario = {
  displayName?: string;
  email?: string;
  telefono?: string;
  role?: 'pasajero' | 'conductor';
  metodo_pago_predeterminado?: 'efectivo' | 'tarjeta' | 'paypal';
  licencia_conducir?: string;
  expiracion_licencia?: string;
  verificacion_antecedentes?: 'Verificado' | 'Pendiente';
  estado?: 'Activo' | 'Inactivo';
  // nuevo vínculo: guardaremos AQUÍ el id del documento de Vehiculo
  id_vehiculo?: string | null;

  movil_asignado?: string | null;
};

type Vehiculo = {
  id: string;
  movil?: string | number | null;
  numero_economico?: string | number | null;
  placas?: string | null;
  marca?: string | null;
  estado?: string | null; // 'activo', etc.
};

export default function EditarUsuario() {
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Usuario>({});
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [cargandoVehiculos, setCargandoVehiculos] = useState(false);
  const [asignados, setAsignados] = useState<Set<string>>(new Set());

  const handleChange = (key: keyof Usuario, value: any) => {
    console.log('✏️ form change:', key, '=>', value);
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'role' && value === 'conductor') {
        updated.estado = 'disponible' as any;
      }
      return updated;
    });
  };

  // 1) Cargar usuario
  useEffect(() => {
    const cargarUsuario = async () => {
      if (!id) {
        console.log('⚠️ Sin id en params');
        return;
      }
      console.log('📥 Cargando usuario:', id);
      try {
        const ref = doc(db, 'users', String(id));
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          console.log('⚠️ Usuario no encontrado');
          Alert.alert('Error', 'Usuario no encontrado');
          router.back();
          return;
        }
        const data = snap.data() as Usuario;
        console.log('✅ Usuario:', data);
        setForm({
          ...data,
          id_vehiculo:
            typeof data.id_vehiculo === 'string' && data.id_vehiculo.length > 0
              ? data.id_vehiculo
              : null,
        });
      } catch (e) {
        console.error('❌ Error cargando usuario:', e);
        Alert.alert('Error', 'No se pudo cargar el usuario');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    cargarUsuario();
  }, [id]);

  // 2) Cargar vehículos (y conductores que ya tienen id_vehiculo)
  useEffect(() => {
    const cargarVehiculosYAsignados = async () => {
      console.log('📥 Cargando colección Vehiculo…');
      setCargandoVehiculos(true);
      try {
        // Vehículos
        const vsnap = await getDocs(collection(db, 'Vehiculo'));
        const lista: Vehiculo[] = vsnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        console.log('🔎 Vehículos RAW:', lista);

        // Conductores con id_vehiculo (asignaciones actuales)
        const condQ = query(collection(db, 'users'), where('role', '==', 'conductor'));
        const condSnap = await getDocs(condQ);
        const assigned = new Set<string>();
        condSnap.forEach((d) => {
          const u = d.data() as any;
          if (u?.id_vehiculo && typeof u.id_vehiculo === 'string') {
            assigned.add(u.id_vehiculo);
          }
        });
        console.log('🔎 Vehículos ya asignados (ids):', Array.from(assigned));

        setVehiculos(lista);
        setAsignados(assigned);
      } catch (e) {
        console.error('❌ Error cargando vehículos/asignados:', e);
        Alert.alert('Error', 'No se pudieron cargar los vehículos');
      } finally {
        setCargandoVehiculos(false);
      }
    };
    // Sólo tiene sentido cuando es conductor o está cambiando a conductor
    if (!loading && form.role === 'conductor') {
      cargarVehiculosYAsignados();
    }
  }, [loading, form.role]);

  // 3) Opciones del Picker (filtramos los ya asignados, excepto el propio seleccionado)
  const vehiculoOptions = useMemo(() => {
    // opcional: filtrar solo activos
    const activos = vehiculos.filter((v) => {
      const estado = String(v.estado ?? '').toLowerCase();
      return estado === '' || estado === 'activo';
    });

    const disponibles = activos.filter(
      (v) => !asignados.has(v.id) || v.id === form.id_vehiculo // permitir ver el propio
    );

    // orden por móvil numérico (si se puede)
    const toNum = (m: string) => {
      const n = parseInt(m.replace(/[^\d]/g, ''), 10);
      return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
    };

    const items = disponibles
      .map((v) => {
        const movilText = String(v.movil ?? '').trim(); // acepta string o number
        const eco = String(v.numero_economico ?? '').trim();
        const placas = String(v.placas ?? '').trim();
        const marca = String(v.marca ?? '').trim();

        const label = [
          movilText ? `Móvil ${movilText}` : '',
          eco ? `Nº Eco ${eco}` : '',
          placas,
          marca,
        ]
          .filter(Boolean)
          .join(' — ');

        return {
          id: v.id, // VALUE del Picker
          label,
          movilText,
          sortKey: toNum(movilText),
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey);

    console.log('✅ Opciones de Picker (vehículo):', items);
    return items;
  }, [vehiculos, asignados, form.id_vehiculo]);

  const handleUpdate = async () => {
    try {
      if (!id) return;
      console.log('📤 Guardando usuario. form:', form);

      const ref = doc(db, 'users', String(id));

      const roleActual = form.role ?? 'pasajero';
      const estadoFinal = roleActual === 'conductor' 
        ? (form.estado ?? 'disponible')
        : (form.estado ?? 'Activo');

      // Construimos payload explícito (respetando tus campos originales)
      const payload: Usuario = {
        displayName: form.displayName ?? '',
        email: form.email ?? '',
        telefono: form.telefono ?? '',
        role: roleActual,
        metodo_pago_predeterminado: form.metodo_pago_predeterminado ?? 'efectivo',
        licencia_conducir: form.licencia_conducir ?? '',
        expiracion_licencia: form.expiracion_licencia ?? '',
        verificacion_antecedentes: form.verificacion_antecedentes ?? 'Pendiente',
        estado: estadoFinal as any,
        // clave nueva: guardamos el ID del documento de Vehiculo
        id_vehiculo: form.id_vehiculo ?? null,

        // campo legado: lo dejamos como está si existía (no lo usamos ya)
        movil_asignado:
          form.movil_asignado === undefined || form.movil_asignado === ''
            ? null
            : String(form.movil_asignado),
      };

      console.log('📤 Payload final:', payload);
      await updateDoc(ref, payload as any);
      Alert.alert('Actualizado', 'Usuario actualizado con éxito');
      router.replace('/');
    } catch (e) {
      console.error('❌ Error al actualizar:', e);
      Alert.alert('Error', 'No se pudo actualizar');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Cargando…</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-6 py-8 items-center">
      <Text className="text-2xl font-bold text-center mb-6">Editar Usuario</Text>

      <View className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <View>
          <Text className="text-gray-700 mb-1">Nombre</Text>
          <TextInput
            value={form.displayName ?? ''}
            onChangeText={(v) => handleChange('displayName', v)}
            className="border rounded px-4 py-2"
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-1">Correo Electrónico</Text>
          <TextInput
            value={form.email ?? ''}
            onChangeText={(v) => handleChange('email', v)}
            className="border rounded px-4 py-2"
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-1">Teléfono</Text>
          <TextInput
            value={form.telefono ?? ''}
            onChangeText={(v) => handleChange('telefono', v)}
            className="border rounded px-4 py-2"
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-1">Tipo de Usuario</Text>
          <View className="border rounded overflow-hidden">
            <Picker
              selectedValue={form.role ?? 'pasajero'}
              onValueChange={(v) => handleChange('role', v as Usuario['role'])}
            >
              <Picker.Item label="Pasajero" value="pasajero" />
              <Picker.Item label="Conductor" value="conductor" />
            </Picker>
          </View>
        </View>

        {form.role === 'pasajero' && (
          <View>
            <Text className="text-gray-700 mb-1">Método de Pago</Text>
            <View className="border rounded overflow-hidden">
              <Picker
                selectedValue={form.metodo_pago_predeterminado ?? 'efectivo'}
                onValueChange={(v) => handleChange('metodo_pago_predeterminado', v)}
              >
                <Picker.Item label="Efectivo" value="efectivo" />
                <Picker.Item label="Tarjeta" value="tarjeta" />
                <Picker.Item label="Paypal" value="paypal" />
              </Picker>
            </View>
          </View>
        )}

        {form.role === 'conductor' && (
          <>
            <View>
              <Text className="text-gray-700 mb-1">Licencia</Text>
              <TextInput
                value={form.licencia_conducir ?? ''}
                onChangeText={(v) => handleChange('licencia_conducir', v)}
                className="border rounded px-4 py-2"
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-1">Expiración Licencia</Text>
              <TextInput
                value={form.expiracion_licencia ?? ''}
                onChangeText={(v) => handleChange('expiracion_licencia', v)}
                className="border rounded px-4 py-2"
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-1">Verificación de Antecedentes</Text>
              <View className="border rounded overflow-hidden">
                <Picker
                  selectedValue={form.verificacion_antecedentes ?? 'Pendiente'}
                  onValueChange={(v) =>
                    handleChange('verificacion_antecedentes', v)
                  }
                >
                  <Picker.Item label="Verificado" value="Verificado" />
                  <Picker.Item label="Pendiente" value="Pendiente" />
                </Picker>
              </View>
            </View>

            <View>
              <Text className="text-gray-700 mb-1">Movil asignado</Text>
              <TextInput
                value={form.movil_asignado ?? ''}
                onChangeText={(v) =>
                  handleChange('movil_asignado', v.trim() === '' ? null : v)
                }
                placeholder="Número económico (ej. 0132)"
                className="border rounded px-4 py-2"
              />
            </View>

            <View className="md:col-span-2">
              <Text className="text-gray-700 mb-1">Asignar número de móvil</Text>
              <View className="border rounded overflow-hidden">
                <Picker
                  enabled={!cargandoVehiculos}
                  selectedValue={form.id_vehiculo ?? ''}
                  onValueChange={(vehId) => {
                    console.log('📌 Vehículo seleccionado (id):', vehId);
                    handleChange('id_vehiculo', vehId === '' ? null : (vehId as string));
                  }}
                >
                  <Picker.Item
                    label={
                      cargandoVehiculos ? 'Cargando vehículos…' : '— Selecciona un móvil —'
                    }
                    value=""
                  />
                  {vehiculoOptions.map((opt) => (
                    <Picker.Item key={opt.id} label={opt.label} value={opt.id} />
                  ))}
                </Picker>
              </View>
              {form.id_vehiculo ? (
                <Text className="text-xs text-gray-500 mt-1">
                  Vehículo seleccionado: {form.id_vehiculo}
                </Text>
              ) : (
                <Text className="text-xs text-gray-500 mt-1">
                  Solo aparecen vehículos no asignados a otros conductores.
                </Text>
              )}
            </View>
          </>
        )}

        <View>
          <Text className="text-gray-700 mb-1">Estado</Text>
          <View className="border rounded overflow-hidden">
            <Picker
              selectedValue={form.estado ?? (form.role === 'conductor' ? 'disponible' : 'Activo')}
              onValueChange={(v) => handleChange('estado', v as any)}
            >
              {form.role === 'conductor' ? (
                <>
                  <Picker.Item label="Disponible" value="disponible" />
                  <Picker.Item label="Ocupado" value="ocupado" />
                  <Picker.Item label="Offline" value="offline" />
                </>
              ) : (
                <>
                  <Picker.Item label="Activo" value="Activo" />
                  <Picker.Item label="Inactivo" value="Inactivo" />
                </>
              )}
            </Picker>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="mt-6 py-3 rounded-lg w-full max-w-3xl bg-yellow-500"
        onPress={handleUpdate}
      >
        <Text className="text-white text-center font-semibold text-base">
          Guardar Cambios
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
