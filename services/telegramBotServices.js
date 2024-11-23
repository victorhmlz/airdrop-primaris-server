import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User'; 

dotenv.config();

const app = express();
app.use(express.json()); 

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conexión a la base de datos exitosa'))
  .catch((err) => console.error('Error conectando a la base de datos:', err));

app.post('/api/link-telegram', async (req, res) => {
  const { telegramUserId, usernameInApp } = req.body;

  try {
    const user = await User.findOne({ username: usernameInApp });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.telegramUserId = telegramUserId;
    await user.save();

    res.json({ message: 'telegramUserId actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar telegramUserId:', error);
    res.status(500).json({ message: 'Error al actualizar telegramUserId' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor ejecutándose en el puerto ${PORT}`));
