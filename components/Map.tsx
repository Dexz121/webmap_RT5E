//app/Map.txs
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import Mapbox, {
  MapView,
  Camera,
  UserLocation,
  LocationPuck,
  ShapeSource,
  LineLayer,
  PointAnnotation,
} from '@rnmapbox/maps';

const MAPBOX_TOKEN = 'pk.eyJ1IjoicnRheGlzIiwiYSI6ImNtNDV3eGd5cDEzZm4ydm9vZHlqbzV1cm0ifQ.nrakoOEvPEysBDbRU1cyHQ';
Mapbox.setAccessToken(MAPBOX_TOKEN);

const DEFAULT_CENTER: [number, number] = [-93.1167, 16.7528];

export default function Map() {
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<any>(null);

  const handleMapPress = (e: any) => {
    const coords: [number, number] = e.geometry.coordinates;

    if (!origin) {
      setOrigin(coords);
      setDestination(null);
      setRoute(null);
    } else if (!destination) {
      setDestination(coords);
    } else {
      // Reiniciar si ya estaban marcados ambos
      setOrigin(coords);
      setDestination(null);
      setRoute(null);
    }
  };

  useEffect(() => {
    if (origin && destination) {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes && data.routes.length > 0) {
            setRoute(data.routes[0].geometry);
          } else {
            console.warn("No se encontró una ruta.");
            setRoute(null);
          }
        })
        .catch((err) => console.error("Error al obtener la ruta:", err));
    }
  }, [origin, destination]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        onPress={handleMapPress}
      >
        <Camera
          zoomLevel={14}
          centerCoordinate={origin || DEFAULT_CENTER}
        />
        <UserLocation visible={true} />
        <LocationPuck />

        {origin && (
          <PointAnnotation id="origin" coordinate={origin} />
        )}

        {destination && (
          <PointAnnotation id="destination" coordinate={destination} />
        )}

        {route && (
          <ShapeSource id="route" shape={{ type: 'Feature', geometry: route }}>
            <LineLayer id="routeLine" style={{ lineColor: 'blue', lineWidth: 4 }} />
          </ShapeSource>
        )}
      </MapView>
    </SafeAreaView>
  );
}
