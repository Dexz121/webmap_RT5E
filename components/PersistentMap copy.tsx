import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxExample = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();

  useEffect(() => {
    mapboxgl.accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [-93.1167, 16.7528],
      zoom: 5
    });

    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            message: 'Foo',
            imageId: 1011,
            iconSize: [60, 60]
          },
          geometry: {
            type: 'Point',
            coordinates: [-66.324462, -16.024695]
          }
        },
        {
          type: 'Feature',
          properties: {
            message: 'Bar',
            imageId: 870,
            iconSize: [50, 50]
          },
          geometry: {
            type: 'Point',
            coordinates: [-61.21582, -15.971891]
          }
        },
        {
          type: 'Feature',
          properties: {
            message: 'Baz',
            imageId: 837,
            iconSize: [40, 40]
          },
          geometry: {
            type: 'Point',
            coordinates: [-63.292236, -18.281518]
          }
        }
      ]
    };

    for (const marker of geojson.features) {
      const el = document.createElement('div');
      const width = marker.properties.iconSize[0];
      const height = marker.properties.iconSize[1];
      el.className = 'marker';
      el.style.backgroundImage = `url(https://picsum.photos/id/${marker.properties.imageId}/${width}/${height})`;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      el.style.backgroundSize = '100%';
      el.style.display = 'block';
      el.style.border = 'none';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.padding = 0;

      el.addEventListener('click', () => {
        window.alert(marker.properties.message);
      });

      new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .addTo(mapRef.current);
    }
  }, []);

  return <div ref={mapContainerRef} id="map" style={{ height: '100%' }} />;
};

export default MapboxExample;