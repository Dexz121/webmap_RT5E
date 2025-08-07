// components/PersistentMap.tsx
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSelector } from 'react-redux';
import { selectRole } from '@/slices/userSlice';
import { useConductoresAdmin } from '@/hooks/useConductoresAdmin';

const TOKEN = 'pk.eyJ1IjoicnRheGlzIiwiYSI6ImNtNDV3eGd5cDEzZm4ydm9vZHlqbzV1cm0ifQ.nrakoOEvPEysBDbRU1cyHQ';
const DEFAULT_CENTER: [number, number] = [-93.1167, 16.7528];
const DEFAULT_ZOOM = 12.5;

export default function PersistentMap() {
  const role = useSelector(selectRole);
  const [taxis, setTaxis] = useState<{ id: string; coord: [number, number] }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map>();

  useConductoresAdmin(role, setTaxis);

  useEffect(() => {
    if (!containerRef.current) return;

    mapboxgl.accessToken = TOKEN;
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    map.on('load', () => {
      const geojson = {
        type: 'FeatureCollection',
        features: taxis.map((taxi) => ({
          type: 'Feature',
          properties: { id: taxi.id },
          geometry: {
            type: 'Point',
            coordinates: taxi.coord,
          },
        })),
      };

      if (map.getSource('taxis-source')) {
        (map.getSource('taxis-source') as mapboxgl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource('taxis-source', { type: 'geojson', data: geojson });
        map.addLayer({
          id: 'taxis-layer',
          type: 'circle',
          source: 'taxis-source',
          paint: {
            'circle-radius': 8,
            'circle-color': '#007cbf',
          },
        });
      }
    });

    return () => {
      map.off('load');
    };
  }, [taxis]);


  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  );
}
