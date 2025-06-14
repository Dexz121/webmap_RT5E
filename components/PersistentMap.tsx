//app/PersistentMap.txs
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Mapbox, {
  MapView,
  Camera,
  LocationPuck,
  PointAnnotation,
  ShapeSource,
  LineLayer,
  UserLocation,
} from '@rnmapbox/maps';

const MAPBOX_TOKEN = 'pk.eyJ1IjoicnRheGlzIiwiYSI6ImNtNDV3eGd5cDEzZm4ydm9vZHlqbzV1cm0ifQ.nrakoOEvPEysBDbRU1cyHQ';
Mapbox.setAccessToken(MAPBOX_TOKEN);
const iconOrigen = require('../assets/images/viajes.png');
const iconDestino = require('../assets/images/origen.png');
const DEFAULT_CENTER: [number, number] = [-93.1167, 16.7528];

export default function PersistentMap({
  onDestinationSelect,
  customOrigin = null,
  destination = null,
}: {
  onDestinationSelect?: (coord: [number, number]) => void;
  customOrigin?: [number, number] | null;
  destination?: [number, number] | null;
}) {
  const [currentOrigin, setCurrentOrigin] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<any>(null);

  const handleUserLocationUpdate = (location: any) => {
    const coords: [number, number] = [
      location.coords.longitude,
      location.coords.latitude,
    ];
    if (!customOrigin && !currentOrigin) {
      setCurrentOrigin(coords);
    }
  };

  useEffect(() => {
    const originToUse = customOrigin || currentOrigin;
    if (originToUse && destination) {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originToUse[0]},${originToUse[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes?.length > 0) {
            setRoute(data.routes[0].geometry);
          } else {
            setRoute(null);
          }
        })
        .catch((err) => console.error('Error al obtener la ruta:', err));
    }
  }, [customOrigin, currentOrigin, destination]);

  const handleMapPress = (e: any) => {
    const coords = e.geometry.coordinates;
    if (onDestinationSelect) onDestinationSelect(coords);
  };

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      onPress={handleMapPress}
    >
      <Camera
        zoomLevel={14}
        centerCoordinate={customOrigin || currentOrigin || DEFAULT_CENTER}
      />
      <UserLocation visible onUpdate={handleUserLocationUpdate} />
      <LocationPuck />

      {customOrigin && (
        <PointAnnotation id="origen" coordinate={customOrigin}>
          <Image source={iconOrigen} style={{ width: 30, height: 30 }} />
        </PointAnnotation>
      )}

      {destination && (
        <PointAnnotation id="destino" coordinate={destination}>
          <Image source={iconDestino} style={{ width: 30, height: 30 }} />
        </PointAnnotation>
      )}

      {route && (
        <ShapeSource id="route" shape={{ type: 'Feature', geometry: route }}>
          <LineLayer id="routeLine" style={{ lineColor: 'blue', lineWidth: 4 }} />
        </ShapeSource>
      )}
    </MapView>
  );
}
