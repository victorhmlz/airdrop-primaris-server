import { Client, GatewayIntentBits } from 'discord.js'; 
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js'; 

dotenv.config({ path: '../.env' });

// Conectar a la base de datos MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conexión a la base de datos exitosa'))
.catch((err) => console.error('Error conectando a la base de datos:', err));

// INIT ***************************
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const allowedChannelId = '1287714921903034441';

bot.on('ready', () => {
  console.log(`Bot connected as ${bot.user.tag}`);
});

bot.on('messageCreate', async (message) => {
  console.log(`Mensaje recibido: ${message.content} en canal: ${message.channel.id}`);

  if (message.channel.id !== allowedChannelId) {
    console.log(`Mensaje ignorado, no está en el canal permitido (${allowedChannelId})`);
    return;
  }

  const [command, ...rest] = message.content.split(' ');
  const telegramUserName = rest.join(' ').trim();

  console.log(`Command: ${command}, Telegram Username: ${telegramUserName}`);

  if (command === '/validate') {
    if (!telegramUserName) {
      return message.reply('Please include your Telegram username to validate. Example: /validate yourTelegramUsername');
    }

    const discordUserId = message.author.id;
    console.log(`Buscando usuario con Telegram username: ${telegramUserName} en la base de datos...`);
    console.warn('DISCORD USER ID = ' + discordUserId);

    try {
      const user = await User.findOne({ telegramUserName });
      if (!user) {
        console.log(`User with Telegram username: ${telegramUserName} not found`);
        return message.reply('User not found in the database.');
      }

      console.log(`User found, updating discordUserId: ${discordUserId}`);
      user.discordId = discordUserId;
      await user.save();
      message.reply('Your Discord account has been successfully validated.');
    } catch (error) {
      console.error('Error al actualizar el discordUserId en la base de datos:', error);
      message.reply('There was an error validating your account. Please try again.');
    }
  }
});

// LOGIN BOT
bot.login(process.env.DISCORD_BOT_TOKEN);

