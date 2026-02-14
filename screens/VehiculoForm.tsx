// components/VehiculoForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Picker } from "@react-native-picker/picker";

const etiquetasCampos: Record<string, string> = {
  marca: "Marca",
  modelo: "Modelo",
  ano: "Año",
  color: "Color",
  placas: "Placa",
  numero_economico: "Número Económico",
  movil: "No. de Móvil",
};

type FormType = {
  id?: string;
  marca: string;
  modelo: string;
  ano: string;
  color: string;
  placas: string;
  estado: string;
  fecha_adquisicion: string;
  numero_economico: string; // STRING para mantener ceros a la izquierda
  movil: string;            // STRING por consistencia
};

interface Props {
  initialData?: Partial<FormType>;
  onSuccess?: () => void;
}

export default function VehiculoForm({ initialData = {}, onSuccess }: Props) {
  const [form, setForm] = useState<FormType>({
    marca: (initialData.marca ?? "").toString(),
    modelo: (initialData.modelo ?? "").toString(),
    ano: (initialData.ano ?? "").toString(),
    color: (initialData.color ?? "").toString(),
    placas: (initialData.placas ?? "").toString(),
    // Alinear con values del Picker
    estado: (initialData.estado ?? "activo").toString().toLowerCase(),
    fecha_adquisicion: (initialData.fecha_adquisicion ?? "").toString(),
    numero_economico: (initialData?.numero_economico ?? "").toString(),
    movil: (initialData.movil ?? "").toString(),
    id: initialData.id || undefined,
  });

  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (key: keyof FormType, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Mantiene solo dígitos, sin castear a número (preserva ceros a la izquierda)
  const handleChangeNumeric = (key: keyof FormType, value: string) => {
    const soloDigitos = value.replace(/\D+/g, "");
    setForm((prev) => ({ ...prev, [key]: soloDigitos }));
  };

  // Campos obligatorios (modelo NO requerido)
  const camposRequeridos: (keyof FormType)[] = [
    "marca",
    "ano",
    "color",
    "placas",
    "movil",
  ];

  const generarIdVehiculo = async () => {
    const vehiculoRef = collection(db, "Vehiculo");
    const q = query(vehiculoRef, orderBy("id_vehiculo", "desc"), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return "VH-00001";

    const ultimo = snapshot.docs[0].data().id_vehiculo as string;
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
        .map((c) => `- ${etiquetasCampos[c as string] || c}`)
        .join("\n")}`;
      setErrorMsg(mensaje);
      return;
    }

    // Validaciones
    if (form.ano && !/^\d{4}$/.test(form.ano)) {
      setErrorMsg("El campo Año debe tener 4 dígitos (p.ej. 2024).");
      return;
    }
    if (form.numero_economico && !/^\d+$/.test(form.numero_economico)) {
      setErrorMsg("El campo Número Económico solo debe contener dígitos.");
      return;
    }
    if (form.movil && !/^\d+$/.test(form.movil)) {
      setErrorMsg("El campo No. de Móvil solo debe contener dígitos.");
      return;
    }

    setGuardando(true);
    try {
      // Mantener strings para conservar ceros a la izquierda
      const data = {
        marca: form.marca,
        modelo: form.modelo,
        ano: form.ano?.trim() || "", // STRING para evitar inconsistencias
        color: form.color,
        placas: form.placas,
        estado: (form.estado || "").toLowerCase(),
        fecha_adquisicion: form.fecha_adquisicion || null,
        numero_economico: form.numero_economico?.trim() || "",
        movil: form.movil?.trim() || "",
      };

      if (form.id) {
        const docRef = doc(db, "Vehiculo", form.id);
        await updateDoc(docRef, data as any);
        Alert.alert("✅ Vehículo actualizado");
      } else {
        const id_vehiculo = await generarIdVehiculo();
        await addDoc(collection(db, "Vehiculo"), {
          ...data,
          id_vehiculo,
          fecha_creacion: Timestamp.now(),
          fecha_eliminacion: null,
        });
        Alert.alert("✅ Vehículo agregado", `ID: ${id_vehiculo}`);
      }

      onSuccess?.();
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
        {form.id ? "Editar Vehículo" : "Agregar Vehículo"}
      </Text>

      {errorMsg !== "" && (
        <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 max-w-2xl w-full">
          <Text className="text-red-800 whitespace-pre-line">{errorMsg}</Text>
          <TouchableOpacity onPress={() => setErrorMsg("")}>
            <Text className="text-sm text-red-600 underline mt-2">Cerrar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="w-full" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', maxWidth: '100%' }}>
        {(Object.keys(form) as (keyof FormType)[]).map((key) => {
          if (key === "id" || key === "estado" || key === "fecha_adquisicion")
            return null;

          const label = etiquetasCampos[key as string] || (key as string);
          const isRequired = camposRequeridos.includes(key);
          const hasError =
            !!errorMsg && isRequired && String(form[key] ?? "").trim() === "";

          const isNumericField =
            key === "ano" || key === "numero_economico" || key === "movil";

          return (
            <View key={key as string} className="mb-4">
              <Text className="text-gray-700 mb-1">
                {label}{" "}
                {isRequired && <Text className="text-red-500 font-bold">*</Text>}
              </Text>
              <TextInput
                value={String(form[key] ?? "")}
                onChangeText={(value) =>
                  isNumericField
                    ? handleChangeNumeric(key, value)
                    : handleChange(key, value)
                }
                className={`border rounded-md px-4 py-2 w-full ${
                  hasError ? "border-red-500" : "border-gray-300"
                }`}
                keyboardType={isNumericField ? "numeric" : "default"}
                inputMode={isNumericField ? "numeric" : "text"}
                autoComplete="off"
                enterKeyHint="done"
              />
            </View>
          );
        })}

        <View className="mb-4">
          <Text className="text-gray-700 mb-1">Fecha de Adquisición</Text>
          {/* En web podemos usar input nativo */}
          <input
            type="datetime-local"
            value={form.fecha_adquisicion}
            onChange={(e) => handleChange("fecha_adquisicion", e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 w-full"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 mb-1">Estado</Text>
          <View className="border border-gray-300 rounded-md overflow-hidden">
            <Picker
              selectedValue={form.estado}
              onValueChange={(value) => handleChange("estado", String(value))}
            >
              <Picker.Item label="Activo" value="activo" />
              <Picker.Item label="Deshabilitado" value="deshabilitado" />
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