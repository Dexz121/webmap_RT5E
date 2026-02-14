import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSelector } from 'react-redux';
import { selectRole } from '@/slices/userSlice';
import { useConductoresAdmin, Conductor } from '@/hooks/useConductoresAdmin';
import { Asset } from 'expo-asset';

const taxiAsset = require('@/assets/images/taxi-1.png');

const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';
const DEFAULT_CENTER: [number, number] = [-93.1167, 16.7528];
const DEFAULT_ZOOM = 12.5;

export default function PersistentMap() {
  const role = useSelector(selectRole);
  const [taxis, setTaxis] = useState<Conductor[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map>();
  const popupRef = useRef<mapboxgl.Popup>();

  const refetchConductores = useConductoresAdmin(role, setTaxis);

  const handleRefresh = async () => {
    if (role !== 'admin') return;
    setRefreshing(true);
    try {
      await refetchConductores();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });
    (window as any).__map = map;
    mapRef.current = map;

    map.on('error', (e) => console.error('🛑 map error:', e?.error || e));

    map.on('load', async () => {
      console.log('✅ map load');
      await withStyle(map, async () => {
        await ensureSourceAndLayers(map);
        await ensureTaxiIcon(map);
        await setLayerVisibility(map);
        await bindHoverHandlers(map);
      });
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
    };
  }, []);

  // Update taxis
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    withStyle(map, () => {
      const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: 'FeatureCollection',
        features: taxis.map((t) => ({
          type: 'Feature',
          properties: {
            id: t.id,
            nombre: t.props?.nombre ?? 'Conductor',
            economico: String(t.props?.economico ?? '—'),
            telefono: String(t.props?.telefono ?? '—'),
            numeroEconomico: String(t.props?.numeroEconomico ?? '—'),
            active: !!t.props?.activo,
            estado: t.props?.estado ?? '',
          },
          geometry: { type: 'Point', coordinates: t.coord },
        })),
      };
      const src = map.getSource('taxis-source') as mapboxgl.GeoJSONSource | undefined;
      if (src) src.setData(geojson as any);
      else {
        map.addSource('taxis-source', { type: 'geojson', data: geojson as any });
        ensureLayers(map);
        setLayerVisibility(map);
        bindHoverHandlers(map);
      }
    });
  }, [taxis]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {role === 'admin' && (
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 10,
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 600,
            color: '#fff',
            backgroundColor: '#1f2937',
            border: '1px solid #111827',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            cursor: refreshing ? 'wait' : 'pointer',
          }}
        >
          {refreshing ? 'Actualizando...' : 'Actualizar mapa'}
        </button>
      )}
    </div>
  );

  // === helpers ===
  function withStyle<T = void>(map: mapboxgl.Map, fn: () => T | Promise<T>): Promise<T> {
    return new Promise((resolve) => {
      if (map.isStyleLoaded()) Promise.resolve(fn()).then(resolve);
      else map.once('load', () => Promise.resolve(fn()).then(resolve));
    });
  }

  async function ensureSourceAndLayers(map: mapboxgl.Map) {
    if (!map.getSource('taxis-source')) {
      map.addSource('taxis-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] } as any,
      });
    }
    ensureLayers(map);
  }

  function ensureLayers(map: mapboxgl.Map) {
    // Círculo (fondo de estado)
    if (!map.getLayer('taxis-circle')) {
      map.addLayer({
        id: 'taxis-circle',
        type: 'circle',
        source: 'taxis-source',
        paint: {
          'circle-color': [
            'case',
            ['==', ['get', 'active'], true],
            '#f59e0b', // naranja
            '#22c55e', // verde
          ],
          'circle-radius': 20, // ligeramente más grande
          'circle-opacity': 0.85,
          'circle-stroke-color': '#111827',
          'circle-stroke-width': 1.25,
        },
        layout: { visibility: 'visible' },
      });
    }

    // Ícono del taxi ENCIMA del círculo
    if (!map.getLayer('taxis-symbol')) {
      map.addLayer(
        {
          id: 'taxis-symbol',
          type: 'symbol',
          source: 'taxis-source',
          layout: {
            'icon-image': 'taxi',
            'icon-size': 0.05, // un poquito más pequeño que el círculo
            'icon-anchor': 'center',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            visibility: 'visible',
          },
        },
        // 👇 colocamos esta capa después del círculo para asegurar el orden
        undefined
      );
    }
  }

  async function ensureTaxiIcon(map: mapboxgl.Map) {
    if (map.hasImage('taxi')) return;
    try {
      const asset = Asset.fromModule(taxiAsset);
      await asset.downloadAsync();
      await new Promise<void>((res) => {
        map.loadImage(asset.uri, (err, image) => {
          if (!err && image) {
            const pr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
            map.addImage('taxi', image as any, { pixelRatio: pr });
            console.log('➕ addImage("taxi") ok');
          } else {
            console.warn('⚠️ loadImage falló (fallback solo círculo).', err);
          }
          res();
        });
      });
    } catch (e) {
      console.warn('⚠️ expo-asset error (fallback solo círculo).', e);
    }
  }

  async function setLayerVisibility(map: mapboxgl.Map) {
    const hasIcon = map.hasImage('taxi');
    try {
      if (map.getLayer('taxis-symbol'))
        map.setLayoutProperty('taxis-symbol', 'visibility', hasIcon ? 'visible' : 'visible');
      if (map.getLayer('taxis-circle'))
        map.setLayoutProperty('taxis-circle', 'visibility', 'visible');
    } catch (e) {
      console.warn('setLayerVisibility ignorado (style no listo)', e);
    }
  }

  async function bindHoverHandlers(map: mapboxgl.Map) {
    if ((map as any).__taxisHoverBound) return;
    (map as any).__taxisHoverBound = true;

    const showPopup = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      const f = e.features?.[0];
      if (!f) return;
      const { coordinates } = f.geometry as GeoJSON.Point;
      const props = f.properties as any;

      const activo =
        typeof props?.active === 'boolean'
          ? props.active
          : props?.active === 'true' || props?.active === true;

      const bg = activo ? '#f59e0b' : '#22c55e';
      const movil = props?.economico ?? '—';
      const numEco = props?.numeroEconomico ?? '—';
      const tel = props?.telefono ?? '—';
      const html = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;min-width:200px">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:12px;height:12px;border-radius:9999px;background:${bg};border:1px solid #111"></div>
            <strong style="font-size:14px">Móvil ${movil}</strong>
          </div>
          <div style="margin-top:6px;font-size:12px;color:#111">
            Nº económico: <b>${numEco}</b><br/>
            Tel: <b>${tel}</b><br/>
            Conductor: <b>${props?.nombre ?? '—'}</b><br/>
            Estado: <b>${activo ? 'Con viaje' : 'Libre'}</b>
          </div>
        </div>
      `;

      if (!popupRef.current) {
        popupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 10,
        });
      }
      popupRef.current.setLngLat(coordinates as any).setHTML(html).addTo(map);
      map.getCanvas().style.cursor = 'pointer';
    };

    const leave = () => {
      popupRef.current?.remove();
      map.getCanvas().style.cursor = '';
    };

    map.on('mousemove', 'taxis-symbol', showPopup);
    map.on('mouseenter', 'taxis-symbol', showPopup);
    map.on('mouseleave', 'taxis-symbol', leave);

    map.on('mousemove', 'taxis-circle', showPopup);
    map.on('mouseenter', 'taxis-circle', showPopup);
    map.on('mouseleave', 'taxis-circle', leave);
  }
}
