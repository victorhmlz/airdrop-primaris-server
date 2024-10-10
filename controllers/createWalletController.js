import { ethers } from 'ethers';
import { encryptPrivateKey } from '../services/encryptingServices.js'
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';

// Ruta para generar y almacenar las claves
export const CreateWallet = async (req, res) => {
  try {
    const { telegramUserName } = req.body;

    // Verificar si las claves ya existen para este usuario
    const existingKey = await Wallet.findOne({ telegramUserName });
    if (existingKey) {
      return res.status(400).json({ error: 'This username already has wallet' });
    }

    const currentUser = await User.findOne({ telegramUserName });

    // Generar la clave privada y pública usando ethers.js
    const wallet = ethers.Wallet.createRandom();
    const privateKey = wallet.privateKey;
    const publicKey = wallet.address;
    const password = currentUser.password;

    const encryptedPrivateKey = await encryptPrivateKey(privateKey);

    // Guardar las claves en la base de datos
    const newKey = new Wallet({
      telegramUserName,
      publicKey,
      privateKey: encryptedPrivateKey, 
      password
    });

    await newKey.save();

    res.status(201).json({ message: 'Claves generadas y almacenadas con éxito', publicKey });
  } catch (error) {
    console.error('Error al generar las claves:', error);
    res.status(500).json({ error: 'Error al generar las claves' });
  }
};
