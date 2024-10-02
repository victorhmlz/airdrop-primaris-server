import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  telegramUserName: { type: String, required: true, unique: true, minlength: 3, maxlength: 100 },
  password: { type: String, required: true, minlength: 6 }, 
  referralTicket: { type: String, length: 10 }, 
  ownedReferralTicket: { type: String, required: true, unique: true, length: 10 }, 
  heriticsConverted: { type: Number, default: 0 }, 
  telegramUserId: { type: String, default: null }, 
  discordId: { type: String, default: null }, 
  followTelegram: { type: Boolean, default: false },
  joinTelegramGroup: { type: Boolean, default: false },
  joinDiscordChannel: { type: Boolean, default: false },
  airdropClaimed: { type: Number, default: 0 }, 
  questsCompleted: { type: Boolean, default: false },
  referredPoint: { type: Boolean, default: false}
}, { timestamps: true }); 

export default mongoose.model('User', userSchema);

