// Importar módulos necesarios
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User'; // Ajusta la ruta al modelo de usuario

dotenv.config();

const app = express();
app.use(express.json()); // Para recibir solicitudes JSON

// Conectar a la base de datos MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conexión a la base de datos exitosa'))
  .catch((err) => console.error('Error conectando a la base de datos:', err));

// Ruta para recibir el telegramUserId y actualizar el usuario en la base de datos
app.post('/api/link-telegram', async (req, res) => {
  const { telegramUserId, usernameInApp } = req.body;

  try {
    // Buscar el usuario por su username
    const user = await User.findOne({ username: usernameInApp });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar el campo telegramUserId
    user.telegramUserId = telegramUserId;
    await user.save();

    res.json({ message: 'telegramUserId actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar telegramUserId:', error);
    res.status(500).json({ message: 'Error al actualizar telegramUserId' });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor ejecutándose en el puerto ${PORT}`));
