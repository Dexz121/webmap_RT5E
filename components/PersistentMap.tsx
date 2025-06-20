// components/PersistentMap.tsx
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
import { useDispatch, useSelector } from 'react-redux';
import { selectRole } from '../slices/userSlice';
import { setOrigin, setDestination, setTravelTimeInformation } from '../slices/navSlice';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const MAPBOX_TOKEN = 'pk.eyJ1IjoicnRheGlzIiwiYSI6ImNtNDV3eGd5cDEzZm4ydm9vZHlqbzV1cm0ifQ.nrakoOEvPEysBDbRU1cyHQ';
Mapbox.setAccessToken(MAPBOX_TOKEN);

const DEFAULT_CENTER: [number, number] = [-93.1167, 16.7528];
const iconOrigen = require('../assets/images/viajes.png');
const iconDestino = require('../assets/images/origen.png');
const iconTaxi = require('../assets/images/carro.png');

export default function PersistentMap() {
  const dispatch = useDispatch();
  const role = useSelector(selectRole);

  const [origin, setLocalOrigin] = useState<[number, number] | null>(null);
  const [destination, setLocalDestination] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [taxis, setTaxis] = useState<{ id: string; coord: [number, number] }[]>([]);

  const handleUserLocationUpdate = (location: any) => {
    const coords: [number, number] = [
      location.coords.longitude,
      location.coords.latitude,
    ];
    setUserLocation(coords);
  };

  const handleMapPress = (e: any) => {
    if (role !== 'pasajero') return;

    const coords: [number, number] = e.geometry.coordinates;

    if (!origin) {
      setLocalOrigin(coords);
      setLocalDestination(null);
      setRoute(null);
    } else if (!destination) {
      setLocalDestination(coords);
    } else {
      setLocalOrigin(coords);
      setLocalDestination(null);
      setRoute(null);
    }
  };

  useEffect(() => {
    if (origin && destination && role === 'pasajero') {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes?.length > 0) {
            const routeData = data.routes[0];
            setRoute(routeData.geometry);

            dispatch(setOrigin(origin));
            dispatch(setDestination(destination));
            dispatch(setTravelTimeInformation({
              distance: routeData.distance, // en metros
              duration: routeData.duration, // en segundos
            }));
          } else {
            setRoute(null);
          }
        })
        .catch((err) => console.error('Error al obtener la ruta:', err));
    }
  }, [origin, destination, role]);

  useEffect(() => {
    if (role === 'admin' || role === 'conductor') {
      const cargarTaxis = async () => {
        try {
          const q = query(collection(db, 'usuarios'), where('role', '==', 'pasajero'));
          const snapshot = await getDocs(q);
          const taxisList: { id: string; coord: [number, number] }[] = [];

          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.ubicacion?.latitude && data.ubicacion?.longitude) {
              taxisList.push({
                id: doc.id,
                coord: [data.ubicacion.longitude, data.ubicacion.latitude],
              });
            }
          });

          setTaxis(taxisList);
        } catch (error) {
          console.error('Error al cargar taxis:', error);
        }
      };

      cargarTaxis();
    }
  }, [role]);

  return (
    <MapView style={StyleSheet.absoluteFill} onPress={handleMapPress}>
      <Camera
        zoomLevel={14}
        centerCoordinate={origin || userLocation || DEFAULT_CENTER}
      />
      <UserLocation visible onUpdate={handleUserLocationUpdate} />
      <LocationPuck />

      {origin && (
        <PointAnnotation id="origen" coordinate={origin}>
          <Image source={iconOrigen} style={{ width: 30, height: 30 }} />
        </PointAnnotation>
      )}

      {destination && (
        <PointAnnotation id="destino" coordinate={destination}>
          <Image source={iconDestino} style={{ width: 30, height: 30 }} />
        </PointAnnotation>
      )}

      {route && (
        <ShapeSource id="route" shape={{ type: 'Feature', geometry: route, properties: {} }}>
          <LineLayer id="routeLine" style={{ lineColor: 'blue', lineWidth: 4 }} />
        </ShapeSource>
      )}

      {taxis.map((taxi) => (
        <PointAnnotation key={taxi.id} id={`taxi-${taxi.id}`} coordinate={taxi.coord}>
          <Image source={iconTaxi} style={{ width: 30, height: 30 }} />
        </PointAnnotation>
      ))}
    </MapView>
  );
}
