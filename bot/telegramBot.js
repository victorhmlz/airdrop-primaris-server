import { Telegraf } from 'telegraf';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js'; 

dotenv.config({path: '../.env'});
console.log("Mongo URI:", process.env.MONGO_URI);
console.log("Bot Token:", process.env.TELEGRAM_BOT_TOKEN);

// CONNECT TO MONGO DATABASE *****************

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Database connection successful'))
  .catch((err) => console.error('Error connecting to the database:', err));

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.command('validate', async (ctx) => {
  console.log('Command /validate getted');
  const userId = ctx.from.id;  
  const username = ctx.from.username;  

  if (!username) {
    return ctx.reply('It looks like you dont have a username on Telegram. Set one before continuing.');
  }

  try {

    const user = await User.findOne({ telegramUserName: username });

    if (!user) {
      return ctx.reply('User not found in the database.');
    }

    user.telegramUserId = userId;
    await user.save();

    ctx.reply('Your Telegram account has been successfully validated.');
  } catch (error) {
    console.error('Error validating Telegram:', error);
    ctx.reply('There was an error validating your account. Please try again. ' + username + " 2" );
  }
});

// INIT BOT
bot.launch();
console.log('Telegram Omnilex bot is running...');


