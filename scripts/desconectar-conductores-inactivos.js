const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../firebase-admin-key.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
  });
}

const db = admin.firestore();

const HORAS_INACTIVIDAD = 4;
const MILISEGUNDOS_INACTIVIDAD = HORAS_INACTIVIDAD * 60 * 60 * 1000;

async function desconectarConductoresInactivos() {
  console.log(`[${new Date().toISOString()}] Iniciando revisión de conductores inactivos...`);

  try {
    const snapshot = await db
      .collection('users')
      .where('role', '==', 'conductor')
      .where('disponible', '==', true)
      .get();

    console.log(`Conductores disponibles encontrados: ${snapshot.size}`);

    const ahora = Date.now();
    let desconectados = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const id = doc.id;
      const nombre = data.displayName || data.email || id;
      const estado = data.estado || '';
      const viajeActivoId = data.viaje_activo_id;
      const ultimaActividad = data.ultima_actividad;

      const esLibre = !viajeActivoId || String(viajeActivoId).trim() === '';

      if (!esLibre) {
        continue;
      }

      let tiempoInactivo = 0;
      if (ultimaActividad && ultimaActividad.toDate) {
        const ts = ultimaActividad.toDate().getTime();
        tiempoInactivo = ahora - ts;
      } else if (ultimaActividad && ultimaActividad._seconds) {
        const ts = ultimaActividad._seconds * 1000;
        tiempoInactivo = ahora - ts;
      } else {
        console.log(`  [${nombre}] Sin ultima_actividad; omitiendo.`);
        continue;
      }

      const horasInactivo = tiempoInactivo / (60 * 60 * 1000);

      if (tiempoInactivo >= MILISEGUNDOS_INACTIVIDAD) {
        console.log(
          `  [${nombre}] Libre hace ${horasInactivo.toFixed(1)}h → desconectando (estado: offline, disponible: false)`
        );
        await db.collection('users').doc(id).update({
          estado: 'offline',
          disponible: false,
        });
        desconectados++;
      } else {
        console.log(
          `  [${nombre}] Libre hace ${horasInactivo.toFixed(1)}h → aún dentro del límite.`
        );
      }
    }

    console.log(`Desconectados: ${desconectados} de ${snapshot.size} conductores disponibles.`);
    console.log('Revisión completada.\n');
  } catch (error) {
    console.error('Error al desconectar conductores:', error);
  }
}

desconectarConductoresInactivos()
  .then(() => {
    console.log('Script finalizado.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error fatal:', err);
    process.exit(1);
  });
