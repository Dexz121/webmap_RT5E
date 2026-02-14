// hooks/useRouteMapbox.ts
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setOrigin, setDestination, setTravelTimeInformation } from '@/slices/navSlice';

export function useRouteMapbox(origin, destination, role, setRoute, mapboxToken: string) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (origin && destination && role === 'pasajero') {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${mapboxToken}`;

      console.log("📦 Solicitando ruta a Mapbox:", url);

      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.routes?.length > 0) {
            const routeData = data.routes[0];
            setRoute(routeData.geometry);
            dispatch(setOrigin(origin));
            dispatch(setDestination(destination));
            dispatch(setTravelTimeInformation({
              distance: routeData.distance,
              duration: routeData.duration,
            }));
          } else {
            console.warn('⚠️ No se encontraron rutas.');
            setRoute(null);
          }
        })
        .catch(err => console.error('❌ Error al obtener la ruta:', err));
    }
  }, [origin, destination, role]);
}
