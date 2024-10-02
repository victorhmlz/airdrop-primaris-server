import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function generateRandomString(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Función para generar un referal ticket único
const generateUniqueReferralTicket = async () => {
  let unique = false;
  let referralTicket = '';
  
  // Repite hasta encontrar un ticket único
  while (!unique) {
    referralTicket = generateRandomString(10); 
    const existingUser = await User.findOne({ ownedReferralTicket: referralTicket });
    if (!existingUser) {
      unique = true;
    }
  }
  return referralTicket;
};

// Controlador para el registro de usuario
export const registerUser = async (req, res) => {
  const {
    telegramUserName,
    password,
    referralTicket,
  } = req.body;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ $or: [{ telegramUserName: telegramUserName }] });
    
    if (existingUser) {
        return res.status(400).json({ message: 'The user already exists.' });
    }

    // Verifica que se haya proporcionado un código de referido
    if (!referralTicket) {
      return res.status(400).json({ message: 'You must provide a referral code.' });
    }

    const referredByUser = await User.findOne({ ownedReferralTicket: referralTicket });
    if (!referredByUser) {
      return res.status(400).json({ message: 'Invalid referral code.' });
    }

    if (referredByUser.heriticsConverted >= 10) {
      return res.status(400).json({ message: 'This referral code has already reached its limit of 10 converted heretics.' });
    } 

    const ownedReferralTicket = await generateUniqueReferralTicket();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); 

    // Crear un nuevo usuario
    const newUser = new User({
      telegramUserName,
      password: hashedPassword,
      referralTicket,
      ownedReferralTicket
    });

    await newUser.save();

    // Generar token JWT
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ success: true, token, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

