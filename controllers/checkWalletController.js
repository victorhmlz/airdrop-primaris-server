import Wallet from '../models/Wallet.js';

// Verificar si ya existen claves para el usuario
export const CheckWallet = async (req, res) => {
    try {
        const { telegramUserName } = req.body;

        // Verificar si las claves ya existen para este usuario
        const existingKey = await Wallet.findOne({ telegramUserName });

        if (existingKey) {
        return res.status(200).json({ publicKey: existingKey.publicKey });
        } else {
        console.error('No hay wallet para este usuario', error);
        return res.status(200).json({ publicKey: null });
        }
  } catch (error) {
    console.error('Error al verificar la wallet:', error);
    res.status(500).json({ error: 'Error al verificar la wallet' });
  }
};
