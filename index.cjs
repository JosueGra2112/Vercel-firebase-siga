const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Cargar las credenciales de Firebase desde el archivo JSON
const serviceAccountPath = path.join(__dirname, 'push-siga-firebase-adminsdk-a7qpm-9ab36ce016.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('El archivo de configuración de Firebase no se encontró en:', serviceAccountPath);
  process.exit(1);
}
const serviceAccount = require(serviceAccountPath);

console.log('Archivo de configuración de Firebase cargado correctamente.');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
console.log('Firebase Admin SDK inicializado correctamente.');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las solicitudes
app.use(cors());
app.use(express.json());

// Ruta para recibir y enviar notificaciones
app.post('/', async (req, res) => {
  const { tokenUser, title, body, url } = req.body;

  if (!tokenUser || !title || !body) {
    console.error('Datos de notificación incompletos', { tokenUser, title, body });
    return res.status(400).json({ success: false, message: 'Datos de notificación incompletos' });
  }

  const message = {
    notification: {
      title,
      body,
    },
    data: {
      url: String(url) || 'https://sigapwa.host8b.me/', // Aseguramos que url sea cadena
    },
    token: tokenUser,
  };

  console.log("Datos de la solicitud:", { tokenUser, title, body, url });

  try {
    const response = await admin.messaging().send(message);
    console.log('Notificación enviada con éxito:', response);
    res.status(200).json({ success: true, message: 'Notificación enviada con éxito', response });
  } catch (error) {
    console.error('Error al enviar el mensaje:', error.message);
    res.status(500).json({ success: false, message: 'Error al enviar el mensaje', error: error.message });
  }
});

// Iniciar el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});

module.exports = app;
