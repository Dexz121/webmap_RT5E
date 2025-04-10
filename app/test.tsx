import { View, Text, Image, SafeAreaView } from 'react-native';
import { useSelector } from "react-redux";
import { selectRole } from "../slices/userSlice";
import DriverScreen from '@/screens/DriverScreen';
import UserScreen from '@/screens/UserScreen';

const HomeScreen = () => {
  const role = useSelector(selectRole);

  console.log("Rol obtenido desde Redux:", role);

  if (role === 1) {
    console.log("Redirigiendo a DriverScreen");
    return <DriverScreen />;
  } else {
    console.log("Redirigiendo a UserScreen");
    return <UserScreen />;
  }
};

export default HomeScreen;
