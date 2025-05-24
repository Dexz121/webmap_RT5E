import React from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox, {MapView, Camera, LocationPuck} from '@rnmapbox/maps';


Mapbox.setAccessToken('pk.eyJ1IjoicnRheGlzIiwiYSI6ImNtNDV3eGd5cDEzZm4ydm9vZHlqbzV1cm0ifQ.nrakoOEvPEysBDbRU1cyHQ');

const App = () => {
  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <MapView style={styles.map} >
        <Camera zoomLevel={11.6}  centerCoordinate={[-93.1167, 16.7528]}/>
        <LocationPuck/>
        </MapView>
      </View>
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: '100%',
    width: '100%',
  },
  map: {
    flex: 1
  }
});