import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';

type Timestamp = { toDate: () => Date };

interface ViajeRow {
  id: string;
  estado?: string | null;
  tipo?: string | null;
  distancia_km?: number | null;
  tarifa?: number | null;
  fecha_creacion?: Timestamp | null;
  fecha_inicio?: Timestamp | null;
  fecha_fin?: Timestamp | null;
  fecha_cancelacion?: Timestamp | null;
  uid_conductor?: string | null;
  uid_pasajero?: string | null;
  uid_vehiculo?: string | null;
}

function fmtDate(ts: Timestamp | null | undefined): string {
  if (!ts || typeof ts.toDate !== 'function') return '—';
  try {
    return ts.toDate().toLocaleString('es-MX', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

const COLUMNAS: { key: keyof ViajeRow | '#'; label: string; minW?: number }[] = [
  { key: '#', label: '#', minW: 44 },
  { key: 'estado', label: 'Estado', minW: 100 },
  { key: 'distancia_km', label: 'Distancia (km)', minW: 110 },
  { key: 'tarifa', label: 'Tarifa ($)', minW: 90 },
  { key: 'fecha_inicio', label: 'F. inicio', minW: 130 },
  { key: 'uid_conductor', label: 'Conductor', minW: 120 },
];

type TabViajes = 'concluidos' | 'cancelados';

export default function ViajesIndex() {
  const [viajes, setViajes] = useState<ViajeRow[]>([]);
  const [conductoresMap, setConductoresMap] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<TabViajes>('concluidos');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchViajes = async () => {
    setCargando(true);
    setError(null);
    try {
      const [viajesSnap, conductoresSnap] = await Promise.all([
        getDocs(collection(db, 'viajes')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'conductor'))),
      ]);
      const data = viajesSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ViajeRow[];
      const getTs = (v: ViajeRow) => v.fecha_creacion?.toDate?.()?.getTime() ?? 0;
      data.sort((a, b) => getTs(b) - getTs(a));
      setViajes(data.slice(0, 100));

      const map: Record<string, string> = {};
      conductoresSnap.docs.forEach((d) => {
        const dta = d.data() as { displayName?: string; email?: string };
        const nombre = (dta?.displayName ?? dta?.email ?? 'Conductor').trim() || d.id;
        map[d.id] = nombre;
      });
      setConductoresMap(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar viajes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchViajes();
  }, []);

  const viajesConcluidos = viajes.filter((v) => (v.estado ?? '').toLowerCase() === 'concluido');
  const viajesCancelados = viajes.filter((v) => (v.estado ?? '').toLowerCase() === 'cancelado');
  const listaActual = tab === 'concluidos' ? viajesConcluidos : viajesCancelados;

  const celda = (v: ViajeRow, key: keyof ViajeRow | '#', index: number): string => {
    if (key === '#') return String(index + 1);
    switch (key) {
      case 'estado':
        return v.estado ?? '—';
      case 'distancia_km':
        return v.distancia_km != null ? String(Number(v.distancia_km).toFixed(2)) : '—';
      case 'tarifa':
        return v.tarifa != null ? `$${Number(v.tarifa).toFixed(2)}` : '—';
      case 'fecha_inicio':
        return fmtDate(v.fecha_creacion as Timestamp | null);
      case 'uid_conductor':
        if (!v.uid_conductor || !String(v.uid_conductor).trim()) return 'Sin asignar';
        return conductoresMap[v.uid_conductor] ?? 'Sin asignar';
      default:
        return '—';
    }
  };

  if (cargando) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-gray-600 mt-2">Cargando viajes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <Text className="text-red-600 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="bg-white flex-1"
      contentContainerStyle={{ padding: 16 }}
      horizontal={false}
    >
      <View className="flex-row mb-4 gap-2">
        <TouchableOpacity
          onPress={() => setTab('concluidos')}
          className={`flex-1 py-3 rounded-lg ${tab === 'concluidos' ? 'bg-gray-800' : 'bg-gray-200'}`}
        >
          <Text
            className={`text-center font-semibold text-sm ${tab === 'concluidos' ? 'text-white' : 'text-gray-700'}`}
          >
            CONCLUIDOS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('cancelados')}
          className={`flex-1 py-3 rounded-lg ${tab === 'cancelados' ? 'bg-gray-800' : 'bg-gray-200'}`}
        >
          <Text
            className={`text-center font-semibold text-sm ${tab === 'cancelados' ? 'text-white' : 'text-gray-700'}`}
          >
            CANCELADOS
          </Text>
        </TouchableOpacity>
      </View>
      <Text className="text-2xl font-bold text-center mb-4">Lista de viajes</Text>
      <View style={{ width: '100%', alignItems: 'center' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          contentContainerStyle={{ paddingBottom: 8, flexGrow: 1, justifyContent: 'center' }}
          style={{ width: '100%' }}
        >
          <View className="border border-gray-300 rounded-lg overflow-hidden" style={{ alignSelf: 'center' }}>
          <View className="flex-row bg-gray-100 border-b border-gray-300">
            {COLUMNAS.map(({ label, minW = 100 }) => (
              <Text
                key={label}
                className="font-bold text-black text-sm px-2 py-3"
                style={{ minWidth: minW, width: minW, textAlign: 'center' }}
              >
                {label}
              </Text>
            ))}
          </View>
          {listaActual.length === 0 ? (
            <View className="py-8 px-4">
              <Text className="text-gray-500 text-center">
                {tab === 'concluidos' ? 'No hay viajes concluidos.' : 'No hay viajes cancelados.'}
              </Text>
            </View>
          ) : (
            listaActual.map((v, index) => (
              <View
                key={v.id}
                className="flex-row border-b border-gray-200 bg-white"
              >
                {COLUMNAS.map(({ key, minW = 100 }) => (
                  <Text
                    key={key}
                    className="text-gray-700 text-sm px-2 py-2"
                    style={{ minWidth: minW, width: minW, textAlign: 'center' }}
                    numberOfLines={1}
                  >
                    {celda(v, key, index)}
                  </Text>
                ))}
              </View>
            ))
          )}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}
