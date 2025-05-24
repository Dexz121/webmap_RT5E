import React, { useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import Mapbox, {
  MapView,
  Camera,
  LocationPuck,
  PointAnnotation,
  ShapeSource,
  LineLayer,
  UserLocation,
} from '@rnmapbox/maps';

// Importa los íconos personalizados
import iconDestino from '../assets/images/viajes.png';
import iconOrigen from '../assets/images/origen.png';

const MAPBOX_TOKEN = 'pk.eyJ1IjoicnRheGlzIiwiYSI6ImNtNDV3eGd5cDEzZm4ydm9vZHlqbzV1cm0ifQ.nrakoOEvPEysBDbRU1cyHQ';
Mapbox.setAccessToken(MAPBOX_TOKEN);

const DEFAULT_CENTER: [number, number] = [-93.1167, 16.7528];

const Map = ({
  onDestinationSelect,
  customOrigin = null,
  destination,
}: {
  onDestinationSelect: (coord: [number, number]) => void;
  customOrigin?: [number, number] | null;
  destination?: [number, number] | null;
}) => {
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
    if (
      originToUse &&
      Array.isArray(originToUse) &&
      destination &&
      Array.isArray(destination)
    ) {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originToUse[0]},${originToUse[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes && data.routes.length > 0) {
            setRoute(data.routes[0].geometry);
          } else {
            console.warn('No se encontraron rutas:', data);
            setRoute(null);
          }
        })
        .catch((err) => console.error('Error al obtener la ruta:', err));
    }
  }, [customOrigin, currentOrigin, destination]);

  const handleMapPress = (e: any) => {
    const { geometry } = e;
    onDestinationSelect(geometry.coordinates);
  };

  return (
    <View className="flex-1 items-center justify-center">
      <View className="h-full w-full">
        <MapView style={{ flex: 1 }} onPress={handleMapPress}>
          <Camera
            zoomLevel={14}
            centerCoordinate={customOrigin || currentOrigin || DEFAULT_CENTER}
          />
          <UserLocation visible={true} onUpdate={handleUserLocationUpdate} />
          <LocationPuck />

          {/* Marcador del origen (si es definido por el usuario) */}
          {customOrigin && (
            <PointAnnotation id="origen" coordinate={customOrigin}>
              <Image source={iconOrigen} style={{ width: 30, height: 30 }} />
            </PointAnnotation>
          )}

          {/* Marcador del destino */}
          {destination && (
            <PointAnnotation id="destino" coordinate={destination}>
              <Image source={iconDestino} style={{ width: 30, height: 30 }} />
            </PointAnnotation>
          )}

          {/* Ruta trazada */}
          {route && (
            <ShapeSource id="routeSource" shape={{ type: 'Feature', geometry: route }}>
              <LineLayer id="routeLine" style={{ lineColor: 'blue', lineWidth: 4 }} />
            </ShapeSource>
          )}
        </MapView>
      </View>
    </View>
  );
};

export default Map;
