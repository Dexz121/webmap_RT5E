// components/PersistentMap.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import Mapbox, {
  MapView,
  Camera,
  UserLocation,
  LocationPuck,
} from '@rnmapbox/maps';

Mapbox.setAccessToken('pk.eyJ1IjoicnRheGlzIiwiYSI6ImNtNDV3eGd5cDEzZm4ydm9vZHlqbzV1cm0ifQ.nrakoOEvPEysBDbRU1cyHQ');

const DEFAULT_CENTER: [number, number] = [-93.1167, 16.7528];

export default function PersistentMap() {
  return (
    <MapView
      style={StyleSheet.absoluteFill}
      attributionEnabled={false}
      logoEnabled={false}
      compassEnabled={false}
      zoomEnabled={false}
      scrollEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
    >
      <Camera zoomLevel={14} centerCoordinate={DEFAULT_CENTER} />
      <UserLocation visible />
      <LocationPuck />
    </MapView>
  );
}
