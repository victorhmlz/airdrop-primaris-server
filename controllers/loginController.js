import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkQuest } from './questController.js';

export const loginUser = async (req, res) => {
  const { telegramUserName, password } = req.body;

  try {
 
    const user = await User.findOne({ telegramUserName });
    if (!user) {
      return res.status(404).json({ message: 'User not registered, please try again.' });
    }

    const isMatch = await bcrypt.compare(password, user.password); 
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong Password, try again.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    const questStatus = await checkQuest(telegramUserName);

    return res.status(200).json({ success: true, token, telegramUserName, questStatus });

  } catch (err) {
    console.error(err);

    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
};
