import Wallet from '../models/Wallet.js';
import bcrypt from 'bcryptjs';

export const GetKey = async (req, res) => {
  const { telegramUserName, password } = req.body;

  try {
 
    const userWallet = await Wallet.findOne({ telegramUserName });
    if (!userWallet) {
      return res.status(404).json({ message: 'User not registered, please try again.' });
    }

    const isMatch = await bcrypt.compare(password, userWallet.password ); 
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong Password, try again.' });
    }

    const encryptedKey = userWallet.privateKey;

    return res.status(200).json({ success: true, encryptedKey });

  } catch (err) {
    console.error(err);

    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
};
