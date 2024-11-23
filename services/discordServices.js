import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_API_URL = 'https://discord.com/api';
const guildId = process.env.GUILD_ID;

export const isUserInDiscordChannel = async (userDiscordId) => {
  try {
    const response = await axios.get(
      `${DISCORD_API_URL}/guilds/${guildId}/members/${userDiscordId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );
    if (response.data) {
      return true; 
    }
    return false;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    console.error('Error verificando usuario en Discord:', error);
    throw new Error('Error verificando usuario en Discord');
  }
};
