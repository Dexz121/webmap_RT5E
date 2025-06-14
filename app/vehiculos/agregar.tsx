import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from '../../firebase';
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";

const etiquetasCampos: Record<string, string> = {
  marca: "Marca",
  modelo: "Modelo",
  ano: "Año",
  color: "Color",
  placas: "Placa",
  numero_economico: "Número Económico",
};

export default function AddVehicleScreen() {
  const [form, setForm] = useState({
    id_conductor: "1",
    marca: "",
    modelo: "",
    ano: "",
    color: "",
    placas: "",
    estado: "Activo",
    fecha_adquisicion: "",
    numero_economico: "",
  });

  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const camposRequeridos = ["marca", "modelo", "ano", "color", "placas"];

  const generarIdVehiculo = async () => {
    const vehiculoRef = collection(db, "Vehiculo");
    const q = query(vehiculoRef, orderBy("id_vehiculo", "desc"), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return "VH-00001";

    const ultimo = snapshot.docs[0].data().id_vehiculo;
    const ultimoNumero = parseInt(ultimo.split("-")[1]) || 0;
    const nuevoNumero = (ultimoNumero + 1).toString().padStart(5, "0");
    return `VH-${nuevoNumero}`;
  };

  const handleSubmit = async () => {
    const camposFaltantes = camposRequeridos.filter(
      (campo) => !form[campo] || form[campo].trim() === ""
    );

    if (camposFaltantes.length > 0) {
      const mensaje = `Por favor completa los siguientes campos:\n\n${camposFaltantes
        .map((c) => `- ${etiquetasCampos[c] || c}`)
        .join("\n")}`;
      setErrorMsg(mensaje);
      return;
    }

    setGuardando(true);
    try {
      const id_vehiculo = await generarIdVehiculo();
      await addDoc(collection(db, "Vehiculo"), {
        id_vehiculo,
        id_conductor: form.id_conductor,
        marca: form.marca,
        modelo: form.modelo,
        ano: parseInt(form.ano),
        color: form.color,
        placas: form.placas,
        estado: form.estado,
        fecha_adquisicion: form.fecha_adquisicion,
        numero_economico: parseInt(form.numero_economico),
        fecha_creacion: Timestamp.now(),
        fecha_eliminacion: null,
      });

      Alert.alert("Éxito", `Vehículo registrado con ID: ${id_vehiculo}`);
      router.replace("/vehiculos");
    } catch (error) {
      console.error("Error al guardar:", error);
      Alert.alert("Error", "No se pudo guardar el vehículo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-4 py-8 items-center">
      <Text className="text-2xl font-bold text-center mb-6">
        Agregar Vehículo
      </Text>

      {errorMsg !== "" && (
        <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 max-w-2xl w-full">
          <Text className="text-red-800 whitespace-pre-line">{errorMsg}</Text>
          <TouchableOpacity onPress={() => setErrorMsg("")}>
            <Text className="text-sm text-red-600 underline mt-2">Cerrar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <View className="mb-4">
          <Text className="text-gray-700 mb-1">ID del Conductor</Text>
          <TextInput
            value={form.id_conductor}
            editable={false}
            className="border border-gray-300 rounded-md px-4 py-2 bg-gray-100 text-gray-500"
          />
        </View>

        {Object.keys(form).map((key) => {
          if (
            key === "id_conductor" ||
            key === "estado" ||
            key === "fecha_adquisicion"
          )
            return null;

          const label = etiquetasCampos[key] || key;
          const isRequired = camposRequeridos.includes(key);
          const hasError = errorMsg && isRequired && form[key].trim() === "";

          return (
            <View key={key} className="mb-4">
              <Text className="text-gray-700 mb-1">
                {label}{" "}
                {isRequired && (
                  <Text className="text-red-500 font-bold">*</Text>
                )}
              </Text>
              <TextInput
                value={form[key]}
                onChangeText={(value) => handleChange(key, value)}
                className={`border rounded-md px-4 py-2 w-full ${
                  hasError ? "border-red-500" : "border-gray-300"
                }`}
                keyboardType={
                  key === "ano" || key === "numero_economico"
                    ? "numeric"
                    : "default"
                }
              />
            </View>
          );
        })}

        {/* Fecha de Adquisición */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-1">Fecha de Adquisición</Text>
          <input
            type="datetime-local"
            value={form.fecha_adquisicion}
            onChange={(e) => handleChange("fecha_adquisicion", e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 w-full"
          />
        </View>

        {/* Estado */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-1">Estado</Text>
          <View className="border border-gray-300 rounded-md overflow-hidden">
            <Picker
              selectedValue={form.estado}
              onValueChange={(value) => handleChange("estado", value)}
            >
              <Picker.Item label="Activo" value="Activo" />
              <Picker.Item label="Desactivado" value="Desactivado" />
            </Picker>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className={`mt-6 py-3 rounded-lg w-full max-w-4xl ${
          guardando ? "bg-gray-400" : "bg-yellow-500"
        }`}
        disabled={guardando}
        onPress={handleSubmit}
      >
        <Text className="text-white text-center font-semibold text-base">
          {guardando ? "Guardando..." : "Guardar Vehículo"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
