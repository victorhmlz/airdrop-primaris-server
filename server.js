import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import questRoutes from './routes/questRoutes.js';
import getUserRoute from './routes/getUserRoute.js';

dotenv.config(); // Cargar variables de entorno desde el archivo .env

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB (sin las opciones deprecadas)
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("Error: la URI de MongoDB no está definida en el archivo .env");
  process.exit(1); // Termina el proceso si no hay URI
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB conectado'))
  .catch((err) => console.error('Error conectando a MongoDB:', err));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/getUser', getUserRoute);

// Servir en el puerto
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
