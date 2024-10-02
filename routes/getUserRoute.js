import express from 'express';
import { getUserController} from '../controllers/getUserController.js';

const getUserRoute = express.Router();

getUserRoute.get('/getUser/:telegramUserName', async (req, res) => {
  try {
    const telegramUserName = req.params.telegramUserName;

    const userData = await getUserController(telegramUserName);

    if (userData.error) {
      return res.status(404).json({ message: userData.error });
    }

    return res.status(200).json(userData);

  } catch (error) {
    console.error(`[getUserRoute] Error al obtener los datos del usuario: ${error.message}`);
    return res.status(500).json({ message: 'Error al obtener los datos del usuario', error: error.message });
  }
});

export default getUserRoute;
