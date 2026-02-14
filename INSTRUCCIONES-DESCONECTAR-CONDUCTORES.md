# Desconectar conductores inactivos (tarea programada local)

Este script desconecta automáticamente a conductores que llevan **más de 4 horas** en estado **Libre** (sin viaje activo).

---

## 1. Requisitos previos

### A. Firebase Admin SDK

Necesitas una **clave de servicio** (service account key) de Firebase:

1. Ve a [Firebase Console](https://console.firebase.google.com) → tu proyecto.
2. **Configuración del proyecto** (⚙️) → **Cuentas de servicio**.
3. Clic en **Generar nueva clave privada** → descarga el archivo JSON.
4. Guárdalo como `firebase-admin-key.json` en la carpeta raíz del proyecto (`webmap/`).
5. **NO lo subas a Git** (ya está en `.gitignore` si añades `firebase-admin-key.json`).

### B. Instalar firebase-admin

En la carpeta del proyecto:

```bash
npm install firebase-admin
```

---

## 2. Campo `ultima_actividad` en Firestore

El script usa el campo **`ultima_actividad`** (timestamp) en cada documento de conductor (`users` con `role === 'conductor'`).

**¿Cuándo se actualiza?**
- Al actualizar la ubicación del conductor (cuando envía su posición).
- Al cambiar a estado "Libre" (cuando termina un viaje).
- Al hacer login o activarse.

**Implementación sugerida:**
En tu código de cliente (donde actualizas la ubicación del conductor), añade:

```typescript
import { serverTimestamp } from 'firebase/firestore';

await updateDoc(doc(db, 'users', conductorId), {
  ubicacion: { latitude, longitude },
  ultima_actividad: serverTimestamp(),
});
```

O en el hook `useLocationSync` (si lo usas para actualizar ubicación):

```typescript
await setDoc(doc(db, 'users', userId), {
  ubicacion: { latitude, longitude },
  ultima_actividad: serverTimestamp(),
}, { merge: true });
```

---

## 3. Ejecutar el script manualmente

Desde la carpeta del proyecto:

```bash
node scripts/desconectar-conductores-inactivos.js
```

El script:
- Lee conductores con `disponible === true` y sin `viaje_activo_id` (Libres).
- Compara `ultima_actividad` con el tiempo actual.
- Si `>= 4 horas`, actualiza: `estado: 'offline'`, `disponible: false`.

---

## 4. Programar ejecución automática (1 AM y 1 PM)

### En Windows (Programador de tareas)

1. Abre **Programador de tareas** (Task Scheduler).
2. **Crear tarea básica**:
   - **Nombre:** Desconectar conductores inactivos
   - **Desencadenador:** Diariamente, a las **1:00 AM**.
   - **Acción:** Iniciar un programa.
     - **Programa:** `node`
     - **Argumentos:** `"C:\Users\amate\Desktop\All_proyects\proyecto_RT5E\CODE\webmap\webmap\scripts\desconectar-conductores-inactivos.js"`
     - **Iniciar en:** `C:\Users\amate\Desktop\All_proyects\proyecto_RT5E\CODE\webmap\webmap`
3. Repite para crear otra tarea a las **1:00 PM**.

### En Linux/Mac (cron)

Edita el crontab:

```bash
crontab -e
```

Añade:

```cron
0 1,13 * * * cd /ruta/al/proyecto/webmap && node scripts/desconectar-conductores-inactivos.js >> logs/desconectar.log 2>&1
```

Esto ejecuta el script a las 1 AM y 1 PM todos los días.

---

## 5. Logs

El script imprime en consola:
- Conductores revisados.
- Cuántos fueron desconectados.
- Tiempo de inactividad de cada uno.

Puedes redirigir la salida a un archivo de log:

```bash
node scripts/desconectar-conductores-inactivos.js >> logs/desconectar.log 2>&1
```

---

## 6. Notas

- **Seguridad:** `firebase-admin-key.json` tiene permisos completos; manténlo seguro.
- **Alternativa:** Si prefieres no dejar la máquina encendida 24/7, considera usar **Firebase Cloud Functions** con `functions.pubsub.schedule()` (se ejecuta en la nube sin necesidad de servidor local).
- **Ajustes:** Cambia `HORAS_INACTIVIDAD` en el script si quieres otro umbral (actualmente 4h).
