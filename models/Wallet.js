import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  telegramUserName: { type: String, required: true, unique: true, minlength: 3, maxlength: 100 },
  publicKey: { type: String, required: true, unique: true }, 
  privateKey: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 } 
}, { timestamps: true }); 

export default mongoose.model('Wallet', walletSchema);
